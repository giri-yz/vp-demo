import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
  /** 'up' = slide-up fade, 'scale' = scale-in fade */
  variant?: 'up' | 'scale';
  /** Fired when the entrance animation finishes (useful for measuring final layout) */
  onAnimationComplete?: () => void;
}

/** Scroll-triggered entrance animation, the framer-motion replacement for the old static site's WOW.js `fadeInUp`.
 *  Respects `prefers-reduced-motion` — animation degrades to a plain fade. */
export default function Reveal({ children, className, delay = 0, style, variant = 'up', onAnimationComplete }: RevealProps) {
  const reduceMotion = useReducedMotion();

  const initial = reduceMotion
    ? { opacity: 0 }
    : variant === 'scale'
      ? { opacity: 0, scale: 0.92 }
      : { opacity: 0, y: 32 };
  const animate = reduceMotion
    ? { opacity: 1 }
    : variant === 'scale'
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      style={style}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.15 }}
      onAnimationComplete={onAnimationComplete}
      transition={{ type: reduceMotion ? 'tween' : 'spring', stiffness: 90, damping: 18, delay, duration: reduceMotion ? 0.001 : undefined }}
    >
      {children}
    </motion.div>
  );
}