import { API_URL, apiRequest, getAuthHeaders } from './api';
import {
  crmLeadsApi,
  type CrmLead,
  type CrmLeadTag,
  type CrmPipeline,
  type CrmPipelineStage,
  type LeadInput,
  type ProductInterest,
} from './crm-leads';

/** Pipeline v3 sobre o modelo de producao (funil configuravel, stageId numerico). Contrato: docs/pipeline-v3-contrato-api.md */

export type StageKind = CrmPipelineStage['type'];
export type Temperature = 'COLD' | 'WARM' | 'HOT';

/** Etapa do funil geral: DTO de producao + probabilidade efetiva e dias de esfriamento. */
export interface PipelineStage extends CrmPipelineStage {
  probability: number;
  rotDays: number | null;
}

/** Etiqueta do lead (producao: CrmLeadTag com isActive). */
export type CrmTag = CrmLeadTag;

/** Motivo de perda cadastravel (GET/PUT /crm-pipelines/lost-reasons). */
export interface LostReason {
  id: number;
  label: string;
  position: number;
  active: boolean;
}

/** Lead do quadro: LeadDto de producao + campos do pipeline v3. */
/** Etapa do lead (resumo que a API devolve em funnelStage). */
export interface PipelineFunnelStage {
  id: number;
  name: string;
  color: string;
  type: StageKind;
  position: number;
  isInitial?: boolean;
  requiredFields?: string[];
}

export interface PipelineLead extends Omit<CrmLead, 'funnelStage' | 'tags'> {
  funnelStage?: PipelineFunnelStage | null;
  tags: CrmLeadTag[];
  interactionStatus: string | null;
  probability: number | null;
  effectiveProbability: number;
  temperature: Temperature | null;
  stageEnteredAt: string | null;
  boardPosition: number | null;
  wonAt: string | null;
  lostAt: string | null;
  lostReasonId: number | null;
}

export type LeadSort = 'updatedAt' | 'createdAt' | 'value' | 'nextActionAt' | 'name';
export type FollowUpFilter = 'overdue' | 'today' | 'week' | 'none';
export type OutcomeFilter = 'open' | 'won' | 'lost' | 'all';

/** Filtros unificados (lista, board, summary, export, bulk-scope). Arrays viram CSV na query. */
export interface LeadFilters {
  search?: string;
  ownerId?: number;
  stageId?: number;
  tagIds?: number[];
  untagged?: boolean;
  productInterest?: ProductInterest;
  source?: string[];
  temperature?: Temperature[];
  valueMin?: number;
  valueMax?: number;
  createdFrom?: string;
  createdTo?: string;
  followUp?: FollowUpFilter;
  interactionStatus?: string[];
  rotting?: boolean;
  outcome?: OutcomeFilter;
}

export interface LeadListParams extends LeadFilters {
  page?: number;
  pageSize?: number;
  sort?: LeadSort;
  order?: 'asc' | 'desc';
}

export interface PipelineSummary {
  total: number;
  open: number;
  won: number;
  lost: number;
  totalValue: number;
  weightedValue: number;
  wonValue: number;
  wonValueMonth: number;
  wonCountMonth: number;
  conversionRate: number;
  avgTicket: number;
  overdue: number;
  dueToday: number;
  rotting: number;
  byStage: Array<{ stageId: number; count: number; value: number; weighted: number }>;
}

export interface BoardColumnPage {
  items: PipelineLead[];
  nextCursor: string | null;
  count: number;
  value: number;
  weighted: number;
}

export interface PipelineLeadPage {
  items: PipelineLead[];
  total: number;
  page: number;
  pageSize: number;
}

/** PATCH /crm-pipelines/leads/:id/stage. expectedVersion e obrigatorio (409 se o lead mudou). */
export interface MoveStageInput {
  expectedVersion: number;
  stageId: number;
  beforeId?: number;
  afterId?: number;
  amount?: number | null;
  expectedCloseAt?: string | null;
  nextActionAt?: string | null;
  lostReason?: string | null;
  lostReasonId?: number | null;
  lostNote?: string | null;
  ownerId?: number | null;
}

export type BulkAction = 'move' | 'assign' | 'addTag' | 'removeTag' | 'archive';

export interface BulkActionInput {
  action: BulkAction;
  ids?: number[];
  scope?: { filters: LeadFilters; stageId?: number; excludedIds?: number[] };
  payload: { stageId?: number; ownerId?: number; tagId?: number; lostReasonId?: number; lostNote?: string };
}

/** Campos editaveis via PATCH /crm-leads/:id (inclui tagIds, probability e temperature). */
export type LeadPatch = Partial<LeadInput> & {
  expectedCloseAt?: string | null;
  probability?: number | null;
  temperature?: Temperature | null;
};

export interface LeadReports {
  period: { from: string; to: string };
  funnel: Array<{ stageId: number; name: string; color: string; type: StageKind; reached: number; current: number }>;
  stageDurations: Array<{ stageId: number; name: string; avgDays: number }>;
  lostReasons: Array<{ label: string; count: number }>;
  sellers: Array<{ ownerId: number; name: string; open: number; won: number; lost: number; wonValue: number; conversionRate: number }>;
  monthly: Array<{ month: string; created: number; won: number; lost: number; wonValue: number }>;
  totals: { created: number; won: number; lost: number; wonValue: number; conversionRate: number; avgCycleDays: number };
}

/**
 * Converte filtros em query string. Arrays viram CSV, vazios e `false` sao ignorados.
 */
export function filtersToQuery(f: object): URLSearchParams {
  const params = new URLSearchParams();
  (Object.entries(f) as [string, unknown][]).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    if (Array.isArray(value)) {
      const items = value.filter((v) => v !== undefined && v !== null && v !== '');
      if (items.length) params.set(key, items.join(','));
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

const withQuery = (path: string, params?: URLSearchParams) => {
  const qs = params?.toString();
  return qs ? `${path}?${qs}` : path;
};

const call = <T>(path: string, init?: RequestInit): Promise<T> => apiRequest(path, init) as Promise<T>;

const sendJson = <T>(method: string, path: string, body?: unknown): Promise<T> =>
  call<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

/** Erro de API com status HTTP e campos faltantes (400 de requiredFields). */
export class PipelineApiError extends Error {
  status: number;
  fields: string[];
  leadIds: number[];
  constructor(status: number, message: string, fields: string[] = [], leadIds: number[] = []) {
    super(message);
    this.name = 'PipelineApiError';
    this.status = status;
    this.fields = fields;
    this.leadIds = leadIds;
  }
}

/** Como sendJson, mas preserva o status e o corpo de erro (409 de versao, 400 de campos). */
async function sendWithStatus<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 401) {
    throw new PipelineApiError(401, 'Sua sessão expirou. Entre novamente.');
  }
  if (!response.ok) {
    const data: { message?: string | string[]; fields?: string[]; leadIds?: number[] } = await response.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new PipelineApiError(response.status, message || `API Error: ${response.statusText}`, data.fields ?? [], data.leadIds ?? []);
  }
  const text = await response.text();
  return (text.trim() ? JSON.parse(text) : null) as T;
}

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Funil geral padrao com as etapas ativas em ordem de posicao. */
export interface GeneralFunnel {
  pipeline: CrmPipeline;
  stages: PipelineStage[];
}

/** Probabilidade padrao quando a API nao envia (WON 100, LOST 0, demais 0). */
const defaultProbability = (type: StageKind) => (type === 'WON' ? 100 : 0);

export function pickGeneralFunnel(pipelines: CrmPipeline[]): GeneralFunnel | null {
  const pipeline = pipelines.find((p) => p.productInterest === null && p.isDefault && p.isActive);
  if (!pipeline) return null;
  const stages: PipelineStage[] = pipeline.stages
    .filter((s) => s.isActive)
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const extra = s as Partial<PipelineStage>;
      return {
        ...s,
        probability: extra.probability ?? defaultProbability(s.type),
        rotDays: extra.rotDays ?? null,
      };
    });
  return { pipeline, stages };
}

export const pipelineApi = {
  /** GET /crm-pipelines (producao). */
  pipelines: () => crmLeadsApi.listPipelines(),

  /** Funil geral padrao (productInterest nulo, isDefault, ativo) com suas etapas ativas. */
  generalFunnel: async (): Promise<GeneralFunnel | null> => pickGeneralFunnel(await crmLeadsApi.listPipelines()),

  summary: (f: LeadFilters) => call<PipelineSummary>(withQuery('/crm-pipelines/leads/summary', filtersToQuery(f))),

  boardColumn: (stageId: number, f: LeadFilters, cursor?: string | null, limit = 30) => {
    const params = filtersToQuery(f);
    params.delete('stageId');
    if (cursor) params.set('cursor', cursor);
    params.set('limit', String(limit));
    return call<BoardColumnPage>(withQuery(`/crm-pipelines/leads/board/${stageId}`, params));
  },

  moveStage: (leadId: number, input: MoveStageInput) =>
    sendWithStatus<PipelineLead>('PATCH', `/crm-pipelines/leads/${leadId}/stage`, input),

  tags: () => crmLeadsApi.listTags(),
  createTag: (body: { name: string; color?: string; description?: string }) => crmLeadsApi.createTag(body),
  updateTag: (id: number, body: { name?: string; color?: string; description?: string | null; isActive?: boolean }) =>
    crmLeadsApi.updateTag(id, body),

  lostReasons: (all = false) => call<LostReason[]>(`/crm-pipelines/lost-reasons${all ? '?all=true' : ''}`),
  saveLostReasons: (reasons: Array<{ id?: number; label: string; active: boolean; position: number }>) =>
    sendJson<LostReason[]>('PUT', '/crm-pipelines/lost-reasons', { reasons }),

  list: (params: LeadListParams) => call<PipelineLeadPage>(withQuery('/crm-leads', filtersToQuery(params))),

  /** PATCH /crm-leads/:id: tagIds, probability e temperature (demais campos do lead). */
  update: (id: number, patch: LeadPatch) => sendJson<PipelineLead>('PATCH', `/crm-leads/${id}`, patch),

  bulk: (input: BulkActionInput) => sendWithStatus<{ updated: number }>('POST', '/crm-pipelines/leads/bulk', input),

  /** Baixa o CSV de leads filtrados (supervisor). Retorna o Blob e dispara o download. */
  exportCsv: async (f: LeadFilters): Promise<Blob> => {
    const response = await fetch(withQuery(`${API_URL}/crm-pipelines/leads/export`, filtersToQuery(f)), {
      headers: getAuthHeaders(),
      signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(60000) : undefined,
    });
    if (!response.ok) {
      const data: { message?: string | string[] } = await response.json().catch(() => ({}));
      const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(message || `API Error: ${response.statusText}`);
    }
    const blob = await response.blob();
    downloadBlob(blob, `leads-${todayIso()}.csv`);
    return blob;
  },

  reports: (params: { from?: string; to?: string; ownerId?: number } = {}) =>
    call<LeadReports>(withQuery('/crm-pipelines/reports', filtersToQuery(params))),
};
