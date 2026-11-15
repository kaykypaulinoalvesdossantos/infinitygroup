'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/** Lista de objecoes do roteiro. Escolher uma registra a objecao e muda a fala para ela. */
export function ObjectionPicker({
  names,
  onSelect,
}: {
  names: string[];
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Objeções
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar objeção</DialogTitle>
            <DialogDescription>Escolha a objeção que o prospect apresentou.</DialogDescription>
          </DialogHeader>
          <ul className="grid max-h-[60vh] gap-2 overflow-y-auto">
            {names.map((name) => (
              <li key={name}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal py-2 text-left font-normal"
                  onClick={() => {
                    onSelect(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
