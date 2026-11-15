'use client';

import { useId, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDay, getErrorMessage } from '@/components/atendimento/helpers';
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
import {
  PROPOSAL_STATUS_LABEL,
  formatCents,
  parseMoneyToCents,
  salesCopilotApi,
  type Offer,
  type Proposal,
  type ProposalInput,
  type ProposalItem,
  type ProposalStatus,
} from '@/services/sales-copilot';

export const PROPOSALS_QUERY_KEY = ['crm-sales', 'proposals'] as const;
export const PROPOSAL_QUERY_KEY = ['crm-sales', 'proposal'] as const;
export const OFFERS_QUERY_KEY = ['crm-sales', 'offers', 'active'] as const;

export const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50';

export const MAX_PROPOSAL_ITEMS = 50;
const MAX_QUANTITY = 100000;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CONDITIONS_LENGTH = 8000;
const LOCKED_STATUSES: readonly ProposalStatus[] = ['ACCEPTED', 'REJECTED', 'EXPIRED'];

/** Quantidade digitada (aceita virgula, ate 2 casas). Null quando invalida. */
export function parseQuantity(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return quantity > 0 && quantity <= MAX_QUANTITY ? quantity : null;
}

/** Mesma regra do servidor: round(quantidade x valor unitario em centavos). */
export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  return Math.round(quantity * unitPriceCents);
}

/** Mesma regra do servidor: subtotal = soma das linhas; total = max(0, subtotal - desconto). */
export function computeTotals(
  items: ReadonlyArray<{ quantity: number; unitPriceCents: number }>,
  discountCents: number,
): { subtotalCents: number; totalCents: number } {
  const subtotalCents = items.reduce((sum, item) => sum + lineTotalCents(item.quantity, item.unitPriceCents), 0);
  return { subtotalCents, totalCents: Math.max(0, subtotalCents - discountCents) };
}

/** Data YYYY-MM-DD exibida sem deslocamento de fuso. */
export function formatValidUntil(value: string | null | undefined): string {
  if (!value) return '-';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : formatDay(value);
}

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

interface EditorLine {
  key: number;
  offerId: number | null;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface FormState {
  title: string;
  validUntil: string;
  discount: string;
  scope: string;
  conditions: string;
  items: EditorLine[];
}

interface LineErrors {
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

interface FormErrors {
  title?: string;
  items?: string;
  discount?: string;
  conditions?: string;
  lines: Partial<Record<number, LineErrors>>;
}

let lineSequence = 0;

function createLine(seed: Partial<Omit<EditorLine, 'key'>> = {}): EditorLine {
  lineSequence += 1;
  return { key: lineSequence, offerId: null, description: '', quantity: '1', unitPrice: '', ...seed };
}

function initialFormState(proposal: Proposal | null): FormState {
  if (!proposal) {
    return { title: '', validUntil: '', discount: '', scope: '', conditions: '', items: [createLine()] };
  }
  return {
    title: proposal.title,
    validUntil: proposal.validUntil ?? '',
    discount: proposal.discountCents > 0 ? centsToInput(proposal.discountCents) : '',
    scope: proposal.scope ?? '',
    conditions: proposal.conditions ?? '',
    items: proposal.items.map((item) =>
      createLine({
        offerId: item.offerId ?? null,
        description: item.description,
        quantity: String(item.quantity).replace('.', ','),
        unitPrice: centsToInput(item.unitPriceCents),
      }),
    ),
  };
}

interface BuildResult {
  input: ProposalInput | null;
  errors: FormErrors;
  messages: string[];
}

/** Valida o formulario como o servidor espera. input null quando ha erro. */
function buildProposalInput(form: FormState): BuildResult {
  const errors: FormErrors = { lines: {} };
  const messages: string[] = [];

  const title = form.title.trim();
  if (!title) errors.title = 'Informe o título da proposta.';
  else if (title.length > MAX_TITLE_LENGTH) errors.title = `O título pode ter até ${MAX_TITLE_LENGTH} caracteres.`;
  if (errors.title) messages.push(errors.title);

  const conditions = form.conditions.trim();
  if (conditions.length > MAX_CONDITIONS_LENGTH) {
    errors.conditions = `As condições podem ter até ${MAX_CONDITIONS_LENGTH} caracteres.`;
    messages.push(errors.conditions);
  }

  const items: ProposalItem[] = [];
  let subtotalCents = 0;
  let hasLineErrors = false;

  form.items.forEach((line, index) => {
    const description = line.description.trim();
    const quantity = parseQuantity(line.quantity);
    const unitPriceCents = parseMoneyToCents(line.unitPrice);
    const lineErrors: LineErrors = {};

    if (!description) lineErrors.description = 'Informe a descrição do item.';
    else if (description.length > MAX_DESCRIPTION_LENGTH) {
      lineErrors.description = `A descrição pode ter até ${MAX_DESCRIPTION_LENGTH} caracteres.`;
    }
    if (quantity === null) lineErrors.quantity = 'Quantidade inválida (use de 0,01 a 100.000, até 2 casas).';
    if (unitPriceCents === null) lineErrors.unitPrice = 'Informe o valor unitário em R$.';

    const lineMessages = [lineErrors.description, lineErrors.quantity, lineErrors.unitPrice].filter(
      (message): message is string => Boolean(message),
    );
    if (lineMessages.length > 0 || quantity === null || unitPriceCents === null) {
      hasLineErrors = true;
      errors.lines[line.key] = lineErrors;
      messages.push(...lineMessages.map((message) => `Item ${index + 1}: ${message}`));
      return;
    }

    items.push({ offerId: line.offerId, description, quantity, unitPriceCents });
    subtotalCents += lineTotalCents(quantity, unitPriceCents);
  });

  if (form.items.length === 0 || form.items.length > MAX_PROPOSAL_ITEMS) {
    errors.items = `A proposta precisa de 1 a ${MAX_PROPOSAL_ITEMS} itens.`;
  } else if (!form.items.some((line) => line.description.trim())) {
    errors.items = 'Informe ao menos um item com descrição.';
  }
  if (errors.items) messages.push(errors.items);

  let discountCents = 0;
  if (form.discount.trim()) {
    const parsed = parseMoneyToCents(form.discount);
    if (parsed === null) errors.discount = 'Informe um desconto válido em R$.';
    else if (parsed > subtotalCents) {
      errors.discount = `O desconto não pode ser maior que o subtotal (${formatCents(subtotalCents)}).`;
    } else discountCents = parsed;
  }
  if (errors.discount) messages.push(errors.discount);

  const hasErrors = messages.length > 0 || hasLineErrors;
  const input: ProposalInput | null = hasErrors
    ? null
    : {
        title,
        scope: form.scope.trim() || null,
        conditions: conditions || null,
        items,
        discountCents,
        validUntil: form.validUntil || null,
      };

  return { input, errors, messages };
}

export interface ProposalEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
  proposal?: Proposal | null;
  onSaved?: (proposal: Proposal) => void;
}

/** Criar ou editar proposta. Propostas aceitas, recusadas ou expiradas ficam somente leitura. */
export function ProposalEditorDialog({ open, onOpenChange, leadId, proposal, onSaved }: ProposalEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <ProposalEditorForm
          key={proposal?.id ?? 'new'}
          leadId={leadId}
          proposal={proposal ?? null}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ProposalEditorFormProps {
  leadId: number;
  proposal: Proposal | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (proposal: Proposal) => void;
}

function ProposalEditorForm({ leadId, proposal, onOpenChange, onSaved }: ProposalEditorFormProps) {
  const formId = useId();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => initialFormState(proposal));
  const [errors, setErrors] = useState<FormErrors>({ lines: {} });
  const [messages, setMessages] = useState<string[]>([]);

  const offersQuery = useQuery({
    queryKey: OFFERS_QUERY_KEY,
    queryFn: () => salesCopilotApi.listOffers(false),
  });
  const offers: Offer[] = offersQuery.data ?? [];

  const locked = proposal ? LOCKED_STATUSES.includes(proposal.status) : false;

  const saveMutation = useMutation({
    mutationFn: (input: ProposalInput) =>
      proposal
        ? salesCopilotApi.updateProposal(proposal.id, input)
        : salesCopilotApi.createProposal(leadId, input),
    onSuccess: (saved) => {
      toast.success(proposal ? 'Proposta atualizada.' : 'Proposta criada como rascunho.');
      void queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEY });
      onSaved?.(saved);
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível salvar a proposta.')),
  });
  const saving = saveMutation.isPending;

  const patch = (partial: Partial<FormState>) => setForm((prev) => ({ ...prev, ...partial }));

  const patchLine = (key: number, partial: Partial<EditorLine>) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((line) => (line.key === key ? { ...line, ...partial } : line)),
    }));

  const applyOffer = (key: number, value: string) => {
    const offer = offers.find((item) => String(item.id) === value);
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((line) => {
        if (line.key !== key) return line;
        if (!offer) return { ...line, offerId: null };
        return {
          ...line,
          offerId: offer.id,
          description: offer.name,
          unitPrice: offer.defaultPriceCents !== null ? centsToInput(offer.defaultPriceCents) : line.unitPrice,
        };
      }),
    }));
  };

  const addLine = () =>
    setForm((prev) =>
      prev.items.length >= MAX_PROPOSAL_ITEMS ? prev : { ...prev, items: [...prev.items, createLine()] },
    );

  const removeLine = (key: number) =>
    setForm((prev) =>
      prev.items.length <= 1 ? prev : { ...prev, items: prev.items.filter((line) => line.key !== key) },
    );

  const lineValues = form.items.map((line) => ({
    quantity: parseQuantity(line.quantity),
    unitPriceCents: parseMoneyToCents(line.unitPrice),
  }));
  const completeLines = lineValues.flatMap(({ quantity, unitPriceCents }) =>
    quantity !== null && unitPriceCents !== null ? [{ quantity, unitPriceCents }] : [],
  );
  const hasIncompleteLines = completeLines.length !== form.items.length;
  const discountCents = (form.discount.trim() ? parseMoneyToCents(form.discount) : 0) ?? 0;
  const totals = computeTotals(completeLines, discountCents);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked || saving) return;
    const result = buildProposalInput(form);
    setErrors(result.errors);
    setMessages(result.messages);
    if (!result.input) return;
    saveMutation.mutate(result.input);
  };

  const titleId = `${formId}-title`;
  const validUntilId = `${formId}-valid-until`;
  const discountId = `${formId}-discount`;
  const scopeId = `${formId}-scope`;
  const conditionsId = `${formId}-conditions`;
  const itemsTitleId = `${formId}-items-title`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <DialogHeader>
        <DialogTitle>{proposal ? `Editar proposta${proposal.number ? ` ${proposal.number}` : ''}` : 'Nova proposta'}</DialogTitle>
        <DialogDescription>
          {proposal
            ? `${proposal.lead.name}${proposal.lead.company ? ` · ${proposal.lead.company}` : ''}`
            : 'A proposta começa como rascunho e pode ser enviada por e-mail depois.'}
        </DialogDescription>
      </DialogHeader>

      {locked && proposal && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning p-3 text-sm text-warning-foreground"
        >
          <Lock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Propostas {PROPOSAL_STATUS_LABEL[proposal.status].toLowerCase()} não podem ser editadas. Para alterar,
            volte a proposta para rascunho pela lista.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div role="alert" className="rounded-lg border border-danger-border bg-danger p-3 text-sm text-danger-foreground">
          <p className="font-medium">Revise os campos destacados:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {messages.map((message, index) => (
              <li key={`${index}-${message}`}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset disabled={locked || saving} className="min-w-0 space-y-5 border-0 p-0">
        <div className="space-y-1.5">
          <Label htmlFor={titleId}>
            Título <span className="text-danger-foreground" aria-hidden>*</span>
          </Label>
          <Input
            id={titleId}
            value={form.title}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="Ex.: Proposta de gestão de tráfego pago"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            onChange={(event) => patch({ title: event.target.value })}
          />
          {errors.title && (
            <p id={`${titleId}-error`} className="text-xs text-danger-foreground">
              {errors.title}
            </p>
          )}
        </div>

        <section aria-labelledby={itemsTitleId} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 id={itemsTitleId} className="text-sm font-semibold text-foreground">
              Itens
            </h3>
            <span className="text-xs text-muted-foreground">
              {form.items.length}/{MAX_PROPOSAL_ITEMS}
            </span>
          </div>

          <ul className="space-y-3">
            {form.items.map((line, index) => {
              const lineErrors: LineErrors = errors.lines[line.key] ?? {};
              const idBase = `${formId}-line-${line.key}`;
              const values = lineValues[index];
              const lineCents =
                values && values.quantity !== null && values.unitPriceCents !== null
                  ? Math.round(values.quantity * values.unitPriceCents)
                  : null;
              return (
                <li key={line.key} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-12">
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor={`${idBase}-offer`}>Oferta do catálogo</Label>
                    <select
                      id={`${idBase}-offer`}
                      className={SELECT_CLASS}
                      value={line.offerId ?? ''}
                      disabled={offersQuery.isError}
                      onChange={(event) => applyOffer(line.key, event.target.value)}
                    >
                      <option value="">Sem oferta</option>
                      {offers.map((offer) => (
                        <option key={offer.id} value={offer.id}>
                          {offer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-4">
                    <Label htmlFor={`${idBase}-description`}>
                      Descrição <span className="text-danger-foreground" aria-hidden>*</span>
                    </Label>
                    <Input
                      id={`${idBase}-description`}
                      value={line.description}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      aria-invalid={Boolean(lineErrors.description)}
                      aria-describedby={lineErrors.description ? `${idBase}-description-error` : undefined}
                      onChange={(event) => patchLine(line.key, { description: event.target.value })}
                    />
                    {lineErrors.description && (
                      <p id={`${idBase}-description-error`} className="text-xs text-danger-foreground">
                        {lineErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`${idBase}-quantity`}>Quantidade</Label>
                    <Input
                      id={`${idBase}-quantity`}
                      inputMode="decimal"
                      value={line.quantity}
                      aria-invalid={Boolean(lineErrors.quantity)}
                      aria-describedby={lineErrors.quantity ? `${idBase}-quantity-error` : undefined}
                      onChange={(event) => patchLine(line.key, { quantity: event.target.value })}
                    />
                    {lineErrors.quantity && (
                      <p id={`${idBase}-quantity-error`} className="text-xs text-danger-foreground">
                        {lineErrors.quantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`${idBase}-unit-price`}>Valor unit. (R$)</Label>
                    <Input
                      id={`${idBase}-unit-price`}
                      inputMode="decimal"
                      placeholder="0,00"
                      value={line.unitPrice}
                      aria-invalid={Boolean(lineErrors.unitPrice)}
                      aria-describedby={lineErrors.unitPrice ? `${idBase}-unit-price-error` : undefined}
                      onChange={(event) => patchLine(line.key, { unitPrice: event.target.value })}
                    />
                    {lineErrors.unitPrice && (
                      <p id={`${idBase}-unit-price-error`} className="text-xs text-danger-foreground">
                        {lineErrors.unitPrice}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2 sm:col-span-1 sm:justify-center">
                    <span className="text-xs text-muted-foreground sm:hidden">Remover item</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover item ${index + 1}`}
                      disabled={form.items.length <= 1}
                      onClick={() => removeLine(line.key)}
                    >
                      <Trash2 aria-hidden className="h-4 w-4 text-danger-foreground" />
                    </Button>
                  </div>

                  <p className="text-right text-xs text-muted-foreground sm:col-span-12">
                    Total do item:{' '}
                    <span className="font-medium tabular-nums text-foreground">
                      {lineCents === null ? '-' : formatCents(lineCents)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>

          {errors.items && (
            <p className="text-xs text-danger-foreground" role="alert">
              {errors.items}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLine}
            disabled={form.items.length >= MAX_PROPOSAL_ITEMS}
          >
            <Plus aria-hidden className="mr-1.5 h-4 w-4" />
            Adicionar item
          </Button>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={discountId}>Desconto (R$)</Label>
            <Input
              id={discountId}
              inputMode="decimal"
              placeholder="0,00"
              value={form.discount}
              aria-invalid={Boolean(errors.discount)}
              aria-describedby={errors.discount ? `${discountId}-error` : undefined}
              onChange={(event) => patch({ discount: event.target.value })}
            />
            {errors.discount && (
              <p id={`${discountId}-error`} className="text-xs text-danger-foreground">
                {errors.discount}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={validUntilId}>Válida até</Label>
            <Input
              id={validUntilId}
              type="date"
              value={form.validUntil}
              onChange={(event) => patch({ validUntil: event.target.value })}
            />
          </div>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 rounded-xl bg-muted p-4 text-sm" aria-live="polite">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCents(totals.subtotalCents)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Desconto</span>
            <span className="tabular-nums">- {formatCents(discountCents)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCents(totals.totalCents)}</span>
          </div>
          {hasIncompleteLines && (
            <p className="text-xs text-warning-foreground">
              Linhas com quantidade ou valor incompletos não entram no cálculo até serem corrigidas.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={scopeId}>Escopo</Label>
          <Textarea
            id={scopeId}
            rows={4}
            value={form.scope}
            placeholder="Descreva o que será entregue."
            onChange={(event) => patch({ scope: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={conditionsId}>Condições comerciais</Label>
          <Textarea
            id={conditionsId}
            rows={4}
            value={form.conditions}
            maxLength={MAX_CONDITIONS_LENGTH}
            placeholder="Forma de pagamento, prazos, garantias."
            aria-invalid={Boolean(errors.conditions)}
            aria-describedby={errors.conditions ? `${conditionsId}-error` : undefined}
            onChange={(event) => patch({ conditions: event.target.value })}
          />
          {errors.conditions && (
            <p id={`${conditionsId}-error`} className="text-xs text-danger-foreground">
              {errors.conditions}
            </p>
          )}
        </div>
      </fieldset>

      <DialogFooter className="gap-2 sm:justify-between">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={locked || saving}>
          {saving ? <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : proposal ? 'Salvar alterações' : 'Criar proposta'}
        </Button>
      </DialogFooter>
    </form>
  );
}
