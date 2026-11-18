'use client';

import type { ReactNode, RefObject } from 'react';
import { useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_INTERESTS, type ProductInterest } from '@/services/crm-leads';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { TeamUser } from '@/services/crm-leads';
import type { FollowUpFilter } from '@/services/crm-pipeline';
import type { UsePipelineFiltersResult } from '../hooks/usePipelineFilters';
import { useTags } from '../hooks/usePipelineData';

const PRODUCT_FILTER_LABEL: Record<ProductInterest, string> = { TELECOM: 'Telecom', SEGUROS: 'Seguros' };

const FOLLOW_UP_OPTIONS: { value: FollowUpFilter | 'all'; label: string }[] = [
  { value: 'all', label: 'Qualquer data' },
  { value: 'overdue', label: 'Atrasados' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Próximos 7 dias' },
  { value: 'none', label: 'Sem próxima ação' },
];

const FOLLOW_UP_LABEL: Record<FollowUpFilter, string> = {
  overdue: 'Atrasados',
  today: 'Hoje',
  week: 'Próximos 7 dias',
  none: 'Sem próxima ação',
};

const TEMPERATURE_LABEL: Record<string, string> = { COLD: 'Frio', WARM: 'Morno', HOT: 'Quente' };

interface FilterBarProps {
  filters: UsePipelineFiltersResult;
  isSupervisor: boolean;
  owners: TeamUser[];
  /** Ref do campo de busca, usada pelo atalho "/". */
  searchRef: RefObject<HTMLInputElement>;
  /** Ponto de encaixe para filtros avancados. Renderizado no desktop e dentro da folha do celular. */
  advancedSlot?: ReactNode;
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.08)] py-0.5 pl-2.5 pr-1 text-xs font-medium text-[hsl(var(--brand))]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        className="rounded-full p-1 transition-colors hover:bg-[hsl(var(--brand)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

/** Busca, filtros rapidos e chips dos filtros ativos. No celular, os filtros vivem numa folha inferior. */
export function FilterBar({ filters, isSupervisor, owners, searchRef, advancedSlot }: FilterBarProps) {
  const { data: allTags = [] } = useTags();
  // So etiquetas ativas aparecem nos filtros (inativas continuam nos leads, sem filtrar por elas)
  const tags = allTags.filter((t) => t.isActive);
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasAnyFilter = filters.activeFilterCount > 0 || filters.q.length > 0 || filters.searchInput.length > 0;

  const owner = owners.find((o) => o.id === filters.ownerId);
  const selectedTags = tags.filter((t) => filters.tagIds.includes(t.id));
  const productValue = filters.productInterest ?? 'all';

  const toggleTag = (id: number) => {
    const next = filters.tagIds.includes(id) ? filters.tagIds.filter((t) => t !== id) : [...filters.tagIds, id];
    filters.setFilter('tagIds', next);
    if (next.length && filters.untagged) filters.setFilter('untagged', false);
  };

  const toggleUntagged = () => {
    const next = !filters.untagged;
    filters.setFilter('untagged', next);
    if (next && filters.tagIds.length) filters.setFilter('tagIds', []);
  };

  const followUpValue = filters.followUp ?? 'all';

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (isSupervisor && filters.ownerId !== undefined) {
    chips.push({
      key: 'owner',
      label: `Responsável: ${owner?.name ?? `#${filters.ownerId}`}`,
      onRemove: () => filters.setFilter('ownerId', undefined),
    });
  }
  selectedTags.forEach((tag) =>
    chips.push({
      key: `tag-${tag.id}`,
      label: `Etiqueta: ${tag.name}`,
      onRemove: () => toggleTag(tag.id),
    }),
  );
  if (filters.productInterest) {
    chips.push({
      key: 'product',
      label: `Produto: ${PRODUCT_FILTER_LABEL[filters.productInterest]}`,
      onRemove: () => filters.setFilter('productInterest', undefined),
    });
  }
  if (filters.untagged) chips.push({ key: 'untagged', label: 'Sem etiqueta', onRemove: () => filters.setFilter('untagged', false) });
  if (filters.followUp) {
    chips.push({ key: 'follow', label: FOLLOW_UP_LABEL[filters.followUp], onRemove: () => filters.setFilter('followUp', undefined) });
  }
  if (filters.rotting) chips.push({ key: 'rotting', label: 'Esfriando', onRemove: () => filters.setFilter('rotting', false) });
  if (filters.interactionStatus.length) {
    chips.push({
      key: 'interaction',
      label: `Discador: ${filters.interactionStatus.join(', ')}`,
      onRemove: () => filters.setFilter('interactionStatus', []),
    });
  }
  if (filters.temperature.length) {
    chips.push({
      key: 'temp',
      label: `Temperatura: ${filters.temperature.map((t) => TEMPERATURE_LABEL[t] ?? t).join(', ')}`,
      onRemove: () => filters.setFilter('temperature', []),
    });
  }
  if (filters.source.length) {
    chips.push({ key: 'source', label: `Origem: ${filters.source.join(', ')}`, onRemove: () => filters.setFilter('source', []) });
  }
  if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
    const range = [
      filters.valueMin !== undefined ? `mín. ${filters.valueMin}` : null,
      filters.valueMax !== undefined ? `máx. ${filters.valueMax}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    chips.push({
      key: 'value',
      label: `Valor: ${range}`,
      onRemove: () => {
        filters.setFilter('valueMin', undefined);
        filters.setFilter('valueMax', undefined);
      },
    });
  }
  if (filters.createdFrom || filters.createdTo) {
    chips.push({
      key: 'created',
      label: `Criado: ${filters.createdFrom ?? '…'} a ${filters.createdTo ?? '…'}`,
      onRemove: () => {
        filters.setFilter('createdFrom', undefined);
        filters.setFilter('createdTo', undefined);
      },
    });
  }
  if (filters.outcome && filters.outcome !== 'all') {
    chips.push({
      key: 'outcome',
      label: `Status: ${filters.outcome === 'open' ? 'Em aberto' : filters.outcome === 'won' ? 'Ganhos' : 'Perdidos'}`,
      onRemove: () => filters.setFilter('outcome', undefined),
    });
  }

  /** Controles de filtro. Os mesmos nos dois layouts (barra no desktop, folha no celular). */
  const controls = (
    <>
      {isSupervisor && (
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-muted-foreground">Responsável</span>
          <Select
            value={filters.ownerId !== undefined ? String(filters.ownerId) : 'all'}
            onValueChange={(v) => filters.setFilter('ownerId', v === 'all' ? undefined : Number(v))}
          >
            <SelectTrigger aria-label="Filtrar por responsável" className="h-10 w-full bg-[hsl(var(--card-bg))] md:h-9 md:w-44">
              <SelectValue placeholder="Todos os responsáveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-start bg-[hsl(var(--card-bg))] md:h-9 md:w-auto md:justify-center"
            aria-label="Filtrar por etiquetas"
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            Etiquetas
            {(filters.tagIds.length > 0 || filters.untagged) && (
              <span className="rounded-full bg-[hsl(var(--brand))] px-1.5 text-[10px] font-semibold text-primary-foreground">
                {filters.tagIds.length + (filters.untagged ? 1 : 0)}
              </span>
            )}
            <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-60 md:ml-0" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pipeline-scrollbar" role="group" aria-label="Etiquetas">
            <button
              type="button"
              onClick={toggleUntagged}
              aria-pressed={filters.untagged}
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]  "
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border',
                  filters.untagged ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))] text-primary-foreground' : 'border-input ',
                )}
                aria-hidden="true"
              >
                {filters.untagged && <Check className="h-3 w-3" />}
              </span>
              Sem etiqueta
            </button>
            {tags.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground ">Nenhuma etiqueta cadastrada.</p>}
            {tags.map((tag) => {
              const checked = filters.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={checked}
                  className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]  "
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      checked ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))] text-primary-foreground' : 'border-input ',
                    )}
                    aria-hidden="true"
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                  <span className="truncate">{tag.name}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <div className="space-y-1.5">
        <span className="block text-xs font-semibold text-muted-foreground">Produto</span>
        <Select
          value={productValue}
          onValueChange={(v) => filters.setFilter('productInterest', v === 'all' ? undefined : (v as ProductInterest))}
        >
          <SelectTrigger aria-label='Filtrar por produto' className='h-10 w-full bg-[hsl(var(--card-bg))] md:h-9 md:w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos os produtos</SelectItem>
            {PRODUCT_INTERESTS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <span className="block text-xs font-semibold text-muted-foreground">Próxima ação</span>
        <Select
          value={followUpValue}
          onValueChange={(v) => filters.setFilter('followUp', v === 'all' ? undefined : (v as FollowUpFilter))}
        >
          <SelectTrigger aria-label="Filtrar por próxima ação" className="h-10 w-full bg-[hsl(var(--card-bg))] md:h-9 md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOLLOW_UP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {advancedSlot}

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          className="h-10 text-muted-foreground  md:h-9"
          onClick={() => filters.clearFilters()}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
      )}
    </>
  );

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex min-w-0 flex-1 basis-56 items-end gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="pipeline-search" className="block text-xs font-semibold text-muted-foreground">Buscar leads</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " aria-hidden="true" />
              <Input
                ref={searchRef}
                type="search"
                id="pipeline-search"
                placeholder="Nome, empresa, e-mail ou telefone"
                value={filters.searchInput}
                onChange={(e) => filters.setSearchInput(e.target.value)}
                className="h-10 bg-[hsl(var(--card-bg))] pl-9 md:h-9"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSheetOpen(true)}
            aria-label={`Filtros${filters.activeFilterCount ? `, ${filters.activeFilterCount} ativos` : ''}`}
            className="relative h-10 shrink-0 gap-1.5 bg-[hsl(var(--card-bg))] px-3 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtros
            {filters.activeFilterCount > 0 && (
              <span className="rounded-full bg-[hsl(var(--brand))] px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground">
                {filters.activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="hidden flex-wrap items-end gap-2.5 md:flex">{controls}</div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88dvh] gap-4 overflow-y-auto rounded-t-[20px] border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-none"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="pr-10 text-base">Filtros</SheetTitle>
            <SheetDescription>Os filtros valem para o funil e para a lista.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3">{controls}</div>
          <Button type="button" className="h-11" onClick={() => setSheetOpen(false)}>
            Ver leads
          </Button>
        </SheetContent>
      </Sheet>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
