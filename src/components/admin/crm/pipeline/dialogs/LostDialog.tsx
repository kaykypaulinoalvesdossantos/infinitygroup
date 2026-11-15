'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { LostReason, PipelineLead } from '@/services/crm-pipeline';

export interface LostOutcome {
  lostReasonId?: number;
  lostNote?: string;
}

interface LostDialogProps {
  open: boolean;
  lead: PipelineLead | null;
  reasons: LostReason[];
  reasonsLoading?: boolean;
  onCancel: () => void;
  onConfirm: (outcome: LostOutcome) => void;
  saving?: boolean;
}

/** Motivo de perda: escolher um motivo da lista ou escrever uma nota (ao menos um dos dois). */
export function LostDialog({ open, lead, reasons, reasonsLoading = false, onCancel, onConfirm, saving = false }: LostDialogProps) {
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setReasonId(null);
      setNote('');
    }
  }, [open]);

  const trimmed = note.trim();
  const valid = reasonId !== null || trimmed.length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar como perdido</DialogTitle>
          <DialogDescription>Escolha o motivo para {lead?.name ?? 'este lead'}. Assim o funil mostra por que negócios se perdem.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label id="lost-reason-label">Motivo da perda</Label>
            <div role="radiogroup" aria-labelledby="lost-reason-label" className="flex flex-wrap gap-2">
              {reasonsLoading && <span className="text-xs text-muted-foreground ">Carregando motivos…</span>}
              {reasons.map((reason) => {
                const checked = reasonId === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    disabled={saving}
                    onClick={() => setReasonId(checked ? null : reason.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] disabled:opacity-50',
                      checked
                        ? 'border-[hsl(var(--stage-lost))] bg-[hsl(var(--stage-lost)/0.12)] font-semibold text-[hsl(var(--stage-lost))]'
                        : 'border-input text-foreground hover:bg-muted   ',
                    )}
                  >
                    {reason.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost-note">Observação (opcional)</Label>
            <Textarea
              id="lost-note"
              rows={3}
              maxLength={255}
              placeholder="Ex.: pediu para retomar em março"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
            />
            {!valid && <p className="text-xs text-muted-foreground ">Escolha um motivo ou escreva uma observação para continuar.</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!valid || saving}
            onClick={() =>
              onConfirm({
                lostReasonId: reasonId ?? undefined,
                lostNote: trimmed || undefined,
              })
            }
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
