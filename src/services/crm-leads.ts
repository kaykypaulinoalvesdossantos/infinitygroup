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

export interface CrmLead {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  city: string | null;
  segment: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  value: number | null;
  ownerId: number | null;
  owner: { id: number; name: string } | null;
  nextActionAt: string | null;
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
  type: 'CALL' | 'NOTE' | 'STATUS';
  direction: string | null;
  outcome: string | null;
  summary: string | null;
  nextActionAt: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
  createdById: number | null;
  createdAt: string;
}

export type CrmLeadDetail = CrmLead & { activities: CrmLeadActivity[] };

export type LeadInput = Partial<
  Pick<CrmLead, 'name' | 'company' | 'email' | 'phone' | 'phone2' | 'city' | 'segment' | 'source' | 'status' | 'notes' | 'value' | 'ownerId' | 'nextActionAt' | 'lostReason'>
>;

export interface ImportRow {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  city?: string;
  segment?: string;
  notes?: string;
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
  list: (params: { status?: LeadStatus; ownerId?: number; search?: string; page?: number; pageSize?: number; includeArchived?: boolean } = {}) =>
    apiRequest(`/crm-leads${qs(params)}`) as Promise<{ items: CrmLead[]; total: number; page: number; pageSize: number }>,
  board: (params: { ownerId?: number; search?: string } = {}) =>
    apiRequest(`/crm-leads/board${qs(params)}`) as Promise<{ columns: Record<LeadStatus, CrmLead[]> }>,
  get: (id: number) => apiRequest(`/crm-leads/${id}`) as Promise<CrmLeadDetail>,
  create: (body: LeadInput) => send<CrmLead>('POST', '/crm-leads', body),
  update: (id: number, body: LeadInput) => send<CrmLead>('PATCH', `/crm-leads/${id}`, body),
  archive: (id: number) => send<CrmLead>('DELETE', `/crm-leads/${id}`),
  addNote: (id: number, text: string) => send<CrmLeadActivity>('POST', `/crm-leads/${id}/notes`, { text }),
  import: (body: { rows: ImportRow[]; ownerId?: number; source?: string }) =>
    send<{ created: number; skipped: number; errors: { row: number; reason: string }[] }>('POST', '/crm-leads/import', body),
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
