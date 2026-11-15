'use client';

import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import type { LeadReports } from '@/services/crm-pipeline';
import { fmtCompact, fmtInt, monthLabel } from './format';

type Month = LeadReports['monthly'][number];

const GROUP_W = 60;
const BAR_W = 10;
const BAR_GAP = 3;
const PAD_L = 40;
const PAD_T = 12;
const PAD_B = 24;
const H = 200;

const SERIES = [
  { key: 'created', label: 'Criados', color: '#94A3B8' },
  { key: 'won', label: 'Ganhos', color: 'hsl(var(--stage-won))' },
  { key: 'lost', label: 'Perdidos', color: 'hsl(var(--stage-lost))' },
] as const;

/** Teto "redondo" para o eixo Y acima do maior valor. */
function niceTop(peak: number): number {
  const mag = 10 ** Math.floor(Math.log10(peak));
  const ratio = peak / mag;
  const step = (ratio <= 2 ? 0.5 : ratio <= 5 ? 1 : 2) * mag;
  return Math.ceil(peak / step) * step;
}

/** Colunas agrupadas por mes (criados / ganhos / perdidos) em SVG, com rolagem horizontal. */
export function MonthlyChart({ monthly }: { monthly: Month[] }) {
  if (monthly.length === 0) return <EmptyState title="Sem dados mensais" />;

  const peak = Math.max(1, ...monthly.flatMap((m) => [m.created, m.won, m.lost]));
  const top = niceTop(peak);
  const ticks = Array.from(new Set([0, top / 2, top]));
  const plotH = H - PAD_T - PAD_B;
  const yOf = (v: number) => PAD_T + plotH * (1 - v / top);
  const baseline = H - PAD_B;
  const groupInner = SERIES.length * BAR_W + (SERIES.length - 1) * BAR_GAP;
  const groupOffset = (GROUP_W - groupInner) / 2;
  const width = PAD_L + monthly.length * GROUP_W;

  const sums = monthly.reduce(
    (acc, m) => ({ created: acc.created + m.created, won: acc.won + m.won, lost: acc.lost + m.lost }),
    { created: 0, won: 0, lost: 0 },
  );
  const summary = `Leads por mês, ${monthly.length} meses: ${fmtInt(sums.created)} criados, ${fmtInt(sums.won)} ganhos, ${fmtInt(sums.lost)} perdidos.`;

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground ">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div role="img" aria-label={summary} style={{ width }}>
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true" focusable="false" className="block">
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD_L}
                  x2={width}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  strokeWidth={1}
                  className="stroke-border "
                />
                <text
                  x={PAD_L - 6}
                  y={yOf(t)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] tabular-nums "
                >
                  {fmtInt(t)}
                </text>
              </g>
            ))}

            {monthly.map((m, i) => {
              const groupX = PAD_L + i * GROUP_W + groupOffset;
              return (
                <g key={m.month}>
                  {SERIES.map((s, j) => {
                    const value = m[s.key];
                    const y = yOf(value);
                    return (
                      <rect
                        key={s.key}
                        x={groupX + j * (BAR_W + BAR_GAP)}
                        y={y}
                        width={BAR_W}
                        height={Math.max(0, baseline - y)}
                        rx={2}
                        style={{ fill: s.color }}
                      >
                        <title>{`${monthLabel(m.month)} · ${s.label}: ${fmtInt(value)}`}</title>
                      </rect>
                    );
                  })}
                  <text
                    x={PAD_L + i * GROUP_W + GROUP_W / 2}
                    y={H - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px] "
                  >
                    {monthLabel(m.month)}
                  </text>
                </g>
              );
            })}
            <line x1={PAD_L} x2={width} y1={baseline} y2={baseline} strokeWidth={1} className="stroke-border" />
          </svg>

          <div className="flex text-[11px] tabular-nums text-muted-foreground " style={{ paddingLeft: PAD_L }}>
            {monthly.map((m) => (
              <span key={m.month} className="truncate text-center" style={{ width: GROUP_W }} title="Valor ganho no mês">
                {fmtCompact(m.wonValue)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground ">Abaixo de cada mês: valor ganho.</p>

      <table className="sr-only">
        <caption>Leads por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Criados</th>
            <th scope="col">Ganhos</th>
            <th scope="col">Perdidos</th>
            <th scope="col">Valor ganho</th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((m) => (
            <tr key={m.month}>
              <td>{monthLabel(m.month)}</td>
              <td>{fmtInt(m.created)}</td>
              <td>{fmtInt(m.won)}</td>
              <td>{fmtInt(m.lost)}</td>
              <td>{fmtCompact(m.wonValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
