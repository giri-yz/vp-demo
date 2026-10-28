import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { TEAM, roleNameKeyFor, type TeamMember } from './teamData';
import { assetUrl, fetchTeamMembers, getCachedTeamMembers, type TeamMemberRow } from '../../api/contentApi';
import {
  IconCrown,
  IconCode,
  IconGlobe,
  IconRobot,
  IconPalette,
  IconUserRoundCheck,
  IconSmartphone,
  IconUser,
  IconLeaf,
} from '../../components/common/icons';
import styles from './css/Team.module.css';
import TeamPhoto from './TeamPhoto';

const ROLE_ICON: Record<string, typeof IconUser> = {
  'Team Lead': IconCrown,
  'Module Lead': IconCode,
  'Manager': IconCrown,
  'Web Developer': IconGlobe,
  'AI Developer': IconRobot,
  'UI/UX Designer': IconPalette,
  'HR Executive': IconUserRoundCheck,
  'Junior HR Executive': IconUserRoundCheck,
  'Android/iOS Developer': IconSmartphone,
  'Android Developer': IconSmartphone,
  'SEO Writer': IconGlobe,
  'SEO Content Writer': IconGlobe,
};

function RoleIcon({ role }: { role?: string }) {
  const Icon = (role && ROLE_ICON[role]) || IconUser;
  return <Icon />;
}

function roleLabel(role: string | undefined, isDirector: boolean | undefined, t: (key: string) => string): string | null {
  if (!role && !isDirector) return null;
  const key = roleNameKeyFor(role, isDirector);
  if (key) {
    const fullKey = `team.roleNames.${key}`;
    const label = t(fullKey);
    // Unknown role (raw key returned): show the plain role text, never the key.
    if (label !== fullKey) return label;
  }
  return role ?? null;
}

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
  };
}

function TeamBubble({ member, t }: { member: TeamMember; t: (key: string) => string }) {
  return (
    <div className={styles.bubbleItem}>
      <Link
        to={`/team/${member.slug}`}
        className={styles.bubbleLink}
        aria-label={`${member.name} — ${t('team.viewProfile')}`}
      >
        <span className={styles.bubble}>
          <span className={styles.bubbleShine} aria-hidden="true" />
          <span className={styles.bubblePhoto}>
            <span className={styles.initials} aria-hidden="true">{initials(member.name)}</span>
            {member.photo && <TeamPhoto src={member.photo} alt={member.name} width={400} loading="lazy" onError={hideBrokenImg} />}
          </span>
          <span className={styles.iconBadge} aria-hidden="true">
            <RoleIcon role={member.role} />
          </span>
        </span>

        <span className={styles.nameCard}>
          <strong className={styles.name}>{member.name}</strong>
          {roleLabel(member.role, member.isDirector, t) && (
            <span className={styles.role}>
              <IconLeaf width={13} height={13} aria-hidden="true" />
              {roleLabel(member.role, member.isDirector, t)}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
}

export default function Team() {
  const { t } = useLanguage();
  // Cached rows render instantly (back-navigation doesn't flash the static list);
  // the API revalidates in the background and still falls back to static offline.
  const [team, setTeam] = useState<TeamMember[]>(() => getCachedTeamMembers()?.map(rowToMember) ?? TEAM);

  useEffect(() => {
    let cancelled = false;
    fetchTeamMembers()
      .then((rows) => {
        if (!cancelled) setTeam(rows.map(rowToMember));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /* SEO — one common tab name across all pages: VPNexues. */
  useEffect(() => {
    document.title = 'VPNexues';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Meet the VPNexues team — founders, developers, designers and farm partners behind Tamil Nadu\u2019s organic farm-to-table network.');
  }, [t]);

  const directors = team.filter((m) => m.isDirector);
  const members = team.filter((m) => !m.isDirector);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label={t('team.title')}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t('team.peopleBehind')}</span>
          <h1 className={styles.heroTitle}>
            {t('team.meet')} {t('team.our')}{' '}
            <span className={styles.heroTitleAccent}>{t('team.teamWord')}</span>
          </h1>
          <p className={styles.heroSub}>{t('team.subtitle')}</p>
          <a href="#team-grid" className={styles.heroCta}>
            {t('team.bannerCta')}
            <span aria-hidden="true"> ↓</span>
          </a>
        </div>
      </section>

      <div className={styles.stage}>
        {directors.length > 0 && (
          <section className={styles.section} aria-label={t('team.directors')}>
            <h2 className={styles.sectionLabel}>{t('team.directors')}</h2>
            <div className={`${styles.grid} ${styles.gridCenter}`}>
              {directors.map((d) => (
                <TeamBubble key={d.slug} member={d} t={t} />
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} aria-label={t('team.teamMembers')} id="team-grid">
          <h2 className={styles.sectionLabel}>{t('team.teamMembers')}</h2>
          <div className={styles.grid}>
            {members.map((m) => (
              <TeamBubble key={m.slug} member={m} t={t} />
            ))}
          </div>
          <p className={styles.visionNote}>{t('team.visionNote')}</p>
        </section>
      </div>
    </div>
  );
}
