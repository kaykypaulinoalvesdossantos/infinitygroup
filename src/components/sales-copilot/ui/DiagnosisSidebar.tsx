'use client';

import type { DiagnosisData } from '@/components/sales-copilot/engine';
import { BottleneckList } from './BottleneckList';
import { QualityForm } from './QualityForm';
import { TemperatureSuggestion } from './TemperatureSuggestion';
import type { CopilotLead } from './types';

/** Conteudo da aba "Diagnóstico": gargalos em tempo real, qualificacao e temperatura sugerida. */
export function DiagnosisSidebar({
  lead,
  state,
  dispatch,
  onLeadUpdated,
}: {
  lead: CopilotLead;
  state: DiagnosisData;
  dispatch: (next: DiagnosisData) => void;
  onLeadUpdated?: () => void;
}) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="copilot-diagnosis-title" className="space-y-3">
        <h3 id="copilot-diagnosis-title" className="text-sm font-semibold text-slate-900">
          Diagnóstico em tempo real
        </h3>
        <BottleneckList state={state} dispatch={dispatch} />
      </section>

      <section aria-label="Qualificação" className="space-y-3 border-t border-slate-200 pt-5">
        <QualityForm state={state} dispatch={dispatch} />
        <TemperatureSuggestion lead={lead} state={state} onLeadUpdated={onLeadUpdated} />
      </section>
    </div>
  );
}
