'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/components/admin/crm/format';
import { pipelineKeys } from '@/components/admin/crm/pipeline/queryKeys';
import { EmptyState } from '@/components/admin/crm/pipeline/ui/EmptyState';
import { cn } from '@/lib/utils';
import { getStoredUser, isSalesRole, isSupervisorRole, teamApi } from '@/services/crm-leads';
import { pipelineApi, type LeadReports } from '@/services/crm-pipeline';
import { FunnelChart } from './FunnelChart';
import { LostReasonsChart } from './LostReasonsChart';
import { MonthlyChart } from './MonthlyChart';
import { ReportPanel } from './ReportPanel';
import { ReportTotals } from './ReportTotals';
import { SellersTable } from './SellersTable';
import { StageDurations } from './StageDurations';
import { fmtIsoBR } from './format';
import { PERIOD_OPTIONS, useReportFilters, type ReportPreset } from './useReportFilters';

const OWNERS_KEY = ['pipeline', 'report-owners'] as const;
const OWNERS_STALE_MS = 5 * 60 * 1000;

const fieldClass =
  'h-10 md:h-9 rounded-lg border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.6)] dark:text-slate-100';

function ReportsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando relatórios">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="shimmer h-20 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="shimmer h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Relatorios gerenciais do funil: totais, funil, tempos, perdas, mensal e vendedores. */
export function ReportsPage() {
  const filters = useReportFilters();
  const { range, preset, ownerId } = filters;

  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [customMode, setCustomMode] = useState(false);
  const [draftFrom, setDraftFrom] = useState(range.from);
  const [draftTo, setDraftTo] = useState(range.to);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    setDraftFrom(range.from);
    setDraftTo(range.to);
  }, [range.from, range.to]);

  const isSupervisor = isSupervisorRole(user?.role);

  const ownersQuery = useQuery({
    queryKey: OWNERS_KEY,
    queryFn: () => teamApi.list(),
    enabled: isSupervisor,
    staleTime: OWNERS_STALE_MS,
  });
  const owners = (ownersQuery.data ?? []).filter((u) => u.active && isSalesRole(u.role));

  // Vendedor: o backend ja restringe aos proprios leads; o filtro so vale para supervisor.
  const effectiveOwner = isSupervisor ? ownerId : undefined;
  const rangeValid = range.from <= range.to;
  const params = { from: range.from, to: range.to, ownerId: effectiveOwner };

  const reportsQuery = useQuery({
    queryKey: pipelineKeys.reports(params),
    queryFn: () => pipelineApi.reports(params),
    placeholderData: keepPreviousData,
    enabled: rangeValid,
  });

  const data: LeadReports | undefined = reportsQuery.data;
  const showCustom = customMode || preset === 'custom';
  const draftInvalid = draftFrom !== '' && draftTo !== '' && draftFrom > draftTo;

  const choosePreset = (value: ReportPreset) => {
    if (value === 'custom') {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    filters.setPreset(value);
  };

  const commitCustom = (from: string, to: string) => {
    if (from && to && from <= to) filters.setRange(from, to);
  };

  const onFromChange = (value: string) => {
    setDraftFrom(value);
    commitCustom(value, draftTo);
  };

  const onToChange = (value: string) => {
    setDraftTo(value);
    commitCustom(draftFrom, value);
  };

  const isEmpty =
    !!data && data.totals.created === 0 && data.totals.won === 0 && data.totals.lost === 0;

  return (
    <div className="min-h-full space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Relatórios do funil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Período de {fmtIsoBR(range.from)} a {fmtIsoBR(range.to)}
          </p>
        </div>
        <Link
          href="/admin/crm/leads"
          className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-md text-sm font-medium text-[hsl(var(--brand))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.6)] sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Pipeline
        </Link>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-3 md:flex-row md:flex-wrap md:items-end">
        <div role="group" aria-label="Período" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {PERIOD_OPTIONS.map((opt) => {
            const active = opt.value === 'custom' ? showCustom : !showCustom && preset === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => choosePreset(opt.value)}
                className={cn(
                  'min-h-10 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors md:min-h-0 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand)/0.6)] focus-visible:outline-none',
                  active
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {showCustom && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              De
              <input
                type="date"
                value={draftFrom}
                max={draftTo || undefined}
                onChange={(e) => onFromChange(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Até
              <input
                type="date"
                value={draftTo}
                min={draftFrom || undefined}
                onChange={(e) => onToChange(e.target.value)}
                className={fieldClass}
              />
            </label>
            {draftInvalid && (
              <p role="alert" className="w-full text-xs text-red-600 dark:text-red-400">
                A data inicial deve ser anterior à data final.
              </p>
            )}
          </div>
        )}

        {isSupervisor && (
          <div className="md:ml-auto">
            <Select
              value={ownerId !== undefined ? String(ownerId) : 'all'}
              onValueChange={(v) => filters.setOwner(v === 'all' ? undefined : Number(v))}
            >
              <SelectTrigger aria-label="Filtrar por responsável" className="h-9 w-full bg-[hsl(var(--card-bg))] md:w-56">
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
      </div>

      {!rangeValid && (
        <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Período inválido: a data inicial é posterior à final.
        </div>
      )}

      {rangeValid && reportsQuery.isError && !data && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          <p>{errorMessage(reportsQuery.error, 'Não foi possível carregar os relatórios.')}</p>
          <button
            type="button"
            onClick={() => reportsQuery.refetch()}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-transparent dark:text-red-200 dark:hover:bg-red-900/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tentar de novo
          </button>
        </div>
      )}

      {rangeValid && !data && !reportsQuery.isError && <ReportsSkeleton />}

      {data && (
        <div
          className={cn('space-y-6 transition-opacity duration-200', reportsQuery.isFetching && 'opacity-60')}
          aria-busy={reportsQuery.isFetching}
        >
          <ReportTotals totals={data.totals} />

          {isEmpty ? (
            <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))]">
              <EmptyState
                icon={BarChart3}
                title="Nenhum lead neste período"
                description="Escolha outro período ou remova o filtro de responsável."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ReportPanel title="Funil por etapa" description="Leads que chegaram a cada etapa no período.">
                <FunnelChart funnel={data.funnel} />
              </ReportPanel>
              <ReportPanel title="Tempo médio por etapa" description="Dias em média que os leads ficam em cada etapa.">
                <StageDurations durations={data.stageDurations} funnel={data.funnel} />
              </ReportPanel>
              <ReportPanel title="Motivos de perda" description="Contagem e percentual sobre os leads perdidos.">
                <LostReasonsChart reasons={data.lostReasons} />
              </ReportPanel>
              <ReportPanel title="Leads por mês" description="Criados, ganhos e perdidos por mês.">
                <MonthlyChart monthly={data.monthly} />
              </ReportPanel>
              <ReportPanel title="Vendedores" description="Desempenho no período. Clique no cabeçalho para ordenar." className="lg:col-span-2">
                <SellersTable sellers={data.sellers} />
              </ReportPanel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
