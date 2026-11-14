'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock, PhoneCall as PhoneCallIcon, PhoneIncoming, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePolling } from '@/hooks/use-polling';
import { fetchCalls, fetchKpis } from '@/components/atendimento/telephony-query';
import {
  CallStatusPill,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SectionCard,
  StatTile,
  dateInputToIso,
  dispositionLabel,
  formatDateTime,
  formatPhone,
  startOfDayIso,
} from '@/components/atendimento/helpers';
import { getStoredUser, isSupervisorRole } from '@/services/crm-leads';
import {
  CALL_STATUS_LABEL,
  CONTACT_OUTCOME_LABEL,
  formatDuration,
  type Paginated,
  telephonyService,
  type PhoneCall,
  type PhoneCallStatus,
  type TelephonyKpis,
  type DialerCampaign,
} from '@/services/telephony';

type Period = 'hoje' | '7d' | '30d' | 'custom';
type StatusFilter = 'ALL' | PhoneCallStatus;

const PERIOD_LABEL: Record<Period, string> = {
  hoje: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  custom: 'Personalizado',
};

const STATUS_OPTIONS = Object.keys(CALL_STATUS_LABEL) as PhoneCallStatus[];
const PAGE_SIZE = 20;

interface Range {
  from: string;
  to?: string;
}

function presetRange(period: Exclude<Period, 'custom'>): Range {
  // Periodos predefinidos sao abertos (so "from"), para incluir ligacoes feitas depois de abrir a tela.
  if (period === 'hoje') return { from: startOfDayIso(0) };
  if (period === '7d') return { from: startOfDayIso(6) };
  return { from: startOfDayIso(29) };
}

function HorizontalBars({ items, emptyLabel }: { items: { label: string; value: number }[]; emptyLabel: string }) {
  if (items.length === 0) return <EmptyState title={emptyLabel} />;
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-[#1A1A1A] truncate">{item.label}</span>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded bg-slate-100">
            <div
              className="h-2.5 rounded bg-[#0076FF] transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function HourChart({ byHour }: { byHour: TelephonyKpis['byHour'] }) {
  const hours = Array.from({ length: 24 }, (_, hour) => {
    const found = byHour.find((item) => item.hour === hour);
    return { hour, calls: found?.calls ?? 0, connected: found?.technicalConnections ?? 0 };
  });
  const max = Math.max(...hours.map((item) => item.calls), 1);
  return (
    <div>
      <div className="flex h-44 items-end gap-1">
        {hours.map((item) => {
          const totalPct = (item.calls / max) * 100;
          const connectedPct = item.calls > 0 ? (item.connected / item.calls) * totalPct : 0;
          return (
            <div
              key={item.hour}
              className="relative flex-1 h-full flex items-end"
              title={`${String(item.hour).padStart(2, '0')}h: ${item.calls} ligação(ões), ${item.connected} conexão(ões) técnica(s)`}
            >
              <div className="w-full rounded-t bg-blue-100" style={{ height: `${totalPct}%` }}>
                <div className="absolute bottom-0 w-full rounded-t bg-[#0076FF]" style={{ height: `${connectedPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-[#64748B]">
        {hours.map((item) => (
          <span key={item.hour} className="flex-1 text-center tabular-nums">
            {item.hour % 3 === 0 ? String(item.hour).padStart(2, '0') : ''}
          </span>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-4 text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-100" />Ligações</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#0076FF]" />Conexões técnicas</span>
      </p>
    </div>
  );
}

function ReportsView({ isSupervisor }: { isSupervisor: boolean }) {
  const [period, setPeriod] = useState<Period>('hoje');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [campaignFilter, setCampaignFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const range: Range | null = useMemo(() => {
    if (period !== 'custom') return presetRange(period);
    const from = dateInputToIso(customFrom);
    const to = dateInputToIso(customTo, true);
    if (!from || !to || from > to) return null;
    return { from, to };
  }, [period, customFrom, customTo]);

  const userId = isSupervisor && userFilter !== 'ALL' ? Number(userFilter) : undefined;
  const campaignId = campaignFilter !== 'ALL' ? Number(campaignFilter) : undefined;
  const campaigns = usePolling<DialerCampaign[]>(() => telephonyService.listCampaigns(), 60000);
  const from = range?.from;
  const to = range?.to;

  // KPIs sem filtro de usuario: alimentam a lista de vendedores e o grafico por usuario.
  const allKpis = usePolling<TelephonyKpis | null>(
    () => (range ? fetchKpis({ from: range.from, to: range.to, campaignId }) : Promise.resolve(null)),
    30000,
    [from, to, campaignId],
  );
  // KPIs filtrados pelo vendedor escolhido (quando houver filtro).
  const filteredKpis = usePolling<TelephonyKpis | null>(
    () => (range && userId !== undefined ? fetchKpis({ from: range.from, to: range.to, userId, campaignId }) : Promise.resolve(null)),
    30000,
    [from, to, userId, campaignId],
  );
  const kpis = userId !== undefined && filteredKpis.data ? filteredKpis.data : allKpis.data ?? null;

  const history = usePolling<Paginated<PhoneCall> | null>(
    () =>
      range
        ? fetchCalls({
            from: range.from,
            to: range.to,
            userId,
            campaignId,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            page,
            pageSize: PAGE_SIZE,
          })
        : Promise.resolve(null),
    30000,
    [from, to, userId, campaignId, statusFilter, page],
  );

  useEffect(() => {
    setPage(1);
  }, [period, customFrom, customTo, userFilter, campaignFilter, statusFilter]);

  const dispositionItems = useMemo(
    () =>
      Object.entries(kpis?.byDisposition ?? {})
        .map(([key, value]) => ({ label: dispositionLabel(key), value }))
        .sort((a, b) => b.value - a.value),
    [kpis],
  );

  const totalPages = history.data ? Math.max(1, Math.ceil(history.data.total / PAGE_SIZE)) : 1;
  const customInvalid = period === 'custom' && !range;
  const loadingKpis = allKpis.loading && !allKpis.data;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader
          title="Relatórios"
          icon={<BarChart3 className="h-8 w-8 text-[#0076FF]" />}
          description="Desempenho das ligações por período, resultado e horário."
        />

        <SectionCard title="Período" description="Escolha o intervalo para os indicadores e o histórico.">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-56 space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger id="period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABEL) as Period[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {PERIOD_LABEL[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <>
                <div className="w-full sm:w-44 space-y-2">
                  <Label htmlFor="from">De</Label>
                  <Input id="from" type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
                </div>
                <div className="w-full sm:w-44 space-y-2">
                  <Label htmlFor="to">Até</Label>
                  <Input id="to" type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
                </div>
              </>
            )}

            {isSupervisor && (
              <div className="w-full sm:w-64 space-y-2">
                <Label htmlFor="user">Vendedor</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger id="user" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Toda a equipe</SelectItem>
                    {(allKpis.data?.byUser ?? []).map((item) => (
                      <SelectItem key={item.userId} value={String(item.userId)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-full sm:w-64 space-y-2">
              <Label htmlFor="campaign">Campanha</Label>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger id="campaign" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as campanhas</SelectItem>
                  {(campaigns.data ?? []).map((campaign) => (
                    <SelectItem key={campaign.id} value={String(campaign.id)}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {customInvalid && (
            <p className="text-sm text-amber-700">Informe as datas de início e fim (a data inicial não pode ser depois da final).</p>
          )}
        </SectionCard>

        {allKpis.error && !allKpis.data && <ErrorState message={allKpis.error} onRetry={() => void allKpis.refresh()} />}

        {loadingKpis ? (
          <LoadingBlock rows={4} />
        ) : kpis ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile icon={<PhoneCallIcon className="h-5 w-5" />} label="Ligações" value={kpis.calls}
                hint={`${kpis.noAnswer} sem resposta · ${kpis.failed} falha(s)`} />
              <StatTile icon={<PhoneIncoming className="h-5 w-5" />} label="Conexões técnicas" value={kpis.technicalConnections ?? '—'} tone="blue"
                hint="Conexão detectada pelo aparelho" />
              <StatTile icon={<Target className="h-5 w-5" />} label="Conversas humanas" value={kpis.humanContacts ?? '—'} tone="green"
                hint={kpis.avgHumanTalkSec != null ? `Média medida de ${formatDuration(kpis.avgHumanTalkSec)}` : 'Confirmadas na tabulação'} />
              <StatTile icon={<Clock className="h-5 w-5" />} label="Caixa postal" value={kpis.voicemails ?? '—'} tone="slate"
                hint="Registrada na tabulação" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Resultados" description="Ligações por resultado registrado">
                <HorizontalBars items={dispositionItems} emptyLabel="Nenhum resultado registrado no período" />
              </SectionCard>
              <SectionCard title="Ligações por horário" description="Distribuição das 24 horas do dia">
                <HourChart byHour={kpis.byHour} />
              </SectionCard>
            </div>

            {isSupervisor && (
              <SectionCard title="Por vendedor" description="Desempenho de cada atendente no período">
                {kpis.byUser.length === 0 ? (
                  <EmptyState title="Nenhuma ligação no período" />
                ) : (
                  <div className="overflow-x-auto -mx-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead className="text-right">Ligações</TableHead>
                          <TableHead className="text-right">Conexões técnicas</TableHead>
                          <TableHead className="text-right">Conversas humanas</TableHead>
                          <TableHead className="text-right">Caixa postal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(allKpis.data?.byUser ?? kpis.byUser).map((item) => (
                          <TableRow key={item.userId}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.calls}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.technicalConnections ?? '—'}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.humanContacts ?? '—'}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.voicemails ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </SectionCard>
            )}
          </>
        ) : null}

        <SectionCard
          title="Histórico de ligações"
          description={history.data ? `${history.data.total} ligação(ões) no período` : 'Ligações do período'}
          action={
            <div className="w-full sm:w-56">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger aria-label="Filtrar por status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {CALL_STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        >
          {customInvalid ? (
            <EmptyState title="Período incompleto" description="Informe o período personalizado para ver o histórico." />
          ) : history.error && !history.data ? (
            <ErrorState message={history.error} onRetry={() => void history.refresh()} />
          ) : history.loading && !history.data ? (
            <LoadingBlock rows={6} />
          ) : (history.data?.items ?? []).length === 0 ? (
            <EmptyState title="Nenhuma ligação encontrada" description="Ajuste o período ou o filtro de status." />
          ) : (
            <>
              <div className="overflow-x-auto -mx-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      {isSupervisor && <TableHead>Vendedor</TableHead>}
                      <TableHead>Lead</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead className="text-right">Falado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(history.data?.items ?? []).map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="whitespace-nowrap">{formatDateTime(call.createdAt)}</TableCell>
                        {isSupervisor && <TableCell>{call.userName || '-'}</TableCell>}
                        <TableCell className="max-w-[200px] truncate">{call.leadName || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatPhone(call.phone)}</TableCell>
                        <TableCell>
                          <CallStatusPill status={call.status} />
                        </TableCell>
                        <TableCell>{dispositionLabel(call.disposition)}</TableCell>
                        <TableCell>{CONTACT_OUTCOME_LABEL[call.contactOutcome ?? (call.disposition === 'VOICEMAIL' ? 'VOICEMAIL' : 'UNKNOWN')]}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatDuration(call.talkSec)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-sm text-[#64748B] tabular-nums">
                  Página {history.data?.page ?? page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const [isSupervisor, setIsSupervisor] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupervisor(isSupervisorRole(getStoredUser()?.role));
  }, []);

  if (isSupervisor === null) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
        <LoadingBlock rows={6} />
      </div>
    );
  }

  return <ReportsView isSupervisor={isSupervisor} />;
}
