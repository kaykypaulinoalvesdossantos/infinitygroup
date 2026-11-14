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

export interface CrmLeadTag {
  id: number;
  name: string;
  color: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  tags: CrmLeadTag[];
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
  phone2: string | null;
  isPrimary: boolean;
  source: string;
  whatsappOptInAt: string | null;
  whatsappOptInSource: string | null;
  whatsappOptOutAt: string | null;
  whatsappConsentUpdatedById: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CrmLeadDetail = CrmLead & { activities: CrmLeadActivity[]; contacts: CrmLeadContact[] };

export interface CrmAppointment {
  id: number;
  leadId: number | null;
  contactId?: number | null;
  campaignId: number | null;
  campaignLeadId: number | null;
  sourceCallId: string | null;
  ownerId: number;
  createdById: number;
  title: string;
  appointmentType?: 'MEETING' | 'PRESENTATION_TELECOM' | 'PRESENTATION_SEGUROS' | 'CALLBACK' | 'INTERNAL' | 'OTHER';
  productInterest?: ProductInterest | null;
  description: string | null;
  location: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  attendees?: string[];
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  timezone: string;
  includeMeet?: boolean;
  sendInvites?: boolean;
  inviteStatus?: 'NOT_REQUESTED' | 'PENDING' | 'REQUESTED' | 'FAILED';
  meetUrl?: string | null;
  operationKey?: string | null;
  version?: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  googleEventId: string | null;
  googleCalendarId: string | null;
  googleSyncStatus: 'NOT_CONNECTED' | 'PENDING' | 'SYNCED' | 'FAILED';
  googleSyncError: string | null;
  source?: 'CRM' | 'GOOGLE';
  lead?: Pick<CrmLead, 'id' | 'name' | 'company' | 'phone' | 'ownerId'> | null;
  contact?: Pick<CrmLeadContact, 'id' | 'name' | 'role' | 'email' | 'phone'> | null;
  owner?: { id: number; name: string } | null;
  campaign?: { id: number; name: string } | null;
  externalHtmlLink?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface GoogleCalendarEvent {
  id: string;
  googleEventId: string;
  googleCalendarId: string;
  source: 'GOOGLE';
  title: string;
  appointmentType: 'OTHER';
  productInterest: null;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  timezone: string;
  status: 'SCHEDULED';
  googleSyncStatus: 'SYNCED';
  meetUrl: string | null;
  externalHtmlLink: string | null;
  lead: null;
  contact: null;
  owner: null;
  campaign: null;
}
export type CrmCalendarEvent = CrmAppointment | GoogleCalendarEvent;

export type CrmAppointmentInput = {
  title: string;
  startsAt: string;
  endsAt: string;
  leadId?: number;
  contactId?: number;
  ownerId?: number;
  campaignId?: number;
  appointmentType?: CrmAppointment['appointmentType'];
  productInterest?: ProductInterest;
  description?: string;
  location?: string;
  timezone?: string;
  guestName?: string;
  guestEmail?: string;
  attendees?: string[];
  allDay?: boolean;
  includeMeet?: boolean;
  sendInvites?: boolean;
  allowConflict?: boolean;
  operationId?: string;
};
export type CrmAppointmentUpdateInput = Omit<Partial<CrmAppointmentInput>, 'description' | 'location' | 'leadId' | 'ownerId' | 'campaignId' | 'operationId' | 'contactId' | 'productInterest' | 'guestName' | 'guestEmail'> & {
  expectedVersion?: number;
  description?: string | null;
  location?: string | null;
  contactId?: number | null;
  productInterest?: ProductInterest | null;
  guestName?: string | null;
  guestEmail?: string | null;
};

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
  id: number;
  lead: CrmLead;
  contact: Pick<CrmLeadContact, 'id' | 'name' | 'role' | 'email' | 'phone' | 'phone2'> | null;
  whatsappChannelId: number | null;
  remoteJid: string | null;
  channelName: string;
  channelPhoneNumber: string | null;
  channelStatus: string | null;
  inboxEnabled: boolean;
  lastMessage: CrmLeadActivity;
  unreadCount: number;
  status: 'OPEN' | 'WAITING' | 'CLOSED';
  version: number;
  assignedTo: { id: number; name: string } | null;
}

export interface CrmWhatsAppConversationThread {
  conversationId?: number;
  leadId: number;
  whatsappChannelId: number | null;
  remoteJid?: string | null;
  contactId?: number | null;
  contact?: Pick<CrmLeadContact, 'id' | 'name' | 'role' | 'email' | 'phone' | 'phone2'> | null;
  channelName: string;
  status?: 'OPEN' | 'WAITING' | 'CLOSED';
  version?: number;
  assignedTo?: { id: number; name: string } | null;
  messages: CrmLeadActivity[];
  hasMore?: boolean;
  nextBeforeId?: number | null;
}

export type CrmPipelineStageType = 'OPEN' | 'WON' | 'LOST';
export interface CrmPipelineStage {
  id: number;
  pipelineId: number;
  name: string;
  description: string | null;
  color: string;
  position: number;
  type: CrmPipelineStageType;
  isInitial: boolean;
  requiredFields: string[];
  legacyStatus: LeadStatus | null;
  isActive: boolean;
  opportunityCount?: number;
}
export interface CrmPipeline {
  id: number;
  name: string;
  description: string | null;
  productInterest: ProductInterest | null;
  isDefault: boolean;
  isActive: boolean;
  stages: CrmPipelineStage[];
  createdAt: string;
  updatedAt: string;
}
export interface CrmOpportunity {
  id: number;
  leadId: number;
  pipelineId: number;
  stageId: number;
  title: string;
  productInterest: ProductInterest | null;
  ownerId: number | null;
  owner: { id: number; name: string } | null;
  amount: number | null;
  expectedCloseAt: string | null;
  source: string;
  lostReason: string | null;
  nextActionAt: string | null;
  version: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  pipeline: Pick<CrmPipeline, 'id' | 'name' | 'productInterest'>;
  stage: CrmPipelineStage;
  lead: Pick<CrmLead, 'id' | 'name' | 'company' | 'phone' | 'phone2' | 'ownerId' | 'tags'>;
}
export interface CrmOpportunityBoard {
  pipeline: CrmPipeline;
  columns: Array<{ stage: CrmPipelineStage; items: CrmOpportunity[]; total: number; amountTotal: number }>;
}

export type LeadInput = Partial<
  Pick<CrmLead, 'name' | 'company' | 'email' | 'phone' | 'phone2' | 'city' | 'segment' | 'productInterests' | 'source' | 'status' | 'notes' | 'value' | 'ownerId' | 'nextActionAt' | 'lostReason'>
> & { tagIds?: number[] };

export type LeadContactInput = Pick<CrmLeadContact, 'name'> & Partial<Pick<CrmLeadContact, 'role' | 'email' | 'phone' | 'phone2' | 'notes'>>;

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
  listPipelines: () => apiRequest('/crm-pipelines') as Promise<CrmPipeline[]>,
  createPipeline: (body: { name: string; description?: string; productInterest?: ProductInterest; isDefault?: boolean }) => send<CrmPipeline>('POST', '/crm-pipelines', body),
  updatePipeline: (id: number, body: { name?: string; description?: string | null; isActive?: boolean; isDefault?: boolean }) => send<CrmPipeline>('PATCH', `/crm-pipelines/${id}`, body),
  createPipelineStage: (pipelineId: number, body: { name: string; description?: string; color?: string; type?: CrmPipelineStageType; isInitial?: boolean; requiredFields?: string[]; legacyStatus?: LeadStatus | null }) => send<CrmPipeline>('POST', `/crm-pipelines/${pipelineId}/stages`, body),
  updatePipelineStage: (stageId: number, body: { name?: string; description?: string | null; color?: string; type?: CrmPipelineStageType; isInitial?: boolean; requiredFields?: string[]; legacyStatus?: LeadStatus | null; isActive?: boolean; moveToStageId?: number }) => send<CrmPipeline>('PATCH', `/crm-pipelines/stages/${stageId}`, body),
  reorderPipelineStages: (pipelineId: number, stageIds: number[]) => send<CrmPipeline>('PATCH', `/crm-pipelines/${pipelineId}/stages/reorder`, { stageIds }),
  stageUsage: (stageId: number) => apiRequest(`/crm-pipelines/stages/${stageId}/usage`) as Promise<{ stageId: number; activeOpportunityCount: number }>,
  opportunityBoard: (params: { pipelineId: number; ownerId?: number; productInterest?: ProductInterest; tagId?: number; search?: string }) => apiRequest(`/crm-pipelines/opportunities/board${qs(params)}`) as Promise<CrmOpportunityBoard>,
  listOpportunities: (params: { pipelineId: number; stageId?: number; ownerId?: number; productInterest?: ProductInterest; tagId?: number; search?: string; page?: number; pageSize?: number }) => apiRequest(`/crm-pipelines/opportunities${qs(params)}`) as Promise<{ items: CrmOpportunity[]; total: number; page: number; pageSize: number }>,
  listLeadOpportunities: (leadId: number) => apiRequest(`/crm-pipelines/leads/${leadId}/opportunities`) as Promise<CrmOpportunity[]>,
  createOpportunity: (body: { leadId: number; pipelineId: number; stageId?: number; title?: string; productInterest?: ProductInterest; ownerId?: number; amount?: number | null; expectedCloseAt?: string | null; source?: string; lostReason?: string | null; nextActionAt?: string | null }) => send<CrmOpportunity>('POST', '/crm-pipelines/opportunities', body),
  updateOpportunity: (id: number, body: { expectedVersion: number; stageId?: number; title?: string; amount?: number | null; expectedCloseAt?: string | null; ownerId?: number | null; lostReason?: string | null; nextActionAt?: string | null }) => send<CrmOpportunity>('PATCH', `/crm-pipelines/opportunities/${id}`, body),
  listTags: () => apiRequest('/crm-leads/tags') as Promise<CrmLeadTag[]>,
  createTag: (body: { name: string; color?: string; description?: string }) => send<CrmLeadTag>('POST', '/crm-leads/tags', body),
  updateTag: (id: number, body: { name?: string; color?: string; description?: string | null; isActive?: boolean }) => send<CrmLeadTag>('PATCH', `/crm-leads/tags/${id}`, body),
  list: (params: { status?: LeadStatus; ownerId?: number; search?: string; productInterest?: ProductInterest; tagId?: number; page?: number; pageSize?: number; includeArchived?: boolean } = {}) =>
    apiRequest(`/crm-leads${qs(params)}`) as Promise<{ items: CrmLead[]; total: number; page: number; pageSize: number }>,
  board: (params: { ownerId?: number; search?: string; productInterest?: ProductInterest; tagId?: number } = {}) =>
    apiRequest(`/crm-leads/board${qs(params)}`) as Promise<{ columns: Record<LeadStatus, CrmLead[]> }>,
  get: (id: number) => apiRequest(`/crm-leads/${id}`) as Promise<CrmLeadDetail>,
  create: (body: LeadInput) => send<CrmLead>('POST', '/crm-leads', body),
  update: (id: number, body: LeadInput) => send<CrmLead>('PATCH', `/crm-leads/${id}`, body),
  createContact: (leadId: number, body: LeadContactInput) => send<CrmLeadContact>('POST', `/crm-leads/${leadId}/contacts`, body),
  updateContact: (leadId: number, contactId: number, body: Partial<LeadContactInput>) => send<CrmLeadContact>('PATCH', `/crm-leads/${leadId}/contacts/${contactId}`, body),
  setPrimaryContact: (leadId: number, contactId: number) => send<CrmLeadContact>('PATCH', `/crm-leads/${leadId}/contacts/${contactId}/primary`, {}),
  archiveContact: (leadId: number, contactId: number) => send<{ archived: true }>('DELETE', `/crm-leads/${leadId}/contacts/${contactId}`),
  archive: (id: number) => send<CrmLead>('DELETE', `/crm-leads/${id}`),
  addNote: (id: number, text: string) => send<CrmLeadActivity>('POST', `/crm-leads/${id}/notes`, { text }),
  listAppointments: (id: number) => apiRequest(`/crm-leads/${id}/appointments`) as Promise<CrmAppointment[]>,
  createAppointment: (id: number, body: CrmAppointmentInput) =>
    send<CrmAppointment>('POST', `/crm-leads/${id}/appointments`, body),
  listCalendarAppointments: (params: { from: string; to: string; scope?: 'MINE' | 'TEAM'; ownerId?: number; productInterest?: ProductInterest; appointmentType?: CrmAppointment['appointmentType']; status?: CrmAppointment['status']; campaignId?: number; source?: 'ALL' | 'CRM' | 'GOOGLE'; includeGoogle?: boolean; page?: number; pageSize?: number }) =>
    apiRequest(`/crm-leads/appointments/calendar${qs(params)}`) as Promise<{ items: CrmCalendarEvent[]; total: number; page: number; pageSize: number; google: { connected: boolean; partialError: string | null } }>,
  createCalendarAppointment: (body: CrmAppointmentInput) =>
    send<CrmAppointment>('POST', '/crm-leads/appointments', body),
  updateAppointment: (id: number, body: CrmAppointmentUpdateInput) =>
    send<CrmAppointment>('PATCH', `/crm-leads/appointments/${id}`, body),
  updateAppointmentStatus: (id: number, status: CrmAppointment['status'], expectedVersion?: number) =>
    send<CrmAppointment>('PATCH', `/crm-leads/appointments/${id}/status`, { status, expectedVersion }),
  syncAppointment: (id: number) => send<CrmAppointment>('POST', `/crm-leads/appointments/${id}/sync`),
  googleCalendarStatus: () => apiRequest('/crm-leads/google-calendar/status') as Promise<GoogleCalendarStatus>,
  connectGoogleCalendar: () => send<{ authorizationUrl: string }>('POST', '/crm-leads/google-calendar/connect'),
  listWhatsAppChannels: () => apiRequest('/crm-leads/whatsapp/channels') as Promise<CrmWhatsAppChannel[]>,
  createWhatsAppChannel: (name: string, voiceSessionName?: string) => send<CrmWhatsAppChannel>('POST', '/crm-leads/whatsapp/channels', { name, ...(voiceSessionName ? { voiceSessionName } : {}) }),
  connectWhatsAppChannel: (id: number) => send<CrmWhatsAppChannel & { qrCode: string | null }>('POST', `/crm-leads/whatsapp/channels/${id}/connect`, {}),
  enableWhatsAppInbox: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/inbox`, {}),
  refreshWhatsAppChannelStatus: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/status`, {}),
  setDefaultWhatsAppChannel: (id: number) => send<CrmWhatsAppChannel>('POST', `/crm-leads/whatsapp/channels/${id}/default`, {}),
  listWhatsAppConversations: (params: { search?: string; channelId?: number; unreadOnly?: boolean; scope?: 'ALL' | 'MINE' | 'QUEUE'; status?: 'OPEN' | 'WAITING' | 'CLOSED'; ownerId?: number; tagId?: number; productInterest?: ProductInterest; from?: string; to?: string; page?: number; pageSize?: number } = {}) =>
    apiRequest(`/crm-leads/whatsapp/conversations${qs(params)}`) as Promise<{ items: CrmWhatsAppInboxConversation[]; total: number }>,
  getWhatsAppConversation: (leadId: number, channelId: number | null) =>
    apiRequest(`/crm-leads/whatsapp/conversations/${leadId}?channelId=${channelId === null ? 'legacy' : channelId}`) as Promise<CrmWhatsAppConversationThread>,
  markWhatsAppConversationRead: (leadId: number, channelId: number | null) =>
    send<{ updated: number }>('POST', `/crm-leads/whatsapp/conversations/${leadId}/read?channelId=${channelId === null ? 'legacy' : channelId}`, {}),
  replyWhatsApp: (leadId: number, message: string, channelId: number | null) =>
    send<{ activity: CrmLeadActivity; phone: string; channelId: number | null; channelName: string; providerMessageId: string | null }>(
      'POST', `/crm-leads/whatsapp/conversations/${leadId}/reply`, { message, channelId },
    ),
  getWhatsAppThread: (conversationId: number, beforeId?: number) =>
    apiRequest(`/crm-leads/whatsapp/threads/${conversationId}${beforeId ? `?beforeId=${beforeId}` : ''}`) as Promise<CrmWhatsAppConversationThread>,
  markWhatsAppThreadRead: (conversationId: number) =>
    send<{ updated: number }>('POST', `/crm-leads/whatsapp/threads/${conversationId}/read`, {}),
  replyWhatsAppThread: (conversationId: number, message: string, operationId: string) =>
    send<{ activity: CrmLeadActivity; phone: string; channelId: number | null; channelName: string; providerMessageId: string | null }>(
      'POST', `/crm-leads/whatsapp/threads/${conversationId}/reply`, { message, operationId },
    ),
  sendWhatsAppThreadMedia: (conversationId: number, file: File, caption: string, operationId: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    form.append('operationId', operationId);
    return apiRequest(`/crm-leads/whatsapp/threads/${conversationId}/media`, {
      method: 'POST',
      body: form,
    }) as Promise<{ activity: CrmLeadActivity; phone: string; channelId: number; channelName: string; providerMessageId: string | null }>;
  },
  updateWhatsAppConversation: (conversationId: number, body: { expectedVersion: number; assignedToId?: number | null; status?: 'OPEN' | 'WAITING' | 'CLOSED' }) =>
    send<{ id: number; version: number; status: 'OPEN' | 'WAITING' | 'CLOSED'; assignedToId: number | null }>(
      'PATCH', `/crm-leads/whatsapp/threads/${conversationId}`, body,
    ),
  addWhatsAppConversationNote: (conversationId: number, note: string) =>
    send<CrmLeadActivity>('POST', `/crm-leads/whatsapp/threads/${conversationId}/notes`, { note }),
  setWhatsAppConsent: (id: number, consented: boolean, source?: 'VERBAL' | 'WRITTEN' | 'WEB_FORM' | 'OTHER', contactId?: number) =>
    send<{ leadId: number; contactId: number | null; consented: boolean; optInAt: string | null; optInSource: string | null; optOutAt: string | null }>(
      'POST', `/crm-leads/${id}/whatsapp-consent`, { consented, source, contactId },
    ),
  sendWhatsApp: (id: number, message: string, channelId?: number | null) =>
    send<{ activity: CrmLeadActivity; phone: string; channelId: number | null; channelName: string; providerMessageId: string | null }>(
      'POST', `/crm-leads/${id}/whatsapp-send`, { message, channelId: channelId ?? null },
    ),
  startWhatsAppCall: (id: number, channelId?: number | null, recipientPhone?: string | null) =>
    send<{ activity: CrmLeadActivity; phone: string; callId: string }>(
      'POST', `/crm-leads/${id}/whatsapp-call`, {
        channelId: channelId ?? null,
        recipientPhone: recipientPhone ?? null,
      },
    ),
  startWhatsAppThreadCall: (conversationId: number) =>
    send<{ activity: CrmLeadActivity; phone: string; callId: string }>(
      'POST', `/crm-leads/whatsapp/threads/${conversationId}/call`, {},
    ),
  whatsappCallStatus: (activityId: number) =>
    send<CrmLeadActivity>('GET', `/crm-leads/whatsapp-calls/${activityId}`),
  whatsappCallWebrtc: (activityId: number, sdpOffer: string) =>
    send<{ sdpAnswer: string }>('POST', `/crm-leads/whatsapp-calls/${activityId}/webrtc`, { sdpOffer }),
  hangupWhatsAppCall: (activityId: number) =>
    send<CrmLeadActivity>('POST', `/crm-leads/whatsapp-calls/${activityId}/hangup`, {}),
  import: (body: { rows: ImportRow[]; ownerId?: number; source?: string; campaignId?: number; tagIds?: number[] }) =>
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
