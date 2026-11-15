'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { errorMessage } from '@/components/admin/crm/format';
import { pipelineApi, type LostReason } from '@/services/crm-pipeline';
import { pipelineKeys } from '../queryKeys';

interface Draft {
  uid: number;
  id?: number;
  label: string;
  active: boolean;
}

let uidSeq = 0;
const nextUid = () => {
  uidSeq += 1;
  return uidSeq;
};

const toDrafts = (reasons: LostReason[]): Draft[] =>
  [...reasons]
    .sort((a, b) => a.position - b.position)
    .map((r) => ({ uid: nextUid(), id: r.id, label: r.label, active: r.active }));

/** Motivos de perda (supervisor): lista editavel com ativar/desativar e ordem. Salva em PUT /crm-pipelines/lost-reasons. */
export function LostReasonsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    pipelineApi
      .lostReasons(true)
      .then((reasons) => setDrafts(toDrafts(reasons)))
      .catch((err) => toast.error(errorMessage(err, 'Não foi possível carregar os motivos.')))
      .finally(() => setLoading(false));
  }, [open]);

  const update = (uid: number, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.uid === uid ? { ...d, ...patch } : d)));

  const move = (index: number, dir: -1 | 1) =>
    setDrafts((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    const labels = drafts.filter((d) => d.active).map((d) => d.label.trim());
    if (labels.some((l) => l.length === 0)) {
      toast.error('Cada motivo ativo precisa de um nome.');
      return;
    }
    setSaving(true);
    try {
      const saved = await pipelineApi.saveLostReasons(
        drafts.map((d, index) => ({ id: d.id, label: d.label.trim(), active: d.active, position: index })),
      );
      setDrafts(toDrafts(saved));
      await queryClient.invalidateQueries({ queryKey: pipelineKeys.lostReasons(false) });
      await queryClient.invalidateQueries({ queryKey: pipelineKeys.lostReasons(true) });
      toast.success('Motivos de perda salvos.');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível salvar os motivos.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Motivos de perda</DialogTitle>
          <DialogDescription>Usados ao marcar um lead como perdido. Desative um motivo para ocultá-lo sem apagar o histórico.</DialogDescription>
        </DialogHeader>

        <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
          {loading && <li className="text-sm text-muted-foreground">Carregando…</li>}
          {drafts.map((draft, index) => (
            <li key={draft.uid} className="flex items-center gap-2">
              <Input
                aria-label={`Motivo ${index + 1}`}
                value={draft.label}
                maxLength={80}
                onChange={(e) => update(draft.uid, { label: e.target.value })}
                className="flex-1"
              />
              <Switch aria-label="Ativo" checked={draft.active} onCheckedChange={(checked) => update(draft.uid, { active: checked })} />
              <Button type="button" variant="ghost" size="icon" aria-label="Subir" onClick={() => move(index, -1)} disabled={index === 0}>
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Descer" onClick={() => move(index, 1)} disabled={index === drafts.length - 1}>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover"
                onClick={() => setDrafts((prev) => prev.filter((d) => d.uid !== draft.uid))}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>

        <Button type="button" variant="outline" onClick={() => setDrafts((prev) => [...prev, { uid: nextUid(), label: '', active: true }])}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar motivo
        </Button>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={save} disabled={saving || loading}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
