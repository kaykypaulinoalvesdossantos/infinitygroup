'use client';

import { useQueryClient } from '@tanstack/react-query';
import { SalesCopilotPanel } from '@/components/sales-copilot/ui/SalesCopilotPanel';
import type { DrawerLead } from '../types';
import { refreshLeadQueries } from '../types';

/** Aba "Diagnóstico" da gaveta do lead: copiloto de vendas em coluna unica. */
export function DiagnosisTab({ lead }: { lead: DrawerLead }) {
  const queryClient = useQueryClient();
  return (
    <SalesCopilotPanel
      lead={lead}
      variant="drawer"
      onLeadUpdated={() => void refreshLeadQueries(queryClient, lead.id)}
    />
  );
}
