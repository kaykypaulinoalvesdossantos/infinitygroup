'use client';

import { useCallCopilotLead } from '@/components/sales-copilot/hooks/useCallCopilotLead';
import { Skeleton } from '@/components/ui/skeleton';
import type { PhoneCall } from '@/services/telephony';
import { SalesCopilotPanel } from './SalesCopilotPanel';
import type { CopilotVariant } from './types';

/** Copiloto da ligacao em andamento: carrega a ficha do lead (com cache) e monta o painel. */
export function CallCopilot({ call, variant }: { call: PhoneCall; variant: Exclude<CopilotVariant, 'drawer'> }) {
  const { lead, loading } = useCallCopilotLead(call);

  if (loading || !lead) {
    return (
      <div className="space-y-3" aria-busy="true">
        <p role="status" className="sr-only">
          Carregando ficha do lead…
        </p>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  return <SalesCopilotPanel key={lead.id} lead={lead} variant={variant} />;
}
