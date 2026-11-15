import { Flame, Snowflake, Thermometer, type LucideIcon } from 'lucide-react';
import type { PipelineLead, PipelineStage, Temperature } from '@/services/crm-pipeline';

/** Temperatura do lead: rotulo, icone e cor (usa os tokens CSS do pipeline). */
export const TEMPERATURE_META: Record<Temperature, { label: string; Icon: LucideIcon; className: string }> = {
  COLD: { label: 'Frio', Icon: Snowflake, className: 'text-sky-600 bg-sky-500/10 dark:text-sky-300' },
  WARM: { label: 'Morno', Icon: Thermometer, className: 'text-amber-600 bg-amber-500/10 dark:text-amber-300' },
  HOT: { label: 'Quente', Icon: Flame, className: 'text-red-600 bg-red-500/10 dark:text-red-300' },
};

export type Urgency = 'overdue' | 'today' | 'future' | 'none';

const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Urgencia da proxima acao: atrasada, hoje, futura ou sem proxima acao. */
export function getUrgency(nextActionAt: string | null | undefined, now: Date = new Date()): Urgency {
  if (!nextActionAt) return 'none';
  const date = new Date(nextActionAt);
  if (Number.isNaN(date.getTime())) return 'none';
  if (date.getTime() < now.getTime()) return isSameLocalDay(date, now) ? 'today' : 'overdue';
  return isSameLocalDay(date, now) ? 'today' : 'future';
}

export const URGENCY_META: Record<Urgency, { label: string; className: string }> = {
  overdue: { label: 'Atrasado', className: 'border-[hsl(var(--urgent))] bg-[hsl(var(--urgent)/0.12)] text-[hsl(var(--urgent))]' },
  today: { label: 'Hoje', className: 'border-[hsl(var(--today))] bg-[hsl(var(--today)/0.12)] text-[hsl(var(--today))]' },
  future: { label: 'Agendado', className: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  none: { label: 'Sem próxima ação', className: 'border-dashed border-slate-400 text-slate-500 dark:border-slate-500 dark:text-slate-400' },
};

/** Converte #RGB ou #RRGGBB em rgba com a opacidade informada. */
export function stageTint(hex: string, alpha: number): string {
  const fallback = [100, 116, 139];
  const clean = hex.trim().replace(/^#/, '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(${fallback.join(', ')}, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dias na etapa atual (a partir de stageEnteredAt, senao updatedAt). */
export function daysInStage(lead: Pick<PipelineLead, 'stageEnteredAt' | 'updatedAt'>, now: number = Date.now()): number {
  const since = new Date(lead.stageEnteredAt ?? lead.updatedAt).getTime();
  if (Number.isNaN(since)) return 0;
  return Math.max(0, Math.floor((now - since) / DAY_MS));
}

/** Esfriando: etapa aberta com mais de rotDays sem contato. */
export function isRotting(lead: PipelineLead, stage: PipelineStage | undefined, now: number = Date.now()): boolean {
  if (!stage || stage.type !== 'OPEN' || stage.rotDays === null || stage.rotDays <= 0) return false;
  const reference = lead.lastContactAt ?? lead.stageEnteredAt ?? lead.createdAt;
  const time = new Date(reference).getTime();
  if (Number.isNaN(time)) return false;
  return now - time > stage.rotDays * DAY_MS;
}

/** Iniciais para avatar: primeira letra das duas primeiras palavras. */
export function initials(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0].charAt(0);
  const second = words.length > 1 ? words[1].charAt(0) : '';
  return (first + second).toUpperCase();
}

const compactBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Valor monetario compacto em pt-BR (ex.: R$ 4,8 mil). */
export const formatCompactBRL = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : compactBRL.format(value);
