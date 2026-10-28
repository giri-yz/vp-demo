import Carousel from './Carousel';
import styles from './css/GalleryStrip.module.css';

const GALLERY_IMAGES = Array.from({ length: 9 }, (_, i) => `/images/gallery/gallery-0${i + 1}.jpg`);

/** Reused across History/Project/Service — matches the static site's reused gallery-Swiper block. */
export default function GalleryStrip({ title = 'Our Gallery' }: { title?: string }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading}>{title}</h2>
        <Carousel>
          {GALLERY_IMAGES.map((src) => (
            <img key={src} src={src} alt="" className={styles.tile} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
