/* Heavy add-to-cart flight effect (mobile + desktop).
 *
 * Default flow (ProductCard Add / stepper +): the product image clones itself
 * and flies in a carousel-style spinning arc into the cart target, with
 * ripple rings + spark bursts at the origin, a comet trail behind it, and a
 * bounce/badge pop + burst on arrival.
 *
 * Target resolution — first element with a non-zero on-screen box wins:
 *   1. explicit `targetEl` (cart-page suggestion → lands in the product list,
 *      caller gets `onArrive` for row-level highlight)
 *   2. `[data-fly-target]` — mobile order-summary bars (Shop bottom cartJump,
 *      SmallBox/BigBox selectionBar); these hop gently on arrival
 *   3. header cart icon (desktop)
 *   4. bottom-nav cart link (mobile pages that render it)
 *   5. none → virtual landing at the bottom center of the viewport, where the
 *      mobile summary bar slides in, so the very first add (bar not rendered
 *      yet) still gets the effect
 *
 * Gated to prefers-reduced-motion: no-preference with a 700 ms throttle so
 * rapid stepper clicks stay snappy — reduced-motion users keep the plain add.
 * Flight duration scales with the distance travelled (short hops land faster
 * than cross-page flights).
 */
import styles from './css/FlyToCart.module.css';

const FLIGHT_MS = 950;
const MIN_FLIGHT_MS = 560;
const THROTTLE_MS = 700;
const SPARK_ANGLES = [-90, -45, 0, 45, 90, 135, 180, -135];

let lastFxAt = 0;

interface FxOptions {
  /** Element to pop as local feedback (e.g. the stepper qty output / the + btn). */
  feedbackEl?: HTMLElement | null;
  /** Source image override (default: image inside the closest [data-category] card). */
  imgEl?: Element | null;
  /** Destination override (default: first visible summary bar / cart link). Lands near the product column. */
  targetEl?: HTMLElement | null;
  /** Fired at landing time (after travel, before the burst) — e.g. row highlight. */
  onArrive?: () => void;
}

/** First element matching any selector with a non-zero box (display:none reports 0×0 and is skipped). */
function firstShown(selectors: string[]): HTMLElement | null {
  for (const sel of selectors) {
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
  }
  return null;
}

/* Arc path: launch up + spin, mid glide, then dive into the target while the
   scale shrinks. startOp lets delayed copies (trails) begin invisible. */
function flightKeyframes(
  dx: number,
  dy: number,
  scaleMul: number,
  rotMul: number,
  opacity: number,
  startOpacity: number
): Keyframe[] {
  return [
    { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: startOpacity, offset: 0 },
    {
      transform: `translate(${(dx * 0.25).toFixed(1)}px, ${(dy * 0.05 - 72).toFixed(1)}px) scale(${(1.16 * scaleMul).toFixed(3)}) rotate(${Math.round(150 * rotMul)}deg)`,
      opacity,
      offset: 0.32,
    },
    {
      transform: `translate(${(dx * 0.62).toFixed(1)}px, ${(dy * 0.38 - 26).toFixed(1)}px) scale(${(0.72 * scaleMul).toFixed(3)}) rotate(${Math.round(420 * rotMul)}deg)`,
      opacity,
      offset: 0.66,
    },
    {
      transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(0.14 * scaleMul).toFixed(3)}) rotate(${Math.round(740 * rotMul)}deg)`,
      opacity: opacity * 0.3,
      offset: 1,
    },
  ];
}

function spawnRing(cx: number, cy: number, size: number, delay: number, glow: boolean) {
  const el = document.createElement('span');
  el.className = glow ? `${styles.ring} ${styles.ringGlow}` : styles.ring;
  el.style.left = `${cx - size / 2}px`;
  el.style.top = `${cy - size / 2}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  document.body.appendChild(el);
  el.animate(
    [
      { transform: 'scale(0.35)', opacity: 0, offset: 0 },
      { transform: 'scale(0.6)', opacity: 0.85, offset: 0.18 },
      { transform: 'scale(1.9)', opacity: 0, offset: 1 },
    ],
    { duration: 640, delay, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'both' }
  ).onfinish = () => el.remove();
}

function spawnSpark(cx: number, cy: number, angleDeg: number, glow: boolean, delay: number) {
  const el = document.createElement('span');
  el.className = glow ? `${styles.spark} ${styles.sparkGlow}` : styles.spark;
  el.style.left = `${cx - 4.5}px`;
  el.style.top = `${cy - 4.5}px`;
  const rad = (angleDeg * Math.PI) / 180;
  const dist = 34 + Math.random() * 28;
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;
  document.body.appendChild(el);
  el.animate(
    [
      { transform: 'translate(0px, 0px) scale(0.6)', opacity: 0, offset: 0 },
      { transform: `translate(${(x * 0.55).toFixed(1)}px, ${(y * 0.55).toFixed(1)}px) scale(1)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(0.2)`, opacity: 0, offset: 1 },
    ],
    { duration: 560 + Math.random() * 180, delay, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'both' }
  ).onfinish = () => el.remove();
}

function burst(cx: number, cy: number, size: number) {
  spawnRing(cx, cy, size, 0, false);
  spawnRing(cx, cy, size, 130, true);
  SPARK_ANGLES.forEach((a, i) => spawnSpark(cx, cy, a, i % 2 === 1, (i % 3) * 45));
}

/** Runs the effect. Returns false when skipped (reduced motion / throttled)
 *  so callers can fall back to plain behavior. */
export function flyToCartFx(sourceBtn: HTMLElement, opts: FxOptions = {}): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const now = Date.now();
  if (now - lastFxAt < THROTTLE_MS) return false;
  lastFxAt = now;

  const customTarget = opts.targetEl ?? null;
  const target =
    customTarget ??
    firstShown([
      '[data-fly-target]',
      'a[aria-label="View cart"]',
      'a[href="/cart"]',
    ]);

  const bRect = sourceBtn.getBoundingClientRect();
  const bCx = bRect.left + bRect.width / 2;
  const bCy = bRect.top + bRect.height / 2;

  const card = sourceBtn.closest('[data-category]');
  const imgEl: Element | null = opts.imgEl ?? card?.querySelector('img') ?? null;

  /* Landing point: explicit targets land near the product column; visible
     targets land at their center; with no cart UI on screen (mobile first
     add — the summary bar renders only after the first item) aim where the
     bar will slide in: bottom center of the viewport. Clamp all in view. */
  const tRect = target ? target.getBoundingClientRect() : null;
  let tCx: number;
  let tCy: number;
  if (customTarget && tRect) {
    tCx = tRect.left + tRect.width * 0.3;
    tCy = tRect.top + Math.min(90, tRect.height * 0.4);
  } else if (tRect) {
    tCx = tRect.left + tRect.width / 2;
    tCy = tRect.top + tRect.height / 2;
  } else {
    tCx = window.innerWidth / 2;
    tCy = window.innerHeight - 44;
  }
  tCx = Math.min(Math.max(tCx, 36), window.innerWidth - 36);
  tCy = Math.min(Math.max(tCy, 36), window.innerHeight - 40);

  /* Short hops (suggestion card -> list above) land faster than cross-page flights. */
  const dist = Math.hypot(tCx - bCx, tCy - bCy);
  const dur = Math.round(Math.min(FLIGHT_MS, Math.max(MIN_FLIGHT_MS, dist * 2.1)));

  /* 1. Launch burst + local feedback from the button. */
  burst(bCx, bCy, Math.max(bRect.width, 44));
  opts.feedbackEl?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }],
    { duration: 360, easing: 'ease-out' }
  );

  /* 2. Fly the product image along a spinning arc into the target. */
  if (imgEl) {
    const img = imgEl as HTMLImageElement;
    const sRect = img.getBoundingClientRect();
    const fly = document.createElement('img');
    fly.className = styles.fly;
    fly.src = img.currentSrc || img.src;
    fly.alt = '';
    fly.style.left = `${sRect.left}px`;
    fly.style.top = `${sRect.top}px`;
    fly.style.width = `${sRect.width}px`;
    fly.style.height = `${sRect.height}px`;
    document.body.appendChild(fly);

    const dx = tCx - (sRect.left + sRect.width / 2);
    const dy = tCy - (sRect.top + sRect.height / 2);

    fly.animate(flightKeyframes(dx, dy, 1, 1, 1, 1), {
      duration: dur,
      easing: 'ease-in-out',
      fill: 'forwards',
    }).onfinish = () => fly.remove();

    /* Comet trail: same arc, slightly behind the clone. */
    [70, 150, 230].forEach((delay) => {
      const dot = document.createElement('span');
      dot.className = styles.trail;
      dot.style.width = '16px';
      dot.style.height = '16px';
      dot.style.left = `${sRect.left + sRect.width / 2 - 8}px`;
      dot.style.top = `${sRect.top + sRect.height / 2 - 8}px`;
      document.body.appendChild(dot);
      dot.animate(flightKeyframes(dx, dy, 0.5, 0.8, 0.55, 0), {
        duration: dur,
        delay,
        easing: 'ease-in-out',
        fill: 'both',
      }).onfinish = () => dot.remove();
    });
  }

  /* 3. Arrival: burst at the landing point, then react to the target —
     summary bars hop, cart icons bounce, explicit/virtual targets burst
     only — and hand back to the caller for row-level feedback. */
  window.setTimeout(() => {
    if (target && !customTarget && target.hasAttribute('data-fly-target')) {
      target.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-7px)' }, { transform: 'translateY(0)' }],
        { duration: 420, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' }
      );
      target.querySelector('span')?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' }
      );
      burst(tCx, tCy, 56);
    } else if (target && !customTarget) {
      target.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.4) rotate(-9deg)' }, { transform: 'scale(0.9)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
        { duration: 520, easing: 'ease-out' }
      );
      target.querySelector('span')?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.7)' }, { transform: 'scale(1)' }],
        { duration: 460, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' }
      );
      burst(tCx, tCy, 46);
    } else {
      burst(tCx, tCy, 56);
    }
    opts.onArrive?.();
  }, dur);

  return true;
}
