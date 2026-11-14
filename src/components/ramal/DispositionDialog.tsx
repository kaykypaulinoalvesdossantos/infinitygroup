'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, CalendarPlus, Check, ListTodo, Mail, MessageCircle } from 'lucide-react';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl p-0 sm:max-w-md">
        {call && open ? (
          <DispositionForm
            key={call.id}
            call={call}
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
  enableWhatsAppFallback,
  onDone,
  onSaved,
}: {
  call: PhoneCall;
  enableWhatsAppFallback: boolean;
  onDone: () => void;
  onSaved?: (call: PhoneCall, whatsappFallback: boolean) => void;
}) {
  const [liveCall, setLiveCall] = useState(call);
  const [leadDetail, setLeadDetail] = useState<CrmLeadDetail | null>(null);
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
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!call.leadId) {
      setLeadDetail(null);
      return;
    }
    let active = true;
    void crmLeadsApi.get(call.leadId)
      .then((lead) => { if (active) setLeadDetail(lead); })
      .catch(() => { if (active) setLeadDetail(null); });
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
  }, []);

  useEffect(() => {
    let disposed = false;
    const refresh = async () => {
      try {
        const remote = await telephonyService.getCall(call.id);
        if (!disposed) {
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
      if (pendingTimerRef.current) {
        void flushDraftRef.current().catch(() => undefined);
      }
    };
  }, [applyRemoteDraft, call.id]);

  const flushDraft = useCallback(async () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
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
          if (latest.disposition) throw error;
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
  }, [call.id]);

  flushDraftRef.current = flushDraft;

  const queueDraftPatch = useCallback((patch: typeof pendingPatchRef.current) => {
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
  const canSave = !!selected && !saving && !liveCall.disposition;
  const leadName = liveCall.leadName?.trim() || 'Contato sem nome';

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await flushDraft();
      if (callActive) {
        toast.success('Rascunho salvo e sincronizado com a outra tela.');
        return;
      }
      const whatsappFallback = enableWhatsAppFallback && (selected === 'Não atendeu' || selected === 'VOICEMAIL');
      const savedCall = await telephonyService.setDisposition(
        liveCall.id,
        selected === 'DO_NOT_CALL'
          ? { result: 'DO_NOT_CALL', note: note.trim() || undefined, contactOutcome }
          : selected === 'VOICEMAIL'
            ? { result: 'VOICEMAIL', note: note.trim() || undefined, whatsappFallback, contactOutcome: 'VOICEMAIL' }
            : {
                interactionStatus: selected as InteractionStatus,
                nextActionAt: nextActionIso ?? undefined,
                note: note.trim() || undefined,
                whatsappFallback,
                contactOutcome,
              },
      );
      clearCallDraft(liveCall);
      toast.success('Resultado salvo.');
      onSaved?.(savedCall, whatsappFallback);
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o resultado.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="flex flex-col">
      <DialogHeader className="space-y-3 border-b border-slate-200 px-5 pb-4 pt-6 text-left">
        <DialogTitle className="text-lg">Resultado da ligação</DialogTitle>
        <DialogDescription asChild>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-base font-semibold text-slate-900">{leadName}</p>
            <p className="truncate text-sm text-slate-600">{liveCall.phone}</p>
            <p className="mt-1 text-xs text-slate-500">{CALL_STATUS_LABEL[liveCall.status]}</p>
          </div>
        </DialogDescription>
      </DialogHeader>

      {!callActive && <div className="space-y-2 px-5 pt-4">
        <Label htmlFor="disposition-contact">Tipo de contato</Label>
        <Select value={selected === 'VOICEMAIL' ? 'VOICEMAIL' : contactOutcome} disabled={selected === 'VOICEMAIL'} onValueChange={(value: ContactOutcome) => setContactOutcome(value)}>
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
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ações rápidas do lead</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setAppointmentOpen(true)}><CalendarPlus className="mr-1.5 h-4 w-4" />Agendar</Button>
            <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setEmailOpen(true)}><Mail className="mr-1.5 h-4 w-4" />E-mail</Button>
            <Button type="button" size="sm" variant="outline" disabled={!leadDetail || !(leadDetail.phone || leadDetail.phone2 || leadDetail.contacts.some((item) => item.phone || item.phone2))} onClick={() => setWhatsAppOpen(true)}><MessageCircle className="mr-1.5 h-4 w-4" />WhatsApp</Button>
            <Button type="button" size="sm" variant="outline" disabled={!leadDetail} onClick={() => setTaskOpen(true)}><ListTodo className="mr-1.5 h-4 w-4" />Pendência</Button>
          </div>
          <p className="mt-2 truncate text-xs text-slate-500">
            {leadDetail ? `${leadDetail.company || leadDetail.name}${leadDetail.contacts.find((item) => item.isPrimary)?.name ? ` · ${leadDetail.contacts.find((item) => item.isPrimary)?.name}` : ''}` : 'Carregando os dados do lead…'}
          </p>
        </div>
      )}

      <div className="space-y-5 px-5 py-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Status da interação</p>
          <div className="grid grid-cols-2 gap-2">
            {INTERACTION_STATUSES.map((status) => {
              const isSelected = selected === status;
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelected(status);
                    queueDraftPatch({ interactionStatus: status });
                  }}
                  className={cn(
                    'relative flex min-h-[3rem] items-center justify-center rounded-xl border px-2 py-2 text-center text-[13px] font-semibold leading-tight transition-colors active:scale-[0.98]',
                    isSelected
                      ? 'border-[#0076FF] bg-[#0076FF] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                  )}
                >
                  {isSelected && <Check className="absolute left-1.5 top-1.5 h-3 w-3" />}
                  {status}
                </button>
              );
            })}
            {enableWhatsAppFallback && (
              <button
                type="button"
                aria-pressed={selected === 'VOICEMAIL'}
                onClick={() => {
                  setSelected('VOICEMAIL');
                  queueDraftPatch({ interactionStatus: 'VOICEMAIL' });
                }}
                className={cn(
                  'relative flex min-h-[3rem] items-center justify-center rounded-xl border px-2 py-2 text-center text-[13px] font-semibold leading-tight transition-colors active:scale-[0.98]',
                  selected === 'VOICEMAIL'
                    ? 'border-[#0076FF] bg-[#0076FF] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                )}
              >
                {selected === 'VOICEMAIL' && <Check className="absolute left-1.5 top-1.5 h-3 w-3" />}
                Caixa postal
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-pressed={selected === 'DO_NOT_CALL'}
          onClick={() => {
            const value = selected === 'DO_NOT_CALL' ? null : 'DO_NOT_CALL';
            setSelected(value);
            queueDraftPatch({ interactionStatus: value });
          }}
          className={cn(
            'w-full rounded-xl border px-3 py-3 text-sm font-semibold',
            selected === 'DO_NOT_CALL'
              ? 'border-red-600 bg-red-50 text-red-800'
              : 'border-red-200 text-red-700 hover:bg-red-50',
          )}
        >
          Bloquear este número em todas as campanhas
        </button>

        <div className="space-y-2">
          <Label htmlFor="disposition-next" className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4 text-[#0076FF]" />
            Próxima ação <span className="font-normal text-slate-500">(opcional)</span>
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
            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0076FF]/40"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="disposition-note" className="text-sm font-medium">
              Registro desta conversa <span className="font-normal text-slate-500">(opcional)</span>
            </Label>
            <span className="text-xs text-slate-500">
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

        <p className="text-xs text-slate-500" aria-live="polite">
          {draftState === 'saving' ? 'Sincronizando o rascunho…' : draftState === 'error' ? 'Rascunho pendente de sincronização.' : 'Rascunho sincronizado entre computador e celular.'}
        </p>
        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={!canSave}
          onClick={() => void save()}
        >
          {saving ? 'Salvando…' : callActive ? 'Salvar rascunho' : 'Registrar atendimento'}
        </Button>
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
