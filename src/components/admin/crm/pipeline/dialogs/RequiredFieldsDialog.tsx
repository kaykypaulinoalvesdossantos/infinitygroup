'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TeamUser } from '@/services/crm-leads';
import { useLostReasons } from '../hooks/usePipelineData';
import { REQUIRED_FIELD_LABEL, type RequiredFieldValues } from '../hooks/requiredFields';
import { clearRequiredFields, useRequiredFieldsRequest } from '../hooks/requiredFieldsStore';

interface RequiredFieldsDialogProps {
  isSupervisor: boolean;
  owners: TeamUser[];
}

/**
 * Pede SO os campos que a etapa destino exige e o lead ainda nao tem (valor, previsao de fechamento,
 * responsavel, motivo de perda). Aberto pelo movimento (arraste, menu) ou por 400 `fields` do servidor.
 */
export function RequiredFieldsDialog({ isSupervisor, owners }: RequiredFieldsDialogProps) {
  const request = useRequiredFieldsRequest();
  const open = request !== null;
  const fields = request?.fields ?? [];
  const lostReasons = useLostReasons(false);
  const activeReasons = (lostReasons.data ?? []).filter((r) => r.active);

  const [amount, setAmount] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!request) return;
    setAmount(request.lead.value !== null && request.lead.value !== undefined ? String(request.lead.value) : '');
    setCloseDate(request.lead.expectedCloseAt ? request.lead.expectedCloseAt.slice(0, 10) : '');
    setOwnerId(request.lead.ownerId ? String(request.lead.ownerId) : '');
    setReasonId('');
    setNote('');
    setError(null);
  }, [request]);

  const close = () => clearRequiredFields();

  const submit = () => {
    if (!request) return;
    const values: RequiredFieldValues = {};
    const missing: string[] = [];

    if (fields.includes('amount')) {
      const parsed = Number(amount.replace(/\./g, '').replace(',', '.'));
      if (!amount.trim() || !Number.isFinite(parsed) || parsed < 0) missing.push('valor');
      else values.amount = parsed;
    }
    if (fields.includes('expectedCloseAt')) {
      if (!closeDate) missing.push('previsão de fechamento');
      else values.expectedCloseAt = new Date(`${closeDate}T12:00:00`).toISOString();
    }
    if (fields.includes('ownerId') && isSupervisor) {
      if (!ownerId) missing.push('responsável');
      else values.ownerId = Number(ownerId);
    }
    if (fields.includes('lostReason')) {
      if (!reasonId && !note.trim()) missing.push('motivo da perda');
      if (reasonId) values.lostReasonId = Number(reasonId);
      if (note.trim()) values.lostNote = note.trim();
    }

    if (missing.length > 0) {
      setError(`Preencha: ${missing.join(', ')}.`);
      return;
    }
    request.onConfirm(values);
    close();
  };

  const onlySupervisorOwner = fields.includes('ownerId') && !isSupervisor;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete os dados para continuar</DialogTitle>
          <DialogDescription>
            {request ? `Para mover ${request.lead.name} para ${request.stageName}, preencha:` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {fields.includes('amount') && (
            <div className="space-y-1.5">
              <Label htmlFor="rf-amount">{REQUIRED_FIELD_LABEL.amount}</Label>
              <Input id="rf-amount" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          )}

          {fields.includes('expectedCloseAt') && (
            <div className="space-y-1.5">
              <Label htmlFor="rf-close">{REQUIRED_FIELD_LABEL.expectedCloseAt}</Label>
              <Input id="rf-close" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
            </div>
          )}

          {fields.includes('ownerId') &&
            (onlySupervisorOwner ? (
              <p className="text-sm text-muted-foreground ">
                Este lead não tem responsável. Peça a um supervisor para definir antes de mover.
              </p>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="rf-owner">{REQUIRED_FIELD_LABEL.ownerId}</Label>
                <select
                  id="rf-owner"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm  "
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

          {fields.includes('lostReason') && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rf-reason">{REQUIRED_FIELD_LABEL.lostReason}</Label>
                <select
                  id="rf-reason"
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm  "
                  value={reasonId}
                  onChange={(e) => setReasonId(e.target.value)}
                >
                  <option value="">Selecione um motivo</option>
                  {activeReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rf-note">Observação (opcional)</Label>
                <Textarea id="rf-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger-foreground">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={onlySupervisorOwner}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
