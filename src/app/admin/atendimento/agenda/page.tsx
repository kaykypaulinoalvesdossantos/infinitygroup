'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Link2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { crmLeadsApi, getStoredUser, isSupervisorRole, PRODUCT_INTERESTS, teamApi, type CrmAppointment, type CrmAppointmentInput, type CrmCalendarEvent, type CrmLead, type GoogleCalendarStatus, type ProductInterest, type TeamUser } from '@/services/crm-leads';
import { telephonyService, type DialerCampaign } from '@/services/telephony';

type CalendarView = 'DAY' | 'WEEK' | 'MONTH' | 'LIST';
type Draft = {
  operationId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  leadId: string;
  contactId: string;
  campaignId: string;
  ownerId: string;
  appointmentType: NonNullable<CrmAppointment['appointmentType']>;
  productInterest: '' | ProductInterest;
  guestName: string;
  guestEmail: string;
  attendees: string;
  location: string;
  description: string;
  includeMeet: boolean;
  sendInvites: boolean;
  allowConflict: boolean;
};

const TYPES: { id: NonNullable<CrmAppointment['appointmentType']>; label: string; color: string }[] = [
  { id: 'MEETING', label: 'Reunião', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'PRESENTATION_TELECOM', label: 'Apresentação Telecom', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { id: 'PRESENTATION_SEGUROS', label: 'Apresentação Seguros', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'CALLBACK', label: 'Retorno', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'INTERNAL', label: 'Interno', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'OTHER', label: 'Outro', color: 'bg-pink-100 text-pink-800 border-pink-200' },
];
const STATUS_LABEL: Record<CrmAppointment['status'], string> = {
  SCHEDULED: 'Agendado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não compareceu',
};
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, count: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
const startOfWeek = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
const localDateTimeInput = (date: Date) => `${localDateKey(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
const displayDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => new Intl.DateTimeFormat('pt-BR', options).format(date);
const eventStart = (event: Pick<CrmAppointment, 'allDay' | 'startsAt'>) => event.allDay && /^\d{4}-\d{2}-\d{2}$/.test(event.startsAt) ? parseLocalDate(event.startsAt) : new Date(event.startsAt);
const eventEnd = (event: Pick<CrmAppointment, 'allDay' | 'endsAt'>) => event.allDay && /^\d{4}-\d{2}-\d{2}$/.test(event.endsAt) ? parseLocalDate(event.endsAt) : new Date(event.endsAt);
const eventOccursOn = (event: Pick<CrmAppointment, 'allDay' | 'startsAt' | 'endsAt'>, date: Date) => eventStart(event) < addDays(startOfDay(date), 1) && eventEnd(event) > startOfDay(date);
const getType = (type?: CrmAppointment['appointmentType']) => TYPES.find((item) => item.id === type) ?? TYPES[0];
const makeDraft = (start: Date, ownerId: number): Draft => {
  const startsAt = new Date(start);
  const endsAt = new Date(start.getTime() + 30 * 60_000);
  return {
    operationId: crypto.randomUUID(), title: '', startsAt: localDateTimeInput(startsAt), endsAt: localDateTimeInput(endsAt),
    startDate: localDateKey(startsAt), endDate: localDateKey(endsAt), allDay: false,
    leadId: '', contactId: '', campaignId: '', ownerId: String(ownerId), appointmentType: 'MEETING',
    productInterest: '', guestName: '', guestEmail: '', attendees: '', location: '',
    description: '', includeMeet: false, sendInvites: false, allowConflict: false,
  };
};
const defaultAppointmentStart = (date: Date) => {
  const today = startOfDay(new Date());
  if (localDateKey(date) !== localDateKey(today)) {
    const start = startOfDay(date);
    start.setHours(9, 0, 0, 0);
    return start;
  }
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
  if (start.getHours() < 8) start.setHours(9, 0, 0, 0);
  if (start.getHours() >= 18) {
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
  }
  return start;
};
const inputClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-600';

export default function AgendaPage() {
  const currentUser = getStoredUser();
  const supervisor = isSupervisorRole(currentUser?.role);
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<CalendarView>('WEEK');
  const [scope, setScope] = useState<'MINE' | 'TEAM'>('MINE');
  const [ownerId, setOwnerId] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [source, setSource] = useState<'ALL' | 'CRM' | 'GOOGLE'>('ALL');
  const [status, setStatus] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [appointments, setAppointments] = useState<CrmCalendarEvent[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: number; name: string; role: string | null; email: string | null; phone: string | null }>>([]);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [campaigns, setCampaigns] = useState<DialerCampaign[]>([]);
  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatus | null>(null);
  const [googleMeta, setGoogleMeta] = useState<{ connected: boolean; partialError: string | null }>({ connected: false, partialError: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<CrmAppointment | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const range = useMemo(() => {
    if (view === 'DAY') return { from: startOfDay(anchor), to: addDays(anchor, 1) };
    if (view === 'MONTH') {
      const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const gridStart = startOfWeek(first);
      return { from: gridStart, to: addDays(gridStart, 42) };
    }
    if (view === 'LIST') return { from: startOfDay(anchor), to: addDays(anchor, 30) };
    const weekStart = startOfWeek(anchor);
    return { from: weekStart, to: addDays(weekStart, 7) };
  }, [anchor, view]);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const result = await crmLeadsApi.listCalendarAppointments({
        from: range.from.toISOString(), to: range.to.toISOString(), scope,
        ...(ownerId ? { ownerId: Number(ownerId) } : {}),
        ...(productInterest ? { productInterest: productInterest as ProductInterest } : {}),
        ...(appointmentType ? { appointmentType: appointmentType as CrmAppointment['appointmentType'] } : {}),
        ...(status ? { status: status as CrmAppointment['status'] } : {}),
        ...(campaignId ? { campaignId: Number(campaignId) } : {}), source,
        includeGoogle: scope === 'MINE' && source !== 'CRM', page: 1, pageSize: 200,
      });
      setAppointments(result.items);
      setGoogleMeta(result.google);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  }, [range, scope, ownerId, productInterest, appointmentType, status, campaignId, source]);

  useEffect(() => { void loadCalendar(); }, [loadCalendar]);
  useEffect(() => {
    void crmLeadsApi.list({ page: 1, pageSize: 200 }).then((result) => setLeads(result.items)).catch(() => setLeads([]));
    void crmLeadsApi.googleCalendarStatus().then(setCalendarStatus).catch(() => setCalendarStatus(null));
    void telephonyService.listCampaigns(true).then(setCampaigns).catch(() => setCampaigns([]));
    if (supervisor) void teamApi.list().then((result) => setUsers(result.filter((user) => user.active))).catch(() => setUsers([]));
  }, [supervisor]);

  const navigate = (direction: number) => {
    if (view === 'MONTH') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1));
    else setAnchor(addDays(anchor, direction * (view === 'DAY' ? 1 : view === 'LIST' ? 7 : 7)));
  };
  const heading = view === 'MONTH'
    ? displayDate(anchor, { month: 'long', year: 'numeric' })
    : view === 'DAY'
      ? displayDate(anchor, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : view === 'LIST'
        ? `${displayDate(anchor, { day: 'numeric', month: 'short' })} – ${displayDate(addDays(anchor, 29), { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `${displayDate(startOfWeek(anchor), { day: 'numeric', month: 'short' })} – ${displayDate(addDays(startOfWeek(anchor), 6), { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const beginCreate = (date: Date) => {
    const next = makeDraft(defaultAppointmentStart(date), currentUser?.id ?? 0);
    setContacts([]);
    setDraft(next);
    setEditing(null);
  };
  const beginEdit = (appointment: CrmCalendarEvent) => {
    if (appointment.source === 'GOOGLE') {
      if (appointment.externalHtmlLink) window.open(appointment.externalHtmlLink, '_blank', 'noopener,noreferrer');
      return;
    }
    const start = eventStart(appointment);
    const end = eventEnd(appointment);
    setDraft({
      ...makeDraft(start, appointment.ownerId), title: appointment.title,
      startsAt: localDateTimeInput(start), endsAt: localDateTimeInput(end),
      startDate: localDateKey(start), endDate: localDateKey(end), allDay: Boolean(appointment.allDay),
      leadId: appointment.leadId ? String(appointment.leadId) : '',
      contactId: appointment.contactId ? String(appointment.contactId) : '',
      campaignId: appointment.campaignId ? String(appointment.campaignId) : '',
      ownerId: String(appointment.ownerId), appointmentType: appointment.appointmentType ?? 'MEETING',
      productInterest: appointment.productInterest ?? '', guestName: appointment.guestName ?? '',
      guestEmail: appointment.guestEmail ?? '', attendees: (appointment.attendees ?? []).join(', '),
      location: appointment.location ?? '', description: appointment.description ?? '',
      includeMeet: Boolean(appointment.includeMeet), sendInvites: Boolean(appointment.sendInvites), allowConflict: false,
    });
    setEditing(appointment);
    if (appointment.leadId) {
      void crmLeadsApi.get(appointment.leadId).then((detail) => setContacts(detail.contacts)).catch(() => setContacts([]));
    } else {
      setContacts([]);
    }
  };

  const selectLead = async (leadId: string) => {
    setContacts([]);
    setDraft((current) => current ? { ...current, leadId, contactId: '', ...(leadId ? {} : { campaignId: '' }) } : current);
    if (!leadId) return;
    try {
      const detail = await crmLeadsApi.get(Number(leadId));
      setContacts(detail.contacts);
      const primary = detail.contacts.find((contact) => contact.isPrimary);
      setDraft((current) => current ? {
        ...current,
        leadId,
        contactId: primary ? String(primary.id) : '',
        guestName: current.guestName || primary?.name || detail.name,
        guestEmail: current.guestEmail || primary?.email || detail.email || '',
      } : current);
    } catch {
      toast.error('Não foi possível carregar os contatos deste lead.');
    }
  };

  const saveAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const startsAt = draft.allDay ? new Date(`${draft.startDate}T00:00:00`) : new Date(draft.startsAt);
    const endsAt = draft.allDay ? new Date(`${draft.endDate}T00:00:00`) : new Date(draft.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      toast.error('Informe uma data e horário válidos.');
      return;
    }
    const attendeeList = draft.attendees.split(/[;,\n]/).map((email) => email.trim().toLowerCase()).filter(Boolean);
    const body: CrmAppointmentInput = {
      title: draft.title.trim(), startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      ...(draft.leadId ? { leadId: Number(draft.leadId) } : {}),
      ...(draft.contactId ? { contactId: Number(draft.contactId) } : {}),
      ...(draft.campaignId ? { campaignId: Number(draft.campaignId) } : {}),
      ...(supervisor && draft.ownerId ? { ownerId: Number(draft.ownerId) } : {}),
      appointmentType: draft.appointmentType,
      ...(draft.productInterest ? { productInterest: draft.productInterest } : {}),
      ...(draft.guestName.trim() ? { guestName: draft.guestName.trim() } : {}),
      ...(draft.guestEmail.trim() ? { guestEmail: draft.guestEmail.trim() } : {}),
      ...(attendeeList.length ? { attendees: [...new Set(attendeeList)] } : {}),
      ...(draft.location.trim() ? { location: draft.location.trim() } : {}),
      ...(draft.description.trim() ? { description: draft.description.trim() } : {}),
      allDay: draft.allDay, includeMeet: draft.includeMeet, sendInvites: draft.sendInvites,
      allowConflict: draft.allowConflict,
    };
    setSaving(true);
    try {
      if (editing) {
        await crmLeadsApi.updateAppointment(editing.id, {
          title: body.title,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          timezone: body.timezone,
          appointmentType: body.appointmentType,
          productInterest: body.productInterest ?? null,
          contactId: draft.contactId ? Number(draft.contactId) : null,
          guestName: body.guestName ?? null,
          guestEmail: body.guestEmail ?? null,
          attendees: body.attendees ?? [],
          description: body.description ?? null,
          location: body.location ?? null,
          allDay: body.allDay,
          includeMeet: body.includeMeet,
          sendInvites: body.sendInvites,
          allowConflict: body.allowConflict,
          expectedVersion: editing.version,
        });
        toast.success('Compromisso atualizado.');
      } else {
        await crmLeadsApi.createCalendarAppointment({ ...body, operationId: draft.operationId });
        toast.success('Compromisso criado.');
      }
      setDraft(null);
      setEditing(null);
      await loadCalendar();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o compromisso.';
      if (!draft.allowConflict && /conflito|horário|Google Calendar/i.test(message) && window.confirm(`${message}\n\nDeseja salvar mesmo assim?`)) {
        setDraft({ ...draft, allowConflict: true });
        toast.info('Marque “salvar apesar do conflito” e salve novamente.');
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const setAppointmentStatus = async (appointment: CrmAppointment, nextStatus: CrmAppointment['status']) => {
    try {
      await crmLeadsApi.updateAppointmentStatus(appointment.id, nextStatus, appointment.version);
      toast.success(`Compromisso ${STATUS_LABEL[nextStatus].toLowerCase()}.`);
      await loadCalendar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o compromisso.');
    }
  };

  const connectGoogle = async () => {
    setGoogleBusy(true);
    try {
      const result = await crmLeadsApi.connectGoogleCalendar();
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível conectar o Google Calendar.');
      setGoogleBusy(false);
    }
  };

  const dates = useMemo(() => {
    if (view === 'DAY') return [startOfDay(anchor)];
    if (view === 'MONTH') return Array.from({ length: 42 }, (_, index) => addDays(startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1)), index));
    if (view === 'LIST') return Array.from({ length: 30 }, (_, index) => addDays(startOfDay(anchor), index));
    return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchor), index));
  }, [view, anchor]);

  const appointmentCard = (appointment: CrmCalendarEvent, compact = false) => {
    const type = getType(appointment.appointmentType);
    const starts = eventStart(appointment);
    const leadName = appointment.lead?.company || appointment.lead?.name;
    return (
      <button key={`${appointment.source ?? 'CRM'}-${appointment.id}`} type="button" onClick={() => beginEdit(appointment)} className={`w-full rounded-lg border px-2.5 py-2 text-left transition hover:shadow-sm ${appointment.source === 'GOOGLE' ? 'border-slate-200 bg-slate-50 text-slate-700' : type.color}`}>
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-semibold">{appointment.title}</span>
          {appointment.source === 'GOOGLE' && <ExternalLink className="h-3 w-3 shrink-0" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] opacity-80">
          {!appointment.allDay && <span>{displayDate(starts, { hour: '2-digit', minute: '2-digit' })}</span>}
          {leadName && <span className="truncate">{leadName}</span>}
          {appointment.owner?.name && <span className="truncate">{appointment.owner.name}</span>}
          {appointment.allDay && <span>Dia inteiro</span>}
          {!compact && appointment.status !== 'SCHEDULED' && <span>{STATUS_LABEL[appointment.status]}</span>}
        </div>
      </button>
    );
  };

  const monthDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <main className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><CalendarDays className="h-5 w-5" /></span>
            <div><h1 className="text-2xl font-bold text-slate-900">Agenda</h1><p className="text-sm text-slate-500">Reuniões, retornos e compromissos do CRM e Google Calendar.</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadCalendar()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
            <Button onClick={() => beginCreate(new Date())}><Plus className="mr-2 h-4 w-4" />Novo compromisso</Button>
          </div>
        </header>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAnchor(startOfDay(new Date()))}>Hoje</Button>
            <Button variant="ghost" size="icon" aria-label="Período anterior" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Próximo período" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
            <h2 className="ml-1 min-w-[150px] text-lg font-semibold capitalize text-slate-900">{heading}</h2>
          </div>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(['DAY', 'WEEK', 'MONTH', 'LIST'] as CalendarView[]).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{({ DAY: 'Dia', WEEK: 'Semana', MONTH: 'Mês', LIST: 'Lista' })[item]}</button>)}
          </div>
        </section>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <label><span className={labelClass}>Agenda</span><select className={inputClass} value={scope} onChange={(event) => { setScope(event.target.value as 'MINE' | 'TEAM'); setOwnerId(''); }}><option value="MINE">Minha agenda</option>{supervisor && <option value="TEAM">Equipe</option>}</select></label>
          {supervisor && scope === 'TEAM' && <label><span className={labelClass}>Responsável</span><select className={inputClass} value={ownerId} onChange={(event) => setOwnerId(event.target.value)}><option value="">Toda a equipe</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>}
          <label><span className={labelClass}>Produto</span><select className={inputClass} value={productInterest} onChange={(event) => setProductInterest(event.target.value)}><option value="">Todos</option>{PRODUCT_INTERESTS.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}</select></label>
          <label><span className={labelClass}>Tipo</span><select className={inputClass} value={appointmentType} onChange={(event) => setAppointmentType(event.target.value)}><option value="">Todos</option>{TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
          <label><span className={labelClass}>Origem</span><select className={inputClass} value={source} onChange={(event) => setSource(event.target.value as typeof source)}><option value="ALL">CRM + Google</option><option value="CRM">Somente CRM</option><option value="GOOGLE">Somente Google</option></select></label>
          <label><span className={labelClass}>Status</span><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos</option>{Object.entries(STATUS_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label><span className={labelClass}>Campanha</span><select className={inputClass} value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">Todas</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${calendarStatus?.connected ? 'bg-emerald-500' : 'bg-slate-300'}`} /><span>{calendarStatus?.connected ? `Google Calendar conectado${calendarStatus.email ? ` · ${calendarStatus.email}` : ''}` : 'Google Calendar não conectado'}</span></div>
          {calendarStatus?.configured && <Button variant="outline" size="sm" onClick={() => void connectGoogle()} disabled={googleBusy}><Link2 className="mr-2 h-4 w-4" />{googleBusy ? 'Conectando…' : calendarStatus.connected ? 'Atualizar acesso Google' : 'Conectar Google Calendar'}</Button>}
          {!calendarStatus?.configured && <span className="text-xs text-amber-700">Integração Google não configurada no servidor.</span>}
          {googleMeta.partialError && <span className="w-full text-xs text-amber-700">{googleMeta.partialError}</span>}
        </section>

        {pageError && <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{pageError}</span><Button variant="outline" size="sm" onClick={() => void loadCalendar()}>Tentar novamente</Button></div>}
        {loading && <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Carregando agenda…</div>}

        {!loading && !pageError && view === 'MONTH' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200">{monthDays.map((day) => <div key={day} className="p-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</div>)}</div>
          <div className="grid grid-cols-7">
            {dates.map((date) => {
              const events = appointments.filter((item) => eventOccursOn(item, date)).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
              const isCurrentMonth = date.getMonth() === anchor.getMonth();
              return <div key={localDateKey(date)} className={`min-h-[112px] border-b border-r border-slate-100 p-1.5 md:min-h-[145px] ${isCurrentMonth ? '' : 'bg-slate-50/70'}`} onDoubleClick={() => beginCreate(date)}>
                <button type="button" onClick={() => beginCreate(date)} className={`mb-1 grid h-7 w-7 place-items-center rounded-full text-xs ${localDateKey(date) === localDateKey(new Date()) ? 'bg-blue-600 font-bold text-white' : isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400'}`}>{date.getDate()}</button>
                <div className="space-y-1">{events.slice(0, 3).map((item) => appointmentCard(item, true))}{events.length > 3 && <p className="px-1 text-[11px] font-medium text-slate-500">+{events.length - 3} mais</p>}</div>
              </div>;
            })}
          </div>
        </section>}

        {!loading && !pageError && view === 'WEEK' && <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {dates.map((date) => {
            const events = appointments.filter((item) => eventOccursOn(item, date)).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
            return <div key={localDateKey(date)} className="min-h-56 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <button type="button" onClick={() => { setAnchor(date); setView('DAY'); }} className={`mb-3 flex w-full items-center justify-between border-b border-slate-100 pb-2 text-left ${localDateKey(date) === localDateKey(new Date()) ? 'text-blue-700' : 'text-slate-800'}`}><span className="text-xs font-semibold uppercase text-slate-500">{displayDate(date, { weekday: 'short' })}</span><span className="text-lg font-bold">{date.getDate()}</span></button>
              <div className="space-y-2">{events.map((item) => appointmentCard(item))}{!events.length && <button type="button" onClick={() => beginCreate(date)} className="w-full rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-400 hover:border-blue-300 hover:text-blue-600">+ Adicionar</button>}</div>
            </div>;
          })}
        </section>}

        {!loading && !pageError && (view === 'DAY' || view === 'LIST') && <section className="space-y-3">
          {dates.map((date) => {
            const events = appointments.filter((item) => eventOccursOn(item, date)).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
            if (view === 'DAY' && !events.length) return <div key={localDateKey(date)} className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-800">Nenhum compromisso neste dia</p><p className="mt-1 text-sm text-slate-500">Use o botão abaixo para agendar um horário.</p><Button className="mt-4" onClick={() => beginCreate(date)}><Plus className="mr-2 h-4 w-4" />Agendar</Button></div>;
            return <div key={localDateKey(date)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold capitalize text-slate-800">{displayDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>{view === 'LIST' && <span className="text-xs text-slate-500">{events.length} compromisso(s)</span>}</div>
              <div className="space-y-2">{events.map((item) => <div key={`${item.source ?? 'CRM'}-${item.id}`} className="flex items-stretch gap-3"><div className="flex w-16 shrink-0 flex-col items-center justify-center text-xs text-slate-500">{item.allDay ? 'Dia todo' : displayDate(eventStart(item), { hour: '2-digit', minute: '2-digit' })}<span className="my-1 h-full w-px bg-slate-200" /></div><div className="min-w-0 flex-1">{appointmentCard(item)}{item.source !== 'GOOGLE' && <div className="mt-1 flex flex-wrap gap-2 pl-1">{item.status === 'SCHEDULED' && <><button type="button" onClick={() => void setAppointmentStatus(item, 'COMPLETED')} className="text-[11px] font-medium text-emerald-700 hover:underline">Concluir</button><button type="button" onClick={() => void setAppointmentStatus(item, 'NO_SHOW')} className="text-[11px] font-medium text-amber-700 hover:underline">Não compareceu</button><button type="button" onClick={() => void setAppointmentStatus(item, 'CANCELLED')} className="text-[11px] font-medium text-red-700 hover:underline">Cancelar</button></>}</div>}</div></div>)}{!events.length && <button type="button" onClick={() => beginCreate(date)} className="w-full rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-600">Sem compromisso · adicionar</button>}</div>
            </div>;
          })}
        </section>}

        {!loading && !pageError && appointments.length === 0 && <p className="text-center text-xs text-slate-400">A agenda usa o fuso local do navegador. Reuniões criadas no CRM ficam disponíveis mesmo se a sincronização do Google falhar.</p>}
      </div>

      {draft && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 md:items-center md:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { setDraft(null); setEditing(null); } }}>
        <form onSubmit={saveAppointment} className="max-h-[94vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl md:rounded-2xl md:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{editing ? 'Editar compromisso' : 'Novo compromisso'}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editing ? editing.title : 'Agendar na agenda'}</h2></div><button type="button" onClick={() => { setDraft(null); setEditing(null); }} className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100">Fechar</button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={labelClass}>Título *</span><input className={inputClass} required maxLength={200} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Ex.: Apresentação comercial" /></label>
            <label><span className={labelClass}>{draft.allDay ? 'Data inicial *' : 'Início *'}</span><input className={inputClass} required type={draft.allDay ? 'date' : 'datetime-local'} value={draft.allDay ? draft.startDate : draft.startsAt} onChange={(event) => setDraft({ ...draft, ...(draft.allDay ? { startDate: event.target.value } : { startsAt: event.target.value }) })} /></label>
            <label><span className={labelClass}>{draft.allDay ? 'Data final (exclusiva) *' : 'Fim *'}</span><input className={inputClass} required type={draft.allDay ? 'date' : 'datetime-local'} value={draft.allDay ? draft.endDate : draft.endsAt} onChange={(event) => setDraft({ ...draft, ...(draft.allDay ? { endDate: event.target.value } : { endsAt: event.target.value }) })} /></label>
            <label><span className={labelClass}>Tipo *</span><select className={inputClass} value={draft.appointmentType} onChange={(event) => setDraft({ ...draft, appointmentType: event.target.value as Draft['appointmentType'] })}>{TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
            <label><span className={labelClass}>Produto</span><select className={inputClass} value={draft.productInterest} onChange={(event) => setDraft({ ...draft, productInterest: event.target.value as Draft['productInterest'] })}><option value="">Não definido</option>{PRODUCT_INTERESTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label><span className={labelClass}>Lead (opcional)</span><select className={inputClass} value={draft.leadId} onChange={(event) => void selectLead(event.target.value)}><option value="">Evento interno / sem lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.company || lead.name}</option>)}</select></label>
            <label><span className={labelClass}>Contato do lead</span><select className={inputClass} value={draft.contactId} disabled={!draft.leadId} onChange={(event) => {
              const contact = contacts.find((item) => item.id === Number(event.target.value));
              setDraft({ ...draft, contactId: event.target.value, guestName: contact?.name ?? draft.guestName, guestEmail: contact?.email ?? draft.guestEmail });
            }}><option value="">Sem contato específico</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}{contact.role ? ` · ${contact.role}` : ''}</option>)}</select></label>
            <label><span className={labelClass}>Campanha (opcional)</span><select className={inputClass} disabled={!draft.leadId || Boolean(editing)} value={draft.campaignId} onChange={(event) => setDraft({ ...draft, campaignId: event.target.value })}><option value="">Sem campanha</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
            {supervisor && <label><span className={labelClass}>Responsável</span><select className={inputClass} disabled={Boolean(editing)} value={draft.ownerId} onChange={(event) => setDraft({ ...draft, ownerId: event.target.value })}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>}
            <label><span className={labelClass}>Nome do contato</span><input className={inputClass} maxLength={255} value={draft.guestName} onChange={(event) => setDraft({ ...draft, guestName: event.target.value })} /></label>
            <label><span className={labelClass}>E-mail do contato/convite</span><input className={inputClass} type="email" value={draft.guestEmail} onChange={(event) => setDraft({ ...draft, guestEmail: event.target.value })} placeholder="cliente@empresa.com" /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Convidados adicionais (separe por vírgula)</span><input className={inputClass} value={draft.attendees} onChange={(event) => setDraft({ ...draft, attendees: event.target.value })} placeholder="gestor@empresa.com, cliente@empresa.com" /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Local ou link</span><input className={inputClass} maxLength={500} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Google Meet, telefone ou endereço" /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Pauta / observações</span><textarea className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" maxLength={5000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          </div>
          <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
          {[['allDay', 'Dia inteiro'], ['sendInvites', 'Enviar convite pelo Google'], ['includeMeet', 'Criar link do Google Meet'], ['allowConflict', 'Salvar apesar de conflito']].map(([key, label]) => <label key={key} className="flex items-center gap-2 text-slate-700"><input type="checkbox" checked={draft[key as keyof Draft] as boolean} onChange={(event) => {
            if (key === 'allDay') {
              const checked = event.target.checked;
              const startDate = checked ? (draft.startsAt.slice(0, 10)) : draft.startDate;
              const nextEndDate = addDays(parseLocalDate(startDate), 1);
              setDraft({
                ...draft,
                allDay: checked,
                ...(checked
                  ? { startDate, endDate: localDateKey(nextEndDate) }
                  : { startsAt: `${draft.startDate}T09:00`, endsAt: `${draft.startDate}T09:30` }),
              });
              return;
            }
            setDraft({ ...draft, [key]: event.target.checked });
          }} className="h-4 w-4 rounded border-slate-300 text-blue-600" />{label}</label>)}
          </div>
          {editing && <div className="flex flex-wrap gap-2 text-xs text-slate-500"><span>Status: {STATUS_LABEL[editing.status]}</span><span>·</span><span>Sincronização Google: {editing.googleSyncStatus}</span>{editing.inviteStatus && <><span>·</span><span>Convites: {editing.inviteStatus}</span></>}{editing.meetUrl && <a href={editing.meetUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">Abrir Meet</a>}{editing.googleSyncError && <span className="w-full text-amber-700">{editing.googleSyncError}</span>}</div>}
          {draft.allowConflict && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Este compromisso será salvo mesmo se houver sobreposição no CRM ou no Google Calendar.</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><Button type="button" variant="outline" onClick={() => { setDraft(null); setEditing(null); }}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar compromisso'}</Button></div>
        </form>
      </div>}
    </main>
  );
}
