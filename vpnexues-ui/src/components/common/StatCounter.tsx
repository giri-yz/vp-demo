import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places for the animated value (e.g. prices need 2). Defaults to 0,
      which keeps the original integer + locale-grouping output byte-identical. */
  decimals?: number;
}

/** Scroll-triggered number counter, the static site's Odometer replacement. Counts up via
    rAF once the element enters the viewport — react-countup's scroll-spy option turned out
    unreliable through Vite's CJS interop, so this rolls the same IntersectionObserver + rAF
    approach by hand. */
export default function StatCounter({ end, duration = 2, prefix = '', suffix = '', decimals = 0 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        let raf: number;
        const tick = (now: number) => {
          const t = Math.min((now - start) / (duration * 1000), 1);
          setCount(t * end);
          if (t < 1) raf = requestAnimationFrame(tick);
          else setCount(end);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}
