'use client';

import { useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
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
  notes: string;
}

const emptyForm = (): ContactForm => ({ name: '', role: '', email: '', phone: '', notes: '' });

function contactPayload(form: ContactForm): LeadContactInput {
  return {
    name: form.name.trim(),
    role: form.role.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
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

  const beginEdit = (contact: CrmLeadContact) => {
    setEditingId(contact.id);
    setIsCreating(false);
    setForm({
      name: contact.name,
      role: contact.role ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
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

  const setField = (key: keyof ContactForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Outros contatos da empresa</h3>
          <p className="mt-1 text-xs text-slate-500">O contato principal continua no cadastro do lead.</p>
        </div>
        {!editingId && !isCreating && <Button type="button" size="sm" variant="outline" onClick={() => { setIsCreating(true); setForm(emptyForm()); }}><Plus className="mr-1.5 h-4 w-4" />Adicionar</Button>}
      </div>

      {contacts.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{contact.name}{contact.role ? <span className="font-normal text-slate-500"> · {contact.role}</span> : null}</p>
                <p className="truncate text-xs text-slate-500">{[contact.phone, contact.email].filter(Boolean).join(' · ') || 'Sem telefone ou e-mail'}</p>
                {contact.notes && <p className="mt-1 break-words text-xs text-slate-500">{contact.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" size="icon" variant="ghost" aria-label={`Editar ${contact.name}`} onClick={() => beginEdit(contact)}><Pencil className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={`Arquivar ${contact.name}`} onClick={() => void archive(contact)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
