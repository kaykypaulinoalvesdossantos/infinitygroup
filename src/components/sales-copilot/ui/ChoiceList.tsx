'use client';

import { useId } from 'react';
import { Button } from '@/components/ui/button';

/** Respostas do cliente. Teclas 1 a 7 disparam as opcoes (tratado no painel). */
export function ChoiceList({ choices, onChoose }: { choices: string[]; onChoose: (index: number) => void }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <h2 id={headingId} className="text-sm font-semibold text-slate-900">
        Como o cliente respondeu?
      </h2>
      {choices.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma opção para esta etapa.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {choices.map((label, index) => (
            <li key={`${index}-${label}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onChoose(index)}
                className="h-auto w-full justify-start gap-3 whitespace-normal py-2.5 text-left font-normal"
              >
                <kbd
                  aria-hidden
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-slate-50 font-sans text-[11px] font-semibold text-slate-600"
                >
                  {index + 1}
                </kbd>
                <span className="min-w-0 flex-1">{label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
