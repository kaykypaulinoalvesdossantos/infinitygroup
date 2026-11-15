'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, Loader2 } from 'lucide-react';
import { crmLeadsApi, LEAD_SOURCES } from '@/services/crm-leads';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { errorMessage } from '@/components/admin/crm/format';
import { pipelineKeys } from '../../queryKeys';
import { AutoText, Section } from '../parts';
import type { AutosaveApi } from '../useAutosave';
import type { DrawerLead } from '../types';

interface DataTabProps {
  lead: DrawerLead;
  autosave: AutosaveApi;
  onArchived: () => void;
}

/** Cadastro com autosave e zona de perigo (arquivar com confirmacao inline). */
export function DataTab({ lead, autosave, onArchived }: DataTabProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const archiveMutation = useMutation({
    mutationFn: () => crmLeadsApi.archive(lead.id),
    onSuccess: () => {
      toast.success('Lead arquivado.');
      void queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
      onArchived();
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Não foi possível arquivar o lead.'));
      setConfirming(false);
    },
  });

  const text = (value: string | null | undefined) => value ?? '';

  return (
    <div className="space-y-6">
      <Section title="Cadastro">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AutoText
            id="data-name"
            label="Nome"
            field="name"
            serverText={text(lead.name)}
            autosave={autosave}
            toPatch={(value) => ({ name: value })}
            maxLength={255}
            className="sm:col-span-2"
          />
          <AutoText
            id="data-company"
            label="Empresa"
            field="company"
            serverText={text(lead.company)}
            autosave={autosave}
            toPatch={(value) => ({ company: value.trim() || null })}
            maxLength={255}
          />
          <AutoText
            id="data-email"
            label="E-mail"
            field="email"
            type="email"
            inputMode="email"
            serverText={text(lead.email)}
            autosave={autosave}
            toPatch={(value) => ({ email: value.trim() || null })}
          />
          <AutoText
            id="data-phone"
            label="Telefone"
            field="phone"
            type="tel"
            inputMode="tel"
            placeholder="(11) 99999-9999"
            serverText={text(lead.phone)}
            autosave={autosave}
            toPatch={(value) => ({ phone: value.trim() || null })}
          />
          <AutoText
            id="data-phone2"
            label="Telefone 2"
            field="phone2"
            type="tel"
            inputMode="tel"
            serverText={text(lead.phone2)}
            autosave={autosave}
            toPatch={(value) => ({ phone2: value.trim() || null })}
          />
          <AutoText
            id="data-city"
            label="Cidade"
            field="city"
            serverText={text(lead.city)}
            autosave={autosave}
            toPatch={(value) => ({ city: value.trim() || null })}
          />
          <AutoText
            id="data-segment"
            label="Segmento"
            field="segment"
            serverText={text(lead.segment)}
            autosave={autosave}
            toPatch={(value) => ({ segment: value.trim() || null })}
          />
          <div className="min-w-0 space-y-1">
            <Label htmlFor="data-source" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Origem
            </Label>
            <Select value={lead.source} onValueChange={(value) => void autosave.saveNow({ source: value })}>
              <SelectTrigger id="data-source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Observações">
        <AutoText
          id="data-notes"
          label="Observações"
          srOnlyLabel
          field="notes"
          multiline
          rows={5}
          serverText={text(lead.notes)}
          autosave={autosave}
          toPatch={(value) => ({ notes: value.trim() || null })}
          placeholder="Anotações que devem ficar sempre visíveis."
        />
      </Section>

      <Section title="Zona de perigo">
        <div className="rounded-2xl border border-red-200 p-4 dark:border-red-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Arquivar tira o lead do pipeline.</p>
          {confirming ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-red-700 dark:text-red-300">Arquivar este lead?</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={archiveMutation.isPending}>
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  void autosave.flushAsync().then(() => archiveMutation.mutate());
                }}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending && <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
                Arquivar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="mt-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950"
              onClick={() => setConfirming(true)}
            >
              <Archive aria-hidden className="mr-2 h-4 w-4" />
              Arquivar lead
            </Button>
          )}
        </div>
      </Section>
    </div>
  );
}
