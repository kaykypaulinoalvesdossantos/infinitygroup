'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileUp, LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PipelineView } from '../hooks/usePipelineFilters';

interface PipelineHeaderProps {
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
  onImport: () => void;
  onNewLead: () => void;
  /** Acoes do desktop (exportar, relatorios, configurar). */
  actionsSlot?: ReactNode;
  /** Menu de acoes do celular (um unico botao). */
  mobileActionsSlot?: ReactNode;
}

const VIEWS: { id: PipelineView; label: string; Icon: typeof LayoutGrid }[] = [
  { id: 'kanban', label: 'Kanban', Icon: LayoutGrid },
  { id: 'list', label: 'Lista', Icon: ListIcon },
];

/** Titulo, troca de visao (Kanban/Lista) e acoes. No celular: visao em largura total e acoes em menu. */
export function PipelineHeader({ view, onViewChange, onImport, onNewLead, actionsSlot, mobileActionsSlot }: PipelineHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 md:gap-4">
      <div className="flex w-full min-w-0 items-start justify-between gap-3 md:w-auto">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Pipeline de vendas</h1>
          <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 md:block">
            Acompanhe cada negócio do primeiro contato ao fechamento.
          </p>
        </div>
        <div className="md:hidden">{mobileActionsSlot}</div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
        <div
          role="group"
          aria-label="Modo de visualização"
          className="relative inline-flex w-full rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-1 md:w-auto"
        >
          {VIEWS.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onViewChange(id)}
                className={cn(
                  'relative inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] md:flex-none',
                  'min-h-10 md:min-h-0',
                  active ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="pipeline-view-indicator"
                    className="absolute inset-0 rounded-lg bg-[hsl(var(--brand))] shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="relative h-4 w-4" aria-hidden="true" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {actionsSlot}
          <Button type="button" variant="outline" onClick={onImport} className="bg-[hsl(var(--card-bg))]">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Importar CSV
          </Button>
          <Button
            type="button"
            onClick={onNewLead}
            className="bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo lead
          </Button>
        </div>
      </div>
    </header>
  );
}
