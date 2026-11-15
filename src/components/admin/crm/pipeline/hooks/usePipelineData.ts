'use client';

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { pipelineApi, type LeadFilters, type LeadListParams } from '@/services/crm-pipeline';
import { pipelineKeys } from '../queryKeys';

const STAGE_STALE_MS = 5 * 60 * 1000;
const COLUMN_PAGE_SIZE = 30;

/** Funil geral padrao (pipeline + etapas ativas). Cache longo: muda pouco. */
export function useFunnel() {
  return useQuery({
    queryKey: pipelineKeys.funnel(),
    queryFn: () => pipelineApi.generalFunnel(),
    staleTime: STAGE_STALE_MS,
  });
}

/** Etapas ativas do funil geral, ordenadas por posicao. */
export function useStages() {
  const query = useFunnel();
  return { ...query, data: query.data?.stages };
}

/** Etiquetas do lead (ativas e inativas; filtre isActive onde for escolher). */
export function useTags() {
  return useQuery({
    queryKey: pipelineKeys.tags(),
    queryFn: () => pipelineApi.tags(),
    staleTime: STAGE_STALE_MS,
  });
}

/** Motivos de perda. */
export function useLostReasons(all = false) {
  return useQuery({
    queryKey: pipelineKeys.lostReasons(all),
    queryFn: () => pipelineApi.lostReasons(all),
    staleTime: STAGE_STALE_MS,
  });
}

/** KPIs do funil com os mesmos filtros do board. Mantem dados anteriores ao trocar filtro. */
export function usePipelineSummary(filters: LeadFilters) {
  return useQuery({
    queryKey: pipelineKeys.summary(filters),
    queryFn: () => pipelineApi.summary(filters),
    placeholderData: keepPreviousData,
  });
}

/** Uma coluna do board (etapa por stageId) paginada por cursor ("carregar mais"). */
export function useStageColumn(stageId: number, filters: LeadFilters) {
  return useInfiniteQuery({
    queryKey: pipelineKeys.column(stageId, filters),
    queryFn: ({ pageParam }) => pipelineApi.boardColumn(stageId, filters, pageParam, COLUMN_PAGE_SIZE),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Number.isFinite(stageId) && stageId > 0,
  });
}

/** Lista paginada (visao em tabela). */
export function useLeadList(params: LeadListParams) {
  return useQuery({
    queryKey: pipelineKeys.list(params),
    queryFn: () => pipelineApi.list(params),
    placeholderData: keepPreviousData,
  });
}
