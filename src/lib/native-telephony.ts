'use client';

/** Handle de listener do Capacitor (mesma forma do @capacitor/core, sem a dependencia). */
export interface PluginListenerHandle {
  remove: () => Promise<void>;
}

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  isPluginAvailable?: (name: string) => boolean;
  Plugins?: Record<string, unknown>;
};
const cap = (): CapacitorGlobal | undefined =>
  typeof window === 'undefined' ? undefined : (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;

/**
 * Ponte JS do plugin nativo Android `InfinityTelephony`
 * (ramal-app/android, pacote com.infinitygroups.ramal.telephony). O site e carregado dentro
 * do app Android "Infinity Ramal", que injeta window.Capacitor com o plugin.
 * O plugin faz a ligacao pelo chip do celular e conversa com o backend sozinho,
 * em um foreground service - funciona com a tela apagada e com o app em segundo plano.
 */

export type NativeDeviceMode = 'FULL' | 'LITE';

export interface NativeSimAccount {
  id: string;
  label: string;
}

export interface NativeTelephonyStatus {
  /** false no navegador / iOS */
  available: boolean;
  /** baseUrl + token salvos */
  configured: boolean;
  serviceRunning: boolean;
  /** ultimo poll ao backend com sucesso ha menos de 15s */
  connected: boolean;
  lastError: string | null;
  mode: NativeDeviceMode;
  isDefaultDialer: boolean;
  permissions: { callPhone: boolean; readPhoneState: boolean; notifications: boolean };
  simAccounts: NativeSimAccount[];
  selectedSimId: string | null;
  /** pronto para discar (permissoes + chip + modo FULL exige telefone padrao) */
  ready: boolean;
  /** sem ligacao em andamento no aparelho */
  idle: boolean;
  activeCall: { callId: string | null; phone: string; state: string } | null;
  model: string;
  appVersion: string;
}

export interface NativeCallStateEvent {
  callId: string | null;
  phase: 'dialing' | 'active' | 'holding' | 'disconnected' | 'error' | 'external';
  /** vazio para chamadas externas/pessoais (privacidade) */
  phone: string;
  reason?: string;
}

export interface InfinityTelephonyPlugin {
  getStatus(): Promise<NativeTelephonyStatus>;
  /** Salva URL da API e token do dispositivo e inicia o servico em primeiro plano. */
  configure(options: { baseUrl: string; deviceToken: string; mode: NativeDeviceMode }): Promise<NativeTelephonyStatus>;
  /** Para o servico e apaga o token. */
  clear(): Promise<void>;
  requestDefaultDialer(): Promise<{ granted: boolean }>;
  requestCallPermissions(): Promise<{ callPhone: boolean; readPhoneState: boolean; notifications: boolean }>;
  selectSim(options: { id: string }): Promise<NativeTelephonyStatus>;
  setMode(options: { mode: NativeDeviceMode }): Promise<NativeTelephonyStatus>;
  startService(): Promise<NativeTelephonyStatus>;
  stopService(): Promise<NativeTelephonyStatus>;
  openDefaultAppsSettings(): Promise<void>;
  /** Encerra a ligacao atual direto no aparelho (FULL). */
  hangup(): Promise<void>;
  addListener(event: 'statusChange', cb: (s: NativeTelephonyStatus) => void): Promise<PluginListenerHandle>;
  addListener(event: 'callState', cb: (e: NativeCallStateEvent) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

/** Proxy para window.Capacitor.Plugins.InfinityTelephony (so existe dentro do app Android). */
export const InfinityTelephony = new Proxy({} as InfinityTelephonyPlugin, {
  get(_t, prop: string) {
    const plugin = cap()?.Plugins?.InfinityTelephony as Record<string, unknown> | undefined;
    const fn = plugin?.[prop];
    if (typeof fn !== 'function') {
      return () => Promise.reject(new Error('Disponível apenas no app Infinity Ramal (Android).'));
    }
    // Sempre devolve Promise: no app, addListener do Capacitor pode retornar o handle direto
    // (sem .then), o que quebrava quem encadeava .then() - visto no teste no Android.
    return (...args: unknown[]) => {
      try {
        return Promise.resolve((fn as (...a: unknown[]) => unknown).apply(plugin, args));
      } catch (error) {
        return Promise.reject(error);
      }
    };
  },
});

export function isNativeTelephonyAvailable(): boolean {
  const c = cap();
  return !!c?.isNativePlatform?.() && c.getPlatform?.() === 'android' && !!c.Plugins?.InfinityTelephony;
}

export const UNAVAILABLE_STATUS: NativeTelephonyStatus = {
  available: false,
  configured: false,
  serviceRunning: false,
  connected: false,
  lastError: null,
  mode: 'FULL',
  isDefaultDialer: false,
  permissions: { callPhone: false, readPhoneState: false, notifications: false },
  simAccounts: [],
  selectedSimId: null,
  ready: false,
  idle: true,
  activeCall: null,
  model: '',
  appVersion: '',
};

export async function getNativeTelephonyStatus(): Promise<NativeTelephonyStatus> {
  if (!isNativeTelephonyAvailable()) return UNAVAILABLE_STATUS;
  try {
    return { ...(await InfinityTelephony.getStatus()), available: true };
  } catch {
    return UNAVAILABLE_STATUS;
  }
}
