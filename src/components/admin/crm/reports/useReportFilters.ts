'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Filtros dos relatorios. Estado na URL: ?from=YYYY-MM-DD&to=YYYY-MM-DD&owner=ID */

export type ReportPreset = '30' | '90' | '180' | 'year' | 'custom';

export const PERIOD_OPTIONS: { value: ReportPreset; label: string }[] = [
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '180', label: '180 dias' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
];

export interface ReportRange {
  from: string;
  to: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const isIsoDate = (value: string | null): value is string =>
  !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());

const WINDOW_DAYS: Record<'30' | '90' | '180', number> = { '30': 30, '90': 90, '180': 180 };

/** Intervalo de um atalho. Janelas de N dias incluem hoje. */
export function presetRange(preset: Exclude<ReportPreset, 'custom'>, today: Date = new Date()): ReportRange {
  if (preset === 'year') return { from: `${today.getFullYear()}-01-01`, to: toIsoDate(today) };
  const from = new Date(today);
  from.setDate(from.getDate() - (WINDOW_DAYS[preset] - 1));
  return { from: toIsoDate(from), to: toIsoDate(today) };
}

export interface ReportFilters {
  range: ReportRange;
  preset: ReportPreset;
  ownerId: number | undefined;
  setPreset: (preset: Exclude<ReportPreset, 'custom'>) => void;
  setRange: (from: string, to: string) => void;
  setOwner: (ownerId: number | undefined) => void;
}

export function useReportFilters(): ReportFilters {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const ownerParam = searchParams.get('owner');

  const today = new Date();
  const fallback = presetRange('90', today);
  const from = isIsoDate(fromParam) ? fromParam : fallback.from;
  const to = isIsoDate(toParam) ? toParam : fallback.to;

  const matched = (['30', '90', '180', 'year'] as const).find((p) => {
    const r = presetRange(p, today);
    return r.from === from && r.to === to;
  });
  const preset: ReportPreset = !fromParam && !toParam ? '90' : (matched ?? 'custom');
  const ownerId = ownerParam && /^\d+$/.test(ownerParam) ? Number(ownerParam) : undefined;

  const replaceParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    range: { from, to },
    preset,
    ownerId,
    setPreset: (p) => {
      const r = presetRange(p);
      replaceParams({ from: r.from, to: r.to });
    },
    setRange: (f, t) => replaceParams({ from: f, to: t }),
    setOwner: (id) => replaceParams({ owner: id === undefined ? undefined : String(id) }),
  };
}
