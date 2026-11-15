'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import type { LeadReports } from '@/services/crm-pipeline';
import { fmtInt, fmtPct, pctOf } from './format';

type Reason = LeadReports['lostReasons'][number];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Motivos de perda ordenados por contagem, com contagem e percentual. */
export function LostReasonsChart({ reasons }: { reasons: Reason[] }) {
  const reduced = useReducedMotion() ?? false;
  const sorted = [...reasons].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, r) => sum + r.count, 0);

  if (total === 0) {
    return <EmptyState title="Nenhuma perda no período" description="Os motivos aparecem aqui quando houver leads perdidos." />;
  }

  const max = sorted[0].count;
  const summary = `Motivos de perda: ${sorted.map((r) => `${r.label} ${fmtInt(r.count)} (${fmtPct(pctOf(r.count, total))})`).join(', ')}.`;

  return (
    <div className="space-y-4">
      <div role="img" aria-label={summary}>
        <ul className="space-y-3">
          {sorted.map((reason, index) => (
            <li key={reason.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-foreground ">{reason.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground ">
                  {fmtInt(reason.count)} · {fmtPct(pctOf(reason.count, total))}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted ">
                <motion.div
                  className="h-full rounded-full bg-[hsl(var(--stage-lost))]"
                  initial={reduced ? false : { width: '0%' }}
                  animate={{ width: `${pctOf(reason.count, max)}%` }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : index * 0.05 }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <table className="sr-only">
        <caption>Motivos de perda</caption>
        <thead>
          <tr>
            <th scope="col">Motivo</th>
            <th scope="col">Leads</th>
            <th scope="col">Percentual</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((reason) => (
            <tr key={reason.label}>
              <td>{reason.label}</td>
              <td>{fmtInt(reason.count)}</td>
              <td>{fmtPct(pctOf(reason.count, total))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
