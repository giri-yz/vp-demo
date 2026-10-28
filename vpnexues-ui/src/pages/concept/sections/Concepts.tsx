import { Link } from 'react-router-dom';
import { CratesIcon, ParcelIcon, PeopleIcon } from '../icons';
import s from '../ConceptHome.module.css';

export default function Concepts() {
  return (
    <section className={`${s.section} ${s.concepts}`} id="concepts" data-fit="">
      <div className={s.container}>
        <div className={s.eyebrow}>02 / Business concepts</div>
        <h2 className={s.title}>Small Box and Big Box, connected by family value.</h2>
        <p className={s.lead}>
          These concepts represent how VP NEXUES can serve different needs while still staying connected through
          one customer-focused ecosystem.
        </p>
        <div className={s.conceptBridge}>
          <article className={`${s.conceptCard} ${s.conceptSmall}`} data-reveal="">
            <div className={s.conceptIcon}><ParcelIcon /></div>
            <h3>Small Box</h3>
            <p>A compact concept designed for convenience, curated selection and everyday flexibility inside the VP NEXUES ecosystem.</p>
            <div className={s.conceptList}><span>Compact selection</span><span>Convenient format</span><span>Easy discovery</span></div>
            <Link className={`${s.btn} ${s.btnDark}`} to="/pricing/small-box">Visit Small Box</Link>
          </article>

          <div className={s.conceptFamily} data-reveal="" aria-hidden="true">
            <div className={s.familyRing}>
              <i className={s.famOrbit}><b /></i>
              <i className={`${s.famOrbit} ${s.famOrbit2}`}><b /></i>
              <PeopleIcon groupA={s.famA} groupB={s.famB} />
            </div>
            <strong>For every kind of need</strong>
            <span>One brand connecting small and large family requirements.</span>
          </div>

          <article className={`${s.conceptCard} ${s.conceptBig}`} data-reveal="">
            <div className={s.conceptIcon}><CratesIcon /></div>
            <h3>Big Box</h3>
            <p>A broader concept intended for larger needs, more value and a stronger presentation of the VP NEXUES product experience.</p>
            <div className={s.conceptList}><span>Bigger assortment</span><span>More value</span><span>Stronger impact</span></div>
            <Link className={`${s.btn} ${s.btnDark}`} to="/pricing/big-box">Visit Big Box</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
