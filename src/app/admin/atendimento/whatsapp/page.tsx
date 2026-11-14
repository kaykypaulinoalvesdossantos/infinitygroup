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
  ArrowLeft,
  CalendarPlus,
  CheckCheck,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Paperclip,
  PhoneCall,
  Search,
  Send,
  StickyNote,
  UserRound,
  X,
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
  type CrmLeadTag,
  type CrmAppointment,
  type CrmMessageTemplate,
  type ProductInterest,
  getStoredUser,
  isSupervisorRole,
  teamApi,
  type TeamUser,
} from '@/services/crm-leads';

const conversationKey = (item: Pick<CrmWhatsAppInboxConversation, 'id'>) =>
  String(item.id);

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
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'MINE' | 'QUEUE'>(
    isSupervisorRole(getStoredUser()?.role) ? 'ALL' : 'MINE',
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mobileListOnly, setMobileListOnly] = useState(false);
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [tags, setTags] = useState<CrmLeadTag[]>([]);
  const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
  const [olderConversations, setOlderConversations] = useState<CrmWhatsAppInboxConversation[]>([]);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [draft, setDraft] = useState('');
  const [messageTemplates, setMessageTemplates] = useState<CrmMessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [olderMessages, setOlderMessages] = useState<CrmLeadActivity[]>([]);
  const [olderCursor, setOlderCursor] = useState<number | null>(null);
  const [olderHasMore, setOlderHasMore] = useState(false);
  const operationIdRef = useRef<{ text: string; id: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const channelId = channelFilter === 'all' ? undefined : Number(channelFilter);
  const inboxParams = useMemo(
    () => ({
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(channelId ? { channelId } : {}),
        ...(unreadOnly ? { unreadOnly: true } : {}),
        scope: scopeFilter,
        ...(statusFilter !== 'all'
          ? { status: statusFilter as 'OPEN' | 'WAITING' | 'CLOSED' }
          : {}),
        ...(productFilter !== 'all' ? { productInterest: productFilter as ProductInterest } : {}),
        ...(tagFilter !== 'all' ? { tagId: Number(tagFilter) } : {}),
        page: 1,
        pageSize: 50,
      }),
    [channelId, productFilter, scopeFilter, search, statusFilter, tagFilter, unreadOnly],
  );
  const loadConversations = useCallback(
    () => crmLeadsApi.listWhatsAppConversations(inboxParams),
    [inboxParams],
  );
  const inbox = usePolling(loadConversations, 5000, [loadConversations]);
  const refreshInbox = inbox.refresh;
  const conversations = useMemo(
    () => {
      const items = [...(inbox.data?.items ?? []), ...olderConversations];
      const byId = new Map<number, CrmWhatsAppInboxConversation>();
      for (const item of items) if (!byId.has(item.id)) byId.set(item.id, item);
      return [...byId.values()];
    },
    [inbox.data?.items, olderConversations],
  );
  const selected =
    conversations.find((item) => conversationKey(item) === selectedKey) ?? null;
  const selectedConversationId = selected?.id ?? null;
  const selectedLeadContextId = selected?.lead.id ?? null;
  const selectedUnreadCount = selected?.unreadCount ?? 0;

  const loadThread = useCallback(
    async (): Promise<CrmWhatsAppConversationThread | null> =>
      selectedConversationId !== null
        ? crmLeadsApi.getWhatsAppThread(selectedConversationId)
        : null,
    [selectedConversationId],
  );
  const threadPoll = usePolling(loadThread, 4000, [loadThread]);
  const thread =
    threadPoll.data?.conversationId === selected?.id
      ? threadPoll.data
      : null;

  useEffect(() => {
    setOlderMessages([]);
    setOlderCursor(null);
    setOlderHasMore(false);
    setDraft('');
    setSelectedTemplateId('');
    setAttachment(null);
    operationIdRef.current = null;
  }, [selected?.id]);

  useEffect(() => {
    if (selectedLeadContextId === null) {
      setAppointments([]);
      return;
    }
    let active = true;
    void crmLeadsApi.listAppointments(selectedLeadContextId)
      .then((appointmentRows) => {
        if (!active) return;
        setAppointments(appointmentRows);
      })
      .catch(() => {
        if (!active) return;
        setAppointments([]);
      });
    return () => {
      active = false;
    };
  }, [selectedLeadContextId]);

  useEffect(() => {
    void crmLeadsApi
      .listWhatsAppChannels()
      .then(setChannels)
      .catch(() => setChannels([]));
    void crmLeadsApi.listTags().then(setTags).catch(() => setTags([]));
    void crmLeadsApi.listMessageTemplates({ channel: 'WHATSAPP' }).then(setMessageTemplates).catch(() => setMessageTemplates([]));
  }, []);

  useEffect(() => {
    setOlderConversations([]);
  }, [inboxParams]);

  useEffect(() => {
    if (!isSupervisorRole(getStoredUser()?.role)) return;
    void teamApi.list().then(setTeam).catch(() => setTeam([]));
  }, []);

  useEffect(() => {
    if (!conversations.length) {
      if (selectedKey) setSelectedKey(null);
      return;
    }
    if (mobileListOnly) return;
    if (
      !selectedKey ||
      !conversations.some((item) => conversationKey(item) === selectedKey)
    ) {
      setSelectedKey(conversationKey(conversations[0]));
    }
  }, [conversations, mobileListOnly, selectedKey]);

  useEffect(() => {
    if (selectedConversationId === null || !selectedUnreadCount) return;
    void crmLeadsApi
      .markWhatsAppThreadRead(selectedConversationId)
      .then(() => refreshInbox())
      .catch(() => undefined);
  }, [refreshInbox, selectedConversationId, selectedUnreadCount]);

  const messages = useMemo(
    () => [...olderMessages, ...(thread?.messages ?? [])],
    [olderMessages, thread?.messages],
  );
  const availableTemplates = messageTemplates.filter((item) =>
    !item.productInterest || selected?.lead.productInterests.includes(item.productInterest),
  );
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId]);

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || (!draft.trim() && !attachment) || sending) return;
    const text = draft.trim();
    if (noteMode && attachment) {
      toast.error('Remova o arquivo antes de adicionar uma nota interna.');
      return;
    }
    setSending(true);
    try {
      let deliveryActivity: CrmLeadActivity | null = null;
      if (noteMode) {
        await crmLeadsApi.addWhatsAppConversationNote(selected.id, text);
      } else {
        const operationText = attachment
          ? `${text}|${attachment.name}|${attachment.size}|${attachment.lastModified}`
          : text;
        if (!operationIdRef.current || operationIdRef.current.text !== operationText) {
          operationIdRef.current = { text: operationText, id: crypto.randomUUID() };
        }
        if (attachment) {
          const result = await crmLeadsApi.sendWhatsAppThreadMedia(
            selected.id,
            attachment,
            text,
            operationIdRef.current.id,
          );
          deliveryActivity = result.activity;
        } else {
          const result = await crmLeadsApi.replyWhatsAppThread(
            selected.id,
            text,
            operationIdRef.current.id,
          );
          deliveryActivity = result.activity;
        }
        if (deliveryActivity.outcome === 'FAILED') {
          throw new Error('O Evolution recusou o envio. Confira o canal e tente novamente.');
        }
        if (deliveryActivity.outcome === 'PENDING') {
          toast.info('O envio continua em confirmação. O mesmo identificador será usado ao repetir.');
          return;
        }
        operationIdRef.current = null;
      }
      setDraft('');
      setAttachment(null);
      await Promise.all([threadPoll.refresh(), refreshInbox()]);
      setNoteMode(false);
      toast.success(noteMode ? 'Nota interna adicionada.' : 'Resposta enviada pelo WhatsApp.');
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

  const updateConversation = async (input: {
    status?: 'OPEN' | 'WAITING' | 'CLOSED';
    assignedToId?: number | null;
  }) => {
    if (!selected) return;
    try {
      await crmLeadsApi.updateWhatsAppConversation(selected.id, {
        expectedVersion: selected.version,
        ...input,
      });
      await Promise.all([refreshInbox(), threadPoll.refresh()]);
      toast.success('Conversa atualizada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a conversa.');
    }
  };

  const loadOlderMessages = async () => {
    if (!selected || sending) return;
    const cursor = olderMessages.length ? olderCursor : thread?.nextBeforeId;
    if (!cursor) return;
    try {
      const page = await crmLeadsApi.getWhatsAppThread(selected.id, cursor);
      setOlderMessages((current) => [...page.messages, ...current]);
      setOlderCursor(page.nextBeforeId ?? null);
      setOlderHasMore(page.hasMore ?? false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar o histórico.');
    }
  };

  const loadMoreConversations = async () => {
    if (loadingMoreConversations || conversations.length >= (inbox.data?.total ?? 0)) return;
    setLoadingMoreConversations(true);
    try {
      const page = Math.floor(conversations.length / 50) + 1;
      const result = await crmLeadsApi.listWhatsAppConversations({
        ...inboxParams,
        page,
      });
      setOlderConversations((current) => {
        const seen = new Set([...(inbox.data?.items ?? []), ...current].map((item) => item.id));
        return [...current, ...result.items.filter((item) => !seen.has(item.id))];
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar mais conversas.');
    } finally {
      setLoadingMoreConversations(false);
    }
  };

  const sourceLabel =
    selected?.lead.source === 'WHATSAPP'
      ? 'WhatsApp'
      : (selected?.lead.source ?? '—');
  const statusLabel =
    LEAD_STATUSES.find((status) => status.id === selected?.lead.status)
      ?.title ?? selected?.lead.status;
  const filteredCount = conversations.length;
  const selectedPhone = selected?.contact?.phone ||
    selected?.contact?.phone2 ||
    (selected?.remoteJid ? `+${selected.remoteJid.split('@')[0].replace(/\D/g, '')}` : null) ||
    selected?.lead.phone ||
    selected?.lead.phone2 ||
    'Sem telefone';
  const upcomingAppointment = appointments
    .filter((appointment) => appointment.status === 'SCHEDULED' && new Date(appointment.startsAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
  const appointmentSummary = upcomingAppointment
    ? `${upcomingAppointment.title} · ${new Date(upcomingAppointment.startsAt).toLocaleString('pt-BR')}`
    : appointments[0]
      ? `${appointments[0].title} · ${new Date(appointments[0].startsAt).toLocaleString('pt-BR')}`
      : null;
  const funnelStageSummary = selected?.lead.funnelStage?.name ?? statusLabel;

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
        <aside className={`${selected && !mobileListOnly ? 'hidden lg:flex' : 'flex'} min-h-[420px] flex-col border-b border-slate-200 lg:border-b-0 lg:border-r`}>
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
            <div className="grid grid-cols-2 gap-2">
              <select
                value={scopeFilter}
                onChange={(event) =>
                  setScopeFilter(event.target.value as 'ALL' | 'MINE' | 'QUEUE')
                }
                className="h-9 min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm"
                aria-label="Filtrar responsável"
              >
                {isSupervisorRole(getStoredUser()?.role) && (
                  <option value="ALL">Todas as conversas</option>
                )}
                <option value="MINE">Minhas conversas</option>
                <option value="QUEUE">Fila sem responsável</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm"
                aria-label="Filtrar estado"
              >
                <option value="all">Todos os estados</option>
                <option value="OPEN">Abertas</option>
                <option value="WAITING">Aguardando</option>
                <option value="CLOSED">Resolvidas</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value)}
                className="h-9 min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm"
                aria-label="Filtrar produto"
              >
                <option value="all">Todos os produtos</option>
                <option value="TELECOM">Telecom</option>
                <option value="SEGUROS">Seguros</option>
              </select>
              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="h-9 min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm"
                aria-label="Filtrar tag"
              >
                <option value="all">Todas as tags</option>
                {tags.filter((tag) => tag.isActive).map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
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
                const title = item.lead.company || item.lead.name;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(key);
                      setMobileListOnly(false);
                    }}
                    className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${active ? 'bg-emerald-50/70' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                          {title.trim().slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-slate-900">
                            {title}
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {dateLabel(item.lastMessage.occurredAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {item.contact?.name || item.lead.name}
                          {' · '}{item.contact?.phone || (item.remoteJid ? `+${item.remoteJid.split('@')[0].replace(/\D/g, '')}` : item.lead.phone || item.lead.phone2 || 'Sem telefone')}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {messageText(item.lastMessage)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-slate-400">
                            {item.channelName} · {item.assignedTo?.name || 'Sem responsável'} · {item.status === 'OPEN' ? 'Aberta' : item.status === 'WAITING' ? 'Aguardando' : 'Resolvida'}
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
            {conversations.length < (inbox.data?.total ?? 0) && (
              <div className="p-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loadingMoreConversations}
                  onClick={() => void loadMoreConversations()}
                >
                  {loadingMoreConversations ? 'Carregando…' : `Carregar mais (${conversations.length}/${inbox.data?.total ?? 0})`}
                </Button>
              </div>
            )}
          </div>
        </aside>

        {selected ? (
          <div className={`${selected && !mobileListOnly ? 'grid' : 'hidden lg:grid'} min-h-[560px] min-w-0 grid-rows-[auto_minmax(250px,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_260px] xl:grid-rows-[auto_minmax(250px,1fr)_auto]`}>
            <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 lg:hidden"
                  onClick={() => {
                    setSelectedKey(null);
                    setMobileListOnly(true);
                  }}
                  aria-label="Voltar para conversas"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                  {(selected.lead.company || selected.lead.name).trim().slice(0, 1).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-900">
                    {selected.lead.company || selected.lead.name}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {selected.contact?.name || selected.lead.name} · {selectedPhone}{' '}
                    · {selected.channelName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(!selected.assignedTo || selected.assignedTo.id !== getStoredUser()?.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void updateConversation({ assignedToId: getStoredUser()?.id })}
                  >
                    Assumir
                  </Button>
                )}
                {isSupervisorRole(getStoredUser()?.role) && (
                  <select
                    value={selected.assignedTo?.id ?? ''}
                    onChange={(event) =>
                      void updateConversation({
                        assignedToId: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    className="h-9 max-w-40 rounded-md border border-slate-300 bg-white px-2 text-xs"
                    aria-label="Atribuir conversa"
                  >
                    <option value="">Sem responsável</option>
                    {team.filter((user) => user.active && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'].includes(user.role)).map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={selected.status}
                  onChange={(event) =>
                    void updateConversation({ status: event.target.value as 'OPEN' | 'WAITING' | 'CLOSED' })
                  }
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                  aria-label="Estado da conversa"
                >
                  <option value="OPEN">Aberta</option>
                  <option value="WAITING">Aguardando</option>
                  <option value="CLOSED">Resolvida</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selected.remoteJid || selected.whatsappChannelId === null || selected.channelStatus !== 'CONNECTED'}
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
                <Info label="Produtos" value={selected.lead.productInterests.map((item) => item === 'TELECOM' ? 'Telecom' : 'Seguros').join(', ') || null} />
                <Info label="Tags" value={selected.lead.tags.map((tag) => tag.name).join(', ') || null} />
                <Info label="Etapa do funil" value={funnelStageSummary} />
                <Info label="Origem" value={sourceLabel} />
                <Info
                  label="Última ligação"
                  value={
                    selected.lead.lastCall
                      ? `${selected.lead.lastCall.disposition || selected.lead.lastCall.status} · ${new Date(selected.lead.lastCall.createdAt).toLocaleString('pt-BR')}`
                      : null
                  }
                />
                <Info label="Próximo agendamento" value={appointmentSummary} />
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
                {(olderMessages.length ? olderHasMore : thread?.hasMore) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-center"
                    onClick={() => void loadOlderMessages()}
                  >
                    Carregar mensagens anteriores
                  </Button>
                )}
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
                    const internalNote = activity.type === 'NOTE' || activity.type === 'STATUS';
                    return (
                      <div
                        key={activity.id}
                        className={`flex ${internalNote ? 'justify-center' : inbound ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] ${internalNote ? 'border border-amber-200 bg-amber-50 text-amber-950' : inbound ? 'rounded-tl-sm bg-white text-slate-800' : 'rounded-tr-sm bg-[#d9fdd3] text-slate-800'}`}
                        >
                          {internalNote && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              {activity.type === 'NOTE' ? 'Nota interna · não enviada' : 'Registro do atendimento'}
                            </p>
                          )}
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
              {(!selected.remoteJid || selected.whatsappChannelId === null) && (
                <p className="mb-2 text-xs text-amber-700">
                  Este histórico antigo não tem destinatário e canal confirmados. Revise o vínculo antes de responder ou ligar.
                </p>
              )}
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
                <Button
                  type="button"
                  size="icon"
                  variant={noteMode ? 'default' : 'outline'}
                  className="h-12 w-12 shrink-0"
                  onClick={() => setNoteMode((value) => !value)}
                  aria-label={noteMode ? 'Voltar para mensagem' : 'Adicionar nota interna'}
                  title={noteMode ? 'Voltar para mensagem' : 'Nota interna'}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={noteMode}
                  aria-label="Anexar arquivo"
                  title="Imagem, vídeo MP4, áudio ou documento de até 15 MB"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,video/mp4,audio/mpeg,audio/ogg,audio/opus,audio/aac,audio/wav,audio/webm,application/pdf,text/plain"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > 15 * 1024 * 1024) {
                      toast.error('O arquivo deve ter até 15 MB.');
                      event.target.value = '';
                      return;
                    }
                    setAttachment(file);
                    if (file) operationIdRef.current = null;
                  }}
                />
                {!noteMode && availableTemplates.length > 0 && (
                  <select
                    aria-label="Aplicar modelo de mensagem"
                    className="h-10 max-w-64 rounded-md border bg-white px-3 text-sm"
                    value={selectedTemplateId}
                    onChange={(event) => {
                      const id = event.target.value;
                      setSelectedTemplateId(id);
                      const template = availableTemplates.find((item) => String(item.id) === id);
                      if (!template || !selected) return;
                      const values: Record<string, string> = {
                        nome: selected.contact?.name ?? selected.lead.name,
                        empresa: selected.lead.company ?? selected.lead.name,
                        vendedor: getStoredUser()?.name ?? 'Equipe Infinity Groups',
                        data: '',
                        link: '',
                      };
                      setDraft(template.body.replace(/\{\{(nome|empresa|vendedor|data|link)\}\}/g, (_match, key: string) => values[key] ?? '').slice(0, 3000));
                      operationIdRef.current = null;
                    }}
                  >
                    <option value="">Aplicar modelo…</option>
                    {availableTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.productInterest ? ` · ${template.productInterest}` : ''}</option>)}
                  </select>
                )}
                <Textarea
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    const nextText = attachment
                      ? `${event.target.value.trim()}|${attachment.name}|${attachment.size}|${attachment.lastModified}`
                      : event.target.value.trim();
                    if (operationIdRef.current?.text !== nextText) {
                      operationIdRef.current = null;
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder={noteMode ? 'Escreva uma nota interna…' : attachment ? 'Legenda opcional do arquivo…' : 'Escreva sua resposta…'}
                  rows={2}
                  maxLength={3000}
                  className="max-h-36 min-h-12 resize-y"
                  aria-label="Mensagem para enviar"
                />
                <Button
                  type="submit"
                  disabled={
                    sending ||
                    (!draft.trim() && !attachment) ||
                    !selected.remoteJid ||
                    selected.whatsappChannelId === null ||
                    (!noteMode && selected.channelStatus !== 'CONNECTED')
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
              {attachment && (
                <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="truncate">Arquivo pronto: {attachment.name} · {(attachment.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setAttachment(null)}
                    aria-label="Remover arquivo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <p className="mx-auto mt-1 max-w-3xl text-right text-[10px] text-slate-400">
                {noteMode ? 'Somente a equipe verá esta nota' : 'Enter envia · Shift + Enter quebra a linha · Evolution Go'}
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
                <Info label="Produtos" value={selected.lead.productInterests.map((item) => item === 'TELECOM' ? 'Telecom' : 'Seguros').join(', ') || null} />
                <Info label="Tags" value={selected.lead.tags.map((tag) => tag.name).join(', ') || null} />
                <Info label="Etapa do funil" value={funnelStageSummary} />
                <Info label="Origem" value={sourceLabel} />
                <Info
                  label="Última ligação"
                  value={
                    selected.lead.lastCall
                      ? `${selected.lead.lastCall.disposition || selected.lead.lastCall.status} · ${new Date(selected.lead.lastCall.createdAt).toLocaleString('pt-BR')}`
                      : null
                  }
                />
                <Info label="Próximo agendamento" value={appointmentSummary} />
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
          <div className="hidden min-h-[520px] flex-col items-center justify-center p-8 text-center text-slate-500 lg:flex">
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
            preferredConversationId={selected.id}
            callOnly
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
