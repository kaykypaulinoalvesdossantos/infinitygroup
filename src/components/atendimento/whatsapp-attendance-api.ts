import { apiRequest } from '@/services/api';
import type { CrmWhatsAppInboxConversation } from '@/services/crm-leads';
import type { WaAgentStatus, WaAgentStatusType, WaQueue, WaStage } from '@/services/whatsapp-settings/types';

/** Chamadas usadas pela caixa de entrada do WhatsApp (atendimento). Contrato: wa-v2/CONTRACT.md. */

const BASE = '/crm-leads/whatsapp';
const ATTENDANCE = `${BASE}/attendance`;

const qs = (params?: object) => {
  const p = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const q = p.toString();
  return q ? `?${q}` : '';
};

const send = <T>(method: string, path: string, body?: unknown): Promise<T> =>
  apiRequest(path, {
    method,
    body: JSON.stringify(body ?? {}),
  }) as Promise<T>;

export interface InboxListParams {
  search?: string;
  channelId?: number;
  unreadOnly?: boolean;
  scope?: 'ALL' | 'MINE' | 'QUEUE';
  status?: 'OPEN' | 'WAITING' | 'CLOSED';
  /** Exclui conversas resolvidas (usado em "Todos abertos"). */
  excludeClosed?: boolean;
  queueId?: number;
  productInterest?: string;
  tagId?: number;
  page?: number;
  pageSize?: number;
}

export const whatsappAttendanceApi = {
  listConversations: (params: InboxListParams = {}) =>
    apiRequest(`${BASE}/conversations${qs(params)}`) as Promise<{
      items: CrmWhatsAppInboxConversation[];
      total: number;
    }>,

  listAgents: () => apiRequest(`${ATTENDANCE}/agents`) as Promise<WaAgentStatus[]>,
  listQueues: () => apiRequest(`${ATTENDANCE}/queues`) as Promise<WaQueue[]>,
  listStages: () => apiRequest(`${ATTENDANCE}/stages`) as Promise<WaStage[]>,

  getMyStatus: () => apiRequest(`${ATTENDANCE}/me/status`) as Promise<WaAgentStatus>,
  setMyStatus: (status: WaAgentStatusType) =>
    send<WaAgentStatus>('PUT', `${ATTENDANCE}/me/status`, { status }),

  claim: (conversationId: number) =>
    send<unknown>('POST', `${ATTENDANCE}/conversations/${conversationId}/claim`),
  transfer: (conversationId: number, target: { queueId: number } | { userId: number }) =>
    send<unknown>('POST', `${ATTENDANCE}/conversations/${conversationId}/transfer`, target),
  setStage: (conversationId: number, stageId: number | null) =>
    send<unknown>('POST', `${ATTENDANCE}/conversations/${conversationId}/stage`, { stageId }),
  close: (conversationId: number) =>
    send<unknown>('POST', `${ATTENDANCE}/conversations/${conversationId}/close`),
};
