import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './css/ScrollToTop.module.css';

export default function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const { pathname } = useLocation();

  // Reset states on route change
  useEffect(() => {
    setShowButton(false);
    setFooterVisible(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Scroll listener — show button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Footer visibility — hide button when footer is in viewport
  // Re-observes on route change
  useEffect(() => {
    setFooterVisible(false);

    let observer: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          setFooterVisible(entry.isIntersecting);
        },
        { root: null, threshold: 0.05 }
      );
      observer.observe(footer);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  // Handle tab visibility — reset when user returns to tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Re-check scroll position when tab becomes visible
        setShowButton(window.scrollY > 300);
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const shouldShow = showButton && !footerVisible;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      className={`${styles.scrollToTop} ${shouldShow ? styles.scrollToTop__visible : styles.scrollToTop__hidden}`}
      onClick={scrollToTop}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
