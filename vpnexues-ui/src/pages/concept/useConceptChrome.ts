import { useEffect } from 'react';
import type { RefObject } from 'react';

/* Page-level "chrome" behaviour for the concept landing page. Everything is applied through
 * classes on <html>, which the module stylesheet targets, and removed again on unmount —
 * so the shared header and footer behave normally on every other route.
 *
 *  - header: hidden once the hero has scrolled away; slides back in when you scroll up
 *  - footer: stays fixed behind the page; the last card lifts away to reveal it           */

const CLS = { page: 'vpConcept', headerHidden: 'vpHeaderHidden', footerReveal: 'vpFooterReveal' };

export function useConceptChrome(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add(CLS.page);

    /* ---- header: hide after the hero, show again on scroll up ---- */
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const hero = root.current?.querySelector<HTMLElement>('#hero');
      const y = window.scrollY;
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - 90 : 600;
      if (y < heroEnd) html.classList.remove(CLS.headerHidden);
      else if (y > lastY + 4) html.classList.add(CLS.headerHidden);
      else if (y < lastY - 4) html.classList.remove(CLS.headerHidden);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    /* ---- footer: fixed "curtain" reveal, only when it fits on screen ---- */
    const footer = document.querySelector<HTMLElement>('footer.common-footer');
    const applyReveal = () => {
      if (!footer) return;
      const h = footer.offsetHeight;
      const fits = h > 0 && h <= window.innerHeight * 0.9 && window.innerWidth >= 900;
      html.classList.toggle(CLS.footerReveal, fits);
      html.style.setProperty('--vp-footer-h', fits ? `${h}px` : '0px');
    };
    const ro = footer ? new ResizeObserver(applyReveal) : null;
    if (footer) ro?.observe(footer);
    window.addEventListener('resize', applyReveal);
    applyReveal();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', applyReveal);
      ro?.disconnect();
      html.classList.remove(CLS.page, CLS.headerHidden, CLS.footerReveal);
      html.style.removeProperty('--vp-footer-h');
    };
  }, [root]);
}
