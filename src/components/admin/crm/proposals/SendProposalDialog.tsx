'use client';

import { useId, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail } from '@/components/admin/crm/format';
import { getErrorMessage } from '@/components/atendimento/helpers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCents, salesCopilotApi, type Proposal, type SendProposalResult } from '@/services/sales-copilot';
import { PROPOSALS_QUERY_KEY, PROPOSAL_QUERY_KEY } from './ProposalEditorDialog';

const MAX_MESSAGE_LENGTH = 4000;

export interface SendProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  onSent?: (result: SendProposalResult) => void;
}

/** Envia a proposta por e-mail. Se o envio falhar, o motivo aparece e o dialogo continua aberto. */
export function SendProposalDialog({ open, onOpenChange, proposal, onSent }: SendProposalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <SendProposalForm proposal={proposal} onOpenChange={onOpenChange} onSent={onSent} />
      </DialogContent>
    </Dialog>
  );
}

interface SendProposalFormProps {
  proposal: Proposal;
  onOpenChange: (open: boolean) => void;
  onSent?: (result: SendProposalResult) => void;
}

function SendProposalForm({ proposal, onOpenChange, onSent }: SendProposalFormProps) {
  const formId = useId();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(proposal.lead.email ?? '');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [failure, setFailure] = useState<string | null>(null);

  const sendMutation = useMutation({
    mutationFn: (input: { recipientEmail: string; message?: string }) =>
      salesCopilotApi.sendProposal(proposal.id, input),
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEY });
      if (result.sent) {
        toast.success(`Proposta enviada para ${variables.recipientEmail}.`);
        onSent?.(result);
        onOpenChange(false);
        return;
      }
      setFailure(result.error || 'Não foi possível enviar o e-mail. Tente novamente.');
    },
    onError: (error) => {
      setFailure(getErrorMessage(error, 'Não foi possível enviar a proposta.'));
    },
  });
  const sending = sendMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const recipient = email.trim();
    if (!recipient) {
      setEmailError('Informe o e-mail do destinatário.');
      return;
    }
    if (!isValidEmail(recipient)) {
      setEmailError('Informe um e-mail válido.');
      return;
    }
    setEmailError(undefined);
    setFailure(null);
    const trimmedMessage = message.trim();
    sendMutation.mutate({ recipientEmail: recipient, message: trimmedMessage || undefined });
  };

  const emailId = `${formId}-email`;
  const emailErrorId = `${formId}-email-error`;
  const messageId = `${formId}-message`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Send aria-hidden className="h-5 w-5 text-link" />
          Enviar proposta por e-mail
        </DialogTitle>
        <DialogDescription>
          {proposal.number ? `${proposal.number} · ` : ''}
          {proposal.title} · total {formatCents(proposal.totalCents)}
        </DialogDescription>
      </DialogHeader>

      {failure && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning p-3 text-sm text-warning-foreground"
        >
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{failure}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={emailId}>
          E-mail do destinatário <span className="text-danger-foreground" aria-hidden>*</span>
        </Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          disabled={sending}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? emailErrorId : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
        {emailError && (
          <p id={emailErrorId} className="text-xs text-danger-foreground">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={messageId}>Mensagem (opcional)</Label>
        <Textarea
          id={messageId}
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          disabled={sending}
          placeholder="Ex.: Segue a proposta conforme conversamos."
          onChange={(event) => setMessage(event.target.value)}
        />
        <p className="text-right text-xs text-muted-foreground">
          {message.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={sending}>
          {sending ? <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" /> : <Send aria-hidden className="mr-1.5 h-4 w-4" />}
          {sending ? 'Enviando...' : 'Enviar proposta'}
        </Button>
      </DialogFooter>
    </form>
  );
}
