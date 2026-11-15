'use client';

import { useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  pipelineApi,
  type BoardColumnPage,
  type BulkActionInput,
  type LeadFilters,
  type PipelineLeadPage,
  type PipelineStage,
} from '@/services/crm-pipeline';
import { errorMessage } from '@/components/admin/crm/format';
import { pipelineKeys } from '../queryKeys';
import type { useBulkSelection } from '../hooks/useBulkSelection';

type Selection = ReturnType<typeof useBulkSelection>;
type Payload = BulkActionInput['payload'];
export type BulkResult = { updated: number };

type QueryClientLike = ReturnType<typeof useQueryClient>;

/** Status atual dos ids, lido do cache (colunas carregadas e lista). Ids fora do cache ficam sem status. */
function cachedStatuses(queryClient: QueryClientLike, ids: number[]): Map<number, number> {
  const wanted = new Set(ids);
  const found = new Map<number, number>();
  const columns = queryClient.getQueriesData<InfiniteData<BoardColumnPage>>({ queryKey: pipelineKeys.columns() });
  for (const [, data] of columns) {
    data?.pages.forEach((page) =>
      page.items.forEach((item) => {
        if (wanted.has(item.id)) found.set(item.id, item.funnelStage?.id ?? 0);
      }),
    );
  }
  const lists = queryClient.getQueriesData<PipelineLeadPage>({ queryKey: ['pipeline', 'list'] });
  for (const [, data] of lists) {
    data?.items.forEach((item) => {
      if (wanted.has(item.id)) found.set(item.id, item.funnelStage?.id ?? 0);
    });
  }
  return found;
}

/**
 * Acoes em massa sobre a selecao (ids ou escopo de coluna).
 * Cada acao invalida o pipeline inteiro e limpa a selecao ao concluir.
 */
export function useBulkActions(selection: Selection, filters: LeadFilters, stages: PipelineStage[]) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  /** Alvo do POST. Escopo de coluna ignora o resultado, pois o board so mostra etapas abertas. */
  const target = () => selection.toBulkTarget(selection.scope ? { ...filters, outcome: undefined } : filters);

  const runBulk = async (action: BulkActionInput['action'], payload: Payload): Promise<BulkResult | null> => {
    setBusy(true);
    try {
      const result = await pipelineApi.bulk({ action, ...target(), payload });
      selection.clear();
      await queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
      return result;
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível concluir a ação em massa.'));
      return null;
    } finally {
      setBusy(false);
    }
  };

  /** Desfaz um movimento: devolve os ids para a etapa de origem. */
  const undoMove = async (ids: number[], stageId: number, stageName: string) => {
    try {
      const result = await pipelineApi.bulk({ action: 'move', ids, payload: { stageId } });
      await queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
      toast.success(`${result.updated} lead(s) voltaram para ${stageName}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível desfazer o movimento.'));
    }
  };

  /**
   * Move para uma etapa. Desfazer so e oferecido para etapas abertas, com selecao por ids
   * e todos os leads vindos da mesma etapa (senao nao ha como voltar com seguranca).
   */
  const moveTo = async (stage: PipelineStage, extra: Pick<Payload, 'lostReasonId' | 'lostNote'> = {}) => {
    const ids = selection.mode === 'ids' ? [...selection.selectedIds] : null;
    let undoFrom: number | null = null;
    if (ids && stage.type === 'OPEN') {
      const statuses = cachedStatuses(queryClient, ids);
      const origins = new Set(statuses.values());
      if (statuses.size === ids.length && origins.size === 1) {
        const origin = [...origins][0];
        if (origin !== stage.id) undoFrom = origin;
      }
    }

    const result = await runBulk('move', { stageId: stage.id, ...extra });
    if (!result) return;

    if (ids && undoFrom) {
      const originKey = undoFrom;
      const originName = stages.find((s) => s.id === originKey)?.name ?? 'etapa anterior';
      toast.success(`${result.updated} lead(s) atualizado(s)`, {
        description: `Movidos para ${stage.name}.`,
        duration: 5000,
        action: { label: 'Desfazer', onClick: () => undoMove(ids, originKey, originName) },
      });
      return;
    }
    toast.success(`${result.updated} lead(s) atualizado(s)`, { description: `Movidos para ${stage.name}.` });
  };

  const assign = async (ownerId: number, ownerName: string) => {
    const result = await runBulk('assign', { ownerId });
    if (result) toast.success(`${result.updated} lead(s) atualizado(s)`, { description: `Responsável: ${ownerName}.` });
  };

  const tagging = async (tagId: number, tagName: string, add: boolean) => {
    const result = await runBulk(add ? 'addTag' : 'removeTag', { tagId });
    if (result) {
      toast.success(`${result.updated} lead(s) atualizado(s)`, {
        description: add ? `Etiqueta "${tagName}" adicionada.` : `Etiqueta "${tagName}" removida.`,
      });
    }
  };

  const archive = async () => {
    const result = await runBulk('archive', {});
    if (result) toast.success(`${result.updated} lead(s) arquivado(s).`);
  };

  return { busy, moveTo, assign, tagging, archive };
}
