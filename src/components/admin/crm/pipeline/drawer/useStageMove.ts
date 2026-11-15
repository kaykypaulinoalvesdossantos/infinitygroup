'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMoveLead } from '../hooks/useMoveLead';
import { pipelineKeys } from '../queryKeys';
import type { AutosaveApi } from './useAutosave';
import type { DrawerLead } from './types';

/**
 * Move o lead para outra etapa aberta pelo fluxo de useMoveLead (expectedVersion + requiredFields).
 * Antes grava o que estiver pendente na gaveta e le o lead da cache, para usar a versao atual.
 * WON/LOST nao passam aqui: a gaveta pede o dialogo de ganho/perda ao board.
 */
export function useStageMove(lead: DrawerLead, autosave: AutosaveApi) {
  const queryClient = useQueryClient();
  const { move } = useMoveLead();

  return useCallback(
    async (toId: number) => {
      await autosave.flushAsync();
      const fresh = queryClient.getQueryData<DrawerLead>(pipelineKeys.lead(lead.id)) ?? lead;
      if (fresh.funnelStage?.id === toId) return;
      move({ lead: fresh, fromId: fresh.funnelStage?.id ?? 0, toId, toIndex: 0 });
    },
    [autosave, lead, move, queryClient],
  );
}
