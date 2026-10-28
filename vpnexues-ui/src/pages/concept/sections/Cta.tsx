import { Link } from 'react-router-dom';
import type { AppKind } from '../data';
import { BasketIcon, PhoneIcon, StoreIcon } from '../icons';
import s from '../ConceptHome.module.css';

export default function Cta({ onOpen }: { onOpen: (app: AppKind) => void }) {
  return (
    <section className={s.cta}>
      <div className={`${s.container} ${s.ctaGrid}`}>
        <div>
          <h2>One brand.<br />Many ways forward.</h2>
          <p>VP NEXUES brings global trade, app-first customer experience and seller opportunity into one visual system using the full logo palette.</p>
        </div>
        <div className={s.ctaActions}>
          <button type="button" className={`${s.ctaBtn} ${s.ctaBtnDark}`} onClick={() => onOpen('buyer')}>
            <span className={s.ctaBtnIcon}><PhoneIcon size={24} /></span>
            <span className={s.ctaBtnText}><small>Discover</small><b>Buyer App</b></span>
            <span className={s.ctaBtnArrow} aria-hidden="true">↗</span>
          </button>
          <button type="button" className={`${s.ctaBtn} ${s.ctaBtnLight}`} onClick={() => onOpen('seller')}>
            <span className={s.ctaBtnIcon}><StoreIcon size={24} /></span>
            <span className={s.ctaBtnText}><small>Discover</small><b>Seller App</b></span>
            <span className={s.ctaBtnArrow} aria-hidden="true">↗</span>
          </button>
          <Link to="/market" className={`${s.ctaBtn} ${s.ctaBtnOutline}`}>
            <span className={s.ctaBtnIcon}><BasketIcon size={24} /></span>
            <span className={s.ctaBtnText}><small>Visit</small><b>Market</b></span>
            <span className={s.ctaBtnArrow} aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
