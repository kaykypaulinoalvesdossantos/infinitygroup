'use client';

import { useEffect, useState, type ChangeEvent, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { LeadPatch } from '@/services/crm-pipeline';
import type { AutosaveApi, AutosaveStatus } from './useAutosave';

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ', className)}>
      {children}
    </h3>
  );
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>{title}</SectionTitle>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Bloco com brilho deslizante para estados de carregamento. Parado com reduced motion. */
export function ShimmerBlock({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-muted/70 ', className)}>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10"
        initial={{ x: '-100%' }}
        animate={reduced ? { x: '-100%' } : { x: '100%' }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const SAVE_LABEL: Record<AutosaveStatus, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo ✓',
  error: 'Erro ao salvar',
};

/** Indicador de autosave: "Salvando…" -> "Salvo ✓" com fade. */
export function SaveIndicator({ status }: { status: AutosaveStatus }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'text-xs font-medium transition-opacity duration-300',
        status === 'idle' ? 'opacity-0' : 'opacity-100',
        status === 'error'
          ? 'text-[hsl(var(--urgent))]'
          : status === 'saved'
            ? 'text-success-foreground '
            : 'text-muted-foreground ',
      )}
    >
      {SAVE_LABEL[status]}
    </span>
  );
}

/** Texto do rotulo sobre uma cor de etapa: branco so quando o contraste passa de 4.5:1. */
export function onStageTextClass(hex: string): string {
  const clean = hex.trim().replace(/^#/, '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 'text-white';
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance <= 0.183 ? 'text-white' : 'text-foreground';
}

export interface AutoTextProps {
  id: string;
  label: string;
  /** Chave do patch (ex.: 'name'). Usada para nao sobrescrever edicao pendente. */
  field: string;
  /** Valor vindo do servidor, ja formatado como texto. */
  serverText: string;
  autosave: AutosaveApi;
  toPatch: (text: string) => LeadPatch;
  type?: HTMLInputTypeAttribute;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email';
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  srOnlyLabel?: boolean;
  variant?: 'field' | 'inline';
  className?: string;
  inputClassName?: string;
}

/** Campo de texto com autosave. Mantem o rascunho local; sincroniza com o servidor quando nao ha edicao pendente. */
export function AutoText({
  id,
  label,
  field,
  serverText,
  autosave,
  toPatch,
  type = 'text',
  multiline = false,
  rows = 3,
  placeholder,
  maxLength,
  inputMode,
  prefix,
  suffix,
  min,
  max,
  srOnlyLabel = false,
  variant = 'field',
  className,
  inputClassName,
}: AutoTextProps) {
  const { save, flush, isPending } = autosave;
  const [draft, setDraft] = useState(serverText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending(field)) return;
    setDraft(serverText);
    setError(null);
  }, [serverText, field, isPending]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = event.target.value;
    setDraft(text);
    setError(save(toPatch(text)));
  };

  const errorId = `${id}-error`;
  const shared = {
    id,
    value: draft,
    placeholder,
    maxLength,
    onChange: handleChange,
    onBlur: () => flush(),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };
  const controlClass = cn(
    variant === 'inline' && 'h-auto border-transparent bg-transparent px-1 shadow-none hover:border-border ',
    error && 'border-[hsl(var(--urgent))]',
    prefix && 'pl-9',
    suffix && 'pr-9',
    inputClassName,
  );

  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <Label htmlFor={id} className={cn('text-xs font-medium text-muted-foreground ', srOnlyLabel && 'sr-only')}>
        {label}
      </Label>
      <div className="relative flex items-center">
        {prefix && (
          <span aria-hidden className="pointer-events-none absolute left-3 text-xs text-muted-foreground ">
            {prefix}
          </span>
        )}
        {multiline ? (
          <Textarea {...shared} rows={rows} className={cn('bg-transparent', controlClass)} />
        ) : (
          <Input {...shared} type={type} min={min} max={max} inputMode={inputMode} className={controlClass} />
        )}
        {suffix && (
          <span aria-hidden className="pointer-events-none absolute right-3 text-xs text-muted-foreground ">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[hsl(var(--urgent))]">
          {error}
        </p>
      )}
    </div>
  );
}

/** ISO -> valor de <input type="date"> em hora local. */
export function dateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Data (YYYY-MM-DD) -> ISO ao meio-dia local, para nao mudar de dia por fuso. */
export function isoFromDateInput(value: string): string | null {
  return value ? new Date(`${value}T12:00:00`).toISOString() : null;
}
