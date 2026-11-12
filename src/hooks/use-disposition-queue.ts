'use client';

import { useCallback, useState } from 'react';
import type { PhoneCall } from '@/services/telephony';

/** Status que pedem o resultado ao vendedor automaticamente ao fim da ligacao. */
const ASK_RESULT_STATUSES = ['COMPLETED', 'ENDED_UNKNOWN'];

/**
 * Fila de "registrar resultado". Evita que uma ligacao nova substitua o formulario
 * que o vendedor ainda esta preenchendo: cada ligacao entra na fila e abre na sua vez.
 * Ligacoes nao atendidas ja ficam registradas como "Nao atendida" e nao interrompem.
 */
export function useDispositionQueue() {
  const [queue, setQueue] = useState<PhoneCall[]>([]);

  /** Ligacao que acabou de terminar (automatico): so atendidas / resultado incerto. */
  const enqueueEnded = useCallback((call: PhoneCall) => {
    if (call.disposition || !ASK_RESULT_STATUSES.includes(call.status)) return;
    setQueue((q) => (q.some((c) => c.id === call.id) ? q : [...q, call]));
  }, []);

  /** Aberto pelo vendedor (botao "Registrar resultado"): vai para a frente da fila. */
  const openNow = useCallback((call: PhoneCall) => {
    setQueue((q) => [call, ...q.filter((c) => c.id !== call.id)]);
  }, []);

  const next = useCallback(() => setQueue((q) => q.slice(1)), []);

  const current = queue[0] ?? null;
  return {
    current,
    pending: Math.max(0, queue.length - 1),
    enqueueEnded,
    openNow,
    dialogProps: {
      call: current,
      open: !!current,
      onOpenChange: (open: boolean) => {
        if (!open) next();
      },
    },
    next,
  };
}
