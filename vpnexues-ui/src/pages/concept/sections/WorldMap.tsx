import { memo } from 'react';
import { GRATICULE, LAND, MAP_RECT, MAP_VIEWBOX } from '../worldMapData';
import { MAP_MARKERS, MAP_ROUTES, PLANE_PATH, SHIP_PATH } from '../data';
import { PLANE_PATH_D, SHIP_PATH_D } from '../icons';
import s from '../ConceptHome.module.css';

const LAND_CLASS = { live: s.landLive, soon: s.landSoon, aus: s.landAus } as const;
const TONE = { live: s.live, soon: s.soon, aus: s.aus } as const;

/* The land layer is ~220 KB of path data — memoised so unrelated re-renders never repaint it. */
const Land = memo(function Land() {
  return (
    <>
      <g className={s.graticule}>{GRATICULE.map(d => <path key={d} d={d} />)}</g>
      <g className={s.land}>
        {LAND.map((p, i) => <path key={i} d={p.d} className={p.status ? LAND_CLASS[p.status] : undefined} />)}
      </g>
    </>
  );
});

export default function WorldMap() {
  const { x, y, width, height } = MAP_RECT;
  return (
    <svg className={s.worldMap} viewBox={MAP_VIEWBOX} role="img" aria-label="Map of VP NEXUES locations: India and Singapore live, UAE, Sri Lanka, Malaysia and Australia coming soon">
      <defs>
        <linearGradient id="vpSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f7faf8" /></linearGradient>
        <clipPath id="vpSeaClip"><rect x={x} y={y} width={width} height={height} rx={22} /></clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={22} fill="url(#vpSea)" className={s.mapFrame} />
      <g clipPath="url(#vpSeaClip)"><Land /></g>
      <rect x={x} y={y} width={width} height={height} rx={22} fill="none" className={s.mapFrame} />

      {MAP_MARKERS.map(m => {
        const ex = m.anchor === 'end' ? m.lx + 8 : m.lx - 8;
        return <path key={m.id} className={`${s.leader} ${TONE[m.tone]}`} d={`M${m.x} ${m.y} L${ex} ${m.ly + 14}`} />;
      })}
      {MAP_ROUTES.map(r => <path key={r.d} className={r.blue ? s.mapRouteBlue : s.mapRoute} d={r.d} />)}

      {MAP_MARKERS.map(m => (
        <g key={m.id} className={`${s.pin} ${TONE[m.tone]}`} transform={`translate(${m.x} ${m.y})`}>
          {m.tone === 'live' && <circle className={s.pulse} r={6} />}
          <circle className={s.dot} r={m.tone === 'live' ? 5.5 : 4.5} />
        </g>
      ))}

      {MAP_MARKERS.map(m => (
        <g key={m.id} className={`${s.mapLabel} ${TONE[m.tone]}`} textAnchor={m.anchor}>
          <text className={s.labelStatus} x={m.lx} y={m.ly}>{m.status.toUpperCase()}</text>
          <text className={s.labelName} x={m.lx} y={m.ly + 20}>{m.name}</text>
          <text className={s.labelSub} x={m.lx} y={m.ly + 36}>{m.sub}</text>
        </g>
      ))}

      <g className={s.transport}>
        <circle r={16} fill="#f7fbff" stroke="#72c9e7" strokeWidth={2} />
        <path d={PLANE_PATH_D} fill="#0b6179" transform="rotate(45) translate(-10 -10) scale(.7)" />
        <animateMotion dur="9s" repeatCount="indefinite" path={PLANE_PATH} />
      </g>
      <g className={s.transport}>
        <circle r={16} fill="#fff9df" stroke="#efc943" strokeWidth={2} />
        <path d={SHIP_PATH_D} fill="#125a42" transform="translate(-8.5 -9) scale(.7)" />
        <animateMotion dur="13s" repeatCount="indefinite" path={SHIP_PATH} />
      </g>
    </svg>
  );
}
