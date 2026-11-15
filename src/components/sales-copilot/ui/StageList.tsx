'use client';

import { Check } from 'lucide-react';
import { STAGES, stageProgress, type DiagnosisData } from '@/components/sales-copilot/engine';
import { ProgressBar } from '@/components/atendimento/helpers';
import { cn } from '@/lib/utils';

/** Etapas da ligacao: clicar numa etapa leva o roteiro para ela (goToStage). */
export function StageList({
  state,
  onGoToStage,
}: {
  state: DiagnosisData;
  onGoToStage: (index: number) => void;
}) {
  const progress = stageProgress(state);

  return (
    <section aria-labelledby="copilot-stages-title" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="copilot-stages-title" className="text-sm font-semibold text-slate-900">
          Etapa da ligação
        </h2>
        <span className="text-xs tabular-nums text-slate-500">{progress}%</span>
      </div>
      <ProgressBar value={progress} max={100} label="Progresso da ligação" />
      <ol className="space-y-1">
        {STAGES.map((label, index) => {
          const isCurrent = index === state.stage;
          const isPast = index < state.stage;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onGoToStage(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                  isCurrent
                    ? 'bg-[#0076FF]/10 font-semibold text-[#0050B3] ring-1 ring-[#0076FF]/40'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                    isPast && 'bg-emerald-100 text-emerald-700',
                    isCurrent && 'bg-[#0076FF] text-white',
                    !isPast && !isCurrent && 'bg-slate-100 text-slate-500',
                  )}
                >
                  {isPast ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {isCurrent && <span className="sr-only">(etapa atual)</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
