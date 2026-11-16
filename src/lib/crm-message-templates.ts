import type {
  CrmAppointment,
  CrmLead,
  CrmLeadContact,
  CrmMessageTemplate,
} from '@/services/crm-leads';

export type WhatsAppTemplateContext = {
  lead: Pick<CrmLead, 'name' | 'company' | 'email' | 'phone' | 'phone2' | 'city' | 'segment' | 'productInterests'>;
  contact?: Pick<CrmLeadContact, 'name' | 'email' | 'phone' | 'phone2'> | null;
  appointment?: Pick<CrmAppointment, 'startsAt' | 'meetUrl' | 'productInterest'> | null;
  salesperson?: string | null;
  recipientPhone?: string | null;
};

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR');
}

export function getWhatsAppTemplateValues(
  template: CrmMessageTemplate,
  context: WhatsAppTemplateContext,
): Record<string, string> {
  const productInterest = template.productInterest
    ?? context.appointment?.productInterest
    ?? (context.lead.productInterests.length === 1 ? context.lead.productInterests[0] : null);
  const product = productInterest === 'TELECOM'
    ? 'Telecom'
    : productInterest === 'SEGUROS'
      ? 'Seguros · Insuri'
      : '';

  return {
    nome: context.contact?.name ?? context.lead.name,
    empresa: context.lead.company ?? context.lead.name,
    vendedor: context.salesperson?.trim() ?? '',
    telefone: context.recipientPhone ?? context.contact?.phone ?? context.contact?.phone2 ?? context.lead.phone ?? context.lead.phone2 ?? '',
    email: context.contact?.email ?? context.lead.email ?? '',
    cidade: context.lead.city ?? '',
    segmento: context.lead.segment ?? '',
    produto: product,
    data: formatDate(context.appointment?.startsAt),
    link: context.appointment?.meetUrl ?? '',
  };
}

export function getTemplateVariableKeys(body: string) {
  return [...new Set([...body.matchAll(VARIABLE_PATTERN)].map((match) => match[1].toLowerCase()))];
}

export function renderMessageTemplate(body: string, values: Record<string, string>) {
  return body.replace(VARIABLE_PATTERN, (_match, key: string) => values[key.toLowerCase()] ?? '');
}

export function templateVariableLabel(key: string) {
  const labels: Record<string, string> = {
    nome: 'Nome do contato',
    empresa: 'Empresa',
    vendedor: 'Nome do vendedor',
    telefone: 'Telefone',
    email: 'E-mail',
    cidade: 'Cidade',
    segmento: 'Segmento',
    produto: 'Produto',
    data: 'Data e horário',
    link: 'Link da reunião ou material',
  };
  return labels[key] ?? key.replace(/[._-]+/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

export function getMissingTemplateVariables(body: string, values: Record<string, string>) {
  return getTemplateVariableKeys(body).filter((key) => !values[key]?.trim());
}
