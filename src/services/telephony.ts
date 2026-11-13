import { apiRequest } from './api';

/**
 * Telefonia - ramal no celular do vendedor (chip do proprio aparelho).
 * Contrato do backend: infinitygroups-backend/docs/ramal/SPEC.md
 */

export type DeviceMode = 'FULL' | 'LITE';
export type DialerSessionState = 'RUNNING' | 'PAUSED' | 'STOPPED' | 'DONE';
export type PhoneCallStatus =
  | 'REQUESTED'
  | 'CLAIMED'
  | 'DIALING'
  | 'ACTIVE'
  | 'HOLDING'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'FAILED'
  | 'CANCELLED'
  | 'ENDED_UNKNOWN';
export type Disposition =
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CALLBACK'
  | 'MEETING'
  | 'VOICEMAIL'
  | 'WRONG_NUMBER'
  | 'NO_ANSWER'
  | 'OTHER'
  | 'DO_NOT_CALL';

export const ACTIVE_CALL_STATUSES: PhoneCallStatus[] = ['REQUESTED', 'CLAIMED', 'DIALING', 'ACTIVE', 'HOLDING'];
export const isCallActive = (s?: PhoneCallStatus | null) => !!s && ACTIVE_CALL_STATUSES.includes(s);

export const CALL_STATUS_LABEL: Record<PhoneCallStatus, string> = {
  REQUESTED: 'Solicitada',
  CLAIMED: 'Enviada ao celular',
  DIALING: 'Chamando',
  ACTIVE: 'Em ligação',
  HOLDING: 'Em espera',
  COMPLETED: 'Atendida',
  NO_ANSWER: 'Não atendida',
  FAILED: 'Falha',
  CANCELLED: 'Cancelada',
  ENDED_UNKNOWN: 'Confirmar resultado',
};

/** Status do formulario pos-ligacao: os mesmos 13 status do discador do grupoinfinity. */
export const INTERACTION_STATUSES = [
  'Novo lead',
  'Não atendeu',
  'Primeiro contato',
  'Interessado',
  'Retornar depois',
  'Reunião agendada',
  'Proposta enviada',
  'Em negociação',
  'Cliente fechado',
  'Perdido',
  'Sem Interesse',
  'Já possui o produto',
  'Pediu E-mail',
] as const;
export type InteractionStatus = (typeof INTERACTION_STATUSES)[number];

export const DISPOSITION_OPTIONS: { value: Disposition; label: string; needsDate?: boolean }[] = [
  { value: 'INTERESTED', label: 'Interessado' },
  { value: 'MEETING', label: 'Reunião agendada', needsDate: true },
  { value: 'CALLBACK', label: 'Retornar depois', needsDate: true },
  { value: 'NOT_INTERESTED', label: 'Sem interesse' },
  { value: 'VOICEMAIL', label: 'Caixa postal' },
  { value: 'NO_ANSWER', label: 'Não atendeu' },
  { value: 'WRONG_NUMBER', label: 'Número errado' },
  { value: 'DO_NOT_CALL', label: 'Bloquear novas ligações' },
  { value: 'OTHER', label: 'Outro' },
];

export const SESSION_STATE_LABEL: Record<DialerSessionState, string> = {
  RUNNING: 'Em andamento',
  PAUSED: 'Pausada',
  STOPPED: 'Parada',
  DONE: 'Concluída',
};

export interface TelephonyDevice {
  id: number;
  userId: number;
  userName?: string | null;
  platform: string;
  model: string | null;
  appVersion: string | null;
  mode: DeviceMode;
  simLabel: string | null;
  ready: boolean;
  idle: boolean;
  connected: boolean;
  lastSeenAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface PhoneCall {
  id: string;
  userId: number;
  userName?: string | null;
  deviceId: number | null;
  sessionId: number | null;
  leadId: number | null;
  campaignLeadId: number | null;
  campaignId: number | null;
  leadName: string | null;
  phone: string;
  provider: string;
  direction: string;
  status: PhoneCallStatus;
  deviceMode: DeviceMode | null;
  hangupRequested: boolean;
  endReason: string | null;
  disposition: Disposition | null;
  dispositionNote: string | null;
  whatsappFallbackPaused?: boolean;
  createdAt: string;
  dialingAt: string | null;
  answeredAt: string | null;
  endedAt: string | null;
  durationSec: number | null;
  talkSec: number | null;
}

export interface PendingItem {
  itemId: number;
  leadId: number;
  name: string;
  phone: string;
  manual: boolean;
  position: number;
}

export interface DialerSession {
  id: number;
  state: DialerSessionState;
  message: string | null;
  campaign: { id: number; name: string } | null;
  intervalSec: number;
  total: number;
  completed: number;
  skipped: number;
  remaining: number;
  nextIn: number;
  pauseRemaining: number | null;
  pausedTotalSec: number;
  elapsedSec: number;
  startedAt: string;
  endedAt: string | null;
  device: TelephonyDevice | null;
  currentCall: PhoneCall | null;
  pending: PendingItem[];
}

export interface CampaignEligibility {
  statuses: string[];
  onlyNeverCalled: boolean;
  sources?: string[];
  tagIds?: number[];
}
export interface CallWindow {
  start: string;
  end: string;
  weekdays: number[];
}
export interface DialerCampaign {
  id: number;
  name: string;
  product: string;
  description: string | null;
  active: boolean;
  intervalSec: number;
  maxAttempts: number;
  retryAfterMin: number;
  eligibility: CampaignEligibility;
  callWindow: CallWindow | null;
  dailyLimitPerUser: number;
  createdAt: string;
  updatedAt: string;
}
export type CampaignInput = Omit<DialerCampaign, 'id' | 'createdAt' | 'updatedAt' | 'description'> & {
  description?: string | null;
};

export interface SupervisionAgent {
  userId: number;
  name: string;
  role: string;
  device: {
    id: number;
    connected: boolean;
    ready: boolean;
    idle: boolean;
    mode: DeviceMode;
    model: string | null;
    simLabel: string | null;
    lastSeenAt: string | null;
  } | null;
  session: {
    id: number;
    state: DialerSessionState;
    total: number;
    completed: number;
    skipped: number;
    remaining: number;
    message: string | null;
    campaignName: string | null;
  } | null;
  currentCall: { id: string; status: PhoneCallStatus; leadId: number | null; leadName: string | null; since: string } | null;
  today: { calls: number; answered: number; talkSec: number };
}
export interface Supervision {
  agents: SupervisionAgent[];
  totals: {
    agents: number;
    devicesOnline: number;
    inCall: number;
    sessionsRunning: number;
    sessionsPaused: number;
    callsToday: number;
    answeredToday: number;
    talkSecToday: number;
  };
}

export interface TelephonyKpis {
  calls: number;
  answered: number;
  noAnswer: number;
  failed: number;
  unknown: number;
  answerRate: number;
  talkSec: number;
  avgTalkSec: number;
  byDisposition: Record<string, number>;
  byUser: { userId: number; name: string; calls: number; answered: number; talkSec: number }[];
  byHour: { hour: number; calls: number; answered: number }[];
}

export interface MyQueue {
  session: DialerSession | null;
  device: TelephonyDevice | null;
  callbacks: { leadId: number; campaignId: number | null; campaignLeadId: number | null; campaignName: string | null; name: string; phone: string | null; nextActionAt: string | null; status: string }[];
  today: { calls: number; answered: number; talkSec: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const telephonyKeys = {
  all: ['telephony'] as const,
  device: () => ['telephony', 'device', 'me'] as const,
  devices: (includeRevoked = false) => ['telephony', 'devices', includeRevoked] as const,
  session: () => ['telephony', 'session', 'current'] as const,
  calls: (params: Record<string, unknown>) => ['telephony', 'calls', params] as const,
  campaigns: (active?: boolean) => ['telephony', 'campaigns', active ?? 'all'] as const,
  campaignPreview: (id: number) => ['telephony', 'campaigns', id, 'preview'] as const,
  supervision: () => ['telephony', 'supervision'] as const,
  kpis: (params: Record<string, unknown>) => ['telephony', 'kpis', params] as const,
  myQueue: () => ['telephony', 'my-queue'] as const,
};

type Query = Record<string, string | number | boolean | undefined | null>;
const qs = (params?: Query) => {
  const p = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)); });
  const q = p.toString();
  return q ? `?${q}` : '';
};
const get = <T,>(path: string, params?: Query): Promise<T> => apiRequest(path + qs(params));
const send = <T,>(method: string, path: string, body?: unknown): Promise<T> =>
  apiRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export const telephonyService = {
  // Dispositivo
  registerDevice: (body: { platform: 'android'; model?: string; appVersion?: string; mode: DeviceMode }) =>
    send<{ device: TelephonyDevice; token: string }>('POST', '/telephony/devices/register', body),
  getMyDevice: () => get<TelephonyDevice | null>('/telephony/devices/me'),
  listDevices: (includeRevoked = false) =>
    get<TelephonyDevice[]>('/telephony/devices', includeRevoked ? { includeRevoked: true } : {}),
  revokeDevice: (id: number) => send<{ ok: true }>('DELETE', `/telephony/devices/${id}`),

  // Sessao de discagem
  getSession: () => get<DialerSession | null>('/telephony/sessions/current'),
  startSession: (body: { campaignId?: number; leadIds?: number[]; intervalSec?: number }) =>
    send<DialerSession>('POST', '/telephony/sessions', body),
  pause: (seconds = 0) => send<DialerSession>('POST', '/telephony/sessions/current/pause', { seconds }),
  resume: () => send<DialerSession>('POST', '/telephony/sessions/current/resume'),
  stop: () => send<DialerSession>('POST', '/telephony/sessions/current/stop'),
  hangupSession: () => send<DialerSession>('POST', '/telephony/sessions/current/hangup'),
  prioritize: (leadId: number) =>
    send<DialerSession>('POST', '/telephony/sessions/current/prioritize', { leadId }),
  addToSession: (leadIds: number[]) =>
    send<{ added: number[]; session: DialerSession }>('POST', '/telephony/sessions/current/add', { leadIds }),

  // Ligacoes
  callLead: (leadId: number, campaignId?: number) => send<PhoneCall>('POST', '/telephony/calls', { leadId, ...(campaignId ? { campaignId } : {}) }),
  hangupCall: (id: string) => send<PhoneCall>('POST', `/telephony/calls/${id}/hangup`),
  setDisposition: (
    id: string,
    body: { interactionStatus?: InteractionStatus; nextActionAt?: string; result?: Disposition; note?: string; callbackAt?: string; whatsappFallback?: boolean },
  ) =>
    send<PhoneCall>('POST', `/telephony/calls/${id}/disposition`, body),
  listCalls: (params: {
    userId?: number;
    leadId?: number;
    status?: PhoneCallStatus;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
    campaignId?: number;
  }) => get<Paginated<PhoneCall>>('/telephony/calls', params),
  getCall: (id: string) => get<PhoneCall>(`/telephony/calls/${id}`),

  // Campanhas
  listCampaigns: (active?: boolean) =>
    get<DialerCampaign[]>('/telephony/campaigns', active === undefined ? {} : { active }),
  createCampaign: (body: CampaignInput) => send<DialerCampaign>('POST', '/telephony/campaigns', body),
  updateCampaign: (id: number, body: CampaignInput) => send<DialerCampaign>('PUT', `/telephony/campaigns/${id}`, body),
  deactivateCampaign: (id: number) => send<DialerCampaign>('DELETE', `/telephony/campaigns/${id}`),
  previewCampaign: (id: number) =>
    get<{ eligibleCount: number; assignedCount: number | null; sample: { leadId: number; name: string; phone: string }[] }>(`/telephony/campaigns/${id}/preview`),
  campaignLeads: (id: number) =>
    get<CampaignLeadList>(`/telephony/campaigns/${id}/leads`),
  addCampaignLeads: (id: number, leadIds: number[]) =>
    send<{ added: number; alreadyAssigned: number; skipped: number }>('POST', `/telephony/campaigns/${id}/leads`, { leadIds }),
  updateCampaignLead: (campaignId: number, leadId: number, body: { status?: string; stage?: string; nextActionAt?: string | null }) =>
    send<CampaignLeadList['items'][number]>('PATCH', `/telephony/campaigns/${campaignId}/leads/${leadId}`, body),

  // Supervisao / fila
  getSupervision: () => get<Supervision>('/telephony/supervision'),
  getKpis: (params: { from?: string; to?: string; userId?: number; campaignId?: number }) =>
    get<TelephonyKpis>('/telephony/kpis', params),
  getMyQueue: () => get<MyQueue>('/telephony/my-queue'),
};

export interface CampaignLeadList {
  campaignId: number;
  total: number;
  items: {
    id: number;
    leadId: number;
    status: string;
    nextActionAt: string | null;
    stage: string;
    lead: { id: number; name: string; company: string | null; phone: string | null; ownerId: number | null; status: string };
  }[];
}

export function formatDuration(totalSec?: number | null): string {
  const s = Math.max(0, Math.round(totalSec ?? 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}

export default telephonyService;
