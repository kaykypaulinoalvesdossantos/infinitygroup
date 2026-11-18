'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorState, LoadingBlock, Pill, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { attendanceApi, type WaStageInput } from '@/services/whatsapp-settings/attendance';
import type { WaStage } from '@/services/whatsapp-settings/types';

const DEFAULT_COLOR = '#3B82F6';
const FINAL_OPTIONS = [
  { value: 'NONE', label: 'Etapa comum' },
  { value: 'WON', label: 'Final: Ganho' },
  { value: 'LOST', label: 'Final: Perdido' },
] as const;

export function StagesSection() {
  const [stages, setStages] = useState<WaStage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await attendanceApi.stages.list();
      setStages([...list].sort((first, second) => first.position - second.position));
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as etapas.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Executa uma operacao, mostra o retorno e recarrega. Retorna true em sucesso. */
  const run = async (action: () => Promise<unknown>, success: string | null, fallback: string) => {
    setBusy(true);
    try {
      await action();
      if (success) toast.success(success);
      await load();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const ok = await run(
      () => attendanceApi.stages.create({ name: name.trim(), color }),
      'Etapa criada.',
      'Não foi possível criar a etapa.',
    );
    setCreating(false);
    if (ok) {
      setName('');
      setColor(DEFAULT_COLOR);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!stages) return;
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const ids = stages.map((stage) => stage.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void run(() => attendanceApi.stages.reorder(ids), null, 'Não foi possível reordenar as etapas.');
  };

  return (
    <SectionCard
      title="Etapas do atendimento"
      description="Etapas organizam as conversas e classificam o resultado. A etapa padrão recebe as novas conversas."
    >
      <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="stage-name" className="text-xs font-semibold text-slate-500">
            Nome da etapa
          </Label>
          <Input
            id="stage-name"
            value={name}
            maxLength={100}
            placeholder="Ex.: Qualificação"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stage-color" className="text-xs font-semibold text-slate-500">
            Cor
          </Label>
          <Input
            id="stage-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-16 cursor-pointer p-1"
          />
        </div>
        <Button onClick={create} disabled={!name.trim() || creating || busy} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar etapa
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !stages ? (
        <LoadingBlock rows={3} />
      ) : stages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          Nenhuma etapa criada.
        </p>
      ) : (
        <ol className="space-y-2">
          {stages.map((stage, index) => (
            <StageRow
              key={`${stage.id}:${JSON.stringify(stage)}`}
              stage={stage}
              isFirst={index === 0}
              isLast={index === stages.length - 1}
              busy={busy}
              onMove={(direction) => move(index, direction)}
              onUpdate={(body, success, fallback) =>
                run(() => attendanceApi.stages.update(stage.id, body), success, fallback)
              }
              onRemove={() => {
                if (!window.confirm(`Remover a etapa "${stage.name}"?`)) return;
                void run(() => attendanceApi.stages.remove(stage.id), 'Etapa removida.', 'Não foi possível remover a etapa.');
              }}
            />
          ))}
        </ol>
      )}
      <p className="text-xs text-slate-500">
        Para liberar capacidade, encerre o atendimento no chat. Uma etapa marcada como final precisa de um resultado
        (ganho ou perdido).
      </p>
    </SectionCard>
  );
}

function StageRow({
  stage,
  isFirst,
  isLast,
  busy,
  onMove,
  onUpdate,
  onRemove,
}: {
  stage: WaStage;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onUpdate: (body: WaStageInput, success: string, fallback: string) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [name, setName] = useState(stage.name);
  const [color, setColor] = useState(stage.color);
  const dirty = name.trim() !== stage.name || color !== stage.color;
  const finalValue = stage.isFinal ? (stage.finalType ?? 'NONE') : 'NONE';

  return (
    <li className="space-y-3 rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
        <div className="flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-2">
          <Input
            aria-label={`Nome da etapa ${stage.name}`}
            value={name}
            maxLength={100}
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
            className="min-w-0 flex-1"
          />
          <Input
            type="color"
            aria-label={`Cor da etapa ${stage.name}`}
            value={color}
            disabled={busy}
            onChange={(event) => setColor(event.target.value)}
            className="h-9 w-14 cursor-pointer p-1"
          />
          {dirty && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              disabled={busy || !name.trim()}
              onClick={() =>
                void onUpdate({ name: name.trim(), color }, 'Etapa atualizada.', 'Não foi possível salvar a etapa.')
              }
            >
              <Check className="h-4 w-4" />
              Salvar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Subir etapa ${stage.name}`}
            disabled={busy || isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Descer etapa ${stage.name}`}
            disabled={busy || isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remover etapa ${stage.name}`}
            disabled={busy}
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-6">
        {stage.isDefault ? (
          <Pill tone="blue">Etapa padrão</Pill>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => void onUpdate({ isDefault: true }, 'Etapa padrão definida.', 'Não foi possível definir a etapa padrão.')}
          >
            Definir como padrão
          </Button>
        )}
        <div className="space-y-1">
          <Label htmlFor={`final-result-${stage.id}`} className="text-xs font-semibold text-slate-500">Resultado</Label>
          <Select
            value={finalValue}
            disabled={busy}
            onValueChange={(value) => {
              const next = value as 'NONE' | 'WON' | 'LOST';
              void onUpdate(
                { isFinal: next !== 'NONE', finalType: next === 'NONE' ? null : next },
                'Resultado da etapa atualizado.',
                'Não foi possível atualizar o resultado da etapa.',
              );
            }}
          >
            <SelectTrigger id={`final-result-${stage.id}`} className="w-48" aria-label={`Resultado da etapa ${stage.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {stage.isFinal && !stage.finalType && <Pill tone="amber">Escolha o resultado</Pill>}
      </div>
    </li>
  );
}
