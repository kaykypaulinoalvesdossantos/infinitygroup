'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { qualityClass, type DiagnosisData, type Temperature } from '@/components/sales-copilot/engine';
import { pipelineApi } from '@/services/crm-pipeline';
import { getErrorMessage } from '@/components/atendimento/helpers';
import { TEMPERATURE_LABEL } from './copilot-format';
import type { CopilotLead } from './types';

/** Mostra a temperatura sugerida pela qualificacao e, se diferente da do lead, permite aplicar. */
export function TemperatureSuggestion({
  lead,
  state,
  onLeadUpdated,
}: {
  lead: CopilotLead;
  state: DiagnosisData;
  onLeadUpdated?: () => void;
}) {
  const [applied, setApplied] = useState<Temperature | null>(null);
  const [busy, setBusy] = useState(false);

  const suggested = qualityClass(state).temperature;
  const current: string | null = applied ?? lead.temperature ?? null;

  if (suggested === null) {
    return <p className="text-sm text-slate-500">Sem sugestão de temperatura: o prospect não está qualificado.</p>;
  }

  if (suggested === current) {
    return (
      <p className="text-sm text-slate-600">
        Temperatura do lead: <span className="font-medium text-slate-900">{TEMPERATURE_LABEL[suggested]}</span>
      </p>
    );
  }

  async function apply() {
    if (suggested === null) return;
    setBusy(true);
    try {
      await pipelineApi.update(lead.id, { temperature: suggested });
      setApplied(suggested);
      toast.success(`Temperatura do lead atualizada para ${TEMPERATURE_LABEL[suggested]}.`);
      onLeadUpdated?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível atualizar a temperatura do lead.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-sm text-slate-700">
        Temperatura sugerida: <span className="font-semibold text-slate-900">{TEMPERATURE_LABEL[suggested]}</span>
        {current && <span className="text-slate-500"> (atual: {TEMPERATURE_LABEL[current as Temperature] ?? current})</span>}
      </p>
      <Button type="button" size="sm" onClick={() => void apply()} disabled={busy}>
        {busy ? 'Aplicando…' : 'Aplicar temperatura sugerida'}
      </Button>
    </div>
  );
}
