import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data';
import s from '../ConceptHome.module.css';

const CARD = { fruits: s.catFruits, vegetables: s.catVegetables, groceries: s.catGroceries } as const;

export default function Categories() {
  return (
    <section className={`${s.section} ${s.categories}`} id="categories" data-fit="">
      <div className={s.container}>
        <div className={s.catHead}>
          <div>
            <div className={s.eyebrow}>03 / Fresh categories</div>
            <h2 className={s.title}>Fresh categories with a direct path to shop.</h2>
            <p className={s.lead}>
              Fruits, vegetables and groceries stay visible as the core categories, while the primary action takes
              visitors toward the current shop experience.
            </p>
          </div>
          <Link className={`${s.btn} ${s.btnPrimary}`} to="/shop">Explore now</Link>
        </div>
        <div className={s.categoryGrid}>
          {CATEGORIES.map(c => (
            <article key={c.id} className={`${s.categoryCard} ${CARD[c.id]}`} data-reveal="">
              <small>Category {c.n}</small>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className={s.categoryIcon} aria-hidden="true">{c.glyph}</div>
              <Link className={`${s.btn} ${s.btnDark}`} to="/shop">Explore</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
