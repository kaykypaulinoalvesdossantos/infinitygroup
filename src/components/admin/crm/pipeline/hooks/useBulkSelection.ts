'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { LeadFilters } from '@/services/crm-pipeline';

/** Escopo "coluna inteira": todos os leads da etapa, menos os excluidos. */
export interface BulkColumnScope {
  stageId: number;
  excludedIds: number[];
}

/** Alvo pronto para POST /crm-pipelines/leads/bulk: ids explicitos ou escopo no servidor. */
export type BulkTarget =
  | { ids: number[] }
  | { scope: { filters: LeadFilters; stageId: number; excludedIds: number[] } };

interface ToggleOptions {
  /** Etapa do lead clicado (necessaria para o escopo de coluna). */
  stageId?: number;
  /** Ids na ordem visual, para o Shift+clique selecionar o intervalo. */
  orderedIds?: number[];
  shift?: boolean;
}

/** Selecao de leads: por id, ou a coluna inteira como escopo do servidor. */
export function useBulkSelection() {
  const [ids, setIds] = useState<Set<number>>(() => new Set());
  const [scope, setScope] = useState<{ stageId: number; excluded: Set<number> } | null>(null);
  const anchorRef = useRef<number | null>(null);

  const isSelected = useCallback(
    (id: number, stageId?: number) => {
      if (scope && stageId === scope.stageId) return !scope.excluded.has(id);
      return ids.has(id);
    },
    [ids, scope],
  );

  const toggle = useCallback(
    (id: number, options: ToggleOptions = {}) => {
      const { stageId, orderedIds = [], shift = false } = options;
      const inScope = !!scope && stageId === scope.stageId;

      // Intervalo com Shift: todos entre a ancora e o id recebem o estado da ancora
      const anchor = anchorRef.current;
      if (shift && anchor !== null && orderedIds.length) {
        const from = orderedIds.indexOf(anchor);
        const to = orderedIds.indexOf(id);
        if (from >= 0 && to >= 0) {
          const range = orderedIds.slice(Math.min(from, to), Math.max(from, to) + 1);
          const select = !isSelected(anchor, stageId);
          if (inScope && scope) {
            setScope((prev) => {
              if (!prev) return prev;
              const excluded = new Set(prev.excluded);
              range.forEach((rangeId) => (select ? excluded.delete(rangeId) : excluded.add(rangeId)));
              return { ...prev, excluded };
            });
          } else {
            setIds((prev) => {
              const next = new Set(prev);
              range.forEach((rangeId) => (select ? next.add(rangeId) : next.delete(rangeId)));
              return next;
            });
          }
          return;
        }
      }

      anchorRef.current = id;
      if (inScope && scope) {
        setScope((prev) => {
          if (!prev) return prev;
          const excluded = new Set(prev.excluded);
          if (excluded.has(id)) excluded.delete(id);
          else excluded.add(id);
          return { ...prev, excluded };
        });
        return;
      }
      // Fora do escopo de coluna: sai do modo coluna e volta a selecao por id
      if (scope) setScope(null);
      setIds((prev) => {
        const next = scope ? new Set<number>() : new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [isSelected, scope],
  );

  /** Seleciona a coluna inteira como escopo (o servidor resolve os ids). */
  const selectColumn = useCallback((stageId: number) => {
    setIds(new Set());
    setScope({ stageId, excluded: new Set() });
    anchorRef.current = null;
  }, []);

  const clear = useCallback(() => {
    setIds(new Set());
    setScope(null);
    anchorRef.current = null;
  }, []);

  /** Quantidade selecionada. `totalsByStage` = total de leads por etapa com os filtros atuais. */
  const count = useCallback(
    (totalsByStage: Record<string, number>) => {
      if (scope) return Math.max(0, (totalsByStage[scope.stageId] ?? 0) - scope.excluded.size);
      return ids.size;
    },
    [ids, scope],
  );

  /** Monta o alvo do bulk. Com escopo de coluna envia o escopo; senao envia os ids. */
  const toBulkTarget = useCallback(
    (filters: LeadFilters): BulkTarget => {
      if (scope) {
        return { scope: { filters, stageId: scope.stageId, excludedIds: [...scope.excluded] } };
      }
      return { ids: [...ids] };
    },
    [ids, scope],
  );

  const selectedIds = useMemo(() => [...ids], [ids]);
  const scopeView = useMemo<BulkColumnScope | null>(
    () => (scope ? { stageId: scope.stageId, excludedIds: [...scope.excluded] } : null),
    [scope],
  );
  const mode = scope ? 'column' : ids.size ? 'ids' : 'none';

  return {
    mode,
    hasSelection: mode !== 'none',
    selectedIds,
    scope: scopeView,
    isSelected,
    toggle,
    selectColumn,
    count,
    toBulkTarget,
    clear,
  };
}
