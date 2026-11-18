'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle, Plus, RotateCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getStoredUser, isSalesRole, isSupervisorRole, teamApi, type CrmLead, type TeamUser } from '@/services/crm-leads';
import { telephonyService } from '@/services/telephony';
import { errorMessage, formatCurrencyBRL } from '@/components/admin/crm/format';
import { NewLeadDialog } from '@/components/admin/crm/lead-dialogs';
import { LeadTagsDialog } from '@/components/admin/crm/lead-tags-dialog';
import { ImportLeadsDialog } from '@/components/admin/crm/import-leads-dialog';
import type { BoardColumnPage, PipelineLead, PipelineLeadPage, PipelineStage, StageKind } from '@/services/crm-pipeline';
import { RequiredFieldsDialog } from './dialogs/RequiredFieldsDialog';
import { LostReasonsDialog } from './settings/LostReasonsDialog';
import { usePipelineFilters } from './hooks/usePipelineFilters';
import { useHotkeys } from './hooks/useHotkeys';
import { useMoveLead, type MoveLeadVariables } from './hooks/useMoveLead';
import { useBulkSelection } from './hooks/useBulkSelection';
import { useLostReasons, usePipelineSummary, useStages, useTags } from './hooks/usePipelineData';
import { pipelineKeys } from './queryKeys';
import { PipelineHeader } from './header/PipelineHeader';
import { KpiStrip } from './header/KpiStrip';
import { FilterBar } from './header/FilterBar';
import { BoardView, type OutcomeDraft } from './board/BoardView';
import { MobileBoard } from './board/MobileBoard';
import { ListView } from './list/ListView';
import { WonDialog } from './dialogs/WonDialog';
import { LostDialog, type LostOutcome } from './dialogs/LostDialog';
import { ShortcutsDialog } from './dialogs/ShortcutsDialog';
import { LeadDrawer } from './drawer/LeadDrawer';
import { Confetti, type ConfettiBurst } from './ui/Confetti';
import { BulkActionBar } from './bulk/BulkActionBar';
import { AdvancedFiltersPopover } from './filters/AdvancedFiltersPopover';
import { PipelineActions } from './header/PipelineActions';
import { useIsMobile } from './hooks/useIsMobile';

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-busy="true" aria-label="Carregando etapas">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="shimmer h-[360px] w-[304px] shrink-0 rounded-2xl" />
      ))}
    </div>
  );
}

/** Pagina do pipeline v2: orquestra cabecalho, indicadores, filtros, visao (board ou lista), dialogos e gaveta. */
export function PipelinePage() {
  const queryClient = useQueryClient();
  const filters = usePipelineFilters();
  const searchRef = useRef<HTMLInputElement>(null);
  const move = useMoveLead();
  const selection = useBulkSelection();

  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const isSupervisor = isSupervisorRole(user?.role);
  const [owners, setOwners] = useState<TeamUser[]>([]);

  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [outcome, setOutcome] = useState<OutcomeDraft | null>(null);
  const [callingId, setCallingId] = useState<number | null>(null);
  const [burst, setBurst] = useState<ConfettiBurst | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [advancedRequest, setAdvancedRequest] = useState(0);
  const isMobile = useIsMobile();

  const stagesQuery = useStages();
  const tagsQuery = useTags();
  const tags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);
  const stages = useMemo<PipelineStage[]>(() => stagesQuery.data ?? [], [stagesQuery.data]);
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const lostReasons = useLostReasons(false);
  const activeReasons = useMemo(() => (lostReasons.data ?? []).filter((r) => r.active), [lostReasons.data]);

  // Filtros do board e dos indicadores: sem o escopo de resultado (o board so mostra etapas abertas)
  const boardFilters = useMemo(() => ({ ...filters.apiFilters, outcome: undefined }), [filters.apiFilters]);
  const summary = usePipelineSummary(boardFilters);
  const filtered = filters.activeFilterCount > 0 || filters.q.length > 0;
  const stageTotals = useMemo<Record<number, number>>(
    () => Object.fromEntries((summary.data?.byStage ?? []).map((row) => [row.stageId, row.count])),
    [summary.data],
  );

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!isSupervisor) return;
    teamApi
      .list()
      .then((all) => setOwners(all.filter((u) => u.active && isSalesRole(u.role))))
      .catch((err) => toast.error(errorMessage(err, 'Não foi possível carregar os responsáveis.')));
  }, [isSupervisor]);

  const invalidatePipeline = useCallback(
    () => queryClient.invalidateQueries({ queryKey: pipelineKeys.all }),
    [queryClient],
  );

  const handleCall = useCallback(async (lead: Pick<CrmLead, 'id' | 'phone'> & Partial<Pick<CrmLead, 'phone2'>>) => {
    if (!lead.phone && !lead.phone2) {
      toast.error('Este lead não tem telefone cadastrado.');
      return;
    }
    setCallingId(lead.id);
    try {
      await telephonyService.callLead(lead.id);
      toast.success('Ligação enviada para o seu celular.');
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível iniciar a ligação.'));
    } finally {
      setCallingId(null);
    }
  }, []);

  /** Movimento entre etapas abertas: grava na hora (com rollback) e oferece desfazer entre colunas. */
  const handleMove = useCallback(
    (vars: MoveLeadVariables) => {
      move.move(vars);
      if (vars.fromId === vars.toId) return;
      const target = stageById.get(vars.toId)?.name ?? 'nova etapa';
      toast(`${vars.lead.name} movido para ${target}`, {
        duration: 5000,
        action: {
          label: 'Desfazer',
          onClick: () =>
            move.undoMove(
              { ...vars.lead, funnelStage: stageById.get(vars.toId) ?? vars.lead.funnelStage, funnelVersion: (vars.lead.funnelVersion ?? 1) + 1 } as PipelineLead,
              vars.fromId,
            ),
        },
      });
    },
    [move, stageById],
  );

  const handleOutcomeRequest = useCallback((draft: OutcomeDraft) => setOutcome(draft), []);

  /** Procura o lead nas colunas e na lista carregadas (cache do React Query). */
  const findPipelineLead = useCallback(
    (leadId: number): PipelineLead | undefined => {
      const columns = queryClient.getQueriesData<InfiniteData<BoardColumnPage>>({ queryKey: pipelineKeys.columns() });
      for (const [, data] of columns) {
        const found = data?.pages.flatMap((p) => p.items).find((item) => item.id === leadId);
        if (found) return found;
      }
      const lists = queryClient.getQueriesData<PipelineLeadPage>({ queryKey: ['pipeline', 'list'] });
      for (const [, data] of lists) {
        const found = data?.items.find((item) => item.id === leadId);
        if (found) return found;
      }
      return undefined;
    },
    [queryClient],
  );

  /** Ganho/Perdido pedido pela gaveta: mesmo dialogo do arraste, sem posicao especifica (topo da etapa). */
  const requestOutcomeFor = useCallback(
    (lead: CrmLead, kind: 'WON' | 'LOST') => {
      const target = stages.find((s) => s.type === kind);
      if (!target) {
        toast.error(kind === 'WON' ? 'Etapa de ganho não configurada.' : 'Etapa de perda não configurada.');
        return;
      }
      const pipelineLead = findPipelineLead(lead.id) ?? toPipelineLead(lead);
      setOutcome({ lead: pipelineLead, fromId: (pipelineLead.funnelStage?.id ?? 0), toId: target.id, kind, toIndex: 0 });
    },
    [stages, findPipelineLead],
  );

  const clearBurst = useCallback(() => setBurst(null), []);

  const confirmWon = (value: number) => {
    if (!outcome) return;
    const draft = outcome;
    setOutcome(null);
    move.mutate({
      lead: draft.lead,
      fromId: draft.fromId,
      toId: draft.toId,
      toIndex: draft.toIndex,
      beforeId: draft.beforeId,
      afterId: draft.afterId,
      value,
    });
    if (draft.origin) setBurst({ id: Date.now(), x: draft.origin.x, y: draft.origin.y });
    toast.success(`🎉 Negócio ganho: ${formatCurrencyBRL(value)}`);
  };

  const confirmLost = (result: LostOutcome) => {
    if (!outcome) return;
    const draft = outcome;
    setOutcome(null);
    move.mutate({
      lead: draft.lead,
      fromId: draft.fromId,
      toId: draft.toId,
      toIndex: draft.toIndex,
      beforeId: draft.beforeId,
      afterId: draft.afterId,
      lostReasonId: result.lostReasonId,
      lostNote: result.lostNote,
    });
    toast.success('Lead marcado como perdido.');
  };

  /** Ids na ordem visivel (coluna ou lista) para navegar na gaveta com as setas. Lidos do cache ao abrir o lead. */
  const siblingIds = (() => {
    if (filters.leadId === null) return [] as number[];
    if (filters.view === 'list') {
      const lists = queryClient.getQueriesData<PipelineLeadPage>({ queryKey: ['pipeline', 'list'] });
      for (const [, data] of lists) {
        if (data?.items.some((item) => item.id === filters.leadId)) return data.items.map((item) => item.id);
      }
      return [] as number[];
    }
    const columns = queryClient.getQueriesData<InfiniteData<BoardColumnPage>>({ queryKey: pipelineKeys.columns() });
    for (const [, data] of columns) {
      const ids = data?.pages.flatMap((p) => p.items.map((item) => item.id)) ?? [];
      if (ids.includes(filters.leadId)) return ids;
    }
    return [] as number[];
  })();

  const modalOpen = newOpen || importOpen || outcome !== null || tagsOpen || reasonsOpen || shortcutsOpen;
  useHotkeys(
    {
      n: () => setNewOpen(true),
      '/': () => {
        if (filters.leadId === null) searchRef.current?.focus();
      },
      f: () => {
        // Filtros avancados so existem no desktop (no celular ficam na folha "Filtros")
        if (!isMobile) setAdvancedRequest((n) => n + 1);
      },
      '?': () => setShortcutsOpen(true),
      Escape: () => {
        if (filters.leadId !== null) filters.closeLead();
      },
    },
    !modalOpen,
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div className="admin-page">
        <PipelineHeader
          view={filters.view}
          onViewChange={(v) => filters.setFilter('view', v)}
          onImport={() => setImportOpen(true)}
          onNewLead={() => setNewOpen(true)}
          actionsSlot={
            <PipelineActions
              isSupervisor={isSupervisor}
              filters={filters.apiFilters}
              onOpenLostReasons={() => setReasonsOpen(true)}
              onOpenTags={() => setTagsOpen(true)}
              onImport={() => setImportOpen(true)}
            />
          }
          mobileActionsSlot={
            <PipelineActions
              variant="menu"
              isSupervisor={isSupervisor}
              filters={filters.apiFilters}
              onOpenLostReasons={() => setReasonsOpen(true)}
              onOpenTags={() => setTagsOpen(true)}
              onImport={() => setImportOpen(true)}
            />
          }
        />

        <KpiStrip
          summary={summary.data}
          loading={summary.isFetching}
          overdueActive={filters.followUp === 'overdue'}
          rottingActive={filters.rotting}
          onToggleOverdue={() => filters.setFilter('followUp', filters.followUp === 'overdue' ? undefined : 'overdue')}
          onToggleRotting={() => filters.setFilter('rotting', !filters.rotting)}
        />

        <FilterBar
          filters={filters}
          isSupervisor={isSupervisor}
          owners={owners}
          searchRef={searchRef}
          advancedSlot={<AdvancedFiltersPopover filters={filters} openRequest={advancedRequest} />}
        />

        {stagesQuery.isError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              Não foi possível carregar as etapas do funil.
              <Button type="button" size="sm" variant="outline" onClick={() => stagesQuery.refetch()}>
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Tentar de novo
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {filters.view === 'kanban' ? (
          stagesQuery.isPending ? (
            <BoardSkeleton />
          ) : isMobile ? (
            <MobileBoard
              stages={stages}
              filters={boardFilters}
              followUp={filters.followUp}
              onFollowUpChange={(value) => filters.setFilter('followUp', value)}
              summary={summary.data}
              stageTotals={stageTotals}
              filtered={filtered}
              isSupervisor={isSupervisor}
              callingId={callingId}
              selection={selection}
              onCall={handleCall}
              onOpen={filters.openLead}
              onAdd={() => setNewOpen(true)}
              onMove={handleMove}
              onOutcomeRequest={handleOutcomeRequest}
            />
          ) : (
            <BoardView
              stages={stages}
              filters={boardFilters}
              filtered={filtered}
              isSupervisor={isSupervisor}
              callingId={callingId}
              selection={selection}
              totalValue={summary.data?.totalValue ?? 0}
              onCall={handleCall}
              onOpen={filters.openLead}
              onAdd={() => setNewOpen(true)}
              onMove={handleMove}
              onOutcomeRequest={handleOutcomeRequest}
            />
          )
        ) : (
          <ListView
            filters={filters}
            stages={stages}
            isSupervisor={isSupervisor}
            callingId={callingId}
            selection={selection}
            onCall={handleCall}
            onOpen={filters.openLead}
          />
        )}

        <WonDialog
          open={outcome?.kind === 'WON'}
          lead={outcome?.kind === 'WON' ? outcome.lead : null}
          onCancel={() => setOutcome(null)}
          onConfirm={confirmWon}
        />
        <LostDialog
          open={outcome?.kind === 'LOST'}
          lead={outcome?.kind === 'LOST' ? outcome.lead : null}
          reasons={activeReasons}
          reasonsLoading={lostReasons.isPending}
          onCancel={() => setOutcome(null)}
          onConfirm={confirmLost}
        />

        <NewLeadDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          isSupervisor={isSupervisor}
          owners={owners}
          tags={tags.filter((t) => t.isActive)}
          onCreated={() => invalidatePipeline()}
        />
        <ImportLeadsDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          isSupervisor={isSupervisor}
          owners={owners}
          tags={tags.filter((t) => t.isActive)}
          onImported={() => invalidatePipeline()}
        />

        <BulkActionBar
          selection={selection}
          filters={filters.apiFilters}
          stages={stages}
          stageTotals={stageTotals}
          isSupervisor={isSupervisor}
          owners={owners}
          escapeEnabled={filters.leadId === null && !modalOpen}
        />

        {isMobile && !selection.hasSelection && (
          <Button
            type="button"
            onClick={() => setNewOpen(true)}
            aria-label="Novo lead"
            className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-30 h-14 gap-2 rounded-full bg-[hsl(var(--brand))] px-5 text-base text-primary-foreground shadow-xl hover:bg-[hsl(var(--brand)/0.9)]"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Novo lead
          </Button>
        )}

        <LeadTagsDialog
          open={tagsOpen}
          onOpenChange={setTagsOpen}
          onChanged={async () => {
            await queryClient.invalidateQueries({ queryKey: pipelineKeys.tags() });
            await invalidatePipeline();
          }}
        />
        <LostReasonsDialog open={reasonsOpen} onOpenChange={setReasonsOpen} />
        <RequiredFieldsDialog isSupervisor={isSupervisor} owners={owners} />
        <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

        <Confetti burst={burst} onDone={clearBurst} />

        <LeadDrawer
          leadId={filters.leadId}
          onClose={filters.closeLead}
          siblingIds={siblingIds}
          onNavigate={filters.openLead}
          isSupervisor={isSupervisor}
          owners={owners}
          onCall={handleCall}
          callingId={callingId}
          onRequestOutcome={requestOutcomeFor}
        />
      </div>
    </TooltipProvider>
  );
}

/** Converte um CrmLead (ex.: vindo da gaveta sem cache) em PipelineLead com padroes seguros. */
function toPipelineLead(lead: CrmLead): PipelineLead {
  return {
    ...lead,
    funnelStage: lead.funnelStage ? { ...lead.funnelStage, type: lead.funnelStage.type as StageKind } : null,
    tags: lead.tags,
    interactionStatus: null,
    probability: null,
    effectiveProbability: 0,
    temperature: null,
    stageEnteredAt: null,
    boardPosition: null,
    wonAt: null,
    lostAt: null,
    lostReasonId: null,
  };
}
