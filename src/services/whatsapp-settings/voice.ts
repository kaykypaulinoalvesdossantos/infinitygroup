import { apiRequest } from '@/services/api';
import type { VoiceCapacity, VoicePairing, VoiceReadinessReason } from './types';

/** Chamadas de voz do canal. Contrato: wa-v2/CONTRACT.md (seção Voz). */

export const voiceReadinessLabels: Record<VoiceReadinessReason, string> = {
  PAIRING_REQUIRED: 'Conecte a sessão de voz com o mesmo WhatsApp deste canal.',
  PAIRING_PENDING: 'A criação da sessão precisa ser confirmada. Recupere a sessão antes de gerar outro código.',
  SESSION_MISSING: 'A sessão de voz não foi encontrada. Gere um novo QR para este canal.',
  NUMBER_MISMATCH: 'A voz foi conectada com outro número. Ela precisa usar o mesmo número do canal de mensagens.',
  SESSION_OFFLINE: 'A sessão de voz está offline. Aguarde a reconexão e tente novamente.',
  PROVIDER_UNAVAILABLE: 'Não foi possível consultar o serviço de voz. Tente novamente em instantes.',
  VALIDATION_REQUIRED:
    'Voz conectada. Faça uma ligação de teste e confirme o áudio no navegador e no celular de destino antes de liberar o canal.',
  VOICE_DISABLED: 'As chamadas estão desativadas nas configurações deste canal.',
  CHANNEL_PAUSED: 'Este canal está pausado. Retome o canal antes de ligar.',
  READY: 'Voz pronta para realizar e receber chamadas neste canal.',
};

export interface VoicePairingActionResult {
  sessionCreated: boolean;
  paired: boolean;
  voiceEnabled: boolean;
}

export interface VoiceSettingsBody {
  voiceEnabled?: boolean;
  voiceCapacity?: number;
  voiceVerifiedCapacity?: number;
}

const voicePath = (channelId: number) => `/crm-leads/whatsapp/channels/${channelId}/voice`;

const send = <T,>(method: string, path: string, body?: unknown): Promise<T> =>
  apiRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }) as Promise<T>;

export const voiceApi = {
  pairing: (channelId: number) => send<VoicePairing>('GET', `${voicePath(channelId)}/pairing`),
  pair: (channelId: number) => send<VoicePairingActionResult>('POST', `${voicePath(channelId)}/pair`),
  reconcile: (channelId: number) => send<VoicePairingActionResult>('POST', `${voicePath(channelId)}/pairing/reconcile`),
  renew: (channelId: number) => send<VoicePairingActionResult>('POST', `${voicePath(channelId)}/pairing/renew`),
  capacity: (channelId: number) => send<VoiceCapacity>('GET', `${voicePath(channelId)}/capacity`),
  updateSettings: (channelId: number, body: VoiceSettingsBody) =>
    send<VoiceCapacity>('PUT', `${voicePath(channelId)}/settings`, body),
};
