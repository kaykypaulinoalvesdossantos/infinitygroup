'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { LeadReports } from '@/services/crm-pipeline';
import { fmtDays, pctOf } from './format';

type Durations = LeadReports['stageDurations'];
type FunnelItem = LeadReports['funnel'][number];

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK_COLOR = '#64748B';

/** Dias medios por etapa, com a cor da etapa. Destaca a etapa mais lenta. */
export function StageDurations({ durations, funnel }: { durations: Durations; funnel: FunnelItem[] }) {
  const reduced = useReducedMotion() ?? false;
  if (durations.length === 0) {
    return <EmptyState title="Sem tempo por etapa" description="Ainda não há mudanças de etapa no período." />;
  }

  const colorByKey = new Map(funnel.map((f) => [f.stageId, f.color] as const));
  const max = Math.max(0, ...durations.map((d) => d.avgDays));
  const slowestKey = max > 0 ? durations.find((d) => d.avgDays === max)?.stageId : undefined;
  const summary = `Dias médios por etapa: ${durations.map((d) => `${d.name} ${fmtDays(d.avgDays)}`).join(', ')}.`;

  return (
    <div className="space-y-4">
      <div role="img" aria-label={summary} className="space-y-3">
        {durations.map((d, index) => {
          const color = colorByKey.get(d.stageId) ?? FALLBACK_COLOR;
          const slowest = d.stageId === slowestKey;
          return (
            <div key={d.stageId} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className="truncate text-slate-800 dark:text-slate-100">{d.name}</span>
                  {slowest && (
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      Mais lenta
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'shrink-0 tabular-nums',
                    slowest ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300',
                  )}
                >
                  {fmtDays(d.avgDays)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/70">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={reduced ? false : { width: '0%' }}
                  animate={{ width: `${pctOf(d.avgDays, max)}%` }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : index * 0.05 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Dias médios por etapa</caption>
        <thead>
          <tr>
            <th scope="col">Etapa</th>
            <th scope="col">Dias médios</th>
          </tr>
        </thead>
        <tbody>
          {durations.map((d) => (
            <tr key={d.stageId}>
              <td>{d.name}</td>
              <td>{fmtDays(d.avgDays)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
