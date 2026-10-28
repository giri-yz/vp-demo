import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { B2B_CARDS, B2B_STEPS } from '../data';
import { GlobeIcon, PartnerIcon, StoreIcon } from '../icons';
import s from '../ConceptHome.module.css';

const ICON = { trade: <GlobeIcon />, retail: <StoreIcon />, collab: <PartnerIcon /> } as const;
const TINT = { trade: s.b2bGreen, retail: s.b2bBlue, collab: s.b2bYellow } as const;

/* The light border highlight follows the cursor: only two CSS variables change. */
function trackPointer(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const b = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - b.left}px`);
  el.style.setProperty('--my', `${e.clientY - b.top}px`);
}

export default function B2B() {
  return (
    <section className={`${s.section} ${s.b2b} ${s.fitWide}`} id="b2b" data-fit="">
      <div className={s.container}>
        <div className={s.b2bLayout}>
          <div className={s.b2bLeft}>
            <div className={s.eyebrow}>05 / BUSINESS SOLUTIONS</div>
            <h2 className={s.title}>Built for business.<br /><span className={s.b2bAccent}>Designed for growth.</span></h2>
            <p className={s.lead}>
              From international procurement conversations to wholesale and supermarket supply, explore how VP NEXUES
              aims to connect sourcing with business demand.
            </p>
            <div className={s.b2bBand} aria-label="Business sourcing journey">
              {B2B_STEPS.map((step, i) => (
                <span key={step} className={s.b2bStep}>
                  {i > 0 && <i aria-hidden="true">↗</i>}
                  <span><b>0{i + 1}</b> {step}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={s.b2bGrid}>
            {B2B_CARDS.map(c => (
              <article key={c.id} className={`${s.b2bCard} ${TINT[c.id]}`} data-reveal="" onPointerMove={trackPointer}>
                <div className={s.b2bIcon}>{ICON[c.id]}</div>
                <div className={s.b2bTag}>{c.tag}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <Link to="/market" className={s.b2bBottom}>{c.foot} <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </div>

        <div className={s.b2bCta} data-reveal="">
          <div>
            <small>LET’S BUILD CONNECTIONS</small>
            <strong>Your next business opportunity starts with a conversation.</strong>
            <span>For importers, distributors, supermarkets and sourcing partners.</span>
          </div>
          <a className={`${s.btn} ${s.btnPrimary}`} href="#presence">Explore our network <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
