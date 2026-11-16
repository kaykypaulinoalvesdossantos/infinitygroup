'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronDown, Pencil, QrCode, RefreshCw, Archive, Star, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, formatPhone, getErrorMessage, type Tone } from '@/components/atendimento/helpers';
import { apiRequest } from '@/services/api';
import { channelsApi } from '@/services/whatsapp-settings/channels';
import type { EvolutionImportAvailability, WaChannel, WaChannelStatus, WaQueue, WaUser } from '@/services/whatsapp-settings/types';
import { QrDialog } from './qr-dialog';

export const CHANNEL_STATUS: Record<WaChannelStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Aguardando conexão', tone: 'blue' },
  QR_PENDING: { label: 'Aguardando QR Code', tone: 'amber' },
  CONNECTED: { label: 'Conectado', tone: 'green' },
  DISCONNECTED: { label: 'Desconectado', tone: 'slate' },
  ERROR: { label: 'Com erro', tone: 'red' },
};

export function channelStatusLabel(status: WaChannelStatus): string {
  return CHANNEL_STATUS[status]?.label ?? status;
}

export function ChannelStatusPill({ status }: { status: WaChannelStatus }) {
  const info = CHANNEL_STATUS[status] ?? { label: status, tone: 'slate' as Tone };
  return <Pill tone={info.tone}>{info.label}</Pill>;
}

const ERROR_TEXT: Record<string, string> = {
  AUTH_REJECTED: 'O WhatsApp recusou a sessão deste número. Conecte novamente pelo QR Code.',
  REMOTE_NOT_FOUND: 'A conexão não existe mais no provedor. Recupere o canal ou conecte novamente.',
  PROVIDER_UNAVAILABLE: 'O provedor está indisponível no momento. Tente recuperar o canal em instantes.',
  CREATE_UNCONFIRMED: 'Não foi possível confirmar a criação da conexão. Recupere o canal para verificar.',
};

export function channelErrorText(code: string | null): string | null {
  if (!code) return null;
  return ERROR_TEXT[code] ?? 'Ocorreu um erro na conexão deste canal. Tente recuperar o canal.';
}

export function ConnectionsSection({
  channel,
  channels,
  onChanged,
}: {
  channel: WaChannel | undefined;
  channels: WaChannel[];
  onChanged: () => void;
}) {
  const [queues, setQueues] = useState<WaQueue[]>([]);
  const [users, setUsers] = useState<WaUser[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [historyResult, setHistoryResult] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [evolution, setEvolution] = useState<EvolutionImportAvailability | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest('/crm-leads/whatsapp/attendance/queues')
      .then((data: WaQueue[]) => active && setQueues(Array.isArray(data) ? data : []))
      .catch(() => active && setQueues([]));
    apiRequest('/crm-leads/whatsapp/attendance/users')
      .then((data: WaUser[]) => active && setUsers(Array.isArray(data) ? data : []))
      .catch(() => active && setUsers([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!importOpen) return;
    let active = true;
    setEvolutionError(null);
    channelsApi
      .evolutionAvailable()
      .then((data) => active && setEvolution(data))
      .catch((err: unknown) => active && setEvolutionError(getErrorMessage(err, 'Não foi possível listar as instâncias.')));
    return () => {
      active = false;
    };
  }, [importOpen]);

  const channelQueues = useMemo(
    () =>
      queues.filter(
        (queue) =>
          queue.scope === 'TENANT' || (queue.scope === 'CHANNEL' && queue.channelId === channel?.id) || queue.scope === 'GROUP',
      ),
    [queues, channel?.id],
  );

  if (!channel) {
    return <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Selecione um canal para ver a conexão.</p>;
  }

  const connected = channel.status === 'CONNECTED';
  const hasError = Boolean(channel.lastErrorCode) || channel.status === 'ERROR';
  const errorText = channelErrorText(channel.lastErrorCode) ?? (channel.status === 'ERROR' ? channelErrorText('UNKNOWN') : null);
  const defaultQueue = queues.find((queue) => queue.id === channel.defaultQueueId);

  const run = async (label: string, action: () => Promise<unknown>, success?: string) => {
    setBusy(label);
    try {
      await action();
      if (success) toast.success(success);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível concluir a ação.'));
    } finally {
      setBusy(null);
    }
  };

  const connect = () =>
    run(
      'connect',
      async () => {
        await channelsApi.connect(channel.id);
        setQrOpen(true);
      },
      'Conexão iniciada. Leia o QR Code no celular.',
    );

  const updateRouting = (patch: { exclusiveOwnerId?: number | null; defaultQueueId?: number | null }, success: string) =>
    run('routing', () => channelsApi.updateRouting(channel.id, patch), success);

  const requestHistory = () => run('history', async () => {
    setHistoryResult(null);
    let afterId: number | null = 0;
    let requested = 0;
    let failed = 0;
    do {
      const page = await channelsApi.requestHistory(channel.id, afterId);
      requested += page.requested;
      failed += page.failed;
      afterId = page.nextAfterId;
    } while (afterId !== null);
    if (requested === 0 && failed === 0) {
      setHistoryResult('Nenhuma conversa com mensagem recente para consultar. O pareamento por QR pode trazer outras conversas.');
      return;
    }
    setHistoryResult([
      requested > 0 ? `Solicitação enviada. Conversas consultadas: ${requested}. As mensagens aparecem conforme o WhatsApp as disponibiliza.` : null,
      failed > 0 ? `Solicitações com falha: ${failed}. Você pode tentar novamente.` : null,
    ].filter(Boolean).join(' '));
  });

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Número" value={formatPhone(channel.phoneNumber)} />
          <Metric label="Status" value={channelStatusLabel(channel.status)} />
          <Metric label="Fila padrão" value={defaultQueue?.name ?? 'Usar regras'} />
        </div>

        {hasError && errorText && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {connected ? (
            <Button variant="secondary" disabled className="min-h-11 gap-2">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Conectado
            </Button>
          ) : channel.status === 'QR_PENDING' ? (
            <Button className="min-h-11 gap-2 bg-[#0076FF] hover:bg-[#0062d4]" disabled={busy !== null} onClick={() => setQrOpen(true)}>
              <QrCode aria-hidden="true" className="h-4 w-4" />
              Abrir QR Code
            </Button>
          ) : (
            <Button className="min-h-11 gap-2 bg-[#0076FF] hover:bg-[#0062d4]" disabled={busy !== null} onClick={() => void connect()}>
              <QrCode aria-hidden="true" className="h-4 w-4" />
              Conectar por QR Code
            </Button>
          )}
          <Button
            variant="outline"
            className="min-h-11 gap-2 text-rose-600 hover:bg-rose-50"
            disabled={busy !== null || channel.status === 'DISCONNECTED'}
            onClick={() => void run('disconnect', () => channelsApi.disconnect(channel.id), 'Canal desconectado.')}
          >
            <WifiOff aria-hidden="true" className="h-4 w-4" />
            Desconectar
          </Button>
          {hasError && (
            <Button
              variant="outline"
              className="min-h-11 gap-2"
              disabled={busy !== null}
              onClick={() => void run('reconcile', () => channelsApi.reconcile(channel.id), 'Verificação do canal concluída.')}
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Recuperar canal
            </Button>
          )}
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            disabled={busy !== null || channel.isDefault}
            onClick={() => void run('default', () => channelsApi.setDefault(channel.id), 'Canal definido como padrão.')}
          >
            <Star aria-hidden="true" className="h-4 w-4" />
            {channel.isDefault ? 'Canal padrão' : 'Definir como padrão'}
          </Button>
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            disabled={busy !== null}
            onClick={() => {
              setRenameValue(channel.name);
              setRenameOpen(true);
            }}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Renomear
          </Button>
          <Button variant="ghost" className="min-h-11 gap-2 text-slate-600" disabled={busy !== null} onClick={() => setArchiveOpen(true)}>
            <Archive aria-hidden="true" className="h-4 w-4" />
            Arquivar
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="wa-history-title">
        <h3 id="wa-history-title" className="text-sm font-semibold text-slate-900">Histórico dos últimos 7 dias</h3>
        <p className="mt-1 text-sm text-slate-600">
          Solicite mensagens anteriores das conversas que já têm uma mensagem recente no CRM. O pareamento por QR pode trazer conversas que ainda não aparecem.
          Conversas criadas pela importação ficam em Resolvidos.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          disabled={!connected || channel.paused || busy !== null}
          onClick={() => void requestHistory()}
        >
          <RefreshCw aria-hidden="true" className={busy === 'history' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          {busy === 'history' ? 'Solicitando histórico…' : 'Buscar histórico'}
        </Button>
        {historyResult && <p role="status" className="mt-3 text-sm text-slate-600">{historyResult}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <Label htmlFor="channel-default-queue" className="mb-1.5 block text-sm font-semibold text-slate-900">
          Fila padrão do canal
        </Label>
        <p className="mb-3 text-xs text-slate-600">
          Toda nova conversa deste canal entra nesta fila. Sem uma fila definida, o sistema aplica as regras de roteamento compartilhadas.
        </p>
        <Select
          disabled={busy !== null}
          value={channel.defaultQueueId ? String(channel.defaultQueueId) : 'NONE'}
          onValueChange={(value) =>
            void updateRouting({ defaultQueueId: value === 'NONE' ? null : Number(value) }, 'Fila padrão atualizada.')
          }
        >
          <SelectTrigger id="channel-default-queue" aria-label="Fila padrão do canal" className="min-h-11 w-full bg-white sm:max-w-md">
            <SelectValue placeholder="Usar regras de roteamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Usar regras de roteamento</SelectItem>
            {channelQueues.map((queue) => (
              <SelectItem key={queue.id} value={String(queue.id)}>
                {queue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <Label htmlFor="channel-owner" className="mb-1.5 block text-sm font-semibold text-slate-900">
          Responsável exclusivo
        </Label>
        <p className="mb-3 text-xs text-slate-600">
          Quando definido, toda nova conversa deste canal vai diretamente para essa pessoa durante o horário de atendimento, enquanto ela estiver
          disponível. Tem prioridade sobre a fila padrão e as regras. Se estiver indisponível, a conversa aguarda sem ir para uma fila compartilhada.
        </p>
        <Select
          disabled={busy !== null}
          value={channel.exclusiveOwnerId ? String(channel.exclusiveOwnerId) : 'NONE'}
          onValueChange={(value) =>
            void updateRouting({ exclusiveOwnerId: value === 'NONE' ? null : Number(value) }, 'Responsável atualizado.')
          }
        >
          <SelectTrigger id="channel-owner" aria-label="Responsável exclusivo" className="min-h-11 w-full bg-white sm:max-w-md">
            <SelectValue placeholder="Usar filas e regras normais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Sem dono exclusivo — usar distribuição normal</SelectItem>
            {users.map((person) => (
              <SelectItem key={person.id} value={String(person.id)}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <button
          type="button"
          aria-expanded={importOpen}
          onClick={() => setImportOpen((value) => !value)}
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm font-semibold text-slate-900"
        >
          Importar instância existente da Evolution
          <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${importOpen ? 'rotate-180' : ''}`} />
        </button>
        {importOpen && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-slate-600">Use somente para trazer um número que já está pareado na Evolution para este painel.</p>
            {evolutionError && (
              <p role="alert" className="text-sm text-red-700">
                {evolutionError}
              </p>
            )}
            {!evolution && !evolutionError && <p className="text-sm text-slate-600">Carregando instâncias…</p>}
            {evolution && evolution.items.length === 0 && (
              <p className="text-sm text-slate-600">Nenhuma instância disponível para importar.</p>
            )}
            {evolution && evolution.items.length > 0 && (
              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {evolution.items.map((item) => (
                  <li key={item.instanceId} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{item.name}</span>
                      <span className="block text-xs text-slate-600">{formatPhone(item.phoneNumber)}</span>
                    </span>
                    <Button
                      variant="outline"
                      className="min-h-11"
                      disabled={busy !== null}
                      onClick={() =>
                        void run(
                          `import:${item.instanceId}`,
                          () => channelsApi.importExisting({ instanceId: item.instanceId, name: item.name }),
                          'Instância importada.',
                        )
                      }
                    >
                      Importar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <QrDialog channel={channel} open={qrOpen} onOpenChange={setQrOpen} onConnected={onChanged} />

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Renomear canal</DialogTitle>
            <DialogDescription>O nome aparece na lista de canais e nas conversas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="channel-rename">Nome do canal</Label>
            <Input id="channel-rename" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} className="min-h-11" maxLength={80} />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setRenameOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="min-h-11 bg-[#0076FF] hover:bg-[#0062d4]"
              disabled={!renameValue.trim() || busy !== null}
              onClick={() =>
                void run(
                  'rename',
                  async () => {
                    await channelsApi.rename(channel.id, { name: renameValue.trim() });
                    setRenameOpen(false);
                  },
                  'Canal renomeado.',
                )
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Arquivar {channel.name}?</DialogTitle>
            <DialogDescription>
              O canal deixa de receber e enviar mensagens. Não é possível arquivar enquanto houver conversas em andamento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setArchiveOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="min-h-11"
              disabled={busy !== null}
              onClick={() =>
                void run(
                  'archive',
                  async () => {
                    await channelsApi.archive(channel.id);
                    setArchiveOpen(false);
                  },
                  'Canal arquivado.',
                )
              }
            >
              Arquivar canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
