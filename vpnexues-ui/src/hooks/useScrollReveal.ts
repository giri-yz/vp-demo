import { useEffect, useRef } from 'react';

/**
 * Adds scroll-reveal (slide-up) animation to all descendants with
 * the CSS class `sr-hidden`.  When an element enters the viewport
 * (12 % threshold), `sr-hidden` is swapped for `sr-visible` which
 * triggers the `slideUpReveal` keyframe defined in
 * SuperAdminDashboard.module.css.
 *
 * Children can carry `data-sr-delay="1|2|3…"` to receive staggered
 * animation delays via the `sr-delay-*` utility classes.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>('.sr-hidden');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.getAttribute('data-sr-delay');
            if (delay) el.classList.add(`sr-delay-${delay}`);
            el.classList.remove('sr-hidden');
            el.classList.add('sr-visible');
            observer.unobserve(el);
          }
        });
      },
      { root: null, threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}
