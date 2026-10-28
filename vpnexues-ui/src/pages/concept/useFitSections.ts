import { useEffect } from 'react';
import type { RefObject } from 'react';

/* Every <section data-fit> is meant to be exactly one screen. If its content is taller than the
 * screen, the content is scaled down (CSS `zoom`, so fonts, spacing and layout shrink together)
 * until it fits. Content that is already short is left alone. Only used on desktop-sized screens —
 * phones and tablets keep their normal stacked, scrolling layout. */

const MIN_WIDTH = 1025;
const MIN_HEIGHT = 480;
const MIN_SCALE = 0.55;

export function useFitSections(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    let frame = 0;

    const fit = () => {
      frame = 0;
      const sections = host.querySelectorAll<HTMLElement>('section[data-fit]');
      const enabled = window.innerWidth >= MIN_WIDTH && window.innerHeight >= MIN_HEIGHT;
      sections.forEach(section => {
        const inner = section.firstElementChild as HTMLElement | null;
        if (!inner) return;
        inner.style.zoom = '';
        if (!enabled) return;
        const cs = getComputedStyle(section);
        const available = window.innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        /* Scaling changes how wide the content is laid out (percent widths fill the screen), which changes its
         * height again — so refine the scale a few times until it settles. */
        let scale = 1;
        for (let i = 0; i < 4; i++) {
          const visual = inner.getBoundingClientRect().height;
          if (visual <= 0) break;
          if (visual > available + 1) scale = Math.max(MIN_SCALE, scale * (available / visual));
          else if (scale < 1 && visual < available * 0.97) scale = Math.min(1, scale * (available / visual));
          else break;
          inner.style.zoom = scale < 1 ? String(scale) : '';
        }
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };

    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    document.fonts?.ready.then(schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
      host.querySelectorAll<HTMLElement>('section[data-fit]').forEach(s => {
        const inner = s.firstElementChild as HTMLElement | null;
        if (inner) inner.style.zoom = '';
      });
    };
  }, [root]);
}
