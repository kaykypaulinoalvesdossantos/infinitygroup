'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  CalendarPlus,
  CheckCheck,
  Loader2,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  Search,
  Send,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentDialog } from '@/components/admin/crm/appointment-dialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePolling } from '@/hooks/use-polling';
import {
  crmLeadsApi,
  LEAD_STATUSES,
  type CrmWhatsAppChannel,
  type CrmWhatsAppInboxConversation,
  type CrmWhatsAppConversationThread,
  type CrmLeadActivity,
} from '@/services/crm-leads';

const conversationKey = (
  item: Pick<CrmWhatsAppInboxConversation, 'lead' | 'whatsappChannelId'>,
) => `${item.lead.id}:${item.whatsappChannelId ?? 'legacy'}`;

function messageText(activity: CrmLeadActivity) {
  const metadata = activity.metadata;
  const text =
    metadata && typeof metadata.messageText === 'string'
      ? metadata.messageText
      : null;
  return text || activity.summary || 'Mensagem';
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function activityIsInbound(activity: CrmLeadActivity) {
  return activity.direction === 'INBOUND';
}

export default function WhatsAppInboxPage() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelId = channelFilter === 'all' ? undefined : Number(channelFilter);
  const loadConversations = useCallback(
    () =>
      crmLeadsApi.listWhatsAppConversations({
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(channelId ? { channelId } : {}),
        ...(unreadOnly ? { unreadOnly: true } : {}),
      }),
    [channelId, search, unreadOnly],
  );
  const inbox = usePolling(loadConversations, 5000, [loadConversations]);
  const refreshInbox = inbox.refresh;
  const conversations = useMemo(
    () => inbox.data?.items ?? [],
    [inbox.data?.items],
  );
  const selected =
    conversations.find((item) => conversationKey(item) === selectedKey) ?? null;
  const selectedLeadId = selected?.lead.id ?? null;
  const selectedChannelId = selected?.whatsappChannelId ?? null;

  const loadThread = useCallback(
    async (): Promise<CrmWhatsAppConversationThread | null> =>
      selectedLeadId !== null
        ? crmLeadsApi.getWhatsAppConversation(selectedLeadId, selectedChannelId)
        : null,
    [selectedChannelId, selectedLeadId],
  );
  const threadPoll = usePolling(loadThread, 4000, [loadThread]);
  const thread =
    threadPoll.data?.leadId === selected?.lead.id &&
    threadPoll.data?.whatsappChannelId === selected?.whatsappChannelId
      ? threadPoll.data
      : null;

  useEffect(() => {
    void crmLeadsApi
      .listWhatsAppChannels()
      .then(setChannels)
      .catch(() => setChannels([]));
  }, []);

  useEffect(() => {
    if (!conversations.length) {
      if (selectedKey) setSelectedKey(null);
      return;
    }
    if (
      !selectedKey ||
      !conversations.some((item) => conversationKey(item) === selectedKey)
    ) {
      setSelectedKey(conversationKey(conversations[0]));
    }
  }, [conversations, selectedKey]);

  useEffect(() => {
    if (selectedLeadId === null || !selected?.unreadCount) return;
    void crmLeadsApi
      .markWhatsAppConversationRead(selectedLeadId, selectedChannelId)
      .then(() => refreshInbox())
      .catch(() => undefined);
  }, [refreshInbox, selected?.unreadCount, selectedChannelId, selectedLeadId]);

  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId]);

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    try {
      await crmLeadsApi.replyWhatsApp(
        selected.lead.id,
        draft.trim(),
        selected.whatsappChannelId,
      );
      setDraft('');
      await Promise.all([threadPoll.refresh(), refreshInbox()]);
      toast.success('Resposta enviada pelo WhatsApp.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a resposta.',
      );
    } finally {
      setSending(false);
    }
  };

  const onActivity = () => {
    void Promise.all([threadPoll.refresh(), refreshInbox()]);
  };

  const sourceLabel =
    selected?.lead.source === 'WHATSAPP'
      ? 'WhatsApp'
      : (selected?.lead.source ?? '—');
  const statusLabel =
    LEAD_STATUSES.find((status) => status.id === selected?.lead.status)
      ?.title ?? selected?.lead.status;
  const filteredCount = conversations.length;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1600px] flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Atenda conversas, consulte o lead e acompanhe o histórico por número
            conectado.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {filteredCount} conversa{filteredCount === 1 ? '' : 's'}
        </div>
      </header>

      <section className="grid min-h-[650px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-[420px] flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar nome, empresa ou telefone"
                className="pl-9"
                aria-label="Buscar conversas"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={channelFilter}
                onChange={(event) => setChannelFilter(event.target.value)}
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 text-sm"
                aria-label="Filtrar por número"
              >
                <option value="all">Todos os números</option>
                {channels
                  .filter((channel) => channel.id !== null)
                  .map((channel) => (
                    <option key={channel.id} value={channel.id!}>
                      {channel.name}
                      {channel.phoneNumber ? ` · +${channel.phoneNumber}` : ''}
                    </option>
                  ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant={unreadOnly ? 'default' : 'outline'}
                onClick={() => setUnreadOnly((value) => !value)}
                aria-pressed={unreadOnly}
              >
                <CheckCheck className="mr-1.5 h-4 w-4" />
                Não lidas
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {inbox.loading && !inbox.data ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando conversas…
              </div>
            ) : inbox.error ? (
              <div className="p-5 text-sm text-red-700">{inbox.error}</div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center text-slate-500">
                <MessageCircle className="mb-3 h-8 w-8 text-slate-300" />
                <p className="font-medium text-slate-700">
                  Nenhuma conversa encontrada
                </p>
                <p className="mt-1 text-xs">
                  As novas mensagens aparecerão aqui quando a caixa estiver
                  ativa no número conectado.
                </p>
              </div>
            ) : (
              conversations.map((item) => {
                const key = conversationKey(item);
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${active ? 'bg-emerald-50/70' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                        {item.lead.name.trim().slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-slate-900">
                            {item.lead.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {dateLabel(item.lastMessage.occurredAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {messageText(item.lastMessage)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-slate-400">
                            {item.channelName}
                          </span>
                          {item.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {selected ? (
          <div className="grid min-h-[560px] min-w-0 grid-rows-[auto_minmax(250px,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_260px] xl:grid-rows-[auto_minmax(250px,1fr)_auto]">
            <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                  {selected.lead.name.trim().slice(0, 1).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-900">
                    {selected.lead.name}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {selected.lead.phone ||
                      selected.lead.phone2 ||
                      'Sem telefone'}{' '}
                    · {selected.channelName}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCall(true)}
                >
                  <PhoneCall className="mr-1.5 h-4 w-4" />
                  Ligar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAppointment(true)}
                >
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Agendar
                </Button>
              </div>
            </div>

            <details className="col-span-full border-b border-slate-200 bg-slate-50 px-4 py-2 xl:hidden">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Ver dados do lead
              </summary>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 text-sm">
                <Info label="Empresa" value={selected.lead.company} />
                <Info
                  label="Telefone"
                  value={selected.lead.phone || selected.lead.phone2}
                />
                <Info label="E-mail" value={selected.lead.email} />
                <Info label="Cidade" value={selected.lead.city} />
                <Info label="Segmento" value={selected.lead.segment} />
                <Info label="Etapa" value={statusLabel} />
                <Info label="Origem" value={sourceLabel} />
                <Info
                  label="Última ligação"
                  value={
                    selected.lead.lastCall
                      ? `${selected.lead.lastCall.disposition || selected.lead.lastCall.status} · ${new Date(selected.lead.lastCall.createdAt).toLocaleString('pt-BR')}`
                      : null
                  }
                />
                <Info
                  label="Valor estimado"
                  value={
                    selected.lead.value === null
                      ? null
                      : new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(selected.lead.value)
                  }
                />
                <Info label="Observações" value={selected.lead.notes} />
                <Info
                  label="Responsável"
                  value={selected.lead.owner?.name || 'Aguardando responsável'}
                />
                <Info
                  label="Próxima ação"
                  value={
                    selected.lead.nextActionAt
                      ? new Date(selected.lead.nextActionAt).toLocaleString(
                          'pt-BR',
                        )
                      : null
                  }
                />
                <Info
                  label="Consentimento WhatsApp"
                  value={
                    selected.lead.whatsappOptInAt
                      ? `Registrado${selected.lead.whatsappOptInSource ? ` · ${selected.lead.whatsappOptInSource}` : ''}`
                      : 'Não registrado'
                  }
                />
              </div>
            </details>

            <div className="min-h-0 overflow-y-auto bg-[#f5f7f8] p-4 sm:p-6 xl:row-span-2">
              <div className="mx-auto flex max-w-3xl flex-col gap-3">
                {threadPoll.loading && !thread ? (
                  <div className="flex justify-center py-12 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando histórico…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Ainda não há mensagens neste atendimento.
                  </div>
                ) : (
                  messages.map((activity) => {
                    const inbound = activityIsInbound(activity);
                    return (
                      <div
                        key={activity.id}
                        className={`flex ${inbound ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] ${inbound ? 'rounded-tl-sm bg-white text-slate-800' : 'rounded-tr-sm bg-[#d9fdd3] text-slate-800'}`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {messageText(activity)}
                          </p>
                          <p className="mt-1 text-right text-[10px] text-slate-400">
                            {timeLabel(activity.occurredAt)}
                            {!inbound && activity.outcome === 'SENT'
                              ? ' · Enviada'
                              : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="min-w-0 border-t border-slate-200 bg-white p-3 xl:col-start-1 xl:row-start-3 sm:p-4">
              {selected.channelStatus &&
                selected.channelStatus !== 'CONNECTED' && (
                  <p className="mb-2 text-xs text-amber-700">
                    Este número está desconectado. Reconecte-o em Atendimento →
                    Configurações → WhatsApp para responder.
                  </p>
                )}
              <form
                onSubmit={(event) => void sendReply(event)}
                className="mx-auto flex max-w-3xl items-end gap-2"
              >
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Escreva sua resposta…"
                  rows={2}
                  maxLength={3000}
                  className="max-h-36 min-h-12 resize-y"
                  aria-label="Mensagem para enviar"
                />
                <Button
                  type="submit"
                  disabled={
                    sending ||
                    !draft.trim() ||
                    selected.channelStatus !== 'CONNECTED'
                  }
                  className="h-12 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Enviar mensagem</span>
                </Button>
              </form>
              <p className="mx-auto mt-1 max-w-3xl text-right text-[10px] text-slate-400">
                Enter envia · Shift + Enter quebra a linha · Evolution Go
              </p>
            </div>

            <aside className="hidden border-l border-slate-200 bg-white p-4 xl:row-span-2 xl:block">
              <div className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                <UserRound className="h-4 w-4" />
                Dados do lead
              </div>
              <div className="space-y-4 text-sm">
                <Info label="Empresa" value={selected.lead.company} />
                <Info
                  label="Telefone"
                  value={selected.lead.phone || selected.lead.phone2}
                />
                <Info label="E-mail" value={selected.lead.email} />
                <Info label="Cidade" value={selected.lead.city} />
                <Info label="Segmento" value={selected.lead.segment} />
                <Info label="Etapa" value={statusLabel} />
                <Info label="Origem" value={sourceLabel} />
                <Info
                  label="Última ligação"
                  value={
                    selected.lead.lastCall
                      ? `${selected.lead.lastCall.disposition || selected.lead.lastCall.status} · ${new Date(selected.lead.lastCall.createdAt).toLocaleString('pt-BR')}`
                      : null
                  }
                />
                <Info
                  label="Valor estimado"
                  value={
                    selected.lead.value === null
                      ? null
                      : new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(selected.lead.value)
                  }
                />
                <Info label="Observações" value={selected.lead.notes} />
                <Info
                  label="Responsável"
                  value={selected.lead.owner?.name || 'Aguardando responsável'}
                />
                <Info
                  label="Próxima ação"
                  value={
                    selected.lead.nextActionAt
                      ? new Date(selected.lead.nextActionAt).toLocaleString(
                          'pt-BR',
                        )
                      : null
                  }
                />
                <Info
                  label="Consentimento WhatsApp"
                  value={
                    selected.lead.whatsappOptInAt
                      ? `Registrado${selected.lead.whatsappOptInSource ? ` · ${selected.lead.whatsappOptInSource}` : ''}`
                      : 'Não registrado'
                  }
                />
                <Info
                  label="Número de atendimento"
                  value={`${selected.channelName}${selected.channelPhoneNumber ? ` · +${selected.channelPhoneNumber}` : ''}`}
                />
              </div>
            </aside>
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center text-slate-500">
            <Card className="max-w-md border-dashed shadow-none">
              <CardContent className="flex flex-col items-center p-8">
                <MessagesSquare className="mb-3 h-10 w-10 text-slate-300" />
                <h2 className="font-semibold text-slate-800">
                  Sua caixa de entrada está pronta
                </h2>
                <p className="mt-2 text-sm">
                  Conecte ou ative a caixa de entrada de um número Evolution Go
                  e as mensagens recebidas aparecerão aqui com os dados do lead.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {selected && (
        <>
          <WhatsAppDialog
            lead={selected.lead}
            preferredChannelId={selected.whatsappChannelId}
            open={showCall}
            onOpenChange={setShowCall}
            onActivity={onActivity}
          />
          <AppointmentDialog
            lead={selected.lead}
            open={showAppointment}
            onOpenChange={setShowAppointment}
            onSaved={() => {
              setShowAppointment(false);
              onActivity();
            }}
          />
        </>
      )}
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 break-words text-slate-700">{value || '—'}</p>
    </div>
  );
}
