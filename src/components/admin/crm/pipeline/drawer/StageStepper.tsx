'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useStages } from '../hooks/usePipelineData';
import { daysInStage, stageTint } from '../tokens';
import { onStageTextClass } from './parts';
import type { AutosaveApi } from './useAutosave';
import { useStageMove } from './useStageMove';
import type { DrawerLead } from './types';

interface StageStepperProps {
  lead: DrawerLead;
  autosave: AutosaveApi;
}

/** Etapas abertas em sequencia. Clicar move o lead para o topo da coluna destino (expectedVersion + requiredFields). */
export function StageStepper({ lead, autosave }: StageStepperProps) {
  const { data: stages = [] } = useStages();
  const moveTo = useStageMove(lead, autosave);

  const openStages = useMemo(
    () => stages.filter((stage) => stage.type === 'OPEN').sort((a, b) => a.position - b.position),
    [stages],
  );
  const currentIndex = openStages.findIndex((stage) => stage.id === (lead.funnelStage?.id ?? 0));
  const currentStage = stages.find((stage) => stage.id === (lead.funnelStage?.id ?? 0));
  const days = daysInStage(lead);

  return (
    <div className="space-y-2 px-5 pb-3">
      <ol aria-label="Etapas do pipeline" className="pipeline-scrollbar flex gap-1 overflow-x-auto pb-1">
        {openStages.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isDone = currentIndex >= 0 && index < currentIndex;
          return (
            <li key={stage.id} className="min-w-[96px] flex-1">
              <button
                type="button"
                onClick={() => void moveTo(stage.id)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Mover para ${stage.name}${isCurrent ? ' (etapa atual)' : ''}`}
                title={stage.name}
                style={
                  isCurrent
                    ? { backgroundColor: stage.color }
                    : isDone
                      ? { backgroundColor: stageTint(stage.color, 0.2) }
                      : undefined
                }
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
                  isCurrent && onStageTextClass(stage.color),
                  isDone && 'text-slate-800 dark:text-slate-100',
                  !isCurrent && !isDone && 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
                )}
              >
                <span className="truncate">{stage.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {currentStage && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {days === 0 ? 'Nesta etapa desde hoje' : `há ${days} ${days === 1 ? 'dia' : 'dias'} nesta etapa`}
        </p>
      )}
    </div>
  );
}
