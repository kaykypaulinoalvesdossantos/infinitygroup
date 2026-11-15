'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ChevronUp, Snowflake } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { cn } from '@/lib/utils';
import { formatCompactBRL } from '../tokens';
import type { PipelineSummary } from '@/services/crm-pipeline';

const COLLAPSE_KEY = 'pipeline:kpi-collapsed';

const readCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeCollapsed = (value: boolean) => {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0');
  } catch {
    /* armazenamento indisponivel: a preferencia vale so nesta sessao */
  }
};

const formatPercent = (n: number) =>
  `${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

interface KpiStripProps {
  summary: PipelineSummary | undefined;
  loading: boolean;
  overdueActive: boolean;
  rottingActive: boolean;
  onToggleOverdue: () => void;
  onToggleRotting: () => void;
}

function KpiSkeleton() {
  return (
    <div className="shimmer h-[92px] w-[44%] shrink-0 snap-start rounded-2xl border border-[hsl(var(--card-border))] bg-slate-200/60 md:w-auto dark:bg-slate-800/60" />
  );
}

/** Faixa de indicadores do funil. Recolhivel; a preferencia fica salva no navegador. */
export function KpiStrip({ summary, loading, overdueActive, rottingActive, onToggleOverdue, onToggleRotting }: KpiStripProps) {
  const reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      writeCollapsed(!prev);
      return !prev;
    });
  };

  // No celular os cartoes formam um carrossel com scroll-snap (2 e meio visiveis); no desktop, grade.
  const cardBase =
    'flex min-w-0 w-[44%] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-4 shadow-sm text-left md:w-auto md:shrink';

  const cards = summary
    ? [
        {
          key: 'open',
          label: 'Em aberto',
          node: <AnimatedNumber value={summary.open} className="text-2xl font-bold text-slate-900 dark:text-slate-50" />,
          sub: 'leads em andamento',
        },
        {
          key: 'value',
          label: 'Valor no funil',
          node: <AnimatedNumber value={summary.totalValue} format={formatCompactBRL} className="text-2xl font-bold text-slate-900 dark:text-slate-50" />,
          sub: 'soma das etapas abertas',
        },
        {
          key: 'weighted',
          label: 'Ponderado',
          node: <AnimatedNumber value={summary.weightedValue} format={formatCompactBRL} className="text-2xl font-bold text-slate-900 dark:text-slate-50" />,
          sub: 'valor × probabilidade',
        },
        {
          key: 'won',
          label: 'Ganho no mês',
          node: <AnimatedNumber value={summary.wonValueMonth} format={formatCompactBRL} className="text-2xl font-bold text-[hsl(var(--stage-won))]" />,
          sub: `${summary.wonCountMonth} negócio(s) fechados`,
        },
        {
          key: 'conversion',
          label: 'Conversão',
          node: <AnimatedNumber value={summary.conversionRate} format={formatPercent} className="text-2xl font-bold text-slate-900 dark:text-slate-50" />,
          sub: `${summary.won} ganho(s) · ${summary.lost} perdido(s)`,
        },
      ]
    : [];

  return (
    <section aria-label="Indicadores do funil" className="space-y-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ChevronUp className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} aria-hidden="true" />
          {collapsed ? 'Mostrar indicadores' : 'Ocultar indicadores'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="kpi-body"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 pipeline-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-6">
              {loading && !summary &&
                Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={`sk-${i}`} />)}

              {cards.map((card) => (
                <div key={card.key} className={cardBase}>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                  <div className="mt-2">{card.node}</div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{card.sub}</p>
                </div>
              ))}

              {summary && (
                <div className={cn(cardBase, overdueActive && 'ring-2 ring-[hsl(var(--urgent))]')}>
                  <button
                    type="button"
                    onClick={onToggleOverdue}
                    aria-pressed={overdueActive}
                    className="flex flex-col items-start rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--urgent))]" aria-hidden="true" />
                      Atrasados
                    </span>
                    <AnimatedNumber value={summary.overdue} className="mt-2 text-2xl font-bold text-[hsl(var(--urgent))]" />
                    <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {summary.dueToday} para hoje
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleRotting}
                    aria-pressed={rottingActive}
                    className={cn(
                      'mt-2 inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
                      rottingActive
                        ? 'bg-[hsl(var(--rotting)/0.18)] text-[hsl(var(--rotting))]'
                        : 'text-slate-600 hover:bg-[hsl(var(--rotting)/0.1)] dark:text-slate-300',
                    )}
                  >
                    <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
                    {summary.rotting} esfriando
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
