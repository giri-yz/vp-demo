import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../pages/admin/css/Mascot.module.css';

const GREETINGS = [
  'Hii buddy!',
  'Welcome back!',
  'Need help?',
  'Looking good!',
  'Check your orders!',
  'Stay productive!',
  'Have a great day!',
];

export default function Mascot() {
  const [bubble, setBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState(GREETINGS[0]);
  const [floating, setFloating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingIdx = useRef(0);

  const showGreeting = useCallback(() => {
    greetingIdx.current = (greetingIdx.current + 1) % GREETINGS.length;
    setBubbleText(GREETINGS[greetingIdx.current]);
    setBubble(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBubble(false), 3000);
  }, []);

  useEffect(() => {
    const t = setTimeout(showGreeting, 2000);
    return () => clearTimeout(t);
  }, [showGreeting]);

  function handleClick() {
    showGreeting();
    if (!floating) {
      setFloating(true);
      setTimeout(() => setFloating(false), 6000);
    }
  }

  return (
    <div
      className={`${styles.mascot} ${floating ? styles.floating : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      role="button"
      tabIndex={0}
      aria-label="Mascot"
    >
      <div className={`${styles.bubble} ${bubble ? styles.show : ''}`}>
        {bubbleText}
      </div>
      <div className={styles.wrap}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <ellipse cx="50" cy="58" rx="28" ry="30" fill="#F2B233" stroke="#E0A820" strokeWidth="2" />

          {/* Left arm */}
          <g className={styles.armL}>
            <ellipse cx="22" cy="60" rx="8" ry="6" fill="#F2B233" stroke="#E0A820" strokeWidth="1.5" transform="rotate(-20 22 60)" />
          </g>

          {/* Right arm */}
          <g className={styles.armR}>
            <ellipse cx="78" cy="60" rx="8" ry="6" fill="#F2B233" stroke="#E0A820" strokeWidth="1.5" transform="rotate(20 78 60)" />
          </g>

          {/* Eyes */}
          <ellipse cx="40" cy="50" rx="5" ry="5.5" fill="#fff" />
          <ellipse cx="60" cy="50" rx="5" ry="5.5" fill="#fff" />
          <circle cx="41" cy="50" r="2.5" fill="#1a1a1a" className={styles.pupilL} />
          <circle cx="61" cy="50" r="2.5" fill="#1a1a1a" className={styles.pupilR} />

          {/* Eye shine */}
          <circle cx="42.5" cy="48.5" r="1" fill="#fff" />
          <circle cx="62.5" cy="48.5" r="1" fill="#fff" />

          {/* Eye lids */}
          <ellipse cx="40" cy="47" rx="5.5" ry="0.5" fill="#E0A820" className={styles.eyeLidL} />
          <ellipse cx="60" cy="47" rx="5.5" ry="0.5" fill="#E0A820" className={styles.eyeLidR} />

          {/* Mouth */}
          <path className={styles.mouth} d="M45 66 Q50 72 55 66" stroke="#2C3E50" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Cheeks */}
          <circle cx="32" cy="58" r="3.5" fill="rgba(255,150,50,0.3)" />
          <circle cx="68" cy="58" r="3.5" fill="rgba(255,150,50,0.3)" />

          {/* Feet */}
          <ellipse cx="38" cy="86" rx="8" ry="4" fill="#E0A820" />
          <ellipse cx="62" cy="86" rx="8" ry="4" fill="#E0A820" />
        </svg>
      </div>
      <div className={styles.shadow} />
    </div>
  );
}
