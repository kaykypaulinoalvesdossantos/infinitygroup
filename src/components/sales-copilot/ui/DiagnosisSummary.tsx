'use client';

import {
  LEVEL,
  LEVEL_NAMES,
  formatMoney,
  formatNumber,
  getCalc,
  type DiagnosisData,
} from '@/components/sales-copilot/engine';
import { LEVEL_DOT_CLASS } from './copilot-format';

/** Resumo somente leitura do diagnostico (usado no celular, dentro de "Ver diagnóstico"). */
export function DiagnosisSummary({ state }: { state: DiagnosisData }) {
  const entries = Object.entries(state.bottlenecks).sort((a, b) => LEVEL[b[1].level] - LEVEL[a[1].level]);
  const calc = getCalc(state.facts);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Gargalos</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum gargalo identificado até agora.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {entries.map(([area, entry]) => (
              <li key={area} className="flex items-start gap-2 text-sm">
                <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT_CLASS[entry.level]}`} />
                <span className="min-w-0">
                  <span className="font-medium text-slate-900">{area}</span>
                  <span className="text-slate-500"> · {LEVEL_NAMES[entry.level]}</span>
                  {entry.evidence && <span className="block text-slate-700">{entry.evidence}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Conversão</dt>
          <dd className="font-semibold tabular-nums">{calc.conversion != null ? `${formatNumber(calc.conversion, 2)}%` : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Receita estimada</dt>
          <dd className="font-semibold tabular-nums">{formatMoney(calc.revenue)}</dd>
        </div>
      </dl>
    </div>
  );
}
