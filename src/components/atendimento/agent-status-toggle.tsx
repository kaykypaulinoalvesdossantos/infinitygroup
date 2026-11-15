'use client';

import { useEffect, useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { whatsappAttendanceApi } from '@/components/atendimento/whatsapp-attendance-api';
import type { WaAgentStatusType } from '@/services/whatsapp-settings/types';

export const AGENT_STATUS_LABEL: Record<WaAgentStatusType, string> = {
  ONLINE: 'Online',
  AWAY: 'Ausente',
  PAUSED: 'Em pausa',
  OFFLINE: 'Offline',
};

const AGENT_STATUS_DOT: Record<WaAgentStatusType, string> = {
  ONLINE: 'bg-success',
  AWAY: 'bg-warning-foreground',
  PAUSED: 'bg-primary',
  OFFLINE: 'bg-muted-foreground/70',
};

const AGENT_STATUS_ORDER: WaAgentStatusType[] = ['ONLINE', 'AWAY', 'PAUSED', 'OFFLINE'];

const TOOLTIP = 'Só atendentes Online recebem novas conversas automaticamente';

export function AgentStatusToggle() {
  const [status, setStatus] = useState<WaAgentStatusType | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void whatsappAttendanceApi
      .getMyStatus()
      .then((result) => {
        if (active) setStatus(result.status);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeStatus = async (next: WaAgentStatusType) => {
    if (saving || next === status) return;
    const previous = status;
    setStatus(next);
    setSaving(true);
    try {
      const updated = await whatsappAttendanceApi.setMyStatus(next);
      setStatus(updated.status);
      toast.success(`Seu status agora é ${AGENT_STATUS_LABEL[updated.status]}.`);
    } catch (error) {
      setStatus(previous);
      toast.error(error instanceof Error ? error.message : 'Não foi possível alterar seu status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
      title={TOOLTIP}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${status ? AGENT_STATUS_DOT[status] : 'bg-muted-foreground/70'}`}
        aria-hidden
      />
      <select
        value={status ?? ''}
        disabled={!status || saving}
        onChange={(event) => void changeStatus(event.target.value as WaAgentStatusType)}
        className="h-7 bg-transparent text-sm font-medium text-foreground focus:outline-none disabled:opacity-60"
        aria-label="Meu status de atendimento"
        title={TOOLTIP}
      >
        {status === null && (
          <option value="">{loadError ? 'Status indisponível' : 'Carregando…'}</option>
        )}
        {AGENT_STATUS_ORDER.map((item) => (
          <option key={item} value={item}>
            {AGENT_STATUS_LABEL[item]}
          </option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/80" />
      ) : (
        <Info className="h-3.5 w-3.5 text-muted-foreground/80" aria-hidden />
      )}
      <span className="sr-only">{TOOLTIP}</span>
    </div>
  );
}
