'use client';

import { useEffect } from 'react';
import { InfinityTelephony, getNativeTelephonyStatus, isNativeTelephonyAvailable } from '@/lib/native-telephony';

/**
 * Religa o servico do ramal (foreground service nativo) quando a tela abre ou o app volta
 * ao primeiro plano, se o celular ja foi conectado ao CRM. O plugin nao se auto-inicia
 * para respeitar quando o vendedor desconecta. Usa focus/visibilitychange (sem dependencia
 * extra do Capacitor): o WebView dispara esses eventos ao retomar o app.
 */
export function TelephonyAutoStart() {
  useEffect(() => {
    if (!isNativeTelephonyAvailable()) return;
    let cancelled = false;
    let running = false;

    const ensureRunning = async () => {
      if (running) return;
      running = true;
      try {
        const status = await getNativeTelephonyStatus();
        if (cancelled || !status.available) return;
        if (status.configured && !status.serviceRunning) {
          await InfinityTelephony.startService();
        }
      } catch {
        // o painel mostra o erro e o passo a passo para reconectar
      } finally {
        running = false;
      }
    };

    const onVisibility = () => {
      if (!document.hidden) void ensureRunning();
    };

    void ensureRunning();
    window.addEventListener('focus', onVisibility);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onVisibility);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
