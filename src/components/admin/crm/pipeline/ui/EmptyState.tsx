import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Acao opcional (ex.: botao "Limpar filtros"). */
  action?: ReactNode;
  className?: string;
}

/** Estado vazio com icone, titulo, descricao e acao opcional. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-4 py-8 text-center', className)}>
      {Icon && <Icon className="h-8 w-8 text-slate-500 stroke-[1.5]" aria-hidden="true" />}
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
