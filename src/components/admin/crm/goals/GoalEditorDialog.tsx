'use client';

import { useEffect, useId, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseMoneyToCents, salesCopilotApi, type Goal, type GoalInput, type GoalTargets } from '@/services/sales-copilot';

interface GoalEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** YYYY-MM */
  month: string;
  /** null = meta da equipe. */
  userId: number | null;
  userName: string;
  goal: Goal | null;
  onSaved?: (goal: Goal) => void;
}

type CountField = Exclude<keyof GoalTargets, 'revenueTargetCents'>;

interface FormState {
  callsTarget: string;
  connectedTarget: string;
  meetingsTarget: string;
  proposalsTarget: string;
  wonTarget: string;
  revenueTarget: string;
}

type ParseResult = { ok: true; value: number | null } | { ok: false };

const COUNT_FIELDS: Array<{ key: CountField; label: string }> = [
  { key: 'callsTarget', label: 'Ligações' },
  { key: 'connectedTarget', label: 'Atendidas' },
  { key: 'meetingsTarget', label: 'Reuniões' },
  { key: 'proposalsTarget', label: 'Propostas enviadas' },
  { key: 'wonTarget', label: 'Vendas' },
];

const MAX_COUNT = 2_000_000_000;

function toFormState(goal: Goal | null): FormState {
  const count = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
  const revenue = goal?.revenueTargetCents;
  return {
    callsTarget: count(goal?.callsTarget),
    connectedTarget: count(goal?.connectedTarget),
    meetingsTarget: count(goal?.meetingsTarget),
    proposalsTarget: count(goal?.proposalsTarget),
    wonTarget: count(goal?.wonTarget),
    revenueTarget: revenue === null || revenue === undefined ? '' : (revenue / 100).toFixed(2).replace('.', ','),
  };
}

function parseCount(value: string): ParseResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\d+$/.test(trimmed)) return { ok: false };
  const number = Number(trimmed);
  if (!Number.isSafeInteger(number) || number > MAX_COUNT) return { ok: false };
  return { ok: true, value: number };
}

function parseRevenue(value: string): ParseResult {
  if (!value.trim()) return { ok: true, value: null };
  const cents = parseMoneyToCents(value);
  return cents === null ? { ok: false } : { ok: true, value: cents };
}

export function GoalEditorDialog({ open, onOpenChange, month, userId, userName, goal, onSaved }: GoalEditorDialogProps) {
  const idPrefix = useId();
  const [form, setForm] = useState<FormState>(() => toFormState(goal));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recarrega os valores sempre que o dialogo abre (ou muda de alvo).
  useEffect(() => {
    if (!open) return;
    setForm(toFormState(goal));
    setError(null);
  }, [open, goal, month, userId]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const save = async () => {
    if (saving) return;
    const parsed: Partial<Record<CountField, number | null>> = {};
    for (const field of COUNT_FIELDS) {
      const result = parseCount(form[field.key]);
      if (!result.ok) {
        setError(`Informe um número inteiro válido em "${field.label}".`);
        return;
      }
      parsed[field.key] = result.value;
    }
    const revenue = parseRevenue(form.revenueTarget);
    if (!revenue.ok) {
      setError('Informe um valor válido em "Receita (R$)".');
      return;
    }

    const input: GoalInput = {
      month,
      userId,
      callsTarget: parsed.callsTarget ?? null,
      connectedTarget: parsed.connectedTarget ?? null,
      meetingsTarget: parsed.meetingsTarget ?? null,
      proposalsTarget: parsed.proposalsTarget ?? null,
      wonTarget: parsed.wonTarget ?? null,
      revenueTargetCents: revenue.value,
    };

    setSaving(true);
    setError(null);
    try {
      const saved = await salesCopilotApi.saveGoal(input);
      toast.success(userId === null ? 'Meta da equipe salva.' : `Meta de ${userName} salva.`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível salvar a meta.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const title = userId === null ? 'Meta da equipe' : `Meta de ${userName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Mês de referência: {month}. Deixe o campo em branco para não definir meta.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {COUNT_FIELDS.map((field) => {
            const id = `${idPrefix}-${field.key}`;
            return (
              <div key={field.key} className="min-w-0 space-y-2">
                <Label htmlFor={id}>{field.label}</Label>
                <Input
                  id={id}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  max={MAX_COUNT}
                  value={form[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  disabled={saving}
                  placeholder="Sem meta"
                />
              </div>
            );
          })}
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-revenue`}>Receita (R$)</Label>
            <Input
              id={`${idPrefix}-revenue`}
              type="text"
              inputMode="decimal"
              value={form.revenueTarget}
              onChange={(event) => updateField('revenueTarget', event.target.value)}
              disabled={saving}
              placeholder="0,00"
            />
          </div>

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
