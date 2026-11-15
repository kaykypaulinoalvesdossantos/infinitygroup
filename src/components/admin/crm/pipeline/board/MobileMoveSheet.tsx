'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { PipelineLead, PipelineStage } from '@/services/crm-pipeline';

interface MobileMoveSheetProps {
  lead: PipelineLead | null;
  stages: PipelineStage[];
  onClose: () => void;
  /** Etapa aberta escolhida: move na hora. */
  onPickOpen: (stage: PipelineStage) => void;
  /** Ganho ou Perdido: o board abre o mesmo dialogo do arraste. */
  onPickOutcome: (stage: PipelineStage) => void;
}

/** Folha inferior "Mover para": etapas abertas, depois Ganho e Perdido (com o mesmo fluxo de confirmacao). */
export function MobileMoveSheet({ lead, stages, onClose, onPickOpen, onPickOutcome }: MobileMoveSheetProps) {
  const open = lead !== null;
  const current = lead?.funnelStage?.id;
  const openStages = stages.filter((s) => s.type === 'OPEN');
  const outcomeStages = stages.filter((s) => s.type !== 'OPEN');

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-3 overflow-y-auto rounded-t-[20px] border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-none"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="pr-10 text-base">Mover para</SheetTitle>
          <SheetDescription className="truncate">{lead ? lead.name : ''}</SheetDescription>
        </SheetHeader>

        <div role="group" aria-label="Etapas abertas" className="flex flex-col gap-1">
          {openStages.map((stage) => (
            <StageButton
              key={stage.id}
              stage={stage}
              active={stage.id === current}
              onClick={() => onPickOpen(stage)}
            />
          ))}
        </div>

        {outcomeStages.length > 0 && (
          <div role="group" aria-label="Resultado" className="mt-1 flex flex-col gap-1 border-t border-[hsl(var(--card-border))] pt-3">
            {outcomeStages.map((stage) => {
              const Icon = stage.type === 'WON' ? CheckCircle2 : XCircle;
              return (
                <StageButton
                  key={stage.id}
                  stage={stage}
                  active={stage.id === current}
                  icon={<Icon className="h-4 w-4" aria-hidden="true" />}
                  onClick={() => onPickOutcome(stage)}
                />
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function StageButton({
  stage,
  active,
  icon,
  onClick,
}: {
  stage: PipelineStage;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
        active ? 'bg-muted font-semibold ' : 'hover:bg-muted ',
      )}
    >
      {icon ?? <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />}
      <span className="truncate">{stage.name}</span>
      {active && <span className="ml-auto text-xs font-normal text-muted-foreground ">Atual</span>}
    </button>
  );
}
