'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { crmLeadsApi, type CrmLead, type TeamUser } from '@/services/crm-leads';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/components/admin/crm/format';
import { useHotkeys } from '../hooks/useHotkeys';
import { useMotionSafe } from '../motion';
import { pipelineKeys } from '../queryKeys';
import { ShimmerBlock } from './parts';
import { LeadDrawerBody } from './LeadDrawerBody';
import { appointmentsKey, normalizeDrawerLead } from './types';

/**
 * CONTRATO FIXO entre o board (PipelinePage) e a gaveta do lead.
 */
export interface LeadDrawerProps {
  /** Lead aberto (null = fechado). Vem de usePipelineFilters().leadId. */
  leadId: number | null;
  onClose: () => void;
  /** Ids na ordem visivel atual (coluna ou lista) para navegar com setas ↑/↓. */
  siblingIds?: number[];
  onNavigate?: (leadId: number) => void;
  isSupervisor: boolean;
  owners: TeamUser[];
  /** Ligar pelo ramal (telephonyService.callLead) — implementado pela pagina. */
  onCall: (lead: CrmLead) => void;
  callingId: number | null;
  /** Pede ao board para abrir o dialogo de Ganho/Perdido (mesmo fluxo do arrastar). */
  onRequestOutcome?: (lead: CrmLead, kind: 'WON' | 'LOST') => void;
}

/** Ignora setas quando um menu, select ou popover esta aberto. */
const isOverlayOpen = () => Boolean(document.querySelector('[role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]'));

/** Gaveta lateral do lead (560px; tela cheia abaixo de 640px). Abre por cima do board, sem fechar o funil. */
export function LeadDrawer({
  leadId,
  onClose,
  siblingIds = [],
  onNavigate,
  isSupervisor,
  owners,
  onCall,
  callingId,
  onRequestOutcome,
}: LeadDrawerProps) {
  const { drawer } = useMotionSafe();
  const open = leadId !== null;

  const leadQuery = useQuery({
    queryKey: pipelineKeys.lead(leadId ?? 0),
    queryFn: async () => normalizeDrawerLead(await crmLeadsApi.get(leadId as number)),
    enabled: open,
  });

  const appointmentsQuery = useQuery({
    queryKey: appointmentsKey(leadId ?? 0),
    queryFn: () => crmLeadsApi.listAppointments(leadId as number),
    enabled: open,
  });

  const index = leadId === null ? -1 : siblingIds.indexOf(leadId);
  const prevId = index > 0 ? siblingIds[index - 1] : undefined;
  const nextId = index >= 0 && index < siblingIds.length - 1 ? siblingIds[index + 1] : undefined;
  const go = (id: number | undefined) => {
    if (id !== undefined && onNavigate) onNavigate(id);
  };

  useHotkeys(
    {
      ArrowUp: () => {
        if (!isOverlayOpen()) go(prevId);
      },
      ArrowDown: () => {
        if (!isOverlayOpen()) go(nextId);
      },
    },
    open,
  );

  // Resposta parcial da cache (ex.: PATCH de etapa sem activities/contacts) ganha os campos que faltam antes do refetch
  const lead = leadQuery.data && leadQuery.data.id === leadId ? normalizeDrawerLead(leadQuery.data) : undefined;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        {/* Celular: tela cheia (100dvh acompanha a barra do navegador e o teclado). Desktop: painel de 560px. */}
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden border-l border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] text-slate-900 shadow-2xl outline-none sm:h-full sm:w-[560px] sm:max-w-[560px] sm:rounded-l-[20px] dark:text-slate-50 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-200 [&_button]:min-h-11 sm:[&_button]:min-h-0">
          <DialogPrimitive.Title className="sr-only">{lead?.name ?? 'Lead'}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Detalhes, edição e atividades do lead</DialogPrimitive.Description>

          <motion.div className="flex min-h-0 flex-1 flex-col" variants={drawer} initial="hidden" animate="show">
            <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--card-border))] px-3 py-2">
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Lead anterior" disabled={!prevId} onClick={() => go(prevId)}>
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                </Button>
                <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {index >= 0 ? `${index + 1} de ${siblingIds.length}` : ''}
                </span>
                <Button type="button" variant="ghost" size="icon" aria-label="Próximo lead" disabled={!nextId} onClick={() => go(nextId)}>
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">↑ ↓ navegar</span>
                <DialogPrimitive.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Fechar gaveta">
                    <X aria-hidden className="h-4 w-4" />
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </div>

            {open && leadQuery.isError && !lead && (
              <div className="p-5">
                <Alert variant="destructive">
                  <AlertCircle aria-hidden className="h-4 w-4" />
                  <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                    <span>{errorMessage(leadQuery.error, 'Não foi possível carregar o lead.')}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => void leadQuery.refetch()}>
                      Tentar de novo
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {open && !lead && !leadQuery.isError && (
              <div role="status" aria-label="Carregando lead" className="space-y-4 p-5">
                <ShimmerBlock className="h-7 w-2/3" />
                <ShimmerBlock className="h-10 w-full" />
                <ShimmerBlock className="h-24 w-full" />
                <ShimmerBlock className="h-40 w-full" />
              </div>
            )}

            {lead && (
              <LeadDrawerBody
                key={lead.id}
                lead={lead}
                appointments={appointmentsQuery.data ?? []}
                isSupervisor={isSupervisor}
                owners={owners}
                callingId={callingId}
                onCall={onCall}
                onRequestOutcome={onRequestOutcome}
                onClose={onClose}
              />
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
