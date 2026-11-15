'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CopilotSaveState } from '@/components/sales-copilot/hooks/useSalesCopilot';
import { formatClock } from './copilot-format';

const SAVE_TEXT: Partial<Record<CopilotSaveState, string>> = {
  idle: 'Alterações são salvas automaticamente.',
  saving: 'Salvando…',
  error: 'Não foi possível salvar. Tentaremos na próxima alteração.',
};

/** Indicador de salvamento (lido por leitores de tela) e o aviso de conflito com "Recarregar". */
export function SaveIndicator({
  saveState,
  savedAt,
  className,
}: {
  saveState: CopilotSaveState;
  savedAt: Date | null;
  className?: string;
}) {
  const text =
    saveState === 'saved' && savedAt
      ? `Salvo às ${formatClock(savedAt)}`
      : (SAVE_TEXT[saveState] ?? '');
  const isError = saveState === 'error';

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-xs tabular-nums ${isError ? 'text-red-600' : 'text-slate-500'} ${className ?? ''}`}
    >
      {text}
    </p>
  );
}

export function ConflictBanner({ onReload }: { onReload: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">Este diagnóstico foi alterado em outra tela.</p>
        <p className="text-amber-800">
          Suas alterações deste momento não estão sendo salvas. Recarregar traz a versão salva e descarta as alterações locais.
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onReload}>
        Recarregar
      </Button>
    </div>
  );
}
