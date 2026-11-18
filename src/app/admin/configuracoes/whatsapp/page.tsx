'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  ListOrdered,
  Network,
  Phone,
  Plus,
  Route,
  Users,
  Wifi,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorState, LoadingBlock, PageHeader, formatPhone, getErrorMessage } from '@/components/atendimento/helpers';
import { usePolling } from '@/hooks/use-polling';
import { channelsApi } from '@/services/whatsapp-settings/channels';
import type { WaChannel } from '@/services/whatsapp-settings/types';
import { ChannelStatusPill, ConnectionsSection } from '@/components/admin/whatsapp-settings/connections-section';
import { QrDialog } from '@/components/admin/whatsapp-settings/qr-dialog';
import { VoiceSection } from '@/components/admin/whatsapp-settings/voice-section';
import { ChannelGroupsSection } from '@/components/admin/whatsapp-settings/groups-section';
import { QueuesSection } from '@/components/admin/whatsapp-settings/queues-section';
import { RoutingSection } from '@/components/admin/whatsapp-settings/routing-section';
import { HoursMessagesSection } from '@/components/admin/whatsapp-settings/hours-section';
import { StagesSection } from '@/components/admin/whatsapp-settings/stages-section';
import { FlowsSection } from '@/components/admin/whatsapp-settings/flows-section';

type SectionId = 'connections' | 'voice' | 'groups' | 'queues' | 'routing' | 'hours' | 'stages' | 'flows';
type SectionGroup = 'Canais' | 'Atendimento';

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
  group: SectionGroup;
  scope: 'channel' | 'company';
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  {
    id: 'connections',
    label: 'Conexões',
    description: 'Conecte números por QR Code e defina o responsável e a fila padrão de cada canal.',
    group: 'Canais',
    scope: 'channel',
    icon: Wifi,
  },
  {
    id: 'voice',
    label: 'Chamadas',
    description: 'Configure a sessão de voz e a capacidade validada de chamadas 1:1.',
    group: 'Canais',
    scope: 'channel',
    icon: Phone,
  },
  {
    id: 'groups',
    label: 'Grupos de canais',
    description: 'Compartilhe filas e regras entre canais de uma mesma operação.',
    group: 'Canais',
    scope: 'company',
    icon: Network,
  },
  {
    id: 'queues',
    label: 'Filas e atendentes',
    description: 'Organize a equipe, a distribuição e os limites de atendimento.',
    group: 'Atendimento',
    scope: 'channel',
    icon: Users,
  },
  {
    id: 'routing',
    label: 'Roteamento',
    description: 'Defina quando uma conversa deve entrar em cada fila.',
    group: 'Atendimento',
    scope: 'channel',
    icon: Route,
  },
  {
    id: 'hours',
    label: 'Horários e mensagens',
    description: 'Defina a disponibilidade e os textos automáticos do canal.',
    group: 'Atendimento',
    scope: 'channel',
    icon: Clock,
  },
  {
    id: 'stages',
    label: 'Etapas do atendimento',
    description: 'Organize as etapas compartilhadas entre os atendimentos da empresa.',
    group: 'Atendimento',
    scope: 'company',
    icon: ListOrdered,
  },
  {
    id: 'flows',
    label: 'Fluxos humanos',
    description: 'Planeje tarefas e retornos com revisão humana, sem contato automático.',
    group: 'Atendimento',
    scope: 'company',
    icon: Workflow,
  },
];

const GROUPS: SectionGroup[] = ['Canais', 'Atendimento'];

export default function WhatsAppSettingsPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"><LoadingBlock rows={4} /></main>}>
      <WhatsAppSettingsShell />
    </Suspense>
  );
}

function WhatsAppSettingsShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionParam = searchParams.get('secao');
  const section = SECTIONS.find((item) => item.id === sectionParam) ?? SECTIONS[0];
  const channelParam = Number(searchParams.get('canal'));

  const [addOpen, setAddOpen] = useState(false);
  const [qrChannel, setQrChannel] = useState<WaChannel | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const channels = usePolling(channelsApi.list, hasPending ? 5000 : 30000);
  useEffect(() => {
    setHasPending(Boolean(channels.data?.some((item) => item.status === 'QR_PENDING' || item.status === 'PENDING')));
  }, [channels.data]);

  const list = channels.data ?? [];
  const selected = list.find((item) => item.id === channelParam) ?? list[0];
  const loadingFirst = channels.loading && !channels.data && !channels.error;
  const noChannels = Boolean(channels.data) && list.length === 0;

  const navigate = (sectionId: SectionId, channelId?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('secao', sectionId);
    if (channelId) params.set('canal', String(channelId));
    else params.delete('canal');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCreated = async (channel: WaChannel) => {
    setAddOpen(false);
    navigate('connections', channel.id);
    channels.refresh();
    try {
      await channelsApi.connect(channel.id);
      setQrChannel(channel);
      setQrOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Canal criado, mas não foi possível iniciar a conexão. Use "Conectar por QR Code".'));
    }
  };

  const addButton = (
    <Button className="min-h-11 gap-2 bg-primary hover:bg-primary-hover" onClick={() => setAddOpen(true)}>
      <Plus aria-hidden="true" className="h-4 w-4" />
      Adicionar WhatsApp
    </Button>
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/configuracoes"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Configurações
      </Link>
      <PageHeader
        title="WhatsApp"
        description="Conecte números, configure chamadas, filas e atendimento."
        actions={addButton}
      />

      {channels.error && !channels.data && (
        <ErrorState message={channels.error} onRetry={() => void channels.refresh()} />
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Seções de configuração"
          className="rounded-xl border border-border bg-card p-3 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
        >
          <div className="lg:hidden">
            <Label htmlFor="whatsapp-section">Seção de configuração</Label>
            <select
              id="whatsapp-section"
              value={section.id}
              onChange={(event) => navigate(event.target.value as SectionId, selected?.id)}
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-card p-2 text-sm"
            >
              {GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {SECTIONS.filter((item) => item.group === group).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="hidden space-y-5 lg:block">
            {GROUPS.map((group) => (
              <div key={group}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                <div className="space-y-1">
                  {SECTIONS.filter((item) => item.group === group).map((item) => {
                    const Icon = item.icon;
                    const active = section.id === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => navigate(item.id, selected?.id)}
                        className={
                          'flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
                          (active
                            ? 'bg-primary/10 font-semibold text-primary-hover'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <section className="min-w-0 space-y-4" aria-label={section.label}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.label}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{section.description}</p>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {section.scope === 'company' ? 'Configuração da empresa' : 'Configuração por canal'}
            </span>
          </div>

          {section.scope === 'channel' && list.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Label htmlFor="whatsapp-channel" className="text-xs text-muted-foreground">
                    Canal em edição
                  </Label>
                  <select
                    id="whatsapp-channel"
                    className="mt-1.5 min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-sm sm:max-w-md"
                    value={selected?.id ?? ''}
                    onChange={(event) => navigate(section.id, Number(event.target.value))}
                  >
                    {list.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.phoneNumber ? formatPhone(item.phoneNumber) : 'Sem número'}
                      </option>
                    ))}
                  </select>
                </div>
                {selected && <ChannelStatusPill status={selected.status} />}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {section.id === 'connections' || section.id === 'voice'
                  ? 'As alterações desta seção se aplicam ao canal selecionado.'
                  : 'Selecione o canal de referência. O alcance de cada configuração pode incluir o canal, um grupo ou toda a empresa.'}
              </p>
            </div>
          )}

          {loadingFirst ? (
            <LoadingBlock rows={3} />
          ) : section.scope === 'channel' && noChannels ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Wifi aria-hidden="true" className="h-7 w-7 text-primary" />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Conecte seu primeiro WhatsApp</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Adicione um número e leia o QR Code com o celular. Depois disso, você define filas, roteamento e horários.
                </p>
              </div>
              {addButton}
            </div>
          ) : (
            <SectionContent section={section.id} selected={selected} channels={list} onChanged={() => void channels.refresh()} />
          )}
        </section>
      </div>

      <AddChannelDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />

      {qrChannel && (
        <QrDialog
          channel={qrChannel}
          open={qrOpen}
          onOpenChange={setQrOpen}
          onConnected={() => {
            setQrChannel(null);
            void channels.refresh();
          }}
        />
      )}
    </main>
  );
}

function SectionContent({
  section,
  selected,
  channels,
  onChanged,
}: {
  section: SectionId;
  selected: WaChannel | undefined;
  channels: WaChannel[];
  onChanged: () => void;
}): ReactNode {
  switch (section) {
    case 'connections':
      return <ConnectionsSection key={selected?.id ?? 'none'} channel={selected} channels={channels} onChanged={onChanged} />;
    case 'voice':
      return <VoiceSection key={selected?.id} channel={selected} />;
    case 'groups':
      return <ChannelGroupsSection channels={channels} />;
    case 'queues':
      return <QueuesSection key={selected?.id} channel={selected} channels={channels} />;
    case 'routing':
      return <RoutingSection key={selected?.id} channel={selected} />;
    case 'hours':
      return <HoursMessagesSection key={selected?.id} channel={selected} />;
    case 'stages':
      return <StagesSection />;
    case 'flows':
      return <FlowsSection />;
    default:
      return null;
  }
}

function AddChannelDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (channel: WaChannel) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  const submit = async () => {
    const value = name.trim();
    if (!value || busy) return;
    setBusy(true);
    try {
      const channel = await channelsApi.create({ name: value });
      toast.success('Canal criado. Leia o QR Code no celular para conectar.');
      await onCreated(channel);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível criar o canal.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !busy && onOpenChange(value)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Adicionar WhatsApp</DialogTitle>
          <DialogDescription>Dê um nome para identificar este número. Em seguida, o QR Code será exibido para conectar.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Label htmlFor="new-channel-name">Nome do canal</Label>
          <Input
            id="new-channel-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Comercial"
            maxLength={80}
            autoFocus
            className="min-h-11"
          />
          <DialogFooter className="gap-2 pt-4 sm:gap-2">
            <Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 bg-primary hover:bg-primary-hover" disabled={!name.trim() || busy}>
              {busy ? 'Criando…' : 'Criar e gerar QR Code'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
