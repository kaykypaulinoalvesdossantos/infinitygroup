'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PipelineLead } from '@/services/crm-pipeline';

interface WonDialogProps {
  open: boolean;
  lead: PipelineLead | null;
  onCancel: () => void;
  /** Recebe o valor final do negocio (> 0). */
  onConfirm: (value: number) => void;
  saving?: boolean;
}

/** Converte texto digitado em pt-BR ("4.800,50" ou "4800.5") para numero. NaN se invalido. */
export function parseMoneyInput(raw: string): number {
  const normalized = raw.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return Number(normalized);
}

/** Pede o valor final antes de marcar o lead como ganho. Cancelar nao altera nada. */
export function WonDialog({ open, lead, onCancel, onConfirm, saving = false }: WonDialogProps) {
  const [text, setText] = useState('');

  // Pre-preenche com o valor ja salvo no lead sempre que um novo lead for aberto
  useEffect(() => {
    if (open) setText(lead?.value !== null && lead?.value !== undefined ? String(lead.value).replace('.', ',') : '');
  }, [open, lead]);

  const value = parseMoneyInput(text);
  const valid = Number.isFinite(value) && value > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar como ganho</DialogTitle>
          <DialogDescription>Confirme o valor fechado com {lead?.name ?? 'este lead'}. O valor é obrigatório.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !saving) onConfirm(value);
          }}
        >
          <Label htmlFor="won-value">Valor fechado (R$) *</Label>
          <Input
            id="won-value"
            inputMode="decimal"
            autoFocus
            placeholder="Ex.: 4800,00"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={saving}
            aria-invalid={text.length > 0 && !valid}
          />
          {text.length > 0 && !valid && <p className="text-xs text-danger-foreground">Informe um valor maior que zero.</p>}
          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid || saving} className="bg-[hsl(var(--stage-won))] text-white hover:bg-[hsl(var(--stage-won)/0.9)]">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar ganho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
