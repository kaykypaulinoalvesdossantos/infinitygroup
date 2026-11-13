'use client';

import { useState } from 'react';
import { BadgeCheck, Loader2, MessageCircle, Pencil, Plus, ShieldX, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crmLeadsApi, type CrmLeadContact, type LeadContactInput } from '@/services/crm-leads';

interface ContactForm {
  name: string;
  role: string;
  email: string;
  phone: string;
  phone2: string;
  notes: string;
}

const emptyForm = (): ContactForm => ({ name: '', role: '', email: '', phone: '', phone2: '', notes: '' });

function contactPayload(form: ContactForm): LeadContactInput {
  return {
    name: form.name.trim(),
    role: form.role.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    phone2: form.phone2.trim() || null,
    notes: form.notes.trim() || null,
  };
}

export function LeadContactsPanel({
  leadId,
  contacts,
  onChanged,
}: {
  leadId: number;
  contacts: CrmLeadContact[];
  onChanged: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyContactId, setBusyContactId] = useState<number | null>(null);
  const [consentReady, setConsentReady] = useState<Record<number, boolean>>({});
  const [consentSources, setConsentSources] = useState<Record<number, 'VERBAL' | 'WRITTEN' | 'WEB_FORM' | 'OTHER'>>({});

  const beginEdit = (contact: CrmLeadContact) => {
    setEditingId(contact.id);
    setIsCreating(false);
    setForm({
      name: contact.name,
      role: contact.role ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      phone2: contact.phone2 ?? '',
      notes: contact.notes ?? '',
    });
  };

  const reset = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(emptyForm());
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = contactPayload(form);
      if (editingId) await crmLeadsApi.updateContact(leadId, editingId, body);
      else await crmLeadsApi.createContact(leadId, body);
      await onChanged();
      reset();
      toast.success(editingId ? 'Contato atualizado.' : 'Contato cadastrado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o contato.');
    } finally {
      setSaving(false);
    }
  };

  const archive = async (contact: CrmLeadContact) => {
    if (!window.confirm(`Arquivar o contato ${contact.name}?`)) return;
    try {
      await crmLeadsApi.archiveContact(leadId, contact.id);
      await onChanged();
      if (editingId === contact.id) reset();
      toast.success('Contato arquivado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível arquivar o contato.');
    }
  };

  const setPrimary = async (contact: CrmLeadContact) => {
    setBusyContactId(contact.id);
    try {
      await crmLeadsApi.setPrimaryContact(leadId, contact.id);
      await onChanged();
      toast.success(`${contact.name} agora é o contato principal.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível trocar o contato principal.');
    } finally {
      setBusyContactId(null);
    }
  };

  const updateConsent = async (contact: CrmLeadContact, consented: boolean) => {
    if (consented && !consentReady[contact.id]) return;
    setBusyContactId(contact.id);
    try {
      await crmLeadsApi.setWhatsAppConsent(
        leadId,
        consented,
        consented ? (consentSources[contact.id] ?? 'VERBAL') : undefined,
        contact.id,
      );
      await onChanged();
      setConsentReady((current) => ({ ...current, [contact.id]: false }));
      toast.success(consented ? 'Autorização do contato registrada.' : 'WhatsApp bloqueado para este contato.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a autorização.');
    } finally {
      setBusyContactId(null);
    }
  };

  const hasConsent = (contact: CrmLeadContact) => Boolean(
    contact.whatsappOptInAt &&
    (!contact.whatsappOptOutAt || new Date(contact.whatsappOptInAt) > new Date(contact.whatsappOptOutAt)),
  );

  const setField = (key: keyof ContactForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Contatos da empresa</h3>
          <p className="mt-1 text-xs text-slate-500">Cada pessoa mantém seus telefones e sua autorização de WhatsApp.</p>
        </div>
        {!editingId && !isCreating && <Button type="button" size="sm" variant="outline" onClick={() => { setIsCreating(true); setForm(emptyForm()); }}><Plus className="mr-1.5 h-4 w-4" />Adicionar</Button>}
      </div>

      {contacts.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{contact.name}{contact.role ? <span className="font-normal text-slate-500"> · {contact.role}</span> : null}{contact.isPrimary && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Star className="h-3 w-3" />Principal</span>}</p>
                <p className="truncate text-xs text-slate-500">{[contact.phone, contact.phone2, contact.email].filter(Boolean).join(' · ') || 'Sem telefone ou e-mail'}</p>
                {contact.notes && <p className="mt-1 break-words text-xs text-slate-500">{contact.notes}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {hasConsent(contact) ? (
                    <><span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />WhatsApp autorizado{contact.whatsappOptInSource ? ` · ${contact.whatsappOptInSource}` : ''}</span><Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-700" disabled={busyContactId === contact.id} onClick={() => void updateConsent(contact, false)}><ShieldX className="mr-1 h-3.5 w-3.5" />Revogar</Button></>
                  ) : !contact.phone && !contact.phone2 ? (
                    <span className="text-[11px] text-slate-500">Cadastre um telefone antes de registrar autorização.</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-2 py-1">
                      <label className="flex items-center gap-1 text-[11px] text-slate-600"><input type="checkbox" checked={Boolean(consentReady[contact.id])} onChange={(event) => setConsentReady((current) => ({ ...current, [contact.id]: event.target.checked }))} />Autorização confirmada</label>
                      <select aria-label={`Origem da autorização de ${contact.name}`} className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px]" value={consentSources[contact.id] ?? 'VERBAL'} onChange={(event) => setConsentSources((current) => ({ ...current, [contact.id]: event.target.value as 'VERBAL' | 'WRITTEN' | 'WEB_FORM' | 'OTHER' }))}>
                        <option value="VERBAL">Verbal</option><option value="WRITTEN">Escrita</option><option value="WEB_FORM">Formulário</option><option value="OTHER">Outro</option>
                      </select>
                      <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={!consentReady[contact.id] || busyContactId === contact.id} onClick={() => void updateConsent(contact, true)}><MessageCircle className="mr-1 h-3.5 w-3.5" />Registrar</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" size="icon" variant="ghost" aria-label={`Editar ${contact.name}`} onClick={() => beginEdit(contact)}><Pencil className="h-4 w-4" /></Button>
                {!contact.isPrimary && <Button type="button" size="sm" variant="ghost" className="h-9 px-2 text-xs" disabled={busyContactId === contact.id} onClick={() => void setPrimary(contact)}><Star className="mr-1 h-3.5 w-3.5" />Principal</Button>}
                {!contact.isPrimary && <Button type="button" size="icon" variant="ghost" aria-label={`Arquivar ${contact.name}`} onClick={() => void archive(contact)}><Trash2 className="h-4 w-4 text-red-600" /></Button>}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-500">Nenhum contato adicional cadastrado.</p>}

      {(editingId !== null || isCreating) && (
        <form onSubmit={(event) => void save(event)} className="space-y-3 rounded-xl bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label htmlFor="other-contact-name">Nome *</Label><Input id="other-contact-name" value={form.name} onChange={(event) => setField('name', event.target.value)} maxLength={255} required /></div>
            <div className="space-y-1"><Label htmlFor="other-contact-role">Cargo</Label><Input id="other-contact-role" value={form.role} onChange={(event) => setField('role', event.target.value)} maxLength={120} /></div>
            <div className="space-y-1"><Label htmlFor="other-contact-phone">Telefone</Label><Input id="other-contact-phone" type="tel" inputMode="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} maxLength={40} /></div>
            <div className="space-y-1"><Label htmlFor="other-contact-phone2">Telefone 2</Label><Input id="other-contact-phone2" type="tel" inputMode="tel" value={form.phone2} onChange={(event) => setField('phone2', event.target.value)} maxLength={40} /></div>
            <div className="space-y-1"><Label htmlFor="other-contact-email">E-mail</Label><Input id="other-contact-email" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} maxLength={255} /></div>
            <div className="space-y-1 sm:col-span-2"><Label htmlFor="other-contact-notes">Observações</Label><Input id="other-contact-notes" value={form.notes} onChange={(event) => setField('notes', event.target.value)} maxLength={1000} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={saving}><X className="mr-1 h-4 w-4" />Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving || !form.name.trim()}>{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Salvar contato</Button>
          </div>
        </form>
      )}
    </section>
  );
}
