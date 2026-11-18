'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Loader2, Pencil, Plus, Power, PowerOff, Save, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/atendimento/helpers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getStoredUser, isSupervisorRole } from '@/services/crm-leads';
import {
  formatCents,
  parseMoneyToCents,
  salesCopilotApi,
  type Offer,
  type OfferInput,
} from '@/services/sales-copilot';

const TEXT_MAX = 4000;

interface OfferFormState {
  name: string;
  need: string;
  expectedResult: string;
  description: string;
  price: string;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toForm(offer: Offer | null): OfferFormState {
  return {
    name: offer?.name ?? '',
    need: offer?.need ?? '',
    expectedResult: offer?.expectedResult ?? '',
    description: offer?.description ?? '',
    price:
      offer?.defaultPriceCents === null || offer?.defaultPriceCents === undefined
        ? ''
        : (offer.defaultPriceCents / 100).toFixed(2).replace('.', ','),
  };
}

function OfferDialog({
  open,
  onOpenChange,
  offer,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Offer | null;
  onSaved: () => void;
}) {
  const idPrefix = useId();
  const [form, setForm] = useState<OfferFormState>(() => toForm(offer));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(toForm(offer));
    setError(null);
  }, [open, offer]);

  const update = (key: keyof OfferFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const save = async () => {
    if (saving) return;
    const name = form.name.trim();
    if (!name) {
      setError('Informe o nome da oferta.');
      return;
    }
    if (name.length > 160) {
      setError('O nome da oferta deve ter no máximo 160 caracteres.');
      return;
    }
    let defaultPriceCents: number | null = null;
    if (form.price.trim()) {
      defaultPriceCents = parseMoneyToCents(form.price);
      if (defaultPriceCents === null) {
        setError('Informe um preço padrão válido em reais, por exemplo 1.500,00.');
        return;
      }
    }

    const input: OfferInput = {
      name,
      need: form.need.trim() || null,
      expectedResult: form.expectedResult.trim() || null,
      description: form.description.trim() || null,
      defaultPriceCents,
    };

    setSaving(true);
    setError(null);
    try {
      if (offer) {
        await salesCopilotApi.updateOffer(offer.id, input);
        toast.success('Oferta atualizada.');
      } else {
        await salesCopilotApi.createOffer(input);
        toast.success('Oferta criada.');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message = errorMessage(err, 'Não foi possível salvar a oferta.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{offer ? 'Editar oferta' : 'Nova oferta'}</DialogTitle>
          <DialogDescription>Ao escolher a oferta em uma proposta, o item recebe o nome e o preço padrão cadastrados.</DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="rounded-lg border border-danger-border bg-danger p-3 text-sm text-danger-foreground">
            {error}
          </p>
        )}

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-name`}>Nome da oferta (obrigatório)</Label>
            <Input
              id={`${idPrefix}-name`}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              maxLength={160}
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-need`}>Necessidade do cliente</Label>
            <Textarea
              id={`${idPrefix}-need`}
              rows={2}
              value={form.need}
              onChange={(event) => update('need', event.target.value)}
              maxLength={TEXT_MAX}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-expected`}>Resultado esperado</Label>
            <Textarea
              id={`${idPrefix}-expected`}
              rows={2}
              value={form.expectedResult}
              onChange={(event) => update('expectedResult', event.target.value)}
              maxLength={TEXT_MAX}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-description`}>Descrição da oferta</Label>
            <Textarea
              id={`${idPrefix}-description`}
              rows={4}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              maxLength={TEXT_MAX}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-price`}>Preço padrão (R$)</Label>
            <Input
              id={`${idPrefix}-price`}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">Você pode ajustar esse valor ao montar a proposta.</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar oferta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OfertasPage() {
  const [supervisor, setSupervisor] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setSupervisor(isSupervisorRole(getStoredUser()?.role));
  }, []);

  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    salesCopilotApi
      .listOffers(supervisor && includeInactive)
      .then((items) => {
        if (active) setOffers(items);
      })
      .catch((err: unknown) => {
        if (active) setError(errorMessage(err, 'Não foi possível carregar as ofertas.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [includeInactive, supervisor, reloadToken]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setDialogOpen(true);
  };

  const toggleActive = async (offer: Offer) => {
    if (offer.isActive) {
      const confirmed = window.confirm(`Desativar a oferta "${offer.name}"? Ela sai da lista de ofertas ativas e pode ser reativada depois.`);
      if (!confirmed) return;
    }
    setBusyId(offer.id);
    try {
      if (offer.isActive) {
        await salesCopilotApi.deactivateOffer(offer.id);
        toast.success('Oferta desativada.');
      } else {
        await salesCopilotApi.updateOffer(offer.id, { isActive: true });
        toast.success('Oferta reativada.');
      }
      reload();
    } catch (err) {
      toast.error(errorMessage(err, offer.isActive ? 'Não foi possível desativar a oferta.' : 'Não foi possível reativar a oferta.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Catálogo de ofertas"
        description="Padronize os itens que sua equipe usa nas propostas. Cada oferta pode ter uma descrição e um preço sugerido."
        icon={<Tags className="h-6 w-6 shrink-0 text-link" aria-hidden />}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/crm/propostas"><ArrowLeft aria-hidden className="h-4 w-4" />Propostas</Link>
            </Button>
            {supervisor && (
              <Button onClick={openCreate}><Plus aria-hidden className="h-4 w-4" />Nova oferta</Button>
            )}
          </>
        }
      />

      {supervisor ? (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
          />
          Mostrar inativas
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">Somente leitura. Supervisores editam o catálogo.</p>
      )}

      {loading ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-6 w-6 animate-spin text-link" aria-label="Carregando ofertas" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-danger-border bg-danger p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-danger-foreground" aria-hidden />
          <p className="text-sm text-danger-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center">
          <Tags className="h-8 w-8 text-muted-foreground/80" aria-hidden />
          <p className="font-medium text-foreground">
            {includeInactive ? 'Nenhuma oferta cadastrada' : 'Nenhuma oferta ativa'}
          </p>
          <p className="text-sm text-muted-foreground">
            {supervisor ? 'Crie a primeira oferta para usar nas propostas.' : 'Peça a um supervisor para cadastrar ofertas.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card shadow-md shadow-slate-200/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Necessidade</TableHead>
                <TableHead>Resultado esperado</TableHead>
                <TableHead className="text-right">Preço padrão</TableHead>
                <TableHead>Ativa</TableHead>
                {supervisor && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id} className={offer.isActive ? '' : 'text-muted-foreground'}>
                  <TableCell className="min-w-40 font-medium">{offer.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-2 whitespace-pre-wrap">{offer.need || '—'}</span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-2 whitespace-pre-wrap">{offer.expectedResult || '—'}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums">{formatCents(offer.defaultPriceCents)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${offer.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {offer.isActive ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  {supervisor && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(offer)} disabled={busyId === offer.id}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void toggleActive(offer)}
                          disabled={busyId === offer.id}
                          className={offer.isActive ? 'text-danger-foreground hover:bg-danger hover:text-danger-foreground' : 'text-success-foreground hover:bg-success hover:text-success-foreground'}
                        >
                          {offer.isActive ? <PowerOff className="mr-1.5 h-3.5 w-3.5" aria-hidden /> : <Power className="mr-1.5 h-3.5 w-3.5" aria-hidden />}
                          {offer.isActive ? 'Desativar' : 'Reativar'}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {supervisor && (
        <OfferDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offer={editing}
          onSaved={reload}
        />
      )}
    </div>
  );
}
