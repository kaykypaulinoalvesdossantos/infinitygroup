'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Resposta livre do cliente: o motor extrai numeros e roteia a conversa. */
export function FreeReplyForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const inputId = useId();
  const hintId = useId();
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" aria-describedby={hintId}>
      <Label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
        Outra resposta do cliente
      </Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={value}
          autoComplete="off"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ex.: temos 15 vendedores e 2.000 leads por mês"
          className="bg-white"
        />
        <Button type="submit" disabled={!value.trim()}>
          Registrar
        </Button>
      </div>
      <p id={hintId} className="text-xs text-slate-500">
        Digite apenas informações que o prospect realmente informou.
      </p>
    </form>
  );
}
