'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ErrorState,
  LoadingBlock,
  Pill,
  SectionCard,
  formatDateTime,
  getErrorMessage,
  type Tone,
} from '@/components/atendimento/helpers';
import { flowsApi, type FlowSimulationStep } from '@/services/whatsapp-settings/flows';
import type { WaFlowGraph, WaFlowNodeType, WaFlowRun, WaFlowVersion } from '@/services/whatsapp-settings/types';

const NODE_TYPES: WaFlowNodeType[] = ['START', 'TASK', 'WAIT', 'REVIEW', 'CONDITION', 'END'];

const NODE_TYPE_LABEL: Record<WaFlowNodeType, string> = {
  START: 'Início',
  TASK: 'Tarefa',
  WAIT: 'Espera',
  REVIEW: 'Revisão',
  CONDITION: 'Condição',
  END: 'Fim',
};

const selectClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0076FF]/30';

const primaryButtonClass = 'bg-[#0076FF] text-white hover:bg-[#0062D6]';

interface DraftNode {
  id: string;
  type: WaFlowNodeType;
  label: string;
  config: Record<string, unknown>;
}

interface DraftEdge {
  from: string;
  to: string;
  label: string;
}

interface Draft {
  name: string;
  nodes: DraftNode[];
  edges: DraftEdge[];
}

let idSequence = 0;
function newId(): string {
  idSequence += 1;
  return `n${Date.now().toString(36)}${idSequence}`;
}

function defaultConfig(type: WaFlowNodeType): Record<string, unknown> {
  switch (type) {
    case 'WAIT':
      return { hours: 24 };
    case 'TASK':
      return { instructions: '', assignee: 'OWNER' };
    case 'REVIEW':
      return { question: '' };
    case 'CONDITION':
      return { question: '', options: ['Sim', 'Não'] };
    default:
      return {};
  }
}

function newNode(type: WaFlowNodeType, label?: string): DraftNode {
  return { id: newId(), type, label: label ?? NODE_TYPE_LABEL[type], config: defaultConfig(type) };
}

function templateDraft(): Draft {
  const start = newNode('START', 'Início');
  const task = newNode('TASK', 'Tarefa do atendente');
  const end = newNode('END', 'Fim');
  return {
    name: 'Novo fluxo',
    nodes: [start, task, end],
    edges: [
      { from: start.id, to: task.id, label: '' },
      { from: task.id, to: end.id, label: '' },
    ],
  };
}

function graphToDraft(version: WaFlowVersion): Draft {
  return {
    name: version.name,
    nodes: version.graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label ?? '',
      config: { ...node.config },
    })),
    edges: version.graph.edges.map((edge) => ({ from: edge.from, to: edge.to, label: edge.label ?? '' })),
  };
}

function cleanConfig(config: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') out[key] = value.trim();
    else if (Array.isArray(value)) {
      out[key] = value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter((item) => item !== '');
    } else out[key] = value;
  }
  return out;
}

function draftToGraph(draft: Draft): WaFlowGraph {
  return {
    nodes: draft.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label.trim(),
      config: cleanConfig(node.config),
    })),
    edges: draft.edges.map((edge) => {
      const label = edge.label.trim();
      return label ? { from: edge.from, to: edge.to, label } : { from: edge.from, to: edge.to };
    }),
  };
}

function snapshot(draft: Draft): string {
  return JSON.stringify({ name: draft.name.trim(), graph: draftToGraph(draft) });
}

/** Opções brutas de um nó CONDITION (podem conter vazios enquanto o usuário edita). */
function rawOptions(node: DraftNode): string[] {
  return Array.isArray(node.config.options) ? node.config.options.map((option) => String(option)) : [];
}

function conditionOptions(node: DraftNode): string[] {
  return rawOptions(node)
    .map((option) => option.trim())
    .filter((option) => option !== '');
}

function configText(node: DraftNode, key: string): string {
  const value = node.config[key];
  return typeof value === 'string' ? value : '';
}

function labelOf(node: DraftNode): string {
  return node.label.trim() || NODE_TYPE_LABEL[node.type];
}

function nodeOptionLabel(node: DraftNode): string {
  return `${labelOf(node)} (${NODE_TYPE_LABEL[node.type]})`;
}

function validateDraft(draft: Draft): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push('Informe o nome do fluxo.');

  const starts = draft.nodes.filter((node) => node.type === 'START');
  if (starts.length !== 1) errors.push('O fluxo precisa de exatamente um nó Início.');
  if (!draft.nodes.some((node) => node.type === 'END')) errors.push('Adicione pelo menos um nó Fim.');

  for (const node of draft.nodes) {
    const name = labelOf(node);
    if (!node.label.trim()) errors.push(`Dê um rótulo ao nó ${NODE_TYPE_LABEL[node.type]}.`);

    if (node.type === 'WAIT') {
      const hours = Number(node.config.hours);
      if (!Number.isFinite(hours) || hours <= 0) errors.push(`${name}: informe um número de horas maior que zero.`);
    }
    if (node.type === 'TASK' && !configText(node, 'instructions').trim()) {
      errors.push(`${name}: informe as instruções da tarefa.`);
    }
    if (node.type === 'REVIEW' && !configText(node, 'question').trim()) {
      errors.push(`${name}: informe a pergunta da revisão.`);
    }
    if (node.type === 'CONDITION') {
      if (!configText(node, 'question').trim()) errors.push(`${name}: informe a pergunta da condição.`);
      const options = conditionOptions(node);
      if (options.length === 0) errors.push(`${name}: adicione pelo menos uma opção.`);
      else if (new Set(options).size !== options.length) errors.push(`${name}: há opções repetidas.`);
      for (const option of options) {
        if (!draft.edges.some((edge) => edge.from === node.id && edge.label.trim() === option)) {
          errors.push(`${name}: falta uma conexão para a opção "${option}".`);
        }
      }
    }
  }

  for (const edge of draft.edges) {
    const source = draft.nodes.find((node) => node.id === edge.from);
    if (!source) continue;
    if (source.type === 'END') errors.push(`${labelOf(source)}: o nó Fim não pode ter saídas.`);
    if (source.type === 'CONDITION' && !conditionOptions(source).includes(edge.label.trim())) {
      errors.push(`${labelOf(source)}: a conexão usa um rótulo que não é opção da condição.`);
    }
  }

  if (starts.length === 1) {
    const reached = new Set<string>([starts[0].id]);
    const queue: string[] = [starts[0].id];
    for (let index = 0; index < queue.length; index += 1) {
      for (const edge of draft.edges) {
        if (edge.from === queue[index] && !reached.has(edge.to)) {
          reached.add(edge.to);
          queue.push(edge.to);
        }
      }
    }
    for (const node of draft.nodes) {
      if (!reached.has(node.id)) errors.push(`${labelOf(node)} não é alcançável a partir do Início.`);
    }
  }

  return Array.from(new Set(errors));
}

function stepTitle(step: FlowSimulationStep): string {
  return step.label || step.node || step.nodeId || 'Passo';
}

function stepDetail(step: FlowSimulationStep): string {
  const parts: string[] = [];
  if (step.type) parts.push(NODE_TYPE_LABEL[step.type] ?? step.type);
  if (step.decision) parts.push(`decisão: ${step.decision}`);
  if (step.message) parts.push(step.message);
  return parts.join(' · ');
}

const RUN_STATUS: Record<WaFlowRun['status'], { label: string; tone: Tone }> = {
  RUNNING: { label: 'Em andamento', tone: 'blue' },
  WAITING: { label: 'Aguardando', tone: 'amber' },
  DONE: { label: 'Concluído', tone: 'green' },
  CANCELLED: { label: 'Cancelado', tone: 'slate' },
};

export function FlowsSection() {
  const [versions, setVersions] = useState<WaFlowVersion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseline, setBaseline] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [addType, setAddType] = useState<WaFlowNodeType>('TASK');
  const [simAnswers, setSimAnswers] = useState<Record<string, string>>({});
  const [simSteps, setSimSteps] = useState<FlowSimulationStep[] | null>(null);
  const [simulating, setSimulating] = useState(false);

  const loadVersions = useCallback(async () => {
    try {
      const list = await flowsApi.list();
      setVersions(list);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Não foi possível carregar os fluxos.'));
      setVersions((previous) => previous ?? []);
    }
  }, []);

  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  const current = typeof selectedId === 'number' ? (versions?.find((version) => version.id === selectedId) ?? null) : null;
  const dirty = draft !== null && snapshot(draft) !== baseline;
  const errors = useMemo(() => (draft ? validateDraft(draft) : []), [draft]);
  const conditionNodes = draft ? draft.nodes.filter((node) => node.type === 'CONDITION') : [];

  function confirmDiscard(): boolean {
    return !dirty || window.confirm('Há alterações não salvas. Descartar e continuar?');
  }

  function openVersion(version: WaFlowVersion) {
    if (!confirmDiscard()) return;
    const next = graphToDraft(version);
    setDraft(next);
    setBaseline(snapshot(next));
    setSelectedId(version.id);
    setSimSteps(null);
    setSimAnswers({});
  }

  function startNewDraft() {
    if (!confirmDiscard()) return;
    setDraft(templateDraft());
    setBaseline('');
    setSelectedId('new');
    setSimSteps(null);
    setSimAnswers({});
  }

  const patchDraft = (fn: (value: Draft) => Draft) => setDraft((value) => (value ? fn(value) : value));

  const updateNode = (id: string, patch: Partial<DraftNode>) =>
    patchDraft((value) => ({
      ...value,
      nodes: value.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    }));

  const updateConfig = (id: string, patch: Record<string, unknown>) =>
    patchDraft((value) => ({
      ...value,
      nodes: value.nodes.map((node) => (node.id === id ? { ...node, config: { ...node.config, ...patch } } : node)),
    }));

  const changeType = (id: string, type: WaFlowNodeType) =>
    patchDraft((value) => ({
      ...value,
      nodes: value.nodes.map((node) => (node.id === id ? { ...node, type, config: defaultConfig(type) } : node)),
    }));

  const removeNode = (id: string) =>
    patchDraft((value) => ({
      ...value,
      nodes: value.nodes.filter((node) => node.id !== id),
      edges: value.edges.filter((edge) => edge.from !== id && edge.to !== id),
    }));

  const addNode = () => patchDraft((value) => ({ ...value, nodes: [...value.nodes, newNode(addType)] }));

  const updateEdge = (index: number, patch: Partial<DraftEdge>) =>
    patchDraft((value) => ({
      ...value,
      edges: value.edges.map((edge, position) => (position === index ? { ...edge, ...patch } : edge)),
    }));

  const removeEdge = (index: number) =>
    patchDraft((value) => ({ ...value, edges: value.edges.filter((_, position) => position !== index) }));

  const addEdge = () =>
    patchDraft((value) => {
      const first = value.nodes[0];
      if (!first) return value;
      const second = value.nodes[1] ?? first;
      return { ...value, edges: [...value.edges, { from: first.id, to: second.id, label: '' }] };
    });

  const updateOption = (nodeId: string, index: number, nextValue: string) =>
    patchDraft((value) => {
      const node = value.nodes.find((item) => item.id === nodeId);
      if (!node) return value;
      const options = rawOptions(node);
      const previous = options[index] ?? '';
      const nextOptions = options.map((option, position) => (position === index ? nextValue : option));
      // Mantém as conexões ligadas à opção quando ela é renomeada.
      const edges =
        previous === ''
          ? value.edges
          : value.edges.map((edge) =>
              edge.from === nodeId && edge.label === previous ? { ...edge, label: nextValue } : edge,
            );
      return {
        ...value,
        nodes: value.nodes.map((item) => (item.id === nodeId ? { ...item, config: { ...item.config, options: nextOptions } } : item)),
        edges,
      };
    });

  const addOption = (nodeId: string) =>
    patchDraft((value) => ({
      ...value,
      nodes: value.nodes.map((node) =>
        node.id === nodeId ? { ...node, config: { ...node.config, options: [...rawOptions(node), ''] } } : node,
      ),
    }));

  const removeOption = (nodeId: string, index: number) =>
    patchDraft((value) => {
      const node = value.nodes.find((item) => item.id === nodeId);
      if (!node) return value;
      const options = rawOptions(node);
      const removed = options[index] ?? '';
      return {
        ...value,
        nodes: value.nodes.map((item) =>
          item.id === nodeId
            ? { ...item, config: { ...item.config, options: options.filter((_, position) => position !== index) } }
            : item,
        ),
        edges:
          removed === ''
            ? value.edges
            : value.edges.filter((edge) => !(edge.from === nodeId && edge.label === removed)),
      };
    });

  async function saveNewVersion() {
    if (!draft || errors.length > 0) return;
    const savedSnapshot = snapshot(draft);
    const name = draft.name.trim();
    const graph = draftToGraph(draft);
    setSaving(true);
    try {
      const created = await flowsApi.create({ name, graph });
      toast.success('Nova versão salva como rascunho.');
      setVersions((previous) => [created, ...(previous ?? [])]);
      setSelectedId(created.id);
      setBaseline(savedSnapshot);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível salvar o fluxo.'));
    } finally {
      setSaving(false);
    }
  }

  async function publishCurrent() {
    if (!current || current.publishedAt || dirty) return;
    setPublishing(true);
    try {
      await flowsApi.publish(current.id);
      toast.success('Fluxo publicado. Ele já pode ser iniciado nas conversas.');
      await loadVersions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível publicar o fluxo.'));
    } finally {
      setPublishing(false);
    }
  }

  async function runSimulation() {
    if (!draft) return;
    if (errors.length > 0) {
      toast.error('Corrija as pendências antes de simular.');
      return;
    }
    const answers: Record<string, string> = {};
    for (const node of conditionNodes) {
      answers[node.id] = simAnswers[node.id] ?? conditionOptions(node)[0] ?? '';
    }
    setSimulating(true);
    try {
      const steps = await flowsApi.simulate({ graph: draftToGraph(draft), answers });
      setSimSteps(steps);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível simular o fluxo.'));
    } finally {
      setSimulating(false);
    }
  }

  function renderConfig(node: DraftNode) {
    if (node.type === 'WAIT') {
      return (
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor={`hours-${node.id}`}>Horas de espera</Label>
          <Input
            id={`hours-${node.id}`}
            type="number"
            min={0}
            step="0.5"
            value={node.config.hours === undefined ? '' : String(node.config.hours)}
            onChange={(event) =>
              updateConfig(node.id, { hours: event.target.value === '' ? '' : Number(event.target.value) })
            }
          />
        </div>
      );
    }

    if (node.type === 'TASK') {
      return (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="space-y-1.5">
            <Label htmlFor={`instructions-${node.id}`}>Instruções da tarefa</Label>
            <Textarea
              id={`instructions-${node.id}`}
              rows={3}
              value={configText(node, 'instructions')}
              onChange={(event) => updateConfig(node.id, { instructions: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`assignee-${node.id}`}>Responsável</Label>
            <select
              id={`assignee-${node.id}`}
              className={selectClass}
              value={configText(node, 'assignee') || 'OWNER'}
              onChange={(event) => updateConfig(node.id, { assignee: event.target.value })}
            >
              <option value="OWNER">Responsável pela conversa</option>
            </select>
          </div>
        </div>
      );
    }

    if (node.type === 'REVIEW') {
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`question-${node.id}`}>Pergunta da revisão</Label>
          <Textarea
            id={`question-${node.id}`}
            rows={2}
            value={configText(node, 'question')}
            onChange={(event) => updateConfig(node.id, { question: event.target.value })}
          />
        </div>
      );
    }

    if (node.type === 'CONDITION') {
      const options = rawOptions(node);
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`question-${node.id}`}>Pergunta da condição</Label>
            <Textarea
              id={`question-${node.id}`}
              rows={2}
              value={configText(node, 'question')}
              onChange={(event) => updateConfig(node.id, { question: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Opções (cada opção precisa de uma conexão de saída)</Label>
            {options.map((option, index) => (
              <div key={`${index}-${option}`} className="flex items-center gap-2">
                <Input
                  aria-label={`Opção ${index + 1}`}
                  value={option}
                  onChange={(event) => updateOption(node.id, index, event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover opção ${index + 1}`}
                  onClick={() => removeOption(node.id, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addOption(node.id)}>
              <Plus className="h-4 w-4" /> Adicionar opção
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }

  const publishedAt = current?.publishedAt ?? null;

  return (
    <SectionCard
      title="Fluxos humanos"
      description="Fluxos humanos organizam tarefas, esperas e revisões do atendente. Eles não enviam mensagens nem fazem ligações automaticamente."
    >
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Button type="button" className={`w-full ${primaryButtonClass}`} onClick={startNewDraft}>
            <Plus className="h-4 w-4" /> Novo fluxo
          </Button>

          {versions === null && !loadError ? (
            <LoadingBlock rows={3} />
          ) : loadError && (versions ?? []).length === 0 ? (
            <ErrorState message={loadError} onRetry={() => void loadVersions()} />
          ) : (versions ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma versão criada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {(versions ?? []).map((version) => {
                const active = selectedId === version.id;
                return (
                  <li key={version.id}>
                    <button
                      type="button"
                      onClick={() => openVersion(version)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        active ? 'border-[#0076FF] bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800">{version.name}</span>
                        {version.publishedAt ? (
                          <Pill tone="green">Publicado</Pill>
                        ) : (
                          <Pill tone="slate">Rascunho</Pill>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {version.publishedAt
                          ? `Publicado em ${formatDateTime(version.publishedAt)}`
                          : `Criado em ${formatDateTime(version.createdAt)}`}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="min-w-0">
          {!draft ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Selecione uma versão à esquerda ou crie um novo fluxo.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={selectedId === 'new' ? 'amber' : publishedAt ? 'green' : 'slate'}>
                  {selectedId === 'new' ? 'Nova versão' : publishedAt ? 'Publicado' : 'Rascunho'}
                </Pill>
                {dirty && <Pill tone="amber">Alterações não salvas</Pill>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="flow-name">Nome do fluxo</Label>
                <Input
                  id="flow-name"
                  value={draft.name}
                  maxLength={120}
                  onChange={(event) => patchDraft((value) => ({ ...value, name: event.target.value }))}
                />
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Nós</h3>
                {draft.nodes.length === 0 && <p className="text-sm text-slate-500">Nenhum nó adicionado.</p>}
                {draft.nodes.map((node) => (
                  <div key={node.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
                      <div className="space-y-1.5">
                        <Label htmlFor={`type-${node.id}`}>Tipo</Label>
                        <select
                          id={`type-${node.id}`}
                          className={selectClass}
                          value={node.type}
                          onChange={(event) => changeType(node.id, event.target.value as WaFlowNodeType)}
                        >
                          {NODE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {NODE_TYPE_LABEL[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`label-${node.id}`}>Rótulo</Label>
                        <Input
                          id={`label-${node.id}`}
                          value={node.label}
                          maxLength={120}
                          onChange={(event) => updateNode(node.id, { label: event.target.value })}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remover nó"
                        onClick={() => removeNode(node.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    {renderConfig(node)}
                  </div>
                ))}

                <div className="flex flex-wrap items-end gap-2">
                  <label className="space-y-1 text-xs font-medium text-slate-600">
                    <span className="block">Tipo da etapa</span>
                    <select
                      aria-label="Tipo da etapa a adicionar"
                      className={`${selectClass} w-auto min-w-[160px]`}
                      value={addType}
                      onChange={(event) => setAddType(event.target.value as WaFlowNodeType)}
                    >
                      {NODE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {NODE_TYPE_LABEL[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="button" variant="outline" onClick={addNode}>
                    <Plus className="h-4 w-4" /> Adicionar nó
                  </Button>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Conexões</h3>
                {draft.edges.length === 0 && <p className="text-sm text-slate-500">Nenhuma conexão.</p>}
                {draft.edges.map((edge, index) => {
                  const source = draft.nodes.find((node) => node.id === edge.from);
                  const isCondition = source?.type === 'CONDITION';
                  return (
                    <div
                      key={index}
                      className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span className="block">De</span>
                        <select
                          aria-label={`Etapa de origem da conexão ${index + 1}`}
                          className={selectClass}
                          value={edge.from}
                          onChange={(event) => updateEdge(index, { from: event.target.value })}
                        >
                          {draft.nodes.map((node) => (
                            <option key={node.id} value={node.id}>
                              {nodeOptionLabel(node)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span className="block">Para</span>
                        <select
                          aria-label={`Etapa de destino da conexão ${index + 1}`}
                          className={selectClass}
                          value={edge.to}
                          onChange={(event) => updateEdge(index, { to: event.target.value })}
                        >
                          {draft.nodes.map((node) => (
                            <option key={node.id} value={node.id}>
                              {nodeOptionLabel(node)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {isCondition && source ? (
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span className="block">Quando a resposta for</span>
                          <select
                            aria-label={`Resposta da condição na conexão ${index + 1}`}
                            className={selectClass}
                            value={edge.label}
                            onChange={(event) => updateEdge(index, { label: event.target.value })}
                          >
                            <option value="">Escolha uma opção</option>
                            {conditionOptions(source).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <Input
                          aria-label="Rótulo da conexão"
                          placeholder="Rótulo (opcional)"
                          value={edge.label}
                          onChange={(event) => updateEdge(index, { label: event.target.value })}
                        />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remover conexão"
                        onClick={() => removeEdge(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={addEdge} disabled={draft.nodes.length === 0}>
                  <Plus className="h-4 w-4" /> Adicionar conexão
                </Button>
              </section>

              <div
                className={`rounded-xl border p-3 text-sm ${
                  errors.length > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
                role="status"
              >
                {errors.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Fluxo válido.</p>
                )}
              </div>

              {conditionNodes.length > 0 && (
                <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-700">Respostas para a simulação</p>
                  {conditionNodes.map((node) => {
                    const options = conditionOptions(node);
                    return (
                      <div key={node.id} className="space-y-1.5">
                        <Label htmlFor={`answer-${node.id}`}>{labelOf(node)}</Label>
                        <select
                          id={`answer-${node.id}`}
                          className={selectClass}
                          value={simAnswers[node.id] ?? options[0] ?? ''}
                          onChange={(event) =>
                            setSimAnswers((previous) => ({ ...previous, [node.id]: event.target.value }))
                          }
                        >
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className={primaryButtonClass}
                  onClick={() => void saveNewVersion()}
                  disabled={saving || errors.length > 0}
                >
                  {saving ? 'Salvando...' : 'Salvar nova versão'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void runSimulation()}
                  disabled={simulating || errors.length > 0}
                >
                  {simulating ? 'Simulando...' : 'Simular'}
                </Button>
                {current && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void publishCurrent()}
                    disabled={publishing || !!current.publishedAt || dirty}
                  >
                    {current.publishedAt ? 'Publicado' : publishing ? 'Publicando...' : 'Publicar'}
                  </Button>
                )}
              </div>
              {current && dirty && (
                <p className="text-xs text-slate-500">Salve a alteração como nova versão antes de publicar.</p>
              )}

              {simSteps && (
                <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">Passos da simulação</p>
                  {simSteps.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum passo gerado.</p>
                  ) : (
                    <ol className="space-y-2">
                      {simSteps.map((step, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#0076FF]">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">{stepTitle(step)}</p>
                            {stepDetail(step) && <p className="text-slate-500">{stepDetail(step)}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

const RUN_NODE_TYPES_WITH_DECISION: WaFlowNodeType[] = ['CONDITION', 'REVIEW'];

export function FlowRunsPanel({ conversationId }: { conversationId: number }) {
  const [versions, setVersions] = useState<WaFlowVersion[]>([]);
  const [runs, setRuns] = useState<WaFlowRun[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chosenVersion, setChosenVersion] = useState('');
  const [starting, setStarting] = useState(false);
  const [busyRunId, setBusyRunId] = useState<number | null>(null);
  const [decisions, setDecisions] = useState<Record<number, string>>({});

  const publishedVersions = versions.filter((version) => version.publishedAt);
  const versionById = useMemo(() => new Map(versions.map((version) => [version.id, version])), [versions]);
  const versionValue = chosenVersion || String(publishedVersions[0]?.id ?? '');

  const loadRuns = useCallback(async () => {
    try {
      setRuns(await flowsApi.listRuns(conversationId));
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Não foi possível carregar os fluxos desta conversa.'));
      setRuns((previous) => previous ?? []);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    flowsApi
      .list()
      .then(setVersions)
      .catch((error: unknown) => toast.error(getErrorMessage(error, 'Não foi possível carregar os fluxos.')));
  }, []);

  function nodeLabelFor(run: WaFlowRun, nodeId: string): string {
    const node = versionById.get(run.versionId)?.graph.nodes.find((item) => item.id === nodeId);
    return node ? node.label || NODE_TYPE_LABEL[node.type] : nodeId;
  }

  function decisionChoices(run: WaFlowRun): string[] {
    const graph = versionById.get(run.versionId)?.graph;
    if (!graph) return [];
    const node = graph.nodes.find((item) => item.id === run.currentNode);
    if (!node || !RUN_NODE_TYPES_WITH_DECISION.includes(node.type)) return [];
    const labels = graph.edges
      .filter((edge) => edge.from === run.currentNode && edge.label)
      .map((edge) => edge.label as string);
    return Array.from(new Set(labels));
  }

  async function startRun() {
    const id = Number(versionValue);
    if (!id) return;
    setStarting(true);
    try {
      await flowsApi.startRun({ conversationId, versionId: id });
      toast.success('Fluxo iniciado.');
      await loadRuns();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível iniciar o fluxo.'));
    } finally {
      setStarting(false);
    }
  }

  async function advanceRun(run: WaFlowRun) {
    const choices = decisionChoices(run);
    const decision = choices.length > 0 ? (decisions[run.id] ?? choices[0]) : undefined;
    setBusyRunId(run.id);
    try {
      await flowsApi.advance(run.id, decision);
      toast.success('Fluxo avançado.');
      await loadRuns();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível avançar o fluxo.'));
    } finally {
      setBusyRunId(null);
    }
  }

  async function cancelRun(run: WaFlowRun) {
    if (!window.confirm('Cancelar este fluxo nesta conversa?')) return;
    setBusyRunId(run.id);
    try {
      await flowsApi.cancel(run.id);
      toast.success('Fluxo cancelado.');
      await loadRuns();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível cancelar o fluxo.'));
    } finally {
      setBusyRunId(null);
    }
  }

  return (
    <SectionCard title="Fluxos humanos" description="Tarefas, esperas e revisões acompanhadas nesta conversa.">
      <div className="space-y-4">
        {publishedVersions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum fluxo publicado. Publique um fluxo em Configurações para iniciá-lo aqui.
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="space-y-1 text-xs font-medium text-slate-600 sm:flex-1">
              <span className="block">Versão do fluxo</span>
              <select
                aria-label="Versão do fluxo a iniciar"
                className={selectClass}
                value={versionValue}
                onChange={(event) => setChosenVersion(event.target.value)}
              >
                {publishedVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              className={primaryButtonClass}
              onClick={() => void startRun()}
              disabled={starting}
            >
              {starting ? 'Iniciando...' : 'Iniciar fluxo'}
            </Button>
          </div>
        )}

        {runs === null && !loadError ? (
          <LoadingBlock rows={2} />
        ) : loadError && (runs ?? []).length === 0 ? (
          <ErrorState message={loadError} onRetry={() => void loadRuns()} />
        ) : (runs ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum fluxo iniciado nesta conversa.</p>
        ) : (
          <ul className="space-y-3">
            {(runs ?? []).map((run) => {
              const version = versionById.get(run.versionId);
              const status = RUN_STATUS[run.status];
              const active = run.status === 'RUNNING' || run.status === 'WAITING';
              const choices = decisionChoices(run);
              const busy = busyRunId === run.id;
              return (
                <li key={run.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {version?.name ?? `Versão ${run.versionId}`}
                    </span>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </div>

                  {active && (
                    <p className="text-sm text-slate-600">
                      Etapa atual: <span className="font-medium">{nodeLabelFor(run, run.currentNode)}</span>
                    </p>
                  )}
                  {run.status === 'WAITING' && run.dueAt && (
                    <p className="text-xs text-slate-500">Retoma em {formatDateTime(run.dueAt)}</p>
                  )}

                  {active && (
                    <div className="flex flex-wrap items-end gap-2">
                      {choices.length > 0 && (
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span className="block">Decisão</span>
                          <select
                            aria-label={`Decisão do fluxo ${version?.name ?? run.versionId}`}
                            className={`${selectClass} w-auto min-w-[160px]`}
                            value={decisions[run.id] ?? choices[0]}
                            onChange={(event) => setDecisions((previous) => ({ ...previous, [run.id]: event.target.value }))}
                          >
                            {choices.map((choice) => (
                              <option key={choice} value={choice}>
                                {choice}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        className={primaryButtonClass}
                        disabled={busy}
                        onClick={() => void advanceRun(run)}
                      >
                        Avançar
                      </Button>
                      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void cancelRun(run)}>
                        Cancelar fluxo
                      </Button>
                    </div>
                  )}

                  {run.history.length > 0 && (
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer">Histórico ({run.history.length})</summary>
                      <ol className="mt-2 space-y-1">
                        {run.history.map((entry, index) => (
                          <li key={`${entry.at}-${index}`}>
                            {formatDateTime(entry.at)} · {nodeLabelFor(run, entry.node)}
                            {entry.decision ? ` · decisão: ${entry.decision}` : ''}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
