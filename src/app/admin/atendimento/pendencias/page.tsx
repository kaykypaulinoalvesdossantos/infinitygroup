'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock, Clock3, Loader2, Plus, Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  crmLeadsApi,
  getStoredUser,
  isSupervisorRole,
  teamApi,
  type CrmFollowUpTask,
  type CrmMessageTemplate,
  type ProductInterest,
  type TeamUser,
} from '@/services/crm-leads';

type TaskStatus = 'ALL' | CrmFollowUpTask['status'];

const TASK_STATUS: Record<CrmFollowUpTask['status'], string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
  CANCELED: 'Cancelada',
};

function formatDue(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function slug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export default function CommercialFollowUpPage() {
  const user = getStoredUser();
  const supervisor = isSupervisorRole(user?.role);
  const [tab, setTab] = useState<'tasks' | 'templates'>('tasks');
  const [status, setStatus] = useState<TaskStatus>('OPEN');
  const [page, setPage] = useState(1);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [tasks, setTasks] = useState<CrmFollowUpTask[]>([]);
  const [total, setTotal] = useState(0);
  const [owners, setOwners] = useState<TeamUser[]>([]);
  const [templates, setTemplates] = useState<CrmMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CrmMessageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateForm, setTemplateForm] = useState({ key: '', name: '', channel: 'WHATSAPP' as 'WHATSAPP' | 'EMAIL', productInterest: '' as '' | ProductInterest, subject: '', body: '', isActive: true });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await crmLeadsApi.listFollowUpTasks({ status, page, pageSize: 30, ...(ownerFilter !== 'all' ? { ownerId: Number(ownerFilter) } : {}) });
      setTasks(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as pendências.');
    } finally {
      setLoading(false);
    }
  }, [ownerFilter, page, status]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await crmLeadsApi.listMessageTemplates({ includeInactive: supervisor }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os modelos.');
    } finally {
      setLoading(false);
    }
  }, [supervisor]);

  useEffect(() => {
    if (tab === 'tasks') void loadTasks();
    else if (supervisor) void loadTemplates();
    else setTab('tasks');
  }, [loadTasks, loadTemplates, supervisor, tab]);

  useEffect(() => {
    if (!supervisor) return;
    void teamApi.list().then(setOwners).catch(() => setOwners([]));
  }, [supervisor]);

  const saveTask = async (task: CrmFollowUpTask, patch: { status?: CrmFollowUpTask['status']; assignedToId?: number }) => {
    setSavingId(task.id);
    try {
      await crmLeadsApi.updateFollowUpTask(task.id, { expectedVersion: task.version, ...patch });
      toast.success(patch.status ? `Pendência ${TASK_STATUS[patch.status].toLowerCase()}.` : 'Responsável atualizado.');
      await loadTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar a pendência.');
    } finally {
      setSavingId(null);
    }
  };

  const beginEdit = (template: CrmMessageTemplate) => {
    setEditing(template);
    setIsCreating(false);
    setTemplateForm({ key: template.key, name: template.name, channel: template.channel, productInterest: template.productInterest ?? '', subject: template.subject ?? '', body: template.body, isActive: template.isActive });
  };

  const beginCreate = () => {
    setEditing(null);
    setIsCreating(true);
    setTemplateForm({ key: '', name: '', channel: 'WHATSAPP', productInterest: '', subject: '', body: '', isActive: true });
  };

  const saveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) return;
    setTemplateBusy(true);
    try {
      if (editing) {
        await crmLeadsApi.updateMessageTemplate(editing.id, {
          expectedVersion: editing.version,
          name: templateForm.name.trim(),
          productInterest: templateForm.productInterest || null,
          subject: templateForm.subject.trim() || null,
          body: templateForm.body,
          isActive: templateForm.isActive,
        });
        toast.success('Modelo atualizado.');
      } else {
        const key = slug(templateForm.key || templateForm.name);
        await crmLeadsApi.createMessageTemplate({
          key,
          name: templateForm.name.trim(),
          channel: templateForm.channel,
          productInterest: templateForm.productInterest || null,
          subject: templateForm.subject.trim() || null,
          body: templateForm.body,
        });
        toast.success('Modelo criado.');
      }
      setEditing(null);
      setIsCreating(false);
      await loadTemplates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar o modelo.');
    } finally {
      setTemplateBusy(false);
    }
  };

  const activeTemplate = isCreating || editing;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">CRM · Atendimento</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pendências comerciais</h1>
          <p className="mt-1 text-sm text-slate-500">Retornos, correções e ações ligadas ao lead e ao atendimento.</p>
        </div>
        {supervisor && tab === 'templates' && !activeTemplate && <Button onClick={beginCreate}><Plus className="mr-2 h-4 w-4" />Novo modelo</Button>}
      </header>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button variant={tab === 'tasks' ? 'default' : 'outline'} onClick={() => setTab('tasks')}><Clock3 className="mr-2 h-4 w-4" />Pendências</Button>
        {supervisor && <Button variant={tab === 'templates' ? 'default' : 'outline'} onClick={() => setTab('templates')}><Settings2 className="mr-2 h-4 w-4" />Modelos</Button>}
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {tab === 'tasks' && <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELED', 'ALL'] as TaskStatus[]).map((item) => <Button key={item} size="sm" variant={status === item ? 'default' : 'outline'} onClick={() => { setStatus(item); setPage(1); }}>{item === 'ALL' ? 'Todas' : TASK_STATUS[item]}</Button>)}
          </div>
          <div className="flex items-center gap-3">
            {supervisor && <select aria-label="Filtrar responsável" className="h-9 rounded-md border bg-white px-2 text-sm" value={ownerFilter} onChange={(event) => { setOwnerFilter(event.target.value); setPage(1); }}><option value="all">Toda equipe</option>{owners.filter((owner) => ['VENDEDOR', 'ADMIN', 'SUPER_ADMIN'].includes(owner.role)).map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select>}
            <span className="text-sm text-slate-500">{total} registro(s) · {supervisor ? 'equipe' : 'minhas tarefas'}</span>
          </div>
        </div>
        {loading ? <div className="flex justify-center py-14"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div> : tasks.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center gap-2 py-14 text-center"><CalendarClock className="h-8 w-8 text-slate-300" /><p className="font-medium text-slate-700">Nenhuma pendência neste filtro</p><p className="text-sm text-slate-500">Crie uma pendência pelo cadastro do lead ou após uma falha de e-mail.</p><Link href="/admin/crm/leads" className="mt-2 text-sm font-medium text-blue-700">Abrir carteira de leads <ArrowUpRight className="inline h-4 w-4" /></Link></CardContent></Card>
        ) : tasks.map((task) => {
          const isOverdue = !['DONE', 'CANCELED'].includes(task.status) && new Date(task.dueAt).getTime() < Date.now();
          return <Card key={task.id}><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{task.title}</h2><span className={`rounded-full px-2 py-0.5 text-xs ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{TASK_STATUS[task.status]} · {formatDue(task.dueAt)}</span></div>
              <p className="mt-1 text-sm text-slate-600">{task.lead.company || task.lead.name}{task.contact ? ` · ${task.contact.name}` : ''}</p>
              {task.details && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">{task.details}</p>}
              <p className="mt-1 text-xs text-slate-400">Responsável: {task.assignedTo?.name ?? 'Sem responsável'}{task.sourceCallId ? ' · ligada a uma chamada' : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {supervisor && <select aria-label="Responsável" className="h-9 max-w-48 rounded-md border bg-white px-2 text-sm" value={task.assignedToId ?? ''} onChange={(event) => { if (event.target.value) void saveTask(task, { assignedToId: Number(event.target.value) }); }} disabled={savingId === task.id}>
                <option value="">Responsável</option>{owners.filter((owner) => owner.role === 'VENDEDOR' || owner.role === 'ADMIN' || owner.role === 'SUPER_ADMIN').map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
              </select>}
              <select aria-label="Estado da pendência" className="h-9 rounded-md border bg-white px-2 text-sm" value={task.status} onChange={(event) => void saveTask(task, { status: event.target.value as CrmFollowUpTask['status'] })} disabled={savingId === task.id}>
                {Object.entries(TASK_STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <Link href="/admin/crm/leads" className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-slate-700 hover:bg-slate-50">Lead <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              {savingId === task.id && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </div>
          </CardContent></Card>;
        })}
        {total > 30 && <div className="flex items-center justify-between pt-2"><span className="text-xs text-slate-500">Página {page} de {Math.ceil(total / 30)}</span><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>Anterior</Button><Button size="sm" variant="outline" onClick={() => setPage((current) => Math.min(Math.ceil(total / 30), current + 1))} disabled={page >= Math.ceil(total / 30) || loading}>Próxima</Button></div></div>}
      </section>}

      {tab === 'templates' && supervisor && <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <div className="space-y-3">
          {loading ? <div className="flex justify-center py-14"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div> : templates.map((template) => <button type="button" key={template.id} onClick={() => beginEdit(template)} className={`w-full rounded-xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 ${editing?.id === template.id ? 'border-blue-500 bg-blue-50/50' : 'bg-white'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-slate-900">{template.name}</span><span className={`rounded-full px-2 py-0.5 text-xs ${template.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{template.isActive ? 'Ativo' : 'Inativo'}</span></div>
            <p className="mt-1 text-xs text-slate-500">{template.channel === 'WHATSAPP' ? 'WhatsApp · Evolution Go' : 'E-mail'}{template.productInterest ? ` · ${template.productInterest}` : ''} · v{template.version}</p>
            <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">{template.body}</p>
          </button>)}
        </div>
        {activeTemplate ? <Card><CardContent className="space-y-4 p-5">
          <div><h2 className="text-lg font-semibold">{editing ? 'Editar modelo' : 'Novo modelo'}</h2><p className="text-sm text-slate-500">As variáveis disponíveis são {'{{nome}}'}, {'{{empresa}}'}, {'{{vendedor}}'}, {'{{data}}'} e {'{{link}}'}.</p></div>
          {isCreating && <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="template-channel">Canal</Label><select id="template-channel" className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={templateForm.channel} onChange={(event) => setTemplateForm({ ...templateForm, channel: event.target.value as 'WHATSAPP' | 'EMAIL' })}><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">E-mail</option></select></div><div className="space-y-2"><Label htmlFor="template-key">Chave</Label><Input id="template-key" value={templateForm.key} onChange={(event) => setTemplateForm({ ...templateForm, key: event.target.value })} maxLength={80} placeholder="follow-up-telecom" /></div></div>}
          <div className="space-y-2"><Label htmlFor="template-name">Nome</Label><Input id="template-name" value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} maxLength={120} /></div>
          <div className="space-y-2"><Label htmlFor="template-product">Produto</Label><select id="template-product" className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={templateForm.productInterest} onChange={(event) => setTemplateForm({ ...templateForm, productInterest: event.target.value as '' | ProductInterest })}><option value="">Todos os produtos</option><option value="TELECOM">Telecom</option><option value="SEGUROS">Seguros / Insuri</option></select></div>
          {templateForm.channel === 'EMAIL' && <div className="space-y-2"><Label htmlFor="template-subject">Assunto</Label><Input id="template-subject" value={templateForm.subject} onChange={(event) => setTemplateForm({ ...templateForm, subject: event.target.value })} maxLength={255} /></div>}
          <div className="space-y-2"><Label htmlFor="template-body">Mensagem</Label><Textarea id="template-body" rows={9} maxLength={templateForm.channel === 'WHATSAPP' ? 3000 : 8000} value={templateForm.body} onChange={(event) => setTemplateForm({ ...templateForm, body: event.target.value })} /></div>
          {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={templateForm.isActive} onChange={(event) => setTemplateForm({ ...templateForm, isActive: event.target.checked })} />Modelo ativo</label>}
          <div className="flex gap-2"><Button onClick={() => void saveTemplate()} disabled={!templateForm.name.trim() || !templateForm.body.trim() || templateBusy}>{templateBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{editing ? 'Salvar alterações' : 'Criar modelo'}</Button><Button variant="outline" onClick={() => { setEditing(null); setIsCreating(false); }}>Cancelar</Button></div>
        </CardContent></Card> : <Card><CardContent className="flex flex-col items-center py-16 text-center"><Settings2 className="h-8 w-8 text-slate-300" /><p className="mt-3 font-medium">Selecione um modelo</p><p className="mt-1 text-sm text-slate-500">O histórico guarda versão e canal usados em cada envio.</p></CardContent></Card>}
      </section>}
    </main>
  );
}
