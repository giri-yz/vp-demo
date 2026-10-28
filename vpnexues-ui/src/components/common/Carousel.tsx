import { useRef, type ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './css/Carousel.module.css';

/**
 * Swiper-backed carousel — the React-native replacement for the old static site's
 * Swiper.js carousels (gallery strip, testimonial quotes, brand strip).
 */
export default function Carousel({ children }: { children: ReactNode[] }) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous"
      >
        &#8249;
      </button>
      <Swiper
        modules={[Navigation]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView="auto"
        spaceBetween={20}
        className={styles.track}
      >
        {children.map((child, i) => (
          <SwiperSlide key={i} className={styles.item}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next"
      >
        &#8250;
      </button>
    </div>
  );
}
