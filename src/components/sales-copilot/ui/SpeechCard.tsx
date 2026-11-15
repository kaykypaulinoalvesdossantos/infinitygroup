'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/** Fala recomendada para a etapa atual, com objetivo e a ultima resposta registrada. */
export function SpeechCard({
  step,
  speech,
  goal,
  lastAnswer,
  onCopy,
}: {
  step: string;
  speech: string;
  goal: string;
  lastAnswer: string;
  onCopy: () => void;
}) {
  return (
    <Card className="gap-0 rounded-2xl border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500">FALA RECOMENDADA — {step}</h2>
          <Button type="button" variant="outline" size="sm" onClick={onCopy}>
            <Copy aria-hidden className="h-3.5 w-3.5" />
            Copiar
          </Button>
        </div>
        <p className="text-lg leading-relaxed text-slate-900">{speech}</p>
        <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-700">Objetivo:</span> {goal || '—'}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Última resposta:</span> {lastAnswer || '—'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
