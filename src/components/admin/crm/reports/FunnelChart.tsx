'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { LeadReports } from '@/services/crm-pipeline';
import { fmtInt, fmtPct, pctOf } from './format';

type FunnelItem = LeadReports['funnel'][number];

const EASE = [0.22, 1, 0.36, 1] as const;

interface FunnelRowProps {
  item: FunnelItem;
  /** Proxima etapa do funil (so para etapas abertas). */
  next?: FunnelItem;
  max: number;
  index: number;
  reduced: boolean;
}

function FunnelRow({ item, next, max, index, reduced }: FunnelRowProps) {
  const width = pctOf(item.reached, max);
  const isWon = item.type === 'WON';
  const pass = next && item.reached > 0 ? pctOf(next.reached, item.reached) : null;

  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          {isWon ? (
            <Check className="h-4 w-4 shrink-0" style={{ color: item.color }} aria-hidden="true" />
          ) : (
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          )}
          <span className={cn('truncate text-slate-800 dark:text-slate-100', isWon && 'font-semibold')}>{item.name}</span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400 sm:text-sm">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{fmtInt(item.reached)}</span> chegaram ·{' '}
          {fmtInt(item.current)} agora
        </span>
      </div>

      <div className="group relative h-9 rounded-lg bg-slate-100 dark:bg-slate-800/70">
        <motion.div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-lg"
          style={{ backgroundColor: item.color }}
          initial={reduced ? false : { width: '0%' }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : index * 0.05 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900"
        >
          <p>Chegaram: {fmtInt(item.reached)}</p>
          <p>Agora: {fmtInt(item.current)}</p>
          {pass !== null && <p>Passagem: {fmtPct(pass)}</p>}
        </div>
      </div>

      {next && item.type === 'OPEN' && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {pass === null ? 'Sem leads nesta etapa' : `${fmtPct(pass)} avançam para ${next.name}`}
        </p>
      )}
    </li>
  );
}

/** Funil em barras horizontais centralizadas. Ganhos destacados; perdidos em secao propria. */
export function FunnelChart({ funnel }: { funnel: FunnelItem[] }) {
  const reduced = useReducedMotion() ?? false;
  if (funnel.length === 0) return <EmptyState title="Funil sem etapas" />;

  const max = Math.max(1, ...funnel.map((f) => f.reached));
  const indexed = funnel.map((item, index) => ({ item, index }));
  const main = indexed.filter(({ item }) => item.type !== 'LOST');
  const lost = indexed.filter(({ item }) => item.type === 'LOST');
  const lostTotal = lost.reduce((sum, { item }) => sum + item.reached, 0);

  const summary = `Funil do período: ${main.map(({ item }) => `${item.name} ${fmtInt(item.reached)}`).join(', ')}. Perdidos ${fmtInt(lostTotal)}.`;

  return (
    <div className="space-y-4">
      <div role="img" aria-label={summary}>
        <ul className="space-y-4">
          {main.map(({ item, index }) => (
            <FunnelRow
              key={item.stageId}
              item={item}
              next={funnel[index + 1]}
              max={max}
              index={index}
              reduced={reduced}
            />
          ))}
        </ul>

        {lost.length > 0 && (
          <div className="mt-5 space-y-3 border-t border-[hsl(var(--card-border))] pt-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Perdidos</h3>
            <ul className="space-y-3">
              {lost.map(({ item, index }) => (
                <FunnelRow key={item.stageId} item={item} max={max} index={main.length + index} reduced={reduced} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Funil por etapa</caption>
        <thead>
          <tr>
            <th scope="col">Etapa</th>
            <th scope="col">Chegaram</th>
            <th scope="col">Agora</th>
            <th scope="col">Passagem para a próxima</th>
          </tr>
        </thead>
        <tbody>
          {funnel.map((item, index) => {
            const next = funnel[index + 1];
            const pass = next && item.reached > 0 && item.type === 'OPEN' ? fmtPct(pctOf(next.reached, item.reached)) : '—';
            return (
              <tr key={item.stageId}>
                <td>{item.name}</td>
                <td>{fmtInt(item.reached)}</td>
                <td>{fmtInt(item.current)}</td>
                <td>{pass}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
