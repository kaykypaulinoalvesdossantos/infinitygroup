'use client';

import { useEffect, useState } from 'react';
import { useSalesCopilot } from '@/components/sales-copilot/hooks/useSalesCopilot';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/atendimento/helpers';
import { getStoredUser } from '@/services/crm-leads';
import { CopilotWorkspace } from './CopilotWorkspace';
import type { CopilotLead, CopilotVariant } from './types';

export interface SalesCopilotPanelProps {
  lead: CopilotLead;
  variant: CopilotVariant;
  /** Chamado pela acao "Ir para a agenda" quando a ligacao leva a uma reuniao. */
  onRequestMeeting?: () => void;
  /** Chamado depois de aplicar a temperatura sugerida no lead. */
  onLeadUpdated?: () => void;
}

/** Nome do vendedor logado, lido no navegador (evita divergencia entre servidor e cliente). */
function useSellerName(): string | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    setName(getStoredUser()?.name?.trim() || null);
  }, []);
  return name;
}

function CopilotSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <p role="status" className="sr-only">
        Carregando copiloto…
      </p>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

/** Copiloto de vendas: roteiro guiado da ligacao, diagnostico em tempo real e indicadores. */
export function SalesCopilotPanel({ lead, variant, onRequestMeeting, onLeadUpdated }: SalesCopilotPanelProps) {
  const copilot = useSalesCopilot(lead.id);
  const seller = useSellerName();

  if (copilot.status === 'loading') return <CopilotSkeleton />;

  if (copilot.status === 'error' || !copilot.state || !copilot.script) {
    return (
      <ErrorState
        message={copilot.error ?? 'Não foi possível carregar o copiloto.'}
        onRetry={copilot.reload}
      />
    );
  }

  return (
    <CopilotWorkspace
      lead={lead}
      variant={variant}
      state={copilot.state}
      script={copilot.script}
      seller={seller}
      dispatch={copilot.dispatch}
      undo={copilot.undo}
      canUndo={copilot.canUndo}
      saveState={copilot.saveState}
      savedAt={copilot.savedAt}
      reload={copilot.reload}
      onRequestMeeting={onRequestMeeting}
      onLeadUpdated={onLeadUpdated}
    />
  );
}
