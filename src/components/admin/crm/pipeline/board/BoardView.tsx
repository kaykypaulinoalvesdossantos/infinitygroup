'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, type DragStart, type DropResult } from '@hello-pangea/dnd';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { MoveLeadVariables } from '../hooks/useMoveLead';
import type { useBulkSelection } from '../hooks/useBulkSelection';
import type { BoardColumnPage, LeadFilters, PipelineLead, PipelineStage } from '@/services/crm-pipeline';
import { pipelineKeys } from '../queryKeys';
import { StageColumn } from './StageColumn';
import { OutcomeDropZones } from './OutcomeDropZones';

type Selection = ReturnType<typeof useBulkSelection>;

const COLLAPSE_KEY = 'pipeline:collapsed-stages';

/** Pedido de Ganho/Perdido vindo do arraste: o dialogo confirma antes de gravar. */
export interface OutcomeDraft {
  lead: PipelineLead;
  fromId: number;
  toId: number;
  kind: 'WON' | 'LOST';
  toIndex: number;
  beforeId?: number;
  afterId?: number;
  /** Centro da zona de soltar, para o confete. */
  origin?: { x: number; y: number };
}

interface BoardViewProps {
  stages: PipelineStage[];
  /** Filtros do board (sem o escopo de resultado). */
  filters: LeadFilters;
  filtered: boolean;
  isSupervisor: boolean;
  callingId: number | null;
  selection: Selection;
  totalValue: number;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onAdd: () => void;
  /** Movimento entre etapas abertas ou reordenacao (gravado na hora, com rollback). */
  onMove: (vars: MoveLeadVariables) => void;
  /** Soltar em Ganho ou Perdido: abre o dialogo correspondente. */
  onOutcomeRequest: (draft: OutcomeDraft) => void;
}

const readCollapsed = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(COLLAPSE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const writeCollapsed = (keys: string[]) => {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify(keys));
  } catch {
    /* sem armazenamento: a preferencia vale so nesta sessao */
  }
};

/** Board do funil: uma coluna por etapa aberta, com zonas Ganho/Perdido e a logica de soltar. */
export function BoardView({
  stages,
  filters,
  filtered,
  isSupervisor,
  callingId,
  selection,
  totalValue,
  onCall,
  onOpen,
  onAdd,
  onMove,
  onOutcomeRequest,
}: BoardViewProps) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([]);

  useEffect(() => {
    setCollapsedKeys(readCollapsed());
  }, []);

  const openStages = useMemo(() => stages.filter((s) => s.type === 'OPEN'), [stages]);
  const wonStage = useMemo(() => stages.find((s) => s.type === 'WON'), [stages]);
  const lostStage = useMemo(() => stages.find((s) => s.type === 'LOST'), [stages]);

  const toggleCollapsed = useCallback((key: string) => {
    setCollapsedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      writeCollapsed(next);
      return next;
    });
  }, []);

  /** Leads carregados de uma coluna, na ordem visivel (lidos do cache do React Query). */
  const loadedItems = useCallback(
    (stageId: number): PipelineLead[] => {
      const data = queryClient.getQueryData<InfiniteData<BoardColumnPage>>(pipelineKeys.column(stageId, filters));
      return data ? data.pages.flatMap((page) => page.items) : [];
    },
    [queryClient, filters],
  );

  const handleDragStart = useCallback((_start: DragStart) => setDragging(true), []);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDragging(false);
      const { source, destination, draggableId } = result;
      if (!destination) return;
      const fromId = Number(source.droppableId);
      const toId = Number(destination.droppableId);
      if (fromId === toId && source.index === destination.index) return;

      const leadId = Number(draggableId);
      const lead = loadedItems(fromId).find((item) => item.id === leadId);
      if (!lead) return;

      // Vizinhos na coluna de destino, depois de remover o lead dela
      const destItems = loadedItems(toId).filter((item) => item.id !== leadId);
      const beforeId = destItems[destination.index - 1]?.id;
      const afterId = destItems[destination.index]?.id;

      const outcomeStage = toId === wonStage?.id ? wonStage : toId === lostStage?.id ? lostStage : undefined;
      if (outcomeStage) {
        const zone = document.querySelector<HTMLElement>(`[data-outcome-zone="${toId}"]`);
        const rect = zone?.getBoundingClientRect();
        onOutcomeRequest({
          lead,
          fromId,
          toId,
          kind: outcomeStage.type === 'WON' ? 'WON' : 'LOST',
          toIndex: destination.index,
          beforeId,
          afterId,
          origin: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
        });
        return;
      }

      onMove({
        lead,
        fromId,
        toId,
        toIndex: destination.index,
        beforeId,
        afterId,
      });
    },
    [loadedItems, wonStage, lostStage, onMove, onOutcomeRequest],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative">
        <div
          role="region"
          aria-label="Colunas do funil"
          tabIndex={0}
          className="pipeline-scrollbar flex h-[calc(100dvh-22rem)] min-h-[420px] snap-x gap-3 overflow-x-auto pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] rounded-2xl"
        >
          {openStages.map((stage) => (
            <div key={stage.id} className={collapsedKeys.includes(String(stage.id)) ? "flex h-full shrink-0 snap-start" : "flex h-full min-w-[18rem] max-w-[32rem] flex-1 snap-start"}>
              <StageColumn
                stage={stage}
                filters={filters}
                filtered={filtered}
                isSupervisor={isSupervisor}
                callingId={callingId}
                selection={selection}
                collapsed={collapsedKeys.includes(String(stage.id))}
                totalValue={totalValue}
                onToggleCollapse={() => toggleCollapsed(String(stage.id))}
                onCall={onCall}
                onOpen={onOpen}
                onAdd={onAdd}
              />
            </div>
          ))}
        </div>
      </div>

      <OutcomeDropZones won={wonStage} lost={lostStage} active={dragging} />
    </DragDropContext>
  );
}
