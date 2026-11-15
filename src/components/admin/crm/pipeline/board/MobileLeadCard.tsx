'use client';

import { memo } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { ArrowRightLeft, ExternalLink, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CALL_STATUS_LABEL, type PhoneCallStatus } from '@/services/telephony';
import { formatCurrencyBRL } from '@/components/admin/crm/format';
import type { PipelineLead, PipelineStage } from '@/services/crm-pipeline';
import { OwnerAvatar } from '../ui/OwnerAvatar';
import { TEMPERATURE_META, URGENCY_META, daysInStage, getUrgency, stageTint, type Urgency } from '../tokens';
import { useMotionSafe } from '../motion';

/** Distancia (px) que o cartao precisa percorrer no gesto para disparar a acao. */
const SWIPE_THRESHOLD = 80;
const SWIPE_LIMIT = 140;

const URGENCY_LABEL: Record<Urgency, string> = {
  overdue: 'Atrasado',
  today: 'Hoje',
  future: 'Agendado',
  none: 'Sem próxima ação',
};

export interface MobileLeadCardProps {
  lead: PipelineLead;
  stage: PipelineStage;
  isSupervisor: boolean;
  callingId: number | null;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
  onRequestMove: (lead: PipelineLead) => void;
}

/** Cartao compacto do celular: gesto de deslizar (direita = ligar, esquerda = mover) e acoes sempre visiveis. */
function MobileLeadCardInner({ lead, stage, isSupervisor, callingId, onCall, onOpen, onRequestMove }: MobileLeadCardProps) {
  const { reduced } = useMotionSafe();
  const x = useMotionValue(0);
  const callOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const moveOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const urgency = getUrgency(lead.nextActionAt);
  const temperature = lead.temperature ? TEMPERATURE_META[lead.temperature] : null;
  const days = daysInStage(lead);
  const callStatus = lead.lastCall
    ? (CALL_STATUS_LABEL[lead.lastCall.status as PhoneCallStatus] ?? lead.lastCall.status)
    : lead.interactionStatus;
  const calling = callingId === lead.id;
  const canCall = Boolean(lead.phone) && !calling;

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD && canCall) {
      onCall(lead);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onRequestMove(lead);
    }
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl" data-testid="mobile-lead-card">
      <motion.div
        aria-hidden="true"
        style={{ opacity: callOpacity, backgroundColor: 'hsl(var(--stage-won))' }}
        className="absolute inset-y-0 left-0 flex w-full items-center rounded-xl pl-4 text-white"
      >
        <Phone className="h-5 w-5" />
        <span className="ml-2 text-sm font-semibold">Ligar</span>
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ opacity: moveOpacity, backgroundColor: 'hsl(var(--brand))' }}
        className="absolute inset-y-0 right-0 flex w-full items-center justify-end rounded-xl pr-4 text-white"
      >
        <span className="mr-2 text-sm font-semibold">Mover</span>
        <ArrowRightLeft className="h-5 w-5" />
      </motion.div>

      <motion.article
        drag={reduced ? false : 'x'}
        dragSnapToOrigin
        dragConstraints={{ left: -SWIPE_LIMIT, right: SWIPE_LIMIT }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x: reduced ? 0 : x }}
        className="relative touch-pan-y rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] text-slate-900 shadow-sm dark:text-slate-50"
      >
        <div className="border-l-4 p-3 pl-3" style={{ borderLeftColor: stage.color }}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {temperature && (
                  <span
                    className={cn('inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md', temperature.className)}
                    role="img"
                    aria-label={`Temperatura: ${temperature.label}`}
                  >
                    <temperature.Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onOpen(lead.id)}
                  className="min-w-0 truncate rounded-sm text-left text-[15px] font-semibold leading-5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]"
                >
                  {lead.name}
                </button>
              </div>
              {lead.company && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>}
            </div>
            {isSupervisor && <OwnerAvatar name={lead.owner?.name} id={lead.ownerId} />}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-base font-semibold tabular-nums">{formatCurrencyBRL(lead.value)}</span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
              style={{ backgroundColor: stageTint(stage.color, 0.14), color: stage.color }}
            >
              {lead.effectiveProbability}%
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 font-medium', URGENCY_META[urgency].className)}>
              {URGENCY_LABEL[urgency]}
            </span>
            <span>há {days} {days === 1 ? 'dia' : 'dias'} nesta etapa</span>
            {callStatus && <span className="min-w-0 truncate">· {callStatus}</span>}
          </div>
        </div>

        <div className="flex items-stretch gap-1 border-t border-[hsl(var(--card-border))] p-1">
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 gap-1.5 text-[hsl(var(--stage-won))] hover:bg-[hsl(var(--stage-won)/0.1)] hover:text-[hsl(var(--stage-won))]"
            disabled={!canCall}
            onClick={() => onCall(lead)}
            aria-label={lead.phone ? `Ligar para ${lead.name}` : 'Lead sem telefone'}
          >
            {calling ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Phone className="h-4 w-4" aria-hidden="true" />}
            Ligar
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 gap-1.5 text-slate-700 dark:text-slate-200"
            onClick={() => onRequestMove(lead)}
            aria-label={`Mover ${lead.name} para outra etapa`}
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
            Mover
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 gap-1.5 text-slate-700 dark:text-slate-200"
            onClick={() => onOpen(lead.id)}
            aria-label={`Abrir ${lead.name}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Abrir
          </Button>
        </div>
      </motion.article>
    </div>
  );
}

/** Cartao do celular (sem arraste de DnD: o movimento e pela folha "Mover para"). */
export const MobileLeadCard = memo(MobileLeadCardInner);
