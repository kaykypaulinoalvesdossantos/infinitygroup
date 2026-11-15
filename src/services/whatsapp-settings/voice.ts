import { apiRequest } from '@/services/api';
import type { VoiceCapacity, VoicePairing } from './types';

/** Chamadas de voz do canal. Contrato: wa-v2/CONTRACT.md (seção Voz). */

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
