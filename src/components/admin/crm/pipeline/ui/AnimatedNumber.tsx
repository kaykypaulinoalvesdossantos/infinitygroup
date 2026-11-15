'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  /** Formata o numero exibido (padrao: inteiro em pt-BR). */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString('pt-BR');

/** Numero com count-up ao mudar. Sem animacao com reduced motion. */
export function AnimatedNumber({ value, format = defaultFormat, duration = 0.6, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  // Ultimo valor exibido: a proxima animacao parte dele
  const fromRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(fromRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (current) => {
        fromRef.current = current;
        setDisplay(current);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);

  return <span className={cn('tabular-nums', className)}>{format(display)}</span>;
}
