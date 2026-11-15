'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WaChannel, WaChannelGroup, WaScope, WaScopeRef } from '@/services/whatsapp-settings/types';

type ScopeOption = WaScope;

/** Rotulo curto de um escopo, usado em listas (ex.: "Canal · Vendas", "Grupo · Sul", "Empresa"). */
export function scopeLabel(ref: WaScopeRef, groups: WaChannelGroup[] = [], channels: WaChannel[] = []): string {
  if (ref.scope === 'CHANNEL') {
    const name = channels.find((channel) => channel.id === ref.channelId)?.name;
    return name ? `Canal · ${name}` : 'Canal';
  }
  if (ref.scope === 'GROUP') {
    const name = groups.find((group) => group.id === ref.channelGroupId)?.name;
    return name ? `Grupo · ${name}` : 'Grupo de canais';
  }
  return 'Empresa';
}

/** Grupos que contem o canal informado. */
export function groupsContaining(groups: WaChannelGroup[], channelId: number | undefined): WaChannelGroup[] {
  if (channelId == null) return [];
  return groups.filter((group) => group.members.some((member) => member.channelId === channelId));
}

const SCOPE_TITLE: Record<ScopeOption, string> = {
  CHANNEL: 'Somente este canal',
  GROUP: 'Grupo de canais',
  TENANT: 'Toda a empresa',
};

export function ScopeSelect({
  value,
  onChange,
  channel,
  groups,
}: {
  value: WaScopeRef;
  onChange: (value: WaScopeRef) => void;
  channel?: WaChannel;
  groups: WaChannelGroup[];
}) {
  const channelGroups = groupsContaining(groups, channel?.id).filter((group) => group.active);

  const changeScope = (scope: ScopeOption) => {
    if (scope === 'CHANNEL') {
      onChange({ scope, channelId: channel?.id ?? null, channelGroupId: null });
      return;
    }
    if (scope === 'GROUP') {
      const current = channelGroups.find((group) => group.id === value.channelGroupId) ?? channelGroups[0];
      onChange({ scope, channelId: null, channelGroupId: current?.id ?? null });
      return;
    }
    onChange({ scope, channelId: null, channelGroupId: null });
  };

  return (
    <div className="space-y-2">
      <Label className="block text-xs font-semibold text-slate-500">Alcance</Label>
      <Select value={value.scope} onValueChange={(next) => changeScope(next as ScopeOption)}>
        <SelectTrigger className="w-full" aria-label="Alcance da configuração">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CHANNEL" disabled={!channel}>
            {SCOPE_TITLE.CHANNEL}
          </SelectItem>
          <SelectItem value="GROUP">{SCOPE_TITLE.GROUP}</SelectItem>
          <SelectItem value="TENANT">{SCOPE_TITLE.TENANT}</SelectItem>
        </SelectContent>
      </Select>

      {value.scope === 'GROUP' && (
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-slate-500">Grupo de canais</Label>
          {channelGroups.length ? (
            <Select
              value={value.channelGroupId ? String(value.channelGroupId) : ''}
              onValueChange={(next) =>
                onChange({ scope: 'GROUP', channelId: null, channelGroupId: Number(next) })
              }
            >
              <SelectTrigger className="w-full" aria-label="Grupo de canais">
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                {channelGroups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-slate-500">
              Nenhum grupo ativo contém este canal. Crie ou inclua o canal em um grupo na seção Grupos de canais.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
