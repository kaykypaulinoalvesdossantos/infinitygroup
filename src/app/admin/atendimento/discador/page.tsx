'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronDown, Clock, ListOrdered, Pause, Phone, PhoneOff, Play, Square, Timer } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CallLeadContext } from '@/components/ramal/CallLeadContext';
import { AddQueueLeads, QueueLeadPicker } from '@/components/atendimento/queue-lead-picker';
import { DispositionDialog } from '@/components/ramal/DispositionDialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { useDispositionQueue } from '@/hooks/use-disposition-queue';
import { usePolling } from '@/hooks/use-polling';
import {
  CallStatusPill,
  DEVICE_MODE_LABEL,
  DevicePill,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  ProgressBar,
  SectionCard,
  SessionStatePill,
  StatTile,
  formatPhone,
  formatRelative,
  getErrorMessage,
  isDeviceReady,
  secondsSince,
  useNow,
} from '@/components/atendimento/helpers';
import {
  formatDuration,
  telephonyService,
  type DialerCampaign,
  type DialerSession,
  type PhoneCall,
  type QueueCandidate,
  type QueueSelectionMode,
  type TelephonyDevice,
} from '@/services/telephony';
import { crmLeadsApi, type CrmLeadActivity, type CrmLeadDetail } from '@/services/crm-leads';

const NEW_LEADS_VALUE = '__new__';
const DEFAULT_INTERVAL = 5;
const INTERVAL_OPTIONS = [3, 5, 10, 15, 30, 60];
const PAUSE_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: 0, label: 'Livre (até você continuar)' },
  { seconds: 60, label: '1 minuto' },
  { seconds: 180, label: '3 minutos' },
  { seconds: 300, label: '5 minutos' },
  { seconds: 600, label: '10 minutos' },
  { seconds: 900, label: '15 minutos' },
  { seconds: 1800, label: '30 minutos' },
];
const WHATSAPP_FALLBACK_PAUSE_MESSAGE = 'Tentativa de contato pelo WhatsApp em andamento.';
const WHATSAPP_FALLBACK_WINDOW_MS = 5 * 60_000;

function isLiveSession(session: DialerSession | null | undefined): boolean {
  return !!session && (session.state === 'RUNNING' || session.state === 'PAUSED');
}

export default function DiscadorPage() {
  // Intervalo do polling depende da sessao estar ao vivo (2s) ou nao (10s).
  const [sessionLive, setSessionLive] = useState(false);
  const device = usePolling<TelephonyDevice | null>(() => telephonyService.getMyDevice(), 5000);
  const session = usePolling(() => telephonyService.getSession(), sessionLive ? 2000 : 10000);
  const campaigns = usePolling(() => telephonyService.listCampaigns(true), 60000);

  useEffect(() => {
    setSessionLive(isLiveSession(session.data));
  }, [session.data]);

  const live = sessionLive;
  const current: DialerSession | null = session.data ?? null;
  const refreshSession = session.refresh;
  const deviceReady = isDeviceReady(device.data ?? null);
  const now = useNow(live, 1000);

  // Diferenca entre o ultimo snapshot e agora, para contadores ao vivo entre um poll e outro.
  const [snapshotAt, setSnapshotAt] = useState(() => Date.now());
  useEffect(() => {
    setSnapshotAt(Date.now());
  }, [session.data]);
  const drift = Math.max(0, Math.floor((now - snapshotAt) / 1000));

  const [sourceValue, setSourceValue] = useState<string>(NEW_LEADS_VALUE);
  const [selectionMode, setSelectionMode] = useState<QueueSelectionMode>('ELIGIBLE');
  const [compose, setCompose] = useState(false);
  const [selected, setSelected] = useState<QueueCandidate[]>([]);
  const [intervalInput, setIntervalInput] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);
  const dispositions = useDispositionQueue();
  const { enqueueEnded, openNow: openDisposition } = dispositions;
  const [whatsappFallbackLead, setWhatsappFallbackLead] = useState<CrmLeadDetail | null>(null);
  const [whatsappFallbackPhone, setWhatsappFallbackPhone] = useState<string | null>(null);
  const [whatsappFallbackOpen, setWhatsappFallbackOpen] = useState(false);
  const fallbackProcessingRef = useRef(false);
  const fallbackResumeSessionIdRef = useRef<number | null>(null);

  const campaignId = sourceValue === NEW_LEADS_VALUE ? null : Number(sourceValue);
  const selectedCampaign: DialerCampaign | null =
    campaignId === null ? null : (campaigns.data?.find((item) => item.id === campaignId) ?? null);

  // Contagem de leads elegiveis da campanha selecionada (descarta respostas antigas).
  const [preview, setPreview] = useState<{ id: number; eligibleCount: number } | null>(null);
  const resumeWhatsAppFallbackSession = useCallback(async () => {
    const sessionId = fallbackResumeSessionIdRef.current;
    if (sessionId === null) return;
    fallbackResumeSessionIdRef.current = null;
    try {
      const latest = await telephonyService.getSession();
      if (
        latest?.id === sessionId &&
        latest.state === 'PAUSED' &&
        latest.message === WHATSAPP_FALLBACK_PAUSE_MESSAGE
      ) {
        await telephonyService.resume();
        await refreshSession();
        toast.info('Ligação WhatsApp encerrada. A fila foi retomada.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível retomar a fila. Use o botão Continuar.'));
    }
  }, [refreshSession]);

  const startWhatsAppFallback = useCallback(async (call: PhoneCall, saveNoAnswer = false) => {
    if (fallbackProcessingRef.current) return;
    fallbackProcessingRef.current = true;
    let savedCall = call;
    try {
      if (saveNoAnswer) {
        savedCall = await telephonyService.setDisposition(call.id, {
          result: 'NO_ANSWER',
          whatsappFallback: !!call.leadId,
        });
      }
      if (!savedCall.leadId || !savedCall.whatsappFallbackRequested) {
        toast.info('A ligação foi registrada; não há lead habilitado para o fallback WhatsApp.');
        return;
      }

      const lead = await crmLeadsApi.get(savedCall.leadId);
      const digits = (value: string | null | undefined) => (value ?? '').replace(/\D/g, '');
      const contact = lead.contacts.find((item) =>
        [item.phone, item.phone2].some((phone) => digits(phone) === digits(savedCall.phone)),
      );
      const leadPhoneMatches = digits(lead.phone) === digits(savedCall.phone);
      const optInAt = contact
        ? contact.whatsappOptInAt
        : leadPhoneMatches
          ? lead.whatsappOptInAt
          : null;
      const optOutAt = contact
        ? contact.whatsappOptOutAt
        : leadPhoneMatches
          ? lead.whatsappOptOutAt
          : null;
      const hasConsent = !!optInAt && (!optOutAt || new Date(optInAt) > new Date(optOutAt));
      if (!hasConsent) {
        toast.error('O contato discado não tem consentimento WhatsApp ativo. Registre a autorização antes da tentativa.');
        if (savedCall.sessionId) fallbackResumeSessionIdRef.current = savedCall.sessionId;
        await resumeWhatsAppFallbackSession();
        return;
      }

      const claim = await telephonyService.claimWhatsAppFallback(savedCall.id);
      if (!claim.claimed) {
        toast.info('O fallback desta ligação já foi assumido pela outra tela.');
        return;
      }
      if (savedCall.sessionId) fallbackResumeSessionIdRef.current = savedCall.sessionId;
      setWhatsappFallbackLead(lead);
      setWhatsappFallbackPhone(savedCall.phone);
      setWhatsappFallbackOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível preparar a ligação de fallback pelo WhatsApp.'));
      if (fallbackResumeSessionIdRef.current !== null) {
        await resumeWhatsAppFallbackSession();
      }
    } finally {
      fallbackProcessingRef.current = false;
    }
  }, [resumeWhatsAppFallbackSession]);

  useEffect(() => {
    if (campaignId === null) return;
    let active = true;
    telephonyService
      .previewCampaign(campaignId)
      .then((res) => {
        if (active) setPreview({ id: campaignId, eligibleCount: res.eligibleCount });
      })
      .catch(() => {
        if (active) setPreview(null);
      });
    return () => {
      active = false;
    };
  }, [campaignId]);
  const previewCount = campaignId !== null && preview && preview.id === campaignId ? preview.eligibleCount : null;

  const intervalValue = intervalInput !== '' ? Number(intervalInput) : (selectedCampaign?.intervalSec ?? DEFAULT_INTERVAL);
  const intervalOptions = INTERVAL_OPTIONS.includes(intervalValue)
    ? INTERVAL_OPTIONS
    : [...INTERVAL_OPTIONS, intervalValue].sort((a, b) => a - b);

  const canStart =
    deviceReady && !live && busy === null && (compose ? selected.length > 0 : previewCount !== 0) && Number.isInteger(intervalValue);

  // Ligacao da fila: quando a atual some, abre a ficha de resultado se ainda nao foi registrada.
  const currentCallId = current?.currentCall?.id ?? null;
  const lastCallIdRef = useRef<string | null>(null);
  useEffect(() => {
    const previous = lastCallIdRef.current;
    lastCallIdRef.current = currentCallId;
    if (!previous || previous === currentCallId) return;
    telephonyService
      .getCall(previous)
      .then((call) => {
        const endedAt = new Date(call.endedAt ?? call.createdAt).getTime();
        const isRecentNoAnswer =
          call.status === 'NO_ANSWER' &&
          Number.isFinite(endedAt) &&
          Date.now() - endedAt >= 0 &&
          Date.now() - endedAt <= WHATSAPP_FALLBACK_WINDOW_MS;
        if (isRecentNoAnswer) void startWhatsAppFallback(call, true);
        else enqueueEnded(call);
      })
      .catch(() => undefined);
  }, [currentCallId, enqueueEnded, startWhatsAppFallback]);

  const runAction = async (key: string, action: () => Promise<unknown>, success: string, fallback: string) => {
    setBusy(key);
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(getErrorMessage(error, fallback));
    } finally {
      setBusy(null);
      await Promise.all([session.refresh(), device.refresh()]);
    }
  };

  const startQueue = () => {
    const body = {
      campaignId: campaignId ?? undefined,
      intervalSec: intervalValue,
      ...(compose ? { selectionMode, leadIds: selected.map((item) => item.leadId) } : {}),
    };
    void runAction('start', async () => {
      const started = await telephonyService.startSession(body);
      if (started.skipped > 0) toast.info(`${started.skipped} lead(s) não entraram na fila após a revalidação.`);
      setSelected([]);
      setCompose(false);
    }, 'Fila iniciada', 'Não foi possível iniciar a fila');
  };

  const pauseQueue = (seconds: number) =>
    void runAction(
      'pause',
      () => telephonyService.pause(seconds),
      seconds === 0 ? 'Fila pausada até você continuar' : `Fila pausada por ${seconds / 60} min`,
      'Não foi possível pausar a fila',
    );
  const resumeQueue = () => void runAction('resume', () => telephonyService.resume(), 'Fila retomada', 'Não foi possível continuar a fila');
  const hangupCurrent = () => void runAction('hangup', () => telephonyService.hangupSession(), 'Encerramento solicitado', 'Não foi possível encerrar a ligação');
  const stopQueue = () => {
    if (!window.confirm('Parar a fila de discagem? Os leads pendentes continuam na lista.')) return;
    void runAction('stop', () => telephonyService.stop(), 'Fila parada', 'Não foi possível parar a fila');
  };
  const prioritize = (leadId: number) =>
    void runAction('prio-' + leadId, () => telephonyService.prioritize(leadId), 'Lead colocado em primeiro', 'Não foi possível priorizar o lead');

  const progressDone = current ? current.completed + current.skipped : 0;
  const currentCall = current?.currentCall ?? null;
  const callStart = currentCall ? (currentCall.answeredAt ?? currentCall.dialingAt ?? currentCall.createdAt) : null;
  const callElapsed = callStart ? secondsSince(callStart, now) : 0;
  const elapsed = current ? current.elapsedSec + drift : 0;
  const nextIn =
    current && current.state === 'RUNNING' && !currentCall ? Math.max(0, current.nextIn - drift) : null;
  const pauseLeft = current && current.state === 'PAUSED' && current.pauseRemaining !== null
    ? Math.max(0, current.pauseRemaining - drift)
    : null;

  const handleWhatsAppFallbackActivity = useCallback((_activity: CrmLeadActivity) => undefined, []);
  const handleWhatsAppFallbackTerminal = useCallback(() => {
    setWhatsappFallbackOpen(false);
    setWhatsappFallbackLead(null);
    setWhatsappFallbackPhone(null);
    void resumeWhatsAppFallbackSession();
  }, [resumeWhatsAppFallbackSession]);
  const handleWhatsAppFallbackOpenChange = useCallback((open: boolean) => {
    setWhatsappFallbackOpen(open);
    if (!open) {
      setWhatsappFallbackLead(null);
      setWhatsappFallbackPhone(null);
      void resumeWhatsAppFallbackSession();
    }
  }, [resumeWhatsAppFallbackSession]);

  const deviceCard = (
    <SectionCard title="Celular" description="O celular faz as ligações" action={<DevicePill device={device.data ?? null} />}>
      {device.loading && !device.data ? (
        <LoadingBlock rows={4} />
      ) : device.error && !device.data ? (
        <ErrorState message={device.error} onRetry={() => void device.refresh()} />
      ) : device.data ? (
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between gap-3">
            <span className="text-[#64748B]">Aparelho</span>
            <span className="font-medium text-right truncate">{device.data.model || device.data.platform}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-[#64748B]">Modo</span>
            <span className="font-medium">{DEVICE_MODE_LABEL[device.data.mode]}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-[#64748B]">Chip</span>
            <span className="font-medium">{device.data.simLabel || 'Não informado'}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-[#64748B]">Último sinal</span>
            <span className="font-medium">{formatRelative(device.data.lastSeenAt, now)}</span>
          </li>
          {!deviceReady && !live && (
            <li className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Para iniciar a fila, o celular precisa estar conectado, com o app pronto e sem ligação em andamento.
            </li>
          )}
        </ul>
      ) : (
        <EmptyState
          title="Nenhum celular conectado"
          description="Instale o app Infinity Ramal no seu Android, entre com seu usuário e toque em Conectar este celular."
        />
      )}
    </SectionCard>
  );

  const startCard = (
    <SectionCard
      title="Iniciar fila"
      description="Escolha de onde vêm os leads e o intervalo entre as ligações."
      action={current && !live ? <SessionStatePill state={current.state} /> : null}
      className="lg:col-span-2"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="source">Origem dos leads</Label>
          <Select value={sourceValue} onValueChange={(value) => { setSourceValue(value); setSelected([]); }} disabled={live || busy !== null}>
            <SelectTrigger id="source" className="w-full">
              <SelectValue placeholder="Escolha a origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NEW_LEADS_VALUE}>Meus leads novos</SelectItem>
              {(campaigns.data ?? []).map((campaign) => (
                <SelectItem key={campaign.id} value={String(campaign.id)}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-[#64748B]">
            {selectedCampaign
              ? selectedCampaign.description || 'Campanha com regras próprias de elegibilidade e horário.'
              : 'Leads novos da sua carteira, sem ligação anterior.'}
          </p>
          {campaigns.error && !campaigns.data && (
            <p className="text-xs text-red-600">Não foi possível carregar as campanhas.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Intervalo entre ligações</Label>
          <Select
            value={String(intervalValue)}
            onValueChange={setIntervalInput}
            disabled={live}
          >
            <SelectTrigger id="interval" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map((seconds) => (
                <SelectItem key={seconds} value={String(seconds)}>
                  {seconds} segundos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-[#64748B]">
            {previewCount !== null
              ? previewCount === 0
                ? 'Nenhum lead elegível nesta campanha agora.'
                : `${previewCount} lead(s) elegível(is) nesta campanha.`
              : 'Tempo de espera depois de cada ligação.'}
          </p>
        </div>
      </div>

      <Button variant="outline" disabled={busy !== null} aria-expanded={compose} onClick={() => setCompose(!compose)}>
        {compose ? (campaignId ? 'Usar campanha inteira' : 'Usar todos os meus leads novos') : 'Montar lista de leads'}
      </Button>
      {compose && <QueueLeadPicker key={sourceValue} campaignId={campaignId ?? undefined} mode={selectionMode}
        onModeChange={setSelectionMode} selected={selected} onChange={setSelected} disabled={busy !== null} />}

      {current && !live && (
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-[#64748B]">
          <span className="font-medium text-[#1A1A1A]">Última fila:</span> {current.message || 'Sem mensagem.'}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={startQueue} disabled={!canStart}
          title={!deviceReady ? 'Conecte o celular e confira o app antes de iniciar' : undefined}>
          <Play className="h-4 w-4" />
          {compose ? 'Discar selecionados' : 'Iniciar fila'}
        </Button>
        {!deviceReady && <span className="text-xs text-amber-700">Celular não está pronto.</span>}
      </div>
    </SectionCard>
  );

  const liveCard = current && live && (
    <div className="lg:col-span-2 space-y-6">
      <SectionCard
        title={current.state === 'PAUSED' ? 'Fila pausada' : 'Fila em andamento'}
        description={current.campaign ? `Campanha: ${current.campaign.name}` : 'Meus leads novos'}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SessionStatePill state={current.state} />
          </div>
        }
      >
        {current.message && <p className="text-sm text-[#64748B]">{current.message}</p>}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Progresso</span>
            <span className="font-medium tabular-nums">
              {progressDone} de {current.total}
            </span>
          </div>
          <ProgressBar value={progressDone} max={current.total} label="Progresso da fila" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <StatTile label="Concluídos" value={current.completed} tone="green" />
          <StatTile label="Puladas" value={current.skipped} tone="slate" />
          <StatTile label="Restantes" value={current.remaining} />
          <StatTile label="Decorrido" value={formatDuration(elapsed)} tone="slate" />
          <StatTile
            label={current.state === 'PAUSED' ? 'Pausa restante' : 'Próxima em'}
            value={
              current.state === 'PAUSED'
                ? pauseLeft === null
                  ? 'Livre'
                  : formatDuration(pauseLeft)
                : nextIn === null
                  ? '-'
                  : formatDuration(nextIn)
            }
            tone="amber"
          />
        </div>

        {currentCall ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A1A] truncate">{currentCall.leadName || 'Lead sem nome'}</p>
                <p className="text-sm text-[#64748B]">{formatPhone(currentCall.phone)}</p>
              </div>
              <div className="flex items-center gap-3">
                <CallStatusPill status={currentCall.status} />
                <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                  <Clock className="h-4 w-4 text-[#64748B]" />
                  {formatDuration(callElapsed)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={hangupCurrent}
                disabled={busy !== null || currentCall.hangupRequested}
              >
                <PhoneOff className="h-4 w-4" />
                Encerrar ligação
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDisposition(currentCall)}
              >
                Tabular durante a ligação
              </Button>
              {currentCall.hangupRequested && (
                <span className="text-xs text-[#64748B]">Encerramento solicitado. Aguardando o celular.</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#64748B]">Nenhuma ligação em andamento no momento.</p>
        )}

        <div className="flex flex-wrap gap-2">
          {current.state === 'RUNNING' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={busy !== null}>
                  <Pause className="h-4 w-4" />
                  Pausar
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Pausar a fila por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PAUSE_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.seconds} onSelect={() => pauseQueue(option.seconds)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {current.state === 'PAUSED' && (
            <Button
              onClick={resumeQueue}
              disabled={busy !== null || !deviceReady}
              title={deviceReady ? undefined : 'Conecte o celular antes de continuar'}
            >
              <Play className="h-4 w-4" />
              Continuar
            </Button>
          )}
          <Button variant="outline" onClick={stopQueue} disabled={busy !== null}>
            <Square className="h-4 w-4" />
            Parar fila
          </Button>
          <Link href="/admin/atendimento" className={buttonVariants({ variant: 'ghost' })}>
            Minha fila
          </Link>
        </div>
      </SectionCard>

      <SectionCard
        title="Próximos leads"
        description={`${current.pending.length} aguardando na fila`}
        action={<ListOrdered className="h-5 w-5 text-[#64748B]" />}
      >
        <AddQueueLeads key={current.id} sessionId={current.id} onAdded={() => void session.refresh()} disabled={busy !== null} />
        {current.pending.length === 0 ? (
          <EmptyState title="Nenhum lead pendente" description="Quando a lista acabar, a fila é concluída automaticamente." />
        ) : (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.pending.map((item, index) => (
                  <TableRow key={item.itemId}>
                    <TableCell className="tabular-nums">{index + 1}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{item.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatPhone(item.phone)}</TableCell>
                    <TableCell>{item.manual ? 'Manual' : 'Fila'}</TableCell>
                    <TableCell className="text-right">
                      {index > 0 && (
                        <Button size="sm" variant="outline" onClick={() => prioritize(item.leadId)} disabled={busy !== null}>
                          Priorizar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader
          title="Discador"
          icon={<Phone className="h-8 w-8 text-[#0076FF]" />}
          description="O celular faz as ligações pelo seu chip. Aqui você controla a fila pelo computador."
          actions={
            <Link href="/admin/atendimento" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Minha fila
            </Link>
          }
        />

        {session.error && !session.data && <ErrorState message={session.error} onRetry={() => void session.refresh()} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6">
            {deviceCard}
            {currentCall && <SectionCard title={currentCall.leadName ?? 'Contato'} description={formatPhone(currentCall.phone)}>
              <CallLeadContext key={currentCall.id} call={currentCall} />
            </SectionCard>}
          </div>
          {live ? liveCard : startCard}
        </div>

        {live && (
          <p className="flex items-center gap-2 text-xs text-[#64748B]">
            <Timer className="h-3.5 w-3.5" />
            Atualização automática a cada 2 segundos enquanto a fila está ativa.
          </p>
        )}
      </div>

      <DispositionDialog
        key={dispositions.current?.id ?? 'none'}
        {...dispositions.dialogProps}
        enableWhatsAppFallback
        onSaved={(call, whatsappFallback) => {
          void session.refresh();
          if (whatsappFallback) void startWhatsAppFallback(call);
        }}
      />
      {whatsappFallbackLead && (
        <WhatsAppDialog
          lead={whatsappFallbackLead}
          preferredRecipientPhone={whatsappFallbackPhone}
          open={whatsappFallbackOpen}
          autoStartCall
          callOnly
          onOpenChange={handleWhatsAppFallbackOpenChange}
          onActivity={handleWhatsAppFallbackActivity}
          onCallTerminal={handleWhatsAppFallbackTerminal}
        />
      )}
    </div>
  );
}
