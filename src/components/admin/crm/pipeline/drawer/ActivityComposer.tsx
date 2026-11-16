'use client';

import { useState, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarClock, Loader2, Phone, StickyNote } from 'lucide-react';
import { crmLeadsApi, type CrmLead } from '@/services/crm-leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { errorMessage, fromDateTimeLocal, formatPhone } from '@/components/admin/crm/format';
import type { AutosaveApi } from './useAutosave';
import { prependActivity, toCrmLead, type DrawerLead } from './types';

type ComposerMode = 'note' | 'call' | 'task';

const MODES: Array<{ value: ComposerMode; label: string; Icon: typeof StickyNote }> = [
  { value: 'note', label: 'Nota', Icon: StickyNote },
  { value: 'call', label: 'Ligação', Icon: Phone },
  { value: 'task', label: 'Tarefa', Icon: CalendarClock },
];

interface ActivityComposerProps {
  lead: DrawerLead;
  autosave: AutosaveApi;
  callingId: number | null;
  onCall: (lead: CrmLead) => void;
}

/** Registro de nota, ligação ou próxima ação na aba Atividades. */
export function ActivityComposer({ lead, autosave, callingId, onCall }: ActivityComposerProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ComposerMode>('note');
  const [text, setText] = useState('');
  const [taskAt, setTaskAt] = useState('');
  const [busy, setBusy] = useState(false);
  const trimmed = text.trim();
  const isCalling = callingId === lead.id;
  const phone = lead.phone || lead.phone2;

  const addNote = async (body: string) => {
    const activity = await crmLeadsApi.addNote(lead.id, body);
    prependActivity(queryClient, lead.id, activity);
  };

  const submit = async () => {
    if (busy) return;
    if (mode === 'note') {
      if (!trimmed) return;
      setBusy(true);
      try {
        await addNote(trimmed);
        setText('');
        toast.success('Nota adicionada.');
      } catch (err) {
        toast.error(errorMessage(err, 'Não foi possível adicionar a nota.'));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (mode === 'task') {
      const iso = fromDateTimeLocal(taskAt);
      if (!iso) {
        toast.error('Escolha a data e a hora da próxima ação.');
        return;
      }
      setBusy(true);
      try {
        const saved = await autosave.saveNow({ nextActionAt: iso });
        if (!saved) return;
        if (trimmed) await addNote(trimmed);
        setText('');
        setTaskAt('');
        toast.success('Tarefa definida.');
      } catch (err) {
        toast.error(errorMessage(err, 'Não foi possível definir a tarefa.'));
      } finally {
        setBusy(false);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
      <div role="group" aria-label="Tipo de registro" className="mb-2 inline-flex rounded-lg bg-muted p-0.5 ">
        {MODES.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]',
              mode === value
                ? 'bg-card text-foreground shadow-sm  '
                : 'text-muted-foreground hover:text-foreground  ',
            )}
          >
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'note' && (
        <div className="space-y-2">
          <Textarea
            aria-label="Texto da nota"
            rows={2}
            maxLength={2000}
            placeholder="Registre o que foi conversado…"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline ">Ctrl+Enter envia</span>
            <Button type="button" size="sm" onClick={() => void submit()} disabled={busy || !trimmed}>
              {busy && <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" />}
              Adicionar nota
            </Button>
          </div>
        </div>
      )}

      {mode === 'call' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground ">
            {phone ? `Ligação pelo ramal para ${formatPhone(phone)}` : 'Lead sem telefone cadastrado.'}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => onCall(toCrmLead(lead))}
            disabled={!phone || isCalling}
            className="bg-[hsl(var(--brand))] text-primary-foreground hover:opacity-90"
          >
            {isCalling ? <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" /> : <Phone aria-hidden className="mr-1.5 h-4 w-4" />}
            Ligar agora
          </Button>
        </div>
      )}

      {mode === 'task' && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="datetime-local"
              aria-label="Data e hora da próxima ação"
              value={taskAt}
              onChange={(event) => setTaskAt(event.target.value)}
              disabled={busy}
              className="sm:w-56"
            />
            <Input
              aria-label="Observação da tarefa"
              placeholder="Observação (opcional)"
              maxLength={2000}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void submit();
                }
              }}
              disabled={busy}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={() => void submit()} disabled={busy || !taskAt}>
              {busy && <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" />}
              Definir tarefa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
