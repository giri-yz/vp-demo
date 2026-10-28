import { useEffect, useState } from 'react';
import { COUNTRIES, MAP_NOTES, MAP_STATS, PRESENCE_ORDER, type CountryId } from '../data';
import WorldMap from './WorldMap';
import s from '../ConceptHome.module.css';

const CARD_CLASS: Record<CountryId, string> = {
  india: s.cardIndia, singapore: s.cardSingapore, srilanka: s.cardSrilanka,
  australia: s.cardAustralia, malaysia: s.cardMalaysia, uae: s.cardUae,
};
const NOTE_CLASS: Record<CountryId, string> = {
  india: s.cIndia, singapore: s.cSingapore, srilanka: s.cSrilanka,
  australia: s.cAustralia, malaysia: s.cMalaysia, uae: s.cUae,
};
const STAT_CLASS = { live: s.statLive, soon: s.statSoon, all: s.statAll } as const;

/* Counts up from 0, flipping the digit upward like a calendar page. Every number takes the same total time, so 2, 4 and 6
 * all land together. Plays once per page load. */
const COUNT_MS = 1800;
function FlipNumber({ value, className }: { value: number; className: string }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) return;
    const gap = COUNT_MS / value;
    const timers: number[] = [];
    for (let i = 1; i <= value; i++) timers.push(window.setTimeout(() => setN(i), gap * i));
    return () => timers.forEach(window.clearTimeout);
  }, [value, reduced]);
  return <b className={className}><span key={n} className={s.flipDigit}>{n}</span></b>;
}

export default function Presence() {
  return (
    <section className={`${s.section} ${s.presence} ${s.fitWide}`} id="presence" data-fit="">
      <div className={`${s.container} ${s.globalGrid}`}>
        <div>
          <div className={s.eyebrow}>01 / Global presence</div>
          <h2 className={s.title}>Every location matters.</h2>
          <p className={s.lead}>
            The website now gives equal importance to India, Singapore, Sri Lanka, Australia, Malaysia and UAE.
            India includes the three operating locations, Singapore is shown as an active office location, and
            future offices are clearly marked as coming soon.
          </p>
          <div className={s.presenceGrid}>
            {PRESENCE_ORDER.map(id => {
              const c = COUNTRIES.find(x => x.id === id)!;
              return (
                <article key={id} className={`${s.presenceCard} ${CARD_CLASS[id]}`}>
                  <span className={s.badge}>{c.presence.badge}</span>
                  <h3>{c.name}</h3>
                  <p>{c.presence.body}</p>
                  {c.presence.details && <ul>{c.presence.details.map(d => <li key={d}>{d}</li>)}</ul>}
                  {id === 'singapore' && <p><strong>Office address:</strong><br />Address to be inserted here.</p>}
                </article>
              );
            })}
          </div>
        </div>

        <div className={s.mapCard} data-reveal="">
          <div className={s.mapEyebrow}>Connected by one route</div>
          <h2 className={`${s.title} ${s.mapTitle}`}>One network.<br />Six destination stories.</h2>
          <p className={s.mapLead}>The route visual remains in the hero and is reinforced here with equal emphasis on all business regions.</p>
          <div className={s.mapBody}>
            <div className={s.mapStage}>
              <WorldMap />
            </div>
            <aside className={s.mapSide}>
              <div className={s.mapStats}>
                {MAP_STATS.map(st => (
                  <div key={st.label}><FlipNumber value={st.value} className={STAT_CLASS[st.tone]} /><span>{st.label}</span></div>
                ))}
              </div>
              <div className={s.mapNote}>
                {MAP_NOTES.map(n => (
                  <div key={n.body}>
                    <strong>
                      {n.head.map((h, i) => (
                        <span key={h.id}>{i > 0 && ' · '}<span className={NOTE_CLASS[h.id]}>{h.text}</span></span>
                      ))}
                    </strong>
                    <br />{n.body}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}