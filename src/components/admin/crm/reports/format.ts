import { formatCurrencyBRL } from '@/components/admin/crm/format';
import { formatCompactBRL } from '@/components/admin/crm/pipeline/tokens';

/** Formatadores e utilitarios dos relatorios do funil (pt-BR). */

const oneDecimal = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR');
export const fmtNum1 = (n: number) => oneDecimal(n);
export const fmtPct = (n: number) => `${oneDecimal(n)}%`;
export const fmtDays = (n: number) => `${oneDecimal(n)} dias`;
export const fmtBRL = (n?: number | null) => formatCurrencyBRL(n);
export const fmtCompact = (n: number) => formatCompactBRL(n);

/** Percentual de part em total (0 quando total e zero). */
export const pctOf = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

export const clampPct = (n: number) => Math.min(100, Math.max(0, n));

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY'. */
export function fmtIsoBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** 'YYYY-MM' -> 'jan/26'. */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const short = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${short}/${String(y).slice(-2)}`;
}
