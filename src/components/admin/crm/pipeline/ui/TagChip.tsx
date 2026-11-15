'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stageTint } from '../tokens';

interface TagChipProps {
  name: string;
  /** Cor hex da etiqueta. */
  color: string;
  size?: 'sm' | 'md';
  /** Se informado, mostra botao para remover a etiqueta. */
  onRemove?: () => void;
  className?: string;
}

/** Chip colorido de etiqueta. */
export function TagChip({ name, color, size = 'sm', onRemove, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-md font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs',
        className,
      )}
      style={{ backgroundColor: stageTint(color, 0.14), color }}
    >
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2"
          aria-label={`Remover etiqueta ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
