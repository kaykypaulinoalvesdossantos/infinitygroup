'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, CalendarPlus, Check, ListTodo, Mail, MessageCircle, PhoneCall as PhoneCallIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { readCallDraft, clearCallDraft } from '@/components/ramal/CallLeadContext';
import { AppointmentDialog } from '@/components/admin/crm/appointment-dialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { CrmEmailDialog, CrmFollowUpTaskDialog } from '@/components/admin/crm/crm-action-dialogs';
import { crmLeadsApi, type CrmAppointment, type CrmLeadActivity, type CrmLeadDetail } from '@/services/crm-leads';
import { getErrorMessage } from '@/hooks/ramal/useNativeTelephony';
import { cn } from '@/lib/utils';
import { formatPhone } from '@/components/admin/crm/format';
import {
  CALL_STATUS_LABEL,
  INTERACTION_STATUSES,
  isCallActive,
  telephonyService,
  type DispositionDraftSelection,
  type ContactOutcome,
  type InteractionStatus,
  type PhoneCall,
} from '@/services/telephony';

const NOTE_MAX = 1000;

export interface DispositionDialogProps {
  call: PhoneCall | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enableWhatsAppFallback?: boolean;
  onSaved?: (call: PhoneCall, whatsappFallback: boolean) => void;
}

/** Converte o valor de <input type="datetime-local"> (horario local) para ISO. */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/** Valor minimo do datetime-local: agora, no fuso local (minuto atual). */
function nowForInput(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isoToLocalInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DispositionDialog({ call, open, onOpenChange, enableWhatsAppFallback = false, onSaved }: DispositionDialogProps) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        {call && open ? (
          <DispositionForm
            key={call.id}
            call={call}
            saving={saving}
            setSaving={setSaving}
            enableWhatsAppFallback={enableWhatsAppFallback}
            onDone={() => {
              onOpenChange(false);
            }}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Formulario pos-ligacao igual ao do grupoinfinity: status, proxima acao com data e nota. */
function DispositionForm({
  call,
  saving,
  setSaving,
  enableWhatsAppFallback,
  onDone,
  onSaved,
}: {
  call: PhoneCall;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  enableWhatsAppFallback: boolean;
  onDone: () => void;
  onSaved?: (call: PhoneCall, whatsappFallback: boolean) => void;
}) {
  const [liveCall, setLiveCall] = useState(call);
  const [leadDetail, setLeadDetail] = useState<CrmLeadDetail | null>(null);
  const [leadLoadFailed, setLeadLoadFailed] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [selected, setSelected] = useState<DispositionDraftSelection | null>(
    call.dispositionDraft?.interactionStatus ?? null,
  );
  const [nextAction, setNextAction] = useState(() => isoToLocalInput(call.dispositionDraft?.nextActionAt));
  const [note, setNote] = useState(() => readCallDraft(call) ?? call.dispositionDraft?.note ?? call.dispositionNote ?? '');
  const [contactOutcome, setContactOutcome] = useState<ContactOutcome>(call.contactOutcome ?? 'UNKNOWN');
  const [minDate] = useState(nowForInput);
  const [draftState, setDraftState] = useState<'saved' | 'saving' | 'error'>('saved');
  const versionRef = useRef(call.dispositionDraftVersion || 1);
  const pendingPatchRef = useRef<{
    interactionStatus?: DispositionDraftSelection | null;
    nextActionAt?: string | null;
    note?: string | null;
  }>({});
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const hasLocalEditsRef = useRef(false);
  const flushDraftRef = useRef<() => Promise<void>>(async () => undefined);
  /** Resultado gravado em outra tela (ex.: computador): este formulario fecha sozinho. */
  const finishedElsewhereRef = useRef(false);
  /** Esta tela esta gravando o resultado final; o polling nao deve fechar por conta propria. */
  const localFinalSaveRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const onSavedRef = useRef(onSaved);
  onDoneRef.current = onDone;
  onSavedRef.current = onSaved;

  const handleFinishedElsewhere = useCallback((remote: PhoneCall) => {
    if (finishedElsewhereRef.current || localFinalSaveRef.current) return;
    finishedElsewhereRef.current = true;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    pendingPatchRef.current = {};
    hasLocalEditsRef.current = false;
    clearCallDraft(remote);
    setLiveCall(remote);
    setDraftState('saved');
    toast.info('Este atendimento já foi registrado na outra tela.');
    onSavedRef.current?.(remote, false);
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (!call.leadId) {
      setLeadDetail(null);
      return;
    }
    let active = true;
    void crmLeadsApi.get(call.leadId)
      .then((lead) => { if (active) setLeadDetail(lead); })
      .catch(() => { if (active) setLeadLoadFailed(true); });
    return () => { active = false; };
  }, [call.leadId]);

  const refreshLead = useCallback(async () => {
    if (!call.leadId) return;
    try {
      setLeadDetail(await crmLeadsApi.get(call.leadId));
    } catch {
      // As ações externas já ficam registradas no servidor; a ficha será recarregada ao reabrir.
    }
  }, [call.leadId]);

  const handleLeadActivity = useCallback((activity: CrmLeadActivity) => {
    setLeadDetail((current) => current ? {
      ...current,
      activities: [activity, ...current.activities.filter((item) => item.id !== activity.id)],
    } : current);
  }, []);

  const applyRemoteDraft = useCallback((remote: PhoneCall) => {
    setLiveCall(remote);
    versionRef.current = remote.dispositionDraftVersion || 1;
    if (hasLocalEditsRef.current) return;
    setSelected(remote.dispositionDraft?.interactionStatus ?? null);
    setNextAction(isoToLocalInput(remote.dispositionDraft?.nextActionAt));
    setNote(remote.dispositionDraft?.note ?? remote.dispositionNote ?? '');
    if (remote.disposition && remote.contactOutcome) setContactOutcome(remote.contactOutcome);
  }, []);

  useEffect(() => {
    let disposed = false;
    const refresh = async () => {
      try {
        const remote = await telephonyService.getCall(call.id);
        if (!disposed) {
          if (remote.disposition) {
            handleFinishedElsewhere(remote);
            return;
          }
          setLiveCall(remote);
          if (
            !hasLocalEditsRef.current ||
            remote.dispositionDraftVersion > versionRef.current
          ) {
            applyRemoteDraft(remote);
          }
        }
      } catch {
        // O formulário continua utilizável quando a rede oscila; a gravação informa a falha.
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 2000);
    return () => {
      disposed = true;
      clearInterval(timer);
      if (pendingTimerRef.current && !finishedElsewhereRef.current) {
        void flushDraftRef.current().catch(() => undefined);
      }
    };
  }, [applyRemoteDraft, call.id, handleFinishedElsewhere]);

  const flushDraft = useCallback(async () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
    if (finishedElsewhereRef.current) return;
    if (!Object.keys(patch).length) {
      await saveQueueRef.current;
      return;
    }

    const save = async () => {
      setDraftState('saving');
      try {
        let currentVersion = versionRef.current;
        let saved: PhoneCall;
        try {
          saved = await telephonyService.updateDispositionDraft(call.id, {
            ...patch,
            expectedVersion: currentVersion,
          });
        } catch (error) {
          const latest = await telephonyService.getCall(call.id);
          if (latest.disposition) {
            handleFinishedElsewhere(latest);
            if (finishedElsewhereRef.current) return;
            throw error;
          }
          if (latest.dispositionDraftVersion === currentVersion) throw error;
          currentVersion = latest.dispositionDraftVersion;
          saved = await telephonyService.updateDispositionDraft(call.id, {
            ...patch,
            expectedVersion: currentVersion,
          });
        }
        versionRef.current = saved.dispositionDraftVersion;
        setLiveCall(saved);
        if (!Object.keys(pendingPatchRef.current).length) {
          hasLocalEditsRef.current = false;
          setDraftState('saved');
        }
      } catch (error) {
        pendingPatchRef.current = { ...patch, ...pendingPatchRef.current };
        hasLocalEditsRef.current = true;
        setDraftState('error');
        throw error;
      }
    };
    const task = saveQueueRef.current.then(save, save);
    saveQueueRef.current = task.then(() => undefined, () => undefined);
    await task;
  }, [call.id, handleFinishedElsewhere]);

  flushDraftRef.current = flushDraft;

  const queueDraftPatch = useCallback((patch: typeof pendingPatchRef.current) => {
    if (finishedElsewhereRef.current) return;
    pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
    hasLocalEditsRef.current = true;
    setDraftState('saving');
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      void flushDraftRef.current().catch((error: unknown) => {
        toast.error(getErrorMessage(error, 'O rascunho não sincronizou. Confira a conexão e tente novamente.'));
      });
    }, 500);
  }, []);

  const nextActionIso = localInputToIso(nextAction);
  const callActive = isCallActive(liveCall.status);
  const isVoicemail = selected === 'VOICEMAIL' || (selected !== 'DO_NOT_CALL' && contactOutcome === 'VOICEMAIL');
  const canSave = (!!selected || (!callActive && isVoicemail)) && !saving && !liveCall.disposition;
  const canRedial = !callActive && !!liveCall.leadId && isVoicemail && !liveCall.disposition;
  const leadName = leadDetail?.name || liveCall.leadName?.trim() || 'Contato sem nome';

  const selectResult = (status: DispositionDraftSelection | null) => {
    setSelected(status);
    queueDraftPatch({ interactionStatus: status });
  };

  const save = async (redial?: 'phone' | 'whatsapp') => {
    if (!canSave || (redial && !canRedial)) return;
    setSaving(true);
    try {
      await flushDraft();
      if (finishedElsewhereRef.current) return;
      if (callActive) {
        toast.success('Rascunho salvo e sincronizado com a outra tela.');
        return;
      }
      const whatsappFallback = enableWhatsAppFallback && redial !== 'phone' &&
        (selected === 'Não atendeu' || isVoicemail || redial === 'whatsapp' || selected === 'Sem Interesse' || selected === 'Perdido');
      localFinalSaveRef.current = true;
      const savedCall = await telephonyService.setDisposition(
        liveCall.id,
        selected === 'DO_NOT_CALL'
          ? { result: 'DO_NOT_CALL', note: note.trim() || undefined, contactOutcome }
          : isVoicemail
            ? { result: 'VOICEMAIL', note: note.trim() || undefined, whatsappFallback, contactOutcome: 'VOICEMAIL', ...(redial === 'phone' ? { redialPhone: true } : {}) }
            : {
                interactionStatus: selected as InteractionStatus,
                nextActionAt: nextActionIso ?? undefined,
                note: note.trim() || undefined,
                whatsappFallback,
                contactOutcome,
              },
      );
      clearCallDraft(liveCall);
      toast.success(redial === 'phone' ? 'Rediscagem enviada para o celular.' : 'Resultado salvo.');
      onSaved?.(savedCall, savedCall.whatsappFallbackRequested);
      onDone();
    } catch (err) {
      localFinalSaveRef.current = false;
      const latest = await telephonyService.getCall(liveCall.id).catch(() => null);
      if (latest?.disposition) {
        handleFinishedElsewhere(latest);
        return;
      }
      toast.error(getErrorMessage(err, redial === 'phone' ? 'Não foi possível rediscar pelo telefone.' : 'Não foi possível salvar o resultado.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="flex min-h-0 min-w-0 flex-1 flex-col [overflow-wrap:anywhere]">
      <DialogHeader className="shrink-0 border-b border-border bg-muted/40 px-4 py-4 pr-12 !text-left sm:px-6 sm:pr-14">
        <DialogTitle className="text-xl leading-tight">Resultado da ligação</DialogTitle>
        <DialogDescription className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold text-foreground">{leadName}</span>
          <span className="tabular-nums">{formatPhone(liveCall.phone)}</span>
          <span className="text-xs">{CALL_STATUS_LABEL[liveCall.status]}</span>
        </DialogDescription>
      </DialogHeader>

      <fieldset disabled={saving} className="pipeline-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
        {!callActive && <div className="space-y-2 px-4 pt-4 sm:px-6">
          <Label htmlFor="disposition-contact">Tipo de contato</Label>
          <Select value={selected === 'VOICEMAIL' ? 'VOICEMAIL' : contactOutcome} disabled={saving} onValueChange={(value: ContactOutcome) => {
            setContactOutcome(value);
            if (value === 'VOICEMAIL') selectResult('VOICEMAIL');
            else if (selected === 'VOICEMAIL') selectResult(null);
          }}>
            <SelectTrigger id="disposition-contact" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="UNKNOWN">Não confirmado</SelectItem>
              <SelectItem value="HUMAN">Conversei com uma pessoa</SelectItem>
              <SelectItem value="VOICEMAIL">Caixa postal</SelectItem>
              <SelectItem value="NO_CONTACT">Sem contato</SelectItem>
            </SelectContent>
          </Select>
        </div>}

        {liveCall.leadId && (
          <div className="border-b border-border px-4 py-4 sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações rápidas do lead</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setAppointmentOpen(true)}><CalendarPlus className="mr-1.5 h-4 w-4" />Agendar</Button>
              <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setEmailOpen(true)}><Mail className="mr-1.5 h-4 w-4" />E-mail</Button>
              <Button type="button" size="sm" variant="outline" disabled={!leadDetail || !(leadDetail.phone || leadDetail.phone2 || leadDetail.contacts.some((item) => item.phone || item.phone2))} onClick={() => setWhatsAppOpen(true)}><MessageCircle className="mr-1.5 h-4 w-4" />WhatsApp</Button>
              <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setTaskOpen(true)}><ListTodo className="mr-1.5 h-4 w-4" />Pendência</Button>
            </div>
            {leadDetail?.company && <p className="mt-2 text-xs text-muted-foreground">{leadDetail.company}</p>}
            {!leadDetail && <p className="mt-2 text-xs text-muted-foreground">{leadLoadFailed ? 'Dados do lead indisponíveis no momento.' : 'Carregando os dados do lead…'}</p>}
          </div>
        )}

        <div className="space-y-5 px-4 py-5 sm:px-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Status da interação</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {([...INTERACTION_STATUSES, 'VOICEMAIL'] as const).map((status) => {
                const isSelected = selected === status;
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (status !== 'VOICEMAIL' && contactOutcome === 'VOICEMAIL') setContactOutcome('UNKNOWN');
                      selectResult(status);
                    }}
                    className={cn(
                      'relative flex min-h-[3rem] items-center justify-center rounded-xl border px-2 py-2 text-center text-[13px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-foreground hover:bg-muted',
                    )}
                  >
                    {isSelected && <Check className="absolute left-1.5 top-1.5 h-3 w-3" />}
                    {status === 'VOICEMAIL' ? 'Caixa postal' : status}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-pressed={selected === 'DO_NOT_CALL'}
            onClick={() => {
              selectResult(selected === 'DO_NOT_CALL' ? null : 'DO_NOT_CALL');
            }}
            className={cn(
              'w-full rounded-xl border px-3 py-3 text-sm font-semibold',
              selected === 'DO_NOT_CALL'
                ? 'border-danger-border bg-danger text-danger-foreground'
                : 'border-danger-border text-danger-foreground hover:bg-danger',
            )}
          >
            Bloquear este número em todas as campanhas
          </button>

          <div className="space-y-2">
            <Label htmlFor="disposition-next" className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-link" />
              Próxima ação <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <input
              id="disposition-next"
              type="datetime-local"
              min={minDate}
              value={nextAction}
              onChange={(e) => {
                setNextAction(e.target.value);
                queueDraftPatch({ nextActionAt: localInputToIso(e.target.value) });
              }}
              className="flex h-12 w-full min-w-0 rounded-xl border border-border bg-card px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <Label htmlFor="disposition-note" className="text-sm font-medium">
                Registro desta conversa <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {note.length}/{NOTE_MAX}
              </span>
            </div>
            <Textarea
              id="disposition-note"
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => {
                setNote(e.target.value);
                queueDraftPatch({ note: e.target.value });
              }}
              placeholder="Como foi a conversa? Qual é o próximo passo?"
              className="min-h-[96px] rounded-xl text-base"
            />
          </div>

        </div>
      </fieldset>

      <div className="shrink-0 space-y-2 border-t border-border bg-card px-4 py-3 sm:px-6">
        {canRedial && (
          <div className={cn('grid gap-2', enableWhatsAppFallback && 'grid-cols-2')}>
            <Button type="button" variant="outline" className="h-auto min-h-11 gap-2 whitespace-normal px-2" disabled={saving} onClick={() => void save('phone')}>
              <PhoneCallIcon aria-hidden className="h-4 w-4 shrink-0" /> Rediscar por telefone
            </Button>
            {enableWhatsAppFallback && (
              <Button type="button" variant="outline" className="h-auto min-h-11 gap-2 whitespace-normal px-2" disabled={saving} onClick={() => void save('whatsapp')}>
                <MessageCircle aria-hidden className="h-4 w-4 shrink-0" /> Rediscar pelo WhatsApp
              </Button>
            )}
          </div>
        )}
        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={!canSave}
          onClick={() => void save()}
        >
          {saving ? 'Salvando…' : callActive ? 'Salvar rascunho' : 'Registrar atendimento'}
        </Button>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {draftState === 'saving' ? 'Sincronizando o rascunho…' : draftState === 'error' ? 'Rascunho pendente de sincronização.' : 'Rascunho sincronizado entre computador e celular.'}
        </p>
      </div>
    </div>
    {leadDetail && <>
      <AppointmentDialog
        lead={leadDetail}
        contactId={leadDetail.contacts.find((item) => item.isPrimary)?.id}
        sourceCallId={liveCall.id}
        open={appointmentOpen}
        onOpenChange={setAppointmentOpen}
        onSaved={() => { setAppointmentOpen(false); toast.success('Reunião criada na agenda.'); void refreshLead(); }}
      />
      <WhatsAppDialog lead={leadDetail} open={whatsAppOpen} onOpenChange={setWhatsAppOpen} onActivity={handleLeadActivity} />
      <CrmEmailDialog lead={leadDetail} open={emailOpen} onOpenChange={setEmailOpen} onSent={() => { void refreshLead(); }} />
      <CrmFollowUpTaskDialog
        leadId={leadDetail.id}
        leadLabel={leadDetail.company || leadDetail.name}
        contactId={leadDetail.contacts.find((item) => item.isPrimary)?.id}
        sourceCallId={liveCall.id}
        open={taskOpen}
        onOpenChange={setTaskOpen}
        onCreated={() => { void refreshLead(); }}
      />
    </>}
    </>
  );
}
