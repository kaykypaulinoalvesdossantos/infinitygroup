'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_MARCA,
  NODES,
  OBJECTION_DATA,
  STAGES,
  blankDiagnosis,
  buildScript,
  currentSpeech,
  type Script,
  type ScriptOverrides,
} from '@/components/sales-copilot/engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ErrorState, PageHeader, formatDateTime, getErrorMessage } from '@/components/atendimento/helpers';
import { getStoredUser, isSupervisorRole } from '@/services/crm-leads';
import { salesCopilotApi } from '@/services/sales-copilot';

const NODE_KEYS = Object.keys(NODES);
const PLACEHOLDER_HINT = '{nome}, {vendedor}, {marca} e {proximo} são preenchidos automaticamente na ligação.';
const MARCA_HINT = 'Use um nome masculino, ex.: Grupo Infinity — a fala diz ‘do time comercial do {marca}’';
const SAMPLE_CONTEXT = { nome: 'Maria Souza', empresa: 'Clínica Exemplo', vendedor: 'Carlos', segmento: null };

interface NodeDraft {
  speech: string;
  goal: string;
}

interface ObjectionDraft {
  id: string;
  name: string;
  speech: string;
  goal: string;
  /** Uma resposta do cliente por linha. */
  choices: string;
}

interface Drafts {
  marca: string;
  nodes: Record<string, NodeDraft>;
  objections: ObjectionDraft[];
}

/** Script de referencia (padrao do codigo) para comparar o que foi alterado. */
const DEFAULT_SCRIPT: Script = buildScript(null);

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function draftsFrom(script: Script): Drafts {
  const nodes: Record<string, NodeDraft> = {};
  for (const key of NODE_KEYS) {
    nodes[key] = { speech: script.nodes[key].speech, goal: script.nodes[key].goal };
  }
  const objections = script.objectionNames.map<ObjectionDraft>((name) => {
    const objection = script.objections[name];
    return { id: newId(), name, speech: objection.speech, goal: objection.goal, choices: objection.choices.join('\n') };
  });
  return { marca: script.marca, nodes, objections };
}

function defaultObjectionDrafts(): ObjectionDraft[] {
  return DEFAULT_SCRIPT.objectionNames.map<ObjectionDraft>((name) => {
    const objection = OBJECTION_DATA[name];
    return { id: newId(), name, speech: objection.speech, goal: objection.goal, choices: objection.choices.join('\n') };
  });
}

function parseChoices(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Converte os rascunhos em ScriptOverrides contendo somente o que difere do padrao.
 * Retorna os erros de validacao (o servidor so guarda o que esta aqui).
 */
function buildOverrides(drafts: Drafts): { overrides: ScriptOverrides; errors: string[] } {
  const errors: string[] = [];
  const overrides: ScriptOverrides = {};

  const marca = drafts.marca.trim();
  if (!marca) errors.push('Informe o nome da marca.');
  else if (marca !== DEFAULT_MARCA) overrides.marca = marca;

  const nodes: Record<string, { speech?: string; goal?: string }> = {};
  for (const key of NODE_KEYS) {
    const draft = drafts.nodes[key];
    const speech = draft.speech.trim();
    const goal = draft.goal.trim();
    if (!speech || !goal) {
      errors.push(`A etapa "${key}" precisa de fala e objetivo.`);
      continue;
    }
    const base = DEFAULT_SCRIPT.nodes[key];
    const patch: { speech?: string; goal?: string } = {};
    if (speech !== base.speech) patch.speech = speech;
    if (goal !== base.goal) patch.goal = goal;
    if (Object.keys(patch).length > 0) nodes[key] = patch;
  }
  if (Object.keys(nodes).length > 0) overrides.nodes = nodes;

  if (drafts.objections.length === 0) errors.push('Inclua ao menos uma objeção.');
  const names = new Set<string>();
  const cleaned = drafts.objections.map((item) => {
    const name = item.name.trim();
    const speech = item.speech.trim();
    const goal = item.goal.trim();
    const choices = parseChoices(item.choices);
    if (!name || !speech || choices.length === 0) errors.push('Cada objeção precisa de nome, fala e ao menos uma resposta.');
    if (names.has(name)) errors.push(`A objeção "${name}" está repetida.`);
    names.add(name);
    return { name, speech, goal, choices };
  });

  const differs =
    cleaned.length !== DEFAULT_SCRIPT.objectionNames.length ||
    cleaned.some((item, index) => {
      const name = DEFAULT_SCRIPT.objectionNames[index];
      const base = DEFAULT_SCRIPT.objections[name];
      return (
        item.name !== name ||
        item.speech !== base.speech ||
        item.goal !== base.goal ||
        item.choices.join('\n') !== base.choices.join('\n')
      );
    });
  if (differs && cleaned.length > 0) overrides.objections = cleaned;

  return { overrides, errors };
}

function isNodeAtDefault(key: string, draft: NodeDraft): boolean {
  const base = DEFAULT_SCRIPT.nodes[key];
  return draft.speech.trim() === base.speech && draft.goal.trim() === base.goal;
}

export default function RoteiroPage() {
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCanEdit(isSupervisorRole(getStoredUser()?.role));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    salesCopilotApi
      .getScript<ScriptOverrides>()
      .then((response) => {
        if (!active) return;
        setDrafts(draftsFrom(buildScript(response.data)));
        setUpdatedAt(response.updatedAt);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error, 'Não foi possível carregar o roteiro.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  if (loading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (loadError || !drafts) {
    return (
      <div className="p-6">
        <ErrorState message={loadError ?? 'Não foi possível carregar o roteiro.'} onRetry={() => setReloadToken((t) => t + 1)} />
      </div>
    );
  }

  return (
    <RoteiroEditor
      canEdit={canEdit}
      drafts={drafts}
      setDrafts={setDrafts}
      updatedAt={updatedAt}
      saving={saving}
      setSaving={setSaving}
      onSaved={setUpdatedAt}
    />
  );
}

interface RoteiroEditorProps {
  canEdit: boolean;
  drafts: Drafts;
  setDrafts: (next: Drafts) => void;
  updatedAt: string | null;
  saving: boolean;
  setSaving: (value: boolean) => void;
  onSaved: (value: string | null) => void;
}

function RoteiroEditor({ canEdit, drafts, setDrafts, updatedAt, saving, setSaving, onSaved }: RoteiroEditorProps) {
  const { overrides, errors } = buildOverrides(drafts);
  const previewScript = buildScript({
    marca: drafts.marca,
    nodes: { opening: { speech: drafts.nodes.opening.speech, goal: drafts.nodes.opening.goal } },
  });
  const preview = currentSpeech(blankDiagnosis(), previewScript, SAMPLE_CONTEXT);

  function setNode(key: string, patch: Partial<NodeDraft>) {
    setDrafts({ ...drafts, nodes: { ...drafts.nodes, [key]: { ...drafts.nodes[key], ...patch } } });
  }

  function restoreNode(key: string) {
    const base = DEFAULT_SCRIPT.nodes[key];
    setNode(key, { speech: base.speech, goal: base.goal });
  }

  function updateObjection(id: string, patch: Partial<ObjectionDraft>) {
    setDrafts({
      ...drafts,
      objections: drafts.objections.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function removeObjection(id: string) {
    setDrafts({ ...drafts, objections: drafts.objections.filter((item) => item.id !== id) });
  }

  function addObjection() {
    setDrafts({
      ...drafts,
      objections: [...drafts.objections, { id: newId(), name: '', speech: '', goal: '', choices: '' }],
    });
  }

  async function save() {
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    setSaving(true);
    try {
      const response = await salesCopilotApi.saveScript<ScriptOverrides>(overrides);
      onSaved(response.updatedAt);
      toast.success('Roteiro salvo. As próximas ligações já usam as novas falas.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível salvar o roteiro.'));
    } finally {
      setSaving(false);
    }
  }

  const restoreMarca = () => setDrafts({ ...drafts, marca: DEFAULT_MARCA });

  return (
    <div className="space-y-8 bg-gradient-to-br from-background to-muted/50 p-6 min-h-full">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageHeader
          title="Roteiro de ligação"
          icon={<ClipboardList className="h-8 w-8 text-link" />}
          description="Falas e objetivos usados pelo copiloto de vendas em cada etapa da ligação."
          actions={
            canEdit ? (
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                {saving ? 'Salvando…' : 'Salvar roteiro'}
              </Button>
            ) : undefined
          }
        />

        {!canEdit && (
          <p role="note" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Somente supervisores podem editar o roteiro. Você pode consultar as falas abaixo.
          </p>
        )}
        {updatedAt && (
          <p className="text-xs text-muted-foreground">Última gravação: {formatDateTime(updatedAt)}</p>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <Card className="rounded-2xl border-0 bg-card shadow-md shadow-slate-200/60">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold text-foreground">Marca</h2>
                <div className="space-y-1">
                  <Label htmlFor="roteiro-marca">Nome da marca</Label>
                  <div className="flex gap-2">
                    <Input
                      id="roteiro-marca"
                      value={drafts.marca}
                      disabled={!canEdit}
                      onChange={(event) => setDrafts({ ...drafts, marca: event.target.value })}
                      className="bg-card"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={restoreMarca} disabled={!canEdit || drafts.marca === DEFAULT_MARCA}>
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      Restaurar padrão
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{MARCA_HINT}</p>
                </div>
              </CardContent>
            </Card>

            <section aria-labelledby="roteiro-falas" className="space-y-3">
              <div>
                <h2 id="roteiro-falas" className="text-lg font-semibold text-foreground">
                  Falas por etapa
                </h2>
                <p className="text-sm text-muted-foreground">{PLACEHOLDER_HINT}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placeholders: <code>{'{nome}'}</code> <code>{'{vendedor}'}</code> <code>{'{marca}'}</code>{' '}
                  <code>{'{proximo}'}</code>
                </p>
              </div>
              {STAGES.map((stageLabel, stage) => {
                const keys = NODE_KEYS.filter((key) => NODES[key].stage === stage);
                if (keys.length === 0) return null;
                return (
                  <details key={stage} open={stage === 0} className="group rounded-2xl bg-card shadow-sm">
                    <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold text-foreground">
                      {stage + 1}. {stageLabel}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({keys.length} {keys.length === 1 ? 'fala' : 'falas'})
                      </span>
                    </summary>
                    <div className="space-y-4 px-5 pb-5">
                      {keys.map((key) => {
                        const draft = drafts.nodes[key];
                        const atDefault = isNodeAtDefault(key, draft);
                        return (
                          <div key={key} className="space-y-3 rounded-xl border border-border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <code className="text-xs font-semibold text-muted-foreground">{key}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreNode(key)}
                                disabled={!canEdit || atDefault}
                              >
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                                Restaurar padrão
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`node-${key}-speech`} className="text-xs text-muted-foreground">
                                Fala
                              </Label>
                              <Textarea
                                id={`node-${key}-speech`}
                                rows={3}
                                value={draft.speech}
                                disabled={!canEdit}
                                onChange={(event) => setNode(key, { speech: event.target.value })}
                                className="bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`node-${key}-goal`} className="text-xs text-muted-foreground">
                                Objetivo
                              </Label>
                              <Textarea
                                id={`node-${key}-goal`}
                                rows={2}
                                value={draft.goal}
                                disabled={!canEdit}
                                onChange={(event) => setNode(key, { goal: event.target.value })}
                                className="bg-card"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </section>

            <section aria-labelledby="roteiro-objecoes" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 id="roteiro-objecoes" className="text-lg font-semibold text-foreground">
                    Objeções
                  </h2>
                  <p className="text-sm text-muted-foreground">Cada objeção tem fala, objetivo e respostas (uma por linha).</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => setDrafts({ ...drafts, objections: defaultObjectionDrafts() })}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Restaurar padrão
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={!canEdit} onClick={addObjection}>
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Adicionar objeção
                  </Button>
                </div>
              </div>

              <ul className="space-y-3">
                {drafts.objections.map((item, index) => (
                  <li key={item.id} className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <Label htmlFor={`obj-${item.id}-name`} className="text-xs text-muted-foreground">
                          Nome da objeção {index + 1}
                        </Label>
                        <Input
                          id={`obj-${item.id}-name`}
                          value={item.name}
                          disabled={!canEdit}
                          onChange={(event) => updateObjection(item.id, { name: event.target.value })}
                          className="bg-card"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover objeção ${item.name || index + 1}`}
                        disabled={!canEdit}
                        onClick={() => removeObjection(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-danger-foreground" aria-hidden />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`obj-${item.id}-speech`} className="text-xs text-muted-foreground">
                        Fala
                      </Label>
                      <Textarea
                        id={`obj-${item.id}-speech`}
                        rows={3}
                        value={item.speech}
                        disabled={!canEdit}
                        onChange={(event) => updateObjection(item.id, { speech: event.target.value })}
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`obj-${item.id}-goal`} className="text-xs text-muted-foreground">
                        Objetivo
                      </Label>
                      <Textarea
                        id={`obj-${item.id}-goal`}
                        rows={2}
                        value={item.goal}
                        disabled={!canEdit}
                        onChange={(event) => updateObjection(item.id, { goal: event.target.value })}
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`obj-${item.id}-choices`} className="text-xs text-muted-foreground">
                        Respostas do cliente (uma por linha)
                      </Label>
                      <Textarea
                        id={`obj-${item.id}-choices`}
                        rows={4}
                        value={item.choices}
                        disabled={!canEdit}
                        onChange={(event) => updateObjection(item.id, { choices: event.target.value })}
                        className="bg-card"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6">
            <Card className="rounded-2xl border-0 bg-card shadow-md shadow-slate-200/60">
              <CardContent className="space-y-3 p-5">
                <h2 className="text-sm font-semibold text-foreground">Prévia da abertura</h2>
                <p className="text-xs text-muted-foreground">
                  Exemplo: prospect Maria Souza, vendedor Carlos.
                </p>
                <p aria-live="polite" className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
                  {preview}
                </p>
              </CardContent>
            </Card>
            {canEdit && errors.length > 0 && (
              <div role="alert" className="rounded-xl border border-warning-border bg-warning p-4 text-sm text-warning-foreground">
                <p className="font-medium">Revise antes de salvar:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
