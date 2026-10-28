import { useId, useState } from 'react';
import { CHOICES, ECOSYSTEM, type ChoiceKey } from '../data';
import s from '../ConceptHome.module.css';

const TINT = [s.revealWhite, s.revealBlue, s.revealYellow];

/* Accordion: every choice owns its three cards, which drop down right under its own button. */
export default function Ecosystem() {
  const [open, setOpen] = useState<ChoiceKey | null>('exports');
  const uid = useId();

  return (
    <section className={`${s.section} ${s.ecosystem}`} id="ecosystem">
      <div className={`${s.container} ${s.ecosystemGrid}`}>
        <div>
          <div className={s.eyebrow}>06 / Interactive ecosystem</div>
          <h2 className={s.title}>Choose one.<br />See three things.</h2>
          <p className={s.lead}>
            Tap any option and its three cards drop down right beneath it. Tap again to fold them away, or open
            another one to swap.
          </p>
        </div>
        <div className={s.ecoList}>
          {CHOICES.map(c => {
            const isOpen = open === c.key;
            const view = ECOSYSTEM[c.key];
            const panelId = `${uid}-${c.key}`;
            return (
              <div key={c.key} className={`${s.ecoItem} ${isOpen ? s.ecoOpen : ''}`}>
                <button
                  type="button"
                  className={s.selectBtn}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : c.key)}
                >
                  <b>{c.label}</b><span>{c.glyph}</span>
                </button>
                <div className={s.ecoPanelWrap} id={panelId} role="region" aria-label={view.title} aria-hidden={!isOpen}>
                  <div className={s.ecoPanelInner}>
                    <div className={s.revealPanel}>
                      <p>{view.desc}</p>
                      <div className={s.revealItems}>
                        {view.items.map(([icon, title, desc], i) => (
                          <div key={title} className={`${s.revealItem} ${TINT[i]}`}>
                            <i>{icon}</i><b>{title}</b><small>{desc}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
