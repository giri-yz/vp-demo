import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
/* 40/60 CORRECT POSITIONING profile — photo left sticky, content right.
   Route: /team/:slug (React Router equivalent of Next.js /app/team/[slug]).
   LEFT 40% sticky photo card (Director first) · RIGHT 60% stacked roles +
   skills panels, tops aligned, 60px gap, 24px page padding — no waste.
   Data + i18n + slug logic unchanged.
   NOTE on stack: this app is Vite + CSS Modules (no Tailwind/Next). No new
   libraries — Framer Motion alone, transform/opacity only, 60fps. */
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import { TEAM, getRoleContent, roleKeyFor, roleNameKeyFor, type TeamMember } from './teamData';
import { assetUrl, fetchTeamMembers, getCachedTeamMembers, type TeamMemberRow } from '../../api/contentApi';
import NotFound from '../NotFound';
import TeamPhoto from './TeamPhoto';
import styles from './css/TeamDetails.module.css';

/* ── data helpers (untouched behavior) ─────────────────────────────────── */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function hideBrokenImg(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.classList.add(styles.photoMissing);
}

function rowToMember(row: TeamMemberRow): TeamMember {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role ?? undefined,
    isDirector: row.isDirector,
    photo: assetUrl(row.photoUrl),
    bio: row.description ?? '',
    responsibilities: row.responsibilities ?? undefined,
    keySkills: row.keySkills ?? undefined,
  };
}

/* Deterministic pseudo-random (stable across renders / StrictMode). */
function seeded(i: number, salt: number): number {
  return (((Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1) + 1) % 1;
}

/* ── BACKGROUND: night-forest space — drifting 3D leaves + soft bokeh ─── */
const LEAF_COUNT = 20;
const BOKEH_COUNT = 30;
const LEAF_EMOJIS = ['🍃', '🌿', '🍂', '🌱'];

function Atmosphere({ floats, dense }: { floats: boolean; dense: boolean }) {
  const leaves = LEAF_COUNT;
  const bokeh = BOKEH_COUNT;
  if (!floats) return null;
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      {Array.from({ length: bokeh }, (_, i) => (
        <span
          key={`b-${i}`}
          className={`${styles.bokeh} ${i % 3 === 2 ? styles.bokehGreen : styles.bokehSoft} ${!dense && i >= 12 ? styles.hideMobile : ''}`}
          style={
            {
              left: `${seeded(i, 1) * 100}%`,
              top: `${seeded(i, 2) * 100}%`,
              width: `${4 + Math.round(seeded(i, 3) * 14)}px`,
              height: `${4 + Math.round(seeded(i, 3) * 14)}px`,
              opacity: 0.3,
              animationDuration: `${8 + seeded(i, 4) * 10}s`,
              animationDelay: `${-seeded(i, 5) * 12}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {Array.from({ length: dense ? leaves : 10 }, (_, i) => (
        <motion.span
          key={`l-${i}`}
          className={styles.driftLeaf}
          style={{ left: `${seeded(i, 11) * 100}%`, top: `${-6 + seeded(i, 12) * 100}%`, fontSize: `${15 + Math.round(seeded(i, 13) * 18)}px` }}
          animate={{ y: [0, -100, 0], rotateX: [0, 28, 0], rotateY: [0, -32, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: -seeded(i, 14) * 20 }}
        >
          {LEAF_EMOJIS[i % LEAF_EMOJIS.length]}
        </motion.span>
      ))}
    </div>
  );
}

/* ── LEFT 40%: sticky floating glass identity card ────────────────────── */
function PhotoCard({
  member,
  roleTag,
  respCount,
  skillCount,
  floats,
  tiltX,
  tiltY,
}: {
  member: TeamMember;
  roleTag: string;
  respCount: number;
  skillCount: number;
  floats: boolean;
  tiltX: ReturnType<typeof useSpring> | undefined;
  tiltY: ReturnType<typeof useSpring> | undefined;
}) {
  return (
    <motion.div
      className={styles.cardParallax}
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* levitation loop */}
      <motion.div
        animate={floats ? { y: [0, -20, 0] } : undefined}
        transition={floats ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {/* slow 3D sway + pointer tilt (composed on nested nodes) */}
        <motion.div
          className={styles.idCard}
          animate={floats ? { rotateY: [-8, -5, -8] } : undefined}
          transition={floats ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : undefined}
          style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
        >
          <p className={styles.cardKicker}>
            {roleTag} • VPNEXUES
          </p>
          <h1 className={styles.cardName}>{member.name.toUpperCase()}</h1>
          <div className={styles.cardPhoto}>
            <span className={styles.initials} aria-hidden="true">
              {initials(member.name)}
            </span>
            {member.photo && (
              <TeamPhoto src={member.photo} alt={member.name} width={900} loading="eager" className={styles.cardImg} onError={hideBrokenImg} />
            )}
            <span className={styles.cardPhotoShade} aria-hidden="true" />
          </div>
          <div className={styles.cardStats}>
            <span className={styles.statPill}>{respCount} Focus Areas</span>
            <span className={styles.statPill}>{skillCount} Key Skills</span>
            <span className={styles.statPill}>VPNexues</span>
          </div>
          <span className={styles.cardGloss} aria-hidden="true" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── RIGHT TOP: roles card with yellow dot bullets ─────────────────────── */
function RolesCard({ title, roles }: { title: string; roles: { title: string; description: string }[] }) {
  return (
    <motion.section
      className={styles.sideCard}
      aria-label={title}
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className={styles.sideTitle}>{title}</h2>
      <ul className={styles.roleList}>
        {roles.map((r) => (
          <li key={r.title} className={styles.roleItem}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.roleText}>
              <strong className={styles.roleTitle}>{r.title}</strong>
              <span className={styles.roleDesc}>{r.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

/* ── RIGHT BOTTOM: skills as stacked mini cards ────────────────────────── */
function SkillsCards({ title, skills }: { title: string; skills: string[] }) {
  return (
    <section className={styles.sideSection} aria-label={title}>
      <motion.h2
        className={styles.sideTitle}
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h2>
      <div className={styles.skillCards}>
        {skills.map((s, i) => (
          <motion.div
            key={s}
            className={styles.skillCard}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <strong className={styles.skillTitle}>{s}</strong>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── PAGE ──────────────────────────────────────────────────────────────── */
export default function TeamDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { t, tRaw } = useLanguage();
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  /* Float loops run whenever motion is allowed (mobile keeps floating);
     pointer tilt only on fine pointers (no 3D rotate on touch). */
  const floats = !reduce;
  const tiltOn = floats && fine;

  /* Pointer → card tilt (rotateY = x·0.05 style mapping, ±6°). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-11, -5]), { stiffness: 60, damping: 18 });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [8, 2]), { stiffness: 60, damping: 18 });

  /* Scroll-linked parallax removed: translating the columns on scroll pushed
     them over the bio + pager below (transforms don't move layout). The
     levitation, sway and pointer tilt keep all the 3D life without overlap. */

  // The list already fetched the team, so the cache renders this profile instantly;
  // without a cache (direct link) the static TEAM shows until the API answers.
  // A slug the API has genuinely dropped flips to NotFound; a failed fetch must NOT
  // (a backend hiccup used to 404 members the list could still show).
  const [team, setTeam] = useState<TeamMember[]>(() => getCachedTeamMembers()?.map(rowToMember) ?? TEAM);
  const [loaded, setLoaded] = useState(() => getCachedTeamMembers() !== null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    fetchTeamMembers()
      .then((rows) => {
        if (!cancelled) setTeam(rows.map(rowToMember));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const member = team.find((m) => m.slug === slug);

  /* SEO — one common tab name across all pages: VPNexues. */
  useEffect(() => {
    document.title = 'VPNexues';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && member)
      meta.setAttribute('content', `${member.name} — ${member.role ?? 'VPNexues team'}: profile, responsibilities and key skills.`);
  }, [member, t]);

  if (!member) {
    if (!loaded) {
      return (
        <div className={styles.page}>
          <p className={styles.stateText}>{t('team.profileLoading')}</p>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className={styles.page}>
          <div className={styles.stateBox}>
            <p className={styles.stateText}>{t('team.profileLoadError')}</p>
            <button type="button" className={styles.retryLink} onClick={() => setAttempt((a) => a + 1)}>
              {t('team.retry')}
            </button>
          </div>
        </div>
      );
    }
    return <NotFound />;
  }

  const roleContent = getRoleContent(member.role, member.isDirector);
  const roleKey = roleKeyFor(member.role, member.isDirector);
  const localizedRoleContent = roleKey ? tRaw(`team.roleContent.${roleKey}`) : undefined;
  const loc =
    localizedRoleContent && typeof localizedRoleContent === 'object' && !Array.isArray(localizedRoleContent)
      ? (localizedRoleContent as { responsibilities?: { title: string; description: string }[]; skills?: string[] })
      : null;
  // Admin-saved values (sub-admin Team & News form) win over translations and role defaults.
  const responsibilities = member.responsibilities ?? loc?.responsibilities ?? roleContent?.responsibilities ?? [];
  const skills = member.keySkills ?? loc?.skills ?? roleContent?.skills ?? [];
  const roleNameKey = roleNameKeyFor(member.role, member.isDirector);
  const roleTagKey = roleNameKey ? `team.roleNames.${roleNameKey}` : null;
  const translatedRole = roleTagKey ? t(roleTagKey) : null;
  // Unknown role (raw key returned): show the plain role text, never the key.
  const roleTag =
    roleTagKey && translatedRole !== roleTagKey && translatedRole !== null
      ? translatedRole
      : member.role ?? t('team.director');

  /* Prev / next member (slug order) for the bottom nav. */
  const idx = team.findIndex((m) => m.slug === member.slug);
  const prev = idx > 0 ? team[idx - 1] : null;
  const next = idx >= 0 && idx < team.length - 1 ? team[idx + 1] : null;

  return (
    <div
      className={styles.page}
      onMouseMove={(e) => {
        if (!tiltOn) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <Atmosphere floats={floats} dense={fine} />

      <div className={styles.stage}>
        <nav className={styles.topBar} aria-label={t('team.breadcrumbTeam')}>
          <Link to="/team" className={styles.backLink}>
            <span aria-hidden="true">←</span> {t('team.breadcrumbTeam')}
          </Link>
          <span className={styles.crumbSlug}>{member.name}</span>
        </nav>

        {/* 40/60: sticky photo left, stacked content right, tops aligned */}
        <div className={styles.columns}>
          <div className={styles.colPhoto}>
            <PhotoCard
              member={member}
              roleTag={roleTag}
              respCount={responsibilities.length}
              skillCount={skills.length}
              floats={floats}
              tiltX={tiltOn ? tiltX : undefined}
              tiltY={tiltOn ? tiltY : undefined}
            />
          </div>

          <div className={styles.colContent}>
            {responsibilities.length > 0 && (
              <RolesCard title={t('team.rolesResp')} roles={responsibilities} />
            )}
            {skills.length > 0 && (
              <SkillsCards title={t('team.keySkills')} skills={skills} />
            )}
            <p className={styles.bioLine}>{member.bio}</p>
          </div>
        </div>

        {(prev || next) && (
          <nav className={styles.pager} aria-label="Team member navigation">
            {prev ? (
              <Link to={`/team/${prev.slug}`} className={styles.pageLink}>
                <span className={styles.pageDir}>← {t('team.prev')}</span>
                <strong>{prev.name}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/team/${next.slug}`} className={`${styles.pageLink} ${styles.pageLinkNext}`}>
                <span className={styles.pageDir}>{t('team.next')} →</span>
                <strong>{next.name}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
