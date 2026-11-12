'use client';

import { useEffect, useState } from 'react';
import { PhoneIncoming, PhoneOff, PhoneOutgoing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CALL_STATUS_LABEL,
  formatDuration,
  isCallActive,
  type PhoneCall,
  type PhoneCallStatus,
} from '@/services/telephony';

/** Relogio que atualiza a cada `intervalMs`. Retorna null antes da montagem (evita divergencia no SSR). */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}

interface CallStatusCardProps {
  call: PhoneCall;
  onHangup?: () => void;
  hangingUp?: boolean;
  className?: string;
}

const STATUS_TONE: Record<PhoneCallStatus, string> = {
  REQUESTED: 'bg-slate-100 text-slate-700',
  CLAIMED: 'bg-slate-100 text-slate-700',
  DIALING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  HOLDING: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  NO_ANSWER: 'bg-slate-100 text-slate-700',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-700',
  ENDED_UNKNOWN: 'bg-amber-100 text-amber-800',
};

function toMs(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

export function CallStatusCard({ call, onHangup, hangingUp = false, className }: CallStatusCardProps) {
  const now = useNow(1000);
  const active = isCallActive(call.status);
  const answered = toMs(call.answeredAt);
  const startedAt = answered ?? toMs(call.dialingAt) ?? toMs(call.createdAt);
  const elapsedSec = now !== null && startedAt !== null ? Math.max(0, Math.floor((now - startedAt) / 1000)) : null;
  const inCall = call.status === 'ACTIVE' || call.status === 'HOLDING';
  const label = call.hangupRequested && active ? 'Encerrando ligação…' : CALL_STATUS_LABEL[call.status];
  const name = call.leadName?.trim() || 'Contato sem nome';

  return (
    <Card className={cn('border-[#0076FF]/30 shadow-sm', className)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              inCall ? 'bg-emerald-500/15 text-emerald-600' : 'bg-[#0076FF]/10 text-[#0076FF]',
            )}
          >
            {call.direction === 'INBOUND' ? <PhoneIncoming className="h-5 w-5" /> : <PhoneOutgoing className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-slate-900">{name}</p>
            <p className="truncate text-sm text-slate-600">{call.phone}</p>
          </div>
          <Badge className={cn('shrink-0 border-transparent', STATUS_TONE[call.status])}>{label}</Badge>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {answered ? 'Tempo de conversa' : 'Tempo chamando'}
            </p>
            <p className="font-mono text-3xl font-bold tabular-nums text-slate-900">
              {elapsedSec !== null ? formatDuration(elapsedSec) : '--:--'}
            </p>
          </div>

          {active && onHangup && (
            <Button
              variant="destructive"
              size="lg"
              onClick={onHangup}
              disabled={hangingUp || call.hangupRequested}
              className="h-12 rounded-full px-5"
            >
              <PhoneOff className="mr-2 h-5 w-5" />
              {hangingUp || call.hangupRequested ? 'Encerrando…' : 'Encerrar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
