'use client';
import { RAMAL_APP_DOWNLOAD_URL, RAMAL_APP_FILE_NAME } from '@/lib/ramal-app';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowUp,
  ClipboardCheck,
  Download,
  History,
  Pause,
  PhoneOff,
  Play,
  RefreshCw,
  Settings2,
  Smartphone,
  Square,
  Timer,
  Users,
} from 'lucide-react';
import { CallStatusCard, useNow } from '@/components/ramal/CallStatusCard';
import { CallLeadContext } from '@/components/ramal/CallLeadContext';
import { AddQueueLeads, QueueLeadPicker } from '@/components/atendimento/queue-lead-picker';
import { DispositionDialog } from '@/components/ramal/DispositionDialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { useDispositionQueue } from '@/hooks/use-disposition-queue';
import { PhoneSetupWizard } from '@/components/ramal/PhoneSetupWizard';
import { TelephonyAutoStart } from '@/components/ramal/TelephonyAutoStart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getErrorMessage, useNativeTelephony } from '@/hooks/ramal/useNativeTelephony';
import { usePolling } from '@/hooks/use-polling';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/services/api';
import { crmLeadsApi, type CrmLeadActivity } from '@/services/crm-leads';
import {
  CALL_STATUS_LABEL,
  DISPOSITION_OPTIONS,
  SESSION_STATE_LABEL,
  formatDuration,
  isCallActive,
  telephonyService,
  type DialerSession,
  type Disposition,
  type Paginated,
  type PhoneCall,
  type QueueCandidate,
  type QueueSelectionMode,
} from '@/services/telephony';

const INTERVAL_OPTIONS = [3, 5, 10, 15, 30, 60];
const PAUSE_OPTIONS: { label: string; seconds: number }[] = [
  { label: 'Livre (até eu continuar)', seconds: 0 },
  { label: '1 minuto', seconds: 60 },
  { label: '3 minutos', seconds: 180 },
  { label: '5 minutos', seconds: 300 },
  { label: '10 minutos', seconds: 600 },
  { label: '15 minutos', seconds: 900 },
  { label: '30 minutos', seconds: 1800 },
];
const PENDING_VISIBLE = 50;
const DISPOSITION_PAGE_SIZE = 20;
const TODAY_PAGE_SIZE = 20;
const AUTO_WHATSAPP_FALLBACK_WINDOW_MS = 5 * 60_000;
/** Link do instalador do app Infinity Ramal (hospedado no proprio site). */
const APP_DOWNLOAD_URL = RAMAL_APP_DOWNLOAD_URL;
const WHATSAPP_FALLBACK_PAUSE_MESSAGE = 'Tentativa de contato pelo WhatsApp em andamento.';

type LeadSource = 'campaign' | 'mine';
type CampaignPreview = Awaited<ReturnType<typeof telephonyService.previewCampaign>>;

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** O listCalls do service ignora os filtros; consulta direta com a query string. */
function listCallsToday(from: string): Promise<Paginated<PhoneCall>> {
  const qs = new URLSearchParams({ from, pageSize: String(TODAY_PAGE_SIZE) });
  return apiRequest(`/telephony/calls?${qs.toString()}`);
}

function listPendingDispositions(page: number): Promise<Paginated<PhoneCall>> {
  const qs = new URLSearchParams({
    pendingDisposition: 'true',
    page: String(page),
    pageSize: String(DISPOSITION_PAGE_SIZE),
  });
  return apiRequest(`/telephony/calls?${qs.toString()}`);
}

function needsDisposition(call: PhoneCall): boolean {
  return !call.disposition && !isCallActive(call.status) && call.status !== 'CANCELLED';
}

function dispositionLabel(value: Disposition | null): string | null {
  if (!value) return null;
  return DISPOSITION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatTime(iso: string | null): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function isLiveSession(s: DialerSession | null): boolean {
  return !!s && (s.state === 'RUNNING' || s.state === 'PAUSED');
}

function isRecentNoAnswer(call: PhoneCall): boolean {
  const endedAt = new Date(call.endedAt ?? call.createdAt).getTime();
  const age = Date.now() - endedAt;
  return Number.isFinite(endedAt) && age >= 0 && age <= AUTO_WHATSAPP_FALLBACK_WINDOW_MS;
}

export default function RamalPage() {
  const native = useNativeTelephony();
  const now = useNow(1000);

  // Aparelho deste vendedor (poll 5s)
  const device = usePolling(() => telephonyService.getMyDevice(), 5000);
  const myDevice = device.data ?? null;
  const deviceReady = !!myDevice && !myDevice.revokedAt && myDevice.connected && myDevice.ready;
  const [setupOpen, setSetupOpen] = useState(false);
  const showWizard = !deviceReady || setupOpen;

  // Sessao de discagem: 2s enquanto ao vivo, 10s quando parada
  const [live, setLive] = useState(false);
  const sessionPoll = usePolling<DialerSession | null>(() => telephonyService.getSession(), live ? 2000 : 10000);
  const refreshSession = sessionPoll.refresh;
  const session = sessionPoll.data ?? null;
  const isLive = isLiveSession(session);
  useEffect(() => {
    setLive(isLive);
  }, [isLive]);

  // Contadores ao vivo entre um snapshot e outro
  const [snapshotAt, setSnapshotAt] = useState(0);
  useEffect(() => {
    if (sessionPoll.data !== undefined) setSnapshotAt(Date.now());
  }, [sessionPoll.data]);
  const since = now !== null && snapshotAt > 0 ? Math.max(0, (now - snapshotAt) / 1000) : 0;
  const elapsedNow = session ? session.elapsedSec + (session.state === 'RUNNING' ? since : 0) : 0;
  const nextInNow = session ? Math.max(0, session.nextIn - since) : 0;
  const pauseLeft = session && session.pauseRemaining !== null ? Math.max(0, session.pauseRemaining - since) : null;

  const currentCall = session?.currentCall ?? null;
  const currentCallId = currentCall?.id ?? null;
  const callActive = isCallActive(currentCall?.status);

  // Resultado: abre sozinho quando a ligacao atual termina
  const dispositions = useDispositionQueue();
  const { enqueueEnded, openNow: openDisposition } = dispositions;
  const prevCallIdRef = useRef<string | null>(null);
  const handledFallbackCallsRef = useRef(new Set<string>());
  const fallbackProcessingRef = useRef(false);
  const fallbackResumeSessionIdRef = useRef<number | null>(null);
  const [whatsappFallbackLead, setWhatsappFallbackLead] = useState<Awaited<ReturnType<typeof crmLeadsApi.get>> | null>(null);
  const [whatsappFallbackPhone, setWhatsappFallbackPhone] = useState<string | null>(null);
  const [whatsappFallbackOpen, setWhatsappFallbackOpen] = useState(false);

  const resumeWhatsappFallbackSession = useCallback(async () => {
    const sessionId = fallbackResumeSessionIdRef.current;
    if (sessionId === null) return;
    fallbackResumeSessionIdRef.current = null;
    try {
      const current = await telephonyService.getSession();
      if (
        current?.id === sessionId &&
        current.state === 'PAUSED' &&
        current.message === WHATSAPP_FALLBACK_PAUSE_MESSAGE
      ) {
        await telephonyService.resume();
        await refreshSession();
        toast.info('Ligação WhatsApp encerrada. A fila foi retomada.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível retomar a fila. Use o botão Continuar.'));
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

      if (!savedCall.leadId) {
        toast.info('A ligação foi registrada, mas não tem lead vinculado para chamar pelo WhatsApp.');
        if (savedCall.whatsappFallbackRequested && savedCall.sessionId) {
          fallbackResumeSessionIdRef.current = savedCall.sessionId;
        }
        await resumeWhatsappFallbackSession();
        return;
      }

      const lead = await crmLeadsApi.get(savedCall.leadId);
      const digits = (value: string | null | undefined) => (value ?? '').replace(/\D/g, '');
      const targetDigits = digits(savedCall.phone);
      const contact = lead.contacts.find((item) =>
        [item.phone, item.phone2].some((phone) => digits(phone) === targetDigits),
      );
      const leadPhoneMatches = digits(lead.phone) === targetDigits;
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
      const hasWhatsAppConsent = !!optInAt &&
        (!optOutAt || new Date(optInAt) > new Date(optOutAt));
      if (!hasWhatsAppConsent) {
        toast.error('O contato discado não tem consentimento WhatsApp ativo. Registre a autorização antes da tentativa.');
        if (savedCall.whatsappFallbackRequested && savedCall.sessionId) {
          fallbackResumeSessionIdRef.current = savedCall.sessionId;
        }
        await resumeWhatsappFallbackSession();
        return;
      }

      const claim = await telephonyService.claimWhatsAppFallback(savedCall.id);
      if (!claim.claimed) {
        toast.info('O fallback desta ligação já foi assumido pela outra tela.');
        return;
      }
      if (savedCall.whatsappFallbackRequested && savedCall.sessionId) {
        fallbackResumeSessionIdRef.current = savedCall.sessionId;
      }

      setWhatsappFallbackLead(lead);
      setWhatsappFallbackPhone(savedCall.phone);
      setWhatsappFallbackOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível preparar a ligação de fallback pelo WhatsApp.'));
      if (savedCall.whatsappFallbackPaused) await resumeWhatsappFallbackSession();
      if (saveNoAnswer) openDisposition(call);
    } finally {
      fallbackProcessingRef.current = false;
    }
  }, [openDisposition, resumeWhatsappFallbackSession]);

  const handleEndedCall = useCallback((call: PhoneCall) => {
    if (call.status === 'NO_ANSWER' && !call.disposition && isRecentNoAnswer(call)) {
      if (handledFallbackCallsRef.current.has(call.id)) return;
      handledFallbackCallsRef.current.add(call.id);
      void startWhatsAppFallback(call, true);
      return;
    }
    enqueueEnded(call);
  }, [enqueueEnded, startWhatsAppFallback]);

  const handleWhatsAppFallbackActivity = useCallback((_activity: CrmLeadActivity) => undefined, []);

  const handleWhatsAppFallbackTerminal = useCallback(() => {
    setWhatsappFallbackOpen(false);
    setWhatsappFallbackLead(null);
    setWhatsappFallbackPhone(null);
    void resumeWhatsappFallbackSession();
  }, [resumeWhatsappFallbackSession]);

  const handleWhatsAppFallbackOpenChange = useCallback((open: boolean) => {
    setWhatsappFallbackOpen(open);
    if (!open) {
      setWhatsappFallbackLead(null);
      setWhatsappFallbackPhone(null);
      void resumeWhatsappFallbackSession();
    }
  }, [resumeWhatsappFallbackSession]);

  useEffect(() => {
    const prevId = prevCallIdRef.current;
    prevCallIdRef.current = currentCallId;
    if (!prevId || prevId === currentCallId) return;

    let cancelled = false;
    telephonyService
      .getCall(prevId)
      .then((call) => {
        if (cancelled) return;
        handleEndedCall(call);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [currentCallId, handleEndedCall]);

  // Campanhas e inicio da fila
  const [source, setSource] = useState<LeadSource>('campaign');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [intervalSec, setIntervalSec] = useState(5);
  const [compose, setCompose] = useState(false);
  const [selectionMode, setSelectionMode] = useState<QueueSelectionMode>('ELIGIBLE');
  const [selected, setSelected] = useState<QueueCandidate[]>([]);
  const campaignsPoll = usePolling(() => telephonyService.listCampaigns(true), 60000);
  const campaigns = campaignsPoll.data ?? [];
  const campaignId = selectedCampaignId ?? campaigns[0]?.id ?? null;
  const previewPoll = usePolling<CampaignPreview | null>(
    () =>
      source === 'campaign' && campaignId !== null
        ? telephonyService.previewCampaign(campaignId)
        : Promise.resolve(null),
    60000,
    [source, campaignId],
  );

  // Acoes da sessao
  const [busy, setBusy] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);

  const runAction = async (action: () => Promise<unknown>, okMessage?: string): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      if (okMessage) toast.success(okMessage);
      await sessionPoll.refresh();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sourceReady = (source === 'mine' || campaignId !== null) &&
    (compose ? selected.length > 0 : source === 'mine' || (previewPoll.data?.eligibleCount ?? 0) > 0);
  const canStart = deviceReady && sourceReady && !busy && !isLive;

  const handleStart = () => {
    if (source === 'campaign' && campaignId === null) return;
    const body = {
      campaignId: source === 'campaign' ? campaignId ?? undefined : undefined,
      intervalSec,
      ...(compose ? { selectionMode, leadIds: selected.map((item) => item.leadId) } : {}),
    };
    void runAction(async () => {
      const started = await telephonyService.startSession(body);
      if (started.skipped > 0) toast.info(`${started.skipped} lead(s) não entraram na fila após a revalidação.`);
      setSelected([]);
      setCompose(false);
    }, 'Fila iniciada. As ligações acontecem no celular.');
  };

  // Retornos de hoje e ligacoes de hoje
  const queuePoll = usePolling(() => telephonyService.getMyQueue(), 15000);
  const callbacks = queuePoll.data?.callbacks ?? [];

  const [todayFrom] = useState(startOfTodayIso);
  const todayPoll = usePolling(() => listCallsToday(todayFrom), 15000, [todayFrom]);
  const todayCalls = todayPoll.data?.items ?? [];
  const [pendingDispositionPage, setPendingDispositionPage] = useState(1);
  const pendingDispositionPoll = usePolling(
    () => listPendingDispositions(pendingDispositionPage),
    15000,
    [pendingDispositionPage],
  );
  const pendingDispositions = useMemo(
    () => pendingDispositionPoll.data?.items ?? [],
    [pendingDispositionPoll.data],
  );
  const pendingDispositionCount = pendingDispositionPoll.data?.total ?? 0;
  const pendingDispositionPages = Math.max(
    1,
    Math.ceil(pendingDispositionCount / DISPOSITION_PAGE_SIZE),
  );

  useEffect(() => {
    if (pendingDispositionPage > pendingDispositionPages) {
      setPendingDispositionPage(pendingDispositionPages);
    }
  }, [pendingDispositionPage, pendingDispositionPages]);

  useEffect(() => {
    if (whatsappFallbackOpen || fallbackProcessingRef.current) return;
    const unattended = pendingDispositions.find(
      (call) => call.status === 'NO_ANSWER' && !call.disposition && isRecentNoAnswer(call),
    );
    if (!unattended || handledFallbackCallsRef.current.has(unattended.id)) return;
    handleEndedCall(unattended);
  }, [handleEndedCall, pendingDispositions, whatsappFallbackOpen]);

  const [callingLeadId, setCallingLeadId] = useState<number | null>(null);
  const callLead = async (leadId: number, name: string, campaignId?: number | null) => {
    setCallingLeadId(leadId);
    try {
      await telephonyService.callLead(leadId, campaignId ?? undefined);
      toast.success(`Ligação solicitada para ${name}. Atenda no celular.`);
      void todayPoll.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível iniciar a ligação.'));
    } finally {
      setCallingLeadId(null);
    }
  };

  const refreshAfterDisposition = () => {
    void todayPoll.refresh();
    void pendingDispositionPoll.refresh();
    void queuePoll.refresh();
    void sessionPoll.refresh();
  };

  const pending = session?.pending ?? [];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-10 pt-4">
      <TelephonyAutoStart />

      {!native.available && <BrowserNotice />}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', deviceReady ? 'bg-emerald-500' : 'bg-amber-500')} />
          <span className="truncate">
            {deviceReady ? `${myDevice?.model || 'Celular'} pronto para discar` : 'Celular ainda não conectado'}
          </span>
        </div>
        <Link
          href="/ramal/historico"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#0076FF] hover:bg-blue-50"
        >
          <History className="h-4 w-4" />
          Histórico
        </Link>
      </div>

      {device.data === undefined && device.loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
      ) : showWizard ? (
        <div className="space-y-2">
          <PhoneSetupWizard
            native={native}
            device={myDevice}
            onChanged={() => void device.refresh()}
          />
          {deviceReady && (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setSetupOpen(false)}>
              Recolher configuração
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{myDevice?.model || 'Celular Android'}</p>
              <p className="text-xs text-slate-600">Pronto para discar</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSetupOpen(true)}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              Configurar
            </Button>
          </CardContent>
        </Card>
      )}

      {isLive && session ? (
        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{session.campaign?.name ?? 'Meus leads novos'}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {session.message ?? 'Aguardando próxima ligação.'}
                  </CardDescription>
                </div>
                <Badge
                  className={cn(
                    'shrink-0 border-transparent',
                    session.state === 'RUNNING' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                  )}
                >
                  {SESSION_STATE_LABEL[session.state]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#0076FF] transition-all"
                    style={{ width: `${session.total > 0 ? Math.min(100, (session.completed / session.total) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {session.completed} de {session.total} ligações concluídas
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Concluídas" value={session.completed} />
                <Stat label="Puladas" value={session.skipped} />
                <Stat label="Restantes" value={session.remaining} />
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-3 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Tempo</p>
                  <p className="font-mono text-lg font-semibold tabular-nums">{formatDuration(elapsedNow)}</p>
                </div>
                <div>
                  {session.state === 'PAUSED' ? (
                    <>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Retoma em</p>
                      <p className="font-mono text-lg font-semibold tabular-nums">
                        {pauseLeft !== null ? formatDuration(pauseLeft) : 'Manual'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Próxima em</p>
                      <p className="font-mono text-lg font-semibold tabular-nums">
                        {callActive ? '—' : formatDuration(nextInNow)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {currentCall && callActive && (
                <>
                  <CallLeadContext key={currentCall.id} call={currentCall} />
                  <CallStatusCard
                    call={currentCall}
                    onHangup={() => void runAction(() => telephonyService.hangupSession())}
                    hangingUp={busy}
                  />
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl"
                    onClick={() => openDisposition(currentCall)}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Tabular durante a ligação
                  </Button>
                </>
              )}

              {pauseOpen && session.state === 'RUNNING' && (
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3">
                  <p className="col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pausar por</p>
                  {PAUSE_OPTIONS.map((option) => (
                    <Button
                      key={option.seconds}
                      variant="outline"
                      className="h-12 rounded-xl text-sm"
                      onClick={() => {
                        setPauseOpen(false);
                        void runAction(() => telephonyService.pause(option.seconds), 'Fila pausada.');
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {session.state === 'RUNNING' ? (
                  <Button
                    variant="secondary"
                    className="h-12 rounded-xl"
                    disabled={busy}
                    onClick={() => setPauseOpen((v) => !v)}
                    aria-expanded={pauseOpen}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    className="h-12 rounded-xl"
                    disabled={busy || !deviceReady}
                    onClick={() => void runAction(() => telephonyService.resume(), 'Fila retomada.')}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continuar
                  </Button>
                )}

                {callActive ? (
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl"
                    disabled={busy || currentCall?.hangupRequested}
                    onClick={() => void runAction(() => telephonyService.hangupSession())}
                  >
                    <PhoneOff className="mr-2 h-4 w-4" />
                    Encerrar ligação
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl text-red-600 hover:text-red-700"
                    disabled={busy}
                    onClick={() => setStopOpen(true)}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Parar fila
                  </Button>
                )}
              </div>
              {callActive && (
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl text-red-600 hover:text-red-700"
                  disabled={busy}
                  onClick={() => setStopOpen(true)}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Parar fila
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Próximos na fila ({session.remaining})</CardTitle>
            </CardHeader>
            <CardContent>
              <AddQueueLeads key={session.id} sessionId={session.id} onAdded={() => void sessionPoll.refresh()} disabled={busy} />
              {pending.length === 0 ? (
                <p className="text-sm text-slate-600">Nenhum lead pendente.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {pending.slice(0, PENDING_VISIBLE).map((item) => (
                    <li key={item.itemId} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="truncate text-xs text-slate-600">{item.phone}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10"
                        disabled={busy}
                        onClick={() => void runAction(() => telephonyService.prioritize(item.leadId))}
                        aria-label={`Priorizar ${item.name}`}
                      >
                        <ArrowUp className="mr-1 h-3.5 w-3.5" />
                        Priorizar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {pending.length > PENDING_VISIBLE && (
                <p className="pt-2 text-xs text-slate-600">+{pending.length - PENDING_VISIBLE} leads na sequência</p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Iniciar discagem</CardTitle>
            <CardDescription>As ligações são feitas pelo chip do seu celular, uma por vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {session && (session.state === 'DONE' || session.state === 'STOPPED') && (
              <div className="rounded-xl bg-slate-100 p-3 text-sm">
                <span className="font-medium text-slate-900">Última fila: {SESSION_STATE_LABEL[session.state]}</span>
                <span className="text-slate-600"> · {session.completed} ligações concluídas</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <SourceChip
                active={source === 'campaign'}
                icon={<Timer className="h-4 w-4" />}
                label="Campanha"
                onClick={() => { if (!busy && source !== 'campaign') { setSource('campaign'); setSelected([]); } }}
              />
              <SourceChip
                active={source === 'mine'}
                icon={<Users className="h-4 w-4" />}
                label="Meus leads novos"
                onClick={() => { if (!busy && source !== 'mine') { setSource('mine'); setSelected([]); } }}
              />
            </div>

            {source === 'campaign' ? (
              campaigns.length === 0 && !campaignsPoll.loading ? (
                <p className="text-sm text-slate-600">
                  Nenhuma campanha ativa. Use “Meus leads novos” para ligar para a sua carteira.
                </p>
              ) : (
                <div className="space-y-2">
                  <Select
                    value={campaignId !== null ? String(campaignId) : undefined}
                    disabled={busy}
                    onValueChange={(value) => { setSelectedCampaignId(Number(value)); setSelected([]); }}
                  >
                    <SelectTrigger className="h-12 w-full rounded-xl">
                      <SelectValue placeholder="Escolha a campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={String(campaign.id)}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-600">
                    {previewPoll.loading && !previewPoll.data
                      ? 'Calculando leads elegíveis…'
                      : `${previewPoll.data?.eligibleCount ?? 0} leads elegíveis agora`}
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-slate-600">
                Leads novos da sua carteira que ainda não receberam ligação. A regra é conferida antes de cada discagem.
              </p>
            )}

            {(source === 'mine' || campaignId !== null) && <>
              <Button variant="outline" disabled={busy} aria-expanded={compose} onClick={() => setCompose(!compose)}>
                {compose ? (source === 'campaign' ? 'Usar campanha inteira' : 'Usar todos os meus leads novos') : 'Montar lista de leads'}
              </Button>
              {compose && <QueueLeadPicker key={`${source}:${campaignId}`} campaignId={source === 'campaign' ? campaignId ?? undefined : undefined}
                mode={selectionMode} onModeChange={setSelectionMode} selected={selected} onChange={setSelected} disabled={busy} />}
            </>}

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Intervalo entre ligações</p>
              <div className="flex flex-wrap gap-2">
                {INTERVAL_OPTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    aria-pressed={intervalSec === sec}
                    onClick={() => setIntervalSec(sec)}
                    className={cn(
                      'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
                      intervalSec === sec
                        ? 'border-[#0076FF] bg-[#0076FF] text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                    )}
                  >
                    {sec} s
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="h-14 w-full rounded-2xl text-base font-semibold"
              disabled={!canStart}
              onClick={handleStart}
            >
              <Play className="mr-2 h-5 w-5" />
              {busy ? 'Iniciando…' : compose ? 'Discar selecionados' : 'Iniciar ligações'}
            </Button>
            {!deviceReady && (
              <p className="text-center text-xs text-slate-600">
                Conecte e configure o celular para iniciar a discagem.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Retornos de hoje</CardTitle>
          <CardDescription>Leads com retorno agendado para hoje.</CardDescription>
        </CardHeader>
        <CardContent>
          {queuePoll.data === undefined && queuePoll.loading ? (
            <div className="h-16 animate-pulse rounded-xl bg-slate-200/70" />
          ) : callbacks.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhum retorno agendado para hoje.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {callbacks.map((item) => (
                <li key={item.campaignLeadId ?? `lead-${item.leadId}`} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="truncate text-xs text-slate-600">
                      {item.phone ?? 'Sem telefone'}{item.campaignName ? ` · ${item.campaignName}` : ''} · {item.nextActionAt ? formatTime(item.nextActionAt) : 'Hoje'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    disabled={!deviceReady || item.phone === null || callingLeadId !== null}
                    onClick={() => void callLead(item.leadId, item.name, item.campaignId)}
                  >
                    Ligar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resultados pendentes</CardTitle>
          <CardDescription>
            {pendingDispositionCount > 0
              ? `${pendingDispositionCount} ligação(ões) aguardando classificação. As mais antigas aparecem primeiro.`
              : 'Nenhuma ligação aguardando classificação.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDispositionPoll.data === undefined && pendingDispositionPoll.loading ? (
            <div className="h-16 animate-pulse rounded-xl bg-slate-200/70" />
          ) : pendingDispositions.length === 0 ? (
            <p className="text-sm text-slate-600">Sua fila de resultados está em dia.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {pendingDispositions.map((call) => (
                <li key={call.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {call.leadName?.trim() || call.phone}
                    </p>
                    <p className="truncate text-xs text-slate-600">
                      {call.phone} · {formatTime(call.endedAt ?? call.createdAt)} ·{' '}
                      {CALL_STATUS_LABEL[call.status]}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 shrink-0"
                    onClick={() => openDisposition(call)}
                  >
                    <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                    Classificar
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {pendingDispositionPages > 1 && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pendingDispositionPage <= 1}
                onClick={() => setPendingDispositionPage((page) => Math.max(1, page - 1))}
              >
                Anteriores
              </Button>
              <span className="text-xs text-slate-600">
                Página {pendingDispositionPage} de {pendingDispositionPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pendingDispositionPage >= pendingDispositionPages}
                onClick={() => setPendingDispositionPage((page) => Math.min(pendingDispositionPages, page + 1))}
              >
                Próximas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Ligações de hoje</CardTitle>
            <CardDescription>Últimas 20 ligações do dia</CardDescription>
          </div>
          <button
            type="button"
            aria-label="Atualizar lista"
            onClick={() => void todayPoll.refresh()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <RefreshCw className={cn('h-4 w-4', todayPoll.loading && 'animate-spin')} />
          </button>
        </CardHeader>
        <CardContent>
          {todayPoll.data === undefined && todayPoll.loading ? (
            <div className="h-16 animate-pulse rounded-xl bg-slate-200/70" />
          ) : todayCalls.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhuma ligação hoje.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {todayCalls.map((call) => (
                <li key={call.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{call.leadName?.trim() || call.phone}</p>
                    <p className="truncate text-xs text-slate-600">
                      {formatTime(call.dialingAt ?? call.createdAt)} · {CALL_STATUS_LABEL[call.status]}
                      {call.talkSec ? ` · ${formatDuration(call.talkSec)}` : ''}
                    </p>
                  </div>
                  {needsDisposition(call) ? (
                    <Button variant="outline" size="sm" className="h-10" onClick={() => openDisposition(call)}>
                      <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                      Registrar resultado
                    </Button>
                  ) : (
                    <span className="max-w-[40%] truncate text-xs font-medium text-slate-600">
                      {dispositionLabel(call.disposition) ?? ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DispositionDialog
        key={dispositions.current?.id ?? 'none'}
        {...dispositions.dialogProps}
        enableWhatsAppFallback
        onSaved={(call, whatsappFallback) => {
          refreshAfterDisposition();
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

      <Dialog open={stopOpen} onOpenChange={setStopOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Parar a fila de ligações?</DialogTitle>
            <DialogDescription>
              Nenhuma nova ligação será iniciada. Se houver uma ligação em andamento, ela será encerrada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStopOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="h-12 rounded-xl"
              disabled={busy}
              onClick={() => {
                setStopOpen(false);
                void runAction(() => telephonyService.stop(), 'Fila parada.');
              }}
            >
              Parar fila
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrowserNotice() {
  return (
    <Card className="border-blue-100 bg-blue-50/60">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#0076FF]" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Para ligar pelo seu celular, use o app Infinity Ramal</p>
            <p className="text-sm text-slate-600">
              A discagem usa o chip do próprio aparelho e só funciona dentro do app Android. Neste navegador você
              acompanha a fila, os retornos e registra os resultados.
            </p>
          </div>
        </div>
        {APP_DOWNLOAD_URL ? (
          <Button asChild className="h-12 w-full rounded-xl">
            <a href={APP_DOWNLOAD_URL} download={RAMAL_APP_FILE_NAME}>
              <Download className="mr-2 h-4 w-4" />
              Baixar o app Infinity Ramal
            </a>
          </Button>
        ) : (
          <p className="text-xs text-slate-600">Peça o link de instalação do app ao seu supervisor.</p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-2">
      <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-600">{label}</p>
    </div>
  );
}

function SourceChip({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors',
        active ? 'border-[#0076FF] bg-blue-50 text-[#0076FF]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
