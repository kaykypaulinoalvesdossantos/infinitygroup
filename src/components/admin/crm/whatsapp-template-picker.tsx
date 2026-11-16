'use client';

import { useMemo, useState } from 'react';
import { MessageSquareText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CrmAppointment, CrmLead, CrmLeadContact, CrmMessageTemplate } from '@/services/crm-leads';
import {
  getMissingTemplateVariables,
  getWhatsAppTemplateValues,
  renderMessageTemplate,
  templateVariableLabel,
} from '@/lib/crm-message-templates';

export type WhatsAppTemplateReference = { templateId: number; templateVersion: number };

export function WhatsAppTemplatePicker({
  lead,
  contact,
  appointment,
  templates,
  salesperson,
  recipientPhone,
  disabled = false,
  onApply,
}: {
  lead: CrmLead;
  contact?: Pick<CrmLeadContact, 'name' | 'email' | 'phone' | 'phone2'> | null;
  appointment?: CrmAppointment | null;
  templates: CrmMessageTemplate[];
  salesperson?: string | null;
  recipientPhone?: string | null;
  disabled?: boolean;
  onApply: (template: CrmMessageTemplate, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [manualValues, setManualValues] = useState<Record<string, string>>({});

  const availableTemplates = useMemo(() => templates.filter((template) =>
    !template.productInterest || lead.productInterests.includes(template.productInterest),
  ), [lead.productInterests, templates]);
  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return availableTemplates;
    return availableTemplates.filter((template) =>
      `${template.name} ${template.segment ?? ''} ${template.productInterest ?? ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    );
  }, [availableTemplates, search]);
  const selectedTemplate = availableTemplates.find((template) => String(template.id) === templateId) ?? null;
  const automaticValues = selectedTemplate
    ? getWhatsAppTemplateValues(selectedTemplate, { lead, contact, appointment, salesperson, recipientPhone })
    : {};
  const values = { ...automaticValues, ...manualValues };
  const missingVariables = selectedTemplate
    ? getMissingTemplateVariables(selectedTemplate.body, values)
    : [];
  const preview = selectedTemplate ? renderMessageTemplate(selectedTemplate.body, values) : '';

  const chooseTemplate = (id: string) => {
    setTemplateId(id);
    setManualValues({});
  };

  const applyTemplate = () => {
    if (!selectedTemplate || missingVariables.length || !preview.trim() || preview.length > 3000) return;
    onApply(selectedTemplate, preview);
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} disabled={disabled || !templates.length}>
        <MessageSquareText className="mr-2 h-4 w-4" />Mensagens prontas
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preparar mensagem pronta</DialogTitle>
            <DialogDescription>Os dados disponíveis do lead são preenchidos automaticamente. Complete os campos pendentes e confira o texto antes de usar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-template-search">Buscar mensagem</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="whatsapp-template-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Contato, reunião, Telecom…" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-template-select">Mensagem</Label>
              <select id="whatsapp-template-select" className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" value={templateId} onChange={(event) => chooseTemplate(event.target.value)}>
                <option value="">Selecione uma mensagem</option>
                {filteredTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}{template.productInterest ? ` · ${template.productInterest === 'TELECOM' ? 'Telecom' : 'Insuri'}` : ''}
                  </option>
                ))}
              </select>
              {!availableTemplates.length && <p className="text-sm text-muted-foreground">Não há mensagens prontas ativas para os produtos deste lead.</p>}
              {availableTemplates.length > 0 && !filteredTemplates.length && <p className="text-sm text-muted-foreground">Nenhuma mensagem corresponde à busca.</p>}
            </div>
            {selectedTemplate && (
              <>
                {missingVariables.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {missingVariables.map((key) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={`whatsapp-template-variable-${key}`}>{templateVariableLabel(key)}</Label>
                        <Input
                          id={`whatsapp-template-variable-${key}`}
                          value={manualValues[key] ?? ''}
                          onChange={(event) => setManualValues((current) => ({ ...current, [key]: event.target.value }))}
                          maxLength={500}
                          placeholder={`Preencha ${templateVariableLabel(key).toLocaleLowerCase('pt-BR')}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2 rounded-xl border border-border bg-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Prévia da mensagem</p>
                    <span className={`text-xs ${preview.length > 3000 ? 'text-danger-foreground' : 'text-muted-foreground'}`}>{preview.length}/3000</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground">{preview}</p>
                  {missingVariables.length > 0 && <p className="text-xs text-warning-foreground">Preencha todos os campos para usar a mensagem.</p>}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={applyTemplate} disabled={!selectedTemplate || missingVariables.length > 0 || !preview.trim() || preview.length > 3000}>Usar mensagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
