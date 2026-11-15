'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Inbox, Loader2, RotateCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { pipelineApi, type FollowUpFilter, type LeadFilters, type PipelineLead, type PipelineStage, type PipelineSummary } from '@/services/crm-pipeline';
import { useStageColumn } from '../hooks/usePipelineData';
import type { useBulkSelection } from '../hooks/useBulkSelection';
import type { MoveLeadVariables } from '../hooks/useMoveLead';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { EmptyState } from '../ui/EmptyState';
import { MobileLeadCard } from './MobileLeadCard';
import { MobileMoveSheet } from './MobileMoveSheet';
import type { OutcomeDraft } from './BoardView';

type Selection = ReturnType<typeof useBulkSelection>;

const QUEUE_PAGE_SIZE = 25;

interface MobileBoardProps {
  stages: PipelineStage[];
  /** Filtros do board (sem o escopo de resultado e sem followUp). */
  filters: LeadFilters;
  /** Follow-up ativo na URL: 'today' e 'overdue' sao as abas especiais; qualquer outro valor mostra a etapa. */
  followUp: FollowUpFilter | undefined;
  onFollowUpChange: (value: FollowUpFilter | undefined) => void;
  summary: PipelineSummary | undefined;
  stageTotals: Record<string, number>;
  filtered: boolean;
  isSupervisor: boolean;
  callingId: number | null;
  selection: Selection;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onAdd: () => void;
  onMove: (vars: MoveLeadVariables) => void;
  onOutcomeRequest: (draft: OutcomeDraft) => void;
}

/** Board do celular: abas de etapa roláveis, faixa de atrasados e lista vertical da etapa ou da fila do dia. */
export function MobileBoard({
  stages,
  filters,
  followUp,
  onFollowUpChange,
  summary,
  stageTotals,
  filtered,
  isSupervisor,
  callingId,
  selection,
  onCall,
  onOpen,
  onAdd,
  onMove,
  onOutcomeRequest,
}: MobileBoardProps) {
  const openStages = useMemo(() => stages.filter((s) => s.type === 'OPEN'), [stages]);
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const [activeStageKey, setActiveStageKey] = useState<number | null>(null);
  const stageId = activeStageKey ?? openStages[0]?.id ?? 0;
  const activeStage = stageById.get(stageId);

  const queueMode: 'today' | 'overdue' | null = followUp === 'today' || followUp === 'overdue' ? followUp : null;

  const [moveLead, setMoveLead] = useState<PipelineLead | null>(null);

  const selectStage = (key: number) => {
    setActiveStageKey(key);
    if (followUp) onFollowUpChange(undefined);
  };

  const selectQueue = (mode: 'today' | 'overdue') => onFollowUpChange(mode);

  const handlePickOpen = (stage: PipelineStage) => {
    if (!moveLead) return;
    const lead = moveLead;
    setMoveLead(null);
    if ((lead.funnelStage?.id ?? 0) === stage.id) return;
    onMove({ lead, fromId: (lead.funnelStage?.id ?? 0), toId: stage.id, toIndex: 0 });
  };

  const handlePickOutcome = (stage: PipelineStage) => {
    if (!moveLead) return;
    const lead = moveLead;
    setMoveLead(null);
    onOutcomeRequest({
      lead,
      fromId: (lead.funnelStage?.id ?? 0),
      toId: stage.id,
      kind: stage.type === 'WON' ? 'WON' : 'LOST',
      toIndex: 0,
    });
  };

  const tabs: Array<{ key: string | number; label: string; count: number; active: boolean; onSelect: () => void; color?: string }> = [
    {
      key: 'queue-today',
      label: 'Hoje',
      count: summary?.dueToday ?? 0,
      active: followUp === 'today',
      onSelect: () => selectQueue('today'),
    },
    ...openStages.map((stage) => ({
      key: stage.id,
      label: stage.name,
      count: stageTotals[stage.id] ?? 0,
      active: !queueMode && stage.id === stageId,
      onSelect: () => selectStage(stage.id),
      color: stage.color,
    })),
  ];

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-20 -mx-4 border-b border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-4 pb-2 pt-1">
        <div role="tablist" aria-label="Etapas do funil" className="pipeline-scrollbar -mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 py-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={tab.active}
              onClick={tab.onSelect}
              className={cn(
                'inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
                tab.active
                  ? 'border-transparent bg-primary text-primary-foreground  '
                  : 'border-[hsl(var(--card-border))] text-foreground ',
              )}
            >
              {tab.color && <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tab.color }} />}
              <span>{tab.label}</span>
              <span className={cn('rounded-full px-1.5 text-xs font-semibold tabular-nums', tab.active ? 'bg-card/20 ' : 'bg-muted ')}>
                <AnimatedNumber value={tab.count} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {summary && summary.overdue > 0 && (
        <button
          type="button"
          onClick={() => selectQueue('overdue')}
          aria-pressed={followUp === 'overdue'}
          className={cn(
            'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
            followUp === 'overdue'
              ? 'border-[hsl(var(--urgent))] bg-[hsl(var(--urgent)/0.16)] text-[hsl(var(--urgent))]'
              : 'border-[hsl(var(--urgent)/0.4)] bg-[hsl(var(--urgent)/0.08)] text-[hsl(var(--urgent))]',
          )}
        >
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{summary.overdue} atrasados</span>
          </span>
          <span className="text-xs font-semibold">Ver lista</span>
        </button>
      )}

      {queueMode ? (
        <QueueList
          key={queueMode}
          mode={queueMode}
          filters={filters}
          stageById={stageById}
          isSupervisor={isSupervisor}
          callingId={callingId}
          onCall={onCall}
          onOpen={onOpen}
          onRequestMove={setMoveLead}
        />
      ) : activeStage ? (
        <StageList
          stage={activeStage}
          filters={filters}
          filtered={filtered}
          isSupervisor={isSupervisor}
          callingId={callingId}
          onCall={onCall}
          onOpen={onOpen}
          onAdd={onAdd}
          onRequestMove={setMoveLead}
        />
      ) : (
        <EmptyState icon={Inbox} title="Nenhuma etapa aberta" description="Configure as etapas do funil para ver os leads aqui." />
      )}

      <MobileMoveSheet
        lead={moveLead}
        stages={stages}
        onClose={() => setMoveLead(null)}
        onPickOpen={handlePickOpen}
        onPickOutcome={handlePickOutcome}
      />
    </div>
  );
}

interface StageListProps {
  stage: PipelineStage;
  filters: LeadFilters;
  filtered: boolean;
  isSupervisor: boolean;
  callingId: number | null;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onAdd: () => void;
  onRequestMove: (lead: PipelineLead) => void;
}

/** Lista vertical da etapa ativa (paginacao por cursor com "Carregar mais"). */
function StageList({ stage, filters, filtered, isSupervisor, callingId, onCall, onOpen, onAdd, onRequestMove }: StageListProps) {
  const query = useStageColumn(stage.id, filters);
  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((p) => p.items);
  const count = pages[0]?.count ?? 0;
  const remaining = Math.max(0, count - items.length);

  return (
    <section aria-label={`Leads em ${stage.name}`} className="space-y-0">
      <p className="sr-only" aria-live="polite">
        {count} lead(s) em {stage.name}
      </p>
      {query.isPending && (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando leads">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="shimmer h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground ">Não foi possível carregar esta etapa.</p>
          <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      )}

      {query.isSuccess && items.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={filtered ? 'Nenhum lead com esses filtros' : `Nenhum lead em ${stage.name}`}
          description={filtered ? 'Ajuste ou limpe os filtros para ver mais negócios.' : 'Mova um lead para cá ou crie um novo.'}
          action={
            !filtered ? (
              <Button type="button" size="sm" variant="outline" onClick={onAdd}>
                Adicionar lead
              </Button>
            ) : undefined
          }
        />
      )}

      {items.map((lead) => (
        <MobileLeadCard
          key={lead.id}
          lead={lead}
          stage={stage}
          isSupervisor={isSupervisor}
          callingId={callingId}
          onCall={onCall}
          onOpen={onOpen}
          onRequestMove={onRequestMove}
        />
      ))}

      {query.hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="mt-1 h-11 w-full"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Carregar mais ({remaining})
        </Button>
      )}
    </section>
  );
}

interface QueueListProps {
  mode: 'today' | 'overdue';
  filters: LeadFilters;
  stageById: Map<number, PipelineStage>;
  isSupervisor: boolean;
  callingId: number | null;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onRequestMove: (lead: PipelineLead) => void;
}

/** Fila do dia: leads com follow-up "hoje" ou "atrasado" em todas as etapas abertas, do mais urgente ao menos. */
function QueueList({ mode, filters, stageById, isSupervisor, callingId, onCall, onOpen, onRequestMove }: QueueListProps) {
  const queueFilters = useMemo<LeadFilters>(() => ({ ...filters, followUp: mode, outcome: 'open' }), [filters, mode]);

  const query = useInfiniteQuery({
    queryKey: ['pipeline', 'queue', queueFilters],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      pipelineApi.list({
        ...queueFilters,
        sort: 'nextActionAt',
        order: 'asc',
        page: pageParam,
        pageSize: QUEUE_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (last: { page: number; pageSize: number; total: number }) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const label = mode === 'overdue' ? 'atrasados' : 'para hoje';
  const fallbackStage = (key: number) => stageById.get(key);

  return (
    <section aria-label={mode === 'overdue' ? 'Leads atrasados' : 'Fila de hoje'} className="space-y-0">
      <p className="sr-only" aria-live="polite">
        {total} lead(s) {label}
      </p>
      {query.isPending && (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando fila">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="shimmer h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--urgent))]" aria-hidden="true" />
          <p className="text-sm text-muted-foreground ">Não foi possível carregar a fila.</p>
          <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      )}

      {query.isSuccess && items.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={mode === 'overdue' ? 'Nenhum lead atrasado' : 'Nada para hoje'}
          description="Os leads com próxima ação nesse período aparecem aqui."
        />
      )}

      {items.map((lead) => {
        const stage = fallbackStage(lead.funnelStage?.id ?? 0);
        if (!stage) return null;
        return (
          <MobileLeadCard
            key={lead.id}
            lead={lead}
            stage={stage}
            isSupervisor={isSupervisor}
            callingId={callingId}
            onCall={onCall}
            onOpen={onOpen}
            onRequestMove={onRequestMove}
          />
        );
      })}

      {query.hasNextPage && (
        <Button type="button" variant="outline" className="mt-1 h-11 w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          {query.isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Carregar mais
        </Button>
      )}
    </section>
  );
}
