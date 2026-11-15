'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pipelineApi, PipelineApiError, type LeadPatch } from '@/services/crm-pipeline';
import { errorMessage, isValidEmail } from '@/components/admin/crm/format';
import { pipelineKeys } from '../queryKeys';
import { refreshLeadQueries, type DrawerLead } from './types';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutosaveApi {
  status: AutosaveStatus;
  error: string | null;
  /** Agenda o patch com debounce. Retorna a mensagem de validacao ou null. */
  save: (patch: LeadPatch) => string | null;
  /** Envia o patch agora. Retorna true se salvou. */
  saveNow: (patch: LeadPatch) => Promise<boolean>;
  /** Campo com alteracao ainda nao enviada. */
  isPending: (field: string) => boolean;
  /** Envia imediatamente o que estiver pendente (sem esperar). */
  flush: () => void;
  /** Envia o pendente e espera todas as gravacoes em curso. Usar antes de mover a etapa. */
  flushAsync: () => Promise<void>;
}

const DEBOUNCE_MS = 600;
const SAVED_VISIBLE_MS = 1800;
const CONFLICT_MESSAGE = 'Este lead foi alterado por outra pessoa. Recarregamos os dados.';

/** Mesmas regras do validateForm de lead-dialogs. Retorna a mensagem ou null. */
export function validateLeadPatch(patch: LeadPatch): string | null {
  if ('name' in patch && !patch.name?.trim()) return 'Informe o nome do lead.';
  if ('email' in patch && patch.email && !isValidEmail(patch.email.trim())) return 'Informe um e-mail válido.';
  if ('value' in patch && patch.value !== null && patch.value !== undefined && !Number.isFinite(patch.value)) {
    return 'Valor inválido.';
  }
  if ('probability' in patch && patch.probability !== null && patch.probability !== undefined) {
    const p = patch.probability;
    if (!Number.isFinite(p) || p < 0 || p > 100) return 'A probabilidade deve estar entre 0 e 100.';
  }
  return null;
}

/**
 * Grava um patch do drawer. expectedCloseAt nao e aceito pelo PATCH /crm-leads: vai pelo PATCH de etapa,
 * com a etapa atual e o expectedVersion lido da cache. O resto vai pelo PATCH do lead.
 * Cada resposta atualiza a cache (inclusive funnelVersion), para o proximo movimento nao dar 409.
 */
async function writeLead(queryClient: QueryClient, leadId: number, patch: LeadPatch): Promise<void> {
  const applyServer = (updated: Partial<DrawerLead>) =>
    queryClient.setQueryData<DrawerLead>(pipelineKeys.lead(leadId), (old) => (old ? { ...old, ...updated } : old));

  if ('expectedCloseAt' in patch) {
    const current = queryClient.getQueryData<DrawerLead>(pipelineKeys.lead(leadId));
    if (!current?.funnelStage) throw new Error('Não foi possível salvar a previsão: etapa do lead indisponível.');
    applyServer(
      await pipelineApi.moveStage(leadId, {
        expectedVersion: current.funnelVersion ?? 1,
        stageId: current.funnelStage.id,
        expectedCloseAt: patch.expectedCloseAt ?? null,
      }),
    );
  }

  const { expectedCloseAt: _funnelOnly, ...leadPatch } = patch;
  if (Object.keys(leadPatch).length > 0) {
    applyServer(await pipelineApi.update(leadId, leadPatch));
  }
}

/**
 * Autosave de um lead: agrupa alteracoes em 600ms, envia so os campos mudados e serializa as gravacoes
 * (uma por vez), para que um movimento de etapa nunca leia uma versao antiga do lead.
 */
export function useAutosave(leadId: number): AutosaveApi {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef<LeadPatch>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  /** Fila: cada gravacao espera a anterior terminar. */
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = queueRef.current.then(task);
    queueRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }, []);

  const persist = useCallback(
    (patch: LeadPatch): Promise<boolean> => {
      const seq = ++seqRef.current;
      if (idleRef.current) clearTimeout(idleRef.current);
      setStatus('saving');
      return enqueue(async () => {
        try {
          await writeLead(queryClient, leadId, patch);
          void queryClient.invalidateQueries({ queryKey: pipelineKeys.columns() });
          void queryClient.invalidateQueries({ queryKey: ['pipeline', 'summary'] });
          void queryClient.invalidateQueries({ queryKey: ['pipeline', 'list'] });
          if (seq === seqRef.current) {
            setError(null);
            setStatus('saved');
            idleRef.current = setTimeout(
              () => setStatus((current) => (current === 'saved' ? 'idle' : current)),
              SAVED_VISIBLE_MS,
            );
          }
          return true;
        } catch (err) {
          if (err instanceof PipelineApiError && err.status === 409) {
            if (seq === seqRef.current) {
              setError(CONFLICT_MESSAGE);
              setStatus('error');
            }
            toast.error(CONFLICT_MESSAGE);
            void refreshLeadQueries(queryClient, leadId);
            return false;
          }
          const message = errorMessage(err, 'Não foi possível salvar. Confira a conexão e tente de novo.');
          if (seq === seqRef.current) {
            setError(message);
            setStatus('error');
          }
          toast.error(message, {
            action: {
              label: 'Tentar de novo',
              onClick: () => {
                void persist(patch);
              },
            },
          });
          return false;
        }
      });
    },
    [enqueue, leadId, queryClient],
  );

  /** Tira o pendente do buffer e cancela o debounce. */
  const takePending = useCallback((): LeadPatch | null => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const patch = pendingRef.current;
    if (Object.keys(patch).length === 0) return null;
    pendingRef.current = {};
    return patch;
  }, []);

  const flush = useCallback(() => {
    const patch = takePending();
    if (patch) void persist(patch);
  }, [persist, takePending]);

  const flushAsync = useCallback(async () => {
    const patch = takePending();
    if (patch) await persist(patch);
    await queueRef.current;
  }, [persist, takePending]);

  const save = useCallback(
    (patch: LeadPatch): string | null => {
      const validation = validateLeadPatch(patch);
      if (validation) return validation;
      pendingRef.current = { ...pendingRef.current, ...patch };
      setStatus('saving');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, DEBOUNCE_MS);
      return null;
    },
    [flush],
  );

  const saveNow = useCallback(
    async (patch: LeadPatch): Promise<boolean> => {
      const validation = validateLeadPatch(patch);
      if (validation) {
        toast.error(validation);
        return false;
      }
      return persist(patch);
    },
    [persist],
  );

  const isPending = useCallback((field: string) => Object.prototype.hasOwnProperty.call(pendingRef.current, field), []);

  // Ao trocar de lead (ou fechar a gaveta) envia o que ficou pendente
  useEffect(() => {
    return () => {
      flush();
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [flush]);

  return useMemo(
    () => ({ status, error, save, saveNow, isPending, flush, flushAsync }),
    [status, error, save, saveNow, isPending, flush, flushAsync],
  );
}
