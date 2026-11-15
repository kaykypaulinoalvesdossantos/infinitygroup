import { cn } from '@/lib/utils';
import { initials } from '../tokens';

/** Paleta fixa; a cor do avatar e escolhida pelo id do responsavel. */
const PALETTE = [
  'bg-primary',
  'bg-success',
  'bg-violet-700',
  'bg-warning-foreground',
  'bg-rose-700',
  'bg-cyan-700',
  'bg-orange-700',
  'bg-indigo-700',
];

interface OwnerAvatarProps {
  name: string | null | undefined;
  /** Id do responsavel: define a cor de forma estavel. */
  id?: number | null;
  size?: 'sm' | 'md';
  className?: string;
}

/** Avatar com iniciais do responsavel. Sem responsavel mostra traco. */
export function OwnerAvatar({ name, id, size = 'sm', className }: OwnerAvatarProps) {
  const label = name?.trim() ? name : 'Sem responsável';
  if (!name?.trim()) {
    return (
      <span
        title={label}
        aria-label={label}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-input text-[10px] text-muted-foreground',
          size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
          className,
        )}
      >
        —
      </span>
    );
  }
  const color = PALETTE[Math.abs(id ?? 0) % PALETTE.length];
  return (
    <span
      title={name}
      aria-label={`Responsável: ${name}`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs',
        color,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
