'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, LayoutGrid, List, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { crmLeadsApi, getStoredUser, isSupervisorRole, teamApi, type CrmOpportunity, type CrmPipeline, type ProductInterest, type TeamUser } from '@/services/crm-leads';
import { formatPhone } from '@/components/admin/crm/format';

type View = 'board' | 'list';

function formatCurrency(value: number | null) {
  return value === null ? 'Sem valor' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function OpportunitiesPage() {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [pipelineId, setPipelineId] = useState('');
  const [board, setBoard] = useState<Awaited<ReturnType<typeof crmLeadsApi.opportunityBoard>> | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('board');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CrmOpportunity | null>(null);
  const [pendingStageId, setPendingStageId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCloseAt, setEditCloseAt] = useState('');
  const [editNextActionAt, setEditNextActionAt] = useState('');
  const [editLostReason, setEditLostReason] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [owners, setOwners] = useState<TeamUser[]>([]);
  const [canConfigure, setCanConfigure] = useState(false);

  const activePipelines = useMemo(() => pipelines.filter((item) => item.isActive), [pipelines]);
  const selectedPipeline = activePipelines.find((item) => String(item.id) === pipelineId);

  useEffect(() => { setCanConfigure(isSupervisorRole(getStoredUser()?.role)); }, []);

  const loadPipelines = useCallback(async () => {
    try {
      const result = await crmLeadsApi.listPipelines();
      setPipelines(result);
      setPipelineId((current) => current && result.some((item) => String(item.id) === current && item.isActive)
        ? current
        : String(result.find((item) => item.isDefault && item.isActive)?.id ?? result.find((item) => item.isActive)?.id ?? ''));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar os pipelines.');
    }
  }, []);

  const loadBoard = useCallback(async () => {
    if (!pipelineId) return;
    setLoading(true);
    setLoadError('');
    try {
      setBoard(await crmLeadsApi.opportunityBoard({ pipelineId: Number(pipelineId), search: query || undefined }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as oportunidades.');
    } finally {
      setLoading(false);
    }
  }, [pipelineId, query]);

  useEffect(() => { void loadPipelines(); }, [loadPipelines]);
  useEffect(() => { void loadBoard(); }, [loadBoard]);
  useEffect(() => {
    if (canConfigure) void teamApi.list().then(setOwners).catch(() => setOwners([]));
  }, [canConfigure]);

  const moveOpportunity = async (opportunity: CrmOpportunity, stageId: number) => {
    if (stageId === opportunity.stageId) return;
    const target = board?.pipeline.stages.find((stage) => stage.id === stageId);
    if (!target) return;
    const values = {
      title: opportunity.title,
      amount: opportunity.amount,
      expectedCloseAt: opportunity.expectedCloseAt,
      lostReason: opportunity.lostReason,
      ownerId: opportunity.ownerId,
    };
    const missing = target.requiredFields.filter((field) => {
      const value = values[field as keyof typeof values];
      return value === null || value === undefined || value === '';
    });
    if (missing.length) {
      setPendingStageId(stageId);
      openEditor(opportunity);
      toast.info(`Preencha os campos obrigatórios para mover para “${target.name}”.`);
      return;
    }
    try {
      await crmLeadsApi.updateOpportunity(opportunity.id, { expectedVersion: opportunity.version, stageId });
      toast.success('Oportunidade atualizada.');
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível mover a oportunidade.');
      await loadBoard();
    }
  };

  const openEditor = (opportunity: CrmOpportunity) => {
    setEditing(opportunity);
    setEditTitle(opportunity.title);
    setEditAmount(opportunity.amount === null ? '' : String(opportunity.amount));
    setEditCloseAt(toDateTimeLocal(opportunity.expectedCloseAt));
    setEditNextActionAt(toDateTimeLocal(opportunity.nextActionAt));
    setEditLostReason(opportunity.lostReason ?? '');
    setEditOwnerId(opportunity.ownerId ? String(opportunity.ownerId) : '');
  };

  const saveOpportunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await crmLeadsApi.updateOpportunity(editing.id, {
        expectedVersion: editing.version,
        ...(pendingStageId ? { stageId: pendingStageId } : {}),
        title: editTitle.trim(),
        amount: editAmount ? Number(editAmount) : null,
        expectedCloseAt: editCloseAt ? new Date(editCloseAt).toISOString() : null,
        nextActionAt: editNextActionAt ? new Date(editNextActionAt).toISOString() : null,
        lostReason: editLostReason.trim() || null,
        ...(canConfigure ? { ownerId: editOwnerId ? Number(editOwnerId) : null } : {}),
      });
      setEditing(null);
      setPendingStageId(null);
      toast.success('Dados da oportunidade atualizados.');
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a oportunidade.');
      await loadBoard();
    } finally { setSaving(false); }
  };

  const createOpportunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPipeline || !leadId) return;
    setSaving(true);
    try {
      const productInterest = selectedPipeline.productInterest as ProductInterest | null;
      await crmLeadsApi.createOpportunity({
        leadId: Number(leadId),
        pipelineId: selectedPipeline.id,
        ...(productInterest ? { productInterest } : {}),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(amount ? { amount: Number(amount) } : {}),
      });
      toast.success('Oportunidade criada.');
      setNewOpen(false);
      setLeadId(''); setTitle(''); setAmount('');
      await loadBoard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar a oportunidade. Confira o ID do lead.');
    } finally {
      setSaving(false);
    }
  };

  const opportunities = board?.columns.flatMap((column) => column.items) ?? [];

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Oportunidades</h1>
            <Link className="text-sm text-blue-700 hover:underline" href="/admin/crm/leads">Leads</Link>
            {canConfigure && <Link className="text-sm text-blue-700 hover:underline" href="/admin/crm/pipelines">Configurar pipelines</Link>}
          </div>
          <p className="mt-1 text-sm text-slate-500">Acompanhe negociações por produto e etapa sem alterar a fila de campanhas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setView(view === 'board' ? 'list' : 'board')}>
            {view === 'board' ? <List className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
            {view === 'board' ? 'Ver lista' : 'Ver quadro'}
          </Button>
          <Button onClick={() => setNewOpen((current) => !current)}><Plus className="mr-2 h-4 w-4" />Nova oportunidade</Button>
        </div>
      </header>

      {newOpen && <Card className="p-4">
        <form onSubmit={createOpportunity} className="grid gap-3 md:grid-cols-[180px_1fr_180px_auto] md:items-end">
          <label className="text-sm font-medium">ID do lead<Input required min="1" type="number" value={leadId} onChange={(event) => setLeadId(event.target.value)} placeholder="Ex.: 123" /></label>
          <label className="text-sm font-medium">Título (opcional)<Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Empresa · produto" /></label>
          <label className="text-sm font-medium">Valor estimado<Input min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$" /></label>
          <Button disabled={saving || !selectedPipeline} type="submit">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Criar</Button>
        </form>
        <p className="mt-2 text-xs text-slate-500">A negociação será criada no pipeline selecionado e herdará produto e responsável do lead.</p>
      </Card>}

      {editing && <Card className="border-blue-200 bg-blue-50/40 p-4">
        <form onSubmit={saveOpportunity} className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium">Título<Input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label>
          <label className="text-sm font-medium">Valor estimado<Input min="0" step="0.01" type="number" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} /></label>
          <label className="text-sm font-medium">Previsão de fechamento<Input type="datetime-local" value={editCloseAt} onChange={(event) => setEditCloseAt(event.target.value)} /></label>
          <label className="text-sm font-medium">Próxima ação<Input type="datetime-local" value={editNextActionAt} onChange={(event) => setEditNextActionAt(event.target.value)} /></label>
          {(editing.stage.type === 'LOST' || board?.pipeline.stages.find((stage) => stage.id === pendingStageId)?.type === 'LOST') && <label className="text-sm font-medium">Motivo da perda<Input required value={editLostReason} onChange={(event) => setEditLostReason(event.target.value)} /></label>}
          {canConfigure && <label className="text-sm font-medium">Responsável<select value={editOwnerId} onChange={(event) => setEditOwnerId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Sem responsável</option>{owners.filter((owner) => owner.active && ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR'].includes(owner.role)).map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></label>}
          <div className="flex items-end gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Salvar oportunidade</Button><Button type="button" variant="outline" onClick={() => { setEditing(null); setPendingStageId(null); }}>Cancelar</Button></div>
        </form>
      </Card>}

      <div className="flex flex-wrap gap-3">
        <select aria-label="Pipeline" value={pipelineId} onChange={(event) => setPipelineId(event.target.value)} className="h-10 min-w-64 rounded-md border border-slate-300 bg-white px-3 text-sm">
          {activePipelines.map((pipeline) => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}{pipeline.productInterest ? ` · ${pipeline.productInterest}` : ' · Geral'}</option>)}
        </select>
        <form className="flex min-w-64 flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); }}>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa, contato ou telefone" />
          <Button type="submit" variant="outline" aria-label="Buscar"><Search className="h-4 w-4" /></Button>
        </form>
        <Button variant="ghost" onClick={() => void loadBoard()} aria-label="Atualizar"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {loadError && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="h-4 w-4" />{loadError}<Button variant="outline" size="sm" onClick={() => { void loadPipelines(); void loadBoard(); }}>Tentar novamente</Button></div>}
      {loading ? <div className="flex items-center gap-2 py-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Carregando oportunidades…</div> : !board ? null : view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => <section key={column.stage.id} className="w-[300px] shrink-0 rounded-xl bg-slate-100 p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = Number(event.dataTransfer.getData('text/plain')); const opportunity = opportunities.find((item) => item.id === id); if (opportunity) void moveOpportunity(opportunity, column.stage.id); }}>
            <header className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: column.stage.color }} /><h2 className="font-semibold text-slate-800">{column.stage.name}</h2><Badge variant="secondary">{column.total}</Badge></div>
              <span className="text-xs text-slate-500">{formatCurrency(column.amountTotal)}</span>
            </header>
            <div className="space-y-3">
              {column.items.map((opportunity) => <Card key={opportunity.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(opportunity.id))} className="cursor-grab space-y-2 p-3 active:cursor-grabbing">
                <div><p className="truncate text-sm font-semibold text-slate-900">{opportunity.lead.company || opportunity.title}</p><p className="truncate text-xs text-slate-500">{opportunity.lead.name}</p></div>
                <div className="flex flex-wrap gap-1">{opportunity.productInterest && <Badge variant="secondary">{opportunity.productInterest}</Badge>}{opportunity.lead.tags.map((tag) => <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>{tag.name}</Badge>)}</div>
                <p className="text-sm font-medium text-slate-800">{formatCurrency(opportunity.amount)}</p>
                {opportunity.lead.phone && <a className="block text-xs text-blue-700 hover:underline" href={`tel:${opportunity.lead.phone}`}>{formatPhone(opportunity.lead.phone)}</a>}
                {opportunity.owner && <p className="text-xs text-slate-500">Responsável: {opportunity.owner.name}</p>}
                {opportunity.nextActionAt && <p className="text-xs text-slate-500">Próxima ação: {new Date(opportunity.nextActionAt).toLocaleString('pt-BR')}</p>}
                {opportunity.lostReason && <p className="text-xs text-red-700">Perda: {opportunity.lostReason}</p>}
                <a className="text-xs text-blue-700 hover:underline" href={`/admin/crm/leads?lead=${opportunity.lead.id}`}>Abrir cadastro do lead</a>
                <label className="flex items-center gap-1 text-xs text-slate-500">Mover <ArrowRight className="h-3 w-3" /><select aria-label={`Mover ${opportunity.title}`} value={opportunity.stageId} onChange={(event) => void moveOpportunity(opportunity, Number(event.target.value))} className="min-w-0 flex-1 rounded border border-slate-200 bg-white p-1 text-xs">{board.pipeline.stages.filter((stage) => stage.isActive).map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
                <Button type="button" size="sm" variant="ghost" className="h-7 w-full" onClick={() => openEditor(opportunity)}>Editar negociação</Button>
              </Card>)}
              {!column.items.length && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">Nenhuma oportunidade nesta etapa.</p>}
            </div>
            {column.total > column.items.length && <p className="mt-3 text-center text-xs text-slate-500">Exibindo 200 de {column.total}</p>}
          </section>)}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Empresa / contato</th><th>Etapa</th><th>Produto</th><th>Responsável</th><th>Valor</th><th>Próxima ação</th></tr></thead><tbody>{opportunities.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3"><p className="font-medium">{item.lead.company || item.title}</p><p className="text-xs text-slate-500">{item.lead.name} · {formatPhone(item.lead.phone)}</p></td><td>{item.stage.name}</td><td>{item.productInterest ?? 'Geral'}</td><td>{item.owner?.name ?? 'Sem responsável'}</td><td>{formatCurrency(item.amount)}</td><td>{item.nextActionAt ? new Date(item.nextActionAt).toLocaleString('pt-BR') : '—'}</td></tr>)}</tbody></table>
          {!opportunities.length && <p className="p-10 text-center text-sm text-slate-500">Nenhuma oportunidade encontrada.</p>}
        </Card>
      )}
    </main>
  );
}
