import {
  formatMoney,
  formatNumber,
  type EvidenceLevel,
  type Facts,
  type LeadInfo,
  type DiagnosisData,
  type Temperature,
} from '@/components/sales-copilot/engine';
import type { CopilotLead } from './types';

export type FactKind = 'count' | 'money' | 'percent';

export interface FactField {
  key: keyof Facts;
  label: string;
  kind: FactKind;
  /** Nome curto usado na confirmacao ("Identificado: 15 vendedores"). */
  short: string;
}

/** Os 14 indicadores do diagnostico, na ordem do formulario. */
export const FACT_FIELDS: FactField[] = [
  { key: 'leads', label: 'Leads recebidos por mês', kind: 'count', short: 'leads' },
  { key: 'qualified', label: 'Leads qualificados', kind: 'count', short: 'leads qualificados' },
  { key: 'contacted', label: 'Leads contatados', kind: 'count', short: 'leads contatados' },
  { key: 'unattended', label: 'Contatos sem atendimento', kind: 'count', short: 'sem atendimento' },
  { key: 'pending', label: 'Follow-ups pendentes', kind: 'count', short: 'follow-ups pendentes' },
  { key: 'sales', label: 'Vendas por mês', kind: 'count', short: 'vendas' },
  { key: 'conversion', label: 'Conversão (%)', kind: 'percent', short: 'conversão' },
  { key: 'ticket', label: 'Ticket médio (R$)', kind: 'money', short: 'ticket médio' },
  { key: 'sellers', label: 'Vendedores', kind: 'count', short: 'vendedores' },
  { key: 'marketing', label: 'Leads de marketing por mês', kind: 'count', short: 'leads de marketing' },
  { key: 'proposals', label: 'Propostas enviadas por mês', kind: 'count', short: 'propostas enviadas' },
  { key: 'accepted', label: 'Propostas aceitas por mês', kind: 'count', short: 'propostas aceitas' },
  { key: 'target', label: 'Meta de vendas por mês', kind: 'count', short: 'meta de vendas' },
  { key: 'acquisitionCost', label: 'Custo de aquisição por lead (R$)', kind: 'money', short: 'custo de aquisição' },
];

export function formatFactValue(kind: FactKind, value: number | null | undefined): string {
  if (kind === 'money') return formatMoney(value);
  if (kind === 'percent') return value == null ? '—' : `${formatNumber(value, 2)}%`;
  return formatNumber(value);
}

/** Texto da confirmacao de respostas livres: "15 vendedores, 2.000 leads". Null quando nada foi identificado. */
export function describeFactsFound(found: Partial<Facts>): string | null {
  const parts: string[] = [];
  for (const field of FACT_FIELDS) {
    const value = found[field.key];
    if (value === undefined || value === null) continue;
    if (field.kind === 'money') parts.push(`${formatMoney(value)} de ${field.short}`);
    else if (field.kind === 'percent') parts.push(`${formatNumber(value, 2)}% de ${field.short}`);
    else parts.push(`${formatNumber(value)} ${field.short}`);
  }
  return parts.length > 0 ? parts.join(', ') : null;
}

export const LEVEL_DOT_CLASS: Record<EvidenceLevel, string> = {
  none: 'bg-slate-300',
  hypothesis: 'bg-sky-400',
  reported: 'bg-amber-500',
  confirmed: 'bg-red-500',
};

export const LEVEL_TONE: Record<EvidenceLevel, 'slate' | 'blue' | 'amber' | 'red'> = {
  none: 'slate',
  hypothesis: 'blue',
  reported: 'amber',
  confirmed: 'red',
};

export const TEMPERATURE_LABEL: Record<Temperature, string> = {
  COLD: 'Frio',
  WARM: 'Morno',
  HOT: 'Quente',
};

export const TEMPERATURE_TONE: Record<Temperature, 'blue' | 'amber' | 'red'> = {
  COLD: 'blue',
  WARM: 'amber',
  HOT: 'red',
};

export function toLeadInfo(lead: CopilotLead): LeadInfo {
  return {
    name: lead.name,
    company: lead.company ?? undefined,
    segment: lead.segment ?? undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    city: lead.city ?? undefined,
  };
}

const clockFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function formatClock(date: Date): string {
  return clockFormatter.format(date);
}

/** Atualiza cargo ou CRM usado sem mutar o estado (o engine nao expoe setter para o perfil). */
export function withProfileField(state: DiagnosisData, field: keyof DiagnosisData['profile'], value: string): DiagnosisData {
  return { ...state, profile: { ...state.profile, [field]: value } };
}

/** Rotulo da temperatura do lead ("Quente"); devolve o valor cru quando nao reconhecido. */
export function temperatureLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return (TEMPERATURE_LABEL as Record<string, string | undefined>)[value] ?? value;
}
