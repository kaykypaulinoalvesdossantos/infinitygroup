'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';

export interface ConfettiBurst {
  id: number;
  x: number;
  y: number;
}

const COLORS = [
  'hsl(var(--stage-won))',
  'hsl(var(--brand))',
  'hsl(var(--stage-proposal))',
  'hsl(var(--stage-qualified))',
  'hsl(var(--stage-negotiation))',
];

const PARTICLES = 24;
const DURATION_MS = 1300;

interface ConfettiProps {
  burst: ConfettiBurst | null;
  onDone?: () => void;
}

/** Explosao leve de confete a partir de um ponto (ex.: zona Ganho). Desligada com reduced motion. */
export function Confetti({ burst, onDone }: ConfettiProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!burst || reduced) return;
    const timer = window.setTimeout(() => onDone?.(), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [burst, reduced, onDone]);

  if (!burst || reduced || typeof document === 'undefined') return null;

  // Particulas com angulo fixo espalhado; determinismo evita recalculo a cada render
  const particles = Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (i / PARTICLES) * Math.PI * 2 + (i % 3) * 0.2;
    const distance = 90 + ((i * 37) % 70);
    return {
      key: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 40,
      rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i % 5) * 40),
      color: COLORS[i % COLORS.length],
      size: 6 + (i % 4) * 2,
    };
  });

  return createPortal(
    <div key={burst.id} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.key}
          className="absolute block rounded-sm"
          style={{ left: burst.x, top: burst.y, width: p.size, height: p.size * 0.5, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.dx, y: p.dy + 60, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>,
    document.body,
  );
}
