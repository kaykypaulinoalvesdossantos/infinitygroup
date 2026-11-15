import type { LeadFilters, LeadListParams } from '@/services/crm-pipeline';

/** Fabricas de query keys do pipeline. Prefixo comum: ['pipeline']. */
export const pipelineKeys = {
  all: ['pipeline'] as const,
  funnel: () => ['pipeline', 'funnel'] as const,
  tags: () => ['pipeline', 'tags'] as const,
  lostReasons: (all = false) => ['pipeline', 'lost-reasons', { all }] as const,
  summary: (filters: LeadFilters) => ['pipeline', 'summary', filters] as const,
  /** Prefixo de todas as colunas (usar em invalidacao e leitura de caches). */
  columns: () => ['pipeline', 'column'] as const,
  column: (stageId: number, filters: LeadFilters) => ['pipeline', 'column', stageId, filters] as const,
  lead: (id: number) => ['pipeline', 'lead', id] as const,
  list: (params: LeadListParams) => ['pipeline', 'list', params] as const,
  reports: (params: { from?: string; to?: string; ownerId?: number }) => ['pipeline', 'reports', params] as const,
};
