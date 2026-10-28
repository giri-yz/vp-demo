import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { AppKind } from './data';
import Hero from './sections/Hero';
import Presence from './sections/Presence';
import Concepts from './sections/Concepts';
import Categories from './sections/Categories';
import Apps from './sections/Apps';
import B2B from './sections/B2B';
import Ecosystem from './sections/Ecosystem';
import Cta from './sections/Cta';
import QrModal from './sections/QrModal';
import { useConceptChrome } from './useConceptChrome';
import { useFitSections } from './useFitSections';
import s from './ConceptHome.module.css';

/** Fade-up on first view for every element marked data-reveal. */
function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!els?.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => { el.dataset.reveal = 'in'; });
      return;
    }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        (e.target as HTMLElement).dataset.reveal = 'in';
        io.unobserve(e.target);
      }
    }), { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [root]);
}

/** Concept landing page. The site header and footer come from the shared Layout. */
export default function ConceptHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [modalApp, setModalApp] = useState<AppKind | null>(null);
  const closeModal = useCallback(() => setModalApp(null), []);
  useReveal(rootRef);
  useConceptChrome(rootRef);
  useFitSections(rootRef);

  return (
    <div className={s.root} ref={rootRef}>
      <Hero />
      <Presence />
      <Concepts />
      <Categories />
      <Apps onOpen={setModalApp} />
      <B2B />
      <Ecosystem />
      <Cta onOpen={setModalApp} />
      <QrModal app={modalApp} onClose={closeModal} />
    </div>
  );
}
