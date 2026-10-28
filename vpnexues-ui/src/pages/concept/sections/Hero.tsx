import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import logo from '../../../assets/concept/logo.jpeg';
import { COUNTRIES, HERO_META, type Country } from '../data';
import { PLANE_PATH_D, SHIP_PATH_D } from '../icons';
import s from '../ConceptHome.module.css';

interface RouteShape {
  id: string;
  d: string;
  blue: boolean;
  mode: Country['mode'];
  dur: number;
  begin: number;
}
interface Hub { cx: number; cy: number; r: number }

const NODE_CLASS: Record<Country['id'], string> = {
  india: s.nodeIndia, singapore: s.nodeSingapore, srilanka: s.nodeSrilanka,
  australia: s.nodeAustralia, uae: s.nodeUae, malaysia: s.nodeMalaysia,
};

const f = (n: number) => n.toFixed(1);

/** Curves are computed from the real on-screen card positions, so they follow the layout at any size. */
function useHeroRoutes() {
  const stageRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [hub, setHub] = useState<Hub | null>(null);
  const [routes, setRoutes] = useState<RouteShape[]>([]);
  const uid = useId().replace(/:/g, '');

  const draw = useCallback(() => {
    const stage = stageRef.current;
    const hubEl = hubRef.current;
    if (!stage || !hubEl) return;
    const sb = stage.getBoundingClientRect();
    if (!sb.width) return;
    const hb = hubEl.getBoundingClientRect();
    const cx = hb.left - sb.left + hb.width / 2;
    const cy = hb.top - sb.top + hb.height / 2;
    setBox({ w: sb.width, h: sb.height });
    setHub({ cx, cy, r: hb.width / 2 + 30 });

    const next: RouteShape[] = [];
    stage.querySelectorAll<HTMLElement>('[data-node]').forEach((el, i) => {
      const country = COUNTRIES[i];
      const b = el.getBoundingClientRect();
      const L = b.left - sb.left, T = b.top - sb.top, W = b.width, H = b.height;
      const bx = L + W / 2, by = T + H / 2;
      /* End on the card edge that faces the hub; start on the logo rim in the card's direction, so routes fan out
       * instead of piling up behind the logo. Every curve bends the same way round the hub, so they never cross. */
      let ex: number, ey: number;
      if (Math.abs(bx - cx) < W / 2) { ex = bx; ey = by < cy ? T + H : T; }
      else { ex = bx < cx ? L + W : L; ey = by; }
      const ang = Math.atan2(ey - cy, ex - cx);
      const rim = hb.width / 2;
      const sx = cx + Math.cos(ang) * rim, sy = cy + Math.sin(ang) * rim;
      const dx = ex - sx, dy = ey - sy, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, bend = len * 0.14;
      const c1: [number, number] = [sx + dx * 0.3 + nx * bend, sy + dy * 0.3 + ny * bend];
      const c2: [number, number] = [sx + dx * 0.7 + nx * bend, sy + dy * 0.7 + ny * bend];
      next.push({
        id: `${uid}-rt${i}`,
        d: `M${f(sx)} ${f(sy)}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(ex)} ${f(ey)}`,
        blue: country.route === 'blue',
        mode: country.mode,
        dur: (country.live ? 7 : 9) + i * 0.6,
        begin: i * 0.8,
      });
    });
    setRoutes(next);
  }, [uid]);

  useLayoutEffect(() => {
    draw();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(draw));
    ro.observe(stage);
    window.addEventListener('load', draw);
    return () => { ro.disconnect(); window.removeEventListener('load', draw); };
  }, [draw]);

  return { stageRef, hubRef, box, hub, routes };
}

export default function Hero() {
  const { stageRef, hubRef, box, hub, routes } = useHeroRoutes();
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  return (
    <section className={s.hero} id="hero">
      <div className={`${s.container} ${s.heroInner}`}>
        <div className={s.heroCopy}>
          <div className={s.kicker}>Global trade · digital commerce</div>
          <h1>Connecting <span>locations</span>, exports and apps.</h1>
          <p>
            VP NEXUES presents Global Exports, Buyer App and Seller App through one premium digital experience.
            India, Singapore, Sri Lanka, Australia, Malaysia and UAE are all visible in the story, with India
            serving as the sourcing base and Bengaluru headquarters.
          </p>
          <div className={s.heroActions}>
            <a className={`${s.btn} ${s.btnPrimary}`} href="#presence">Explore our locations</a>
            <a className={`${s.btn} ${s.btnGhost}`} href="#apps">See the apps</a>
          </div>
          <div className={s.heroMeta}>
            {HERO_META.map(m => (
              <div className={s.metaCard} key={m.title}>
                <strong>{m.title}</strong>
                <span>{m.lines[0]}<br />{m.lines[1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.heroStage} ref={stageRef} aria-hidden="true">
          <svg className={s.routeSvg} viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}>
            {hub && <circle cx={f(hub.cx)} cy={f(hub.cy)} r={f(hub.r)} className={s.orbit} />}
            {routes.map(r => (
              <g key={r.id} className={r.blue ? s.rtBlue : s.rtLime}>
                <path d={r.d} className={s.rtGlow} />
                <path d={r.d} id={r.id} className={s.rtBase} />
                {(r.mode === 'air' || r.mode === 'sea') && !still && (
                  <g opacity={0}>
                    <circle r={13} className={s.rideBg} />
                    <path
                      d={r.mode === 'air' ? PLANE_PATH_D : SHIP_PATH_D}
                      className={s.rideIc}
                      transform={r.mode === 'air' ? 'rotate(90) scale(.62) translate(-12 -12)' : 'scale(.62) translate(-12 -12)'}
                    />
                    <animateMotion dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" rotate={r.mode === 'air' ? 'auto' : '0'}>
                      <mpath href={`#${r.id}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.85;1" dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" />
                  </g>
                )}
              </g>
            ))}
          </svg>

          <div className={s.nodeCenter} ref={hubRef}><img src={logo} alt="VP NEXUES logo" /></div>
          {COUNTRIES.map(c => (
            <div
              key={c.id}
              data-node={c.id}
              className={`${s.node} ${NODE_CLASS[c.id]} ${c.live ? '' : s.coming}`}
            >
              <em>{c.live ? 'Live now' : 'Coming soon'}</em>
              <strong>{c.name}</strong>
              <small>{c.heroNote.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
