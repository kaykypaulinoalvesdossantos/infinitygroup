'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ErrorState, LoadingBlock, Pill, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { attendanceApi, type WaRuleInput } from '@/services/whatsapp-settings/attendance';
import type {
  WaChannel,
  WaChannelGroup,
  WaQueue,
  WaRoutingCondition,
  WaRoutingRule,
  WaScopeRef,
} from '@/services/whatsapp-settings/types';
import { ScopeSelect, groupsContaining, scopeLabel } from './scope-select';
import { queuesVisibleTo } from './queues-section';

export const CONDITION_LABEL: Record<WaRoutingCondition, string> = {
  KEYWORD: 'Palavra-chave',
  DDD: 'DDD',
  FIRST_CONTACT: 'Primeiro contato',
  RETURNING: 'Cliente retornando',
  ANY: 'Qualquer conversa',
};

const CONDITIONS = Object.keys(CONDITION_LABEL) as WaRoutingCondition[];
const SCOPE_RANK: Record<WaScopeRef['scope'], number> = { CHANNEL: 0, GROUP: 1, TENANT: 2 };

function rulesVisibleTo(rules: WaRoutingRule[], channel: WaChannel | undefined, groups: WaChannelGroup[]) {
  const groupIds = new Set(groupsContaining(groups, channel?.id).map((group) => group.id));
  return rules
    .filter(
      (rule) =>
        rule.scope === 'TENANT' ||
        (rule.scope === 'CHANNEL' && channel != null && rule.channelId === channel.id) ||
        (rule.scope === 'GROUP' && rule.channelGroupId != null && groupIds.has(rule.channelGroupId)),
    )
    .sort(
      (first, second) =>
        SCOPE_RANK[first.scope] - SCOPE_RANK[second.scope] ||
        first.priority - second.priority ||
        first.id - second.id,
    );
}

export function RoutingSection({ channel }: { channel: WaChannel | undefined }) {
  const [rules, setRules] = useState<WaRoutingRule[] | null>(null);
  const [queues, setQueues] = useState<WaQueue[]>([]);
  const [groups, setGroups] = useState<WaChannelGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<WaRoutingRule | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nextRules, nextQueues, nextGroups] = await Promise.all([
        attendanceApi.rules.list(),
        attendanceApi.queues.list(),
        attendanceApi.groups.list(),
      ]);
      setRules(nextRules);
      setQueues(nextQueues);
      setGroups(nextGroups);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as regras de roteamento.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRules = useMemo(() => rulesVisibleTo(rules ?? [], channel, groups), [rules, channel, groups]);
  const visibleQueues = useMemo(() => queuesVisibleTo(queues, channel, groups), [queues, channel, groups]);
  const queueName = (id: number) => queues.find((queue) => queue.id === id)?.name ?? `Fila ${id}`;

  const createRule = async (values: RuleValues) => {
    setSaving(true);
    try {
      await attendanceApi.rules.create(toBody(values));
      toast.success('Regra criada.');
      await load();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível criar a regra.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRule = async (rule: WaRoutingRule, values: RuleValues) => {
    setSaving(true);
    try {
      await attendanceApi.rules.update(rule.id, toBody(values));
      toast.success('Regra atualizada.');
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível atualizar a regra.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rule: WaRoutingRule, active: boolean) => {
    setSaving(true);
    try {
      await attendanceApi.rules.update(rule.id, { active });
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível alterar a regra.'));
    } finally {
      setSaving(false);
    }
  };

  const removeRule = async (rule: WaRoutingRule) => {
    if (!window.confirm(`Remover a regra "${rule.name}"?`)) return;
    setSaving(true);
    try {
      await attendanceApi.rules.remove(rule.id);
      toast.success('Regra removida.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível remover a regra.'));
    } finally {
      setSaving(false);
    }
  };

  const editQueueOptions = editing
    ? [
        ...visibleQueues,
        ...queues.filter((queue) => queue.id === editing.queueId && !visibleQueues.some((item) => item.id === queue.id)),
      ]
    : visibleQueues;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Ordem de decisão"
        description="Quando uma conversa chega, o sistema escolhe a fila nesta ordem:"
      >
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Responsável exclusivo do canal, se houver.</li>
          <li>Fila padrão do canal, se houver.</li>
          <li>Regras de roteamento por prioridade (canal, grupo e empresa).</li>
          <li>Primeira fila ativa que atende o canal.</li>
        </ol>
      </SectionCard>

      <SectionCard
        title="Nova regra"
        description={
          channel
            ? `Regras de ${channel.name} valem antes das regras de grupo e de empresa.`
            : 'Selecione um canal para criar regras.'
        }
      >
        {channel ? (
          <RuleForm
            key={`new:${channel.id}`}
            channel={channel}
            groups={groups}
            queues={visibleQueues}
            submitting={saving}
            submitLabel="Criar regra"
            onSubmit={createRule}
          />
        ) : (
          <p className="text-sm text-slate-500">Selecione um canal para criar regras.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Regras"
        description="Ordenadas por alcance (canal, grupo e empresa) e, dentro de cada alcance, pela prioridade."
      >
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !rules ? (
          <LoadingBlock rows={2} />
        ) : visibleRules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            Nenhuma regra cadastrada para este canal.
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleRules.map((rule) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0 flex-1 basis-56">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words text-sm font-semibold text-[#1A1A1A]">{rule.name}</p>
                    <Pill tone="blue">{scopeLabel(rule, groups, channel ? [channel] : [])}</Pill>
                  </div>
                  <p className="mt-0.5 break-words text-xs text-slate-500">
                    {CONDITION_LABEL[rule.conditionType]}
                    {rule.conditionValue ? ` · ${rule.conditionValue}` : ''} → {queueName(rule.queueId)} · prioridade{' '}
                    {rule.priority}
                    {rule.returnToOriginalAgent ? ' · retorna ao último atendente' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-2 pr-1">
                    <Switch
                      aria-label={`Ativar regra ${rule.name}`}
                      checked={rule.active}
                      disabled={saving}
                      onCheckedChange={(active) => void toggleActive(rule, active)}
                    />
                    <span className="text-xs text-slate-500">{rule.active ? 'Ativa' : 'Inativa'}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar regra ${rule.name}`}
                    disabled={saving}
                    onClick={() => setEditing(rule)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover regra ${rule.name}`}
                    disabled={saving}
                    onClick={() => void removeRule(rule)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Dialog open={editing != null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar regra</DialogTitle>
            <DialogDescription>Altere as condições e a fila de destino.</DialogDescription>
          </DialogHeader>
          {editing && channel && (
            <RuleForm
              key={`edit:${editing.id}`}
              channel={channel}
              groups={groups}
              queues={editQueueOptions}
              initial={editing}
              submitting={saving}
              submitLabel="Salvar regra"
              onSubmit={(values) => updateRule(editing, values)}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RuleValues {
  name: string;
  conditionType: WaRoutingCondition;
  conditionValue: string;
  queueId: number;
  priority: number;
  returnToOriginalAgent: boolean;
  active: boolean;
  scope: WaScopeRef;
}

function toBody(values: RuleValues): WaRuleInput & WaScopeRef {
  return {
    name: values.name.trim(),
    conditionType: values.conditionType,
    conditionValue: needsValue(values.conditionType) ? values.conditionValue.trim() : '',
    queueId: values.queueId,
    priority: values.priority,
    returnToOriginalAgent: values.returnToOriginalAgent,
    active: values.active,
    scope: values.scope.scope,
    channelId: values.scope.channelId ?? null,
    channelGroupId: values.scope.channelGroupId ?? null,
  };
}

function needsValue(condition: WaRoutingCondition) {
  return condition === 'KEYWORD' || condition === 'DDD';
}

function RuleForm({
  channel,
  groups,
  queues,
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  channel: WaChannel;
  groups: WaChannelGroup[];
  queues: WaQueue[];
  initial?: WaRoutingRule;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: RuleValues) => Promise<unknown> | unknown;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [conditionType, setConditionType] = useState<WaRoutingCondition>(initial?.conditionType ?? 'KEYWORD');
  const [conditionValue, setConditionValue] = useState(initial?.conditionValue ?? '');
  const [queueId, setQueueId] = useState(initial ? String(initial.queueId) : '');
  const [priority, setPriority] = useState(String(initial?.priority ?? 0));
  const [returnToOriginalAgent, setReturnToOriginalAgent] = useState(initial?.returnToOriginalAgent ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [scope, setScope] = useState<WaScopeRef>(
    initial
      ? { scope: initial.scope, channelId: initial.channelId, channelGroupId: initial.channelGroupId }
      : { scope: 'CHANNEL', channelId: channel.id, channelGroupId: null },
  );
  const queueOptions = queues.filter((queue) => queue.active && (
    queue.scope === 'TENANT' ||
    (queue.scope === 'CHANNEL' && scope.scope === 'CHANNEL' && queue.channelId === scope.channelId) ||
    (queue.scope === 'GROUP' && scope.scope === 'GROUP' && queue.channelGroupId === scope.channelGroupId)
  ));
  const validQueueId = queueOptions.some((queue) => String(queue.id) === queueId) ? queueId : '';

  const valueRequired = needsValue(conditionType);
  const priorityNumber = Number(priority);
  const priorityValid = Number.isInteger(priorityNumber) && priorityNumber >= 0 && priorityNumber <= 9999;
  const valueValid =
    !valueRequired ||
    (conditionType === 'DDD' ? /^[1-9]\d$/.test(conditionValue.trim()) : conditionValue.trim().length > 0);
  const canSubmit =
    name.trim().length > 0 &&
    !!validQueueId &&
    valueValid &&
    priorityValid &&
    !(scope.scope === 'GROUP' && !scope.channelGroupId) &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    const result = await onSubmit({
      name,
      conditionType,
      conditionValue,
      queueId: Number(validQueueId),
      priority: priorityNumber,
      returnToOriginalAgent,
      active,
      scope,
    });
    if (!initial && result === true) {
      setName('');
      setConditionValue('');
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`rule-name-${initial?.id ?? 'new'}`} className="text-xs font-semibold text-slate-500">
            Nome da regra
          </Label>
          <Input
            id={`rule-name-${initial?.id ?? 'new'}`}
            value={name}
            maxLength={100}
            placeholder="Ex.: Leads do Sul"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500">Quando</Label>
          <Select value={conditionType} onValueChange={(value) => setConditionType(value as WaRoutingCondition)}>
            <SelectTrigger className="w-full" aria-label="Condição da regra">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {CONDITION_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {valueRequired && (
          <div className="space-y-1.5">
            <Label htmlFor={`rule-value-${initial?.id ?? 'new'}`} className="text-xs font-semibold text-slate-500">
              {conditionType === 'DDD' ? 'DDD (2 dígitos)' : 'Palavra-chave'}
            </Label>
            <Input
              id={`rule-value-${initial?.id ?? 'new'}`}
              value={conditionValue}
              maxLength={conditionType === 'DDD' ? 2 : 255}
              inputMode={conditionType === 'DDD' ? 'numeric' : 'text'}
              placeholder={conditionType === 'DDD' ? '11' : 'palavra ou frase'}
              onChange={(event) => setConditionValue(event.target.value)}
            />
            {conditionType === 'KEYWORD' && (
              <p className="text-xs text-slate-500">Procura palavras ou frases completas, sem diferenciar acentos. Usa a primeira mensagem de texto do cliente.</p>
            )}
            {conditionType === 'DDD' && conditionValue && !valueValid && (
              <p className="text-xs text-red-600">Informe um DDD válido, com 2 dígitos.</p>
            )}
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500">Fila de destino</Label>
          <Select value={validQueueId} onValueChange={setQueueId} disabled={queueOptions.length === 0}>
            <SelectTrigger className="w-full" aria-label="Fila de destino">
              <SelectValue placeholder="Selecione a fila" />
            </SelectTrigger>
            <SelectContent>
              {queueOptions.map((queue) => (
                <SelectItem key={queue.id} value={String(queue.id)}>
                  {queue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {queueOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">Crie ou ative uma fila compatível na seção Filas e atendentes.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`rule-priority-${initial?.id ?? 'new'}`} className="text-xs font-semibold text-slate-500">
            Prioridade
          </Label>
          <Input
            id={`rule-priority-${initial?.id ?? 'new'}`}
            type="number"
            min={0}
            max={9999}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <ScopeSelect value={scope} onChange={setScope} channel={channel} groups={groups} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch
            id={`rule-return-${initial?.id ?? 'new'}`}
            checked={returnToOriginalAgent}
            onCheckedChange={setReturnToOriginalAgent}
          />
          <Label htmlFor={`rule-return-${initial?.id ?? 'new'}`} className="text-sm">
            No retorno, priorizar o último atendente disponível
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id={`rule-active-${initial?.id ?? 'new'}`} checked={active} onCheckedChange={setActive} />
          <Label htmlFor={`rule-active-${initial?.id ?? 'new'}`} className="text-sm">
            Regra ativa
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit} className="gap-2">
          {!initial && <Plus className="h-4 w-4" />}
          {submitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
