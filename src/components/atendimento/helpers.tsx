import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  CALL_STATUS_LABEL,
  DISPOSITION_OPTIONS,
  SESSION_STATE_LABEL,
  type Disposition,
  type DialerSessionState,
  type PhoneCallStatus,
  type TelephonyDevice,
} from '@/services/telephony';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate';

const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  slate: 'bg-slate-100 text-slate-700',
};

export function Pill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const CALL_TONE: Record<PhoneCallStatus, Tone> = {
  REQUESTED: 'blue',
  CLAIMED: 'blue',
  DIALING: 'blue',
  ACTIVE: 'green',
  HOLDING: 'amber',
  COMPLETED: 'green',
  NO_ANSWER: 'amber',
  FAILED: 'red',
  CANCELLED: 'slate',
  ENDED_UNKNOWN: 'amber',
};

export function CallStatusPill({ status }: { status: PhoneCallStatus }) {
  return <Pill tone={CALL_TONE[status]}>{CALL_STATUS_LABEL[status]}</Pill>;
}

const SESSION_TONE: Record<DialerSessionState, Tone> = {
  RUNNING: 'green',
  PAUSED: 'amber',
  STOPPED: 'slate',
  DONE: 'blue',
};

export function SessionStatePill({ state }: { state: DialerSessionState }) {
  return <Pill tone={SESSION_TONE[state]}>{SESSION_STATE_LABEL[state]}</Pill>;
}

export const DEVICE_MODE_LABEL: Record<'FULL' | 'LITE', string> = {
  FULL: 'Completo',
  LITE: 'Lite',
};

/** Celular pronto para receber uma ligacao: conectado, app pronto e sem ligacao em andamento. */
export function isDeviceReady(device: TelephonyDevice | null | undefined): boolean {
  return !!device && device.connected && device.ready && device.idle;
}

export function deviceStatus(device: TelephonyDevice | null | undefined): { label: string; tone: Tone } {
  if (!device) return { label: 'Sem celular', tone: 'slate' };
  if (device.revokedAt) return { label: 'Desconectado', tone: 'red' };
  if (!device.connected) return { label: 'Offline', tone: 'red' };
  if (!device.idle) return { label: 'Em ligação', tone: 'blue' };
  if (!device.ready) return { label: 'Conectado, não pronto', tone: 'amber' };
  return { label: 'Pronto', tone: 'green' };
}

export function DevicePill({ device }: { device: TelephonyDevice | null | undefined }) {
  const info = deviceStatus(device);
  return <Pill tone={info.tone}>{info.label}</Pill>;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '-' : dateTimeFormatter.format(d);
}

export function formatDay(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '-' : dayFormatter.format(d);
}

export function formatTime(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '-' : timeFormatter.format(d);
}

/** Segundos decorridos desde uma data ISO, relativos ao instante `now` (ms). */
export function secondsSince(iso: string | null | undefined, now: number): number {
  if (!iso) return 0;
  const start = Date.parse(iso);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / 1000));
}

/** Texto relativo curto em pt-BR ("agora", "há 3 min", "há 2 h") com fallback para a data. */
export function formatRelative(iso: string | null | undefined, now: number): string {
  if (!iso) return 'Nunca';
  const seconds = secondsSince(iso, now);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return formatDateTime(iso);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) digits = digits.slice(2);
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return phone;
}

export function dispositionLabel(value: Disposition | string | null | undefined): string {
  if (!value) return '-';
  return DISPOSITION_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Inicio do dia local (N dias atras) em ISO. */
export function startOfDayIso(daysAgo = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/** Converte yyyy-mm-dd (input date) em ISO no inicio ou no fim do dia local. */
export function dateInputToIso(value: string, end = false): string {
  const d = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}`);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

/** Relogio que atualiza a cada `intervalMs` enquanto `active`. Usado para cronometros ao vivo. */
export function useNow(active = true, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

const TILE_TONE: Record<Tone, string> = {
  green: 'text-emerald-600 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  red: 'text-red-600 bg-red-50',
  blue: 'text-[#0076FF] bg-blue-50',
  slate: 'text-slate-600 bg-slate-100',
};

export function StatTile({
  icon,
  label,
  value,
  hint,
  tone = 'blue',
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card className="border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#64748B] leading-tight break-words">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1A1A] tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
          </div>
          {icon && <div className={cn('rounded-xl p-2.5 shrink-0', TILE_TONE[tone])}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-[#1A1A1A] tracking-tight">
          {icon}
          {title}
        </h1>
        {description && <p className="text-[#64748B] text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-white', className)}>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{title}</h2>
            {description && <p className="text-sm text-[#64748B]">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
      <Inbox className="h-8 w-8 text-slate-300" aria-hidden />
      <p className="font-medium text-[#1A1A1A]">{title}</p>
      {description && <p className="max-w-md text-sm text-[#64748B]">{description}</p>}
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
    >
      <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
    >
      <div className="h-2 rounded-full bg-[#0076FF] transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
