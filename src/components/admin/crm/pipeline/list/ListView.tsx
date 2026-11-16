'use client';

import { useMemo, type MouseEvent } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CALL_STATUS_LABEL, type PhoneCallStatus } from '@/services/telephony';
import { formatCurrencyBRL, formatDateTime, formatPhone } from '@/components/admin/crm/format';
import { useLeadList } from '../hooks/usePipelineData';
import type { useBulkSelection } from '../hooks/useBulkSelection';
import type { UsePipelineFiltersResult } from '../hooks/usePipelineFilters';
import type { LeadListParams, LeadSort, PipelineLead, PipelineStage } from '@/services/crm-pipeline';
import { StageBadge } from '../ui/StageBadge';
import { TagChip } from '../ui/TagChip';
import { OwnerAvatar } from '../ui/OwnerAvatar';
import { URGENCY_META, getUrgency } from '../tokens';

type Selection = ReturnType<typeof useBulkSelection>;

const PAGE_SIZE = 25;

/** Ordem padrao por coluna ordenavel (ao trocar de coluna). */
const DEFAULT_ORDER: Record<LeadSort, 'asc' | 'desc'> = {
  name: 'asc',
  nextActionAt: 'asc',
  value: 'desc',
  updatedAt: 'desc',
  createdAt: 'desc',
};

interface ListViewProps {
  filters: UsePipelineFiltersResult;
  stages: PipelineStage[];
  isSupervisor: boolean;
  callingId: number | null;
  selection: Selection;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
}

/** Cabecalho ordenavel: mostra a seta da coluna ativa. */
function SortHead({
  label,
  sortKey,
  filters,
  className,
}: {
  label: string;
  sortKey: LeadSort;
  filters: UsePipelineFiltersResult;
  className?: string;
}) {
  const active = filters.sort === sortKey;
  const order = filters.order ?? DEFAULT_ORDER[sortKey];
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;
  const onClick = () => {
    if (active) {
      filters.setFilter('order', order === 'asc' ? 'desc' : 'asc');
    } else {
      filters.setFilter('sort', sortKey);
      filters.setFilter('order', undefined);
    }
  };
  return (
    <TableHead className={className} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] ',
          active ? 'text-foreground ' : 'text-muted-foreground ',
        )}
      >
        {label}
        <Icon className={cn('h-3.5 w-3.5', active ? 'opacity-100' : 'opacity-50')} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

/** Lista de leads com ordenacao, selecao, paginacao com total real e acoes rapidas. */
export function ListView({ filters, stages, isSupervisor, callingId, selection, onCall, onOpen }: ListViewProps) {
  const sort: LeadSort = filters.sort ?? 'updatedAt';
  const order = filters.order ?? DEFAULT_ORDER[sort];

  const params = useMemo<LeadListParams>(
    () => ({
      ...filters.apiFilters,
      outcome: filters.outcome ?? 'all',
      sort,
      order,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    [filters.apiFilters, filters.outcome, filters.page, sort, order],
  );

  const { data, isPending, isFetching } = useLeadList(params);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const pageIds = items.map((item) => item.id);
  const selectedOnPage = items.filter((item) => selection.isSelected(item.id, (item.funnelStage?.id ?? 0))).map((item) => item.id);
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleAllOnPage = () => {
    if (allOnPageSelected) {
      items.forEach((item) => selection.toggle(item.id, { stageId: (item.funnelStage?.id ?? 0) }));
    } else {
      items.filter((item) => !selection.isSelected(item.id, (item.funnelStage?.id ?? 0))).forEach((item) => selection.toggle(item.id, { stageId: (item.funnelStage?.id ?? 0), orderedIds: pageIds }));
    }
  };

  const columnCount = 10;

  return (
    <section aria-label="Lista de leads" className="space-y-3">
      {/* Celular: cartoes empilhados (a tabela so aparece a partir de md) */}
      <ul className="space-y-2 md:hidden" aria-busy={isPending}>
        {isPending &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={`msk-${i}`} className="shimmer h-28 w-full rounded-xl" />)}
        {data && items.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground ">Nenhum lead encontrado com os filtros atuais.</li>
        )}
        {items.map((lead) => {
          const selected = selection.isSelected(lead.id, (lead.funnelStage?.id ?? 0));
          const stage = stageById.get(lead.funnelStage?.id ?? 0);
          const urgency = getUrgency(lead.nextActionAt);
          return (
            <li
              key={lead.id}
              data-state={selected ? 'selected' : undefined}
              className={cn(
                'rounded-xl border bg-[hsl(var(--card-bg))] p-3 shadow-sm',
                selected ? 'border-[hsl(var(--brand)/0.5)] ring-1 ring-[hsl(var(--brand)/0.35)]' : 'border-[hsl(var(--card-border))]',
              )}
            >
              <div className="flex items-start gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`Selecionar ${lead.name}`}
                    checked={selected}
                    onClick={(e) => {
                      e.stopPropagation();
                      selection.toggle(lead.id, { stageId: (lead.funnelStage?.id ?? 0), orderedIds: pageIds, shift: e.shiftKey });
                    }}
                    className="mt-1"
                  />
                </div>
                <button type="button" onClick={() => onOpen(lead.id)} className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]">
                  <span className="block font-semibold text-foreground [overflow-wrap:anywhere]">{lead.name}</span>
                  {lead.company && <span className="block text-sm text-muted-foreground [overflow-wrap:anywhere]">{lead.company}</span>}
                  {(lead.phone || lead.phone2) && <span className="block text-sm tabular-nums text-muted-foreground">{formatPhone(lead.phone || lead.phone2)}</span>}
                  <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    {stage ? <StageBadge name={stage.name} color={stage.color} /> : <span className="text-xs text-muted-foreground">{lead.funnelStage?.name ?? 'Sem etapa'}</span>}
                    <span className="font-medium tabular-nums text-foreground ">{formatCurrencyBRL(lead.value)}</span>
                  </span>
                  <span className={cn('mt-2 inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium', URGENCY_META[urgency].className)}>
                    {urgency === 'none' ? URGENCY_META.none.label : formatDateTime(lead.nextActionAt)}
                  </span>
                </button>
              </div>
              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 border-[hsl(var(--stage-won)/0.4)] text-[hsl(var(--stage-won))] hover:bg-[hsl(var(--stage-won)/0.08)]"
                  aria-label={`Ligar para ${lead.name}`}
                  disabled={!(lead.phone || lead.phone2) || callingId === lead.id}
                  onClick={() => onCall(lead as PipelineLead)}
                >
                  {callingId === lead.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                  Ligar
                </Button>
                <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => onOpen(lead.id)}>
                  Abrir
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] shadow-sm md:block">
        <div className="overflow-x-auto pipeline-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/80 hover:bg-muted/80 ">
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Selecionar todos desta página"
                    checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAllOnPage}
                    disabled={items.length === 0}
                  />
                </TableHead>
                <SortHead label="Nome" sortKey="name" filters={filters} />
                <TableHead>Etapa</TableHead>
                <SortHead label="Valor" sortKey="value" filters={filters} />
                <TableHead>Prob.</TableHead>
                {isSupervisor && <TableHead>Responsável</TableHead>}
                <SortHead label="Próxima ação" sortKey="nextActionAt" filters={filters} />
                <TableHead>Etiquetas</TableHead>
                <TableHead>Última ligação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={columnCount + (isSupervisor ? 0 : -1)}>
                      <Skeleton className="shimmer h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {data && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnCount + (isSupervisor ? 0 : -1)} className="py-12 text-center text-sm text-muted-foreground ">
                    Nenhum lead encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}

              {items.map((lead) => {
                const selected = selection.isSelected(lead.id, (lead.funnelStage?.id ?? 0));
                const stage = stageById.get(lead.funnelStage?.id ?? 0);
                const urgency = getUrgency(lead.nextActionAt);
                const callLabel = lead.lastCall ? (CALL_STATUS_LABEL[lead.lastCall.status as PhoneCallStatus] ?? lead.lastCall.status) : null;
                return (
                  <TableRow
                    key={lead.id}
                    data-state={selected ? 'selected' : undefined}
                    onClick={() => onOpen(lead.id)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e: MouseEvent) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Selecionar ${lead.name}`}
                        checked={selected}
                        onClick={(e) => {
                          e.stopPropagation();
                          selection.toggle(lead.id, { stageId: (lead.funnelStage?.id ?? 0), orderedIds: pageIds, shift: e.shiftKey });
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="truncate font-semibold text-foreground" title={lead.name}>{lead.name}</p>
                      <p className="truncate text-xs text-muted-foreground" title={lead.company ?? undefined}>{lead.company || formatPhone(lead.phone || lead.phone2)}</p>
                    </TableCell>
                    <TableCell>
                      {stage ? (
                        <StageBadge name={stage.name} color={stage.color} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{lead.funnelStage?.name ?? 'Sem etapa'}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums font-medium text-foreground ">
                      {formatCurrencyBRL(lead.value)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground ">{lead.effectiveProbability}%</TableCell>
                    {isSupervisor && (
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2">
                          <OwnerAvatar name={lead.owner?.name} id={lead.ownerId} />
                          <span className="truncate text-sm text-muted-foreground ">{lead.owner?.name ?? 'Sem responsável'}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap">
                      <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium', URGENCY_META[urgency].className)}>
                        {urgency === 'none' ? URGENCY_META.none.label : formatDateTime(lead.nextActionAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {lead.tags.slice(0, 3).map((tag) => (
                          <TagChip key={tag.id} name={tag.name} color={tag.color} />
                        ))}
                        {lead.tags.length > 3 && <span className="text-[11px] text-muted-foreground">+{lead.tags.length - 3}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground ">
                      {lead.lastCall ? (
                        <>
                          {formatDateTime(lead.lastCall.createdAt)}
                          <span className="block text-xs text-muted-foreground ">{callLabel}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={`Ligar para ${lead.name}`}
                          disabled={!(lead.phone || lead.phone2) || callingId === lead.id}
                          onClick={() => onCall(lead as PipelineLead)}
                          className="h-8 border-[hsl(var(--stage-won)/0.4)] text-[hsl(var(--stage-won))] hover:bg-[hsl(var(--stage-won)/0.08)]"
                        >
                          {callingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                          Ligar
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => onOpen(lead.id)}>
                          Abrir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {data && total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground  sm:flex-row">
          <span className="tabular-nums">
            {total} lead(s) · página {filters.page} de {totalPages}
            {isFetching && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin align-[-2px]" aria-label="Atualizando" />}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={filters.page <= 1 || isFetching}
              onClick={() => filters.setFilter('page', filters.page - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages || isFetching}
              onClick={() => filters.setFilter('page', filters.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
