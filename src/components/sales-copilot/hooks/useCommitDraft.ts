'use client';

import { useEffect, useState } from 'react';

/**
 * Campo de texto com rascunho local: o valor vai para o diagnostico somente ao sair do campo (blur),
 * para nao gerar uma entrada de "Voltar" a cada tecla. Reabre com o valor salvo quando ele muda.
 */
export function useCommitDraft(saved: string, commit: (value: string) => void) {
  const [draft, setDraft] = useState(saved);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  function onBlur(): void {
    if (draft !== saved) commit(draft);
  }

  return { draft, setDraft, onBlur };
}
