'use client';

import { useEffect, useState } from 'react';
import type { PhoneCall } from '@/services/telephony';
import { crmLeadsApi, type CrmLeadDetail } from '@/services/crm-leads';
import type { CopilotLead } from '@/components/sales-copilot/ui/types';

/** Cache em memoria da ficha do lead: evita refazer a busca quando a ligacao troca de lead. */
const leadCache = new Map<number, CopilotLead>();

function toCopilotLead(detail: CrmLeadDetail): CopilotLead {
  // A ficha do CRM pode trazer a temperatura do pipeline; o tipo de detalhe nao a declara.
  const extra = detail as CrmLeadDetail & { temperature?: string | null };
  return {
    id: detail.id,
    name: detail.name,
    company: detail.company,
    segment: detail.segment,
    email: detail.email,
    phone: detail.phone,
    city: detail.city,
    temperature: extra.temperature ?? null,
  };
}

export interface CallCopilotLeadState {
  lead: CopilotLead | null;
  loading: boolean;
}

/**
 * Ficha do lead da ligacao em andamento. Enquanto carrega, `loading` e true; se a busca falhar,
 * usa os dados minimos da propria ligacao.
 */
export function useCallCopilotLead(call: PhoneCall): CallCopilotLeadState {
  const leadId = call.leadId;
  const fallback: CopilotLead = { id: leadId ?? 0, name: call.leadName ?? 'Contato', phone: call.phone };
  const cached = leadId !== null ? leadCache.get(leadId) ?? null : null;

  const [fetched, setFetched] = useState<{ leadId: number; lead: CopilotLead | null } | null>(null);

  useEffect(() => {
    if (leadId === null || leadCache.has(leadId)) return;
    let active = true;
    crmLeadsApi
      .get(leadId)
      .then((detail) => {
        const lead = toCopilotLead(detail);
        leadCache.set(leadId, lead);
        if (active) setFetched({ leadId, lead });
      })
      .catch(() => {
        if (active) setFetched({ leadId, lead: null });
      });
    return () => {
      active = false;
    };
  }, [leadId]);

  if (leadId === null) return { lead: fallback, loading: false };
  if (cached) return { lead: cached, loading: false };
  if (fetched && fetched.leadId === leadId) return { lead: fetched.lead ?? fallback, loading: false };
  return { lead: null, loading: true };
}
