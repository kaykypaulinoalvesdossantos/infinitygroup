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
  REQUESTED: 'bg-muted text-foreground',
  CLAIMED: 'bg-muted text-foreground',
  DIALING: 'bg-warning text-warning-foreground',
  ACTIVE: 'bg-success text-success-foreground',
  HOLDING: 'bg-info text-info-foreground',
  COMPLETED: 'bg-success text-success-foreground',
  NO_ANSWER: 'bg-muted text-foreground',
  FAILED: 'bg-danger text-danger-foreground',
  CANCELLED: 'bg-muted text-foreground',
  ENDED_UNKNOWN: 'bg-warning text-warning-foreground',
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
    <Card className={cn('border-primary/30 shadow-sm', className)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              inCall ? 'bg-success/15 text-success-foreground' : 'bg-primary/10 text-link',
            )}
          >
            {call.direction === 'INBOUND' ? <PhoneIncoming className="h-5 w-5" /> : <PhoneOutgoing className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{call.phone}</p>
          </div>
          <Badge className={cn('shrink-0 border-transparent', STATUS_TONE[call.status])}>{label}</Badge>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1 basis-36">
            <p className="text-xs uppercase leading-tight tracking-wide text-muted-foreground [overflow-wrap:anywhere]">
              {answered ? 'Tempo de conversa' : 'Tempo de discagem'}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground min-[360px]:text-3xl">
              {elapsedSec !== null ? formatDuration(elapsedSec) : '--:--'}
            </p>
          </div>

          {active && onHangup && (
            <Button
              variant="destructive"
              size="lg"
              onClick={onHangup}
              disabled={hangingUp || call.hangupRequested}
              className="h-auto min-h-12 shrink-0 whitespace-normal py-2 text-center leading-tight rounded-full px-5"
            >
              <PhoneOff className="mr-2 h-5 w-5 shrink-0" />
              {hangingUp || call.hangupRequested ? 'Encerrando…' : 'Encerrar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
