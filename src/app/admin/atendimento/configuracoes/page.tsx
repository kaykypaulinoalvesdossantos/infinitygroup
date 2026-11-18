'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Eye, Headset, Info, Pencil, Plus, Search, ShieldAlert, Smartphone, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { usePolling } from '@/hooks/use-polling';
import {
  DEVICE_MODE_LABEL,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Pill,
  SectionCard,
  formatDateTime,
  formatRelative,
  getErrorMessage,
  useNow,
} from '@/components/atendimento/helpers';
import { crmLeadsApi, teamApi, type TeamUser, LEAD_SOURCES, LEAD_STATUSES, getStoredUser, isSupervisorRole, type CrmLead } from '@/services/crm-leads';
import {
  telephonyService,
  type CampaignInput,
  type DialerCampaign,
  type TelephonyDevice,
} from '@/services/telephony';

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, s.title]));
const SOURCE_LABEL: Record<string, string> = Object.fromEntries(LEAD_SOURCES.map((s) => [s.id, s.label]));

interface CampaignForm {
  name: string;
  description: string;
  product: string;
  active: boolean;
  intervalSec: string;
  maxAttempts: string;
  retryAfterMin: string;
  statuses: string[];
  onlyNeverCalled: boolean;
  randomAssignment: boolean;
  sources: string[];
  windowEnabled: boolean;
  windowStart: string;
  windowEnd: string;
  weekdays: number[];
  dailyLimitPerUser: string;
}

const DEFAULT_FORM: CampaignForm = {
  name: '',
  description: '',
  product: 'GENERAL',
  active: true,
  intervalSec: '5',
  maxAttempts: '3',
  retryAfterMin: '1440',
  statuses: ['NEW'],
  onlyNeverCalled: true,
  randomAssignment: false,
  sources: [],
  windowEnabled: false,
  windowStart: '08:00',
  windowEnd: '18:00',
  weekdays: [1, 2, 3, 4, 5],
  dailyLimitPerUser: '200',
};

function formFromCampaign(campaign: DialerCampaign): CampaignForm {
  return {
    name: campaign.name,
    description: campaign.description ?? '',
    product: campaign.product ?? 'GENERAL',
    active: campaign.active,
    intervalSec: String(campaign.intervalSec),
    maxAttempts: String(campaign.maxAttempts),
    retryAfterMin: String(campaign.retryAfterMin),
    statuses: campaign.eligibility.statuses,
    onlyNeverCalled: campaign.eligibility.onlyNeverCalled,
    randomAssignment: !!campaign.eligibility.randomAssignment,
    sources: campaign.eligibility.sources ?? [],
    windowEnabled: !!campaign.callWindow,
    windowStart: campaign.callWindow?.start ?? '08:00',
    windowEnd: campaign.callWindow?.end ?? '18:00',
    weekdays: campaign.callWindow?.weekdays ?? [1, 2, 3, 4, 5],
    dailyLimitPerUser: String(campaign.dailyLimitPerUser),
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toInt(value: string): number {
  return /^\d+$/.test(value.trim()) ? Number(value) : NaN;
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** Valida o formulario e monta o body do contrato. Retorna a mensagem de erro quando invalido. */
function buildCampaignInput(
  form: CampaignForm,
  existing: DialerCampaign | null,
): { error: string } | { input: CampaignInput } {
  const name = form.name.trim();
  if (name.length < 1 || name.length > 120) return { error: 'Informe um nome com até 120 caracteres.' };
  if (form.description.trim().length > 500) return { error: 'A descrição pode ter até 500 caracteres.' };

  const intervalSec = toInt(form.intervalSec);
  if (!inRange(intervalSec, 3, 600)) return { error: 'O intervalo deve estar entre 3 e 600 segundos.' };

  const maxAttempts = toInt(form.maxAttempts);
  if (!inRange(maxAttempts, 1, 10)) return { error: 'O máximo de tentativas deve estar entre 1 e 10.' };

  const retryAfterMin = toInt(form.retryAfterMin);
  if (!inRange(retryAfterMin, 0, 10080)) return { error: 'O intervalo para nova tentativa deve estar entre 0 e 10080 minutos.' };

  if (form.statuses.length === 0) return { error: 'Escolha ao menos um status de lead.' };

  const dailyLimitPerUser = toInt(form.dailyLimitPerUser);
  if (!inRange(dailyLimitPerUser, 1, 2000)) return { error: 'O limite diário por vendedor deve estar entre 1 e 2000.' };

  let callWindow: CampaignInput['callWindow'] = null;
  if (form.windowEnabled) {
    if (!TIME_RE.test(form.windowStart) || !TIME_RE.test(form.windowEnd)) {
      return { error: 'Informe o horário de início e fim da janela.' };
    }
    if (form.windowStart >= form.windowEnd) return { error: 'O horário de início deve ser antes do horário de fim.' };
    if (form.weekdays.length === 0) return { error: 'Escolha ao menos um dia da semana para a janela.' };
    callWindow = {
      start: form.windowStart,
      end: form.windowEnd,
      weekdays: [...form.weekdays].sort((a, b) => a - b),
    };
  }

  return {
    input: {
      name,
      description: form.description.trim() || null,
      product: form.product,
      active: form.active,
      intervalSec,
      maxAttempts,
      retryAfterMin,
      eligibility: {
        statuses: form.statuses,
        onlyNeverCalled: form.onlyNeverCalled,
        randomAssignment: form.randomAssignment,
        // tagIds nao sao editados aqui: preservados ao salvar uma campanha existente.
        ...(form.sources.length > 0 ? { sources: form.sources } : {}),
        ...(existing?.eligibility.tagIds ? { tagIds: existing.eligibility.tagIds } : {}),
      },
      callWindow,
      dailyLimitPerUser,
    },
  };
}

function CampaignFormDialog({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: DialerCampaign | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CampaignForm>(() => (campaign ? formFromCampaign(campaign) : DEFAULT_FORM));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleIn = <T extends string | number>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const built = buildCampaignInput(form, campaign);
    if ('error' in built) {
      toast.error(built.error);
      return;
    }
    setSaving(true);
    try {
      if (campaign) {
        await telephonyService.updateCampaign(campaign.id, built.input);
        toast.success('Campanha atualizada');
      } else {
        await telephonyService.createCampaign(built.input);
        toast.success('Campanha criada');
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível salvar a campanha'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Editar campanha' : 'Nova campanha'}</DialogTitle>
          <DialogDescription>
            Defina quais leads entram na fila, o ritmo das ligações e quando elas podem acontecer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-name">Nome</Label>
              <Input id="c-name" value={form.name} maxLength={120} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-product">Produto</Label>
              <select
                id="c-product"
                value={form.product}
                onChange={(event) => update('product', event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="GENERAL">Geral</option>
                <option value="CRM_TELECOM">Infinity CRM Telecom</option>
                <option value="SYSTEMS">Sistemas</option>
                <option value="INSURE">Seguros</option>
                <option value="HEALTH">Saúde</option>
                <option value="SITES">Sites</option>
                <option value="AUTOMATION">Automação</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-desc">Descrição</Label>
              <Textarea id="c-desc" value={form.description} maxLength={500} rows={2} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="c-active" checked={form.active} onCheckedChange={(v) => update('active', v)} />
              <Label htmlFor="c-active">Campanha ativa</Label>
            </div>
          </div>

          <fieldset className="space-y-3 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Ritmo e tentativas</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="c-interval">Intervalo (s)</Label>
                <Input id="c-interval" type="number" min={3} max={600} value={form.intervalSec}
                  onChange={(e) => update('intervalSec', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-attempts">Máx. tentativas</Label>
                <Input id="c-attempts" type="number" min={1} max={10} value={form.maxAttempts}
                  onChange={(e) => update('maxAttempts', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-retry">Nova tentativa após (min)</Label>
                <Input id="c-retry" type="number" min={0} max={10080} value={form.retryAfterMin}
                  onChange={(e) => update('retryAfterMin', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-daily">Limite diário por vendedor</Label>
                <Input id="c-daily" type="number" min={1} max={2000} value={form.dailyLimitPerUser}
                  onChange={(e) => update('dailyLimitPerUser', e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Elegibilidade</legend>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status dos leads</p>
              <div className="flex flex-wrap gap-4">
                {LEAD_STATUSES.map((status) => (
                  <div key={status.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`c-status-${status.id}`}
                      checked={form.statuses.includes(status.id)}
                      onCheckedChange={() => update('statuses', toggleIn(form.statuses, status.id))}
                    />
                    <Label htmlFor={`c-status-${status.id}`}>{STATUS_LABEL[status.id] ?? status.title}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Origem (vazio = todas)</p>
              <div className="flex flex-wrap gap-4">
                {LEAD_SOURCES.map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`c-source-${source.id}`}
                      checked={form.sources.includes(source.id)}
                      onCheckedChange={() => update('sources', toggleIn(form.sources, source.id))}
                    />
                    <Label htmlFor={`c-source-${source.id}`}>{SOURCE_LABEL[source.id] ?? source.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="c-never" checked={form.onlyNeverCalled} onCheckedChange={(v) => update('onlyNeverCalled', v)} />
              <Label htmlFor="c-never">Somente leads que nunca foram ligados na campanha</Label>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Switch id="c-random" checked={form.randomAssignment} onCheckedChange={(v) => update('randomAssignment', v)} />
                <Label htmlFor="c-random">Distribuição aleatória entre vendedores</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Os leads elegíveis entram em ordem aleatória. Quem iniciar a primeira discagem na campanha assume o lead. Os próximos retornos ficam com o responsável.
              </p>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">Janela de ligação</legend>
            <div className="flex items-center gap-3">
              <Switch id="c-window" checked={form.windowEnabled} onCheckedChange={(v) => update('windowEnabled', v)} />
              <Label htmlFor="c-window">Restringir a um horário</Label>
            </div>
            {form.windowEnabled && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-start">Início</Label>
                    <Input id="c-start" type="time" value={form.windowStart} onChange={(e) => update('windowStart', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-end">Fim</Label>
                    <Input id="c-end" type="time" value={form.windowEnd} onChange={(e) => update('windowEnd', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Dias da semana</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const selected = form.weekdays.includes(day.value);
                      return (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={selected ? 'default' : 'outline'}
                          aria-pressed={selected}
                          onClick={() => update('weekdays', toggleIn(form.weekdays, day.value))}
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar campanha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CampaignPreviewDialog({ campaign, onClose }: { campaign: DialerCampaign; onClose: () => void }) {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    eligibleCount: number;
    assignedCount: number | null;
    sample: { leadId: number; name: string; phone: string }[];
  }>({ loading: true, error: null, eligibleCount: 0, assignedCount: null, sample: [] });

  useEffect(() => {
    let active = true;
    telephonyService
      .previewCampaign(campaign.id)
      .then((res) => {
        if (active) setState({ loading: false, error: null, eligibleCount: res.eligibleCount, assignedCount: res.assignedCount, sample: res.sample });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: getErrorMessage(error, 'Não foi possível calcular a prévia'), eligibleCount: 0, assignedCount: null, sample: [] });
      });
    return () => {
      active = false;
    };
  }, [campaign.id]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prévia: {campaign.name}</DialogTitle>
          <DialogDescription>Leads elegíveis agora para a sua carteira.</DialogDescription>
        </DialogHeader>
        {state.loading ? (
          <LoadingBlock rows={3} />
        ) : state.error ? (
          <ErrorState message={state.error} />
        ) : (
          <div className="space-y-4">
            <p className="text-3xl font-bold text-foreground tabular-nums">{state.eligibleCount}</p>
            <p className="text-sm text-muted-foreground">lead(s) elegível(is)</p>
            {state.assignedCount !== null && <p className="text-xs text-muted-foreground">{state.assignedCount} participação(ões) ativa(s) nesta campanha</p>}
            {state.sample.length > 0 ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-border">
                {state.sample.map((item) => (
                  <li key={item.leadId} className="flex justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{item.phone}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum lead elegível"
                description={state.assignedCount === 0
                  ? 'Esta campanha usa uma lista própria. Abra “Leads” na tabela para adicionar os contatos que ela deve trabalhar.'
                  : 'Ajuste os critérios da campanha ou verifique a etapa e o próximo retorno dos leads.'}
              />
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsPanel() {
  const campaigns = usePolling(() => telephonyService.listCampaigns(), 60000);
  const [editing, setEditing] = useState<DialerCampaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [previewing, setPreviewing] = useState<DialerCampaign | null>(null);
  const [managingLeads, setManagingLeads] = useState<DialerCampaign | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (campaign: DialerCampaign) => {
    setEditing(campaign);
    setFormOpen(true);
  };

  const deactivate = async (campaign: DialerCampaign) => {
    if (!window.confirm(`Desativar a campanha "${campaign.name}"? Ela deixa de aparecer no discador.`)) return;
    setBusyId(campaign.id);
    try {
      await telephonyService.deactivateCampaign(campaign.id);
      toast.success('Campanha desativada');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível desativar a campanha'));
    } finally {
      setBusyId(null);
      await campaigns.refresh();
    }
  };

  const items = campaigns.data ?? [];

  return (
    <SectionCard
      title="Campanhas de ligação"
      description="Listas de leads que o discador usa para montar a fila de cada vendedor."
      action={
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova campanha
        </Button>
      }
    >
      {campaigns.error && !campaigns.data ? (
        <ErrorState message={campaigns.error} onRetry={() => void campaigns.refresh()} />
      ) : campaigns.loading && !campaigns.data ? (
        <LoadingBlock rows={4} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhuma campanha cadastrada" description="Crie uma campanha para organizar ligações por critério." />
      ) : (
        <div className="overflow-x-auto -mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Discagem</TableHead>
                <TableHead>Leads elegíveis</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="min-w-44 max-w-[20rem]">
                    <p className="break-words font-medium text-foreground">{campaign.name}</p>
                    {campaign.description && <p className="line-clamp-2 text-xs text-muted-foreground" title={campaign.description}>{campaign.description}</p>}
                  </TableCell>
                  <TableCell className="text-sm">{PRODUCT_LABEL[campaign.product] ?? campaign.product}</TableCell>
                  <TableCell>
                    <Pill tone={campaign.active ? 'green' : 'slate'}>{campaign.active ? 'Ativa' : 'Inativa'}</Pill>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    <p>{campaign.intervalSec}s entre ligações</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.maxAttempts} tentativa(s) · nova após {campaign.retryAfterMin} min
                    </p>
                    <p className="text-xs text-muted-foreground">Até {campaign.dailyLimitPerUser}/dia por vendedor</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-[220px]">
                    <p className="truncate">{campaign.eligibility.statuses.map((s) => STATUS_LABEL[s] ?? s).join(', ') || '-'}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.eligibility.onlyNeverCalled ? 'Nunca ligados' : 'Inclui já ligados'}
                      {campaign.eligibility.sources?.length ? ` · ${campaign.eligibility.sources.length} origem(ns)` : ''}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {campaign.callWindow ? (
                      <>
                        <p>
                          {campaign.callWindow.start} às {campaign.callWindow.end}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.callWindow.weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d).join(', ')}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sempre</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setManagingLeads(campaign)} disabled={busyId !== null}>
                        Leads
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(campaign)} disabled={busyId !== null}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPreviewing(campaign)} disabled={busyId !== null}>
                        <Eye className="h-4 w-4" />
                        Prévia
                      </Button>
                      {campaign.active && (
                        <Button size="sm" variant="ghost" className="text-danger-foreground hover:text-danger-foreground"
                          onClick={() => void deactivate(campaign)} disabled={busyId !== null}>
                          <Trash2 className="h-4 w-4" />
                          Desativar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {formOpen && (
        <CampaignFormDialog
          campaign={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => void campaigns.refresh()}
        />
      )}
      {previewing && <CampaignPreviewDialog campaign={previewing} onClose={() => setPreviewing(null)} />}
      {managingLeads && <CampaignLeadsDialog campaign={managingLeads} onClose={() => setManagingLeads(null)} />}
    </SectionCard>
  );
}

const PRODUCT_LABEL: Record<string, string> = {
  GENERAL: 'Geral', CRM_TELECOM: 'Infinity CRM Telecom', SYSTEMS: 'Sistemas',
  INSURE: 'Seguros', HEALTH: 'Saúde', SITES: 'Sites', AUTOMATION: 'Automação', OTHER: 'Outro',
};

function CampaignLeadsDialog({ campaign, onClose }: { campaign: DialerCampaign; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<CrmLead[]>([]);
  const [owners, setOwners] = useState<TeamUser[]>([]);
  const [portfolioOwner, setPortfolioOwner] = useState('');
  const [total, setTotal] = useState(0);
  const supervisor = isSupervisorRole(getStoredUser()?.role);
  const [members, setMembers] = useState<Awaited<ReturnType<typeof telephonyService.campaignLeads>>['items']>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    telephonyService.campaignLeads(campaign.id)
      .then((result) => { if (active) { setMembers(result.items); setTotal(result.total); } })
      .catch((err) => { if (active) setError(getErrorMessage(err, 'Não foi possível carregar os leads da campanha.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campaign.id]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      crmLeadsApi.list({ search: query.trim() || undefined, pageSize: 25 })
        .then((result) => { if (active) setMatches(result.items); })
        .catch((err) => { if (active) setError(getErrorMessage(err, 'Não foi possível pesquisar os leads.')); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [query]);

  useEffect(() => {
    if (!supervisor) return;
    let active = true;
    void teamApi.list().then((users) => {
      if (active) setOwners(users.filter((user) => user.active && ['VENDEDOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)));
    }).catch((err) => {
      if (active) setError(getErrorMessage(err, 'Não foi possível carregar os responsáveis.'));
    });
    return () => { active = false; };
  }, [supervisor]);

  async function refreshMembers() {
    const result = await telephonyService.campaignLeads(campaign.id);
    setMembers(result.items);
    setTotal(result.total);
  }

  async function addPortfolio() {
    if (!portfolioOwner) return;
    setSaving(true);
    try {
      const result = await telephonyService.addCampaignPortfolio(campaign.id, Number(portfolioOwner));
      await refreshMembers();
      toast.success(result.added > 0 ? result.added + ' leads adicionados à campanha.' : 'Nenhum lead novo para adicionar.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível adicionar a carteira.'));
    } finally {
      setSaving(false);
    }
  }

  const assignedIds = new Set(members.map((item) => item.leadId));
  const available = matches.filter((lead) => !assignedIds.has(lead.id));
  const toggle = (id: number) => setSelected((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);

  const addSelected = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await telephonyService.addCampaignLeads(campaign.id, selected);
      await refreshMembers();
      setSelected([]);
      toast.success('Leads adicionados à campanha.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível adicionar os leads.'));
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (member: (typeof members)[number], patch: { status?: string; stage?: string }) => {
    setBusyMemberId(member.id);
    try {
      await telephonyService.updateCampaignLead(campaign.id, member.leadId, patch);
      await refreshMembers();
      toast.success('Participação da campanha atualizada.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível atualizar este lead.'));
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Leads da campanha</DialogTitle>
          <DialogDescription>{campaign.name} · {PRODUCT_LABEL[campaign.product] ?? campaign.product}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="campaign-lead-search">Buscar leads para adicionar</Label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="campaign-lead-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, empresa ou telefone" className="pl-9" />
            </div>
          </div>
          {supervisor && (
            <div className="space-y-2 rounded-md border p-3">
              <Label htmlFor="campaign-portfolio-owner">Adicionar carteira inteira</Label>
              <div className="flex flex-wrap gap-2">
                <select id="campaign-portfolio-owner" value={portfolioOwner} onChange={(event) => setPortfolioOwner(event.target.value)}
                  className="h-9 min-w-36 flex-1 rounded-md border border-input bg-background px-2 text-sm" disabled={saving}>
                  <option value="">Selecione o responsável</option>
                  {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                </select>
                <Button size="sm" variant="outline" disabled={saving || !portfolioOwner} onClick={() => void addPortfolio()}>
                  Adicionar carteira
                </Button>
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            {available.map((lead) => (
              <label key={lead.id} className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 last:border-b-0">
                <Checkbox checked={selected.includes(lead.id)} onCheckedChange={() => toggle(lead.id)} />
                <span className="min-w-0 flex-1 truncate text-sm">{lead.name}{lead.company ? ` · ${lead.company}` : ''}</span>
                <span className="text-xs text-muted-foreground">{lead.phone ?? 'Sem telefone'}</span>
              </label>
            ))}
            {available.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum lead disponível para este filtro.</p>}
          </div>
          {error && <p role="alert" className="text-sm text-danger-foreground">{error}</p>}
          <p className="text-sm text-muted-foreground">{loading ? 'Carregando campanha…' : `${total} leads nesta campanha${total > members.length ? " · mostrando " + members.length : ""}`}</p>
          {members.length > 0 && (
            <ul className="max-h-40 divide-y overflow-y-auto rounded-lg border">
              {members.map((member) => (
                <li key={member.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                  <span className="min-w-32 flex-1 truncate font-medium">{member.lead.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${member.status === 'OPEN' ? 'bg-success text-success-foreground' : member.status === 'PAUSED' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {member.status === 'OPEN' ? 'Ativo' : member.status === 'PAUSED' ? 'Pausado' : member.status === 'REMOVED' ? 'Removido' : 'Concluído'}
                  </span>
                  <select
                    aria-label={`Etapa de ${member.lead.name}`}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs"
                    value={member.stage}
                    disabled={saving || busyMemberId === member.id}
                    onChange={(event) => void updateMember(member, { stage: event.target.value })}
                  >
                    {LEAD_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.title}</option>)}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving || busyMemberId === member.id}
                    onClick={() => void updateMember(member, { status: member.status === 'OPEN' ? 'PAUSED' : 'OPEN' })}
                  >
                    {member.status === 'OPEN' ? 'Pausar' : 'Reabrir'}
                  </Button>
                  {member.status !== 'REMOVED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger-foreground hover:text-danger-foreground"
                      disabled={saving || busyMemberId === member.id}
                      onClick={() => {
                        if (window.confirm(`Remover ${member.lead.name} desta campanha? O histórico de ligações será preservado.`)) {
                          void updateMember(member, { status: 'REMOVED' });
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => void addSelected()} disabled={saving || selected.length === 0}>
            {saving ? 'Adicionando…' : `Adicionar ${selected.length || ''} leads`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const dialingOperators = [
  { value: 'AUTO', label: 'Automático (Android)' },
  { value: '15', label: 'Vivo (15)' },
  { value: '21', label: 'Claro (21)' },
  { value: '41', label: 'TIM (41)' },
  { value: '12', label: 'Algar Telecom (12)' },
] as const;

function DeviceDialing({ device, refresh }: { device: TelephonyDevice; refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [operator, setOperator] = useState(device.dialing?.operator ?? 'AUTO');
  const [originDdd, setOriginDdd] = useState(device.dialing?.originDdd ?? '');
  const [saving, setSaving] = useState(false);
  const simKey = device.dialing?.simKey;
  if (device.revokedAt) return null;
  if (!simKey) return <p className="text-xs text-muted-foreground">Selecione o chip no Ramal 1.0.2+</p>;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!simKey) return;
    setSaving(true);
    try {
      await telephonyService.updateDeviceDialing(device.id, {
        simKey, operator, ...(operator === 'AUTO' ? {} : { originDdd }),
      });
      toast.success('Discagem interurbana atualizada');
      refresh();
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível configurar a discagem'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) setOpen(next); }}>
      <Button size="sm" variant="link" className="block h-auto px-0 py-1" onClick={() => {
        setOperator(device.dialing?.operator ?? 'AUTO');
        setOriginDdd(device.dialing?.originDdd ?? '');
        setOpen(true);
      }}>
        {dialingOperators.find(({ value }) => value === device.dialing?.operator)?.label ?? 'Automático (Android)'}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discagem interurbana</DialogTitle>
          <DialogDescription>{device.userName || device.model || 'Ramal'} · {device.simLabel || 'Chip selecionado'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dialing-operator">Operadora de saída</Label>
            <select id="dialing-operator" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={operator}
              onChange={(event) => {
                const selected = dialingOperators.find(({ value }) => value === event.target.value);
                if (selected) setOperator(selected.value);
              }}>
              {dialingOperators.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          {operator !== 'AUTO' && (
            <div className="space-y-2">
              <Label htmlFor="dialing-origin-ddd">DDD de onde o vendedor disca</Label>
              <Input id="dialing-origin-ddd" value={originDdd} inputMode="numeric" pattern="[0-9]{2}" maxLength={2}
                placeholder="Ex.: 11" required onChange={(event) => setOriginDdd(event.target.value.replace(/\D/g, ''))} />
              <p className="text-sm text-muted-foreground">Para outro DDD, o ramal usa 0{operator} + DDD + número. Atualize o DDD de origem se mudar de área.</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DevicesPanel() {
  const [includeRevoked, setIncludeRevoked] = useState(false);
  const devices = usePolling<TelephonyDevice[]>(() => telephonyService.listDevices(includeRevoked), 15000, [includeRevoked]);
  const now = useNow(true, 30000);
  const [busyId, setBusyId] = useState<number | null>(null);

  const disconnect = async (device: TelephonyDevice) => {
    const who = device.userName ? `de ${device.userName}` : `#${device.id}`;
    if (!window.confirm(`Desconectar o celular ${who}? O app precisará ser conectado de novo para voltar a funcionar.`)) return;
    setBusyId(device.id);
    try {
      await telephonyService.revokeDevice(device.id);
      toast.success('Celular desconectado');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível desconectar o celular'));
    } finally {
      setBusyId(null);
      await devices.refresh();
    }
  };

  const items = devices.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard
        title="Ramais (celulares)"
        description="Celulares dos vendedores usados como ramal."
        className="lg:col-span-2"
        action={
          <div className="flex items-center gap-2">
            <Switch id="include-revoked" checked={includeRevoked} onCheckedChange={setIncludeRevoked} />
            <Label htmlFor="include-revoked">Mostrar desconectados</Label>
          </div>
        }
      >
        {devices.error && !devices.data ? (
          <ErrorState message={devices.error} onRetry={() => void devices.refresh()} />
        ) : devices.loading && !devices.data ? (
          <LoadingBlock rows={4} />
        ) : items.length === 0 ? (
          <EmptyState title="Nenhum celular conectado" description="Quando um vendedor conectar o próprio celular, ele aparece aqui." />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Chip</TableHead>
                  <TableHead>Conexão</TableHead>
                  <TableHead>Último sinal</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((device) => {
                  const revoked = !!device.revokedAt;
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.userName || `Usuário #${device.userId}`}</TableCell>
                      <TableCell className="text-sm">
                        <p>{device.model || device.platform}</p>
                        {device.appVersion && <p className="text-xs text-muted-foreground">App {device.appVersion}</p>}
                      </TableCell>
                      <TableCell>{DEVICE_MODE_LABEL[device.mode]}</TableCell>
                      <TableCell>
                        {device.simLabel || '-'}
                        <DeviceDialing key={device.dialing?.simKey ?? 'no-sim'} device={device} refresh={() => { void devices.refresh(); }} />
                      </TableCell>
                      <TableCell>
                        {revoked ? (
                          <Pill tone="slate">Desconectado</Pill>
                        ) : device.connected ? (
                          <Pill tone="green">Online</Pill>
                        ) : (
                          <Pill tone="red">Offline</Pill>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap" title={formatDateTime(device.lastSeenAt)}>
                        {formatRelative(device.lastSeenAt, now)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!revoked && (
                          <Button size="sm" variant="outline" onClick={() => void disconnect(device)} disabled={busyId !== null}>
                            Desconectar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Card className="border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-card h-fit">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-link" />
            <h2 className="text-lg font-semibold text-foreground">Como o vendedor conecta o celular</h2>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            <li>Instalar o app Infinity Ramal no celular Android do vendedor.</li>
            <li>Entrar com o usuário e a senha do sistema.</li>
            <li>Tocar em &quot;Conectar este celular&quot; e conceder as permissões pedidas pelo app.</li>
            <li>Manter o app aberto ou ativo em segundo plano, com internet, para receber as ligações.</li>
          </ol>
          <div className="flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-link" aria-hidden />
            <p>
              <span className="font-medium text-foreground">Privacidade:</span> ligações pessoais não são registradas. O app
              só registra as ligações feitas pela fila ou pelo discador do Infinity Groups.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigView() {
  return (
    <div className="min-h-full">
      <div className="admin-page">
        <PageHeader
          title="Ramal e campanhas"
          icon={<Headset className="h-8 w-8 text-link" />}
          description="Organize as filas de ligação e gerencie os celulares conectados como ramais."
          actions={
            <>
              <Link href="/admin/atendimento/supervisao" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                <ArrowLeft className="h-4 w-4" aria-hidden />Supervisão
              </Link>
              <Link href="/admin/crm/roteiro" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Roteiro do copiloto</Link>
            </>
          }
        />

        <Tabs defaultValue="campanhas" className="space-y-6">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
            <TabsTrigger value="ramais">Ramais (celulares)</TabsTrigger>
          </TabsList>
          <TabsContent value="campanhas">
            <CampaignsPanel />
          </TabsContent>
          <TabsContent value="ramais">
            <DevicesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ConfiguracoesAtendimentoPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setAllowed(isSupervisorRole(getStoredUser()?.role));
  }, []);

  if (allowed === null) {
    return (
      <div className="p-6 bg-gradient-to-br from-background to-muted/50 min-h-full">
        <LoadingBlock rows={6} />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-6 bg-gradient-to-br from-background to-muted/50 min-h-full">
        <Card className="mx-auto max-w-md border-0 shadow-lg rounded-2xl bg-card">
          <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8 text-center">
            <ShieldAlert className="h-10 w-10 text-warning-foreground" aria-hidden />
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="text-sm text-muted-foreground">As configurações do atendimento são exclusivas para administradores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ConfigView />;
}
