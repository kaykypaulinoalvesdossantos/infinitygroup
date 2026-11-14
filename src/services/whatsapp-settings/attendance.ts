import { apiRequest } from '@/services/api';
import type {
  WaAgentStatus,
  WaAgentStatusType,
  WaAutoMessage,
  WaBusinessHour,
  WaChannelGroup,
  WaDistributionMethod,
  WaQueue,
  WaRoutingCondition,
  WaRoutingRule,
  WaScopeRef,
  WaStage,
  WaUser,
} from './types';

/** Atendimento (contrato: wa-v2/CONTRACT.md, secao "Atendimento"). Prefixo: /crm-leads/whatsapp/attendance */

const BASE = '/crm-leads/whatsapp/attendance';

function request<T>(path: string, method: string = 'GET', body?: unknown): Promise<T> {
  return apiRequest(`${BASE}${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as Promise<T>;
}

/** Query string com o escopo (scope, channelId, channelGroupId). */
export function scopeQuery(ref: Partial<WaScopeRef>): string {
  const params = new URLSearchParams();
  if (ref.scope) params.set('scope', ref.scope);
  if (ref.channelId != null) params.set('channelId', String(ref.channelId));
  if (ref.channelGroupId != null) params.set('channelGroupId', String(ref.channelGroupId));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Campos de escopo normalizados para body JSON. */
function scopeBody(ref: WaScopeRef) {
  return {
    scope: ref.scope,
    channelId: ref.scope === 'CHANNEL' ? (ref.channelId ?? null) : null,
    channelGroupId: ref.scope === 'GROUP' ? (ref.channelGroupId ?? null) : null,
  };
}

export interface WaGroupInput {
  name?: string;
  description?: string | null;
  active?: boolean;
}

export interface WaQueueInput extends Partial<Omit<WaQueue, 'id' | 'agents' | 'scope' | 'channelId' | 'channelGroupId'>> {}

export interface WaQueueCreateInput extends WaScopeRef {
  name: string;
  description?: string | null;
  maxSimultaneous?: number;
  enforceLimit?: boolean;
  distributionMethod?: WaDistributionMethod;
  active?: boolean;
}

export interface WaRuleInput {
  name: string;
  priority: number;
  conditionType: WaRoutingCondition;
  conditionValue: string;
  queueId: number;
  returnToOriginalAgent: boolean;
  active: boolean;
}

export interface WaStageInput {
  name?: string;
  color?: string;
  isDefault?: boolean;
  isFinal?: boolean;
  finalType?: 'WON' | 'LOST' | null;
}

export const attendanceApi = {
  users: {
    list: () => request<WaUser[]>('/users'),
  },

  groups: {
    list: () => request<WaChannelGroup[]>('/groups'),
    create: (body: { name: string; description?: string | null }) =>
      request<WaChannelGroup>('/groups', 'POST', body),
    update: (id: number, body: WaGroupInput) =>
      request<WaChannelGroup>(`/groups/${id}`, 'PATCH', body),
    remove: (id: number) => request<{ message?: string } | null>(`/groups/${id}`, 'DELETE'),
    setMembers: (id: number, channelIds: number[]) =>
      request<WaChannelGroup>(`/groups/${id}/members`, 'PUT', { channelIds }),
  },

  queues: {
    list: () => request<WaQueue[]>('/queues'),
    create: (body: WaQueueCreateInput) =>
      request<WaQueue>('/queues', 'POST', { ...scopeBody(body), ...stripScope(body) }),
    update: (id: number, body: WaQueueInput) =>
      request<WaQueue>(`/queues/${id}`, 'PATCH', body),
    remove: (id: number) => request<{ message?: string } | null>(`/queues/${id}`, 'DELETE'),
    setAgents: (id: number, userIds: number[]) =>
      request<WaQueue>(`/queues/${id}/agents`, 'PUT', { userIds }),
  },

  rules: {
    list: () => request<WaRoutingRule[]>('/rules'),
    create: (body: WaRuleInput & WaScopeRef) =>
      request<WaRoutingRule>('/rules', 'POST', { ...stripScope(body), ...scopeBody(body) }),
    update: (id: number, body: Partial<WaRuleInput> & Partial<WaScopeRef>) =>
      request<WaRoutingRule>(`/rules/${id}`, 'PATCH', body),
    remove: (id: number) => request<{ message?: string } | null>(`/rules/${id}`, 'DELETE'),
  },

  hours: {
    get: (ref: WaScopeRef) => request<WaBusinessHour[]>(`/hours${scopeQuery(ref)}`),
    /** Substitui o conjunto de horários daquele escopo. */
    save: (ref: WaScopeRef, days: WaBusinessHour[]) =>
      request<WaBusinessHour[]>('/hours', 'PUT', { ...scopeBody(ref), days }),
  },

  messages: {
    get: (ref: WaScopeRef) => request<WaAutoMessage[]>(`/messages${scopeQuery(ref)}`),
    save: (ref: WaScopeRef, message: WaAutoMessage) =>
      request<WaAutoMessage>('/messages', 'PUT', { ...scopeBody(ref), ...message }),
  },

  stages: {
    list: () => request<WaStage[]>('/stages'),
    create: (body: { name: string; color?: string }) =>
      request<WaStage>('/stages', 'POST', body),
    update: (id: number, body: WaStageInput) =>
      request<WaStage>(`/stages/${id}`, 'PATCH', body),
    remove: (id: number) => request<{ message?: string } | null>(`/stages/${id}`, 'DELETE'),
    reorder: (ids: number[]) => request<WaStage[]>('/stages/order', 'PUT', { ids }),
  },

  agents: {
    list: () => request<WaAgentStatus[]>('/agents'),
  },

  myStatus: {
    get: () => request<WaAgentStatus>('/me/status'),
    set: (status: WaAgentStatusType, reason?: string | null) =>
      request<WaAgentStatus>('/me/status', 'PUT', { status, reason: reason ?? undefined }),
  },

  conversations: {
    claim: (id: number) => request<unknown>(`/conversations/${id}/claim`, 'POST'),
    transfer: (id: number, target: { queueId?: number; userId?: number }) =>
      request<unknown>(`/conversations/${id}/transfer`, 'POST', target),
    setStage: (id: number, stageId: number | null) =>
      request<unknown>(`/conversations/${id}/stage`, 'POST', { stageId }),
    close: (id: number) => request<unknown>(`/conversations/${id}/close`, 'POST'),
  },
};

/** Remove campos de escopo (ja normalizados por scopeBody) do restante do body. */
function stripScope<T extends Partial<WaScopeRef>>(body: T): Omit<T, 'scope' | 'channelId' | 'channelGroupId'> {
  const { scope: _scope, channelId: _channelId, channelGroupId: _channelGroupId, ...rest } = body;
  return rest;
}
