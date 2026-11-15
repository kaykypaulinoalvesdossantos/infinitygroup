'use client';

import { useEffect, useId, useState } from 'react';
import {
  getCalc,
  ptNumber,
  formatMoney,
  formatNumber,
  setFact,
  type DiagnosisData,
} from '@/components/sales-copilot/engine';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FACT_FIELDS, type FactField } from './copilot-format';

/** Texto de um indicador no formato brasileiro (virgula decimal), vazio quando nao informado. */
function factText(value: number | null): string {
  return value == null ? '' : String(value).replace('.', ',');
}

function FactInput({
  field,
  value,
  onCommit,
}: {
  field: FactField;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const id = useId();
  const errorId = useId();
  const saved = factText(value);
  const [draft, setDraft] = useState(saved);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(saved);
    setInvalid(false);
  }, [saved]);

  function handleBlur() {
    const text = draft.trim();
    if (!text) {
      setInvalid(false);
      if (value !== null) onCommit(null);
      return;
    }
    const parsed = ptNumber(text);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (parsed !== value) onCommit(parsed);
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-slate-600">
        {field.label}
      </Label>
      <Input
        id={id}
        inputMode={field.kind === 'count' ? 'numeric' : 'decimal'}
        value={draft}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleBlur}
        placeholder="Não informado"
        className="h-9 bg-white tabular-nums"
      />
      {invalid && (
        <p id={errorId} className="text-xs text-red-600">
          Informe um número válido.
        </p>
      )}
    </div>
  );
}

/** Indicadores do diagnostico (14 campos; vazio = nao informado) e os calculados. */
export function FactsForm({
  state,
  dispatch,
}: {
  state: DiagnosisData;
  dispatch: (next: DiagnosisData) => void;
}) {
  const calc = getCalc(state.facts);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {FACT_FIELDS.map((field) => (
          <FactInput
            key={field.key}
            field={field}
            value={state.facts[field.key]}
            onCommit={(value) => dispatch(setFact(state, field.key, value))}
          />
        ))}
      </div>

      <section aria-labelledby="copilot-kpi-title" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 id="copilot-kpi-title" className="text-sm font-semibold text-slate-900">
          Indicadores calculados
        </h3>
        <dl className="grid grid-cols-2 gap-3">
          <Kpi label="Conversão" value={calc.conversion != null ? `${formatNumber(calc.conversion, 2)}%` : '—'} />
          <Kpi label="Vendas estimadas" value={formatNumber(calc.sales)} />
          <Kpi label="Não convertidos" value={formatNumber(calc.unconverted)} />
          <Kpi label="Receita estimada" value={formatMoney(calc.revenue)} />
        </dl>
        <p className="text-xs text-slate-500">
          Valores calculados a partir dos números informados. Campos vazios não são estimados.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
