'use client';

import { ChevronsLeft, MoreHorizontal, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCompactBRL } from '../tokens';
import type { PipelineStage } from '@/services/crm-pipeline';

interface StageColumnHeaderProps {
  stage: PipelineStage;
  count: number;
  value: number;
  weighted: number;
  /** Participacao desta etapa no valor total do funil (0-100). */
  share: number;
  onCollapse: () => void;
  onSelectAll: () => void;
  /** Algum cartao desta coluna esta selecionado: oferece selecionar a coluna inteira. */
  columnHasSelection: boolean;
  /** A selecao ja e a coluna inteira (escopo ativo). */
  columnScopeActive: boolean;
}

/** Cabecalho da coluna: barra na cor da etapa, contador do servidor, valor, ponderado e participacao. */
export function StageColumnHeader({ stage, count, value, weighted, share, onCollapse, onSelectAll, columnHasSelection, columnScopeActive }: StageColumnHeaderProps) {
  const clampedShare = Math.min(100, Math.max(0, share));
  return (
    <div className="shrink-0 space-y-2 px-1 pt-3">
      <div className="h-[3px] rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{stage.name}</h2>
          <span
            className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums"
            style={{ backgroundColor: `color-mix(in srgb, ${stage.color} 14%, transparent)`, color: stage.color }}
            aria-label={`${count} lead(s) nesta etapa`}
            aria-live="polite"
          >
            <AnimatedNumber value={count} />
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-slate-400" aria-label={`Opções da etapa ${stage.name}`}>
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onSelectAll} disabled={count === 0}>
              <CheckSquare className="h-4 w-4" aria-hidden="true" />
              Selecionar todos ({count})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCollapse}>
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
              Recolher coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-slate-600 dark:text-slate-300">
        <AnimatedNumber value={value} format={formatCompactBRL} className="font-semibold text-slate-900 dark:text-slate-50" />
        <span className="tabular-nums text-slate-500 dark:text-slate-400">
          pond. <AnimatedNumber value={weighted} format={formatCompactBRL} />
        </span>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/60"
        role="meter"
        aria-label={`Participação de ${stage.name} no funil`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clampedShare)}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${clampedShare}%`, backgroundColor: stage.color }}
        />
      </div>
      <p className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">{Math.round(clampedShare)}% do funil</p>

      {columnHasSelection && !columnScopeActive && count > 0 && (
        <Button type="button" variant="outline" size="sm" className="h-7 w-full text-xs" onClick={onSelectAll}>
          <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Selecionar todos os {count} desta coluna
        </Button>
      )}
    </div>
  );
}
