'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ClipboardCheck, Loader2 } from 'lucide-react';
import { DispositionDialog } from '@/components/ramal/DispositionDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getErrorMessage } from '@/hooks/ramal/useNativeTelephony';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/services/api';
import {
  CALL_STATUS_LABEL,
  DISPOSITION_OPTIONS,
  formatDuration,
  isCallActive,
  type Disposition,
  type Paginated,
  type PhoneCall,
  type PhoneCallStatus,
} from '@/services/telephony';

const PAGE_SIZE = 20;

type FilterKey = 'ALL' | PhoneCallStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'COMPLETED', label: 'Atendidas' },
  { key: 'NO_ANSWER', label: 'Não atendidas' },
  { key: 'FAILED', label: 'Falhas' },
  { key: 'ENDED_UNKNOWN', label: 'A confirmar' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

/** O listCalls do service ignora os filtros; consulta direta com a query string. */
function listCalls(params: { page: number; pageSize: number; status?: PhoneCallStatus }): Promise<Paginated<PhoneCall>> {
  const qs = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize) });
  if (params.status) qs.set('status', params.status);
  return apiRequest(`/telephony/calls?${qs.toString()}`);
}

function needsDisposition(call: PhoneCall): boolean {
  return !call.disposition && !isCallActive(call.status) && call.status !== 'CANCELLED';
}

function dispositionLabel(value: Disposition | null): string | null {
  if (!value) return null;
  return DISPOSITION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatWhen(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RamalHistoricoPage() {
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [items, setItems] = useState<PhoneCall[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dispositionCall, setDispositionCall] = useState<PhoneCall | null>(null);
  const [dispositionOpen, setDispositionOpen] = useState(false);

  const requestIdRef = useRef(0);

  const load = useCallback(
    async (nextPage: number, reset: boolean) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const res = await listCalls({
          page: nextPage,
          pageSize: PAGE_SIZE,
          status: filter === 'ALL' ? undefined : filter,
        });
        if (requestId !== requestIdRef.current) return;
        setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(nextPage);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessage(err, 'Não foi possível carregar o histórico.'));
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [filter],
  );

  // Troca de filtro recarrega a partir da primeira pagina
  useEffect(() => {
    void load(1, true);
  }, [load]);

  const hasMore = items.length < total;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-10 pt-4">
      <div className="flex items-center gap-2">
        <Link
          href="/ramal"
          aria-label="Voltar ao ramal"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Histórico de ligações</h1>
          <p className="text-xs text-slate-600">{total} ligações encontradas</p>
        </div>
      </div>

      <div role="group" aria-label="Filtrar por resultado" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((option) => {
          const active = filter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.key)}
              className={cn(
                'min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors',
                active
                  ? 'border-[#0076FF] bg-[#0076FF] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-slate-600">
            Nenhuma ligação encontrada neste filtro.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((call) => (
            <li key={call.id}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {call.leadName?.trim() || call.phone}
                    </p>
                    <p className="truncate text-sm text-slate-600">
                      {call.leadName?.trim() ? `${call.phone} · ` : ''}
                      {formatWhen(call.dialingAt ?? call.createdAt)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {CALL_STATUS_LABEL[call.status]}
                      {call.talkSec ? ` · conversa ${formatDuration(call.talkSec)}` : ''}
                      {dispositionLabel(call.disposition) ? ` · ${dispositionLabel(call.disposition)}` : ''}
                    </p>
                  </div>
                  {needsDisposition(call) && (
                    <Button
                      variant="outline"
                      className="h-11 shrink-0 rounded-xl"
                      onClick={() => {
                        setDispositionCall(call);
                        setDispositionOpen(true);
                      }}
                    >
                      <ClipboardCheck className="mr-1.5 h-4 w-4" />
                      Registrar
                    </Button>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl"
          disabled={loading}
          onClick={() => void load(page + 1, false)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Carregando…' : 'Carregar mais'}
        </Button>
      )}

      <DispositionDialog
        call={dispositionCall}
        open={dispositionOpen}
        onOpenChange={setDispositionOpen}
        onSaved={() => void load(1, true)}
      />
    </div>
  );
}
