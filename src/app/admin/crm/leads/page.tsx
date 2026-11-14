'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, FileUp, LayoutGrid, List, Loader2, Phone, Plus, RefreshCw, Search, Settings2, Tags, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { crmLeadsApi, getStoredUser, isSupervisorRole, LEAD_STATUSES, PRODUCT_INTERESTS, teamApi, type CrmFunnelLead, type CrmLead, type CrmLeadFunnelBoard, type CrmLeadTag, type CrmPipeline, type ProductInterest, type TeamUser } from '@/services/crm-leads';
import { formatPhone } from '@/components/admin/crm/format';
import { NewLeadDialog, LeadDetailDialog } from '@/components/admin/crm/lead-dialogs';
import { ImportLeadsDialog } from '@/components/admin/crm/import-leads-dialog';
import { LeadTagsDialog } from '@/components/admin/crm/lead-tags-dialog';
import { telephonyService } from '@/services/telephony';

type View = 'board' | 'list';

function formatCurrency(value: number | null) {
  return value === null ? 'Sem valor' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function CrmLeadsPage() {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [pipelineId, setPipelineId] = useState('');
  const [board, setBoard] = useState<CrmLeadFunnelBoard | null>(null);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [leadTotal, setLeadTotal] = useState(0);
  const [leadPage, setLeadPage] = useState(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [assignOwner, setAssignOwner] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('board');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CrmFunnelLead | null>(null);
  const [pendingStageId, setPendingStageId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCloseAt, setEditCloseAt] = useState('');
  const [editNextActionAt, setEditNextActionAt] = useState('');
  const [editLostReason, setEditLostReason] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [owners, setOwners] = useState<TeamUser[]>([]);
  const [tags, setTags] = useState<CrmLeadTag[]>([]);
  const [canConfigure, setCanConfigure] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [callingId, setCallingId] = useState<number | null>(null);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [productFilter, setProductFilter] = useState<'all' | ProductInterest>('all');

  const activePipelines = useMemo(() => pipelines.filter((item) => item.isActive && item.productInterest === null), [pipelines]);
  const selectedPipeline = activePipelines.find((item) => String(item.id) === pipelineId);
  const pageSize = 50;
  useEffect(() => { setCanConfigure(isSupervisorRole(getStoredUser()?.role)); }, []);

  const loadPipelines = useCallback(async () => {
    try {
      const result = await crmLeadsApi.listPipelines();
      setPipelines(result);
      setPipelineId((current) => current && result.some((item) => String(item.id) === current && item.isActive && item.productInterest === null)
        ? current
        : String(result.find((item) => item.isDefault && item.isActive && item.productInterest === null)?.id ?? result.find((item) => item.isActive && item.productInterest === null)?.id ?? ''));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os pipelines.');
    }
  }, []);

  const loadBoard = useCallback(async () => {
    if (view !== 'board') { setLoading(false); return; }
    if (!pipelineId) { setBoard(null); setLoading(false); return; }
    setLoading(true);
    setLoadError('');
    try {
      setBoard(await crmLeadsApi.leadFunnelBoard({
        pipelineId: Number(pipelineId),
        search: query || undefined,
        ...(ownerFilter !== 'all' ? { ownerId: Number(ownerFilter) } : {}),
        ...(tagFilter !== 'all' ? { tagId: Number(tagFilter) } : {}),
        ...(productFilter !== 'all' && !selectedPipeline?.productInterest ? { productInterest: productFilter } : {}),
      }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os leads.');
    } finally {
      setLoading(false);
    }
  }, [pipelineId, query, ownerFilter, tagFilter, productFilter, selectedPipeline?.productInterest, view]);

  const loadLeads = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await crmLeadsApi.list({
        search: query || undefined,
        ...(ownerFilter !== 'all' ? { ownerId: Number(ownerFilter) } : {}),
        ...(tagFilter !== 'all' ? { tagId: Number(tagFilter) } : {}),
        ...(productFilter !== 'all' ? { productInterest: productFilter } : {}),
        page: leadPage,
        pageSize,
      });
      setLeads(result.items);
      setLeadTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a lista de leads.');
    } finally { setListLoading(false); }
  }, [query, ownerFilter, tagFilter, productFilter, leadPage]);

  useEffect(() => { void loadPipelines(); }, [loadPipelines]);
  useEffect(() => { void loadBoard(); }, [loadBoard]);
  useEffect(() => { if (view === 'list') void loadLeads(); }, [view, loadLeads]);
  useEffect(() => { setSelectedLeadIds([]); }, [view, ownerFilter, tagFilter, productFilter, query, leadPage]);
  useEffect(() => {
    const leadId = Number(new URLSearchParams(window.location.search).get('lead'));
    if (Number.isInteger(leadId) && leadId > 0) setDetailId(leadId);
  }, []);
  useEffect(() => {
    void crmLeadsApi.listTags().then(setTags).catch(() => setTags([]));
    if (canConfigure) void teamApi.list().then((users) => setOwners(users.filter((user) => user.active && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'].includes(user.role)))).catch(() => setOwners([]));
  }, [canConfigure]);

  const handleCall = async (lead: Pick<CrmLead, 'id' | 'phone'>) => {
    if (!lead.phone) { toast.error('Este lead não tem telefone cadastrado.'); return; }
    setCallingId(lead.id);
    try { await telephonyService.callLead(lead.id); toast.success('Ligação enviada para o seu celular.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível iniciar a ligação.'); }
    finally { setCallingId(null); }
  };

  const assignSelectedLeads = async () => {
    if (!assignOwner || selectedLeadIds.length === 0) return;
    setAssigning(true);
    try {
      const result = await crmLeadsApi.assign(selectedLeadIds, Number(assignOwner));
      toast.success(`${result.updated} lead(s) atribuído(s).`);
      setSelectedLeadIds([]);
      setAssignOwner('');
      await loadLeads();
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atribuir os leads.');
    } finally { setAssigning(false); }
  };

  const moveLead = async (lead: CrmFunnelLead, stageId: number) => {
    const currentStage = board?.columns.find((column) => column.items.some((item) => item.id === lead.id))?.stage;
    if (stageId === currentStage?.id) return;
    const target = board?.pipeline.stages.find((stage) => stage.id === stageId);
    if (!target) return;
    const values = {
      title: lead.company || lead.name,
      amount: lead.value,
      expectedCloseAt: lead.expectedCloseAt,
      lostReason: lead.lostReason,
      ownerId: lead.ownerId,
    };
    const missing = target.requiredFields.filter((field) => {
      const value = values[field as keyof typeof values];
      return value === null || value === undefined || value === '';
    });
    if (missing.length) {
      openEditor(lead, stageId);
      toast.info(`Preencha os campos obrigatórios para mover para “${target.name}”.`);
      return;
    }
    try {
      await crmLeadsApi.updateLeadFunnel(lead.id, { expectedVersion: lead.funnelVersion, stageId });
      toast.success('Lead movido no funil.');
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível mover o lead no funil.');
      await loadBoard();
    }
  };

  const openEditor = (lead: CrmFunnelLead, targetStageId: number | null = null) => {
    setEditing(lead);
    setPendingStageId(targetStageId);
    setEditAmount(lead.value === null ? '' : String(lead.value));
    setEditCloseAt(toDateTimeLocal(lead.expectedCloseAt));
    setEditNextActionAt(toDateTimeLocal(lead.nextActionAt));
    setEditLostReason(lead.lostReason ?? '');
    setEditOwnerId(lead.ownerId ? String(lead.ownerId) : '');
  };

  const saveLeadFunnel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await crmLeadsApi.updateLeadFunnel(editing.id, {
        expectedVersion: editing.funnelVersion,
        stageId: pendingStageId ?? editing.funnelStageId ?? board?.pipeline.stages.find((stage) => stage.isInitial)?.id ?? 0,
        amount: editAmount ? Number(editAmount) : null,
        expectedCloseAt: editCloseAt ? new Date(editCloseAt).toISOString() : null,
        nextActionAt: editNextActionAt ? new Date(editNextActionAt).toISOString() : null,
        lostReason: editLostReason.trim() || null,
        ...(canConfigure ? { ownerId: editOwnerId ? Number(editOwnerId) : null } : {}),
      });
      setEditing(null);
      setPendingStageId(null);
      toast.success('Lead atualizado no funil.');
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os dados do funil.');
      await loadBoard();
    } finally { setSaving(false); }
  };

  const funnelLeads = board?.columns.flatMap((column) => column.items) ?? [];
  const totalPages = Math.max(1, Math.ceil(leadTotal / pageSize));
  const allOnPageSelected = leads.length > 0 && leads.every((lead) => selectedLeadIds.includes(lead.id));
  const someOnPageSelected = leads.some((lead) => selectedLeadIds.includes(lead.id));

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            {canConfigure && <Button asChild variant="outline"><Link href="/admin/crm/pipelines"><Settings2 className="mr-2 h-4 w-4" />Configurar funil</Link></Button>}
          </div>
          <p className="mt-1 text-sm text-slate-500">Acompanhe os leads no funil configurado e cuide do histórico no mesmo lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setView(view === 'board' ? 'list' : 'board')}>
            {view === 'board' ? <List className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
            {view === 'board' ? 'Ver lista' : 'Ver funil'}
          </Button>
          {canConfigure && <Button variant="outline" onClick={() => setTagManagerOpen(true)}><Tags className="mr-2 h-4 w-4" />Tags</Button>}
          <Button variant="outline" onClick={() => setImportOpen(true)}><FileUp className="mr-2 h-4 w-4" />Importar CSV</Button>
          <Button onClick={() => setNewLeadOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo lead</Button>
        </div>
      </header>

      {editing && <Card className="border-blue-200 bg-blue-50/40 p-4">
        <form onSubmit={saveLeadFunnel} className="grid gap-3 md:grid-cols-3">
          <div className="text-sm font-medium md:col-span-3">Dados do lead · {editing.company || editing.name}</div>
          <label className="text-sm font-medium">Valor estimado<Input min="0" step="0.01" type="number" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} /></label>
          <label className="text-sm font-medium">Previsão de fechamento<Input type="datetime-local" value={editCloseAt} onChange={(event) => setEditCloseAt(event.target.value)} /></label>
          <label className="text-sm font-medium">Próxima ação<Input type="datetime-local" value={editNextActionAt} onChange={(event) => setEditNextActionAt(event.target.value)} /></label>
          {(board?.pipeline.stages.find((stage) => stage.id === (pendingStageId ?? editing.funnelStageId))?.type === 'LOST') && <label className="text-sm font-medium">Motivo da perda<Input required value={editLostReason} onChange={(event) => setEditLostReason(event.target.value)} /></label>}
          {canConfigure && <label className="text-sm font-medium">Responsável<select value={editOwnerId} onChange={(event) => setEditOwnerId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Sem responsável</option>{owners.filter((owner) => owner.active && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'].includes(owner.role)).map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></label>}
          <div className="flex items-end gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Salvar lead</Button><Button type="button" variant="outline" onClick={() => { setEditing(null); setPendingStageId(null); }}>Cancelar</Button></div>
        </form>
      </Card>}

      <div className="flex flex-wrap gap-3">
        {view === 'board' && selectedPipeline && <span className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">Funil: {selectedPipeline.name}</span>}
        {canConfigure && <select aria-label="Filtrar por vendedor" value={ownerFilter} onChange={(event) => { setOwnerFilter(event.target.value); setLeadPage(1); }} className="h-10 min-w-52 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">Todos os vendedores</option>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select>}
        {(view === 'list' || !selectedPipeline?.productInterest) && <select aria-label="Filtrar por produto" value={productFilter} onChange={(event) => { setProductFilter(event.target.value as typeof productFilter); setLeadPage(1); }} className="h-10 min-w-44 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">Todos os produtos</option>{PRODUCT_INTERESTS.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}</select>}
        <select aria-label="Filtrar por tag" value={tagFilter} onChange={(event) => { setTagFilter(event.target.value); setLeadPage(1); }} className="h-10 min-w-44 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">Todas as tags</option>{tags.filter((tag) => tag.isActive).map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}</select>
        <form className="flex min-w-64 flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); setLeadPage(1); }}>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa, contato ou telefone" />
          <Button type="submit" variant="outline" aria-label="Buscar"><Search className="h-4 w-4" /></Button>
        </form>
        <Button variant="ghost" onClick={() => { if (view === 'board') void loadBoard(); else void loadLeads(); }} aria-label="Atualizar"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {loadError && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="h-4 w-4" />{loadError}<Button variant="outline" size="sm" onClick={() => { void loadPipelines(); void loadBoard(); }}>Tentar novamente</Button></div>}
      {loading ? <div className="flex items-center gap-2 py-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Carregando leads…</div> : !board ? null : view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => <section key={column.stage.id} className="w-[300px] shrink-0 rounded-xl bg-slate-100 p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = Number(event.dataTransfer.getData('text/plain')); const lead = funnelLeads.find((item) => item.id === id); if (lead) void moveLead(lead, column.stage.id); }}>
            <header className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: column.stage.color }} /><h2 className="font-semibold text-slate-800">{column.stage.name}</h2><Badge variant="secondary">{column.total}</Badge></div>
              <span className="text-xs text-slate-500">{formatCurrency(column.amountTotal)}</span>
            </header>
            <div className="space-y-3">
              {column.items.map((lead) => <Card key={lead.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(lead.id))} className="cursor-grab space-y-2 p-3 active:cursor-grabbing">
                <button type="button" className="block w-full text-left" onClick={() => setDetailId(lead.id)}><p className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700">{lead.company || lead.name}</p>{lead.company && <p className="truncate text-xs text-slate-500">{lead.name}</p>}</button>
                <div className="flex flex-wrap gap-1">{lead.productInterests.map((product) => <Badge key={product} variant="secondary">{PRODUCT_INTERESTS.find((item) => item.id === product)?.label ?? product}</Badge>)}{lead.tags.map((tag) => <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>{tag.name}</Badge>)}</div>
                <p className="text-sm font-medium text-slate-800">{formatCurrency(lead.value)}</p>
                {lead.phone && <p className="text-xs text-slate-600">{formatPhone(lead.phone)}</p>}
                {lead.owner && <p className="flex items-center gap-1 text-xs text-slate-500"><UserRound className="h-3 w-3" />Responsável: {lead.owner.name}</p>}
                {lead.nextActionAt && <p className="text-xs text-slate-500">Próxima ação: {new Date(lead.nextActionAt).toLocaleString('pt-BR')}</p>}
                {lead.lostReason && <p className="text-xs text-red-700">Perda: {lead.lostReason}</p>}
                <label className="flex items-center gap-1 text-xs text-slate-500">Mover <ArrowRight className="h-3 w-3" /><select aria-label={`Mover ${lead.company || lead.name}`} value={lead.funnelStageId ?? column.stage.id} onChange={(event) => void moveLead(lead, Number(event.target.value))} className="min-w-0 flex-1 rounded border border-slate-200 bg-white p-1 text-xs">{board.pipeline.stages.filter((stage) => stage.isActive).map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
                <div className="flex gap-2"><Button type="button" size="sm" variant="outline" className="flex-1" disabled={!lead.phone || callingId === lead.id} onClick={() => { void handleCall(lead); }}>{callingId === lead.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Phone className="mr-1 h-3.5 w-3.5" />}Ligar</Button><Button type="button" size="sm" variant="ghost" className="flex-1" onClick={() => setDetailId(lead.id)}>Abrir lead</Button></div>
                <Button type="button" size="sm" variant="ghost" className="h-7 w-full" onClick={() => openEditor(lead)}>Editar dados do lead</Button>
              </Card>)}
              {!column.items.length && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">Nenhum lead nesta etapa.</p>}
            </div>
            {column.total > column.items.length && <p className="mt-3 text-center text-xs text-slate-500">Exibindo 200 de {column.total}</p>}
          </section>)}
        </div>
      ) : (
        <section className="space-y-3">
          {canConfigure && selectedLeadIds.length > 0 && <Card className="flex flex-col gap-3 border-blue-100 bg-blue-50/60 p-4 md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-slate-700">{selectedLeadIds.length} lead(s) selecionado(s)</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select aria-label="Atribuir leads para vendedor" value={assignOwner} onChange={(event) => setAssignOwner(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Atribuir para...</option>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select>
              <Button onClick={() => void assignSelectedLeads()} disabled={!assignOwner || assigning}>{assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Atribuir</Button>
              <Button variant="ghost" onClick={() => setSelectedLeadIds([])} disabled={assigning}>Limpar</Button>
            </div>
          </Card>}
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr>{canConfigure && <th className="w-10 p-3"><Checkbox aria-label="Selecionar todos desta página" checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false} onCheckedChange={(checked) => setSelectedLeadIds((current) => checked === true ? Array.from(new Set([...current, ...leads.map((lead) => lead.id)])) : current.filter((id) => !leads.some((lead) => lead.id === id)))} /></th>}<th className="p-3">Lead / empresa</th><th>Etapa do funil</th><th>Telefone</th><th>Produto</th><th>Tags</th><th>Responsável</th><th>Próxima ação</th><th>Ações</th></tr></thead>
              <tbody>{listLoading ? <tr><td colSpan={canConfigure ? 9 : 8} className="p-8 text-center text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Carregando leads…</td></tr> : leads.map((lead) => <tr key={lead.id} className="border-b last:border-0">{canConfigure && <td className="p-3"><Checkbox aria-label={`Selecionar ${lead.company || lead.name}`} checked={selectedLeadIds.includes(lead.id)} onCheckedChange={(checked) => setSelectedLeadIds((current) => checked === true ? [...current, lead.id] : current.filter((id) => id !== lead.id))} /></td>}<td className="p-3"><button type="button" className="text-left" onClick={() => setDetailId(lead.id)}><p className="font-medium hover:text-blue-700">{lead.company || lead.name}</p>{lead.company && <p className="text-xs text-slate-500">{lead.name}</p>}</button></td><td><Badge variant="secondary" style={lead.funnelStage ? { color: lead.funnelStage.color } : undefined}>{lead.funnelStage?.name ?? LEAD_STATUSES.find((status) => status.id === lead.status)?.title ?? lead.status}</Badge></td><td>{formatPhone(lead.phone)}</td><td><div className="flex flex-wrap gap-1">{lead.productInterests.length ? lead.productInterests.map((product) => <Badge key={product} variant="secondary">{PRODUCT_INTERESTS.find((item) => item.id === product)?.label ?? product}</Badge>) : <span className="text-slate-500">Geral</span>}</div></td><td><div className="flex flex-wrap gap-1">{lead.tags.slice(0, 3).map((tag) => <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>{tag.name}</Badge>)}{lead.tags.length > 3 && <span className="text-xs text-slate-500">+{lead.tags.length - 3}</span>}</div></td><td>{lead.owner?.name ?? 'Sem responsável'}</td><td>{lead.nextActionAt ? new Date(lead.nextActionAt).toLocaleString('pt-BR') : '—'}</td><td><div className="flex gap-1"><Button size="sm" variant="outline" disabled={!lead.phone || callingId === lead.id} onClick={() => { void handleCall(lead); }}><Phone className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => setDetailId(lead.id)}>Abrir</Button></div></td></tr>)}
              {!listLoading && !leads.length && <tr><td colSpan={canConfigure ? 9 : 8} className="p-10 text-center text-sm text-slate-500">Nenhum lead encontrado.</td></tr>}</tbody>
            </table>
            <div className="flex items-center justify-between border-t p-3 text-sm text-slate-500"><span>{leadTotal} lead(s) · Página {leadPage} de {totalPages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={leadPage <= 1 || listLoading} onClick={() => setLeadPage((page) => Math.max(1, page - 1))}>Anterior</Button><Button size="sm" variant="outline" disabled={leadPage >= totalPages || listLoading} onClick={() => setLeadPage((page) => Math.min(totalPages, page + 1))}>Próxima</Button></div></div>
          </Card>
        </section>
      )}
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} isSupervisor={canConfigure} owners={owners} tags={tags} onCreated={(lead) => { setDetailId(lead.id); void loadBoard(); void loadLeads(); }} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} isSupervisor={canConfigure} owners={owners} tags={tags} onImported={() => { void loadBoard(); void loadLeads(); }} />
      <LeadTagsDialog open={tagManagerOpen} onOpenChange={setTagManagerOpen} onChanged={async () => { setTags(await crmLeadsApi.listTags()); void loadBoard(); void loadLeads(); }} />
      <LeadDetailDialog leadId={detailId} onClose={() => setDetailId(null)} isSupervisor={canConfigure} owners={owners} tags={tags} onChanged={() => { void loadBoard(); void loadLeads(); }} onCall={handleCall} callingId={callingId} />
    </main>
  );
}
