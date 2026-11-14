'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { crmLeadsApi, getStoredUser, isSupervisorRole, LEAD_STATUSES, type CrmPipeline, type CrmPipelineStage, type CrmPipelineStageType } from '@/services/crm-leads';

const REQUIRED_FIELDS = [
  { id: 'title', label: 'Título' },
  { id: 'amount', label: 'Valor estimado' },
  { id: 'expectedCloseAt', label: 'Previsão de fechamento' },
  { id: 'lostReason', label: 'Motivo de perda' },
  { id: 'ownerId', label: 'Responsável' },
];

type StageDraft = Pick<CrmPipelineStage, 'name' | 'description' | 'color' | 'type' | 'isInitial' | 'requiredFields' | 'legacyStatus'>;

export default function CrmPipelinesPage() {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [pipelineId, setPipelineId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newStageType, setNewStageType] = useState<CrmPipelineStageType>('OPEN');
  const [drafts, setDrafts] = useState<Record<number, StageDraft>>({});
  const [archiveTargets, setArchiveTargets] = useState<Record<number, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const selected = pipelines.find((item) => String(item.id) === pipelineId);
  const activeStages = useMemo(() => selected?.stages.filter((stage) => stage.isActive) ?? [], [selected]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await crmLeadsApi.listPipelines();
      const activeSalesFunnels = rows.filter((item) => item.productInterest === null && item.isActive);
      const salesFunnel = activeSalesFunnels.find((item) => item.isDefault) ?? activeSalesFunnels[0];
      setPipelines(salesFunnel ? [salesFunnel] : []);
      setPipelineId(String(salesFunnel?.id ?? ''));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os pipelines.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { setIsAdmin(isSupervisorRole(getStoredUser()?.role)); }, []);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);
  useEffect(() => {
    if (!selected) return;
    setPipelineName(selected.name);
    setPipelineDescription(selected.description ?? '');
    setDrafts(Object.fromEntries(selected.stages.map((stage) => [stage.id, {
      name: stage.name,
      description: stage.description ?? '',
      color: stage.color,
      type: stage.type,
      isInitial: stage.isInitial,
      requiredFields: stage.requiredFields,
      legacyStatus: stage.legacyStatus,
    }])));
  }, [pipelineId, pipelines, selected]);

  const replacePipeline = (pipeline: CrmPipeline) => {
    setPipelines((current) => current.map((item) => item.id === pipeline.id ? pipeline : item));
  };

  const savePipeline = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      replacePipeline(await crmLeadsApi.updatePipeline(selected.id, { name: pipelineName.trim(), description: pipelineDescription || null }));
      toast.success('Pipeline atualizado.');
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o pipeline.'); }
    finally { setSaving(false); }
  };

  const saveStage = async (stage: CrmPipelineStage) => {
    const draft = drafts[stage.id];
    if (!draft) return;
    try {
      const updated = await crmLeadsApi.updatePipelineStage(stage.id, {
        ...draft,
        description: draft.description || null,
        legacyStatus: draft.legacyStatus || null,
      });
      replacePipeline(updated);
      toast.success(`Etapa “${draft.name}” salva.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a etapa.'); }
  };

  const createStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !newStageName.trim()) return;
    try {
      const updated = await crmLeadsApi.createPipelineStage(selected.id, { name: newStageName.trim(), type: newStageType });
      replacePipeline(updated); setNewStageName('');
      toast.success('Etapa criada.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível criar a etapa.'); }
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    if (!selected) return;
    const next = [...activeStages];
    const other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    try { replacePipeline(await crmLeadsApi.reorderPipelineStages(selected.id, next.map((stage) => stage.id))); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível reordenar as etapas.'); }
  };

  const archiveStage = async (stage: CrmPipelineStage) => {
    if (!selected) return;
    try {
      const usage = await crmLeadsApi.stageUsage(stage.id);
      const moveToStageId = archiveTargets[stage.id] ? Number(archiveTargets[stage.id]) : undefined;
      if (usage.activeLeadCount && !moveToStageId) {
        toast.error(`Esta etapa tem ${usage.activeLeadCount} lead(s). Selecione a etapa de destino antes de arquivar.`);
        return;
      }
      if (moveToStageId && !window.confirm(`Mover ${usage.activeLeadCount} lead(s) para a etapa selecionada e arquivar “${stage.name}”?`)) return;
      replacePipeline(await crmLeadsApi.updatePipelineStage(stage.id, { isActive: false, ...(moveToStageId ? { moveToStageId } : {}) }));
      toast.success('Etapa arquivada.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível arquivar a etapa.'); }
  };

  if (!isAdmin) return <main className="p-8"><h1 className="text-xl font-semibold">Configuração restrita</h1><p className="mt-2 text-sm text-slate-600">Somente administradores podem alterar o funil de vendas.</p><Link className="mt-3 inline-block text-blue-700 underline" href="/admin/crm/leads">Voltar para leads</Link></main>;

  return <main className="mx-auto max-w-[1300px] space-y-6 p-4 md:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Configuração do funil de vendas</h1><Link className="text-sm text-blue-700 hover:underline" href="/admin/crm/leads">Voltar para leads</Link></div><p className="mt-1 text-sm text-slate-500">Configure as etapas, os campos obrigatórios e a ordem. A carteira de clientes fica unificada em Leads.</p></div><Settings2 className="h-6 w-6 text-slate-400" /></header>

    {loading ? <div className="flex items-center gap-2 py-10 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Carregando configurações…</div> : <>
      <Card className="grid gap-4 p-4 md:grid-cols-[180px_1fr]">
        <div className="text-sm"><span className="font-medium">Funil ativo</span><p className="mt-2 text-slate-600">{selected?.name ?? 'Não configurado'}</p></div>
        {selected && <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm font-medium">Nome<Input value={pipelineName} onChange={(event) => setPipelineName(event.target.value)} /></label>
          <label className="text-sm font-medium">Descrição<Input value={pipelineDescription} onChange={(event) => setPipelineDescription(event.target.value)} /></label>
          <Button variant="outline" onClick={() => void savePipeline()} disabled={saving}><Save className="mr-2 h-4 w-4" />Salvar</Button>
        </div>}
      </Card>

      {selected && <>
        <Card className="p-4"><h2 className="mb-3 font-semibold">Adicionar etapa</h2><form onSubmit={createStage} className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <label className="text-sm font-medium">Nome<Input required minLength={2} maxLength={80} value={newStageName} onChange={(event) => setNewStageName(event.target.value)} placeholder="Ex.: Demonstração" /></label>
          <label className="text-sm font-medium">Tipo<select value={newStageType} onChange={(event) => setNewStageType(event.target.value as CrmPipelineStageType)} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="OPEN">Em aberto</option><option value="WON">Ganho</option><option value="LOST">Perdido</option></select></label>
          <Button type="submit"><Plus className="mr-2 h-4 w-4" />Adicionar etapa</Button>
        </form></Card>

        <div className="space-y-3">
          {selected.stages.map((stage) => {
            const draft = drafts[stage.id];
            const activeIndex = activeStages.findIndex((item) => item.id === stage.id);
            const otherStages = activeStages.filter((item) => item.id !== stage.id);
            const updateDraft = (patch: Partial<StageDraft>) => setDrafts((current) => ({ ...current, [stage.id]: { ...current[stage.id], ...patch } }));
            return <Card key={stage.id} className={`space-y-4 p-4 ${stage.isActive ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: draft?.color ?? stage.color }} /><h3 className="font-semibold">{stage.name}</h3><span className="text-xs text-slate-500">{stage.type}{stage.isInitial ? ' · inicial' : ''}{!stage.isActive ? ' · arquivada' : ''}</span></div><span className="text-xs text-slate-500">{stage.leadCount ?? 0} lead(s) nesta etapa</span></div>
              {stage.isActive && draft && <>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_180px_180px]">
                  <label className="text-xs font-medium">Nome<Input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} /></label>
                  <label className="text-xs font-medium">Descrição<Input value={draft.description ?? ''} onChange={(event) => updateDraft({ description: event.target.value })} /></label>
                  <label className="text-xs font-medium">Cor<Input type="color" className="h-10 p-1" value={draft.color} onChange={(event) => updateDraft({ color: event.target.value })} /></label>
                  <label className="text-xs font-medium">Tipo<select value={draft.type} onChange={(event) => updateDraft({ type: event.target.value as CrmPipelineStageType, ...(event.target.value !== 'OPEN' ? { isInitial: false } : {}) })} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="OPEN">Em aberto</option><option value="WON">Ganho</option><option value="LOST">Perdido</option></select></label>
                  <label className="text-xs font-medium">Status legado do lead<select value={draft.legacyStatus ?? ''} onChange={(event) => updateDraft({ legacyStatus: (event.target.value || null) as StageDraft['legacyStatus'] })} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Sem mapeamento</option>{LEAD_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.title}</option>)}</select></label>
                </div>
                <div className="flex flex-wrap gap-4">{!draft.isInitial && draft.type === 'OPEN' && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.isInitial} onChange={(event) => updateDraft({ isInitial: event.target.checked })} />Etapa inicial</label>}{REQUIRED_FIELDS.map((field) => <label key={field.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.requiredFields.includes(field.id)} onChange={(event) => updateDraft({ requiredFields: event.target.checked ? [...draft.requiredFields, field.id] : draft.requiredFields.filter((item) => item !== field.id) })} />{field.label} obrigatório</label>)}</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void saveStage(stage)}><Save className="mr-2 h-3.5 w-3.5" />Salvar etapa</Button>
                  <Button size="sm" variant="outline" disabled={activeIndex <= 0} onClick={() => void reorder(activeIndex, -1)} aria-label="Mover etapa para cima"><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" disabled={activeIndex < 0 || activeIndex >= activeStages.length - 1} onClick={() => void reorder(activeIndex, 1)} aria-label="Mover etapa para baixo"><ArrowDown className="h-4 w-4" /></Button>
                  <select aria-label={`Destino dos leads de ${stage.name}`} value={archiveTargets[stage.id] ?? ''} onChange={(event) => setArchiveTargets((current) => ({ ...current, [stage.id]: event.target.value }))} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"><option value="">Destino ao arquivar (se necessário)</option>{otherStages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                  <Button size="sm" variant="destructive" disabled={stage.isInitial} onClick={() => void archiveStage(stage)}>Arquivar etapa</Button>
                </div>
              </>}
            </Card>;
          })}
        </div>
      </>}
    </>}
  </main>;
}
