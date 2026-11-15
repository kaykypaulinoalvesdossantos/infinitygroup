'use client';

import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  pipelineApi,
  PipelineApiError,
  type BoardColumnPage,
  type GeneralFunnel,
  type PipelineLead,
  type PipelineStage,
} from '@/services/crm-pipeline';
import { pipelineKeys } from '../queryKeys';
import { missingRequiredFields, type RequiredFieldValues } from './requiredFields';
import { requestRequiredFields } from './requiredFieldsStore';

export interface MoveLeadVariables {
  lead: PipelineLead;
  /** Etapa de origem (stageId). */
  fromId: number;
  /** Etapa de destino (stageId). */
  toId: number;
  /** Indice de destino na coluna DEPOIS de remover o lead dela (como o @hello-pangea/dnd). */
  toIndex: number;
  /** Lead que fica acima / abaixo na coluna destino (o servidor calcula a boardPosition). */
  beforeId?: number;
  afterId?: number;
  /** Valor do negocio (amount no contrato). */
  value?: number | null;
  expectedCloseAt?: string | null;
  ownerId?: number | null;
  lostReasonId?: number;
  lostNote?: string;
}

type ColumnData = InfiniteData<BoardColumnPage, string | null>;

interface MoveContext {
  snapshots: Array<[QueryKey, ColumnData | undefined]>;
}

/*
 * Sinais de movimento para animacoes sem contexto: falha com rollback (cartao treme),
 * destino do ultimo soltar (coluna pulsa) e saidas para Perdido (cartao faz fade + scale).
 */
interface MoveSignals {
  failed: { leadId: number; seq: number } | null;
  dropped: { stageId: number; seq: number } | null;
  leaving: Set<number>;
}

const signals: MoveSignals = { failed: null, dropped: null, leaving: new Set() };
const signalListeners = new Set<() => void>();
let signalVersion = 0;
let signalSeq = 0;

const emitSignal = () => {
  signalVersion += 1;
  signalListeners.forEach((listener) => listener());
};

const subscribeSignals = (listener: () => void) => {
  signalListeners.add(listener);
  return () => {
    signalListeners.delete(listener);
  };
};

const getSignalVersion = () => signalVersion;

/** Ultima falha de movimento (rollback). Muda a cada falha; o cartao treme quando o seu id aparece. */
export function useLastFailedMove() {
  useSyncExternalStore(subscribeSignals, getSignalVersion, getSignalVersion);
  return signals.failed;
}

/** Ultimo destino de soltar: a coluna pulsa quando o seq muda. */
export function useLastDroppedStage() {
  useSyncExternalStore(subscribeSignals, getSignalVersion, getSignalVersion);
  return signals.dropped;
}

/** Verdadeiro enquanto o lead esta saindo para Perdido (lido na hora da saida pelo cartao). */
export const isLeavingToLost = (leadId: number) => signals.leaving.has(leadId);

const stageIdOf = (key: QueryKey) => Number(key[2]);

/** Remove o lead de todas as paginas da coluna. */
function removeLead(data: ColumnData, leadId: number): ColumnData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, items: page.items.filter((item) => item.id !== leadId) })),
  };
}

/** Insere o item na posicao global `index`, percorrendo as paginas carregadas. */
function insertAt(data: ColumnData, item: PipelineLead, index: number): ColumnData {
  const pages = data.pages.map((page) => ({ ...page, items: [...page.items] }));
  let remaining = Math.max(0, index);
  for (let i = 0; i < pages.length; i += 1) {
    const length = pages[i].items.length;
    if (remaining <= length || i === pages.length - 1) {
      pages[i].items.splice(Math.min(remaining, length), 0, item);
      break;
    }
    remaining -= length;
  }
  return { ...data, pages };
}

/** Soma delta em count/value/weighted de todas as paginas (cada pagina carrega os totais da coluna). */
function withTotals(data: ColumnData, count: number, value: number, weighted: number): ColumnData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      count: Math.max(0, page.count + count),
      value: page.value + value,
      weighted: page.weighted + weighted,
    })),
  };
}

/**
 * Move leads entre etapas com atualizacao otimista (expectedVersion = funnelVersion do lead).
 * Antes de enviar confere requiredFields da etapa destino e, se faltar campo, abre o RequiredFieldsDialog.
 * 409 -> aviso + recarrega; 400 com `fields` -> reabre o dialogo com esses campos. Rollback em erro.
 */
export function useMoveLead() {
  const queryClient = useQueryClient();

  const mutation = useMutation<PipelineLead, PipelineApiError | Error, MoveLeadVariables, MoveContext>({
    mutationFn: ({ lead, toId, beforeId, afterId, value, expectedCloseAt, ownerId, lostReasonId, lostNote }) =>
      pipelineApi.moveStage(lead.id, {
        expectedVersion: lead.funnelVersion ?? 1,
        stageId: toId,
        beforeId,
        afterId,
        amount: value,
        expectedCloseAt,
        ownerId,
        lostReasonId,
        lostNote,
      }),

    onMutate: async (vars) => {
      const { lead, fromId, toId, toIndex, value, lostReasonId } = vars;
      await queryClient.cancelQueries({ queryKey: pipelineKeys.columns() });

      const snapshots = queryClient.getQueriesData<ColumnData>({ queryKey: pipelineKeys.columns() });
      const funnel = queryClient.getQueryData<GeneralFunnel>(pipelineKeys.funnel());
      const destination: PipelineStage | undefined = funnel?.stages.find((stage) => stage.id === toId);
      const destinationKind = destination?.type ?? 'OPEN';
      const destinationProbability = destination?.probability ?? lead.effectiveProbability;

      if (destinationKind === 'LOST' && fromId !== toId) {
        signals.leaving.add(lead.id);
        setTimeout(() => signals.leaving.delete(lead.id), 500);
      }
      signalSeq += 1;
      signals.dropped = { stageId: toId, seq: signalSeq };
      emitSignal();

      const now = new Date().toISOString();
      const leadValue = lead.value ?? 0;
      const newValue = value !== undefined ? value : lead.value;
      const moved: PipelineLead = {
        ...lead,
        funnelStage: destination
          ? {
              id: destination.id,
              name: destination.name,
              color: destination.color,
              position: destination.position,
              isInitial: destination.isInitial,
              requiredFields: destination.requiredFields,
              type: destination.type,
            }
          : lead.funnelStage,
        funnelVersion: (lead.funnelVersion ?? 1) + 1,
        value: newValue ?? null,
        stageEnteredAt: fromId !== toId ? now : lead.stageEnteredAt,
        probability: null,
        effectiveProbability: destinationProbability,
        wonAt: destinationKind === 'WON' ? now : null,
        lostAt: destinationKind === 'LOST' ? now : null,
        lostReasonId: destinationKind === 'LOST' ? (lostReasonId ?? lead.lostReasonId) : null,
        updatedAt: now,
      };

      snapshots.forEach(([key, data]) => {
        if (!data) return;
        const stageId = stageIdOf(key);
        const isSource = stageId === fromId && fromId !== toId;
        const isTarget = stageId === toId && fromId !== toId;
        const isReorder = stageId === toId && fromId === toId;
        if (!isSource && !isTarget && !isReorder) return;

        let next = removeLead(data, lead.id);
        if (isSource) {
          next = withTotals(next, -1, -leadValue, -(leadValue * lead.effectiveProbability) / 100);
        }
        if (isTarget || isReorder) {
          next = insertAt(next, moved, toIndex);
        }
        if (isTarget) {
          const movedValue = newValue ?? 0;
          next = withTotals(next, 1, movedValue, (movedValue * destinationProbability) / 100);
        }
        queryClient.setQueryData<ColumnData>(key, next);
      });

      return { snapshots };
    },

    onError: (error, vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      signalSeq += 1;
      signals.leaving.delete(vars.lead.id);
      signals.failed = { leadId: vars.lead.id, seq: signalSeq };
      emitSignal();

      if (error instanceof PipelineApiError && error.status === 409) {
        toast.error('Este lead foi alterado por outra pessoa. Recarregamos os dados.');
        queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
        return;
      }
      if (error instanceof PipelineApiError && error.status === 400 && error.fields.length > 0) {
        requestRequiredFields({
          lead: vars.lead,
          fields: error.fields,
          stageName: 'a etapa escolhida',
          onConfirm: (values) => mutation.mutate({ ...vars, ...toVariableValues(values) }),
        });
        return;
      }
      toast.error(error.message || 'Não foi possível mover o lead.', {
        action: {
          label: 'Tentar de novo',
          onClick: () => mutation.mutate(vars),
        },
      });
    },

    onSuccess: (lead) => {
      queryClient.setQueryData(pipelineKeys.lead(lead.id), lead);
    },

    onSettled: (_data, _error, vars) => {
      const keys = [vars.fromId, vars.toId];
      queryClient.invalidateQueries({ queryKey: ['pipeline', 'summary'] });
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.columns(),
        predicate: (q) => keys.includes(stageIdOf(q.queryKey)),
      });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lead(vars.lead.id) });
      queryClient.invalidateQueries({ queryKey: ['pipeline', 'list'] });
    },
  });

  /**
   * Move com checagem de requiredFields da etapa destino. Se faltar algo, abre o diálogo
   * (o movimento so e enviado depois que o usuario preencher).
   */
  const move = (vars: MoveLeadVariables) => {
    const funnel = queryClient.getQueryData<GeneralFunnel>(pipelineKeys.funnel());
    const destination = funnel?.stages.find((stage) => stage.id === vars.toId);
    const values: RequiredFieldValues = toVariableValues(vars);
    const missing = missingRequiredFields(vars.lead, destination?.requiredFields ?? [], values);
    if (missing.length > 0 && vars.toId !== vars.fromId) {
      requestRequiredFields({
        lead: vars.lead,
        fields: missing,
        stageName: destination?.name ?? 'a etapa escolhida',
        onConfirm: (filled) => mutation.mutate({ ...vars, ...toVariableValues(filled) }),
      });
      return;
    }
    mutation.mutate(vars);
  };

  /** Desfaz um movimento: manda o lead de volta para `previousId` (topo da coluna). */
  const undoMove = (lead: PipelineLead, previousId: number) =>
    mutation.mutate({ lead, fromId: lead.funnelStage?.id ?? previousId, toId: previousId, toIndex: 0 });

  return { ...mutation, move, undoMove };
}

/** Converte valores do dialogo (amount) nas variaveis do movimento (value). */
function toVariableValues(values: RequiredFieldValues): Partial<MoveLeadVariables> {
  const out: Partial<MoveLeadVariables> = {};
  if (values.amount !== undefined) out.value = values.amount;
  if (values.expectedCloseAt !== undefined) out.expectedCloseAt = values.expectedCloseAt;
  if (values.ownerId !== undefined) out.ownerId = values.ownerId;
  if (values.lostReasonId !== undefined) out.lostReasonId = values.lostReasonId;
  if (values.lostNote !== undefined) out.lostNote = values.lostNote;
  return out;
}
