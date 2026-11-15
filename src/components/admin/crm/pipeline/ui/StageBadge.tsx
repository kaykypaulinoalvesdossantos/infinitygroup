import { cn } from '@/lib/utils';
import { stageTint } from '../tokens';

interface StageBadgeProps {
  name: string;
  /** Cor hex da etapa (vem do banco). */
  color: string;
  className?: string;
}

/** Badge de etapa: fundo com 12% da cor e texto na cor cheia. */
export function StageBadge({ name, color, className }: StageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        className,
      )}
      style={{ backgroundColor: stageTint(color, 0.12), color }}
    >
      {name}
    </span>
  );
}
