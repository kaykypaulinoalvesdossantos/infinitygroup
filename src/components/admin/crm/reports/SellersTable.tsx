'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import { OwnerAvatar } from '@/components/admin/crm/pipeline/ui/OwnerAvatar';
import { cn } from '@/lib/utils';
import type { LeadReports } from '@/services/crm-pipeline';
import { clampPct, fmtBRL, fmtInt, fmtPct } from './format';

type Seller = LeadReports['sellers'][number];
type SortKey = 'name' | 'open' | 'won' | 'lost' | 'wonValue' | 'conversionRate';
type SortState = { key: SortKey; dir: 'asc' | 'desc' };

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
  { key: 'name', label: 'Responsável', align: 'left' },
  { key: 'open', label: 'Abertos', align: 'right' },
  { key: 'won', label: 'Ganhos', align: 'right' },
  { key: 'lost', label: 'Perdidos', align: 'right' },
  { key: 'wonValue', label: 'Valor ganho', align: 'right' },
  { key: 'conversionRate', label: 'Conversão', align: 'right' },
];

/** Tabela de vendedores ordenavel. O backend ja entrega so a propria linha ao vendedor. */
export function SellersTable({ sellers }: { sellers: Seller[] }) {
  const [sort, setSort] = useState<SortState>({ key: 'wonValue', dir: 'desc' });

  const rows = useMemo(() => {
    const sign = sort.dir === 'asc' ? 1 : -1;
    const key = sort.key;
    return [...sellers].sort((a, b) => {
      if (key === 'name') return sign * a.name.localeCompare(b.name, 'pt-BR');
      return sign * (a[key] - b[key]);
    });
  }, [sellers, sort]);

  if (sellers.length === 0) {
    return <EmptyState title="Nenhum responsável com leads no período" />;
  }

  const toggleSort = (key: SortKey) => {
    setSort((current) => {
      if (current.key === key) return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: key === 'name' ? 'asc' : 'desc' };
    });
  };

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Desempenho por vendedor</caption>
        <thead>
          <tr className="border-b border-[hsl(var(--card-border))] text-xs text-slate-500 dark:text-slate-400">
            {COLUMNS.map((col) => {
              const active = sort.key === col.key;
              const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cn('px-3 py-2 font-medium', col.align === 'right' ? 'text-right' : 'text-left')}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.6)] focus-visible:outline-none dark:hover:text-slate-100',
                      active && 'text-slate-900 dark:text-slate-100',
                    )}
                  >
                    {col.label}
                    <Icon className={cn('h-3.5 w-3.5', !active && 'opacity-50')} aria-hidden="true" />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.ownerId} className="border-b border-[hsl(var(--card-border))] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="px-3 py-2.5">
                <span className="flex items-center gap-2">
                  <OwnerAvatar name={s.name} id={s.ownerId} />
                  <span className="truncate font-medium text-slate-800 dark:text-slate-100">{s.name}</span>
                </span>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(s.open)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(s.won)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{fmtInt(s.lost)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{fmtBRL(s.wonValue)}</td>
              <td className="px-3 py-2.5">
                <span className="flex items-center justify-end gap-2">
                  <span className="tabular-nums">{fmtPct(s.conversionRate)}</span>
                  <span aria-hidden="true" className="block h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-full rounded-full bg-[hsl(var(--stage-won))]"
                      style={{ width: `${clampPct(s.conversionRate)}%` }}
                    />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
