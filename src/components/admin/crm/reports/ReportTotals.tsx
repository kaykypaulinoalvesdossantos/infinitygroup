'use client';

import { AnimatedNumber } from '@/components/admin/crm/pipeline/ui/AnimatedNumber';
import { cn } from '@/lib/utils';
import type { LeadReports } from '@/services/crm-pipeline';
import { fmtBRL, fmtInt, fmtNum1, fmtPct } from './format';

type Totals = LeadReports['totals'];

interface Tile {
  label: string;
  value: number;
  format: (n: number) => string;
}

/** Cartoes de totais do periodo com count-up. */
export function ReportTotals({ totals, className }: { totals: Totals; className?: string }) {
  const tiles: Tile[] = [
    { label: 'Criados', value: totals.created, format: fmtInt },
    { label: 'Ganhos', value: totals.won, format: fmtInt },
    { label: 'Perdidos', value: totals.lost, format: fmtInt },
    { label: 'Valor ganho', value: totals.wonValue, format: fmtBRL },
    { label: 'Conversão', value: totals.conversionRate, format: fmtPct },
    { label: 'Ciclo médio (dias)', value: totals.avgCycleDays, format: fmtNum1 },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6', className)}>
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="min-w-0 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-4 shadow-sm"
        >
          <p className="truncate text-xs font-medium text-muted-foreground ">{tile.label}</p>
          <AnimatedNumber
            value={tile.value}
            format={tile.format}
            className="mt-1 block truncate text-lg font-semibold text-foreground  md:text-2xl"
          />
        </div>
      ))}
    </div>
  );
}
