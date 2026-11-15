'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Plus } from 'lucide-react';
import { LEAD_SOURCES, PRODUCT_INTERESTS, type ProductInterest } from '@/services/crm-leads';
import { pipelineApi, type CrmTag } from '@/services/crm-pipeline';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { errorMessage, formatDateTime } from '@/components/admin/crm/format';
import { TagChip } from '../../ui/TagChip';
import { getUrgency, URGENCY_META } from '../../tokens';
import { useTags } from '../../hooks/usePipelineData';
import { pipelineKeys } from '../../queryKeys';
import { OUTCOME_LABEL } from '../labels';
import { AutoText, dateInputValue, isoFromDateInput, Section } from '../parts';
import type { AutosaveApi } from '../useAutosave';
import type { DrawerLead, DrawerTabProps } from '../types';

/** Limite de produtos de interesse por lead (mesma regra de LeadFields). */
const MAX_PRODUCTS = 2;

/** Visao geral: proximo compromisso, proximo passo, etiquetas, produtos, origem e historico recente. */
export function OverviewTab({ lead, autosave, appointments, onEditAppointment }: DrawerTabProps) {
  const nextAppointment = useMemo(
    () =>
      appointments
        .filter((item) => item.status === 'SCHEDULED' && new Date(item.startsAt).getTime() >= Date.now())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0],
    [appointments],
  );
  const urgency = URGENCY_META[getUrgency(lead.nextActionAt)];
  const lastCall = lead.lastCall;

  return (
    <div className="space-y-6">
      <Section title="Próximo compromisso">
        {nextAppointment ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--card-border))] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{nextAppointment.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(nextAppointment.startsAt)}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => onEditAppointment(nextAppointment)}>
              Editar
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum compromisso agendado.</p>
        )}
      </Section>

      <Section title="Próximo passo">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <AutoText
              id="overview-next"
              label="Próxima ação"
              field="nextActionAt"
              type="datetime-local"
              serverText={dateTimeValue(lead.nextActionAt)}
              autosave={autosave}
              toPatch={(text) => ({ nextActionAt: text ? new Date(text).toISOString() : null })}
            />
            <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium', urgency.className)}>
              {urgency.label}
            </span>
          </div>
          <AutoText
            id="overview-close"
            label="Previsão de fechamento"
            field="expectedCloseAt"
            type="date"
            serverText={dateInputValue(lead.expectedCloseAt)}
            autosave={autosave}
            toPatch={(text) => ({ expectedCloseAt: isoFromDateInput(text) })}
          />
        </div>
      </Section>

      <Section title="Etiquetas">
        <TagsEditor lead={lead} />
      </Section>

      <Section title="Produtos de interesse">
        <ProductsEditor lead={lead} autosave={autosave} />
      </Section>

      <Section title="Cadastro rápido">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1">
            <Label htmlFor="overview-source" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Origem
            </Label>
            <Select value={lead.source} onValueChange={(value) => void autosave.saveNow({ source: value })}>
              <SelectTrigger id="overview-source" className="w-full">
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
          <AutoText
            id="overview-segment"
            label="Segmento"
            field="segment"
            serverText={lead.segment ?? ''}
            autosave={autosave}
            toPatch={(text) => ({ segment: text.trim() || null })}
          />
        </div>
      </Section>

      <Section title="Histórico recente">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Último contato</dt>
            <dd className="font-medium tabular-nums text-slate-800 dark:text-slate-100">{formatDateTime(lead.lastContactAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Última ligação</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {lastCall
                ? `${OUTCOME_LABEL[lastCall.status] ?? lastCall.status} · ${formatDateTime(lastCall.createdAt)}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Status do discador</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {lead.interactionStatus ? (OUTCOME_LABEL[lead.interactionStatus] ?? lead.interactionStatus) : '—'}
            </dd>
          </div>
        </dl>
      </Section>

      {lead.lostReason && (
        <Section title="Motivo da perda">
          <p className="whitespace-pre-line break-words text-sm text-slate-700 dark:text-slate-200">{lead.lostReason}</p>
        </Section>
      )}
    </div>
  );
}

/** ISO -> valor de <input type="datetime-local"> (hora local). */
function dateTimeValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Etiquetas do lead. Mesma regra de LeadFields: so as tags ativas aparecem e sao gravadas
 * (o PATCH grava o conjunto enviado em tagIds).
 */
function TagsEditor({ lead }: { lead: DrawerLead }) {
  const queryClient = useQueryClient();
  const { data: tags = [] } = useTags();
  const [open, setOpen] = useState(false);
  const activeTags = tags.filter((tag) => tag.isActive);
  const leadTags = lead.tags.filter((tag) => tag.isActive);
  const selectedIds = new Set(leadTags.map((tag) => tag.id));

  const mutation = useMutation({
    mutationFn: (tagIds: number[]) => pipelineApi.update(lead.id, { tagIds }),
    onSuccess: (updated) => {
      queryClient.setQueryData<DrawerLead>(pipelineKeys.lead(lead.id), (old) => (old ? { ...old, ...updated } : old));
      void queryClient.invalidateQueries({ queryKey: pipelineKeys.columns() });
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível atualizar as etiquetas.')),
  });

  const toggle = (tag: CrmTag) => {
    const next = selectedIds.has(tag.id)
      ? leadTags.filter((item) => item.id !== tag.id).map((item) => item.id)
      : [...leadTags.map((item) => item.id), tag.id];
    mutation.mutate(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {leadTags.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Sem etiquetas.</p>}
      {leadTags.map((tag) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          size="md"
          onRemove={mutation.isPending ? undefined : () => toggle(tag)}
        />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-2.5 text-xs">
            <Plus aria-hidden className="mr-1 h-3.5 w-3.5" />
            Etiqueta
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          {activeTags.length === 0 ? (
            <p className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma etiqueta ativa. Um administrador pode criar tags.</p>
          ) : (
            <ul className="max-h-64 space-y-0.5 overflow-y-auto pipeline-scrollbar">
              {activeTags.map((tag) => {
                const active = selectedIds.has(tag.id);
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      disabled={mutation.isPending}
                      onClick={() => toggle(tag)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] disabled:opacity-60 dark:hover:bg-slate-800"
                    >
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="flex-1 truncate">{tag.name}</span>
                      {active && <Check aria-hidden className="h-4 w-4 text-[hsl(var(--brand))]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Produtos de interesse (TELECOM / SEGUROS), no maximo 2, gravados no PATCH do lead. */
function ProductsEditor({ lead, autosave }: { lead: DrawerLead; autosave: AutosaveApi }) {
  const selected: ProductInterest[] = lead.productInterests ?? [];

  const toggle = (id: ProductInterest) => {
    const isOn = selected.includes(id);
    if (!isOn && selected.length >= MAX_PRODUCTS) return;
    const next = isOn ? selected.filter((value) => value !== id) : [...selected, id];
    void autosave.saveNow({ productInterests: next });
  };

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Produtos de interesse" className="flex flex-wrap gap-2">
        {PRODUCT_INTERESTS.map((product) => {
          const active = selected.includes(product.id);
          const blocked = !active && selected.length >= MAX_PRODUCTS;
          return (
            <button
              key={product.id}
              type="button"
              role="checkbox"
              aria-checked={active}
              disabled={blocked}
              onClick={() => toggle(product.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] disabled:cursor-not-allowed disabled:opacity-50',
                active
                  ? 'border-transparent bg-[hsl(var(--brand))] text-white'
                  : 'border-[hsl(var(--card-border))] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              {active && <Check aria-hidden className="h-3.5 w-3.5" />}
              {product.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Até {MAX_PRODUCTS} produtos por lead.</p>
    </div>
  );
}
