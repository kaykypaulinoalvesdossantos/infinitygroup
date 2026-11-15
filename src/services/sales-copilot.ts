import { apiRequest } from './api';

/** Copiloto de vendas (diagnostico, roteiro, ofertas, propostas e metas). Contrato: .sales-copilot/CONTRACT.md */

export interface DiagnosisResponse<T = Record<string, unknown>> {
  leadId: number;
  data: T | null;
  /** 0 quando o lead ainda nao tem diagnostico salvo. */
  version: number;
  updatedAt: string | null;
  updatedBy: { id: number; name: string } | null;
}

export interface ScriptSettingsResponse<T = Record<string, unknown>> {
  data: T | null;
  updatedAt: string | null;
}

export interface OfferInput {
  name: string;
  need?: string | null;
  expectedResult?: string | null;
  description?: string | null;
  defaultPriceCents?: number | null;
}

export interface Offer {
  id: number;
  name: string;
  need: string | null;
  expectedResult: string | null;
  description: string | null;
  defaultPriceCents: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  EXPIRED: 'Expirada',
};

export interface ProposalItem {
  offerId?: number | null;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface ProposalInput {
  title: string;
  scope?: string | null;
  conditions?: string | null;
  items: ProposalItem[];
  discountCents?: number;
  /** YYYY-MM-DD */
  validUntil?: string | null;
}

export interface ProposalSummary {
  id: number;
  number: string | null;
  title: string;
  status: ProposalStatus;
  totalCents: number;
  validUntil: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead: { id: number; name: string; company: string | null };
  createdBy: { id: number; name: string } | null;
}

export interface Proposal extends Omit<ProposalSummary, 'lead'> {
  scope: string | null;
  conditions: string | null;
  items: ProposalItem[];
  subtotalCents: number;
  discountCents: number;
  acceptedAt: string | null;
  rejectedAt: string | null;
  lead: {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    segment: string | null;
  };
}

export interface ProposalPage {
  items: ProposalSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProposalListParams {
  leadId?: number;
  status?: ProposalStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface SendProposalResult {
  proposal: Proposal;
  sent: boolean;
  error: string | null;
}

export interface GoalTargets {
  callsTarget: number | null;
  connectedTarget: number | null;
  meetingsTarget: number | null;
  proposalsTarget: number | null;
  wonTarget: number | null;
  revenueTargetCents: number | null;
}

export interface GoalInput extends Partial<GoalTargets> {
  /** YYYY-MM */
  month: string;
  /** null/undefined = meta da equipe */
  userId?: number | null;
}

export interface Goal extends GoalTargets {
  id: number;
  month: string;
  userId: number | null;
  updatedAt: string;
}

export interface GoalsResponse {
  month: string;
  team: Goal | null;
  users: Array<{ userId: number; name: string; goal: Goal | null }>;
}

export interface GoalProgress {
  month: string;
  userId: number | null;
  targets: GoalTargets;
  actuals: {
    calls: number;
    connected: number;
    meetings: number;
    proposals: number;
    won: number;
    revenueCents: number;
  };
  avgTalkSeconds: number | null;
  callToMeetingPercent: number | null;
}

const json = (body: unknown) => JSON.stringify(body);

function query(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** Mes atual no fuso de Sao Paulo (YYYY-MM). */
export function currentMonth(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? String(date.getFullYear());
  const month = parts.find((part) => part.type === 'month')?.value ?? String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/** Converte "1.234,56" / "1234.56" / "R$ 10" em centavos (null quando vazio ou invalido). */
export function parseMoneyToCents(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, '').trim();
  if (!cleaned) return null;
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

export const salesCopilotApi = {
  getDiagnosis: <T = Record<string, unknown>>(leadId: number): Promise<DiagnosisResponse<T>> =>
    apiRequest(`/crm-sales/leads/${leadId}/diagnosis`),
  saveDiagnosis: <T = Record<string, unknown>>(leadId: number, data: T, expectedVersion?: number): Promise<DiagnosisResponse<T>> =>
    apiRequest(`/crm-sales/leads/${leadId}/diagnosis`, { method: 'PUT', body: json({ data, expectedVersion }) }),

  getScript: <T = Record<string, unknown>>(): Promise<ScriptSettingsResponse<T>> => apiRequest('/crm-sales/script'),
  saveScript: <T = Record<string, unknown>>(data: T): Promise<ScriptSettingsResponse<T>> =>
    apiRequest('/crm-sales/script', { method: 'PUT', body: json({ data }) }),

  listOffers: (includeInactive = false): Promise<Offer[]> => apiRequest(`/crm-sales/offers${query({ includeInactive })}`),
  createOffer: (input: OfferInput): Promise<Offer> => apiRequest('/crm-sales/offers', { method: 'POST', body: json(input) }),
  updateOffer: (id: number, input: Partial<OfferInput> & { isActive?: boolean }): Promise<Offer> =>
    apiRequest(`/crm-sales/offers/${id}`, { method: 'PATCH', body: json(input) }),
  deactivateOffer: (id: number): Promise<{ ok: true }> => apiRequest(`/crm-sales/offers/${id}`, { method: 'DELETE' }),

  listProposals: (params: ProposalListParams = {}): Promise<ProposalPage> => apiRequest(`/crm-sales/proposals${query(params)}`),
  getProposal: (id: number): Promise<Proposal> => apiRequest(`/crm-sales/proposals/${id}`),
  createProposal: (leadId: number, input: ProposalInput): Promise<Proposal> =>
    apiRequest('/crm-sales/proposals', { method: 'POST', body: json({ ...input, leadId }) }),
  updateProposal: (id: number, input: Partial<ProposalInput>): Promise<Proposal> =>
    apiRequest(`/crm-sales/proposals/${id}`, { method: 'PATCH', body: json(input) }),
  deleteProposal: (id: number): Promise<{ ok: true }> => apiRequest(`/crm-sales/proposals/${id}`, { method: 'DELETE' }),
  setProposalStatus: (id: number, status: ProposalStatus, note?: string): Promise<Proposal> =>
    apiRequest(`/crm-sales/proposals/${id}/status`, { method: 'POST', body: json({ status, note }) }),
  sendProposal: (id: number, input: { recipientEmail?: string; message?: string }): Promise<SendProposalResult> =>
    apiRequest(`/crm-sales/proposals/${id}/send`, { method: 'POST', body: json(input) }),

  listGoals: (month: string): Promise<GoalsResponse> => apiRequest(`/crm-sales/goals${query({ month })}`),
  saveGoal: (input: GoalInput): Promise<Goal> => apiRequest('/crm-sales/goals', { method: 'PUT', body: json(input) }),
  goalProgress: (month: string, userId?: number | 'team'): Promise<GoalProgress> =>
    apiRequest(`/crm-sales/goals/progress${query({ month, userId })}`),
};
