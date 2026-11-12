'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Eye, Headset, Info, Pencil, Plus, ShieldAlert, Smartphone, Trash2 } from 'lucide-react';
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
import { LEAD_SOURCES, LEAD_STATUSES, getStoredUser, isSupervisorRole } from '@/services/crm-leads';
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
  active: boolean;
  intervalSec: string;
  maxAttempts: string;
  retryAfterMin: string;
  statuses: string[];
  onlyNeverCalled: boolean;
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
  active: true,
  intervalSec: '5',
  maxAttempts: '3',
  retryAfterMin: '1440',
  statuses: ['NEW'],
  onlyNeverCalled: true,
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
    active: campaign.active,
    intervalSec: String(campaign.intervalSec),
    maxAttempts: String(campaign.maxAttempts),
    retryAfterMin: String(campaign.retryAfterMin),
    statuses: campaign.eligibility.statuses,
    onlyNeverCalled: campaign.eligibility.onlyNeverCalled,
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
      active: form.active,
      intervalSec,
      maxAttempts,
      retryAfterMin,
      eligibility: {
        statuses: form.statuses,
        onlyNeverCalled: form.onlyNeverCalled,
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
              <Label htmlFor="c-desc">Descrição</Label>
              <Textarea id="c-desc" value={form.description} maxLength={500} rows={2} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="c-active" checked={form.active} onCheckedChange={(v) => update('active', v)} />
              <Label htmlFor="c-active">Campanha ativa</Label>
            </div>
          </div>

          <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-[#1A1A1A]">Ritmo e tentativas</legend>
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

          <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-[#1A1A1A]">Elegibilidade</legend>
            <div className="space-y-2">
              <p className="text-sm text-[#64748B]">Status dos leads</p>
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
              <p className="text-sm text-[#64748B]">Origem (vazio = todas)</p>
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
              <Label htmlFor="c-never">Somente leads que nunca foram ligados</Label>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-[#1A1A1A]">Janela de ligação</legend>
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
                  <p className="text-sm text-[#64748B]">Dias da semana</p>
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
    sample: { leadId: number; name: string; phone: string }[];
  }>({ loading: true, error: null, eligibleCount: 0, sample: [] });

  useEffect(() => {
    let active = true;
    telephonyService
      .previewCampaign(campaign.id)
      .then((res) => {
        if (active) setState({ loading: false, error: null, eligibleCount: res.eligibleCount, sample: res.sample });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: getErrorMessage(error, 'Não foi possível calcular a prévia'), eligibleCount: 0, sample: [] });
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
            <p className="text-3xl font-bold text-[#1A1A1A] tabular-nums">{state.eligibleCount}</p>
            <p className="text-sm text-[#64748B]">lead(s) elegível(is)</p>
            {state.sample.length > 0 ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                {state.sample.map((item) => (
                  <li key={item.leadId} className="flex justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="text-[#64748B] whitespace-nowrap">{item.phone}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Nenhum lead elegível" description="Ajuste os critérios da campanha para incluir mais leads." />
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
                <TableHead>Situação</TableHead>
                <TableHead>Ritmo</TableHead>
                <TableHead>Elegibilidade</TableHead>
                <TableHead>Janela</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="max-w-[260px]">
                    <p className="font-medium text-[#1A1A1A] truncate">{campaign.name}</p>
                    {campaign.description && <p className="text-xs text-[#64748B] truncate">{campaign.description}</p>}
                  </TableCell>
                  <TableCell>
                    <Pill tone={campaign.active ? 'green' : 'slate'}>{campaign.active ? 'Ativa' : 'Inativa'}</Pill>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    <p>{campaign.intervalSec}s entre ligações</p>
                    <p className="text-xs text-[#64748B]">
                      {campaign.maxAttempts} tentativa(s) · nova após {campaign.retryAfterMin} min
                    </p>
                    <p className="text-xs text-[#64748B]">Até {campaign.dailyLimitPerUser}/dia por vendedor</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-[220px]">
                    <p className="truncate">{campaign.eligibility.statuses.map((s) => STATUS_LABEL[s] ?? s).join(', ') || '-'}</p>
                    <p className="text-xs text-[#64748B]">
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
                        <p className="text-xs text-[#64748B]">
                          {campaign.callWindow.weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d).join(', ')}
                        </p>
                      </>
                    ) : (
                      <span className="text-[#64748B]">Sempre</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(campaign)} disabled={busyId !== null}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPreviewing(campaign)} disabled={busyId !== null}>
                        <Eye className="h-4 w-4" />
                        Prévia
                      </Button>
                      {campaign.active && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700"
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
    </SectionCard>
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
                        {device.appVersion && <p className="text-xs text-[#64748B]">App {device.appVersion}</p>}
                      </TableCell>
                      <TableCell>{DEVICE_MODE_LABEL[device.mode]}</TableCell>
                      <TableCell>{device.simLabel || '-'}</TableCell>
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

      <Card className="border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-white h-fit">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#0076FF]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Como o vendedor conecta o celular</h2>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[#1A1A1A]">
            <li>Instalar o app Infinity Ramal no celular Android do vendedor.</li>
            <li>Entrar com o usuário e a senha do sistema.</li>
            <li>Tocar em &quot;Conectar este celular&quot; e conceder as permissões pedidas pelo app.</li>
            <li>Manter o app aberto ou ativo em segundo plano, com internet, para receber as ligações.</li>
          </ol>
          <div className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-[#64748B]">
            <Info className="h-4 w-4 shrink-0 text-[#0076FF]" aria-hidden />
            <p>
              <span className="font-medium text-[#1A1A1A]">Privacidade:</span> ligações pessoais não são registradas. O app
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
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader
          title="Configurações do atendimento"
          icon={<Headset className="h-8 w-8 text-[#0076FF]" />}
          description="Campanhas de ligação e celulares usados como ramal."
          actions={
            <Link href="/admin/atendimento/supervisao" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <ArrowLeft className="h-4 w-4" />
              Supervisão
            </Link>
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
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
        <LoadingBlock rows={6} />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
        <Card className="mx-auto max-w-md border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8 text-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" aria-hidden />
            <h1 className="text-xl font-semibold text-[#1A1A1A]">Acesso restrito</h1>
            <p className="text-sm text-[#64748B]">As configurações do atendimento são exclusivas para administradores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ConfigView />;
}
