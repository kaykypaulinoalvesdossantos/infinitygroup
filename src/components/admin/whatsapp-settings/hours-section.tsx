'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ErrorState, LoadingBlock, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { attendanceApi } from '@/services/whatsapp-settings/attendance';
import type {
  WaAutoMessage,
  WaAutoMessageType,
  WaBusinessHour,
  WaChannel,
  WaChannelGroup,
  WaScopeRef,
} from '@/services/whatsapp-settings/types';
import { ScopeSelect } from './scope-select';

export const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const AUTO_MESSAGE_LABELS: Record<WaAutoMessageType, string> = {
  WELCOME: 'Boas-vindas',
  RETURNING: 'Cliente retornando',
  OUT_OF_HOURS: 'Fora do horário',
  IN_QUEUE: 'Entrada na fila',
  CLOSING: 'Encerramento',
};

const AUTO_MESSAGE_TYPES: WaAutoMessageType[] = ['WELCOME', 'RETURNING', 'OUT_OF_HOURS', 'IN_QUEUE', 'CLOSING'];

interface DayDraft {
  active: boolean;
  startTime: string;
  endTime: string;
}

/** Monta 7 dias a partir dos horarios salvos. Sem nada salvo, sugere segunda a sexta 08:00-18:00. */
function buildDays(saved: WaBusinessHour[]): DayDraft[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const hour = saved.find((item) => item.weekday === weekday);
    if (hour) return { active: hour.active, startTime: hour.startTime, endTime: hour.endTime };
    const isBusinessDay = weekday >= 1 && weekday <= 5;
    return { active: saved.length === 0 && isBusinessDay, startTime: '08:00', endTime: '18:00' };
  });
}

function buildMessages(saved: WaAutoMessage[]): Record<WaAutoMessageType, { content: string; active: boolean }> {
  return Object.fromEntries(
    AUTO_MESSAGE_TYPES.map((type) => {
      const message = saved.find((item) => item.type === type);
      return [type, { content: message?.content ?? '', active: message?.active ?? false }];
    }),
  ) as Record<WaAutoMessageType, { content: string; active: boolean }>;
}

export function HoursMessagesSection({ channel }: { channel: WaChannel | undefined }) {
  const channelId = channel?.id;
  const [scope, setScope] = useState<WaScopeRef>({
    scope: channelId != null ? 'CHANNEL' : 'TENANT',
    channelId: channelId ?? null,
  });
  const [groups, setGroups] = useState<WaChannelGroup[]>([]);

  useEffect(() => {
    setScope({ scope: channelId != null ? 'CHANNEL' : 'TENANT', channelId: channelId ?? null });
  }, [channelId]);

  useEffect(() => {
    attendanceApi.groups
      .list()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Nível de configuração"
        description="Escolha se estes horários e mensagens valem só para este canal, para um grupo ou para a empresa. Configurações do canal têm prioridade sobre as de grupo e de empresa."
      >
        <div className="max-w-md">
          <ScopeSelect value={scope} onChange={setScope} channel={channel} groups={groups} />
        </div>
      </SectionCard>

      {scope.scope !== 'GROUP' || scope.channelGroupId ? (
        <>
          <HoursCard key={`hours:${scopeKey(scope)}`} scope={scope} />
          <MessagesCard key={`messages:${scopeKey(scope)}`} scope={scope} />
        </>
      ) : null}
    </div>
  );
}

function scopeKey(ref: WaScopeRef) {
  return `${ref.scope}:${ref.channelId ?? ''}:${ref.channelGroupId ?? ''}`;
}

function HoursCard({ scope }: { scope: WaScopeRef }) {
  const [loaded, setLoaded] = useState<WaBusinessHour[] | null>(null);
  const [days, setDays] = useState<DayDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const saved = await attendanceApi.hours.get(scope);
      setLoaded(saved);
      setDays(buildDays(saved));
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os horários.'));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.scope, scope.channelId, scope.channelGroupId]);

  const update = (weekday: number, patch: Partial<DayDraft>) =>
    setDays((current) => current.map((day, index) => (index === weekday ? { ...day, ...patch } : day)));

  const copyMondayToBusinessDays = () =>
    setDays((current) =>
      current.map((day, index) => (index >= 2 && index <= 5 ? { ...current[1] } : day)),
    );

  const invalid = days.some((day) => day.active && (!day.startTime || !day.endTime || day.startTime === day.endTime));

  const save = async () => {
    if (invalid) return;
    setSaving(true);
    try {
      const saved = await attendanceApi.hours.save(
        scope,
        days.map((day, weekday) => ({
          weekday,
          startTime: day.startTime,
          endTime: day.endTime,
          active: day.active,
        })),
      );
      setLoaded(saved ?? days.map((day, weekday) => ({ weekday, ...day })));
      toast.success('Horários salvos.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar os horários.'));
    } finally {
      setSaving(false);
    }
  };

  const multiplePeriods = loaded
    ? WEEKDAY_NAMES.some((_, weekday) => loaded.filter((hour) => hour.weekday === weekday).length > 1)
    : false;

  return (
    <SectionCard
      title="Horário de atendimento"
      description="Fuso horário: America/Sao_Paulo. Sem horário configurado = atendimento 24h."
    >
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loaded ? (
        <LoadingBlock rows={4} />
      ) : (
        <div className="space-y-4">
          {loaded.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              Nenhum horário salvo para este nível: o atendimento funciona 24 horas. Ao salvar, somente os dias abertos
              abaixo serão atendidos.
            </p>
          )}
          {multiplePeriods && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Algum dia tem mais de um período salvo. Este editor mantém um período por dia: ao salvar, apenas o primeiro
              de cada dia é mantido.
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" disabled={saving} onClick={copyMondayToBusinessDays}>
              <Copy className="h-4 w-4" />
              Copiar segunda para dias úteis
            </Button>
          </div>

          <div className="space-y-2">
            {days.map((day, weekday) => {
              const name = WEEKDAY_NAMES[weekday];
              const rowInvalid = day.active && (!day.startTime || !day.endTime || day.startTime === day.endTime);
              return (
                <div
                  key={weekday}
                  className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(110px,1fr)_auto_120px_120px] sm:items-center"
                >
                  <p className="col-span-2 text-sm font-semibold text-[#1A1A1A] sm:col-span-1">{name}</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      aria-label={`Abrir atendimento ${name}`}
                      checked={day.active}
                      disabled={saving}
                      onCheckedChange={(active) => update(weekday, { active })}
                    />
                    <span className="text-xs text-slate-500">{day.active ? 'Aberto' : 'Fechado'}</span>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="time"
                      aria-label={`Início ${name}`}
                      disabled={!day.active || saving}
                      value={day.startTime}
                      onChange={(event) => update(weekday, { startTime: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="time"
                      aria-label={`Fim ${name}`}
                      disabled={!day.active || saving}
                      value={day.endTime}
                      onChange={(event) => update(weekday, { endTime: event.target.value })}
                    />
                  </div>
                  {rowInvalid && (
                    <p className="col-span-2 text-xs text-red-600">Início e fim precisam ser diferentes.</p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            Um período que termina antes de começar atravessa a meia-noite.
          </p>
          <Button onClick={save} disabled={saving || invalid} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar horários'}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}

function MessagesCard({ scope }: { scope: WaScopeRef }) {
  const [drafts, setDrafts] = useState<Record<WaAutoMessageType, { content: string; active: boolean }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<WaAutoMessageType | null>(null);

  const load = async () => {
    try {
      setError(null);
      setDrafts(buildMessages(await attendanceApi.messages.get(scope)));
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as mensagens automáticas.'));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.scope, scope.channelId, scope.channelGroupId]);

  const update = (type: WaAutoMessageType, patch: Partial<{ content: string; active: boolean }>) =>
    setDrafts((current) => (current ? { ...current, [type]: { ...current[type], ...patch } } : current));

  const save = async (type: WaAutoMessageType) => {
    if (!drafts) return;
    const draft = drafts[type];
    setSavingType(type);
    try {
      await attendanceApi.messages.save(scope, { type, content: draft.content.trim(), active: draft.active });
      toast.success(`${AUTO_MESSAGE_LABELS[type]} salva.`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a mensagem.'));
    } finally {
      setSavingType(null);
    }
  };

  return (
    <SectionCard
      title="Mensagens automáticas"
      description="Textos fixos de atendimento. Desativar um tipo impede o envio neste nível, inclusive textos herdados."
    >
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !drafts ? (
        <LoadingBlock rows={3} />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Variáveis disponíveis: {'{{nome}}'}, {'{{empresa}}'}, {'{{horario_retorno}}'}.
          </p>
          {AUTO_MESSAGE_TYPES.map((type) => {
            const draft = drafts[type];
            const busy = savingType === type;
            const blocked = draft.active && !draft.content.trim();
            return (
              <div key={type} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{AUTO_MESSAGE_LABELS[type]}</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      aria-label={`Ativar ${AUTO_MESSAGE_LABELS[type]}`}
                      checked={draft.active}
                      disabled={busy}
                      onCheckedChange={(active) => update(type, { active })}
                    />
                    <span className="text-xs text-slate-500">{draft.active ? 'Ativa' : 'Inativa'}</span>
                  </div>
                </div>
                <Textarea
                  aria-label={`Texto de ${AUTO_MESSAGE_LABELS[type]}`}
                  maxLength={10000}
                  rows={3}
                  placeholder="Digite a mensagem"
                  disabled={busy}
                  value={draft.content}
                  onChange={(event) => update(type, { content: event.target.value })}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                    disabled={busy || blocked}
                    onClick={() => void save(type)}
                  >
                    <Save className="h-4 w-4" />
                    {busy ? 'Salvando...' : `Salvar ${AUTO_MESSAGE_LABELS[type].toLowerCase()}`}
                  </Button>
                  {blocked && <span className="text-xs text-red-600">Escreva o texto ou desative a mensagem.</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
