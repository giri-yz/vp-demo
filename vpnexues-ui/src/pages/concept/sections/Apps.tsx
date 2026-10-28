import type { ReactNode } from 'react';
import type { AppKind } from '../data';
import s from '../ConceptHome.module.css';

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className={s.phone} aria-hidden="true">
      <div className={s.notch} />
      <div className={s.screen}>{children}</div>
    </div>
  );
}

export default function Apps({ onOpen }: { onOpen: (app: AppKind) => void }) {
  return (
    <section className={`${s.section} ${s.apps}`} id="apps" data-fit="">
      <div className={s.container}>
        <div className={s.appsHead}>
          <div className={s.eyebrow}>04 / The apps</div>
          <h2 className={s.title}>Two experiences.<br />Equal importance.</h2>
          <p className={`${s.lead} ${s.leadCenter}`}>
            The Buyer App and Seller App remain core parts of the VP NEXUES ecosystem, now presented in stronger,
            darker cards for a more premium contrast.
          </p>
        </div>
        <div className={s.appGrid}>
          <article className={`${s.appCard} ${s.appBuyer}`} data-reveal="">
            <span className={`${s.badge} ${s.badgeOnDark}`}>Buyer App · Under testing</span>
            <h3>Fresh choices,<br />closer to you.</h3>
            <p>A polished mobile experience intended to bring product discovery and shopping into the VP NEXUES app.</p>
            <div className={s.appActions}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => onOpen('buyer')}>Scan &amp; download concept</button>
            </div>
            <Phone>
              <div className={s.screenHead}>Good morning ✳</div>
              <div className={s.search} />
              <div className={s.tiles}><div>◒</div><div>✳</div><div>▤</div><div>◈</div></div>
              <div className={s.screenNote}>Fresh categories, one tap away.</div>
            </Phone>
          </article>

          <article className={`${s.appCard} ${s.appSeller}`} data-reveal="">
            <span className={`${s.badge} ${s.badgeOnDark}`}>Seller App · In development</span>
            <h3>Grow smarter.<br />Sell further.</h3>
            <p>A dedicated experience being developed for sellers, suppliers and future marketplace participation.</p>
            <div className={s.appActions}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => onOpen('seller')}>Seller app preview</button>
            </div>
            <Phone>
              <div className={s.screenHead}>Seller space ▣</div>
              <div className={s.search} />
              <div className={s.screenNote}>Your business overview</div>
              <div className={`${s.tiles} ${s.tilesGap}`}><div>▥</div><div>↗</div><div>◎</div><div>▤</div></div>
            </Phone>
          </article>
        </div>
      </div>
    </section>
  );
}
