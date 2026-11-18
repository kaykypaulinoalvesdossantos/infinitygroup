'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ErrorState, LoadingBlock, Pill, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { attendanceApi } from '@/services/whatsapp-settings/attendance';
import type { WaChannel, WaChannelGroup } from '@/services/whatsapp-settings/types';

/** Agrupa canais do CRM para compartilhar configurações. Não cria grupos de conversa do WhatsApp. */
export function ChannelGroupsSection({ channels }: { channels: WaChannel[] }) {
  const [groups, setGroups] = useState<WaChannelGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setGroups(await attendanceApi.groups.list());
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os grupos de canais.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await attendanceApi.groups.create({ name: name.trim(), description: description.trim() || null });
      setName('');
      setDescription('');
      toast.success('Grupo de canais criado.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível criar o grupo.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <SectionCard
      title="Grupos de canais"
      description="Agrupe canais do CRM para compartilhar filas, regras, horários e mensagens. Os grupos de conversa do WhatsApp são administrados no chat, não aqui."
    >
      <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="wa-group-name" className="text-xs font-semibold text-muted-foreground">
            Nome do grupo
          </Label>
          <Input
            id="wa-group-name"
            value={name}
            maxLength={100}
            placeholder="Ex.: Comercial"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wa-group-description" className="text-xs font-semibold text-muted-foreground">
            Descrição (opcional)
          </Label>
          <Input
            id="wa-group-description"
            value={description}
            maxLength={255}
            placeholder="Para que serve este grupo"
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <Button onClick={create} disabled={!name.trim() || creating} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar grupo
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !groups ? (
        <LoadingBlock rows={2} />
      ) : groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhum grupo criado. Crie um grupo para aplicar configurações a mais de um canal.
        </p>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <GroupCard
              key={`${group.id}:${group.name}:${group.active}:${group.members.map((m) => m.channelId).join(',')}`}
              group={group}
              channels={channels}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function GroupCard({
  group,
  channels,
  onChanged,
}: {
  group: WaChannelGroup;
  channels: WaChannel[];
  onChanged: () => Promise<void>;
}) {
  const savedIds = group.members.map((member) => member.channelId);
  const [selected, setSelected] = useState<number[]>(savedIds);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const [draftDescription, setDraftDescription] = useState(group.description ?? '');
  const [busy, setBusy] = useState(false);

  const membersDirty =
    selected.length !== savedIds.length || selected.some((id) => !savedIds.includes(id));

  const run = async (action: () => Promise<unknown>, success: string, fallback: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      await onChanged();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const toggleChannel = (channelId: number, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current.filter((id) => id !== channelId), channelId] : current.filter((id) => id !== channelId),
    );
  };

  const saveMembers = () =>
    run(() => attendanceApi.groups.setMembers(group.id, selected), 'Canais do grupo atualizados.', 'Não foi possível salvar os canais.');

  const saveDetails = async () => {
    if (!draftName.trim()) return;
    const ok = await run(
      () =>
        attendanceApi.groups.update(group.id, {
          name: draftName.trim(),
          description: draftDescription.trim() || null,
        }),
      'Grupo atualizado.',
      'Não foi possível atualizar o grupo.',
    );
    if (ok) setEditing(false);
  };

  const toggleActive = () =>
    run(
      () => attendanceApi.groups.update(group.id, { active: !group.active }),
      group.active ? 'Grupo desativado.' : 'Grupo ativado.',
      'Não foi possível alterar o grupo.',
    );

  const remove = () => {
    if (!window.confirm(`Remover o grupo "${group.name}"? As filas e regras vinculadas a ele deixam de valer.`)) return;
    void run(() => attendanceApi.groups.remove(group.id), 'Grupo removido.', 'Não foi possível remover o grupo.');
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {editing ? (
          <div className="grid w-full gap-2 sm:grid-cols-2">
            <Input
              aria-label={`Nome do grupo ${group.name}`}
              value={draftName}
              maxLength={100}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <Input
              aria-label={`Descrição do grupo ${group.name}`}
              value={draftDescription}
              maxLength={255}
              placeholder="Descrição (opcional)"
              onChange={(event) => setDraftDescription(event.target.value)}
            />
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" onClick={saveDetails} disabled={busy || !draftName.trim()} className="gap-1.5">
                <Check className="h-4 w-4" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  setDraftName(group.name);
                  setDraftDescription(group.description ?? '');
                }}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold text-foreground">{group.name}</p>
              <Pill tone={group.active ? 'green' : 'slate'}>{group.active ? 'Ativo' : 'Inativo'}</Pill>
            </div>
            {group.description && <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>}
          </div>
        )}

        {!editing && (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Renomear grupo ${group.name}`}
              disabled={busy}
              onClick={() => setEditing(true)}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <div className="flex items-center gap-2 pl-1">
              <Switch
                aria-label={`${group.active ? 'Desativar' : 'Ativar'} grupo ${group.name}`}
                checked={group.active}
                disabled={busy}
                onCheckedChange={toggleActive}
              />
              <span className="text-xs text-muted-foreground">{group.active ? 'Ativo' : 'Inativo'}</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remover grupo ${group.name}`}
              disabled={busy}
              onClick={remove}
              className="text-danger-foreground hover:text-danger-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Canais deste grupo</p>
        {channels.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum canal cadastrado.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {channels.map((channel) => {
              const checked = selected.includes(channel.id);
              return (
                <label
                  key={channel.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    aria-label={`Incluir ${channel.name} no grupo ${group.name}`}
                    checked={checked}
                    disabled={busy}
                    onCheckedChange={(value) => toggleChannel(channel.id, value === true)}
                  />
                  <span className="min-w-0 break-words">
                    <span className="font-medium text-foreground">{channel.name}</span>
                    {channel.phoneNumber && <span className="block text-xs text-muted-foreground">{channel.phoneNumber}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {membersDirty && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={saveMembers} disabled={busy}>
              Salvar canais do grupo
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setSelected(savedIds)}>
              Desfazer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
