'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, Inbox, Loader2, MessageCircle, QrCode, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crmLeadsApi, type CrmWhatsAppChannel } from '@/services/crm-leads';

const statusLabel: Record<string, string> = {
  PENDING: 'Aguardando conexão',
  QR_PENDING: 'Aguardando leitura do QR',
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  ERROR: 'Falha ao criar na Evolution',
};

export function WhatsAppChannelsPanel() {
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [name, setName] = useState('');
  const [voiceSessionName, setVoiceSessionName] = useState('');
  const [qr, setQr] = useState<{ id: number; value: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setChannels(await crmLeadsApi.listWhatsAppChannels());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os números.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const channel = await crmLeadsApi.createWhatsAppChannel(name.trim(), voiceSessionName.trim() || undefined);
      setName('');
      setVoiceSessionName('');
      await load();
      toast.success(`Número "${channel.name}" criado na Evolution. Agora conecte pelo QR Code.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar o número na Evolution.');
    } finally {
      setCreating(false);
    }
  };

  const connect = async (channel: CrmWhatsAppChannel) => {
    if (channel.id === null) return;
    setBusyId(channel.id);
    try {
      const result = await crmLeadsApi.connectWhatsAppChannel(channel.id);
      setQr(result.qrCode ? { id: channel.id, value: result.qrCode } : null);
      await load();
      if (!result.qrCode && result.status !== 'CONNECTED') {
        toast.info('A Evolution ainda está preparando o QR. Atualize o status em alguns segundos.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível iniciar a conexão.');
    } finally {
      setBusyId(null);
    }
  };

  const refresh = async (channel: CrmWhatsAppChannel) => {
    if (channel.id === null) return;
    setBusyId(channel.id);
    try {
      const result = await crmLeadsApi.refreshWhatsAppChannelStatus(channel.id);
      setChannels((current) => current.map((item) => item.id === result.id ? result : item));
      if (result.status === 'CONNECTED' && qr?.id === result.id) setQr(null);
      if (result.status === 'CONNECTED') toast.success(`${result.name} conectado${result.phoneNumber ? ` · +${result.phoneNumber}` : ''}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o status.');
    } finally {
      setBusyId(null);
    }
  };

  const setDefault = async (channel: CrmWhatsAppChannel) => {
    if (channel.id === null) return;
    setBusyId(channel.id);
    try {
      const result = await crmLeadsApi.setDefaultWhatsAppChannel(channel.id);
      setChannels((current) => current.map((item) => ({ ...item, isDefault: item.id === result.id })));
      toast.success(`${result.name} definido como número padrão.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível alterar o número padrão.');
    } finally {
      setBusyId(null);
    }
  };

  const enableInbox = async (channel: CrmWhatsAppChannel) => {
    if (channel.id === null) return;
    setBusyId(channel.id);
    try {
      const result = await crmLeadsApi.enableWhatsAppInbox(channel.id);
      setChannels((current) => current.map((item) => item.id === result.id ? result : item));
      toast.success(`Caixa de entrada ativada para ${result.name}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível ativar as mensagens recebidas.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Adicionar número WhatsApp</h2>
              <p className="text-sm text-slate-500">Cada número cria uma instância própria na Evolution Go.</p>
            </div>
          </div>
          <form onSubmit={(event) => void create(event)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp-channel-name">Nome para identificar</Label>
              <Input id="whatsapp-channel-name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Comercial 1" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wacalls-session-name">Sessão de ligação WaCalls</Label>
              <Input id="wacalls-session-name" maxLength={160} value={voiceSessionName} onChange={(event) => setVoiceSessionName(event.target.value)} placeholder="Nome da sessão pareada com este número" />
              <p className="text-xs text-slate-500">Ligue apenas quando a sessão WaCalls estiver pareada com o mesmo telefone.</p>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating || !name.trim()}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                Criar instância e adicionar número
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">Números conectados</h2>
        {loading ? <p className="text-sm text-slate-500">Carregando canais…</p> : channels.length === 0 ? (
          <Card className="rounded-2xl border-dashed"><CardContent className="p-6 text-sm text-slate-500">Nenhum número cadastrado. Adicione uma instância acima.</CardContent></Card>
        ) : channels.map((channel) => (
          <Card key={channel.id ?? 'legacy'} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{channel.name}</span>
                  {channel.isDefault && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Padrão</span>}
                  {channel.inboxEnabled && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Caixa ativa</span>}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${channel.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {statusLabel[channel.status] ?? channel.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {channel.phoneNumber ? `+${channel.phoneNumber}` : channel.instanceName}
                  {channel.voiceSessionConfigured ? ' · Voz WaCalls configurada' : ' · Falta vincular voz WaCalls'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {channel.id !== null && channel.status !== 'CONNECTED' && (
                  <Button size="sm" variant="outline" onClick={() => void connect(channel)} disabled={busyId === channel.id}>
                    {busyId === channel.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Conectar QR
                  </Button>
                )}
                {channel.id !== null && (
                  <Button size="sm" variant="outline" onClick={() => void refresh(channel)} disabled={busyId === channel.id}>
                    <RefreshCw className="mr-2 h-4 w-4" />Atualizar
                  </Button>
                )}
                {channel.id !== null && channel.status === 'CONNECTED' && !channel.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => void setDefault(channel)} disabled={busyId === channel.id}>
                    <Star className="mr-2 h-4 w-4" />Definir padrão
                  </Button>
                )}
                {channel.id !== null && channel.status === 'CONNECTED' && !channel.inboxEnabled && (
                  <Button size="sm" variant="outline" onClick={() => void enableInbox(channel)} disabled={busyId === channel.id}>
                    {busyId === channel.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Inbox className="mr-2 h-4 w-4" />}
                    Ativar caixa de entrada
                  </Button>
                )}
                {channel.id !== null && channel.status === 'CONNECTED' && channel.isDefault && <Check className="my-auto h-5 w-5 text-emerald-600" aria-label="Canal padrão" />}
              </div>
            </CardContent>
            {qr?.id === channel.id && (
              <CardContent className="border-t p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Leia o QR Code no WhatsApp → Aparelhos conectados → Conectar aparelho.</p>
                {qr.value.startsWith('data:image/') ? (
                  // The provider returns its QR as a base64 data URL.
                  <img src={qr.value} alt={`QR Code para conectar ${channel.name}`} className="mx-auto h-64 w-64 rounded-xl border bg-white p-2" />
                ) : <code className="block break-all rounded bg-slate-50 p-3 text-xs">{qr.value}</code>}
                <Button className="mt-3" size="sm" variant="outline" onClick={() => void refresh(channel)} disabled={busyId === channel.id}>Já conectei</Button>
              </CardContent>
            )}
          </Card>
        ))}
      </section>
      <p className="text-xs text-slate-500">As chaves por número ficam cifradas no backend e nunca são enviadas ao navegador. Mensagens usam Evolution Go; chamadas usam a sessão WaCalls correspondente. A API oficial da Meta não é usada.</p>
    </div>
  );
}
