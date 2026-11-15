'use client';

import { useId } from 'react';
import {
  qualityClass,
  setQuality,
  type DiagnosisData,
  type Quality,
} from '@/components/sales-copilot/engine';
import { Label } from '@/components/ui/label';
import { Pill, type Tone } from '@/components/atendimento/helpers';
import { Textarea } from '@/components/ui/textarea';
import { useCommitDraft } from '@/components/sales-copilot/hooks/useCommitDraft';
import { TEMPERATURE_TONE } from './copilot-format';

const QUALITY_FIELDS: Array<{ key: keyof Quality; label: string }> = [
  { key: 'priority', label: 'Prioridade' },
  { key: 'authority', label: 'Autoridade / decisor' },
  { key: 'timing', label: 'Prazo' },
  { key: 'budget', label: 'Orçamento' },
  { key: 'impact', label: 'Impacto' },
  { key: 'desiredOutcome', label: 'Resultado desejado' },
  { key: 'nextStep', label: 'Próximo passo autorizado' },
  { key: 'followUp', label: 'Retorno / follow-up' },
];

function QualityField({
  label,
  saved,
  onCommit,
}: {
  label: string;
  saved: string;
  onCommit: (value: string) => void;
}) {
  const id = useId();
  const { draft, setDraft, onBlur } = useCommitDraft(saved, onCommit);
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-slate-600">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={onBlur}
        className="min-h-9 bg-white text-sm"
      />
    </div>
  );
}

/** Qualificacao do prospect: pill com a classificacao e campos editaveis. */
export function QualityForm({
  state,
  dispatch,
}: {
  state: DiagnosisData;
  dispatch: (next: DiagnosisData) => void;
}) {
  const classification = qualityClass(state);
  const tone: Tone = classification.temperature ? TEMPERATURE_TONE[classification.temperature] : 'slate';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Qualificação do prospect</h3>
        <Pill tone={tone}>{classification.label}</Pill>
      </div>
      <div className="grid gap-3">
        {QUALITY_FIELDS.map((field) => (
          <QualityField
            key={field.key}
            label={field.label}
            saved={state.quality[field.key]}
            onCommit={(value) => dispatch(setQuality(state, field.key, value))}
          />
        ))}
      </div>
    </div>
  );
}
