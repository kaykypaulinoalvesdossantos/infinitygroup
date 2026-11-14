'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPhone, getErrorMessage } from '@/components/atendimento/helpers';
import { telephonyService, type QueueCandidate, type QueueSelectionMode } from '@/services/telephony';

export function QueueLeadPicker({ campaignId, sessionId, mode, onModeChange, selected, onChange, disabled }: {
  campaignId?: number;
  sessionId?: number;
  mode: QueueSelectionMode;
  onModeChange: (mode: QueueSelectionMode) => void;
  selected: QueueCandidate[];
  onChange: (items: QueueCandidate[]) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([campaignId, sessionId, mode, search, page, retry]);
  const [response, setResponse] = useState<{
    key: string;
    data?: Awaited<ReturnType<typeof telephonyService.queueCandidates>>;
    error?: string;
  }>();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void telephonyService.queueCandidates({ campaignId, sessionId, selectionMode: mode, search, page })
        .then((data) => { if (active) setResponse({ key: requestKey, data }); })
        .catch((error: unknown) => {
          if (active) setResponse({ key: requestKey, error: getErrorMessage(error, 'Não foi possível buscar os leads.') });
        });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [campaignId, sessionId, mode, search, page, requestKey]);

  const result = response?.key === requestKey ? response : undefined;
  const pageCount = result?.data ? Math.max(1, Math.ceil(result.data.total / result.data.pageSize)) : page;
  const selectedIds = new Set(selected.map((item) => item.leadId));
  const limit = sessionId ? 100 : 5000;

  function move(index: number, step: number) {
    const next = [...selected];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4 border-y border-slate-200 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Critério de seleção</Label>
          <Select value={mode} disabled={disabled} onValueChange={(value: QueueSelectionMode) => {
            onModeChange(value);
            onChange([]);
            setPage(1);
          }}>
            <SelectTrigger aria-label="Critério de seleção" className="h-11 w-full rounded-lg border-slate-300"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ELIGIBLE">Somente elegíveis</SelectItem>
              <SelectItem value="MANUAL">Inclusão manual excepcional</SelectItem>
            </SelectContent>
          </Select>
          {mode === 'MANUAL' && <p className="text-xs text-amber-800">Permite incluir leads antes do retorno ou da próxima tentativa previstos pela fila automática.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="queue-lead-search">Buscar leads</Label>
          <Input id="queue-lead-search" className="h-11 rounded-lg border-slate-300" value={search} maxLength={100} placeholder="Nome, empresa ou telefone"
            onChange={(event) => { setSearch(event.target.value); setPage(1); }} disabled={disabled} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm font-semibold">Disponíveis</h3>
          {!result && <p role="status" className="text-sm text-slate-600">Buscando leads…</p>}
          {result?.error && <div role="alert" className="space-y-2 text-sm text-red-700">
            <p>{result.error}</p><Button variant="outline" size="sm" onClick={() => setRetry(retry + 1)}>Tentar novamente</Button>
          </div>}
          {result?.data && (
            <>
              {result.data.items.length === 0 && <p className="text-sm text-slate-600">Nenhum lead nesta página.</p>}
              <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                {result.data.items.map((item) => (
                  <li key={item.leadId} className="flex items-center justify-between gap-2 py-2 pr-1">
                    <span className="min-w-0"><span className="block truncate text-sm font-medium">{item.name}</span><span className="text-xs text-slate-600">{formatPhone(item.phone)}</span></span>
                    <Button size="icon" variant="outline" className="size-11 rounded-lg border-slate-300 sm:size-9" disabled={disabled || selectedIds.has(item.leadId) || selected.length >= limit}
                      aria-label={`Selecionar ${item.name}`} onClick={() => onChange([...selected, item])}>
                      <Plus aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {(page > 1 || pageCount > 1) && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Button size="sm" variant="outline" disabled={disabled || page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span>{page} / {pageCount}</span>
            <Button size="sm" variant="outline" disabled={disabled || page >= pageCount} onClick={() => setPage(page + 1)}>Próxima</Button>
          </div>}
        </div>
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm font-semibold" aria-live="polite">Selecionados ({selected.length})</h3>
          {!selected.length && <p className="text-sm text-slate-600">Adicione os leads na ordem em que deseja ligar.</p>}
          <ol className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {selected.map((item, index) => (
              <li key={item.leadId} className="flex flex-wrap items-center justify-between gap-1 py-2 pr-1">
                <span className="min-w-0 flex-1 truncate text-sm"><span className="mr-2 tabular-nums text-slate-600">{index + 1}.</span>{item.name}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="size-11 sm:size-9" disabled={disabled || index === 0} aria-label={`Subir ${item.name}`} onClick={() => move(index, -1)}><ArrowUp aria-hidden="true" className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="size-11 sm:size-9" disabled={disabled || index === selected.length - 1} aria-label={`Descer ${item.name}`} onClick={() => move(index, 1)}><ArrowDown aria-hidden="true" className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="size-11 sm:size-9" disabled={disabled} aria-label={`Remover ${item.name}`} onClick={() => onChange(selected.filter((lead) => lead.leadId !== item.leadId))}><Minus aria-hidden="true" className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function AddQueueLeads({ sessionId, onAdded, disabled }: { sessionId: number; onAdded: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<QueueCandidate[]>([]);
  const [mode, setMode] = useState<QueueSelectionMode>('ELIGIBLE');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function add() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await telephonyService.addToSession(selected.map((item) => item.leadId), mode, sessionId);
      const skipped = new Set(result.skipped);
      const names = selected.filter((item) => skipped.has(item.leadId)).map((item) => item.name);
      setMessage(`${result.added.length} lead(s) incluído(s).${names.length ? ` Já estavam na fila ou perderam a elegibilidade: ${names.join(', ')}.` : ''}`);
      setSelected([]);
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível adicionar os leads.'));
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-3">
    <Button variant="outline" className="min-h-11 rounded-lg border-slate-300" disabled={disabled || saving} onClick={() => setOpen(!open)} aria-expanded={open}>
      {open ? 'Fechar seleção' : 'Adicionar leads à fila'}
    </Button>
    {open && <>
      <QueueLeadPicker sessionId={sessionId} mode={mode} onModeChange={setMode} selected={selected} onChange={setSelected} disabled={disabled || saving} />
      <Button className="min-h-11 rounded-lg bg-[#0076FF] text-white hover:bg-blue-700" disabled={!selected.length || disabled || saving} onClick={() => void add()}>{saving ? 'Adicionando…' : 'Adicionar selecionados'}</Button>
    </>}
    {message && <p role="status" className="break-words text-sm text-slate-700">{message}</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
