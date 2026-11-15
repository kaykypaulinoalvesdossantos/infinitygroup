'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: Array<{ keys: string[]; action: string }> = [
  { keys: ['N'], action: 'Novo lead' },
  { keys: ['/'], action: 'Focar a busca' },
  { keys: ['F'], action: 'Abrir filtros avançados' },
  { keys: ['?'], action: 'Mostrar esta lista de atalhos' },
  { keys: ['Esc'], action: 'Fechar a gaveta ou limpar a seleção' },
  { keys: ['↑', '↓'], action: 'Ir para o lead anterior ou seguinte (gaveta aberta)' },
  { keys: ['Shift', 'Clique'], action: 'Selecionar um intervalo de cartões ou linhas' },
  { keys: ['Espaço', '↑↓', 'Espaço'], action: 'Mover um cartão pelo teclado (arrastar com setas)' },
  { keys: ['Ctrl', 'Enter'], action: 'Enviar a nota na gaveta' },
];

/** Dialogo com todos os atalhos do funil (tecla "?"). */
export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atalhos do teclado</DialogTitle>
          <DialogDescription>Os atalhos não funcionam enquanto você digita em um campo.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-[hsl(var(--card-border))]">
          {SHORTCUTS.map((item) => (
            <li key={item.action} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span className="text-slate-700 dark:text-slate-200">{item.action}</span>
              <span className="flex shrink-0 items-center gap-1">
                {item.keys.map((key, i) => (
                  <kbd
                    key={`${key}-${i}`}
                    className="inline-flex min-w-6 items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
