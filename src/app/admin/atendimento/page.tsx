'use client';
import { DownloadRamalAppButton } from '@/components/ramal/DownloadRamalAppButton';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarClock, Clock, Headset, ListOrdered, Pause, Phone, Play, Smartphone, Square } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DispositionDialog } from '@/components/ramal/DispositionDialog';
import { usePolling } from '@/hooks/use-polling';
import {
  CallStatusPill,
  DEVICE_MODE_LABEL,
  DevicePill,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Pill,
  SectionCard,
  SessionStatePill,
  StatTile,
  formatDateTime,
  formatPhone,
  formatRelative,
  formatTime,
  getErrorMessage,
  isDeviceReady,
  dispositionLabel,
  secondsSince,
  useNow,
  ProgressBar,
} from '@/components/atendimento/helpers';
import { fetchCalls } from '@/components/atendimento/telephony-query';
import {
  formatDuration,
  telephonyService,
  type DialerSession,
  type PhoneCall,
  type TelephonyDevice,
} from '@/services/telephony';

const DISPOSITION_REQUIRED = ['COMPLETED', 'NO_ANSWER', 'FAILED', 'ENDED_UNKNOWN'];

function isLiveSession(session: DialerSession | null | undefined): boolean {
  return !!session && (session.state === 'RUNNING' || session.state === 'PAUSED');
}

export default function MinhaFilaPage() {
  const queue = usePolling(() => telephonyService.getMyQueue(), 4000);
  const calls = usePolling(() => fetchCalls({ pageSize: 20 }), 6000);
  const now = useNow(true, 1000);

  const [busy, setBusy] = useState<string | null>(null);
  const [dispositionCall, setDispositionCall] = useState<PhoneCall | null>(null);
  const [dispositionOpen, setDispositionOpen] = useState(false);

  const device: TelephonyDevice | null = queue.data?.device ?? null;
  const session: DialerSession | null = queue.data?.session ?? null;
  const live = isLiveSession(session);
  const deviceReady = isDeviceReady(device);
  const callbacks = queue.data?.callbacks ?? [];
  const today = queue.data?.today ?? { calls: 0, answered: 0, talkSec: 0 };

  const refreshAll = () => Promise.all([queue.refresh(), calls.refresh()]).then(() => undefined);

  const runAction = async (key: string, action: () => Promise<unknown>, success: string, fallback: string) => {
    setBusy(key);
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(getErrorMessage(error, fallback));
    } finally {
      setBusy(null);
      await refreshAll();
    }
  };

  const pauseQueue = () => runAction('pause', () => telephonyService.pause(0), 'Fila pausada', 'Não foi possível pausar a fila');
  const resumeQueue = () => runAction('resume', () => telephonyService.resume(), 'Fila retomada', 'Não foi possível continuar a fila');
  const stopQueue = () => {
    if (!window.confirm('Parar a fila de discagem? Os leads pendentes continuam na lista.')) return;
    void runAction('stop', () => telephonyService.stop(), 'Fila parada', 'Não foi possível parar a fila');
  };

  const callLead = (leadId: number) =>
    runAction('call-' + leadId, () => telephonyService.callLead(leadId), 'Ligação solicitada. O celular vai discar em instantes.', 'Não foi possível ligar para este lead');

  const openDisposition = (call: PhoneCall) => {
    setDispositionCall(call);
    setDispositionOpen(true);
  };

  const pendingDispositions = (calls.data?.items ?? []).filter((c) => !c.disposition && DISPOSITION_REQUIRED.includes(c.status));

  const currentCall = session?.currentCall ?? null;
  const currentStart = currentCall ? (currentCall.answeredAt ?? currentCall.dialingAt ?? currentCall.createdAt) : null;
  const currentElapsed = currentStart ? secondsSince(currentStart, now) : 0;

  const initialLoading = queue.loading && !queue.data;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader
          title="Minha fila"
          icon={<Headset className="h-8 w-8 text-[#0076FF]" />}
          description="Seu celular faz as ligações com o seu chip. Acompanhe a fila e registre os resultados."
          actions={
            <Link href="/admin/atendimento/discador" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Phone className="h-4 w-4" />
              Abrir discador
            </Link>
          }
        />

        {queue.error && !queue.data && <ErrorState message={queue.error} onRetry={() => void queue.refresh()} />}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Meu ramal */}
          <SectionCard
            title="Meu ramal"
            description="Celular conectado como ramal"
            action={<DevicePill device={device} />}
          >
            {initialLoading ? (
              <LoadingBlock rows={4} />
            ) : device ? (
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Aparelho</span>
                  <span className="font-medium text-right truncate">{device.model || device.platform}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Modo</span>
                  <span className="font-medium">{DEVICE_MODE_LABEL[device.mode]}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Chip</span>
                  <span className="font-medium">{device.simLabel || 'Não informado'}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Último sinal</span>
                  <span className="font-medium">{formatRelative(device.lastSeenAt, now)}</span>
                </li>
                {!deviceReady && (
                  <li className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Mantenha o app aberto e o celular com internet para receber ligações.
                  </li>
                )}
              </ul>
            ) : (
              <div className="space-y-4">
                <EmptyState
                  title="Nenhum celular conectado"
                  description="Instale o app Infinity Ramal no seu Android, entre com seu usuário e toque em Conectar este celular."
                />
                <DownloadRamalAppButton />
              </div>
            )}
          </SectionCard>

          {/* Fila de ligacoes */}
          <SectionCard
            title="Fila de ligações"
            description={session?.campaign ? `Campanha: ${session.campaign.name}` : 'Leads novos atribuídos a você'}
            action={session ? <SessionStatePill state={session.state} /> : null}
            className="xl:col-span-2"
          >
            {initialLoading ? (
              <LoadingBlock rows={4} />
            ) : !session ? (
              <EmptyState
                title="Nenhuma fila ativa"
                description="Inicie uma fila no discador para o celular ligar automaticamente para os seus leads."
              >
                <Link href="/admin/atendimento/discador" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Abrir discador
                </Link>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {session.message && <p className="text-sm text-[#64748B]">{session.message}</p>}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Progresso</span>
                    <span className="font-medium tabular-nums">
                      {session.completed + session.skipped} de {session.total}
                    </span>
                  </div>
                  <ProgressBar value={session.completed + session.skipped} max={session.total} label="Progresso da fila" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-[#64748B]">Concluídos</p>
                    <p className="text-lg font-semibold tabular-nums">{session.completed}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-[#64748B]">Puladas</p>
                    <p className="text-lg font-semibold tabular-nums">{session.skipped}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-[#64748B]">Restantes</p>
                    <p className="text-lg font-semibold tabular-nums">{session.remaining}</p>
                  </div>
                </div>

                {currentCall ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1A1A1A] truncate">{currentCall.leadName || 'Lead sem nome'}</p>
                        <p className="text-sm text-[#64748B]">{formatPhone(currentCall.phone)}</p>
                      </div>
                      <CallStatusPill status={currentCall.status} />
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[#1A1A1A] tabular-nums">
                      <Clock className="h-4 w-4 text-[#64748B]" />
                      {formatDuration(currentElapsed)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B]">Nenhuma ligação em andamento.</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {session.state === 'RUNNING' && (
                    <Button variant="outline" size="sm" onClick={() => void pauseQueue()} disabled={busy !== null}>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </Button>
                  )}
                  {session.state === 'PAUSED' && (
                    <Button size="sm" onClick={() => void resumeQueue()} disabled={busy !== null || !deviceReady}
                      title={deviceReady ? undefined : 'Conecte o celular antes de continuar'}>
                      <Play className="h-4 w-4" />
                      Continuar
                    </Button>
                  )}
                  {live && (
                    <Button variant="destructive" size="sm" onClick={stopQueue} disabled={busy !== null}>
                      <Square className="h-4 w-4" />
                      Parar
                    </Button>
                  )}
                  <Link href="/admin/atendimento/discador" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                    Abrir discador
                  </Link>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Retornos de hoje */}
          <SectionCard
            title="Retornos de hoje"
            description="Leads com retorno agendado até o fim do dia"
            action={<CalendarClock className="h-5 w-5 text-[#64748B]" />}
            className="xl:col-span-2"
          >
            {initialLoading ? (
              <LoadingBlock rows={3} />
            ) : callbacks.length === 0 ? (
              <EmptyState title="Nenhum retorno para hoje" description="Os retornos agendados nos resultados das ligações aparecem aqui." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {callbacks.map((item) => {
                  const reason = live
                    ? 'Pause ou pare a fila antes de ligar manualmente.'
                    : !deviceReady
                      ? 'Conecte o celular e confira o app para ligar.'
                      : undefined;
                  return (
                    <li key={item.leadId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#1A1A1A] truncate">{item.name}</p>
                        <p className="text-sm text-[#64748B]">
                          {formatPhone(item.phone)} · {formatTime(item.nextActionAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void callLead(item.leadId)}
                        disabled={!!reason || busy !== null || !item.phone}
                        title={reason}
                      >
                        <Phone className="h-4 w-4" />
                        Ligar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Hoje */}
          <div className="grid gap-4 grid-cols-1">
            <StatTile icon={<ListOrdered className="h-5 w-5" />} label="Ligações hoje" value={today.calls} />
            <StatTile
              icon={<Smartphone className="h-5 w-5" />}
              label="Atendidas hoje"
              value={today.answered}
              tone="green"
              hint={today.calls > 0 ? `${Math.round((today.answered / today.calls) * 100)}% das ligações` : undefined}
            />
            <StatTile icon={<Clock className="h-5 w-5" />} label="Tempo falado" value={formatDuration(today.talkSec)} tone="slate" />
          </div>
        </div>

        {/* Ligacoes recentes */}
        <SectionCard
          title="Ligações recentes"
          description="Últimas 20 ligações. Registre o resultado quando estiver pendente."
          action={
            pendingDispositions.length > 0 ? (
              <Pill tone="amber">{pendingDispositions.length} aguardando resultado</Pill>
            ) : null
          }
        >
          {calls.error && !calls.data ? (
            <ErrorState message={calls.error} onRetry={() => void calls.refresh()} />
          ) : calls.loading && !calls.data ? (
            <LoadingBlock rows={5} />
          ) : (calls.data?.items ?? []).length === 0 ? (
            <EmptyState title="Nenhuma ligação ainda" description="As ligações feitas pela fila ou pelo discador aparecem aqui." />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="text-right">Falado</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(calls.data?.items ?? []).map((call) => {
                    const needsDisposition = !call.disposition && DISPOSITION_REQUIRED.includes(call.status);
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="whitespace-nowrap">{formatDateTime(call.createdAt)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{call.leadName || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatPhone(call.phone)}</TableCell>
                        <TableCell>
                          <CallStatusPill status={call.status} />
                        </TableCell>
                        <TableCell>{dispositionLabel(call.disposition)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatDuration(call.talkSec)}</TableCell>
                        <TableCell className="text-right">
                          {needsDisposition && (
                            <Button size="sm" variant="outline" onClick={() => openDisposition(call)}>
                              Registrar resultado
                            </Button>
                          )}
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

      <DispositionDialog
        call={dispositionCall}
        open={dispositionOpen}
        onOpenChange={setDispositionOpen}
        onSaved={() => void refreshAll()}
      />
    </div>
  );
}
