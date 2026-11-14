'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarClock, Headset, ListTodo, Mail, PhoneCall, Radio, Search, ShieldAlert, Timer, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePolling } from '@/hooks/use-polling';
import {
  CallStatusPill,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Pill,
  SectionCard,
  SessionStatePill,
  StatTile,
  formatRelative,
  secondsSince,
  useNow,
  type Tone,
} from '@/components/atendimento/helpers';
import { getStoredUser, isSupervisorRole } from '@/services/crm-leads';
import { formatDuration, telephonyService, type SupervisionAgent } from '@/services/telephony';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Administrador',
  LIDER: 'Líder',
  VENDEDOR: 'Vendedor',
};

function deviceTone(agent: SupervisionAgent): { label: string; tone: Tone } {
  const device = agent.device;
  if (!device) return { label: 'Sem ramal', tone: 'slate' };
  if (!device.connected) return { label: 'Offline', tone: 'red' };
  if (!device.idle) return { label: 'Em ligação', tone: 'blue' };
  if (!device.ready) return { label: 'Não pronto', tone: 'amber' };
  return { label: 'Online', tone: 'green' };
}

function AccessRestricted() {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <Card className="mx-auto max-w-md border-0 shadow-lg rounded-2xl bg-white">
        <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" aria-hidden />
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Acesso restrito</h1>
          <p className="text-sm text-[#64748B]">A supervisão do atendimento é exclusiva para administradores e líderes.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisionView() {
  const supervision = usePolling(() => telephonyService.getSupervision(), 4000);
  const now = useNow(true, 1000);

  const [search, setSearch] = useState('');
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyInCall, setOnlyInCall] = useState(false);

  const data = supervision.data;
  const totals = data?.totals;

  const agents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.agents ?? []).filter((agent) => {
      if (term && !agent.name.toLowerCase().includes(term)) return false;
      if (onlyOnline && !agent.device?.connected) return false;
      if (onlyInCall && !agent.currentCall) return false;
      return true;
    });
  }, [data, search, onlyOnline, onlyInCall]);

  const initialLoading = supervision.loading && !data;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader
          title="Supervisão"
          icon={<Headset className="h-8 w-8 text-[#0076FF]" />}
          description="Acompanhe ramais, filas e ligações da equipe em tempo quase real."
          actions={<span className="flex items-center gap-2 text-xs text-[#64748B]"><Radio className="h-3.5 w-3.5 text-emerald-500" />Atualiza a cada 4 segundos</span>}
        />

        {supervision.error && !data && <ErrorState message={supervision.error} onRetry={() => void supervision.refresh()} />}

        {initialLoading ? (
          <LoadingBlock rows={6} />
        ) : totals ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile icon={<Users className="h-5 w-5" />} label="Atendentes" value={totals.agents} />
            <StatTile icon={<Radio className="h-5 w-5" />} label="Ramais online" value={totals.devicesOnline} tone="green" />
            <StatTile icon={<PhoneCall className="h-5 w-5" />} label="Em ligação" value={totals.inCall} tone="blue" />
            <StatTile icon={<Activity className="h-5 w-5" />} label="Filas rodando" value={totals.sessionsRunning} tone="green" />
            <StatTile icon={<PhoneCall className="h-5 w-5" />} label="Ligações hoje" value={totals.callsToday} />
            <StatTile icon={<Activity className="h-5 w-5" />} label="Atendidas hoje" value={totals.answeredToday} tone="green" />
            <StatTile icon={<Timer className="h-5 w-5" />} label="Tempo falado hoje" value={formatDuration(totals.talkSecToday)} tone="slate" />
            <StatTile icon={<Users className="h-5 w-5" />} label="Filas pausadas" value={totals.sessionsPaused} tone="amber" />
            <StatTile icon={<ListTodo className="h-5 w-5" />} label="Pendências abertas" value={totals.operations.openTasks} tone="blue" />
            <StatTile icon={<Timer className="h-5 w-5" />} label="Pendências vencidas" value={totals.operations.overdueTasks} tone="amber" />
            <StatTile icon={<Mail className="h-5 w-5" />} label="Falhas de e-mail hoje" value={totals.operations.emailFailures} tone="red" />
            <StatTile icon={<CalendarClock className="h-5 w-5" />} label="Falhas de convite" value={totals.operations.inviteFailures} tone="red" />
          </div>
        ) : null}

        {data?.breakdowns && (
          <SectionCard
            title="Desempenho de hoje por canal, produto e campanha"
            description="Ligações do chip e WaCalls são contabilizadas como tentativas separadas. Leads com mais de um produto aparecem em cada produto relacionado."
          >
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { title: 'Canal', rows: data.breakdowns.byChannel },
                { title: 'Produto', rows: data.breakdowns.byProduct },
                { title: 'Campanha', rows: data.breakdowns.byCampaign },
              ].map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">{group.title}</h3>
                  {group.rows.length === 0 ? (
                    <p className="text-sm text-[#64748B]">Sem registros hoje.</p>
                  ) : (
                    <ul className="space-y-3">
                      {group.rows.map((row) => (
                        <li key={row.key} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm">
                          <span className="min-w-0 truncate text-[#475569]">{row.label}</span>
                          <span className="shrink-0 text-right tabular-nums text-[#1A1A1A]">
                            {row.calls} tentativa(s) · {row.answered} atendida(s)
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard title="Atendentes" description={`${agents.length} de ${data?.agents.length ?? 0} exibido(s)`}>
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative w-full max-w-xs">
              <Label htmlFor="search-agent" className="mb-2 block">Buscar por nome</Label>
              <Search className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#64748B]" aria-hidden />
              <Input
                id="search-agent"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome do atendente"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch id="only-online" checked={onlyOnline} onCheckedChange={setOnlyOnline} />
              <Label htmlFor="only-online">Só online</Label>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch id="only-incall" checked={onlyInCall} onCheckedChange={setOnlyInCall} />
              <Label htmlFor="only-incall">Em ligação</Label>
            </div>
          </div>

          {initialLoading ? (
            <LoadingBlock rows={5} />
          ) : (data?.agents ?? []).length === 0 ? (
            <EmptyState title="Nenhum atendente encontrado" description="Os vendedores e líderes ativos aparecem aqui." />
          ) : agents.length === 0 ? (
            <EmptyState title="Nenhum atendente com esses filtros" description="Ajuste a busca ou desmarque os filtros." />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atendente</TableHead>
                    <TableHead>Ramal</TableHead>
                    <TableHead>Fila</TableHead>
                    <TableHead>Ligação atual</TableHead>
                    <TableHead className="text-right">Ligações no chip</TableHead>
                    <TableHead className="text-right">Atendidas</TableHead>
                    <TableHead className="text-right">Falado</TableHead>
                    <TableHead>Comercial</TableHead>
                    <TableHead>Reuniões</TableHead>
                    <TableHead>WhatsApp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => {
                    const device = deviceTone(agent);
                    const session = agent.session;
                    return (
                      <TableRow key={agent.userId}>
                        <TableCell>
                          <p className="font-medium text-[#1A1A1A]">{agent.name}</p>
                          <p className="text-xs text-[#64748B]">{ROLE_LABEL[agent.role] ?? agent.role}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Pill tone={device.tone}>{device.label}</Pill>
                            {agent.device && (
                              <span className="text-xs text-[#64748B] whitespace-nowrap">
                                {agent.device.mode === 'FULL' ? 'Completo' : 'Lite'} · {agent.device.simLabel || 'Chip não informado'}
                              </span>
                            )}
                            <span className="text-xs text-[#64748B] whitespace-nowrap">
                              Último sinal: {formatRelative(agent.device?.lastSeenAt, now)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session ? (
                            <div className="flex flex-col gap-1">
                              <SessionStatePill state={session.state} />
                              <span className="text-xs text-[#64748B] tabular-nums">
                                {session.completed + session.skipped}/{session.total} · {session.campaignName ?? 'Meus leads novos'}
                              </span>
                            </div>
                          ) : (
                            <Pill tone="slate">Sem fila</Pill>
                          )}
                        </TableCell>
                        <TableCell>
                          {agent.currentCall ? (
                            <div className="flex flex-col gap-1">
                              <CallStatusPill status={agent.currentCall.status} />
                              <span className="text-sm truncate max-w-[200px]">{agent.currentCall.leadName || 'Lead sem nome'}</span>
                              <span className="text-xs tabular-nums text-[#64748B]">
                                {formatDuration(secondsSince(agent.currentCall.since, now))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#64748B]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{agent.today.calls}</TableCell>
                        <TableCell className="text-right tabular-nums">{agent.today.answered}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatDuration(agent.today.talkSec)}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs tabular-nums text-[#475569]">
                            <p>{agent.operations.openTasks} pendência(s) aberta(s) · {agent.operations.overdueTasks} vencida(s)</p>
                            <p>{agent.operations.emailsSent} e-mail(s) enviado(s) · {agent.operations.emailFailures} falha(s) · {agent.operations.emailPending} em reconciliação</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs tabular-nums text-[#475569]">
                            <p>{agent.operations.meetingsToday} reunião(ões) hoje</p>
                            <p>{agent.operations.invitesRequested} convite(s) solicitado(s) · {agent.operations.invitesPending} pendente(s) · {agent.operations.inviteFailures} falha(s)</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs tabular-nums text-[#475569]">
                            <p>{agent.operations.whatsappReplies} resposta(s) recebida(s) · {agent.operations.whatsappSendFailures} envio(s) falho(s)</p>
                            <p>{agent.operations.whatsappCalls} ligação(ões) WaCalls · {agent.operations.whatsappCallFailures} falha(s)</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default function SupervisaoPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setAllowed(isSupervisorRole(getStoredUser()?.role));
  }, []);

  if (allowed === null) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
        <LoadingBlock rows={6} />
      </div>
    );
  }

  return allowed ? <SupervisionView /> : <AccessRestricted />;
}
