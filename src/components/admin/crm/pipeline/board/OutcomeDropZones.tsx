'use client';

import type { ReactNode } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/services/crm-pipeline';
import { stageTint } from '../tokens';
import { useMotionSafe } from '../motion';

interface OutcomeDropZonesProps {
  won?: PipelineStage;
  lost?: PipelineStage;
  /** Verdadeiro durante o arraste: as zonas sobem do rodape. */
  active: boolean;
}

/**
 * Zonas de soltar Ganho / Perdido. Ficam sempre montadas (o dnd mede os droppables no inicio
 * do arraste) e so o conteudo visual desliza. Nao capturam ponteiro fora do arraste.
 */
export function OutcomeDropZones({ won, lost, active }: OutcomeDropZonesProps) {
  const zones = [won, lost].filter((s): s is PipelineStage => !!s);
  if (zones.length === 0) return null;

  return (
    <div
      aria-hidden={!active}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex h-28 justify-center gap-4 overflow-hidden px-4"
    >
      {zones.map((stage) => {
        const isWon = stage.type === 'WON';
        const Icon = isWon ? CheckCircle2 : XCircle;
        return (
          <Droppable key={stage.id} droppableId={String(stage.id)}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                data-outcome-zone={stage.id}
                className="flex h-24 w-full max-w-xs items-stretch"
              >
                <ZoneVisual active={active} over={snapshot.isDraggingOver} color={stage.color}>
                  <div className={cn('flex flex-col items-center justify-center gap-1 text-center', isWon ? 'text-[hsl(var(--stage-won))]' : 'text-[hsl(var(--stage-lost))]')}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span className="text-sm font-semibold">{isWon ? 'Ganho' : 'Perdido'}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {isWon ? 'Solte para marcar como ganho' : 'Solte para marcar como perdido'}
                    </span>
                  </div>
                </ZoneVisual>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  );
}

function ZoneVisual({
  active,
  over,
  color,
  children,
}: {
  active: boolean;
  over: boolean;
  color: string;
  children: ReactNode;
}) {
  const { reduced } = useMotionSafe();
  return (
    <motion.div
      initial={false}
      animate={{
        y: active ? 0 : 160,
        opacity: active ? 1 : 0,
        scale: over && !reduced ? 1.06 : 1,
      }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 30 }}
      style={{
        backgroundColor: stageTint(color, over ? 0.28 : 0.12),
        borderColor: color,
        boxShadow: over ? `0 14px 36px -10px ${stageTint(color, 0.7)}` : undefined,
      }}
      className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed px-4 transition-[background-color,box-shadow] duration-200"
    >
      {children}
    </motion.div>
  );
}
