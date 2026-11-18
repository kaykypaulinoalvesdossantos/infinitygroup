'use client';

import { WhatsAppMessageContent } from '@/components/atendimento/whatsapp-message-content';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarPlus,
  CheckCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  MessagesSquare,
  MoreHorizontal,
  Paperclip,
  PhoneCall,
  Search,
  Send,
  StickyNote,
  UserCheck,
  UserRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AgentStatusToggle, AGENT_STATUS_LABEL } from '@/components/atendimento/agent-status-toggle';
import {
  whatsappAttendanceApi,
  type InboxListParams,
} from '@/components/atendimento/whatsapp-attendance-api';
import { AppointmentDialog } from '@/components/admin/crm/appointment-dialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { WhatsAppTemplatePicker } from '@/components/admin/crm/whatsapp-template-picker';
import { formatPhone } from '@/components/atendimento/helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { WaAgentStatus, WaQueue, WaStage } from '@/services/whatsapp-settings/types';

const conversationKey = (item: Pick<CrmWhatsAppInboxConversation, 'id'>) =>
  String(item.id);

const STATUS_LABEL: Record<CrmWhatsAppInboxConversation['status'], string> = {
  WAITING: 'Aguardando',
  IN_QUEUE: 'Na fila',
  OPEN: 'Em atendimento',
  CLOSED: 'Resolvida',
};

const OUTBOUND_STATUS_LABEL: Record<string, string> = {
  SENT: 'Enviada',
  FAILED: 'Falhou no envio',
  PENDING: 'Envio em confirmação',
};

/** Visões da lista: "Na fila", "Meus", "Todos abertos" e "Resolvidos". */
type ViewFilter = 'QUEUE' | 'MINE' | 'OPEN' | 'CLOSED';
const VIEW_OPTIONS: { id: ViewFilter; label: string; supervisorOnly?: boolean }[] = [
  { id: 'QUEUE', label: 'Na fila' },
  { id: 'MINE', label: 'Meus' },
  { id: 'OPEN', label: 'Todos abertos', supervisorOnly: true },
  { id: 'CLOSED', label: 'Resolvidos' },
];

function waitingLabel(since: string) {
  const start = new Date(since).getTime();
  if (Number.isNaN(start)) return null;
  const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000));
  if (minutes < 1) return 'aguardando há menos de 1 min';
  if (minutes < 60) return `aguardando há ${minutes} min`;
  return `aguardando há ${Math.floor(minutes / 60)} h`;
}

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

function conversationName(item: CrmWhatsAppInboxConversation) {
  return item.contact?.name?.trim() || item.lead.name.trim() || item.lead.company?.trim() || 'Contato';
}

function conversationPhone(item: CrmWhatsAppInboxConversation) {
  const phoneJid = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/.exec(item.remoteJid ?? '');
  return (phoneJid ? '+' + phoneJid[1] : null) ||
    item.contact?.phone || item.contact?.phone2 || item.lead.phone || item.lead.phone2;
}

function activityIsInbound(activity: CrmLeadActivity) {
  return activity.direction === 'INBOUND';
}

export default function WhatsAppInboxPage() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>(
    isSupervisorRole(getStoredUser()?.role) ? 'OPEN' : 'MINE',
  );
  const [queueFilter, setQueueFilter] = useState('all');
  const [queues, setQueues] = useState<WaQueue[]>([]);
  const [stages, setStages] = useState<WaStage[]>([]);
  const [agents, setAgents] = useState<WaAgentStatus[]>([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [productFilter, setProductFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [startingConversation, setStartingConversation] = useState(false);
  const [newConversationError, setNewConversationError] = useState<string | null>(null);
  const [tags, setTags] = useState<CrmLeadTag[]>([]);
  const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
  const [olderConversations, setOlderConversations] = useState<CrmWhatsAppInboxConversation[]>([]);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [draft, setDraft] = useState('');
  const [messageTemplates, setMessageTemplates] = useState<CrmMessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CrmMessageTemplate | null>(null);
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
  const newOperationRef = useRef<{ key: string; id: string } | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const channelId = channelFilter === 'all' ? undefined : Number(channelFilter);
  const inboxParams = useMemo<InboxListParams>(() => {
    const supervisor = isSupervisorRole(getStoredUser()?.role);
    const view: Pick<InboxListParams, 'scope' | 'excludeClosed' | 'status'> =
      viewFilter === 'QUEUE'
        ? { scope: 'QUEUE' }
        : viewFilter === 'MINE'
          ? { scope: 'MINE' }
          : viewFilter === 'OPEN'
            ? { scope: 'ALL', excludeClosed: true }
            : { scope: supervisor ? 'ALL' : 'MINE', status: 'CLOSED' };
    return {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(channelId ? { channelId } : {}),
      ...(unreadOnly ? { unreadOnly: true } : {}),
      ...view,
      ...(queueFilter !== 'all' ? { queueId: Number(queueFilter) } : {}),
      ...(productFilter !== 'all' ? { productInterest: productFilter as ProductInterest } : {}),
      ...(tagFilter !== 'all' ? { tagId: Number(tagFilter) } : {}),
      page: 1,
      pageSize: 50,
    };
  }, [channelId, productFilter, queueFilter, search, tagFilter, unreadOnly, viewFilter]);
  const loadConversations = useCallback(
    () => whatsappAttendanceApi.listConversations(inboxParams),
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
    setSelectedTemplate(null);
    setAttachment(null);
    setNoteMode(false);
    operationIdRef.current = null;
  }, [selected?.id]);

  useEffect(() => {
    setAppointments([]);
    if (selectedLeadContextId === null) {
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
    void whatsappAttendanceApi.listQueues().then(setQueues).catch(() => setQueues([]));
    void whatsappAttendanceApi.listStages().then(setStages).catch(() => setStages([]));
    void whatsappAttendanceApi.listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  useEffect(() => {
    setOlderConversations([]);
  }, [inboxParams]);

  useEffect(() => {
    if (!isSupervisorRole(getStoredUser()?.role)) return;
    void teamApi.list().then(setTeam).catch(() => setTeam([]));
  }, []);

  useEffect(() => {
    if (selectedConversationId === null || !selectedUnreadCount) return;
    void crmLeadsApi
      .markWhatsAppThreadRead(selectedConversationId)
      .then(() => refreshInbox())
      .catch(() => undefined);
  }, [refreshInbox, selectedConversationId, selectedUnreadCount]);

  const messages = useMemo(
    () => {
      const byId = new Map<number, CrmLeadActivity>();
      for (const activity of [...olderMessages, ...(thread?.messages ?? [])]) {
        byId.set(activity.id, activity);
      }
      return [...byId.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id - b.id);
    },
    [olderMessages, thread?.messages],
  );
  const availableTemplates = messageTemplates.filter((item) =>
    !item.productInterest || selected?.lead.productInterests.includes(item.productInterest),
  );
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [lastMessageId]);

  const connectedChannels = channels.filter((channel) =>
    channel.id !== null && channel.status === 'CONNECTED' && !channel.paused,
  );
  const newSender = newChannelId
    ? connectedChannels.find((channel) => String(channel.id) === newChannelId)
    : connectedChannels.find((channel) => channel.isDefault) ?? connectedChannels[0];

  const startConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (startingConversation || !newSender?.id || !newPhone.trim() || !newMessage.trim()) return;
    const phone = newPhone.trim();
    const message = newMessage.trim();
    const key = JSON.stringify([newSender.id, phone, message]);
    if (newOperationRef.current?.key !== key) {
      newOperationRef.current = { key, id: crypto.randomUUID() };
    }
    setStartingConversation(true);
    setNewConversationError(null);
    try {
      const result = await crmLeadsApi.startWhatsAppConversation({
        channelId: newSender.id,
        phone,
        message,
        operationId: newOperationRef.current.id,
      });
      if (result.activity.outcome !== 'SENT') {
        setNewConversationError(result.activity.outcome === 'PENDING'
          ? 'O envio ainda está em confirmação. Confira o histórico antes de repetir.'
          : 'O envio falhou. Confira o número e tente novamente.');
        return;
      }
      setNewConversationOpen(false);
      setNewPhone('');
      setNewMessage('');
      newOperationRef.current = null;
      setSearch('');
      setUnreadOnly(false);
      setChannelFilter('all');
      setQueueFilter('all');
      setProductFilter('all');
      setTagFilter('all');
      setViewFilter(isSupervisorRole(getStoredUser()?.role) ? 'OPEN' : 'MINE');
      setSelectedKey(String(result.conversationId));
      void refreshInbox();
      if (result.conversationId === selectedConversationId) void threadPoll.refresh();
      toast.success('Mensagem enviada.');
    } catch (error) {
      setNewConversationError(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setStartingConversation(false);
    }
  };

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
            selectedTemplate ? { templateId: selectedTemplate.id, templateVersion: selectedTemplate.version } : undefined,
          );
          deliveryActivity = result.activity;
        } else {
          const result = await crmLeadsApi.replyWhatsAppThread(
            selected.id,
            text,
            operationIdRef.current.id,
            selectedTemplate ? { templateId: selectedTemplate.id, templateVersion: selectedTemplate.version } : undefined,
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
      setSelectedTemplate(null);
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

  const runAttendanceAction = async (action: () => Promise<unknown>, successMessage: string) => {
    if (!selected) return;
    try {
      await action();
      await Promise.all([refreshInbox(), threadPoll.refresh()]);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a conversa.');
    }
  };

  const submitTransfer = async () => {
    if (!selected || !transferTarget) return;
    const [kind, rawId] = transferTarget.split(':');
    const id = Number(rawId);
    setTransferring(true);
    try {
      await whatsappAttendanceApi.transfer(
        selected.id,
        kind === 'queue' ? { queueId: id } : { userId: id },
      );
      setTransferOpen(false);
      setTransferTarget('');
      await Promise.all([refreshInbox(), threadPoll.refresh()]);
      toast.success('Conversa transferida.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível transferir a conversa.');
    } finally {
      setTransferring(false);
    }
  };

  const openTransfer = () => {
    setTransferTarget('');
    setTransferOpen(true);
    void whatsappAttendanceApi.listAgents().then(setAgents).catch(() => undefined);
  };

  const closeConversation = () => {
    if (!selected) return;
    if (
      !window.confirm(
        'Encerrar esta conversa? A mensagem de encerramento configurada será enviada ao cliente pelo WhatsApp.',
      )
    ) {
      return;
    }
    void runAttendanceAction(() => whatsappAttendanceApi.close(selected.id), 'Conversa encerrada.');
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
      const result = await whatsappAttendanceApi.listConversations({
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
  const filteredCount = inbox.data?.total ?? 0;
  const selectedPhone = selected ? conversationPhone(selected) : null;
  const selectedName = selected ? conversationName(selected) : '';
  const upcomingAppointment = appointments
    .filter((appointment) => appointment.status === 'SCHEDULED' && new Date(appointment.startsAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
  const appointmentSummary = upcomingAppointment
    ? `${upcomingAppointment.title} · ${new Date(upcomingAppointment.startsAt).toLocaleString('pt-BR')}`
    : appointments[0]
      ? `${appointments[0].title} · ${new Date(appointments[0].startsAt).toLocaleString('pt-BR')}`
      : null;
  const funnelStageSummary = selected?.lead.funnelStage?.name ?? statusLabel;
  const leadDetails = selected ? (
    <dl className="space-y-4 text-sm">
      <Info label="Empresa" value={selected.lead.company} />
      <Info
        label="Telefone"
        value={selectedPhone ? formatPhone(selectedPhone) : null}
      />
      <Info label="E-mail" value={selected.contact?.email || selected.lead.email} />
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
        label="Responsável pelo lead"
        value={selected.lead.owner?.name}
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
        label="Número de atendimento"
        value={`${selected.channelName}${selected.channelPhoneNumber ? ` · +${selected.channelPhoneNumber}` : ''}`}
      />
    </dl>
  ) : null;

  return (
    <div className="mx-auto flex h-full min-h-[38rem] max-w-[1600px] flex-col gap-4 p-3 sm:px-6 sm:py-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-6 w-6 text-success-foreground" />
            <h1 className="text-2xl font-bold text-foreground">WhatsApp</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={newConversationOpen} onOpenChange={(open) => {
            if (startingConversation) return;
            setNewConversationOpen(open);
            if (open) {
              setNewChannelId(connectedChannels.some((channel) => String(channel.id) === channelFilter) ? channelFilter : '');
              setNewConversationError(null);
              void crmLeadsApi.listWhatsAppChannels().then(setChannels).catch(() => undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button type="button">
                <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nova conversa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova conversa</DialogTitle>
                <DialogDescription>Digite o número com DDD. Se for internacional, inclua + e o código do país.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(event) => void startConversation(event)}>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-new-phone">Número do destinatário</Label>
                  <Input id="whatsapp-new-phone" type="tel" autoComplete="tel" placeholder="(11) 99999-9999" maxLength={40}
                    value={newPhone} onChange={(event) => setNewPhone(event.target.value)} disabled={startingConversation} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-new-channel">Enviar pelo canal</Label>
                  <select id="whatsapp-new-channel" value={newSender?.id ?? ''} onChange={(event) => setNewChannelId(event.target.value)}
                    disabled={startingConversation || !connectedChannels.length}
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm">
                    {!newSender && <option value="">{connectedChannels.length ? 'Selecione um canal' : 'Nenhum canal conectado'}</option>}
                    {connectedChannels.map((channel) => (
                      <option key={channel.id} value={channel.id!}>
                        {channel.name}{channel.phoneNumber ? ` · +${channel.phoneNumber}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-new-message">Mensagem</Label>
                  <Textarea id="whatsapp-new-message" rows={4} maxLength={3000} value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)} disabled={startingConversation} required />
                </div>
                {newConversationError && <p role="alert" className="text-sm text-destructive">{newConversationError}</p>}
                <DialogFooter className="gap-2 sm:space-x-0">
                  <Button type="button" variant="outline" disabled={startingConversation} onClick={() => setNewConversationOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={startingConversation || !newSender || !newPhone.trim() || !newMessage.trim()}>
                    {startingConversation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 h-4 w-4" aria-hidden="true" />}
                    {startingConversation ? 'Enviando…' : 'Enviar mensagem'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <AgentStatusToggle />
          <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-success" />
            {filteredCount} conversa{filteredCount === 1 ? '' : 's'}
          </div>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(17rem,21%)_minmax(0,1fr)]">
        <aside aria-label="Conversas" className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col lg:border-r lg:border-border`}>
          <div className="space-y-3 border-b border-border p-4">
            <div className="space-y-1">
              <Label htmlFor="whatsapp-inbox-search" className="text-xs font-semibold text-muted-foreground">
                Buscar conversas
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" aria-hidden="true" />
                <Input
                  id="whatsapp-inbox-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome ou número"
                  className="pl-9"
                  aria-label="Buscar conversas"
                />
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Canal</span>
                <select
                  value={channelFilter}
                  onChange={(event) => setChannelFilter(event.target.value)}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-2 text-sm"
                  aria-label="Filtrar por canal"
                >
                  <option value="all">Todos os canais</option>
                  {channels
                    .filter((channel) => channel.id !== null)
                    .map((channel) => (
                      <option key={channel.id} value={channel.id!}>
                        {channel.name}
                        {channel.phoneNumber ? ` · +${channel.phoneNumber}` : ''}
                      </option>
                    ))}
                </select>
              </label>
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
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar conversas">
              {VIEW_OPTIONS.filter((view) => !view.supervisorOnly || isSupervisorRole(getStoredUser()?.role)).map((view) => {
                const active = viewFilter === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setViewFilter(view.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active ? 'border-success-border bg-success text-success-foreground' : 'border-input bg-card text-muted-foreground hover:bg-muted'}`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Fila</span>
              <select
                value={queueFilter}
                onChange={(event) => setQueueFilter(event.target.value)}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-2 text-sm"
                aria-label="Filtrar fila"
              >
                <option value="all">Todas as filas</option>
                {queues.filter((queue) => queue.active).map((queue) => (
                  <option key={queue.id} value={queue.id}>{queue.name}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Produto</span>
                <select
                  value={productFilter}
                  onChange={(event) => setProductFilter(event.target.value)}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-2 text-sm"
                  aria-label="Filtrar produto"
                >
                  <option value="all">Todos</option>
                  <option value="TELECOM">Telecom</option>
                  <option value="SEGUROS">Seguros</option>
                </select>
              </label>
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Tag</span>
                <select
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-2 text-sm"
                  aria-label="Filtrar tag"
                >
                  <option value="all">Todas</option>
                  {tags.filter((tag) => tag.isActive).map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {inbox.loading && !inbox.data ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando conversas…
              </div>
            ) : inbox.error ? (
              <div className="p-5 text-sm text-danger-foreground">{inbox.error}</div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center text-muted-foreground">
                <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground/80" />
                <p className="font-medium text-foreground">
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
                const title = conversationName(item);
                const phone = conversationPhone(item);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(key);
                    }}
                    aria-current={active ? "true" : undefined}
                    className={`w-full border-b border-border px-4 py-3 text-left transition hover:bg-muted ${active ? 'bg-success/70' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success font-semibold text-success-foreground">
                          {title.trim().slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-foreground">
                            {title}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground/80">
                            {dateLabel(item.lastMessage.occurredAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {[phone && formatPhone(phone), item.channelName].filter(Boolean).join(' · ')}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {messageText(item.lastMessage)}
                        </p>
                        {(item.queue || item.stage || (item.waitingSince && item.status !== 'CLOSED')) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                            {item.queue && (
                              <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                                {item.queue.name}
                              </span>
                            )}
                            {item.stage && (
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: item.stage.color }}
                                  aria-hidden
                                />
                                {item.stage.name}
                              </span>
                            )}
                            {item.waitingSince && item.status !== 'CLOSED' && (
                              <span className="inline-flex items-center gap-1 text-warning-foreground">
                                <Clock className="h-3 w-3" />
                                {waitingLabel(item.waitingSince)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-muted-foreground/80">
                            {[STATUS_LABEL[item.status], item.assignedTo?.name].filter(Boolean).join(' · ')}
                          </span>
                          {item.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-success px-1.5 text-[11px] font-semibold text-success-foreground">
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
          <div className="flex min-h-0 min-w-0 flex-col">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 lg:hidden"
                  onClick={() => setSelectedKey(null)}
                  aria-label="Voltar para conversas"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success font-semibold text-success-foreground">
                  {selectedName.slice(0, 1).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-foreground">
                    {selectedName}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {[selectedPhone && formatPhone(selectedPhone), selected.channelName].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(!selected.assignedTo || selected.assignedTo.id !== getStoredUser()?.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void runAttendanceAction(
                        () => whatsappAttendanceApi.claim(selected.id),
                        'Conversa assumida.',
                      )
                    }
                  >
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    Assumir
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selected.remoteJid || selected.whatsappChannelId === null || selected.channelStatus !== 'CONNECTED'}
                  onClick={() => setShowCall(true)}
                  aria-label="Ligar"
                  title="Ligar"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span className="hidden sm:inline">Ligar</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAppointment(true)}
                  aria-label="Agendar"
                  title="Agendar"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Agendar</span>
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="2xl:hidden" aria-label="Dados do lead" title="Dados do lead">
                      <UserRound className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto" aria-describedby={undefined}>
                    <SheetTitle className="mb-5 pr-6">Dados do lead</SheetTitle>
                    {leadDetails}
                  </SheetContent>
                </Sheet>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" aria-label="Opções do atendimento" title="Opções do atendimento">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="flex max-h-[70dvh] flex-col gap-2 overflow-y-auto">
                    <h3 className="text-sm font-semibold">Opções do atendimento</h3>
                    {selected.status !== 'CLOSED' && (
                      <Button size="sm" variant="outline" onClick={openTransfer}>
                        <ArrowRightLeft className="mr-1.5 h-4 w-4" />
                        Transferir
                      </Button>
                    )}
                    <select
                      value={selected.stage?.id ?? ''}
                      onChange={(event) =>
                        void runAttendanceAction(
                          () =>
                            whatsappAttendanceApi.setStage(
                              selected.id,
                              event.target.value ? Number(event.target.value) : null,
                            ),
                          'Etapa atualizada.',
                        )
                      }
                      className="h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
                      aria-label="Etapa do atendimento"
                    >
                      <option value="">Sem etapa</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                      ))}
                    </select>
                    {selected.status !== 'CLOSED' && (
                      <Button size="sm" variant="outline" onClick={closeConversation}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Encerrar
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
                        className="h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
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
                      className="h-9 rounded-md border border-input bg-card px-2 text-xs"
                      aria-label="Estado da conversa"
                    >
                      {selected.status === 'IN_QUEUE' && <option value="IN_QUEUE" disabled>Na fila</option>}
                      <option value="OPEN">Em atendimento</option>
                      <option value="WAITING">Aguardando</option>
                      <option value="CLOSED">Resolvida</option>
                    </select>
                  </PopoverContent>
                </Popover>
              </div>
            </header>

            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="flex min-h-0 min-w-0 flex-col">
                <div ref={messageListRef} aria-label="Histórico da conversa" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/60 p-4 sm:p-6">
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
                      <div className="flex justify-center py-12 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando histórico…
                      </div>
                    ) : threadPoll.error && !thread ? (
                      <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
                        <p>Não foi possível carregar as mensagens.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => void threadPoll.refresh()}>
                          Tentar novamente
                        </Button>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        Ainda não há mensagens neste atendimento.
                      </div>
                    ) : (
                      messages.map((activity, index) => {
                        const inbound = activityIsInbound(activity);
                        const internalNote = activity.type === 'NOTE' || activity.type === 'STATUS';
                        const deliveryStatus = activity.type === 'WHATSAPP' && activity.direction === 'OUTBOUND'
                          ? OUTBOUND_STATUS_LABEL[activity.outcome ?? '']
                          : null;
                        const day = dateLabel(activity.occurredAt);
                        const startsDay = index === 0 || day !== dateLabel(messages[index - 1].occurredAt);
                        return (
                          <Fragment key={activity.id}>
                          {startsDay && day && <p className="self-center text-xs font-medium text-muted-foreground">{day}</p>}
                          <div
                            className={`flex ${internalNote ? 'justify-center' : inbound ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%] ${internalNote ? 'border border-warning-border bg-warning text-warning-foreground' : inbound ? 'rounded-tl-sm bg-card text-foreground' : 'rounded-tr-sm bg-success text-foreground'}`}
                            >
                              {internalNote && (
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground">
                                  {activity.type === 'NOTE' ? 'Nota interna · não enviada' : 'Registro do atendimento'}
                                </p>
                              )}
                              <WhatsAppMessageContent activity={activity} />
                              {!inbound && typeof activity.metadata?.templateName === 'string' && (
                                <p className="mt-1 text-[10px] text-muted-foreground/80">
                                  Modelo: {activity.metadata.templateName}
                                  {typeof activity.metadata.templateVersion === 'number' ? ` · versão ${activity.metadata.templateVersion}` : ''}
                                </p>
                              )}
                              <p className={`mt-1 text-right text-xs ${activity.outcome === 'FAILED' ? 'font-medium text-danger-foreground' : 'text-muted-foreground'}`}>
                                {timeLabel(activity.occurredAt)}
                                {deliveryStatus && ` · ${deliveryStatus}`}
                              </p>
                            </div>
                          </div>
                          </Fragment>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="min-w-0 shrink-0 border-t border-border bg-card p-3 sm:p-4">
                  {(!selected.remoteJid || selected.whatsappChannelId === null) && (
                    <p className="mb-2 text-xs text-warning-foreground">
                      Este histórico antigo não tem destinatário e canal confirmados. Revise o vínculo antes de responder ou ligar.
                    </p>
                  )}
                  {selected.channelStatus &&
                    selected.channelStatus !== 'CONNECTED' && (
                      <p className="mb-2 text-xs text-warning-foreground">
                        Este número está desconectado. Reconecte-o em Atendimento →
                        Configurações → WhatsApp para responder.
                      </p>
                    )}
                  <form
                    onSubmit={(event) => void sendReply(event)}
                    className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
                  >
                    <div className="col-span-full flex min-w-0 flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant={noteMode ? 'default' : 'outline'}
                        className="shrink-0"
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
                        className="shrink-0"
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
                        <div className="flex items-center gap-2">
                          <WhatsAppTemplatePicker
                            lead={selected.lead}
                            contact={selected.contact}
                            appointment={upcomingAppointment ?? null}
                            templates={availableTemplates}
                            salesperson={getStoredUser()?.name}
                            recipientPhone={selected.contact?.phone ?? selected.contact?.phone2 ?? selectedPhone}
                            disabled={sending}
                            onApply={(template, text) => {
                              setSelectedTemplate(template);
                              setDraft(text.slice(0, 3000));
                              operationIdRef.current = null;
                            }}
                          />
                          {selectedTemplate && <span className="hidden max-w-36 truncate text-xs text-muted-foreground sm:inline" title={`Modelo aplicado: ${selectedTemplate.name}, versão ${selectedTemplate.version}`}>{selectedTemplate.name} · v{selectedTemplate.version}</span>}
                        </div>
                      )}
                    </div>
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
                    {selectedTemplate && !noteMode && <span className="sr-only">Mensagem pronta aplicada: {selectedTemplate.name}, versão {selectedTemplate.version}.</span>}
                    <Button
                      type="submit"
                      disabled={
                        sending ||
                        (!draft.trim() && !attachment) ||
                        !selected.remoteJid ||
                        selected.whatsappChannelId === null ||
                        (!noteMode && selected.channelStatus !== 'CONNECTED')
                      }
                      className="h-11 w-11 shrink-0"
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
                    <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
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
                  <p className="mx-auto mt-1 max-w-3xl text-right text-[10px] text-muted-foreground/80">
                    {noteMode ? 'Somente a equipe verá esta nota' : 'Enter envia · Shift + Enter quebra a linha'}
                  </p>
                </div>
              </div>

              <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-card p-4 2xl:block" aria-label="Dados do lead">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserRound className="h-4 w-4" /> Dados do lead
                </h3>
                {leadDetails}
              </aside>
            </div>
          </div>
        ) : (
          <div className="hidden min-h-0 flex-col items-center justify-center p-8 text-center text-muted-foreground lg:flex">
            <MessagesSquare className="mb-3 h-8 w-8" />
            <h2 className="font-semibold text-foreground">Selecione uma conversa</h2>
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
          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Transferir conversa</DialogTitle>
                <DialogDescription>
                  Envie para uma fila (a conversa entra na fila e é distribuída) ou para um atendente específico.
                </DialogDescription>
              </DialogHeader>
              <select
                value={transferTarget}
                onChange={(event) => setTransferTarget(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                aria-label="Destino da transferência"
              >
                <option value="">Escolha um destino…</option>
                <optgroup label="Filas">
                  {queues.filter((queue) => queue.active).map((queue) => (
                    <option key={`queue:${queue.id}`} value={`queue:${queue.id}`}>{queue.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Atendentes">
                  {agents.map((agent) => (
                    <option key={`user:${agent.userId}`} value={`user:${agent.userId}`}>
                      {agent.name} · {AGENT_STATUS_LABEL[agent.status]}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setTransferOpen(false)} disabled={transferring}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={!transferTarget || transferring}
                  onClick={() => void submitTransfer()}
                >
                  {transferring && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Transferir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-foreground">{value}</dd>
    </div>
  );
}
