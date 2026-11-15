import type { PipelineLead } from '@/services/crm-pipeline';

/** Campos de requiredFields da etapa (producao). */
export const REQUIRED_FIELD_KEYS = ['title', 'amount', 'expectedCloseAt', 'lostReason', 'ownerId'] as const;
export type RequiredFieldKey = (typeof REQUIRED_FIELD_KEYS)[number];

/** Valores que o usuario informa no mover (preenchem o que falta). */
export interface RequiredFieldValues {
  amount?: number | null;
  expectedCloseAt?: string | null;
  ownerId?: number | null;
  lostReasonId?: number;
  lostNote?: string;
}

/**
 * Campos exigidos pela etapa destino que ainda faltam no lead (considerando os valores do movimento).
 * title = company || name; amount = value; lostReason = lostReasonId || lostNote || lostReason do lead.
 */
export function missingRequiredFields(lead: PipelineLead, requiredFields: string[], values: RequiredFieldValues = {}): string[] {
  const missing: string[] = [];
  requiredFields.forEach((field) => {
    switch (field) {
      case 'title':
        if (!(lead.company || lead.name || '').trim()) missing.push(field);
        break;
      case 'amount': {
        const amount = values.amount !== undefined ? values.amount : lead.value;
        if (amount === null || amount === undefined) missing.push(field);
        break;
      }
      case 'expectedCloseAt': {
        const date = values.expectedCloseAt !== undefined ? values.expectedCloseAt : lead.expectedCloseAt;
        if (!date) missing.push(field);
        break;
      }
      case 'lostReason':
        if (!(values.lostReasonId || (values.lostNote ?? '').trim() || lead.lostReason)) missing.push(field);
        break;
      case 'ownerId': {
        const ownerId = values.ownerId !== undefined ? values.ownerId : lead.ownerId;
        if (!ownerId) missing.push(field);
        break;
      }
      default:
        break;
    }
  });
  return missing;
}

export const REQUIRED_FIELD_LABEL: Record<string, string> = {
  title: 'Nome ou empresa',
  amount: 'Valor (R$)',
  expectedCloseAt: 'Previsão de fechamento',
  lostReason: 'Motivo da perda',
  ownerId: 'Responsável',
};
