'use client';

import { useMemo } from 'react';
import { useReducedMotion, type Transition, type Variants } from 'framer-motion';

/** Mola do drawer (stiffness 380, damping 34). */
export const drawerSpring: Transition = { type: 'spring', stiffness: 380, damping: 34 };

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Variants animados. Com reduced motion, viram so opacidade sem duracao. */
export function buildMotionVariants(reduced: boolean) {
  const instant: Transition = { duration: 0 };

  const listStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.03, delayChildren: 0.02 } },
  };

  const cardEnter: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant } }
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
      };

  const drawer: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant }, exit: { opacity: 0, transition: instant } }
    : {
        hidden: { x: '100%' },
        show: { x: 0, transition: drawerSpring },
        exit: { x: '100%', transition: { duration: 0.2, ease: EASE_OUT } },
      };

  const bulkBar: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant }, exit: { opacity: 0, transition: instant } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: drawerSpring },
        exit: { opacity: 0, y: 24, transition: { duration: 0.18, ease: EASE_OUT } },
      };

  const fadeScaleOut: Variants = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 }, exit: { opacity: 0, transition: instant } }
    : {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE_OUT } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: EASE_OUT } },
      };

  const tabSlide: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant }, exit: { opacity: 0, transition: instant } }
    : {
        hidden: { opacity: 0, x: 12 },
        show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE_OUT } },
        exit: { opacity: 0, x: -12, transition: { duration: 0.15, ease: EASE_OUT } },
      };

  return { listStagger, cardEnter, drawer, bulkBar, fadeScaleOut, tabSlide, transition: reduced ? instant : drawerSpring };
}

/** Variants do pipeline respeitando prefers-reduced-motion. */
export function useMotionSafe() {
  const reduced = useReducedMotion() ?? false;
  return useMemo(() => ({ reduced, ...buildMotionVariants(reduced) }), [reduced]);
}
