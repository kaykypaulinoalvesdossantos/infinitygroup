import { apiRequest } from '@/services/api';
import type { EvolutionImportAvailability, WaChannel, WaConnectionState, WaQrResult } from './types';

/** Rotas de canais WhatsApp (ver wa-v2/CONTRACT.md, seção Canais). Prefixo: /crm-leads/whatsapp. */
const BASE = '/crm-leads/whatsapp/channels';

const json = (body: unknown) => JSON.stringify(body);

export interface ChannelActionResult {
  status: WaChannel['status'];
  message: string;
}

export interface MessageResult {
  message: string;
}

export interface RoutingPatch {
  exclusiveOwnerId?: number | null;
  defaultQueueId?: number | null;
}

export const channelsApi = {
  list: () => apiRequest(BASE) as Promise<WaChannel[]>,

  create: (body: { name: string }) =>
    apiRequest(BASE, { method: 'POST', body: json(body) }) as Promise<WaChannel>,

  rename: (id: number, body: { name: string }) =>
    apiRequest(`${BASE}/${id}`, { method: 'PATCH', body: json(body) }) as Promise<WaChannel>,

  /** Arquiva o canal. Responde 409 se houver conversa não CLOSED. */
  archive: (id: number) => apiRequest(`${BASE}/${id}`, { method: 'DELETE' }) as Promise<MessageResult>,

  evolutionAvailable: () => apiRequest(`${BASE}/evolution-available`) as Promise<EvolutionImportAvailability>,

  importExisting: (body: { instanceId: string; name?: string }) =>
    apiRequest(`${BASE}/import-existing`, { method: 'POST', body: json(body) }) as Promise<WaChannel>,

  connect: (id: number) =>
    apiRequest(`${BASE}/${id}/connect`, { method: 'POST' }) as Promise<ChannelActionResult>,

  qr: (id: number) =>
    apiRequest(`${BASE}/${id}/qr`, { cache: 'no-store' }) as Promise<WaQrResult>,

  state: (id: number) =>
    apiRequest(`${BASE}/${id}/state`, { cache: 'no-store' }) as Promise<WaConnectionState>,

  reconcile: (id: number) =>
    apiRequest(`${BASE}/${id}/reconcile`, { method: 'POST' }) as Promise<MessageResult>,

  disconnect: (id: number) =>
    apiRequest(`${BASE}/${id}/disconnect`, { method: 'POST' }) as Promise<MessageResult>,

  setDefault: (id: number) =>
    apiRequest(`${BASE}/${id}/default`, { method: 'POST' }) as Promise<WaChannel>,

  /** Envie somente os campos que mudam; campos omitidos não são alterados. */
  updateRouting: (id: number, body: RoutingPatch) =>
    apiRequest(`${BASE}/${id}/routing`, { method: 'PUT', body: json(body) }) as Promise<WaChannel>,
};
