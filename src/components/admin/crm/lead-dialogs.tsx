'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, StickyNote, ArrowRightLeft, FileText, Archive, Save, AlertCircle, CalendarClock, CalendarPlus, MessageCircle, RefreshCw, CheckCircle2, XCircle, Pencil, Mail, ListTodo } from 'lucide-react';
import {
    crmLeadsApi,
    LEAD_SOURCES,
    LEAD_STATUSES,
    PRODUCT_INTERESTS,
    type CrmLead,
    type CrmLeadTag,
    type CrmLeadActivity,
    type CrmLeadDetail,
    type CrmAppointment,
    type TeamUser,
} from '@/services/crm-leads';
import { formatDuration } from '@/services/telephony';
import { cn } from '@/lib/utils';
import {
    emptyLeadForm,
    errorMessage,
    formatCurrencyBRL,
    formatDateTime,
    formatPhone,
    formToPayload,
    isValidEmail,
    leadToForm,
    stageColor,
    stageLabel,
    type LeadFormValues,
} from './format';
import { AppointmentDialog } from './appointment-dialog';
import { WhatsAppDialog } from './whatsapp-dialog';
import { LeadContactsPanel } from './lead-contacts-panel';
import { CrmEmailDialog, CrmFollowUpTaskDialog } from './crm-action-dialogs';

interface LeadFieldsProps {
    form: LeadFormValues;
    tags: CrmLeadTag[];
    onChange: (patch: Partial<LeadFormValues>) => void;
    isSupervisor: boolean;
    owners: TeamUser[];
    disabled?: boolean;
}

function Field({ id, label, className, children }: { id: string; label: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </Label>
            {children}
        </div>
    );
}

/** Campos editaveis de um lead (usado na criacao e na edicao). */
export function LeadFields({ form, tags, onChange, isSupervisor, owners, disabled }: LeadFieldsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="lead-name" label="Nome *" className="sm:col-span-2">
                <Input id="lead-name" value={form.name} onChange={(e) => onChange({ name: e.target.value })} maxLength={255} disabled={disabled} />
            </Field>
            <Field id="lead-company" label="Empresa">
                <Input id="lead-company" value={form.company} onChange={(e) => onChange({ company: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-products" label="Produtos de interesse" className="sm:col-span-2">
                <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 p-3" role="group" aria-label="Produtos de interesse">
                    {PRODUCT_INTERESTS.map((product) => (
                        <label key={product.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.productInterests.includes(product.id)}
                                onChange={(event) => onChange({
                                    productInterests: event.target.checked
                                        ? [...form.productInterests, product.id]
                                        : form.productInterests.filter((value) => value !== product.id),
                                })}
                                disabled={disabled}
                                className="h-4 w-4 rounded border-slate-300 text-[#0076FF] focus:ring-[#0076FF]"
                            />
                            {product.label}
                        </label>
                    ))}
                </div>
            </Field>
            <Field id="lead-tags" label="Tags" className="sm:col-span-2">
                <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 p-3" role="group" aria-label="Tags do lead">
                    {tags.filter((tag) => tag.isActive).length === 0 ? (
                        <span className="text-xs text-slate-500">Nenhuma tag ativa. Um administrador pode criar tags.</span>
                    ) : tags.filter((tag) => tag.isActive).map((tag) => (
                        <label key={tag.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.tagIds.includes(tag.id)}
                                onChange={(event) => onChange({
                                    tagIds: event.target.checked
                                        ? [...form.tagIds, tag.id]
                                        : form.tagIds.filter((id) => id !== tag.id),
                                })}
                                disabled={disabled}
                                className="h-4 w-4 rounded border-slate-300 text-[#0076FF] focus:ring-[#0076FF]"
                            />
                            <Badge variant="outline" style={{ color: tag.color, borderColor: tag.color }}>{tag.name}</Badge>
                        </label>
                    ))}
                </div>
            </Field>
            <Field id="lead-email" label="E-mail">
                <Input id="lead-email" type="email" value={form.email} onChange={(e) => onChange({ email: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-phone" label="Telefone">
                <Input id="lead-phone" type="tel" inputMode="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-phone2" label="Telefone 2">
                <Input id="lead-phone2" type="tel" inputMode="tel" value={form.phone2} onChange={(e) => onChange({ phone2: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-city" label="Cidade">
                <Input id="lead-city" value={form.city} onChange={(e) => onChange({ city: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-segment" label="Segmento">
                <Input id="lead-segment" value={form.segment} onChange={(e) => onChange({ segment: e.target.value })} disabled={disabled} />
            </Field>
            <Field id="lead-source" label="Origem">
                <Select value={form.source} onValueChange={(v) => onChange({ source: v })} disabled={disabled}>
                    <SelectTrigger id="lead-source" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LEAD_SOURCES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field id="lead-status" label="Etapa">
                <Select value={form.status} onValueChange={(v) => onChange({ status: v as LeadFormValues['status'] })} disabled={disabled}>
                    <SelectTrigger id="lead-status" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LEAD_STATUSES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field id="lead-value" label="Valor (R$)">
                <Input id="lead-value" inputMode="decimal" placeholder="0,00" value={form.value} onChange={(e) => onChange({ value: e.target.value })} disabled={disabled} />
            </Field>
            {isSupervisor && (
                <Field id="lead-owner" label="Responsável">
                    <Select value={form.ownerId} onValueChange={(v) => onChange({ ownerId: v })} disabled={disabled}>
                        <SelectTrigger id="lead-owner" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {owners.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                    {o.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            )}
            <Field id="lead-next" label="Próxima ação" className={isSupervisor ? '' : 'sm:col-span-2'}>
                <Input id="lead-next" type="datetime-local" value={form.nextActionAt} onChange={(e) => onChange({ nextActionAt: e.target.value })} disabled={disabled} />
            </Field>
            {form.status === 'LOST' && (
                <Field id="lead-lost" label="Motivo da perda" className="sm:col-span-2">
                    <Input id="lead-lost" value={form.lostReason} onChange={(e) => onChange({ lostReason: e.target.value })} maxLength={255} disabled={disabled} />
                </Field>
            )}
            <Field id="lead-notes" label="Observações" className="sm:col-span-2">
                <Textarea id="lead-notes" rows={3} value={form.notes} onChange={(e) => onChange({ notes: e.target.value })} disabled={disabled} />
            </Field>
        </div>
    );
}

/** Valida o formulario; retorna a mensagem de erro ou null. */
function validateForm(form: LeadFormValues): string | null {
    if (!form.name.trim()) return 'Informe o nome do lead.';
    if (form.email.trim() && !isValidEmail(form.email.trim())) return 'Informe um e-mail válido.';
    if (form.value.trim() && !Number.isFinite(Number(form.value.replace(',', '.')))) return 'Valor inválido.';
    return null;
}

interface NewLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSupervisor: boolean;
    owners: TeamUser[];
    tags: CrmLeadTag[];
    onCreated: (lead: CrmLead) => void;
}

export function NewLeadDialog({ open, onOpenChange, isSupervisor, owners, tags, onCreated }: NewLeadDialogProps) {
    const [form, setForm] = useState<LeadFormValues>(emptyLeadForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const patch = (p: Partial<LeadFormValues>) => setForm((f) => ({ ...f, ...p }));

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setForm(emptyLeadForm());
            setError('');
        }
        onOpenChange(next);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateForm(form);
        if (validation) {
            setError(validation);
            return;
        }
        setSaving(true);
        setError('');
        try {
            const lead = await crmLeadsApi.create(formToPayload(form, isSupervisor));
            toast.success('Lead criado com sucesso.');
            handleOpenChange(false);
            onCreated(lead);
        } catch (err) {
            setError(errorMessage(err, 'Não foi possível criar o lead.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo lead</DialogTitle>
                    <DialogDescription>Cadastre um contato para acompanhar no pipeline.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive" role="alert">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <LeadFields form={form} tags={tags} onChange={patch} isSupervisor={isSupervisor} owners={owners} disabled={saving} />
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar lead
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const ACTIVITY_ICON = { CALL: Phone, NOTE: StickyNote, STATUS: ArrowRightLeft, APPOINTMENT: CalendarClock, WHATSAPP: MessageCircle, EMAIL: Mail, TASK: ListTodo } as const;
const ACTIVITY_TITLE = { CALL: 'Ligação', NOTE: 'Nota', STATUS: 'Mudança de etapa', APPOINTMENT: 'Compromisso', WHATSAPP: 'WhatsApp', EMAIL: 'E-mail', TASK: 'Pendência' } as const;

function ActivityItem({ activity }: { activity: CrmLeadActivity }) {
    const Icon = ACTIVITY_ICON[activity.type] ?? FileText;
    const title = activity.type === 'CALL' && activity.metadata?.provider === 'WACALLS'
        ? 'Ligação WhatsApp'
        : ACTIVITY_TITLE[activity.type] ?? 'Registro';
    const isStatusOutcome = LEAD_STATUSES.some((s) => s.id === activity.outcome);
    const durationSec = typeof activity.metadata?.durationSec === 'number' ? activity.metadata.durationSec : null;
    const outcomeLabel: Record<string, string> = {
        PENDING: 'Enviando', SENT: 'Enviada', FAILED: 'Falhou',
        DIALING: 'Iniciada', RINGING: 'Chamando', ACTIVE: 'Em andamento', ENDING: 'Encerrando', UNKNOWN: 'Status não confirmado',
        NO_ANSWER: 'Não atendida', REJECTED: 'Recusada', CANCELLED: 'Cancelada',
        COMPLETED: 'Concluída', DISCONNECTED: 'Desconectada',
        CHAT_OPENED: 'Conversa aberta', OPT_IN: 'Autorização registrada', OPT_OUT: 'Contato bloqueado',
        SCHEDULED: 'Agendado', RESCHEDULED: 'Reagendado', UPDATED: 'Compromisso atualizado',
    };

    return (
        <li className="relative flex gap-3 pb-5 last:pb-0">
            <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0076FF]">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{title}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(activity.occurredAt)}</span>
                </div>
                {activity.summary && <p className="whitespace-pre-line break-words text-sm text-slate-600">{activity.summary}</p>}
                <div className="flex flex-wrap gap-1.5">
                    {activity.direction && (
                        <Badge variant="outline" className="text-[11px]">
                            {activity.direction === 'OUTBOUND' ? 'Saída' : activity.direction === 'INBOUND' ? 'Entrada' : activity.direction}
                        </Badge>
                    )}
                    {activity.outcome &&
                        (isStatusOutcome ? (
                            <Badge className={cn('border-transparent text-[11px]', stageColor(activity.outcome))}>{stageLabel(activity.outcome)}</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[11px]">
                            {outcomeLabel[activity.outcome] ?? activity.outcome}
                            </Badge>
                        ))}
                    {durationSec !== null && (
                        <Badge variant="secondary" className="text-[11px]">
                            Duração {formatDuration(durationSec)}
                        </Badge>
                    )}
                </div>
                {activity.nextActionAt && (
                    <p className="text-xs text-slate-500">Próxima ação: {formatDateTime(activity.nextActionAt)}</p>
                )}
            </div>
        </li>
    );
}

interface LeadDetailDialogProps {
    leadId: number | null;
    onClose: () => void;
    isSupervisor: boolean;
    owners: TeamUser[];
    tags: CrmLeadTag[];
    onChanged: () => void;
    onCall: (lead: CrmLead) => void;
    callingId: number | null;
}

export function LeadDetailDialog({ leadId, onClose, isSupervisor, owners, tags, onChanged, onCall, callingId }: LeadDetailDialogProps) {
    const [detail, setDetail] = useState<CrmLeadDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [form, setForm] = useState<LeadFormValues>(emptyLeadForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [noteText, setNoteText] = useState('');
    const [sendingNote, setSendingNote] = useState(false);
    const [confirmArchive, setConfirmArchive] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<CrmAppointment | undefined>();
    const [whatsAppOpen, setWhatsAppOpen] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const [taskOpen, setTaskOpen] = useState(false);
    const [savingConsent, setSavingConsent] = useState(false);
    const [consentChecked, setConsentChecked] = useState(false);
    const [consentSource, setConsentSource] = useState<'VERBAL' | 'WRITTEN' | 'WEB_FORM' | 'OTHER'>('VERBAL');

    const loadDetail = async (id: number) => {
        const [data, appointmentRows] = await Promise.all([
            crmLeadsApi.get(id),
            crmLeadsApi.listAppointments(id),
        ]);
        setDetail(data);
        setAppointments(appointmentRows);
        setForm(leadToForm(data));
        return data;
    };

    useEffect(() => {
        if (leadId === null) return;
        let cancelled = false;
        setDetail(null);
        setLoading(true);
        setLoadError('');
        setFormError('');
        setNoteText('');
        setConfirmArchive(false);
        setAppointments([]);
        setConsentChecked(false);
        loadDetail(leadId)
            .catch((err) => {
                if (!cancelled) setLoadError(errorMessage(err, 'Não foi possível carregar o lead.'));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadId]);

    const patch = (p: Partial<LeadFormValues>) => setForm((f) => ({ ...f, ...p }));

    const handleSave = async () => {
        if (!detail) return;
        const validation = validateForm(form);
        if (validation) {
            setFormError(validation);
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            await crmLeadsApi.update(detail.id, formToPayload(form, isSupervisor));
            await loadDetail(detail.id);
            toast.success('Lead atualizado.');
            onChanged();
        } catch (err) {
            setFormError(errorMessage(err, 'Não foi possível salvar o lead.'));
        } finally {
            setSaving(false);
        }
    };

    const handleAddNote = async () => {
        if (!detail || !noteText.trim()) return;
        setSendingNote(true);
        try {
            const activity = await crmLeadsApi.addNote(detail.id, noteText.trim());
            setDetail((d) => (d ? { ...d, activities: [activity, ...d.activities] } : d));
            setNoteText('');
            toast.success('Nota adicionada.');
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível adicionar a nota.'));
        } finally {
            setSendingNote(false);
        }
    };

    const handleConsent = async (consented: boolean) => {
        if (!detail) return;
        setSavingConsent(true);
        try {
            await crmLeadsApi.setWhatsAppConsent(detail.id, consented, consented ? consentSource : undefined);
            await loadDetail(detail.id);
            toast.success(consented ? 'Autorização de WhatsApp registrada.' : 'Contato pelo WhatsApp bloqueado.');
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível atualizar a autorização.'));
        } finally {
            setSavingConsent(false);
            setConsentChecked(false);
        }
    };

    const handleAppointmentSaved = async (_appointment: CrmAppointment) => {
        setEditingAppointment(undefined);
        if (detail) await loadDetail(detail.id);
        onChanged();
    };

    const createAppointment = () => {
        setEditingAppointment(undefined);
        setScheduleOpen(true);
    };

    const handleSyncAppointment = async (appointmentId: number) => {
        try {
            const updated = await crmLeadsApi.syncAppointment(appointmentId);
            setAppointments((items) => items.map((item) => item.id === updated.id ? updated : item));
            toast.success(updated.googleSyncStatus === 'SYNCED' ? 'Compromisso sincronizado.' : 'Não foi possível sincronizar; confira a conexão Google.');
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível sincronizar o compromisso.'));
        }
    };

    const handleAppointmentStatus = async (appointmentId: number, status: CrmAppointment['status']) => {
        try {
            const current = appointments.find((item) => item.id === appointmentId);
            const updated = await crmLeadsApi.updateAppointmentStatus(appointmentId, status, current?.version);
            setAppointments((items) => items.map((item) => item.id === updated.id ? updated : item));
            if (updated.leadId !== null) await loadDetail(updated.leadId);
            toast.success(status === 'CANCELLED' ? 'Compromisso cancelado.' : 'Compromisso atualizado.');
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível atualizar o compromisso.'));
        }
    };

    const handleWhatsAppActivity = (activity: CrmLeadActivity) => {
        setDetail((current) => current ? {
            ...current,
            activities: [activity, ...current.activities.filter((item) => item.id !== activity.id)],
        } : current);
    };

    const handleArchive = async () => {
        if (!detail) return;
        setArchiving(true);
        try {
            await crmLeadsApi.archive(detail.id);
            toast.success('Lead arquivado.');
            onChanged();
            onClose();
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível arquivar o lead.'));
            setConfirmArchive(false);
        } finally {
            setArchiving(false);
        }
    };

    const whatsappConsented = Boolean(
        detail?.whatsappOptInAt &&
        (!detail.whatsappOptOutAt || new Date(detail.whatsappOptInAt) > new Date(detail.whatsappOptOutAt)),
    );

    return (
        <>
        <Dialog
            open={leadId !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setScheduleOpen(false);
                    setWhatsAppOpen(false);
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="pr-8 break-words">{detail?.company || detail?.name || 'Lead'}</DialogTitle>
                    <DialogDescription>
                        {detail
                            ? [detail.company ? detail.name : null, formatPhone(detail.phone), detail.value !== null ? formatCurrencyBRL(detail.value) : null]
                                  .filter(Boolean)
                                  .join(' · ') || 'Detalhes do lead'
                            : 'Detalhes do lead'}
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                )}

                {!loading && loadError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loadError}</AlertDescription>
                    </Alert>
                )}

                {detail && !loading && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="space-y-5 lg:col-span-3">
                            {formError && (
                                <Alert variant="destructive" role="alert">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{formError}</AlertDescription>
                                </Alert>
                            )}
                            <LeadFields form={form} tags={tags} onChange={patch} isSupervisor={isSupervisor} owners={owners} disabled={saving} />

                            <LeadContactsPanel
                                leadId={detail.id}
                                contacts={detail.contacts}
                                onChanged={async () => { await loadDetail(detail.id); onChanged(); }}
                            />

                            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                {detail.phone && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onCall(detail)}
                                        disabled={callingId === detail.id}
                                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    >
                                        {callingId === detail.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                                        Ligar
                                    </Button>
                                )}
                                <Button type="button" variant="outline" onClick={createAppointment}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />Agendar
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEmailOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4" />Enviar e-mail
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setTaskOpen(true)}>
                                    <ListTodo className="mr-2 h-4 w-4" />Criar pendência
                                </Button>
                                {whatsappConsented && (detail.phone || detail.phone2) && (
                                    <Button type="button" variant="outline" onClick={() => setWhatsAppOpen(true)} className="border-green-200 text-green-700 hover:bg-green-50">
                                        <MessageCircle className="mr-2 h-4 w-4" />WhatsApp
                                    </Button>
                                )}
                                <div className="ml-auto flex items-center gap-2">
                                    {confirmArchive ? (
                                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-2">
                                            <span className="text-sm text-red-700">Arquivar este lead? Ele sai do pipeline.</span>
                                            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmArchive(false)} disabled={archiving}>
                                                Cancelar
                                            </Button>
                                            <Button type="button" size="sm" variant="destructive" onClick={handleArchive} disabled={archiving}>
                                                {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Arquivar
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmArchive(true)} disabled={saving}>
                                            <Archive className="mr-2 h-4 w-4" />
                                            Arquivar
                                        </Button>
                                    )}
                                    <Button type="button" onClick={handleSave} disabled={saving} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Salvar alterações
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">Permissão de WhatsApp</h3>
                                        <p className="mt-1 text-xs text-slate-600">
                                            {whatsappConsented
                                                ? `Autorizado${detail.whatsappOptInAt ? ` em ${formatDateTime(detail.whatsappOptInAt)}` : ''}.`
                                                : 'Registre a autorização do lead antes de preparar uma mensagem.'}
                                        </p>
                                    </div>
                                    {whatsappConsented && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />}
                                </div>
                                {whatsappConsented ? (
                                    <Button type="button" variant="ghost" size="sm" className="mt-2 text-red-700 hover:bg-red-50" onClick={() => void handleConsent(false)} disabled={savingConsent}>
                                        {savingConsent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <XCircle className="mr-2 h-4 w-4" />Revogar autorização
                                    </Button>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        <label className="flex items-start gap-2 text-xs text-slate-700">
                                            <input type="checkbox" checked={consentChecked} onChange={(event) => setConsentChecked(event.target.checked)} className="mt-0.5" />
                                            <span>O lead autorizou receber contato pelo WhatsApp.</span>
                                        </label>
                                        <Select value={consentSource} onValueChange={(value) => setConsentSource(value as typeof consentSource)}>
                                            <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VERBAL">Autorização verbal</SelectItem>
                                                <SelectItem value="WRITTEN">Autorização escrita</SelectItem>
                                                <SelectItem value="WEB_FORM">Formulário</SelectItem>
                                                <SelectItem value="OTHER">Outro registro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" size="sm" onClick={() => void handleConsent(true)} disabled={!consentChecked || savingConsent}>
                                            {savingConsent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Registrar autorização
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-slate-800">Compromissos</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={createAppointment}><CalendarPlus className="mr-1.5 h-4 w-4" />Novo</Button>
                                </div>
                                {appointments.length === 0 ? (
                                    <p className="text-sm text-slate-500">Nenhum compromisso agendado.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {appointments.map((appointment) => (
                                            <li key={appointment.id} className="rounded-xl border border-slate-100 p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800">{appointment.title}</p>
                                                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(appointment.startsAt)} – {new Date(appointment.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        <p className="mt-1 text-xs text-slate-500">{appointment.status === 'SCHEDULED' ? 'Agendado' : appointment.status === 'COMPLETED' ? 'Realizado' : appointment.status === 'CANCELLED' ? 'Cancelado' : 'Não compareceu'} · Google: {appointment.googleSyncStatus === 'SYNCED' ? 'Sincronizado' : appointment.googleSyncStatus === 'FAILED' ? 'Falhou' : appointment.googleSyncStatus === 'PENDING' ? 'Pendente' : 'Desconectado'}</p>
                                                    </div>
                                                    {appointment.googleSyncStatus !== 'SYNCED' && appointment.status !== 'CANCELLED' && (
                                                        <Button type="button" size="icon" variant="ghost" title="Sincronizar com Google" onClick={() => void handleSyncAppointment(appointment.id)}><RefreshCw className="h-4 w-4" /></Button>
                                                    )}
                                                </div>
                                                {appointment.status === 'SCHEDULED' && (
                                                    <div className="mt-2 flex gap-2">
                                                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingAppointment(appointment); setScheduleOpen(true); }}><Pencil className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => void handleAppointmentStatus(appointment.id, 'COMPLETED')}>Marcar realizado</Button>
                                                        <Button type="button" size="sm" variant="ghost" className="text-red-700" onClick={() => void handleAppointmentStatus(appointment.id, 'CANCELLED')}>Cancelar</Button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                <Label htmlFor="lead-note" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Nova nota
                                </Label>
                                <Textarea
                                    id="lead-note"
                                    rows={2}
                                    maxLength={2000}
                                    placeholder="Registre o que foi conversado..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    disabled={sendingNote}
                                    className="mt-2 bg-white"
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button type="button" size="sm" onClick={handleAddNote} disabled={sendingNote || !noteText.trim()}>
                                        {sendingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Adicionar nota
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">Histórico</h3>
                                {detail.activities.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                                        Nenhuma atividade registrada ainda.
                                    </p>
                                ) : (
                                    <ol className="relative space-y-0 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200">
                                        {detail.activities.map((a) => (
                                            <ActivityItem key={a.id} activity={a} />
                                        ))}
                                    </ol>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        {detail && <AppointmentDialog lead={detail} appointment={editingAppointment} open={scheduleOpen} onOpenChange={(open) => { setScheduleOpen(open); if (!open) setEditingAppointment(undefined); }} onSaved={handleAppointmentSaved} />}
        {detail && <WhatsAppDialog lead={detail} open={whatsAppOpen} onOpenChange={setWhatsAppOpen} onActivity={handleWhatsAppActivity} />}
        {detail && <CrmEmailDialog lead={detail} open={emailOpen} onOpenChange={setEmailOpen} onSent={() => { void loadDetail(detail.id); onChanged(); }} />}
        {detail && <CrmFollowUpTaskDialog leadId={detail.id} leadLabel={detail.company || detail.name} open={taskOpen} onOpenChange={setTaskOpen} onCreated={() => { void loadDetail(detail.id); onChanged(); }} />}
        </>
    );
}
