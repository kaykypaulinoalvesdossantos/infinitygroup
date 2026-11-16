'use client';

import { useState } from 'react';
import { CheckCircle2, CalendarPlus, ChevronDown, ListTodo, Loader2, Mail, MessageCircle, Phone, XCircle } from 'lucide-react';
import type { CrmLead, TeamUser } from '@/services/crm-leads';
import type { PipelineStage, Temperature } from '@/services/crm-pipeline';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatPhone } from '@/components/admin/crm/format';
import { useStages } from '../hooks/usePipelineData';
import { TEMPERATURE_META } from '../tokens';
import { AutoText, SaveIndicator, SectionTitle } from './parts';
import type { AutosaveApi } from './useAutosave';
import { useStageMove } from './useStageMove';
import { toCrmLead, type DrawerLead } from './types';

const TEMPERATURES: Temperature[] = ['COLD', 'WARM', 'HOT'];

export interface DrawerHeaderProps {
  lead: DrawerLead;
  autosave: AutosaveApi;
  isSupervisor: boolean;
  owners: TeamUser[];
  callingId: number | null;
  canWhatsApp: boolean;
  onCall: (lead: CrmLead) => void;
  onOpenWhatsApp: () => void;
  onSchedule: () => void;
  onSendEmail: () => void;
  onCreateTask: () => void;
  onRequestOutcome?: (lead: CrmLead, kind: 'WON' | 'LOST') => void;
}

/** Cabecalho da gaveta: nome, etapa, valor, probabilidade, temperatura, dono e acoes. */
export function DrawerHeader({
  lead,
  autosave,
  isSupervisor,
  owners,
  callingId,
  canWhatsApp,
  onCall,
  onOpenWhatsApp,
  onSchedule,
  onSendEmail,
  onCreateTask,
  onRequestOutcome,
}: DrawerHeaderProps) {
  const { data: stages = [] } = useStages();
  const moveTo = useStageMove(lead, autosave);
  const [stageOpen, setStageOpen] = useState(false);

  const current = stages.find((stage) => stage.id === (lead.funnelStage?.id ?? 0));
  const openStages = stages.filter((stage) => stage.type === 'OPEN').sort((a, b) => a.position - b.position);
  const outcomeStages = stages.filter((stage) => stage.type === 'WON' || stage.type === 'LOST');
  const isCalling = callingId === lead.id;
  const phone = lead.phone || lead.phone2;
  const stageName = current?.name ?? lead.funnelStage?.name ?? 'Sem etapa';

  const pickStage = (stage: PipelineStage) => {
    setStageOpen(false);
    if (stage.id === (lead.funnelStage?.id ?? 0)) return;
    if (stage.type === 'OPEN') {
      void moveTo(stage.id);
      return;
    }
    onRequestOutcome?.(toCrmLead(lead), stage.type);
  };

  return (
    <header className="space-y-4 px-4 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <AutoText
            id="drawer-name"
            label="Nome do lead"
            srOnlyLabel
            field="name"
            variant="inline"
            serverText={lead.name}
            autosave={autosave}
            toPatch={(text) => ({ name: text })}
            maxLength={255}
            inputClassName="text-xl font-semibold tracking-tight"
          />
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {lead.company && <span>{lead.company}</span>}
            <span className="tabular-nums">{phone ? formatPhone(phone) : 'Sem telefone cadastrado'}</span>
          </div>
        </div>
        <div className="pt-1">
          <SaveIndicator status={autosave.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Popover open={stageOpen} onOpenChange={setStageOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Etapa: ${stageName}. Trocar etapa`}
              className="h-auto min-h-9 max-w-full gap-2 whitespace-normal rounded-full px-3 py-1.5"
            >
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: current?.color ?? lead.funnelStage?.color }} />
              <span className="min-w-0">{stageName}</span>
              <ChevronDown aria-hidden className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-1.5">
            <SectionTitle className="px-2 pb-1 pt-1">Mover para</SectionTitle>
            <div className="space-y-0.5">
              {openStages.map((stage) => (
                <StageOption key={stage.id} stage={stage} active={stage.id === (lead.funnelStage?.id ?? 0)} onPick={pickStage} />
              ))}
            </div>
            {outcomeStages.length > 0 && (
              <>
                <div className="my-1.5 border-t border-border " />
                {outcomeStages.map((stage) => (
                  <StageOption key={stage.id} stage={stage} active={stage.id === (lead.funnelStage?.id ?? 0)} onPick={pickStage} />
                ))}
              </>
            )}
          </PopoverContent>
        </Popover>

        <AutoText
          id="drawer-value"
          label="Valor"
          field="value"
          serverText={lead.value !== null ? String(lead.value).replace('.', ',') : ''}
          autosave={autosave}
          toPatch={(text) => ({ value: text.trim() ? Number(text.trim().replace(',', '.')) : null })}
          inputMode="decimal"
          prefix="R$"
          placeholder="0,00"
          className="w-36"
        />

        <AutoText
          id="drawer-probability"
          label="Probabilidade"
          field="probability"
          serverText={String(lead.probability ?? lead.effectiveProbability)}
          autosave={autosave}
          toPatch={(text) => ({ probability: text.trim() === '' ? null : Math.round(Number(text)) })}
          type="number"
          min={0}
          max={100}
          suffix="%"
          placeholder={current ? String(current.probability) : undefined}
          className="w-28"
        />

        <div className="space-y-1">
          <span className="block text-xs font-medium text-muted-foreground ">Temperatura</span>
          <div role="group" aria-label="Temperatura" className="flex h-9 items-center gap-0.5 rounded-full border border-[hsl(var(--card-border))] p-0.5">
            {TEMPERATURES.map((temperature) => {
              const temp = TEMPERATURE_META[temperature];
              const active = lead.temperature === temperature;
              const Icon = temp.Icon;
              return (
                <button
                  key={temperature}
                  type="button"
                  aria-pressed={active}
                  aria-label={temp.label}
                  title={temp.label}
                  onClick={() => void autosave.saveNow({ temperature: active ? null : temperature })}
                  className={cn(
                    'flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
                    active ? temp.className : 'text-muted-foreground hover:bg-muted  ',
                  )}
                >
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{temp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isSupervisor && (
          <div className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground ">Responsável</span>
            <Select
              value={lead.ownerId ? String(lead.ownerId) : 'none'}
              onValueChange={(value) => void autosave.saveNow({ ownerId: value === 'none' ? null : Number(value) })}
            >
              <SelectTrigger aria-label="Responsável" className="h-9 w-44">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {lead.ownerId && !owners.some((owner) => owner.id === lead.ownerId) && (
                  <SelectItem value={String(lead.ownerId)}>{lead.owner?.name ?? 'Responsável indisponível'}</SelectItem>
                )}
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={String(owner.id)}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[hsl(var(--card-border))] pt-3">
        {phone && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCall(toCrmLead(lead))}
            disabled={isCalling}
            className="border-success-border text-success-foreground hover:bg-success   "
          >
            {isCalling ? <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" /> : <Phone aria-hidden className="mr-1.5 h-4 w-4" />}
            Ligar
          </Button>
        )}
        {canWhatsApp && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenWhatsApp}
            className="border-success-border text-success-foreground hover:bg-success   "
          >
            <MessageCircle aria-hidden className="mr-1.5 h-4 w-4" />
            WhatsApp
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onSchedule}>
          <CalendarPlus aria-hidden className="mr-1.5 h-4 w-4" />
          Agendar
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onSendEmail}>
          <Mail aria-hidden className="mr-1.5 h-4 w-4" />
          Enviar e-mail
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCreateTask}>
          <ListTodo aria-hidden className="mr-1.5 h-4 w-4" />
          Criar pendência
        </Button>
        {onRequestOutcome && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRequestOutcome(toCrmLead(lead), 'WON')}
              className="border-success-border text-success-foreground hover:bg-success   "
            >
              <CheckCircle2 aria-hidden className="mr-1.5 h-4 w-4" />
              Ganho
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRequestOutcome(toCrmLead(lead), 'LOST')}
              className="border-danger-border text-danger-foreground hover:bg-danger  "
            >
              <XCircle aria-hidden className="mr-1.5 h-4 w-4" />
              Perdido
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function StageOption({
  stage,
  active,
  onPick,
}: {
  stage: PipelineStage;
  active: boolean;
  onPick: (stage: PipelineStage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(stage)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] ',
        active && 'font-semibold',
      )}
    >
      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
      <span className="truncate">{stage.name}</span>
    </button>
  );
}
