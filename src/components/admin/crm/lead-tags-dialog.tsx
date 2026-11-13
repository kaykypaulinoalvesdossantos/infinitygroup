'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { crmLeadsApi, type CrmLeadTag } from '@/services/crm-leads';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void>;
}

export function LeadTagsDialog({ open, onOpenChange, onChanged }: Props) {
  const [tags, setTags] = useState<CrmLeadTag[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const [savingTagId, setSavingTagId] = useState<number | null>(null);

  const loadTags = useCallback(async () => setTags(await crmLeadsApi.listTags()), []);

  useEffect(() => {
    if (open) void loadTags().catch(() => toast.error('Não foi possível carregar as tags.'));
  }, [loadTags, open]);

  const createTag = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return;
    setLoading(true);
    try {
      await crmLeadsApi.createTag({ name: name.trim(), color, description: description.trim() || undefined });
      setName('');
      setDescription('');
      setColor('#2563EB');
      await loadTags();
      await onChanged();
      toast.success('Tag criada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar a tag.');
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (tagId: number, patch: { name?: string; color?: string; description?: string | null; isActive?: boolean }) => {
    setSavingTagId(tagId);
    try {
      await crmLeadsApi.updateTag(tagId, patch);
      await loadTags();
      await onChanged();
      toast.success(patch.isActive === undefined ? 'Tag atualizada.' : patch.isActive ? 'Tag reativada.' : 'Tag desativada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar a tag.');
    } finally {
      setSavingTagId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-blue-600" />Tags dos leads</DialogTitle>
          <DialogDescription>Organize os leads com marcadores livres. Produtos e campanhas continuam separados.</DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void createTag(event)} className="space-y-3 rounded-xl border p-4">
          <Label>Nova tag</Label>
          <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Retornar em dezembro" maxLength={80} required />
            <Input type="color" aria-label="Cor da nova tag" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-full p-1" />
          </div>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição opcional" maxLength={255} rows={2} />
          <Button type="submit" disabled={loading || name.trim().length < 2}>{loading ? 'Criando…' : 'Criar tag'}</Button>
        </form>

        <div className="space-y-2">
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} saving={savingTagId === tag.id} onSave={updateTag} />
          ))}
          {tags.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Nenhuma tag cadastrada.</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TagRow({
  tag,
  saving,
  onSave,
}: {
  tag: CrmLeadTag;
  saving: boolean;
  onSave: (id: number, patch: { name?: string; color?: string; description?: string | null; isActive?: boolean }) => Promise<void>;
}) {
  const [name, setName] = useState(tag.name);
  const [description, setDescription] = useState(tag.description ?? '');
  const [color, setColor] = useState(tag.color);

  useEffect(() => {
    setName(tag.name);
    setDescription(tag.description ?? '');
    setColor(tag.color);
  }, [tag.name, tag.description, tag.color]);

  const save = () => {
    if (name.trim().length < 2) {
      setName(tag.name);
      return;
    }
    const patch: { name?: string; description?: string | null; color?: string } = {};
    if (name.trim() !== tag.name) patch.name = name.trim();
    if (description.trim() !== (tag.description ?? '')) patch.description = description.trim() || null;
    if (color !== tag.color) patch.color = color;
    if (Object.keys(patch).length) void onSave(tag.id, patch);
  };

  return (
    <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_72px_1fr_auto] sm:items-center">
      <Input aria-label={`Nome da tag ${tag.name}`} value={name} onChange={(event) => setName(event.target.value)} onBlur={save} maxLength={80} disabled={saving} />
      <Input type="color" aria-label={`Cor da tag ${tag.name}`} value={color} onChange={(event) => setColor(event.target.value)} onBlur={save} className="h-10 w-full p-1" disabled={saving} />
      <Input aria-label={`Descrição da tag ${tag.name}`} value={description} onChange={(event) => setDescription(event.target.value)} onBlur={save} maxLength={255} disabled={saving} />
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Badge variant="outline" style={{ color: tag.color, borderColor: tag.color }}>{tag.name}</Badge>
        <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => void onSave(tag.id, { isActive: !tag.isActive })}>
          {tag.isActive ? 'Desativar' : 'Reativar'}
        </Button>
      </div>
    </div>
  );
}
