import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ScrollReveal.module.css';

export default function ScrollReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* threshold 0 — NOT 0.1: a reveal wrapper around a long list (e.g. the
       products grid) is far taller than a phone viewport, so its visible
       ratio can never reach 10% and the callback would never fire, leaving
       the content stuck at opacity: 0 ("the page looks empty"). Any pixel
       entering the viewport starts the reveal. */
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${styles.scrollReveal} ${visible ? styles.scrollRevealVisible : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
