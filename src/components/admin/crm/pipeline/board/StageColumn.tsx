'use client';

import { memo, useEffect, useRef } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronsRight, Inbox, Loader2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LeadFilters, PipelineLead, PipelineStage } from '@/services/crm-pipeline';
import { useStageColumn } from '../hooks/usePipelineData';
import { isLeavingToLost, useLastDroppedStage } from '../hooks/useMoveLead';
import type { useBulkSelection } from '../hooks/useBulkSelection';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { LeadCard } from './LeadCard';
import { StageColumnHeader } from './StageColumnHeader';

type Selection = ReturnType<typeof useBulkSelection>;

export const CASCADE_LIMIT = 12;
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const INSTANT = { duration: 0 };

/** Pulso leve na coluna de destino ao soltar (so para o movimento ocorrido depois da montagem). */
function DropPulse({ stageId, color }: { stageId: number; color: string }) {
  const dropped = useLastDroppedStage();
  const reduced = useReducedMotion();
  const initialSeq = useRef(dropped?.seq ?? -1);
  if (!dropped || dropped.stageId !== stageId || dropped.seq === initialSeq.current || reduced) return null;
  return (
    <motion.div
      key={dropped.seq}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
      style={{ boxShadow: `inset 0 0 0 2px ${color}`, backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)` }}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
    />
  );
}

/** Saida do cartao para Perdido: fade + scale 0.95. Demais saidas (filtro, outra etapa) sao instantaneas. */
const exitVariants = (leadId: number) => ({
  exit: () => (isLeavingToLost(leadId) ? { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: EASE_OUT } } : INSTANT),
});

interface StageColumnProps {
  stage: PipelineStage;
  filters: LeadFilters;
  /** Ha filtros ativos (muda o texto do estado vazio). */
  filtered: boolean;
  isSupervisor: boolean;
  callingId: number | null;
  selection: Selection;
  collapsed: boolean;
  /** Valor total do funil aberto, para a barra de participacao. */
  totalValue: number;
  onToggleCollapse: () => void;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onAdd: () => void;
}

/** Uma coluna do board: cabecalho, lista paginada por cursor e zona de soltar. */
function StageColumnInner({
  stage,
  filters,
  filtered,
  isSupervisor,
  callingId,
  selection,
  collapsed,
  totalValue,
  onToggleCollapse,
  onCall,
  onOpen,
  onAdd,
}: StageColumnProps) {
  const query = useStageColumn(stage.id, filters);
  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);
  const first = pages[0];
  const count = first?.count ?? 0;
  const value = first?.value ?? 0;
  const weighted = first?.weighted ?? 0;
  const share = totalValue > 0 ? (value / totalValue) * 100 : 0;
  const orderedIds = items.map((item) => item.id);

  // Entrada em cascata so na primeira carga da coluna (nao em cada filtro/atualizacao)
  const cascadeRef = useRef<'pending' | 'done'>('pending');
  const cascade = cascadeRef.current === 'pending' && query.isSuccess;
  useEffect(() => {
    if (query.isSuccess) cascadeRef.current = 'done';
  }, [query.isSuccess]);

  if (collapsed) {
    return (
      <Droppable droppableId={String(stage.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex h-full w-12 shrink-0 flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--column-bg))] py-3 transition-[box-shadow] duration-200',
              snapshot.isDraggingOver && 'shadow-[inset_0_0_0_2px_var(--stage-color)]',
            )}
            style={{ ['--stage-color' as string]: stage.color }}
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={`Expandir coluna ${stage.name} (${count} leads)`}
              className="flex flex-col items-center gap-3 rounded-lg p-1 text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]  "
            >
              <ChevronsRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="h-1 w-6 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />
              <span className="text-xs font-semibold tabular-nums" aria-hidden="true">
                {count}
              </span>
              <span className="whitespace-nowrap text-sm font-semibold [writing-mode:vertical-rl] rotate-180">{stage.name}</span>
            </button>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  const loadedCount = items.length;
  const remaining = Math.max(0, count - loadedCount);

  return (
    <section
      aria-label={`Etapa ${stage.name}`}
      className="relative flex h-full w-full min-w-0 snap-start flex-col rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--column-bg))] px-2 pb-2"
    >
      <DropPulse stageId={stage.id} color={stage.color} />
      <StageColumnHeader
        stage={stage}
        count={count}
        value={value}
        weighted={weighted}
        share={share}
        onCollapse={onToggleCollapse}
        onSelectAll={() => selection.selectColumn(stage.id)}
        columnHasSelection={items.some((item) => selection.isSelected(item.id, stage.id))}
        columnScopeActive={selection.scope?.stageId === stage.id}
      />

      <Droppable droppableId={String(stage.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'mt-3 flex min-h-[160px] flex-1 flex-col overflow-y-auto rounded-xl px-1 pt-1 pipeline-scrollbar transition-[box-shadow,background-color] duration-200',
              snapshot.isDraggingOver && 'bg-[hsl(var(--card-bg)/0.6)] shadow-[inset_0_0_0_2px_var(--stage-color)]',
            )}
            style={{ ['--stage-color' as string]: stage.color }}
          >
            {query.isPending && (
              <div className="space-y-2" aria-busy="true" aria-label="Carregando leads">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="shimmer h-32 w-full rounded-xl" />
                ))}
              </div>
            )}

            {query.isError && (
              <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground ">Não foi possível carregar esta etapa.</p>
                <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>
                  <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Tentar de novo
                </Button>
              </div>
            )}

            {query.isSuccess && items.length === 0 && !snapshot.isDraggingOver && (
              <EmptyState
                icon={Inbox}
                title={filtered ? 'Nenhum lead com esses filtros' : `Nenhum lead em ${stage.name}`}
                description={filtered ? 'Ajuste ou limpe os filtros para ver mais negócios.' : 'Arraste um cartão para cá ou crie um novo lead.'}
                action={
                  !filtered ? (
                    <Button type="button" size="sm" variant="outline" onClick={onAdd}>
                      Adicionar lead
                    </Button>
                  ) : undefined
                }
              />
            )}

            <AnimatePresence initial={false}>
              {items.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  variants={exitVariants(lead.id)}
                  exit="exit"
                  initial={false}
                >
                  <Draggable draggableId={String(lead.id)} index={index}>
                    {(draggableProvided, draggableSnapshot) => (
                      <LeadCard
                        lead={lead}
                        stage={stage}
                        isSupervisor={isSupervisor}
                        callingId={callingId}
                        selected={selection.isSelected(lead.id, stage.id)}
                        selectionActive={selection.hasSelection}
                        cascadeIndex={cascade && index < CASCADE_LIMIT ? index : undefined}
                        provided={draggableProvided}
                        snapshot={draggableSnapshot}
                        onToggleSelect={(target, shift) =>
                          selection.toggle(target.id, { stageId: stage.id, orderedIds, shift })
                        }
                        onCall={onCall}
                        onOpen={onOpen}
                      />
                    )}
                  </Draggable>
                </motion.div>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {query.hasNextPage && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-muted-foreground "
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          Carregar mais <AnimatedNumber value={remaining} className="ml-1" />
        </Button>
      )}
    </section>
  );
}

export const StageColumn = memo(StageColumnInner);
