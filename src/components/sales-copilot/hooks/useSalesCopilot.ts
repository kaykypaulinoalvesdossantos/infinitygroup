'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildScript,
  normalizeDiagnosis,
  type DiagnosisData,
  type Script,
  type ScriptOverrides,
} from '@/components/sales-copilot/engine';
import { salesCopilotApi } from '@/services/sales-copilot';

export type CopilotLoadStatus = 'loading' | 'ready' | 'error';
export type CopilotSaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

const AUTOSAVE_DELAY_MS = 800;
const HISTORY_LIMIT = 30;
/** O backend responde 409 com esta mensagem; o cliente da API nao expoe o status, entao checamos o texto. */
const CONFLICT_PATTERN = /alterado em outra tela|conflict/i;

/**
 * Canal de salvamento de um lead. Cada troca de lead cria um canal novo; o canal antigo
 * fica inativo (nao atualiza mais a tela) mas ainda descarrega a ultima alteracao pendente.
 */
interface SaveChannel {
  leadId: number;
  version: number;
  pending: DiagnosisData | null;
  inFlight: boolean;
  conflict: boolean;
  active: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  report: (next: CopilotSaveState, at?: Date) => void;
}

function scheduleSave(channel: SaveChannel): void {
  if (channel.timer !== null) clearTimeout(channel.timer);
  channel.timer = setTimeout(() => {
    channel.timer = null;
    runSave(channel);
  }, AUTOSAVE_DELAY_MS);
}

/** Envia o estado pendente. Nunca roda dois saves ao mesmo tempo: o ultimo estado fica na fila. */
function runSave(channel: SaveChannel): void {
  if (channel.timer !== null) {
    clearTimeout(channel.timer);
    channel.timer = null;
  }
  if (channel.inFlight || channel.conflict || !channel.pending) return;

  const data = channel.pending;
  channel.pending = null;
  channel.inFlight = true;
  channel.report('saving');

  salesCopilotApi
    .saveDiagnosis<DiagnosisData>(channel.leadId, data, channel.version)
    .then((response) => {
      channel.inFlight = false;
      channel.version = response.version;
      if (channel.pending) {
        if (channel.active) scheduleSave(channel);
        else runSave(channel);
      } else {
        channel.report('saved', new Date());
      }
    })
    .catch((error: unknown) => {
      channel.inFlight = false;
      const message = error instanceof Error ? error.message : '';
      if (CONFLICT_PATTERN.test(message)) {
        channel.conflict = true;
        channel.pending = null;
        channel.report('conflict');
        return;
      }
      // Sem retry automatico: a proxima alteracao envia o estado completo de novo.
      channel.report('error');
    });
}

export interface SalesCopilotState {
  status: CopilotLoadStatus;
  error: string | null;
  /** Diagnostico normalizado do lead (presente quando status === 'ready'). */
  state: DiagnosisData | null;
  /** Roteiro efetivo (padrao + ajustes do supervisor). */
  script: Script | null;
  /** Aplica um novo estado do diagnostico, guarda o anterior para "Voltar" e agenda o salvamento. */
  dispatch: (next: DiagnosisData) => void;
  undo: () => void;
  canUndo: boolean;
  saveState: CopilotSaveState;
  savedAt: Date | null;
  /** Recarrega diagnostico e roteiro do servidor, descartando alteracoes locais nao salvas. */
  reload: () => void;
}

/** Carrega o diagnostico e o roteiro de um lead e salva automaticamente as alteracoes. */
export function useSalesCopilot(leadId: number | null): SalesCopilotState {
  const [status, setStatus] = useState<CopilotLoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DiagnosisData | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [undoCount, setUndoCount] = useState(0);
  const [saveState, setSaveState] = useState<CopilotSaveState>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const channelRef = useRef<SaveChannel | null>(null);
  const stateRef = useRef<DiagnosisData | null>(null);
  const historyRef = useRef<DiagnosisData[]>([]);

  useEffect(() => {
    if (leadId === null) {
      setState(null);
      setScript(null);
      setStatus('loading');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);
    setState(null);
    setScript(null);
    setSaveState('idle');
    setSavedAt(null);
    setUndoCount(0);
    stateRef.current = null;
    historyRef.current = [];

    Promise.all([salesCopilotApi.getDiagnosis(leadId), salesCopilotApi.getScript<ScriptOverrides>()])
      .then(([diagnosis, scriptResponse]) => {
        if (cancelled) return;
        const data = normalizeDiagnosis(diagnosis.data);
        const channel: SaveChannel = {
          leadId,
          version: diagnosis.version,
          pending: null,
          inFlight: false,
          conflict: false,
          active: true,
          timer: null,
          report: (next, at) => {
            if (!channel.active) return;
            setSaveState(next);
            if (at) setSavedAt(at);
          },
        };
        channelRef.current = channel;
        stateRef.current = data;
        setScript(buildScript(scriptResponse.data));
        setState(data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error && err.message ? err.message : 'Não foi possível carregar o copiloto.');
        setStatus('error');
      });

    return () => {
      // Troca de lead ou desmontagem: descarrega a alteracao pendente do lead anterior.
      cancelled = true;
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) {
        channel.active = false;
        runSave(channel);
      }
    };
  }, [leadId, reloadToken]);

  useEffect(() => {
    // Best effort: envia o que estiver pendente antes de fechar a aba.
    function handleBeforeUnload() {
      const channel = channelRef.current;
      if (channel) runSave(channel);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const dispatch = useCallback((next: DiagnosisData) => {
    const previous = stateRef.current;
    if (!previous) return;
    historyRef.current = [...historyRef.current, previous].slice(-HISTORY_LIMIT);
    setUndoCount(historyRef.current.length);
    stateRef.current = next;
    setState(next);

    const channel = channelRef.current;
    if (channel && !channel.conflict) {
      channel.pending = next;
      channel.report('saving');
      scheduleSave(channel);
    }
  }, []);

  const undo = useCallback(() => {
    const stack = historyRef.current;
    const previous = stack[stack.length - 1];
    if (!previous) return;
    historyRef.current = stack.slice(0, -1);
    setUndoCount(historyRef.current.length);
    stateRef.current = previous;
    setState(previous);

    const channel = channelRef.current;
    if (channel && !channel.conflict) {
      channel.pending = previous;
      channel.report('saving');
      scheduleSave(channel);
    }
  }, []);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    status,
    error,
    state,
    script,
    dispatch,
    undo,
    canUndo: undoCount > 0,
    saveState,
    savedAt,
    reload,
  };
}
