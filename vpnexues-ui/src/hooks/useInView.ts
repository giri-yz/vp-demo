import { useRef, useState, useCallback } from 'react';

export function useInView(threshold = 0.1) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!node || inView) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    observerRef.current = obs;
    obs.observe(node);
  }, [inView, threshold]);

  return { ref, inView };
}
