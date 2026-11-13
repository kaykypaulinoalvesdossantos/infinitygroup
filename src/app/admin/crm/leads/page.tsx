'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    Clock,
    FileUp,
    Loader2,
    LayoutGrid,
    List as ListIcon,
    Phone,
    Plus,
    Search,
    UserRound,
} from 'lucide-react';
import {
    crmLeadsApi,
    getStoredUser,
    isSalesRole,
    isSupervisorRole,
    LEAD_STATUSES,
    PRODUCT_INTERESTS,
    teamApi,
    type CrmLead,
    type LeadStatus,
    type ProductInterest,
    type TeamUser,
} from '@/services/crm-leads';
import { CALL_STATUS_LABEL, telephonyService, type PhoneCallStatus } from '@/services/telephony';
import { cn } from '@/lib/utils';
import { NewLeadDialog, LeadDetailDialog } from '@/components/admin/crm/lead-dialogs';
import { ImportLeadsDialog } from '@/components/admin/crm/import-leads-dialog';
import { errorMessage, formatDateTime, formatPhone, isOverdue, stageColor, stageLabel } from '@/components/admin/crm/format';

type View = 'kanban' | 'list';
type Board = Record<LeadStatus, CrmLead[]>;

const PAGE_SIZE = 50;

/** Move um lead entre colunas (ou reordena dentro da mesma) sem tocar na API. */
function moveInBoard(board: Board, leadId: number, from: LeadStatus, to: LeadStatus, toIndex: number, lostReason?: string): Board {
    const lead = board[from].find((l) => l.id === leadId);
    if (!lead) return board;
    const updated: CrmLead = { ...lead, status: to, ...(to === 'LOST' && lostReason !== undefined ? { lostReason } : {}) };
    const remaining = board[from].filter((l) => l.id !== leadId);
    const destBase = from === to ? remaining : board[to];
    const destination = [...destBase.slice(0, toIndex), updated, ...destBase.slice(toIndex)];
    const next: Board = { ...board };
    if (from === to) {
        next[from] = destination;
    } else {
        next[from] = remaining;
        next[to] = destination;
    }
    return next;
}

function KanbanCard({
    lead,
    index,
    isSupervisor,
    callingId,
    onCall,
    onOpen,
}: {
    lead: CrmLead;
    index: number;
    isSupervisor: boolean;
    callingId: number | null;
    onCall: (lead: CrmLead) => void;
    onOpen: (lead: CrmLead) => void;
}) {
    const overdue = isOverdue(lead.nextActionAt);
    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'space-y-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-[#0076FF]/30',
                    )}
                >
                    <button type="button" onClick={() => onOpen(lead)} className="block w-full text-left">
                        <p className="truncate text-sm font-semibold text-slate-900 hover:text-[#0076FF]">{lead.company || lead.name}</p>
                        {lead.company && <p className="truncate text-xs text-slate-500">{lead.name}</p>}
                    </button>

                    {lead.productInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {lead.productInterests.map((interest) => (
                                <Badge key={interest} variant="secondary" className="text-[10px]">
                                    {PRODUCT_INTERESTS.find((item) => item.id === interest)?.label ?? interest}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {formatPhone(lead.phone)}
                        </p>
                        {isSupervisor && (
                            <p className="flex items-center gap-1.5">
                                <UserRound className="h-3.5 w-3.5 text-slate-400" />
                                <span className="truncate">{lead.owner?.name ?? 'Sem responsável'}</span>
                            </p>
                        )}
                        {lead.nextActionAt && (
                            <p className={cn('flex items-center gap-1.5', overdue && 'font-medium text-red-600')}>
                                <Clock className="h-3.5 w-3.5" />
                                {overdue ? 'Atrasado: ' : 'Próxima ação: '}
                                {formatDateTime(lead.nextActionAt)}
                            </p>
                        )}
                        {lead.lastCall && (
                            <p className="text-slate-500">
                                Última ligação: {CALL_STATUS_LABEL[lead.lastCall.status as PhoneCallStatus] ?? lead.lastCall.status}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!lead.phone || callingId === lead.id}
                            onClick={() => onCall(lead)}
                            className="h-8 flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                            {callingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                            Ligar
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => onOpen(lead)} className="h-8 flex-1">
                            Abrir
                        </Button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default function CrmLeadsPage() {
    const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
    const isSupervisor = isSupervisorRole(user?.role);

    const [view, setView] = useState<View>('kanban');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('all');
    const [productFilter, setProductFilter] = useState<'all' | ProductInterest>('all');
    const [owners, setOwners] = useState<TeamUser[]>([]);
    const [page, setPage] = useState(1);

    const [board, setBoard] = useState<Board | null>(null);
    const [list, setList] = useState<{ items: CrmLead[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const requestRef = useRef(0);

    const [selected, setSelected] = useState<number[]>([]);
    const [assignOwner, setAssignOwner] = useState('');
    const [assigning, setAssigning] = useState(false);

    const [detailId, setDetailId] = useState<number | null>(null);
    const [newOpen, setNewOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [callingId, setCallingId] = useState<number | null>(null);

    const [lostDraft, setLostDraft] = useState<{ lead: CrmLead; fromStatus: LeadStatus; toIndex: number; reason: string } | null>(null);
    const [savingLost, setSavingLost] = useState(false);

    const ownerParam = ownerFilter === 'all' ? undefined : Number(ownerFilter);
    const productParam = productFilter === 'all' ? undefined : productFilter;

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    useEffect(() => {
        if (!isSupervisor) return;
        teamApi
            .list()
            .then((all) => setOwners(all.filter((u) => u.active && isSalesRole(u.role))))
            .catch((err) => toast.error(errorMessage(err, 'Não foi possível carregar os responsáveis.')));
    }, [isSupervisor]);

    // Busca com atraso para nao disparar uma requisicao a cada tecla
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const load = useCallback(async () => {
        const reqId = ++requestRef.current;
        setLoading(true);
        setLoadError('');
        try {
            if (view === 'kanban') {
                const res = await crmLeadsApi.board({ ownerId: ownerParam, search: search || undefined, productInterest: productParam });
                if (reqId === requestRef.current) setBoard(res.columns);
            } else {
                const res = await crmLeadsApi.list({ ownerId: ownerParam, search: search || undefined, productInterest: productParam, page, pageSize: PAGE_SIZE });
                if (reqId === requestRef.current) setList({ items: res.items, total: res.total });
            }
        } catch (err) {
            if (reqId === requestRef.current) setLoadError(errorMessage(err, 'Não foi possível carregar os leads.'));
        } finally {
            if (reqId === requestRef.current) setLoading(false);
        }
    }, [view, ownerParam, productParam, search, page]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setSelected([]);
    }, [view, ownerParam, search, page]);

    const handleCall = async (lead: CrmLead) => {
        if (!lead.phone) {
            toast.error('Este lead não tem telefone cadastrado.');
            return;
        }
        setCallingId(lead.id);
        try {
            await telephonyService.callLead(lead.id);
            toast.success('Ligação enviada para o seu celular.');
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível iniciar a ligação.'));
        } finally {
            setCallingId(null);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination || !board) return;
        const from = source.droppableId as LeadStatus;
        const to = destination.droppableId as LeadStatus;
        if (from === to && source.index === destination.index) return;

        const leadId = Number(draggableId);

        if (from === to) {
            setBoard(moveInBoard(board, leadId, from, to, destination.index));
            return;
        }

        if (to === 'LOST') {
            const lead = board[from].find((l) => l.id === leadId);
            if (lead) setLostDraft({ lead, fromStatus: from, toIndex: destination.index, reason: '' });
            return;
        }

        const snapshot = board;
        setBoard(moveInBoard(board, leadId, from, to, destination.index));
        try {
            await crmLeadsApi.update(leadId, { status: to });
        } catch (err) {
            setBoard(snapshot);
            toast.error(errorMessage(err, 'Não foi possível mover o lead. A alteração foi desfeita.'));
        }
    };

    const confirmLost = async () => {
        if (!lostDraft || !board) return;
        const { lead, fromStatus, toIndex, reason } = lostDraft;
        const trimmed = reason.trim();
        const snapshot = board;
        setSavingLost(true);
        setBoard(moveInBoard(board, lead.id, fromStatus, 'LOST', toIndex, trimmed));
        try {
            await crmLeadsApi.update(lead.id, { status: 'LOST', lostReason: trimmed });
            setLostDraft(null);
            toast.success('Lead marcado como perdido.');
        } catch (err) {
            setBoard(snapshot);
            toast.error(errorMessage(err, 'Não foi possível marcar o lead como perdido.'));
        } finally {
            setSavingLost(false);
        }
    };

    const handleAssign = async () => {
        if (!assignOwner || selected.length === 0) return;
        setAssigning(true);
        try {
            const res = await crmLeadsApi.assign(selected, Number(assignOwner));
            toast.success(`${res.updated} lead(s) atribuído(s).`);
            setSelected([]);
            setAssignOwner('');
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível atribuir os leads.'));
        } finally {
            setAssigning(false);
        }
    };

    const toggleSelected = (id: number, checked: boolean) =>
        setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

    const items = list?.items ?? [];
    const total = list?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const allOnPageSelected = items.length > 0 && items.every((l) => selected.includes(l.id));
    const someOnPageSelected = items.some((l) => selected.includes(l.id));

    const openDetail = (lead: CrmLead) => setDetailId(lead.id);

    return (
        <div className="min-h-full space-y-6 p-4 md:p-8">
            <header className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A1A1A]">Leads</h1>
                        <p className="text-sm text-[#64748B]">Pipeline comercial e acompanhamento de contatos</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => setImportOpen(true)} className="bg-white">
                            <FileUp className="h-4 w-4" />
                            Importar CSV
                        </Button>
                        <Button type="button" onClick={() => setNewOpen(true)} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                            <Plus className="h-4 w-4" />
                            Novo lead
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative w-full lg:max-w-md lg:flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="search"
                            aria-label="Buscar leads"
                            placeholder="Buscar por nome, empresa, e-mail ou telefone"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>

                    <Select value={productFilter} onValueChange={(value) => { setProductFilter(value as typeof productFilter); setPage(1); }}>
                        <SelectTrigger aria-label="Filtrar por produto" className="w-full bg-white lg:w-52">
                            <SelectValue placeholder="Todos os produtos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os produtos</SelectItem>
                            {PRODUCT_INTERESTS.map((product) => <SelectItem key={product.id} value={product.id}>{product.label}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {isSupervisor && (
                        <Select
                            value={ownerFilter}
                            onValueChange={(v) => {
                                setOwnerFilter(v);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger aria-label="Filtrar por responsável" className="w-full bg-white lg:w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os responsáveis</SelectItem>
                                {owners.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>
                                        {o.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <div role="group" aria-label="Modo de visualização" className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1">
                        <button
                            type="button"
                            aria-pressed={view === 'kanban'}
                            onClick={() => setView('kanban')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                view === 'kanban' ? 'bg-[#0076FF] text-white' : 'text-slate-600 hover:bg-slate-100',
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            type="button"
                            aria-pressed={view === 'list'}
                            onClick={() => setView('list')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                view === 'list' ? 'bg-[#0076FF] text-white' : 'text-slate-600 hover:bg-slate-100',
                            )}
                        >
                            <ListIcon className="h-4 w-4" />
                            Lista
                        </button>
                    </div>
                </div>
            </header>

            {loadError && (
                <Alert variant="destructive" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        {loadError}
                        <Button type="button" size="sm" variant="outline" onClick={() => load()}>
                            Tentar de novo
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {view === 'kanban' && (
                <section aria-label="Pipeline de leads">
                    {!board ? (
                        <div className="flex gap-4 overflow-hidden">
                            {LEAD_STATUSES.map((s) => (
                                <div key={s.id} className="w-[280px] flex-shrink-0 space-y-3 rounded-2xl bg-slate-100/70 p-3">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-28 w-full" />
                                    <Skeleton className="h-28 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
                                {LEAD_STATUSES.map((column) => {
                                    const leads = board[column.id] ?? [];
                                    return (
                                        <div key={column.id} className="flex w-[280px] flex-shrink-0 snap-start flex-col rounded-2xl bg-slate-100/70 p-3">
                                            <div className="mb-3 flex items-center justify-between px-1">
                                                <Badge className={cn('border-transparent text-xs', column.color)}>{column.title}</Badge>
                                                <span className="text-xs font-semibold text-slate-500">{leads.length}</span>
                                            </div>
                                            <Droppable droppableId={column.id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={cn(
                                                            'min-h-[160px] flex-1 space-y-2 rounded-xl p-1 transition-colors',
                                                            snapshot.isDraggingOver && 'bg-blue-50',
                                                        )}
                                                    >
                                                        {leads.map((lead, index) => (
                                                            <KanbanCard
                                                                key={lead.id}
                                                                lead={lead}
                                                                index={index}
                                                                isSupervisor={isSupervisor}
                                                                callingId={callingId}
                                                                onCall={handleCall}
                                                                onOpen={openDetail}
                                                            />
                                                        ))}
                                                        {provided.placeholder}
                                                        {leads.length === 0 && !snapshot.isDraggingOver && (
                                                            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                                                                Arraste leads para cá
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    );
                                })}
                            </div>
                        </DragDropContext>
                    )}
                    {board && !loading && LEAD_STATUSES.every((s) => (board[s.id] ?? []).length === 0) && (
                        <p className="mt-2 text-center text-sm text-slate-500">Nenhum lead encontrado com os filtros atuais.</p>
                    )}
                    {loading && board && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Atualizando...
                        </p>
                    )}
                </section>
            )}

            {view === 'list' && (
                <section className="space-y-3" aria-label="Lista de leads">
                    {isSupervisor && selected.length > 0 && (
                        <Card className="flex flex-col gap-3 rounded-2xl border-blue-100 bg-blue-50/60 p-4 shadow-none md:flex-row md:items-center md:justify-between">
                            <span className="text-sm font-medium text-slate-700">{selected.length} selecionado(s)</span>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Select value={assignOwner} onValueChange={setAssignOwner}>
                                    <SelectTrigger aria-label="Atribuir a" className="w-full bg-white sm:w-64">
                                        <SelectValue placeholder="Atribuir a..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.map((o) => (
                                            <SelectItem key={o.id} value={String(o.id)}>
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={handleAssign} disabled={!assignOwner || assigning}>
                                    {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Atribuir
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => setSelected([])} disabled={assigning}>
                                    Limpar
                                </Button>
                            </div>
                        </Card>
                    )}

                    <Card className="overflow-hidden rounded-2xl border-slate-100 p-0 shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/70">
                                        {isSupervisor && (
                                            <TableHead className="w-10">
                                                <Checkbox
                                                    aria-label="Selecionar todos desta página"
                                                    checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false}
                                                    onCheckedChange={(checked) => {
                                                        const ids = items.map((l) => l.id);
                                                        setSelected((prev) =>
                                                            checked === true
                                                                ? Array.from(new Set([...prev, ...ids]))
                                                                : prev.filter((id) => !ids.includes(id)),
                                                        );
                                                    }}
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead>Etapa</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead>Próxima ação</TableHead>
                                        <TableHead>Última ligação</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!list &&
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <TableRow key={`sk-${i}`}>
                                                <TableCell colSpan={isSupervisor ? 9 : 8}>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    {list && items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={isSupervisor ? 9 : 8} className="py-12 text-center text-sm text-slate-500">
                                                Nenhum lead encontrado com os filtros atuais.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {items.map((lead) => {
                                        const overdue = isOverdue(lead.nextActionAt);
                                        return (
                                            <TableRow key={lead.id} data-state={selected.includes(lead.id) ? 'selected' : undefined}>
                                                {isSupervisor && (
                                                    <TableCell>
                                                        <Checkbox
                                                            aria-label={`Selecionar ${lead.name}`}
                                                            checked={selected.includes(lead.id)}
                                                            onCheckedChange={(checked) => toggleSelected(lead.id, checked === true)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell className="font-medium">
                                                    <button type="button" onClick={() => openDetail(lead)} className="text-left text-slate-900 hover:text-[#0076FF] hover:underline">
                                                        {lead.name}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="max-w-[160px] truncate text-slate-600">{lead.company || '—'}</TableCell>
                                                <TableCell className="whitespace-nowrap text-slate-600">{formatPhone(lead.phone)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn('border-transparent', stageColor(lead.status))}>{stageLabel(lead.status)}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[140px] truncate text-slate-600">{lead.owner?.name ?? '—'}</TableCell>
                                                <TableCell className={cn('whitespace-nowrap text-sm', overdue ? 'font-medium text-red-600' : 'text-slate-600')}>
                                                    {formatDateTime(lead.nextActionAt)}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-slate-600">
                                                    {lead.lastCall ? (
                                                        <>
                                                            {formatDateTime(lead.lastCall.createdAt)}
                                                            <span className="block text-xs text-slate-400">
                                                                {CALL_STATUS_LABEL[lead.lastCall.status as PhoneCallStatus] ?? lead.lastCall.status}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!lead.phone || callingId === lead.id}
                                                            onClick={() => handleCall(lead)}
                                                            className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            {callingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                                                            Ligar
                                                        </Button>
                                                        <Button type="button" size="sm" variant="ghost" onClick={() => openDetail(lead)} className="h-8">
                                                            Abrir
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {list && total > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-600 sm:flex-row">
                            <span>
                                {total} lead(s) · página {page} de {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                                    Anterior
                                </Button>
                                <Button type="button" variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <Dialog open={lostDraft !== null} onOpenChange={(open) => !open && !savingLost && setLostDraft(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Marcar como perdido</DialogTitle>
                        <DialogDescription>
                            Informe o motivo para {lostDraft?.lead.name ?? 'este lead'} ser marcado como perdido.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="lost-reason">Motivo da perda *</Label>
                        <Textarea
                            id="lost-reason"
                            rows={3}
                            maxLength={255}
                            placeholder="Ex.: Achou o preço alto, escolheu concorrente..."
                            value={lostDraft?.reason ?? ''}
                            onChange={(e) => setLostDraft((d) => (d ? { ...d, reason: e.target.value } : d))}
                            disabled={savingLost}
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => setLostDraft(null)} disabled={savingLost}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmLost}
                            disabled={savingLost || !lostDraft?.reason.trim()}
                        >
                            {savingLost && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <NewLeadDialog
                open={newOpen}
                onOpenChange={setNewOpen}
                isSupervisor={isSupervisor}
                owners={owners}
                onCreated={() => load()}
            />

            <ImportLeadsDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                isSupervisor={isSupervisor}
                owners={owners}
                onImported={() => load()}
            />

            <LeadDetailDialog
                leadId={detailId}
                onClose={() => setDetailId(null)}
                isSupervisor={isSupervisor}
                owners={owners}
                onChanged={() => load()}
                onCall={handleCall}
                callingId={callingId}
            />
        </div>
    );
}
