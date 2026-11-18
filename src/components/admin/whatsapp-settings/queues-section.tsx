'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, UserPlus, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ErrorState, LoadingBlock, Pill, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { attendanceApi } from '@/services/whatsapp-settings/attendance';
import type {
  WaChannel,
  WaChannelGroup,
  WaDistributionMethod,
  WaQueue,
  WaScopeRef,
  WaUser,
} from '@/services/whatsapp-settings/types';
import { ScopeSelect, groupsContaining, scopeLabel } from './scope-select';

export const DISTRIBUTION_LABEL: Record<WaDistributionMethod, string> = {
  ROUND_ROBIN: 'Rodízio',
  LEAST_BUSY: 'Menor carga',
  RANDOM: 'Sorteio',
};

const DISTRIBUTION_HINT: Record<WaDistributionMethod, string> = {
  ROUND_ROBIN: 'Alterna entre os atendentes na ordem da lista.',
  LEAST_BUSY: 'Envia para quem tem menos conversas abertas.',
  RANDOM: 'Escolhe um atendente ao acaso.',
};

/** Filas que valem para o canal: empresa, este canal e grupos que contêm o canal. */
export function queuesVisibleTo(queues: WaQueue[], channel: WaChannel | undefined, groups: WaChannelGroup[]): WaQueue[] {
  const groupIds = new Set(groupsContaining(groups, channel?.id).map((group) => group.id));
  return queues
    .filter(
      (queue) =>
        queue.scope === 'TENANT' ||
        (queue.scope === 'CHANNEL' && channel != null && queue.channelId === channel.id) ||
        (queue.scope === 'GROUP' && queue.channelGroupId != null && groupIds.has(queue.channelGroupId)),
    )
    .sort((first, second) => first.position - second.position || first.id - second.id);
}

export function QueuesSection({ channel, channels }: { channel: WaChannel | undefined; channels: WaChannel[] }) {
  const [queues, setQueues] = useState<WaQueue[] | null>(null);
  const [users, setUsers] = useState<WaUser[]>([]);
  const [groups, setGroups] = useState<WaChannelGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const channelId = channel?.id;
  const [scope, setScope] = useState<WaScopeRef>({ scope: channelId != null ? 'CHANNEL' : 'TENANT', channelId: channelId ?? null });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nextQueues, nextUsers, nextGroups] = await Promise.all([
        attendanceApi.queues.list(),
        attendanceApi.users.list(),
        attendanceApi.groups.list(),
      ]);
      setQueues(nextQueues);
      setUsers(nextUsers);
      setGroups(nextGroups);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as filas.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setScope({ scope: channelId != null ? 'CHANNEL' : 'TENANT', channelId: channelId ?? null });
  }, [channelId]);

  const visible = useMemo(() => queuesVisibleTo(queues ?? [], channel, groups), [queues, channel, groups]);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await attendanceApi.queues.create({ ...scope, name: name.trim() });
      setName('');
      toast.success('Fila criada. Adicione as pessoas que vão atender.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível criar a fila.'));
    } finally {
      setCreating(false);
    }
  };

  const move = async (queue: WaQueue, direction: -1 | 1) => {
    const index = visible.findIndex((item) => item.id === queue.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= visible.length) return;
    const reordered = [...visible];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try {
      await Promise.all(
        reordered
          .map((item, position) => ({ item, position }))
          .filter(({ item, position }) => item.position !== position)
          .map(({ item, position }) => attendanceApi.queues.update(item.id, { position })),
      );
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível reordenar as filas.'));
    }
  };

  return (
    <SectionCard
      title="Filas e atendentes"
      description={
        channel
          ? `Filas que atendem o canal ${channel.name}: da empresa, deste canal e dos grupos que o contêm.`
          : 'Selecione um canal para ver as filas.'
      }
    >
      <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="wa-queue-name" className="text-xs font-semibold text-muted-foreground">
            Nome da fila
          </Label>
          <Input
            id="wa-queue-name"
            value={name}
            maxLength={100}
            placeholder="Ex.: Comercial"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <ScopeSelect value={scope} onChange={setScope} channel={channel} groups={groups} />
        <div className="sm:col-span-2">
          <Button
            onClick={create}
            disabled={!name.trim() || creating || (scope.scope === 'GROUP' && !scope.channelGroupId)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar fila
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !queues ? (
        <LoadingBlock rows={2} />
      ) : !channel ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Selecione um canal para gerenciar as filas.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhuma fila atende este canal. Crie uma fila acima.
        </p>
      ) : (
        <div className="grid gap-4">
          {visible.map((queue, index) => (
            <QueueCard
              key={`${queue.id}:${JSON.stringify(queue)}`}
              queue={queue}
              groups={groups}
              channels={channels}
              users={users}
              isFirst={index === 0}
              isLast={index === visible.length - 1}
              onMove={(direction) => void move(queue, direction)}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function QueueCard({
  queue,
  groups,
  channels,
  users,
  isFirst,
  isLast,
  onMove,
  onChanged,
}: {
  queue: WaQueue;
  groups: WaChannelGroup[];
  channels: WaChannel[];
  users: WaUser[];
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onChanged: () => Promise<void>;
}) {
  const [description, setDescription] = useState(queue.description ?? '');
  const [distribution, setDistribution] = useState<WaDistributionMethod>(queue.distributionMethod);
  const [maxSimultaneous, setMaxSimultaneous] = useState(String(queue.maxSimultaneous));
  const [enforceLimit, setEnforceLimit] = useState(queue.enforceLimit);
  const [busy, setBusy] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const max = Number(maxSimultaneous);
  const maxValid = Number.isInteger(max) && max >= 1 && max <= 100;
  const detailsDirty =
    description !== (queue.description ?? '') ||
    distribution !== queue.distributionMethod ||
    maxSimultaneous !== String(queue.maxSimultaneous) ||
    enforceLimit !== queue.enforceLimit;

  const agents = [...queue.agents].sort((first, second) => first.position - second.position);
  const assignedIds = new Set(agents.map((agent) => agent.userId));
  const availableUsers = users.filter((user) => !assignedIds.has(user.id));

  const run = async (action: () => Promise<unknown>, success: string | null, fallback: string) => {
    setBusy(true);
    try {
      await action();
      if (success) toast.success(success);
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = () =>
    run(
      () =>
        attendanceApi.queues.update(queue.id, {
          description: description.trim() || null,
          distributionMethod: distribution,
          maxSimultaneous: max,
          enforceLimit,
        }),
      'Configurações da fila salvas.',
      'Não foi possível salvar a fila.',
    );

  const saveAgents = (userIds: number[], success: string) =>
    run(() => attendanceApi.queues.setAgents(queue.id, userIds), success, 'Não foi possível atualizar os atendentes.');

  const toggleActive = (active: boolean) =>
    run(() => attendanceApi.queues.update(queue.id, { active }), active ? 'Fila ativada.' : 'Fila desativada.', 'Não foi possível alterar a fila.');

  const remove = () => {
    if (!window.confirm(`Remover a fila "${queue.name}"?`)) return;
    void run(() => attendanceApi.queues.remove(queue.id), 'Fila removida.', 'Não foi possível remover a fila.');
  };

  const moveAgent = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= agents.length) return;
    const ids = agents.map((agent) => agent.userId);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void saveAgents(ids, 'Ordem dos atendentes atualizada.');
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-sm font-semibold text-foreground">{queue.name}</p>
            <Pill tone="blue">{scopeLabel(queue, groups, channels)}</Pill>
            <Pill tone={queue.active ? 'green' : 'slate'}>{queue.active ? 'Ativa' : 'Inativa'}</Pill>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {agents.length} atendente(s) · {DISTRIBUTION_LABEL[queue.distributionMethod]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Subir fila ${queue.name}`}
            disabled={busy || isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Descer fila ${queue.name}`}
            disabled={busy || isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 pl-1">
            <Switch
              aria-label={`Ativar fila ${queue.name}`}
              checked={queue.active}
              disabled={busy}
              onCheckedChange={toggleActive}
            />
            <span className="text-xs text-muted-foreground">{queue.active ? 'Ativa' : 'Inativa'}</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remover fila ${queue.name}`}
            disabled={busy}
            onClick={remove}
            className="text-danger-foreground hover:text-danger-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground">Descrição</Label>
          <Textarea
            value={description}
            maxLength={500}
            rows={2}
            placeholder="Para que serve esta fila (opcional)"
            aria-label={`Descrição da fila ${queue.name}`}
            disabled={busy}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Distribuição</Label>
          <Select value={distribution} onValueChange={(value) => setDistribution(value as WaDistributionMethod)}>
            <SelectTrigger className="w-full" aria-label={`Distribuição da fila ${queue.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DISTRIBUTION_LABEL) as WaDistributionMethod[]).map((method) => (
                <SelectItem key={method} value={method}>
                  {DISTRIBUTION_LABEL[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{DISTRIBUTION_HINT[distribution]}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`max-${queue.id}`} className="text-xs font-semibold text-muted-foreground">
            Máximo de atendimentos simultâneos por pessoa
          </Label>
          <Input
            id={`max-${queue.id}`}
            type="number"
            min={1}
            max={100}
            value={maxSimultaneous}
            disabled={busy}
            onChange={(event) => setMaxSimultaneous(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch
            aria-label={`Respeitar limite na fila ${queue.name}`}
            checked={enforceLimit}
            disabled={busy}
            onCheckedChange={setEnforceLimit}
          />
          <span className="text-sm text-foreground">
            Respeitar o limite: não enviar novas conversas para quem já atingiu o máximo
          </span>
        </div>
        <div className="sm:col-span-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            disabled={busy || !detailsDirty || !maxValid}
            onClick={saveDetails}
          >
            <Save className="h-4 w-4" />
            Salvar configurações da fila
          </Button>
          {!maxValid && <p className="mt-1 text-xs text-danger-foreground">Informe um número entre 1 e 100.</p>}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Pessoas nesta fila (a ordem define o rodízio)
        </p>
        {agents.length ? (
          <ol className="space-y-2">
            {agents.map((agent, index) => (
              <li
                key={agent.userId}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="w-6 shrink-0 text-xs text-muted-foreground">{index + 1}.</span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {agent.user?.name || `Usuário ${agent.userId}`}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Subir ${agent.user?.name ?? agent.userId} na fila ${queue.name}`}
                  disabled={busy || index === 0}
                  onClick={() => moveAgent(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Descer ${agent.user?.name ?? agent.userId} na fila ${queue.name}`}
                  disabled={busy || index === agents.length - 1}
                  onClick={() => moveAgent(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Remover ${agent.user?.name ?? agent.userId} da fila ${queue.name}`}
                  disabled={busy}
                  onClick={() =>
                    void saveAgents(
                      agents.filter((item) => item.userId !== agent.userId).map((item) => item.userId),
                      'Atendente removido da fila.',
                    )
                  }
                  className="text-danger-foreground hover:text-danger-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma pessoa adicionada. Escolha alguém abaixo para começar.</p>
        )}

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor={`queue-add-user-${queue.id}`} className="text-xs font-semibold text-muted-foreground">Adicionar pessoa à fila</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser} disabled={busy || availableUsers.length === 0}>
              <SelectTrigger id={`queue-add-user-${queue.id}`} className="w-full" aria-label={`Pessoa para a fila ${queue.name}`}>
                <SelectValue placeholder={availableUsers.length ? 'Escolha uma pessoa' : 'Todos já estão na fila'} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name || `Usuário ${user.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            className="gap-2"
            disabled={busy || !selectedUser}
            onClick={() => {
              const userId = Number(selectedUser);
              setSelectedUser('');
              void saveAgents([...agents.map((agent) => agent.userId), userId], 'Atendente adicionado à fila.');
            }}
          >
            <UserPlus className="h-4 w-4" />
            Adicionar pessoa
          </Button>
        </div>
        {users.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum usuário ativo disponível para atender esta fila.</p>
        )}
      </div>
    </div>
  );
}
