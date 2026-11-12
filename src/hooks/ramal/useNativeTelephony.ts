'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  InfinityTelephony,
  UNAVAILABLE_STATUS,
  getNativeTelephonyStatus,
  isNativeTelephonyAvailable,
  type NativeDeviceMode,
  type NativeTelephonyStatus,
  type PluginListenerHandle,
} from '@/lib/native-telephony';
import { telephonyService, type DeviceMode } from '@/services/telephony';

const POLL_INTERVAL_MS = 3000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Mensagem amigavel para erros (API, plugin nativo ou genericos). */
export function getErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

export interface NativeTelephonyApi {
  status: NativeTelephonyStatus;
  /** true apenas dentro do app Android (plugin nativo disponivel) */
  available: boolean;
  refresh(): Promise<void>;
  connectThisPhone(mode: DeviceMode): Promise<void>;
  disconnectThisPhone(): Promise<void>;
  requestDefaultDialer(): Promise<void>;
  requestPermissions(): Promise<void>;
  selectSim(id: string): Promise<void>;
  setMode(mode: NativeDeviceMode): Promise<void>;
  openDefaultApps(): Promise<void>;
}

export function useNativeTelephony(): NativeTelephonyApi {
  const [status, setStatus] = useState<NativeTelephonyStatus>(UNAVAILABLE_STATUS);

  const refresh = useCallback(async () => {
    setStatus(await getNativeTelephonyStatus());
  }, []);

  // Polling a cada 3s enquanto a tela estiver visivel (somente no aparelho nativo)
  useEffect(() => {
    if (typeof window === 'undefined' || !isNativeTelephonyAvailable()) return;

    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      void refresh();
    };
    tick();
    const intervalId = window.setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', tick);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  // Eventos push do plugin nativo
  useEffect(() => {
    if (typeof window === 'undefined' || !isNativeTelephonyAvailable()) return;

    let disposed = false;
    let handle: PluginListenerHandle | null = null;

    InfinityTelephony.addListener('statusChange', (next) => {
      setStatus({ ...next, available: true });
    })
      .then((listener) => {
        if (disposed) {
          void listener.remove();
        } else {
          handle = listener;
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      void handle?.remove();
    };
  }, []);

  const connectThisPhone = useCallback(
    async (mode: DeviceMode) => {
      try {
        const current = await getNativeTelephonyStatus();
        if (!current.available) {
          throw new Error('Este recurso funciona apenas no app Android Infinity Ramal.');
        }
        const { token } = await telephonyService.registerDevice({
          platform: 'android',
          model: current.model || undefined,
          appVersion: current.appVersion || undefined,
          mode,
        });
        await InfinityTelephony.configure({ baseUrl: API_BASE_URL, deviceToken: token, mode });
        await refresh();
        toast.success('Celular conectado ao painel.');
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível conectar este celular.'));
      }
    },
    [refresh],
  );

  const disconnectThisPhone = useCallback(async () => {
    try {
      const device = await telephonyService.getMyDevice();
      if (device) await telephonyService.revokeDevice(device.id);
      if (isNativeTelephonyAvailable()) await InfinityTelephony.clear();
      await refresh();
      toast.success('Celular desconectado do painel.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível desconectar este celular.'));
    }
  }, [refresh]);

  const requestDefaultDialer = useCallback(async () => {
    try {
      const result = await InfinityTelephony.requestDefaultDialer();
      if (!result.granted) toast.info('Confirme o app como telefone padrão na tela do Android.');
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível abrir a escolha de telefone padrão.'));
    }
  }, [refresh]);

  const requestPermissions = useCallback(async () => {
    try {
      await InfinityTelephony.requestCallPermissions();
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível solicitar as permissões.'));
    }
  }, [refresh]);

  const selectSim = useCallback(
    async (id: string) => {
      try {
        await InfinityTelephony.selectSim({ id });
        await refresh();
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível selecionar o chip.'));
      }
    },
    [refresh],
  );

  const setMode = useCallback(
    async (mode: NativeDeviceMode) => {
      try {
        // O modo chega ao backend pelo proximo poll do celular (campo mode).
        await InfinityTelephony.setMode({ mode });
        await refresh();
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível trocar o modo.'));
      }
    },
    [refresh],
  );

  const openDefaultApps = useCallback(async () => {
    try {
      await InfinityTelephony.openDefaultAppsSettings();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível abrir as configurações do Android.'));
    }
  }, []);

  return {
    status,
    available: status.available,
    refresh,
    connectThisPhone,
    disconnectThisPhone,
    requestDefaultDialer,
    requestPermissions,
    selectSim,
    setMode,
    openDefaultApps,
  };
}
