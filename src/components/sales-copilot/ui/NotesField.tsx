'use client';

import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCommitDraft } from '@/components/sales-copilot/hooks/useCommitDraft';

/** Notas rapidas da ligacao (salvas ao sair do campo). */
export function NotesField({ notes, onCommit }: { notes: string; onCommit: (value: string) => void }) {
  const id = useId();
  const { draft, setDraft, onBlur } = useCommitDraft(notes, onCommit);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-900">
        Notas rápidas
      </Label>
      <Textarea
        id={id}
        value={draft}
        rows={3}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={onBlur}
        placeholder="Anote o que o prospect informou."
        className="bg-white"
      />
    </div>
  );
}
