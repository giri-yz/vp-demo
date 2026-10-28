import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import * as orderFeedbackApi from '../../api/orderFeedbackApi';
import styles from './css/OrderFeedbackModal.module.css';

/* =====================================================================
   OrderFeedbackModal — post-order feedback popup shown on Order Success.
   Green hero banner with mascot, boxed star rating, standout tags,
   headline + review with one-tap suggestion chips, submitted to the
   public POST /api/order-feedback endpoint. Token-only styling per the
   design-consistency rule (the mascot SVG keeps illustrative fills, same
   as OrderSuccess's basket illustration).
   ===================================================================== */

/* Emoji are universal symbols — kept out of the translation bundles. */
const TAGS = [
  { key: 'Freshness', emoji: '🥬' },
  { key: 'Delivery', emoji: '🚚' },
  { key: 'Packaging', emoji: '📦' },
  { key: 'App', emoji: '📱' },
  { key: 'Pricing', emoji: '🏷️' },
  { key: 'Support', emoji: '🎧' },
] as const;

const CHEER_EMOJI = ['💪', '🙏', '😊', '✨', '🎉'] as const;
const RATING_WORDS = ['rate1', 'rate2', 'rate3', 'rate4', 'rate5'] as const;
const CHEERS = ['cheer1', 'cheer2', 'cheer3', 'cheer4', 'cheer5'] as const;
const SUGGESTIONS = ['sugg1', 'sugg2', 'sugg3', 'sugg4'] as const;
const COMMENT_MAX = 500;
const HEADLINE_MAX = 120;

/* Scattered leaves decorating the green hero (positions in %). */
const HERO_LEAVES = [
  { left: '6%', top: '12%', size: 13, rotate: -32, opacity: 0.5 },
  { left: '13%', top: '58%', size: 10, rotate: 24, opacity: 0.4 },
  { left: '22%', top: '22%', size: 11, rotate: 40, opacity: 0.35 },
  { left: '80%', top: '14%', size: 13, rotate: 30, opacity: 0.5 },
  { left: '89%', top: '52%', size: 11, rotate: -24, opacity: 0.4 },
  { left: '72%', top: '66%', size: 9, rotate: -40, opacity: 0.35 },
  { left: '30%', top: '72%', size: 9, rotate: 12, opacity: 0.3 },
  { left: '63%', top: '26%', size: 8, rotate: -12, opacity: 0.3 },
] as const;

/* Mood class per shown rating (index 0 = no rating yet). */
const MOOD_CLASSES = [
  'moodIdle',
  'moodSad',
  'moodMeh',
  'moodOkay',
  'moodHappy',
  'moodLove',
] as const;

/* Confetti burst bits around the mascot on a 5-star rating (positions in %). */
const CONFETTI = [
  { left: '4%', top: '16%', size: 9, delay: 0, kind: 'star' },
  { left: '16%', top: '4%', size: 7, delay: 0.08, kind: 'dot' },
  { left: '30%', top: '0%', size: 6, delay: 0.16, kind: 'dot' },
  { left: '64%', top: '2%', size: 6, delay: 0.12, kind: 'dot' },
  { left: '80%', top: '8%', size: 9, delay: 0.05, kind: 'star' },
  { left: '92%', top: '24%', size: 7, delay: 0.14, kind: 'dot' },
  { left: '94%', top: '46%', size: 8, delay: 0.2, kind: 'star' },
  { left: '2%', top: '40%', size: 8, delay: 0.18, kind: 'star' },
] as const;

type Mood = 0 | 1 | 2 | 3 | 4 | 5;

function Mascot({ mood }: { mood: Mood }) {
  /* Face: 1–2 sad, 3 gentle, 0/4 happy rest, 5 overjoyed. */
  const sadEyes = mood === 1 || mood === 2;
  const dotEyes = mood === 3;
  const bigHappy = mood >= 4;

  return (
    <svg viewBox="0 0 200 132" className={styles.mascotSvg} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fbBasketBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9a05f" />
          <stop offset="55%" stopColor="#c08a4b" />
          <stop offset="100%" stopColor="#9c6a35" />
        </linearGradient>
        <linearGradient id="fbBasketRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c99658" />
          <stop offset="100%" stopColor="#96622f" />
        </linearGradient>
        <linearGradient id="fbTomato" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f07566" />
          <stop offset="100%" stopColor="#d04437" />
        </linearGradient>
        <clipPath id="fbBasketClip">
          <path d="M40 78 L160 78 L148 118 Q146 124 140 124 L60 124 Q54 124 52 118 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="126" rx="62" ry="7" fill="rgba(0,0,0,0.22)" />

      {/* back leaves */}
      <g fill="#5b8c51">
        <path d="M52 74C40 62 40 48 44 40C56 44 62 58 52 74Z" />
        <path d="M148 74C160 62 160 48 156 40C144 44 138 58 148 74Z" />
      </g>

      {/* carrot peeking out right (wiggles on high ratings) */}
      <g
        transform="translate(150,52) rotate(18)"
        className={bigHappy ? styles.carrotWiggle : undefined}
      >
        <path d="M-9 -30 L9 -30 L3 22 Q0 30 -3 22 Z" fill="#f08c3c" />
        <g stroke="#d9722b" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <path d="M-6 -16 L6 -16" />
          <path d="M-4 -2 L5 -2" />
        </g>
        <g fill="#5b8c51">
          <ellipse cx="-8" cy="-40" rx="4" ry="10" transform="rotate(-26 -8 -40)" />
          <ellipse cx="1" cy="-43" rx="4" ry="11" />
          <ellipse cx="9" cy="-39" rx="4" ry="9" transform="rotate(26 9 -39)" />
        </g>
      </g>

      {/* basket handle */}
      <path
        d="M56 80C62 30 138 30 144 80"
        fill="none"
        stroke="#96622f"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* tomato with mood face */}
      <g>
        <circle cx="98" cy="56" r="27" fill="url(#fbTomato)" />
        <ellipse cx="89" cy="47" rx="8" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-28 89 47)" />
        <g fill="#3f7a34">
          <ellipse cx="98" cy="30" rx="11" ry="4" />
          <ellipse cx="88" cy="33" rx="8" ry="3.4" transform="rotate(-40 88 33)" />
          <ellipse cx="108" cy="33" rx="8" ry="3.4" transform="rotate(40 108 33)" />
        </g>
        <path d="M98 29V20" stroke="#3f7a34" strokeWidth="4" strokeLinecap="round" />

        {/* eyes */}
        {sadEyes ? (
          <g stroke="#7a1f16" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M86 51Q89 56 92 51" />
            <path d="M104 51Q107 56 110 51" />
          </g>
        ) : dotEyes ? (
          <g fill="#7a1f16">
            <circle cx="89" cy="53" r="2.8" />
            <circle cx="107" cy="53" r="2.8" />
          </g>
        ) : (
          <g stroke="#7a1f16" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M86 54Q89 50 92 54" />
            <path d="M104 54Q107 50 110 54" />
          </g>
        )}

        {/* mouth */}
        {mood === 1 ? (
          <path d="M90 67Q98 60 106 67" stroke="#7a1f16" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        ) : mood === 2 ? (
          <path d="M92 65Q98 62 104 65" stroke="#7a1f16" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        ) : mood === 3 ? (
          <path d="M92 62Q98 67 104 62Q98 65 92 62Z" fill="#7a1f16" />
        ) : mood === 5 ? (
          <>
            <path d="M88 61Q98 73 108 61Q98 68 88 61Z" fill="#7a1f16" />
            <ellipse cx="98" cy="68" rx="4" ry="2.4" fill="#e86a7a" />
          </>
        ) : (
          <path d="M90 63Q98 70 106 63Q98 67 90 63Z" fill="#7a1f16" />
        )}

        {/* blush always; stronger when delighted */}
        <circle cx="82" cy="60" r={bigHappy ? 3.6 : 3} fill="rgba(255,255,255,0.35)" />
        <circle cx="114" cy="60" r={bigHappy ? 3.6 : 3} fill="rgba(255,255,255,0.35)" />

        {/* single tear on 1 star */}
        {mood === 1 && (
          <ellipse className={styles.tear} cx="89" cy="58" rx="2" ry="2.8" fill="#7ec8e3" />
        )}

        {/* tiny sparkle eyes on 5 stars */}
        {mood === 5 && (
          <g fill="#eddd5e" opacity="0.9">
            <path d="M89 48l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" />
            <path d="M107 48l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" />
          </g>
        )}
      </g>

      {/* small greens left of tomato */}
      <g>
        <circle cx="66" cy="66" r="13" fill="#6aa358" />
        <circle cx="76" cy="60" r="11" fill="#7fb069" />
        <circle cx="68" cy="56" r="8" fill="#8cbb7b" />
      </g>

      {/* basket body */}
      <path
        d="M40 78 L160 78 L148 118 Q146 124 140 124 L60 124 Q54 124 52 118 Z"
        fill="url(#fbBasketBody)"
      />
      <g clipPath="url(#fbBasketClip)">
        <path d="M34 92H168" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
        <path d="M34 106H168" stroke="rgba(0,0,0,0.08)" strokeWidth="5" />
        <g stroke="rgba(0,0,0,0.09)" strokeWidth="3.5">
          <path d="M56 74L60 128" />
          <path d="M78 74L80 128" />
          <path d="M100 74L100 128" />
          <path d="M122 74L120 128" />
          <path d="M144 74L140 128" />
        </g>
      </g>
      <rect x="34" y="70" width="132" height="16" rx="8" fill="url(#fbBasketRim)" />
      <path d="M40 75H160" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />

      {/* cloth draped over the rim */}
      <path
        d="M74 70C71 86 74 100 70 110C82 115 96 115 106 110C102 98 105 84 101 70Z"
        fill="#f6f1e2"
      />
      <g stroke="rgba(44,79,37,0.12)" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M85 72C84 86 86 98 84 108" />
        <path d="M95 72C94 86 96 98 94 108" />
      </g>

      {/* FRESH tag */}
      <g transform="translate(128,96) rotate(8)">
        <rect x="0" y="0" width="46" height="18" rx="4" fill="#f6f1e2" stroke="#c9bc50" strokeWidth="1.4" />
        <text x="23" y="13" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#5b8c51" fontFamily="inherit" letterSpacing="0.5">
          FRESH
        </text>
      </g>
    </svg>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderNumber?: string;
  countryCode?: string;
}

export default function OrderFeedbackModal({ open, onClose, orderNumber, countryCode }: Props) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [ratingError, setRatingError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const successTimerRef = useRef<number | null>(null);

  /* Reset form state each time the popup opens. */
  useEffect(() => {
    if (!open) return;
    setRating(0);
    setHoverRating(0);
    setSelectedTags([]);
    setHeadline('');
    setComment('');
    setStatus('idle');
    setRatingError(false);
  }, [open]);

  /* Scroll lock + Escape-to-close + focus the panel (AuthModal pattern). */
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const prevBody = document.body.style.cssText;
    const prevHtml = document.documentElement.style.cssText;
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${scrollY}px;width:100%;`;
    document.documentElement.style.cssText = `overflow:hidden;`;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 60);
    return () => {
      document.body.style.cssText = prevBody;
      document.documentElement.style.cssText = prevHtml;
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, [open, onClose]);

  const toggleTag = useCallback((key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const addSuggestion = useCallback((text: string) => {
    setComment((prev) => {
      if (prev.includes(text)) return prev;
      const joined = prev.trim() ? `${prev.trimEnd()} ${text}` : text;
      return joined.slice(0, COMMENT_MAX);
    });
  }, []);

  const handleSubmit = async () => {
    if (rating < 1) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setStatus('submitting');
    try {
      await orderFeedbackApi.submitOrderFeedback({
        orderNumber,
        rating,
        tags: selectedTags.length > 0 ? selectedTags.map((k) => k.toLowerCase()) : undefined,
        headline: headline.trim() || undefined,
        comment: comment.trim() || undefined,
        countryCode,
      });
      setStatus('success');
      successTimerRef.current = window.setTimeout(() => onClose(), 4200);
    } catch {
      setStatus('error');
    }
  };

  if (!open) return null;

  const shownRating = hoverRating || rating;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'submitting') onClose();
      }}
      role="presentation"
    >
      <div
        className={styles.panel}
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('feedback.close')}
          disabled={status === 'submitting'}
        >
          &times;
        </button>

        <div className={styles.hero}>
          {HERO_LEAVES.map((leaf, i) => (
            <span
              key={i}
              className={styles.heroLeaf}
              style={{
                left: leaf.left,
                top: leaf.top,
                width: leaf.size,
                height: leaf.size,
                opacity: leaf.opacity,
                transform: `rotate(${leaf.rotate}deg)`,
              }}
              aria-hidden="true"
            />
          ))}
          <h2 id="fb-title" className={styles.title}>
            {t('feedback.title')}
          </h2>
          <p className={styles.subtitle}>{t('feedback.subtitle')}</p>
          <div className={styles.mascot} aria-hidden="true">
            {/*
              key remounts the mood wrapper so each new rating restarts its
              reaction animation (bounce / sway / confetti burst).
            */}
            <div
              key={`mood-${shownRating}`}
              className={`${styles.mascotMood} ${styles[MOOD_CLASSES[shownRating]]}`}
            >
              <Mascot mood={shownRating as Mood} />
              {shownRating === 5 && (
                <div className={styles.confetti} key={`confetti-${rating}`}>
                  {CONFETTI.map((bit, i) => (
                    <span
                      key={i}
                      className={`${styles.confettiBit} ${bit.kind === 'star' ? styles.confettiStar : styles.confettiDot}`}
                      style={{
                        left: bit.left,
                        top: bit.top,
                        width: bit.size,
                        height: bit.size,
                        animationDelay: `${bit.delay}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {status === 'success' ? (
            <div className={styles.success}>
              <div className={styles.successIconWrap}>
                <svg viewBox="0 0 120 120" className={styles.successRing} aria-hidden="true">
                  <circle cx="60" cy="60" r="52" />
                </svg>
                <div className={styles.successCircle} />
                <svg viewBox="0 0 120 120" className={styles.successCheck} aria-hidden="true">
                  <path d="M36 62L52 78L84 44" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>{t('feedback.successTitle')}</h3>
              <p className={styles.successBody}>{t('feedback.successBody')}</p>
              <button type="button" className={styles.sendBtn} onClick={onClose}>
                {t('feedback.done')}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.starsRow} onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.star} ${n <= shownRating ? styles.starActive : ''}`}
                    onClick={() => {
                      setRating(n);
                      setRatingError(false);
                    }}
                    onMouseEnter={() => setHoverRating(n)}
                    onFocus={() => setHoverRating(n)}
                    onBlur={() => setHoverRating(0)}
                    aria-label={`${n} ${t(`feedback.${RATING_WORDS[n - 1]}`)}`}
                    aria-pressed={rating === n}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.2 6 20.5l1.3-6.7-5-4.7 6.8-.9L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className={styles.cheer}>
                {shownRating > 0 ? (
                  <>{t(`feedback.${CHEERS[shownRating - 1]}`)} {CHEER_EMOJI[shownRating - 1]}</>
                ) : (
                  t('feedback.rateHint')
                )}
              </p>
              {ratingError && <p className={styles.inlineError}>{t('feedback.ratingRequired')}</p>}

              <p className={styles.fieldLabel}>{t('feedback.tagsLabel')}</p>
              <div className={styles.tags}>
                {TAGS.map((tag) => {
                  const active = selectedTags.includes(tag.key);
                  return (
                    <button
                      key={tag.key}
                      type="button"
                      className={`${styles.tag} ${active ? styles.tagActive : ''}`}
                      onClick={() => toggleTag(tag.key)}
                      aria-pressed={active}
                    >
                      <span aria-hidden="true">{tag.emoji}</span>
                      {t(`feedback.tag${tag.key}`)}
                    </button>
                  );
                })}
              </div>

              <p className={styles.fieldLabel}>
                <span aria-hidden="true">✍️ </span>
                {t('feedback.reviewLabel')}
              </p>
              <input
                type="text"
                className={styles.headline}
                maxLength={HEADLINE_MAX}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={t('feedback.headlinePlaceholder')}
                aria-label={t('feedback.headlinePlaceholder')}
              />
              <textarea
                className={styles.comment}
                rows={3}
                maxLength={COMMENT_MAX}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback.commentPlaceholder')}
                aria-label={t('feedback.commentPlaceholder')}
              />

              <div className={styles.suggRow}>
                <div className={styles.suggestions}>
                  {SUGGESTIONS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.suggestion}
                      onClick={() => addSuggestion(t(`feedback.${key}`))}
                    >
                      + {t(`feedback.${key}`)}
                    </button>
                  ))}
                </div>
                <span className={styles.charCount}>
                  {comment.length}/{COMMENT_MAX}
                </span>
              </div>

              {status === 'error' && (
                <p className={styles.submitError} role="alert">
                  {t('feedback.submitError')}
                </p>
              )}

              <button
                type="button"
                className={styles.sendBtn}
                onClick={handleSubmit}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    {t('feedback.submitting')}
                  </>
                ) : (
                  t('feedback.submit')
                )}
              </button>
              <button
                type="button"
                className={styles.laterBtn}
                onClick={onClose}
                disabled={status === 'submitting'}
              >
                {t('feedback.later')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
