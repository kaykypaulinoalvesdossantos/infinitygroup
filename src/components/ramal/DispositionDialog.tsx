'use client';

import { useState } from 'react';
import { CalendarClock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/hooks/ramal/useNativeTelephony';
import { cn } from '@/lib/utils';
import {
  CALL_STATUS_LABEL,
  DISPOSITION_OPTIONS,
  telephonyService,
  type Disposition,
  type PhoneCall,
} from '@/services/telephony';

const NOTE_MAX = 1000;

export interface DispositionDialogProps {
  call: PhoneCall | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

/** Converte o valor de <input type="datetime-local"> (horario local) para ISO. */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/** Valor minimo aceito pelo datetime-local: agora, no fuso local (minuto atual). */
function nowForInput(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DispositionDialog({ call, open, onOpenChange, onSaved }: DispositionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl p-0 sm:max-w-md">
        {call && open ? (
          <DispositionForm
            key={call.id}
            call={call}
            onDone={() => {
              onOpenChange(false);
              onSaved?.();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DispositionForm({ call, onDone }: { call: PhoneCall; onDone: () => void }) {
  const [selected, setSelected] = useState<Disposition | null>(call.disposition);
  const [callbackAt, setCallbackAt] = useState('');
  const [note, setNote] = useState(call.dispositionNote ?? '');
  const [minDate] = useState(nowForInput);
  const [saving, setSaving] = useState(false);

  const selectedOption = DISPOSITION_OPTIONS.find((o) => o.value === selected) ?? null;
  const needsDate = !!selectedOption?.needsDate;
  const callbackIso = needsDate ? localInputToIso(callbackAt) : null;
  const dateMissing = needsDate && !callbackIso;
  const canSave = !!selected && !dateMissing && !saving;
  const leadName = call.leadName?.trim() || 'Contato sem nome';

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await telephonyService.setDisposition(call.id, {
        result: selected,
        note: note.trim() || undefined,
        callbackAt: callbackIso ?? undefined,
      });
      toast.success('Resultado salvo.');
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o resultado.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <DialogHeader className="space-y-3 border-b border-slate-200 px-5 pb-4 pt-6 text-left">
        <DialogTitle className="text-lg">Resultado da ligação</DialogTitle>
        <DialogDescription asChild>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-base font-semibold text-slate-900">{leadName}</p>
            <p className="truncate text-sm text-slate-600">{call.phone}</p>
            <p className="mt-1 text-xs text-slate-500">{CALL_STATUS_LABEL[call.status]}</p>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 px-5 py-5">
        <div className="grid grid-cols-2 gap-2.5">
          {DISPOSITION_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(option.value)}
                className={cn(
                  'relative flex min-h-[3.25rem] items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors active:scale-[0.98]',
                  isSelected
                    ? 'border-[#0076FF] bg-[#0076FF] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                )}
              >
                {isSelected && <Check className="absolute left-2 top-2 h-3.5 w-3.5" />}
                {option.label}
              </button>
            );
          })}
        </div>

        {needsDate && selectedOption && (
          <div className="space-y-2">
            <Label htmlFor="disposition-callback" className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-[#0076FF]" />
              {selectedOption.value === 'MEETING' ? 'Data e hora da reunião' : 'Data e hora do retorno'}
            </Label>
            <input
              id="disposition-callback"
              type="datetime-local"
              min={minDate}
              value={callbackAt}
              onChange={(e) => setCallbackAt(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0076FF]/40"
            />
            {dateMissing && <p className="text-xs text-slate-500">Informe a data e a hora para continuar.</p>}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="disposition-note" className="text-sm font-medium">
              Observação <span className="font-normal text-slate-500">(opcional)</span>
            </Label>
            <span className="text-xs text-slate-500">
              {note.length}/{NOTE_MAX}
            </span>
          </div>
          <Textarea
            id="disposition-note"
            value={note}
            maxLength={NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: pediu proposta por WhatsApp, decide na sexta"
            className="min-h-[96px] rounded-xl text-base"
          />
        </div>

        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={!canSave}
          onClick={() => void save()}
        >
          {saving ? 'Salvando…' : 'Salvar resultado'}
        </Button>
      </div>
    </div>
  );
}
