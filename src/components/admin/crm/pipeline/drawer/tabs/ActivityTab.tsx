'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, CalendarClock, FileText, ListTodo, Mail, MessageCircle, Phone, StickyNote, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrmLeadActivity } from '@/services/crm-leads';
import type { PipelineStage } from '@/services/crm-pipeline';
import { formatDuration } from '@/services/telephony';
import { formatDateTime } from '@/components/admin/crm/format';
import { useMotionSafe } from '../../motion';
import { useStages } from '../../hooks/usePipelineData';
import { stageTint } from '../../tokens';
import {
  ACTIVITY_FILTERS,
  ACTIVITY_TITLE,
  DIRECTION_LABEL,
  OUTCOME_LABEL,
  type ActivityFilter,
} from '../labels';
import { SectionTitle } from '../parts';
import type { DrawerLead } from '../types';

const ACTIVITY_STYLE: Record<CrmLeadActivity['type'], { Icon: LucideIcon; className: string }> = {
  CALL: { Icon: Phone, className: 'bg-success/10 text-success-foreground ' },
  NOTE: { Icon: StickyNote, className: 'bg-warning/10 text-warning-foreground ' },
  STATUS: { Icon: ArrowRightLeft, className: 'bg-accent/50 text-accent-foreground ' },
  APPOINTMENT: { Icon: CalendarClock, className: 'bg-info/10 text-info-foreground ' },
  WHATSAPP: { Icon: MessageCircle, className: 'bg-success/10 text-success-foreground ' },
  EMAIL: { Icon: Mail, className: 'bg-primary/10 text-link ' },
  TASK: { Icon: ListTodo, className: 'bg-warning/10 text-warning-foreground ' },
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(date)) / DAY_MS);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Agrupa por dia, do mais recente para o mais antigo. */
function groupByDay(items: CrmLeadActivity[]): Array<{ label: string; items: CrmLeadActivity[] }> {
  const sorted = [...items].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const groups: Array<{ label: string; items: CrmLeadActivity[] }> = [];
  for (const item of sorted) {
    const label = dayLabel(item.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

interface ActivityRowProps {
  activity: CrmLeadActivity;
  stages: PipelineStage[];
}

/** Linha da timeline: icone colorido por tipo, rotulos de outcome e duracao (mesmos de lead-dialogs). */
export function ActivityRow({ activity, stages }: ActivityRowProps) {
  const { cardEnter } = useMotionSafe();
  const style = ACTIVITY_STYLE[activity.type] ?? { Icon: FileText, className: 'bg-muted text-muted-foreground' };
  const title =
    activity.type === 'CALL' && activity.metadata?.provider === 'WACALLS'
      ? 'Ligação WhatsApp'
      : ACTIVITY_TITLE[activity.type] ?? 'Registro';
  const durationSec = typeof activity.metadata?.durationSec === 'number' ? activity.metadata.durationSec : null;

  let outcome: ReactNode = null;
  if (activity.outcome) {
    const toStageId = Number((activity.metadata as { toStageId?: unknown } | null)?.toStageId);
    const stage = activity.type === 'STATUS' ? stages.find((s) => s.id === toStageId) : undefined;
    outcome = stage ? (
      <Badge className="border-transparent text-[11px]" style={{ backgroundColor: stageTint(stage.color, 0.14), color: stage.color }}>
        {stage.name}
      </Badge>
    ) : (
      <Badge variant="outline" className="text-[11px]">
        {OUTCOME_LABEL[activity.outcome] ?? activity.outcome}
      </Badge>
    );
  }

  return (
    <motion.li variants={cardEnter} className="relative flex gap-3 pb-5 last:pb-0">
      <div className={cn('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', style.className)}>
        <style.Icon aria-hidden className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground ">{title}</span>
          <time dateTime={activity.occurredAt} className="text-xs text-muted-foreground ">
            {formatDateTime(activity.occurredAt)}
          </time>
        </div>
        {activity.summary && (
          <p className="whitespace-pre-line break-words text-sm text-muted-foreground ">{activity.summary}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {activity.direction && (
            <Badge variant="outline" className="text-[11px]">
              {DIRECTION_LABEL[activity.direction] ?? activity.direction}
            </Badge>
          )}
          {outcome}
          {durationSec !== null && (
            <Badge variant="secondary" className="text-[11px]">
              Duração {formatDuration(durationSec)}
            </Badge>
          )}
        </div>
        {activity.nextActionAt && (
          <p className="text-xs text-muted-foreground ">Próxima ação: {formatDateTime(activity.nextActionAt)}</p>
        )}
      </div>
    </motion.li>
  );
}

/** Timeline agrupada por dia com filtro por tipo. */
export function ActivityTab({ lead }: { lead: DrawerLead }) {
  const { listStagger } = useMotionSafe();
  const { data: stages = [] } = useStages();
  const [filter, setFilter] = useState<ActivityFilter>('ALL');

  const groups = useMemo(() => {
    const items = (lead.activities ?? []).filter((activity) => filter === 'ALL' || activity.type === filter);
    return groupByDay(items);
  }, [lead.activities, filter]);

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Filtrar atividades por tipo" className="flex flex-wrap gap-1.5">
        {ACTIVITY_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
              filter === option.value
                ? 'border-transparent bg-primary text-primary-foreground  '
                : 'border-[hsl(var(--card-border))] text-muted-foreground hover:bg-muted  ',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground  ">
          {filter === 'ALL' ? 'Nenhuma atividade registrada ainda.' : 'Nenhuma atividade deste tipo.'}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="space-y-3">
            <SectionTitle>{group.label}</SectionTitle>
            <motion.ol
              variants={listStagger}
              initial="hidden"
              animate="show"
              className="relative before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-muted "
            >
              {group.items.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} stages={stages} />
              ))}
            </motion.ol>
          </section>
        ))
      )}
    </div>
  );
}
