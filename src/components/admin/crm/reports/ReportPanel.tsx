import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ReportPanelProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

/** Painel de um relatorio: titulo, descricao opcional e conteudo. */
export function ReportPanel({ title, description, className, children }: ReportPanelProps) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] p-4 shadow-sm md:p-5',
        className,
      )}
    >
      <header className="mb-4 space-y-0.5">
        <h2 className="text-base font-semibold text-foreground ">{title}</h2>
        {description && <p className="text-xs text-muted-foreground ">{description}</p>}
      </header>
      {children}
    </section>
  );
}
