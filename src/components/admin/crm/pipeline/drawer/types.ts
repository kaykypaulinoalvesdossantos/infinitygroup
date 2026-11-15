import type { QueryClient } from '@tanstack/react-query';
import type { CrmAppointment, CrmLead, CrmLeadActivity, CrmLeadContact, CrmLeadDetail, TeamUser } from '@/services/crm-leads';
import type { PipelineLead } from '@/services/crm-pipeline';
import { pipelineKeys } from '../queryKeys';
import type { AutosaveApi } from './useAutosave';

/** Lead aberto na gaveta: lead do pipeline mais historico de atividades e contatos (GET /crm-leads/:id). */
export type DrawerLead = PipelineLead & { activities: CrmLeadActivity[]; contacts: CrmLeadContact[] };

export type DrawerTab = 'overview' | 'activity' | 'agenda' | 'contacts' | 'whatsapp' | 'data';

export const appointmentsKey = (leadId: number) => ['pipeline', 'lead', leadId, 'appointments'] as const;

/** Completa os campos do detalhe caso a resposta venha parcial (ex.: depois de um movimento de etapa). */
export function normalizeDrawerLead(raw: unknown): DrawerLead {
  const data = raw as Partial<DrawerLead>;
  return {
    ...(data as DrawerLead),
    tags: data.tags ?? [],
    activities: data.activities ?? [],
    contacts: data.contacts ?? [],
    productInterests: data.productInterests ?? [],
    effectiveProbability: data.effectiveProbability ?? data.probability ?? 0,
  };
}

export const toCrmLead = (lead: PipelineLead): CrmLead => lead as unknown as CrmLead;

/** Detalhe de producao (CrmLeadDetail) para os dialogos de e-mail, agenda e WhatsApp. */
export const toCrmLeadDetail = (lead: DrawerLead): CrmLeadDetail => lead as unknown as CrmLeadDetail;

/** Consentimento de WhatsApp vigente (opt-in posterior ao opt-out). Mesma regra de LeadDetailDialog. */
export function isWhatsAppConsented(lead: Pick<CrmLead, 'whatsappOptInAt' | 'whatsappOptOutAt'>): boolean {
  return Boolean(
    lead.whatsappOptInAt &&
      (!lead.whatsappOptOutAt || new Date(lead.whatsappOptInAt) > new Date(lead.whatsappOptOutAt)),
  );
}

/** Insere uma atividade no topo do historico do lead, sem recarregar. */
export function prependActivity(queryClient: QueryClient, leadId: number, activity: CrmLeadActivity) {
  queryClient.setQueryData<DrawerLead>(pipelineKeys.lead(leadId), (old) =>
    old ? { ...old, activities: [activity, ...old.activities.filter((item) => item.id !== activity.id)] } : old,
  );
}

/** Recarrega o lead aberto (detalhe, agendas) e as colunas/indicadores do board. */
export async function refreshLeadQueries(queryClient: QueryClient, leadId: number): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: pipelineKeys.lead(leadId) });
  void queryClient.invalidateQueries({ queryKey: pipelineKeys.columns() });
  void queryClient.invalidateQueries({ queryKey: ['pipeline', 'summary'] });
  void queryClient.invalidateQueries({ queryKey: ['pipeline', 'list'] });
}

export interface DrawerTabProps {
  lead: DrawerLead;
  autosave: AutosaveApi;
  appointments: CrmAppointment[];
  isSupervisor: boolean;
  owners: TeamUser[];
  onEditAppointment: (appointment?: CrmAppointment) => void;
  onOpenWhatsApp: () => void;
}
