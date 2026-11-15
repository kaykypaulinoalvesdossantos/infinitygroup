'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { LEAD_SOURCES } from '@/services/crm-leads';
import { INTERACTION_STATUSES } from '@/services/telephony';
import type { OutcomeFilter, Temperature } from '@/services/crm-pipeline';
import type { UsePipelineFiltersResult } from '../hooks/usePipelineFilters';

const TEMPERATURES: { value: Temperature; label: string }[] = [
  { value: 'COLD', label: 'Frio' },
  { value: 'WARM', label: 'Morno' },
  { value: 'HOT', label: 'Quente' },
];

const OUTCOMES: { value: OutcomeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Em aberto' },
  { value: 'won', label: 'Ganhos' },
  { value: 'lost', label: 'Perdidos' },
];

interface Draft {
  source: string[];
  temperature: Temperature[];
  valueMin: string;
  valueMax: string;
  createdFrom: string;
  createdTo: string;
  interactionStatus: string[];
  rotting: boolean;
  outcome: OutcomeFilter;
}

const draftFrom = (f: UsePipelineFiltersResult): Draft => ({
  source: f.source,
  temperature: f.temperature,
  valueMin: f.valueMin !== undefined ? String(f.valueMin) : '',
  valueMax: f.valueMax !== undefined ? String(f.valueMax) : '',
  createdFrom: f.createdFrom ?? '',
  createdTo: f.createdTo ?? '',
  interactionStatus: f.interactionStatus,
  rotting: f.rotting,
  outcome: f.outcome ?? 'all',
});

const EMPTY_DRAFT: Draft = {
  source: [],
  temperature: [],
  valueMin: '',
  valueMax: '',
  createdFrom: '',
  createdTo: '',
  interactionStatus: [],
  rotting: false,
  outcome: 'all',
};

const toggleIn = <T,>(list: T[], item: T): T[] => (list.includes(item) ? list.filter((v) => v !== item) : [...list, item]);

const sameList = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/** Conta os filtros avancados ativos (os que nao aparecem nos seletores da barra). */
function advancedCount(f: UsePipelineFiltersResult): number {
  let count = 0;
  if (f.source.length) count += 1;
  if (f.temperature.length) count += 1;
  if (f.valueMin !== undefined || f.valueMax !== undefined) count += 1;
  if (f.createdFrom || f.createdTo) count += 1;
  if (f.interactionStatus.length) count += 1;
  if (f.rotting) count += 1;
  if (f.outcome && f.outcome !== 'all') count += 1;
  return count;
}

const parseMoney = (value: string): number | undefined | null => {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

interface AdvancedFiltersPopoverProps {
  filters: UsePipelineFiltersResult;
  /** Incrementar este numero abre o painel (atalho "F"). */
  openRequest?: number;
}

/** Filtros avancados: origem, temperatura, valor, datas, status do discador, esfriando e resultado. */
export function AdvancedFiltersPopover({ filters, openRequest = 0 }: AdvancedFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState('');
  const count = advancedCount(filters);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(draftFrom(filters));
      setError('');
    }
    setOpen(next);
  };

  // Atalho "F": so reage a mudancas do contador (nao abre sozinho ao montar)
  const lastRequest = useRef(openRequest);
  useEffect(() => {
    if (openRequest === lastRequest.current) return;
    lastRequest.current = openRequest;
    handleOpenChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest]);

  const min = parseMoney(draft.valueMin);
  const max = parseMoney(draft.valueMax);
  const valueInvalid = min === null || max === null;
  const rangeInvalid = !valueInvalid && min !== undefined && max !== undefined && min > max;
  const dateInvalid = !!draft.createdFrom && !!draft.createdTo && draft.createdFrom > draft.createdTo;

  const apply = () => {
    if (valueInvalid) return setError('Informe valores positivos, com vírgula ou ponto.');
    if (rangeInvalid) return setError('O valor mínimo não pode ser maior que o máximo.');
    if (dateInvalid) return setError('A data inicial não pode ser depois da final.');
    setError('');

    const minN = min ?? undefined;
    const maxN = max ?? undefined;
    const changes: Array<() => void> = [];
    if (!sameList(filters.source, draft.source)) changes.push(() => filters.setFilter('source', draft.source));
    if (!sameList(filters.temperature, draft.temperature)) changes.push(() => filters.setFilter('temperature', draft.temperature));
    if (filters.valueMin !== minN) changes.push(() => filters.setFilter('valueMin', minN));
    if (filters.valueMax !== maxN) changes.push(() => filters.setFilter('valueMax', maxN));
    const from = draft.createdFrom || undefined;
    const to = draft.createdTo || undefined;
    if (filters.createdFrom !== from) changes.push(() => filters.setFilter('createdFrom', from));
    if (filters.createdTo !== to) changes.push(() => filters.setFilter('createdTo', to));
    if (!sameList(filters.interactionStatus, draft.interactionStatus)) {
      changes.push(() => filters.setFilter('interactionStatus', draft.interactionStatus));
    }
    if (filters.rotting !== draft.rotting) changes.push(() => filters.setFilter('rotting', draft.rotting));
    const outcome = draft.outcome === 'all' ? undefined : draft.outcome;
    if ((filters.outcome ?? undefined) !== outcome) {
      changes.push(() => filters.setFilter('outcome', outcome));
    }

    changes.forEach((change) => change());
    setOpen(false);
  };

  const clearAdvanced = () => {
    setDraft(EMPTY_DRAFT);
    setError('');
  };

  const choiceClass = (checked: boolean) =>
    cn(
      'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium md:min-h-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
      checked
        ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
        : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
    );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10 bg-[hsl(var(--card-bg))] md:h-9" aria-label="Filtros avançados">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtros{count > 0 ? ` (${count})` : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] space-y-5 p-4">
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Origem</legend>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_SOURCES.map((source) => {
              const checked = draft.source.includes(source.id);
              return (
                <button key={source.id} type="button" aria-pressed={checked} className={choiceClass(checked)} onClick={() => setDraft((d) => ({ ...d, source: toggleIn(d.source, source.id) }))}>
                  {checked && <Check className="h-3 w-3" aria-hidden="true" />}
                  {source.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Temperatura</legend>
          <div className="flex flex-wrap gap-1.5">
            {TEMPERATURES.map((t) => {
              const checked = draft.temperature.includes(t.value);
              return (
                <button key={t.value} type="button" aria-pressed={checked} className={choiceClass(checked)} onClick={() => setDraft((d) => ({ ...d, temperature: toggleIn(d.temperature, t.value) }))}>
                  {checked && <Check className="h-3 w-3" aria-hidden="true" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor do negócio</legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="adv-value-min" className="text-xs text-slate-600 dark:text-slate-300">
                Mínimo (R$)
              </Label>
              <Input id="adv-value-min" inputMode="decimal" placeholder="0" value={draft.valueMin} onChange={(e) => setDraft((d) => ({ ...d, valueMin: e.target.value }))} className="h-9 tabular-nums" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adv-value-max" className="text-xs text-slate-600 dark:text-slate-300">
                Máximo (R$)
              </Label>
              <Input id="adv-value-max" inputMode="decimal" placeholder="Sem limite" value={draft.valueMax} onChange={(e) => setDraft((d) => ({ ...d, valueMax: e.target.value }))} className="h-9 tabular-nums" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Criado em</legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="adv-created-from" className="text-xs text-slate-600 dark:text-slate-300">
                De
              </Label>
              <Input id="adv-created-from" type="date" value={draft.createdFrom} onChange={(e) => setDraft((d) => ({ ...d, createdFrom: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adv-created-to" className="text-xs text-slate-600 dark:text-slate-300">
                Até
              </Label>
              <Input id="adv-created-to" type="date" value={draft.createdTo} onChange={(e) => setDraft((d) => ({ ...d, createdTo: e.target.value }))} className="h-9" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status do discador</legend>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1 pipeline-scrollbar">
            {INTERACTION_STATUSES.map((status) => {
              const checked = draft.interactionStatus.includes(status);
              return (
                <button key={status} type="button" aria-pressed={checked} className={choiceClass(checked)} onClick={() => setDraft((d) => ({ ...d, interactionStatus: toggleIn(d.interactionStatus, status) }))}>
                  {checked && <Check className="h-3 w-3" aria-hidden="true" />}
                  {status}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="adv-rotting" className="text-sm text-slate-700 dark:text-slate-200">
            Só esfriando
          </Label>
          <Switch id="adv-rotting" checked={draft.rotting} onCheckedChange={(checked) => setDraft((d) => ({ ...d, rotting: checked }))} />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Resultado</legend>
          <div role="radiogroup" aria-label="Resultado" className="flex flex-wrap gap-1.5">
            {OUTCOMES.map((o) => {
              const checked = draft.outcome === o.value;
              return (
                <button key={o.value} type="button" role="radio" aria-checked={checked} className={choiceClass(checked)} onClick={() => setDraft((d) => ({ ...d, outcome: o.value }))}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {filters.view === 'kanban' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">No Kanban aparecem só leads em aberto. Esta opção vale para a Lista.</p>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-[hsl(var(--card-border))] pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={clearAdvanced}>
            Limpar
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={valueInvalid || rangeInvalid || dateInvalid} className="bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]">
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
