import { apiRequest } from './api';

/** Pipeline comercial + equipe. Contrato: infinitygroups-backend/docs/ramal/SPEC.md (secoes E e F). */

export type LeadStatus = 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'WON' | 'LOST';
export const LEAD_STATUSES: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'NEW', title: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { id: 'CONTACTED', title: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'PROPOSAL', title: 'Proposta', color: 'bg-purple-100 text-purple-800' },
  { id: 'WON', title: 'Ganho', color: 'bg-green-100 text-green-800' },
  { id: 'LOST', title: 'Perdido', color: 'bg-red-100 text-red-800' },
];
export const LEAD_SOURCES = [
  { id: 'MANUAL', label: 'Manual' },
  { id: 'IMPORT', label: 'Importação' },
  { id: 'SITE', label: 'Site' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'INDICACAO', label: 'Indicação' },
] as const;

export const PRODUCT_INTERESTS = [
  { id: 'TELECOM', label: 'Telecom' },
  { id: 'SEGUROS', label: 'Seguros · Insuri' },
] as const;
export type ProductInterest = (typeof PRODUCT_INTERESTS)[number]['id'];

export interface CrmLead {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  city: string | null;
  segment: string | null;
  productInterests: ProductInterest[];
  source: string;
  status: LeadStatus;
  notes: string | null;
  value: number | null;
  ownerId: number | null;
  owner: { id: number; name: string } | null;
  nextActionAt: string | null;
  whatsappOptInAt: string | null;
  whatsappOptInSource: string | null;
  whatsappOptOutAt: string | null;
  lastContactAt: string | null;
  lostReason: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastCall: { status: string; disposition: string | null; createdAt: string } | null;
}

export interface CrmLeadActivity {
  id: number;
  leadId: number;
  whatsappChannelId?: number | null;
  type: 'CALL' | 'NOTE' | 'STATUS' | 'APPOINTMENT' | 'WHATSAPP';
  direction: string | null;
  outcome: string | null;
  summary: string | null;
  providerMessageId?: string | null;
  isRead?: boolean;
  nextActionAt: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdById: number | null;
  createdAt: string;
}

export interface CrmLeadContact {
  id: number;
  leadId: number;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CrmLeadDetail = CrmLead & { activities: CrmLeadActivity[]; contacts: CrmLeadContact[] };

export interface CrmAppointment {
  id: number;
  leadId: number;
  campaignId: number | null;
  campaignLeadId: number | null;
  sourceCallId: string | null;
  ownerId: number;
  createdById: number;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  googleEventId: string | null;
  googleCalendarId: string | null;
  googleSyncStatus: 'NOT_CONNECTED' | 'PENDING' | 'SYNCED' | 'FAILED';
  googleSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleCalendarStatus {
  configured: boolean;
  connected: boolean;
  email: string | null;
  calendarId: string | null;
  reconnectRequired: boolean;
}

export interface CrmWhatsAppChannel {
  id: number | null;
  name: string;
  instanceName: string;
  phoneNumber: string | null;
  status: 'PENDING' | 'QR_PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | string;
  isDefault: boolean;
  voiceSessionConfigured: boolean;
  inboxEnabled: boolean;
}

export interface CrmWhatsAppInboxConversation {
  lead: CrmLead;
  whatsappChannelId: number | null;
  channelName: string;
  channelPhoneNumber: string | null;
  channelStatus: string | null;
  inboxEnabled: boolean;
  lastMessage: CrmLeadActivity;
  unreadCount: number;
}

export interface CrmWhatsAppConversationThread {
  leadId: number;
  whatsappChannelId: number | null;
  channelName: string;
  messages: CrmLeadActivity[];
}

export type LeadInput = Partial<
  Pick<CrmLead, 'name' | 'company' | 'email' | 'phone' | 'phone2' | 'city' | 'segment' | 'productInterests' | 'source' | 'status' | 'notes' | 'value' | 'ownerId' | 'nextActionAt' | 'lostReason'>
>;

export type LeadContactInput = Pick<CrmLeadContact, 'name'> & Partial<Pick<CrmLeadContact, 'role' | 'email' | 'phone' | 'notes'>>;

export interface ImportRow {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  city?: string;
  segment?: string;
  notes?: string;
  /** CSV values split by comma, semicolon or pipe; the API validates each row. */
  productInterests?: string[];
}

export type TeamRole = 'SUPER_ADMIN' | 'ADMIN' | 'FINANCEIRO' | 'VENDEDOR';
export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Administrador',
  FINANCEIRO: 'Financeiro',
  VENDEDOR: 'Vendedor',
};
export interface TeamUser {
  id: number;
  name: string;
  email: string;
  role: TeamRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  device: { connected: boolean; model: string | null; mode: string } | null;
}

type Query = Record<string, string | number | boolean | undefined | null>;
const qs = (params?: Query) => {
  const p = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const q = p.toString();
  return q ? `?${q}` : '';
};
const send = <T,>(method: string, path: string, body?: unknown): Promise<T> =>
  apiRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export const crmLeadsApi = {
  list: (params: { status?: LeadStatus; ownerId?: number; search?: string; productInterest?: ProductInterest; page?: number; pageSize?: number; includeArchived?: boolean } = {}) =>
    apiRequest(`/crm-leads${qs(params)}`) as Promise<{ items: CrmLead[]; total: number; page: number; pageSize: number }>,
  board: (params: { ownerId?: number; search?: string; productInterest?: ProductInterest } = {}) =>
    apiRequest(`/crm-leads/board${qs(params)}`) as Promise<{ columns: Record<LeadStatus, CrmLead[]> }>,
  get: (id: number) => apiRequest(`/crm-leads/${id}`) as Promise<CrmLeadDetail>,
  create: (body: LeadInput) => send<CrmLead>('POST', '/crm-leads', body),
  update: (id: number, body: LeadInput) => send<CrmLead>('PATCH', `/crm-leads/${id}`, body),
  createContact: (leadId: number, body: LeadContactInput) => send<CrmLeadContact>('POST', `/crm-leads/${leadId}/contacts`, body),
  updateContact: (leadId: number, contactId: number, body: Partial<LeadContactInput>) => send<CrmLeadContact>('PATCH', `/crm-leads/${leadId}/contacts/${contactId}`, body),
  archiveContact: (leadId: number, contactId: number) => send<{ archived: true }>('DELETE', `/crm-leads/${leadId}/contacts/${contactId}`),
  archive: (id: number) => send<CrmLead>('DELETE', `/crm-leads/${id}`),
  addNote: (id: number, text: string) => send<CrmLeadActivity>('POST', `/crm-leads/${id}/notes`, { text }),
  listAppointments: (id: number) => apiRequest(`/crm-leads/${id}/appointments`) as Promise<CrmAppointment[]>,
  createAppointment: (id: number, body: { title: string; startsAt: string; endsAt: string; description?: string; location?: string; timezone?: string; campaignId?: number }) =>
    send<CrmAppointment>('POST', `/crm-leads/${id}/appointments`, body),
  updateAppointment: (id: number, body: { title?: string; startsAt?: string; endsAt?: string; description?: string | null; location?: string | null; timezone?: string }) =>
    send<CrmAppointment>('PATCH', `/crm-leads/appointments/${id}`, body),
  updateAppointmentStatus: (id: number, status: CrmAppointment['status']) =>
    send<CrmAppointment>('PATCH', `/crm-leads/appointments/${id}/status`, { status }),
  syncAppointment: (id: number) => send<CrmAppointment>('POST', `/crm-leads/appointments/${id}/sync`),
  googleCalendarStatus: () => apiRequest('/crm-leads/google-calendar/status') as Promise<GoogleCalendarStatus>,
  connectGoogleCalendar: () => send<{ authorizationUrl: string }>('POST', '/crm-leads/google-calendar/connect'),
  listWhatsAppChannels: () => apiRequest('/crm-leads/whatsapp/channels') as Promise<CrmWhatsAppChannel[]>,
  createWhatsAppChannel: (name: string, voiceSessionName?: string) => send<CrmWhatsAppChannel>('POST', '/crm-leads/whatsapp/channels', { name, ...(voiceSessionName ? { voiceSessionName } : {}) }),
  connectWhatsAppChannel: (id: number) => send<CrmWhatsAppChannel & { qrCode: string | null }>('POST', `/crm-leads/whatsapp/channels/${id}/connect`, {}),
  enableWhatsAppInbox: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/inbox`, {}),
  refreshWhatsAppChannelStatus: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/status`, {}),
  setDefaultWhatsAppChannel: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/default`, {}),
  listWhatsAppConversations: (params: { search?: string; channelId?: number; unreadOnly?: boolean } = {}) =>
    apiRequest(`/crm-leads/whatsapp/conversations${qs(params)}`) as Promise<{ items: CrmWhatsAppInboxConversation[]; total: number }>,
  getWhatsAppConversation: (leadId: number, channelId: number | null) =>
    apiRequest(`/crm-leads/whatsapp/conversations/${leadId}?channelId=${channelId === null ? 'legacy' : channelId}`) as Promise<CrmWhatsAppConversationThread>,
  markWhatsAppConversationRead: (leadId: number, channelId: number | null) =>
    send<{ updated: number }>('POST', `/crm-leads/whatsapp/conversations/${leadId}/read?channelId=${channelId === null ? 'legacy' : channelId}`, {}),
  replyWhatsApp: (leadId: number, message: string, channelId: number | null) =>
    send<{ activity: CrmLeadActivity; phone: string; channelId: number | null; channelName: string; providerMessageId: string | null }>(
      'POST', `/crm-leads/whatsapp/conversations/${leadId}/reply`, { message, channelId },
    ),
  setWhatsAppConsent: (id: number, consented: boolean, source?: 'VERBAL' | 'WRITTEN' | 'WEB_FORM' | 'OTHER') =>
    send<{ leadId: number; consented: boolean; optInAt: string | null; optInSource: string | null; optOutAt: string | null }>(
      'POST', `/crm-leads/${id}/whatsapp-consent`, { consented, source },
    ),
  sendWhatsApp: (id: number, message: string, channelId?: number | null) =>
    send<{ activity: CrmLeadActivity; phone: string; channelId: number | null; channelName: string; providerMessageId: string | null }>(
      'POST', `/crm-leads/${id}/whatsapp-send`, { message, channelId: channelId ?? null },
    ),
  startWhatsAppCall: (id: number, channelId?: number | null) =>
    send<{ activity: CrmLeadActivity; phone: string; callId: string }>(
      'POST', `/crm-leads/${id}/whatsapp-call`, { channelId: channelId ?? null },
    ),
  whatsappCallStatus: (activityId: number) =>
    send<CrmLeadActivity>('GET', `/crm-leads/whatsapp-calls/${activityId}`),
  whatsappCallWebrtc: (activityId: number, sdpOffer: string) =>
    send<{ sdpAnswer: string }>('POST', `/crm-leads/whatsapp-calls/${activityId}/webrtc`, { sdpOffer }),
  hangupWhatsAppCall: (activityId: number) =>
    send<CrmLeadActivity>('POST', `/crm-leads/whatsapp-calls/${activityId}/hangup`, {}),
  import: (body: { rows: ImportRow[]; ownerId?: number; source?: string; campaignId?: number }) =>
    send<{ created: number; campaignAssigned: number; skipped: number; errors: { row: number; reason: string }[] }>('POST', '/crm-leads/import', body),
  assign: (leadIds: number[], ownerId: number) => send<{ updated: number }>('POST', '/crm-leads/assign', { leadIds, ownerId }),
};

export const teamApi = {
  list: () => apiRequest('/team/users') as Promise<TeamUser[]>,
  create: (body: { name: string; email: string; role: TeamRole; sendEmail?: boolean }) =>
    send<TeamUser & { temporaryPassword: string }>('POST', '/team/users', body),
  update: (id: number, body: { name?: string; role?: TeamRole; active?: boolean }) => send<TeamUser>('PATCH', `/team/users/${id}`, body),
  resetPassword: (id: number) => send<{ temporaryPassword: string }>('POST', `/team/users/${id}/reset-password`),
};

/** Usuario logado salvo pelo login (localStorage 'user'). */
export function getStoredUser(): { id?: number; name?: string; email?: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}
export const isSupervisorRole = (role?: string) => ['SUPER_ADMIN', 'ADMIN'].includes(String(role ?? '').toUpperCase());
export const isSalesRole = (role?: string) => ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'].includes(String(role ?? '').toUpperCase());
