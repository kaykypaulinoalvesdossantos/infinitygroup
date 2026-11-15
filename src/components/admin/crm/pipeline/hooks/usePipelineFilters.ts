'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type {
  FollowUpFilter,
  LeadFilters,
  LeadSort,
  OutcomeFilter,
  Temperature,
} from '@/services/crm-pipeline';
import type { ProductInterest } from '@/services/crm-leads';

export type PipelineView = 'kanban' | 'list';

/** Estado dos filtros do pipeline. Fica sincronizado com a URL. */
export interface PipelineFilterState {
  view: PipelineView;
  q: string;
  ownerId: number | undefined;
  tagIds: number[];
  untagged: boolean;
  productInterest: ProductInterest | undefined;
  source: string[];
  temperature: Temperature[];
  valueMin: number | undefined;
  valueMax: number | undefined;
  createdFrom: string | undefined;
  createdTo: string | undefined;
  followUp: FollowUpFilter | undefined;
  interactionStatus: string[];
  rotting: boolean;
  outcome: OutcomeFilter | undefined;
  sort: LeadSort | undefined;
  order: 'asc' | 'desc' | undefined;
  page: number;
  leadId: number | null;
}

/** Chaves curtas usadas na URL (?q=&owner=&tags=&view=&lead=...). */
const URL_KEYS = {
  view: 'view',
  q: 'q',
  ownerId: 'owner',
  tagIds: 'tags',
  productInterest: 'produto',
  untagged: 'untagged',
  source: 'source',
  temperature: 'temp',
  valueMin: 'min',
  valueMax: 'max',
  createdFrom: 'from',
  createdTo: 'to',
  followUp: 'follow',
  interactionStatus: 'ist',
  rotting: 'rot',
  outcome: 'outcome',
  sort: 'sort',
  order: 'order',
  page: 'page',
  leadId: 'lead',
} as const;

const ALL_URL_KEYS = Object.values(URL_KEYS);

const PRODUCT_KEYS: ProductInterest[] = ['TELECOM', 'SEGUROS'];
const FOLLOW_UPS: FollowUpFilter[] = ['overdue', 'today', 'week', 'none'];
const OUTCOMES: OutcomeFilter[] = ['open', 'won', 'lost', 'all'];
const SORTS: LeadSort[] = ['updatedAt', 'createdAt', 'value', 'nextActionAt', 'name'];
const TEMPERATURES: Temperature[] = ['COLD', 'WARM', 'HOT'];

const DEFAULT_STATE: PipelineFilterState = {
  view: 'kanban',
  q: '',
  ownerId: undefined,
  tagIds: [],
  untagged: false,
  productInterest: undefined,
  source: [],
  temperature: [],
  valueMin: undefined,
  valueMax: undefined,
  createdFrom: undefined,
  createdTo: undefined,
  followUp: undefined,
  interactionStatus: [],
  rotting: false,
  outcome: undefined,
  sort: undefined,
  order: undefined,
  page: 1,
  leadId: null,
};

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  allowed.find((item) => item === value);

const csv = (value: string | null): string[] => (value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []);

const csvNumbers = (value: string | null): number[] =>
  csv(value).map(Number).filter((n) => Number.isInteger(n) && n > 0);

const num = (value: string | null): number | undefined => {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isDate = (value: string | null): string | undefined => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);

function parseState(sp: URLSearchParams): PipelineFilterState {
  const id = num(sp.get(URL_KEYS.leadId));
  const page = num(sp.get(URL_KEYS.page));
  return {
    view: sp.get(URL_KEYS.view) === 'list' ? 'list' : 'kanban',
    q: sp.get(URL_KEYS.q)?.trim() ?? '',
    ownerId: num(sp.get(URL_KEYS.ownerId)),
    tagIds: csvNumbers(sp.get(URL_KEYS.tagIds)),
    untagged: sp.get(URL_KEYS.untagged) === '1',
    productInterest: pick(sp.get(URL_KEYS.productInterest), PRODUCT_KEYS),
    source: csv(sp.get(URL_KEYS.source)),
    temperature: csv(sp.get(URL_KEYS.temperature)).filter((t): t is Temperature =>
      TEMPERATURES.includes(t as Temperature),
    ),
    valueMin: num(sp.get(URL_KEYS.valueMin)),
    valueMax: num(sp.get(URL_KEYS.valueMax)),
    createdFrom: isDate(sp.get(URL_KEYS.createdFrom)),
    createdTo: isDate(sp.get(URL_KEYS.createdTo)),
    followUp: pick(sp.get(URL_KEYS.followUp), FOLLOW_UPS),
    interactionStatus: csv(sp.get(URL_KEYS.interactionStatus)),
    rotting: sp.get(URL_KEYS.rotting) === '1',
    outcome: pick(sp.get(URL_KEYS.outcome), OUTCOMES),
    sort: pick(sp.get(URL_KEYS.sort), SORTS),
    order: sp.get(URL_KEYS.order) === 'asc' ? 'asc' : sp.get(URL_KEYS.order) === 'desc' ? 'desc' : undefined,
    page: page && page > 0 ? Math.floor(page) : 1,
    leadId: id && id > 0 ? id : null,
  };
}

/** Escreve apenas os valores que diferem do padrao; preserva parametros desconhecidos. */
function writeState(state: PipelineFilterState, base: URLSearchParams): URLSearchParams {
  const sp = new URLSearchParams(base);
  ALL_URL_KEYS.forEach((key) => sp.delete(key));
  const put = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === '') return;
    sp.set(key, String(value));
  };
  if (state.view !== DEFAULT_STATE.view) put(URL_KEYS.view, state.view);
  put(URL_KEYS.q, state.q.trim());
  put(URL_KEYS.ownerId, state.ownerId);
  if (state.tagIds.length) put(URL_KEYS.tagIds, state.tagIds.join(','));
  if (state.untagged) put(URL_KEYS.untagged, '1');
  put(URL_KEYS.productInterest, state.productInterest);
  if (state.source.length) put(URL_KEYS.source, state.source.join(','));
  if (state.temperature.length) put(URL_KEYS.temperature, state.temperature.join(','));
  put(URL_KEYS.valueMin, state.valueMin);
  put(URL_KEYS.valueMax, state.valueMax);
  put(URL_KEYS.createdFrom, state.createdFrom);
  put(URL_KEYS.createdTo, state.createdTo);
  put(URL_KEYS.followUp, state.followUp);
  if (state.interactionStatus.length) put(URL_KEYS.interactionStatus, state.interactionStatus.join(','));
  if (state.rotting) put(URL_KEYS.rotting, '1');
  put(URL_KEYS.outcome, state.outcome);
  put(URL_KEYS.sort, state.sort);
  put(URL_KEYS.order, state.order);
  if (state.page > 1) put(URL_KEYS.page, state.page);
  put(URL_KEYS.leadId, state.leadId);
  return sp;
}

/** Chaves que nao resetam a pagina ao mudar. */
const KEYS_KEEP_PAGE: ReadonlyArray<keyof PipelineFilterState> = ['page', 'view', 'leadId'];

export interface UsePipelineFiltersResult extends PipelineFilterState {
  /** Atualiza um campo, volta para a pagina 1 (exceto view/leadId/page) e grava na URL. */
  setFilter: <K extends keyof PipelineFilterState>(key: K, value: PipelineFilterState[K]) => void;
  /** Limpa todos os filtros (mantem a visao). */
  clearFilters: () => void;
  /** Quantidade de filtros avancados ativos (sem busca). */
  activeFilterCount: number;
  /** Filtros no formato da API. */
  apiFilters: LeadFilters;
  /** Valor digitado na busca (antes do debounce de 300ms). */
  searchInput: string;
  setSearchInput: (value: string) => void;
  openLead: (id: number) => void;
  closeLead: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

/** Estado dos filtros do pipeline sincronizado com a URL (?q=&owner=&tags=&view=&lead=). */
export function usePipelineFilters(): UsePipelineFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => parseState(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [searchInput, setSearchInput] = useState(state.q);

  // Ultimo estado gravado e ainda nao refletido em searchParams. Evita que duas chamadas
  // seguidas de setFilter (ex.: tags + sem etiqueta) leiam a URL antiga e se sobrescrevam.
  const pendingRef = useRef<PipelineFilterState | null>(null);

  const writeUrl = useCallback(
    (next: PipelineFilterState) => {
      const base = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
      const qs = writeState(next, base).toString();
      pendingRef.current = next;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  // Quando a URL alcanca o estado gravado, descarta o pendente
  useEffect(() => {
    pendingRef.current = null;
  }, [searchParams]);

  const readCurrent = useCallback(
    (): PipelineFilterState =>
      pendingRef.current ?? parseState(new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)),
    [],
  );

  const setFilter = useCallback<UsePipelineFiltersResult['setFilter']>(
    (key, value) => {
      // Parte do estado mais recente (URL ou gravacao pendente) para nao perder atualizacoes do mesmo ciclo
      const current = readCurrent();
      const next: PipelineFilterState = { ...current, [key]: value };
      if (!KEYS_KEEP_PAGE.includes(key)) next.page = 1;
      writeUrl(next);
    },
    [writeUrl, readCurrent],
  );

  // Busca: aplica no estado depois de 300ms sem digitar
  useEffect(() => {
    setSearchInput(state.q);
  }, [state.q]);

  useEffect(() => {
    if (searchInput.trim() === state.q) return;
    const timer = setTimeout(() => setFilter('q', searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, state.q, setFilter]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    const current = readCurrent();
    writeUrl({ ...DEFAULT_STATE, view: current.view, leadId: current.leadId });
  }, [writeUrl, readCurrent]);

  const openLead = useCallback((id: number) => setFilter('leadId', id), [setFilter]);
  const closeLead = useCallback(() => setFilter('leadId', null), [setFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.ownerId !== undefined) count += 1;
    if (state.tagIds.length || state.untagged) count += 1;
    if (state.productInterest) count += 1;
    if (state.source.length) count += 1;
    if (state.temperature.length) count += 1;
    if (state.valueMin !== undefined || state.valueMax !== undefined) count += 1;
    if (state.createdFrom || state.createdTo) count += 1;
    if (state.followUp) count += 1;
    if (state.interactionStatus.length) count += 1;
    if (state.rotting) count += 1;
    if (state.outcome && state.outcome !== 'all') count += 1;
    return count;
  }, [state]);

  const apiFilters = useMemo<LeadFilters>(
    () => ({
      search: state.q || undefined,
      ownerId: state.ownerId,
      tagIds: state.tagIds.length ? state.tagIds : undefined,
      untagged: state.untagged || undefined,
      productInterest: state.productInterest,
      source: state.source.length ? state.source : undefined,
      temperature: state.temperature.length ? state.temperature : undefined,
      valueMin: state.valueMin,
      valueMax: state.valueMax,
      createdFrom: state.createdFrom,
      createdTo: state.createdTo,
      followUp: state.followUp,
      interactionStatus: state.interactionStatus.length ? state.interactionStatus : undefined,
      rotting: state.rotting || undefined,
      outcome: state.outcome,
    }),
    [state],
  );

  return {
    ...state,
    setFilter,
    clearFilters,
    activeFilterCount,
    apiFilters,
    searchInput,
    setSearchInput,
    openLead,
    closeLead,
  };
}
