'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Loader2, Mail, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  crmLeadsApi,
  type CrmAppointment,
  type CrmEmailAction,
  type CrmFollowUpTask,
  type CrmLeadDetail,
  type CrmMessageTemplate,
  getStoredUser,
} from '@/services/crm-leads';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function dateTimeInput(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function appointmentLabel(appointment: CrmAppointment) {
  return `${appointment.title} · ${new Date(appointment.startsAt).toLocaleString('pt-BR')}`;
}

export function CrmEmailDialog({
  lead,
  open,
  onOpenChange,
  onSent,
}: {
  lead: CrmLeadDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: (action: CrmEmailAction) => void;
}) {
  const [templates, setTemplates] = useState<CrmMessageTemplate[]>([]);
  const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [contactId, setContactId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [action, setAction] = useState<CrmEmailAction | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const operationIdRef = useRef<string | null>(null);
  const startFreshOperationRef = useRef(false);
  const operationLeadIdRef = useRef(lead.id);
  const leadRef = useRef(lead);
  leadRef.current = lead;

  useEffect(() => {
    if (!open) return;
    let active = true;
    const currentLead = leadRef.current;
    if (operationLeadIdRef.current !== currentLead.id) {
      operationLeadIdRef.current = currentLead.id;
      operationIdRef.current = null;
      startFreshOperationRef.current = false;
    }
    setLoading(true);
    setAction(null);
    setRequestError(null);
    if (!operationIdRef.current || startFreshOperationRef.current) {
      operationIdRef.current = crypto.randomUUID();
      startFreshOperationRef.current = false;
    }
    setTemplateId('');
    const primary = currentLead.contacts.find((item) => item.isPrimary) ?? null;
    setContactId(primary ? String(primary.id) : '');
    setRecipient(primary?.email ?? currentLead.email ?? '');
    setAppointmentId('');
    void Promise.all([
      crmLeadsApi.listMessageTemplates({ channel: 'EMAIL' }),
      crmLeadsApi.listAppointments(currentLead.id),
    ]).then(([loadedTemplates, loadedAppointments]) => {
      if (!active) return;
      setTemplates(loadedTemplates);
      setAppointments(loadedAppointments.filter((item) => item.status === 'SCHEDULED'));
      setTemplateId((current) => current || (loadedTemplates[0] ? String(loadedTemplates[0].id) : ''));
    }).catch((error: unknown) => {
      if (active) setRequestError(errorMessage(error, 'Não foi possível carregar modelos e agendamentos.'));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [lead.id, open]);

  const selectedTemplate = templates.find((template) => String(template.id) === templateId) ?? null;
  const selectedContact = lead.contacts.find((contact) => String(contact.id) === contactId) ?? null;
  const selectedAppointment = appointments.find((item) => String(item.id) === appointmentId) ?? null;
  const formLocked = sending || action?.status === 'PENDING' || action?.status === 'SENT' || (!!requestError && !action);
  const preview = useMemo(() => {
    if (!selectedTemplate) return '';
    const values: Record<string, string> = {
      nome: selectedContact?.name ?? lead.name,
      empresa: lead.company ?? lead.name,
      vendedor: getStoredUser()?.name ?? 'Equipe Infinity Groups',
      data: selectedAppointment ? new Date(selectedAppointment.startsAt).toLocaleString('pt-BR') : '',
      link: selectedAppointment?.meetUrl ?? '',
    };
    return selectedTemplate.body.replace(/\{\{(nome|empresa|vendedor|data|link)\}\}/g, (_match, key: string) => values[key] ?? '');
  }, [lead, selectedAppointment, selectedContact, selectedTemplate]);

  const submit = async (newAttempt = false) => {
    if (!selectedTemplate || !recipient.trim() || sending) return;
    if (newAttempt || !operationIdRef.current) {
      operationIdRef.current = crypto.randomUUID();
      startFreshOperationRef.current = false;
    }
    setSending(true);
    setRequestError(null);
    try {
      const result = await crmLeadsApi.sendCrmEmail(lead.id, {
        operationId: operationIdRef.current,
        templateId: selectedTemplate.id,
        ...(contactId ? { contactId: Number(contactId) } : {}),
        recipientEmail: recipient.trim(),
        ...(appointmentId ? { appointmentId: Number(appointmentId) } : {}),
      });
      setAction(result);
      if (result.status === 'SENT' || result.status === 'FAILED') {
        startFreshOperationRef.current = true;
      }
      onSent?.(result);
      if (result.status === 'SENT') toast.success('E-mail aceito pelo serviço de envio.');
      else if (result.status === 'FAILED') toast.error(result.errorMessage ?? 'O envio falhou; uma pendência foi criada.');
      else toast.info('A solicitação está em processamento. Não repita com outra chave até conferir o resultado.');
    } catch (error) {
      setRequestError(errorMessage(error, 'Não foi possível confirmar o resultado do envio. Tente consultar a mesma solicitação novamente.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-600" />Enviar e-mail</DialogTitle>
          <DialogDescription>{lead.company || lead.name} · modelo e destinatário ficam registrados no histórico.</DialogDescription>
        </DialogHeader>
        {loading ? <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Carregando dados...</div> : (
          <div className="space-y-4">
            {requestError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{requestError}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crm-email-contact">Enviar para</Label>
                <select id="crm-email-contact" className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={contactId} disabled={formLocked} onChange={(event) => {
                  setContactId(event.target.value);
                  const contact = lead.contacts.find((item) => String(item.id) === event.target.value);
                  if (contact?.email) setRecipient(contact.email);
                }}>
                  <option value="">E-mail principal do lead</option>
                  {lead.contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}{contact.isPrimary ? ' · principal' : ''}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm-email-recipient">E-mail do cliente</Label>
                <Input id="crm-email-recipient" type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="cliente@empresa.com.br" maxLength={255} disabled={formLocked} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-email-template">Modelo</Label>
              <select id="crm-email-template" className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={templateId} disabled={formLocked} onChange={(event) => setTemplateId(event.target.value)}>
                <option value="">Selecione um modelo</option>
                {templates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.productInterest ? ` · ${template.productInterest}` : ''}</option>)}
              </select>
              {!templates.length && <p className="text-xs text-amber-700">Não há modelos ativos para este canal.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-email-appointment">Vincular agendamento (opcional)</Label>
              <select id="crm-email-appointment" className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={appointmentId} disabled={formLocked} onChange={(event) => setAppointmentId(event.target.value)}>
                <option value="">Sem agendamento</option>
                {appointments.map((item) => <option key={item.id} value={item.id}>{appointmentLabel(item)}</option>)}
              </select>
            </div>
            {selectedTemplate && <div className="space-y-2 rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assunto</p>
              <p className="text-sm font-medium">{(selectedTemplate.subject || selectedTemplate.name).replace(/\{\{(nome|empresa|vendedor|data|link)\}\}/g, (_match, key: string) => ({ nome: selectedContact?.name ?? lead.name, empresa: lead.company ?? lead.name, vendedor: getStoredUser()?.name ?? 'Equipe Infinity Groups', data: selectedAppointment ? new Date(selectedAppointment.startsAt).toLocaleString('pt-BR') : '', link: selectedAppointment?.meetUrl ?? '' })[key] ?? '')}</p>
              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Prévia</p>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-700">{preview}</pre>
            </div>}
            {action && <p role="status" className={`rounded-lg border p-3 text-sm ${action.status === 'SENT' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : action.status === 'FAILED' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
              {action.status === 'SENT' ? `Envio aceito para ${action.recipient}.` : action.status === 'FAILED' ? `${action.errorMessage ?? 'Envio falhou.'} Uma pendência de revisão foi criada.` : 'Envio pendente de reconciliação. Repetir a mesma solicitação não dispara outro e-mail.'}
            </p>}
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          {action?.status === 'FAILED' ? (
            <Button type="button" onClick={() => void submit(true)} disabled={!selectedTemplate || !recipient.trim() || sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Criar nova tentativa
            </Button>
          ) : (
            <Button type="button" onClick={() => void submit()} disabled={!selectedTemplate || !recipient.trim() || sending || loading || action?.status === 'SENT' || action?.status === 'PENDING'}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{requestError ? 'Consultar solicitação' : 'Enviar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CrmFollowUpTaskDialog({
  leadId,
  leadLabel,
  contactId,
  sourceCallId,
  open,
  onOpenChange,
  onCreated,
}: {
  leadId: number;
  leadLabel: string;
  contactId?: number;
  sourceCallId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (task: CrmFollowUpTask) => void;
}) {
  const [title, setTitle] = useState('Retornar contato');
  const [details, setDetails] = useState('');
  const [dueAt, setDueAt] = useState(() => dateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operationKeyRef = useRef<string | null>(null);
  const operationLeadIdRef = useRef(leadId);

  useEffect(() => {
    if (!open) return;
    if (operationLeadIdRef.current !== leadId) {
      operationLeadIdRef.current = leadId;
      operationKeyRef.current = null;
    }
    if (!operationKeyRef.current) operationKeyRef.current = crypto.randomUUID();
    setTitle('Retornar contato');
    setDetails('');
    setDueAt(dateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
    setError(null);
  }, [leadId, open]);

  const save = async () => {
    if (!title.trim() || !dueAt || saving) return;
    setSaving(true);
    setError(null);
    try {
      const task = await crmLeadsApi.createFollowUpTask({
        operationKey: operationKeyRef.current ?? crypto.randomUUID(),
        leadId,
        ...(contactId ? { contactId } : {}),
        ...(sourceCallId ? { sourceCallId } : {}),
        title: title.trim(),
        details: details.trim() || undefined,
        dueAt: new Date(dueAt).toISOString(),
      });
      toast.success('Pendência criada e vinculada ao histórico do lead.');
      onCreated?.(task);
      operationKeyRef.current = null;
      onOpenChange(false);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível criar a pendência.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-blue-600" />Criar pendência comercial</DialogTitle>
          <DialogDescription>{leadLabel} · a pendência ficará ligada ao lead e ao histórico.</DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="crm-task-title">O que precisa ser feito?</Label><Input id="crm-task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} /></div>
          <div className="space-y-2"><Label htmlFor="crm-task-due">Prazo</Label><Input id="crm-task-due" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="crm-task-details">Detalhes</Label><Textarea id="crm-task-details" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} rows={4} placeholder="Contexto para retomar o atendimento" /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={() => void save()} disabled={!title.trim() || !dueAt || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Salvar pendência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
