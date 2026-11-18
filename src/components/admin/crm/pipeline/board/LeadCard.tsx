'use client';

import { memo, useEffect, useRef, type MouseEvent } from 'react';
import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { motion, useAnimationControls } from 'framer-motion';
import { Clock, Phone, Snowflake } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CALL_STATUS_LABEL, type PhoneCallStatus } from '@/services/telephony';
import { formatCurrencyBRL, formatDateTime } from '@/components/admin/crm/format';
import type { PipelineLead, PipelineStage } from '@/services/crm-pipeline';
import { OwnerAvatar } from '../ui/OwnerAvatar';
import { TagChip } from '../ui/TagChip';
import { TEMPERATURE_META, URGENCY_META, daysInStage, getUrgency, isRotting, stageTint, type Urgency } from '../tokens';
import { useMotionSafe } from '../motion';
import { useLastFailedMove } from '../hooks/useMoveLead';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAX_CASCADE = 12;

/** Texto do chip de proxima acao: hoje mostra so a hora; outros dias, data e hora. */
function nextActionText(urgency: Urgency, iso: string | null): string {
  if (urgency === 'none' || !iso) return 'Sem próxima ação';
  if (urgency === 'today') {
    const time = new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Hoje ${time}`;
  }
  return formatDateTime(iso);
}

/** Dias desde o ultimo contato (ou entrada na etapa), para a dica de "esfriando". */
function daysWithoutContact(lead: PipelineLead): number {
  const reference = new Date(lead.lastContactAt ?? lead.stageEnteredAt ?? lead.createdAt).getTime();
  if (Number.isNaN(reference)) return 0;
  return Math.max(0, Math.floor((Date.now() - reference) / (24 * 60 * 60 * 1000)));
}

interface QuickActionProps {
  label: string;
  icon: typeof Phone;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'success' | 'neutral';
}

function QuickAction({ label, icon: Icon, onClick, disabled, tone = 'neutral' }: QuickActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] disabled:pointer-events-none disabled:opacity-40',
            tone === 'success'
              ? 'text-[hsl(var(--stage-won))] hover:bg-[hsl(var(--stage-won)/0.12)]'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground   ',
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export interface LeadCardProps {
  lead: PipelineLead;
  stage: PipelineStage;
  isSupervisor: boolean;
  callingId: number | null;
  selected: boolean;
  selectionActive: boolean;
  /** Posicao para a entrada em cascata; undefined = sem animacao de entrada. */
  cascadeIndex?: number;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onToggleSelect: (lead: PipelineLead, shift: boolean) => void;
  onCall: (lead: PipelineLead) => void;
  onOpen: (leadId: number) => void;
}

function LeadCardInner({
  lead,
  stage,
  isSupervisor,
  callingId,
  selected,
  selectionActive,
  cascadeIndex,
  provided,
  snapshot,
  onToggleSelect,
  onCall,
  onOpen,
}: LeadCardProps) {
  const { reduced } = useMotionSafe();
  const { isDragging } = snapshot;

  // Tremida curta quando o movimento deste cartao falhou (o rollback ja devolveu o cartao)
  const shake = useAnimationControls();
  const failed = useLastFailedMove();
  const failedSeq = failed && failed.leadId === lead.id ? failed.seq : null;
  const initialFailedSeq = useRef(failedSeq);
  useEffect(() => {
    if (failedSeq === null || failedSeq === initialFailedSeq.current || reduced) return;
    initialFailedSeq.current = failedSeq;
    void shake.start({ x: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.42, ease: 'easeInOut' } });
  }, [failedSeq, reduced, shake]);
  const urgency = getUrgency(lead.nextActionAt);
  const urgencyMeta = URGENCY_META[urgency];
  const rotting = isRotting(lead, stage);
  const temperature = lead.temperature ? TEMPERATURE_META[lead.temperature] : null;
  const callStatus = lead.lastCall
    ? (CALL_STATUS_LABEL[lead.lastCall.status as PhoneCallStatus] ?? lead.lastCall.status)
    : lead.interactionStatus;
  const visibleTags = lead.tags.slice(0, 2);
  const extraTags = lead.tags.length - visibleTags.length;
  const showCheckbox = selected || selectionActive;
  const cascading = cascadeIndex !== undefined && !reduced;
  const days = daysInStage(lead);

  const stopAndOpen = (e: MouseEvent) => {
    e.stopPropagation();
    onOpen(lead.id);
  };

  const dragShadow = isDragging ? `0 0 0 2px ${stage.color}, 0 24px 48px -16px rgb(15 23 42 / 0.35)` : undefined;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="group relative mb-2 outline-none"
    >
      <motion.div animate={shake}>
      <motion.article
        initial={cascading ? { opacity: 0, y: 8 } : false}
        animate={
          isDragging && !reduced
            ? { opacity: 1, y: 0, scale: 1.03, rotate: 2 }
            : { opacity: 1, y: 0, scale: 1, rotate: 0 }
        }
        transition={
          isDragging
            ? { type: 'spring', stiffness: 500, damping: 32 }
            : { duration: 0.22, ease: EASE_OUT, delay: cascading ? Math.min(cascadeIndex ?? 0, MAX_CASCADE) * 0.03 : 0 }
        }
        whileHover={isDragging || reduced ? undefined : { y: -2 }}
        onClick={() => onOpen(lead.id)}
        style={{ boxShadow: dragShadow }}
        className={cn(
          'cursor-pointer rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-3 text-foreground shadow-sm transition-[box-shadow,border-color] duration-200 hover:shadow-md ',
          isDragging && 'shadow-xl',
          selected && 'border-[hsl(var(--brand)/0.5)] ring-1 ring-[hsl(var(--brand)/0.35)]',
          rotting && 'border-l-[3px] border-l-[hsl(var(--rotting))]',
        )}
      >
        <div className="absolute right-2 top-2 z-10">
          <QuickAction
            label={lead.phone ? `Ligar para ${lead.name}` : 'Lead sem telefone'}
            icon={Phone}
            tone="success"
            disabled={!lead.phone || callingId === lead.id}
            onClick={() => onCall(lead)}
          />
        </div>

        <div className="flex items-start gap-2">
          <div
            className={cn(
              'overflow-hidden transition-[width,opacity] duration-150',
              showCheckbox ? 'w-4 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-100',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              aria-label={`Selecionar ${lead.name}`}
              checked={selected}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(lead, e.shiftKey);
              }}
              className="mt-0.5 h-4 w-4"
            />
          </div>
          <div className="min-w-0 flex-1 pr-7">
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
                onClick={stopAndOpen}
                title={lead.name}
                className="min-w-0 truncate rounded-sm text-left text-sm font-semibold leading-5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]"
              >
                {lead.name}
              </button>
            </div>
            {lead.company && lead.company !== lead.name && <p title={lead.company} className="truncate text-xs text-muted-foreground">{lead.company}</p>}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-base font-semibold tabular-nums text-foreground ">{formatCurrencyBRL(lead.value)}</span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
            style={{ backgroundColor: stageTint(stage.color, 0.14), color: stage.color }}
            title="Probabilidade de fechamento"
          >
            {lead.effectiveProbability}%
          </span>
        </div>

        {visibleTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
              <TagChip key={tag.id} name={tag.name} color={tag.color} />
            ))}
            {extraTags > 0 && <span className="text-[11px] font-medium text-muted-foreground ">+{extraTags}</span>}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[hsl(var(--card-border))] pt-2.5">
          <span
            className={cn(
              'inline-flex min-w-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
              urgencyMeta.className,
            )}
          >
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{urgency === 'none' ? urgencyMeta.label : nextActionText(urgency, lead.nextActionAt)}</span>
          </span>
          {isSupervisor && <OwnerAvatar name={lead.owner?.name} id={lead.ownerId} />}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground ">
          <span className="shrink-0">há {days} {days === 1 ? 'dia' : 'dias'} nesta etapa</span>
          {callStatus && (
            <>
              <span aria-hidden="true">·</span>
              <span className="min-w-0 truncate">{callStatus}</span>
            </>
          )}
          {rotting && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 font-medium text-[hsl(var(--rotting))]" tabIndex={0} aria-label={`Esfriando: sem contato há ${daysWithoutContact(lead)} dias`}>
                  <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Sem contato há {daysWithoutContact(lead)} dias</TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.article>
      </motion.div>
    </div>
  );
}

/** Cartao do lead no board. Memoizado; o Draggable fica no componente pai. */
export const LeadCard = memo(LeadCardInner);
