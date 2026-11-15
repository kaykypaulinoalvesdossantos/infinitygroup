'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/atendimento/helpers';
import { currentMonth, formatCents, salesCopilotApi, type GoalProgress } from '@/services/sales-copilot';

interface GoalProgressCardProps {
  /** Mes no formato YYYY-MM. Padrao: mes atual (America/Sao_Paulo). */
  month?: string;
  /** Sem valor = usuario logado; 'team' = meta da equipe; numero = vendedor especifico. */
  userId?: number | 'team';
}

interface MetricRow {
  key: string;
  label: string;
  actual: number;
  target: number | null;
  money: boolean;
}

/** Segundos -> mm:ss (minutos podem passar de 59 em acumulados longos). */
export function formatTalkTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—';
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/** YYYY-MM -> "novembro de 2026". Devolve o texto original quando invalido. */
function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildMetrics(progress: GoalProgress): MetricRow[] {
  const { actuals, targets } = progress;
  return [
    { key: 'calls', label: 'Ligações', actual: actuals.calls, target: targets.callsTarget, money: false },
    { key: 'connected', label: 'Atendidas', actual: actuals.connected, target: targets.connectedTarget, money: false },
    { key: 'meetings', label: 'Reuniões', actual: actuals.meetings, target: targets.meetingsTarget, money: false },
    { key: 'proposals', label: 'Propostas enviadas', actual: actuals.proposals, target: targets.proposalsTarget, money: false },
    { key: 'won', label: 'Vendas', actual: actuals.won, target: targets.wonTarget, money: false },
    { key: 'revenue', label: 'Receita', actual: actuals.revenueCents, target: targets.revenueTargetCents, money: true },
  ];
}

function formatValue(value: number, money: boolean): string {
  return money ? formatCents(value) : value.toLocaleString('pt-BR');
}

function MetricItem({ metric }: { metric: MetricRow }) {
  const target = metric.target;
  const hasTarget = target !== null;
  const percent = hasTarget && target > 0 ? Math.round((metric.actual / target) * 100) : 0;

  return (
    <div className="min-w-0 rounded-xl bg-muted p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{metric.label}</p>
        {hasTarget && <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{percent}%</span>}
      </div>
      <p className="mt-1 break-words text-sm font-semibold tabular-nums text-foreground">
        {formatValue(metric.actual, metric.money)}
        {target !== null && <span className="font-normal text-muted-foreground"> / {formatValue(target, metric.money)}</span>}
      </p>
      {target !== null ? (
        <div className="mt-2">
          <ProgressBar value={metric.actual} max={target} label={`${metric.label}: ${percent}% da meta`} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">sem meta</p>
      )}
    </div>
  );
}

function resolveTitle(userId: number | 'team' | undefined): string {
  if (userId === 'team') return 'Meta da equipe';
  if (typeof userId === 'number') return 'Metas do vendedor';
  return 'Minhas metas';
}

export function GoalProgressCard({ month, userId }: GoalProgressCardProps) {
  const activeMonth = month ?? currentMonth();
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    salesCopilotApi
      .goalProgress(activeMonth, userId)
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar as metas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeMonth, userId, attempt]);

  const avgTalk = progress?.avgTalkSeconds ?? null;
  const conversion = progress?.callToMeetingPercent ?? null;

  return (
    <Card className="rounded-2xl border-0 bg-card shadow-md shadow-slate-200/60" aria-busy={loading}>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Target className="h-5 w-5 shrink-0 text-link" aria-hidden />
            <h2 className="truncate text-base font-semibold text-foreground">{resolveTitle(userId)}</h2>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{monthLabel(activeMonth)}</span>
        </div>

        {loading && !progress ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-link" aria-label="Carregando metas" />
          </div>
        ) : error && !progress ? (
          <div role="alert" className="flex flex-col items-center gap-2 rounded-xl border border-danger-border bg-danger p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-danger-foreground" aria-hidden />
            <p className="text-sm text-danger-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setAttempt((current) => current + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : progress ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {buildMetrics(progress).map((metric) => (
                <MetricItem key={metric.key} metric={metric} />
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <div className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">Tempo médio de conversa</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">{formatTalkTime(avgTalk)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">Conversão atendida → reunião</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {conversion === null ? '—' : `${conversion.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                </dd>
              </div>
            </dl>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
