import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useLanguage } from '../../i18n/LanguageContext';
import Reveal from '../../components/common/Reveal';
import { fetchCareerJobs, splitSkills, type CareerJobRow } from '../../api/contentApi';
import styles from './css/Careers.module.css';

/* ─── Data ──────────────────────────────────────────────────────────────── */

type IconItem = { title: string; desc: string; icon: string };
type LifeItem = { title: string; desc: string; img: string; farmGrid?: boolean };
type StepItem = { step: number; title: string; desc: string };
type TestimonialItem = { name: string; role: string; avatar: string; quote: string };
type FaqItem = { q: string; a: string };
type StatItem = { value: string; label: string; icon: string };

/** One named role inside a multi-opening job card. */
interface JobOpening {
  role: string;
  type?: string | null;
  responsibilities: string[];
}

/** A job as this page renders it — from the DB (sub-admin managed) or the static fallback. */
interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  icon: string;
  desc: string;
  skills: string[];
  duration?: string | null;
  stipend?: string | null;
  startDate?: string | null;
  about?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  perks: string[];
  openings?: JobOpening[];
}

const JOBS: Job[] = [
  {
    id: 'fullstack', title: 'Full Stack Web Developer Intern', type: 'Internship', location: 'Remote',
    icon: 'fa-solid fa-laptop-code',
    desc: 'Build next-generation dashboards and farmer portals end to end — Node.js + React on the frontend, Java on the backend, and MongoDB for data. Freshers welcome.',
    skills: ['Node.js', 'React', 'Java', 'MongoDB'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Join our engineering team to build real products that connect farmers to global markets. You\'ll work on dashboards, data pipelines, and customer-facing features.',
    responsibilities: ['Build and maintain web applications', 'Write clean, tested code', 'Collaborate with designers and PMs', 'Participate in code reviews'],
    requirements: ['Familiarity with JavaScript/TypeScript', 'Basic understanding of React or Node.js', 'Eagerness to learn', 'Good communication skills'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🏠 Remote-First', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'seo', title: 'SEO Content Writer', type: 'Fresher', location: 'Remote',
    icon: 'fa-solid fa-pen-nib',
    desc: 'Create SEO-optimized blog posts, product descriptions, and website content that drive organic traffic and showcase our organic produce to global audiences.',
    skills: ['SEO Writing', 'Keyword Research', 'Content Strategy', 'Lead Generation'],
    openings: [
      { role: 'SEO Content Writer', type: 'Fresher', responsibilities: ['Write SEO-optimized blog posts', 'Create product descriptions', 'Develop website content', 'Conduct keyword research', 'Analyze content performance'] },
      { role: 'SEO Lead Generation', type: 'Full-Time', responsibilities: ['Conduct prospect research', 'Perform keyword research for leads', 'Generate organic leads', 'Maintain lead database', 'Track SEO-driven conversions'] },
    ],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Lead our content marketing efforts with compelling, SEO-driven content that tells the story of our organic produce and connects with customers worldwide.',
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🏠 Remote-First', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'sales', title: 'Sales & Marketing Executive', type: 'Fresher', location: 'On-Site',
    icon: 'fa-solid fa-bullhorn',
    desc: 'Drive B2B and retail sales while executing marketing campaigns to promote our organic products across India and international markets.',
    skills: ['B2B Sales', 'Digital Marketing', 'Client Relations'],
    openings: [
      { role: 'Sales & Marketing Executive', type: 'Fresher', responsibilities: ['Identify and close B2B deals', 'Execute marketing campaigns', 'Build client relationships', 'Track sales metrics', 'Drive business development'] },
      { role: 'Sales & Marketing Intern', type: 'Internship', responsibilities: ['Support sales outreach', 'Assist with campaigns', 'Engage customers', 'Generate leads', 'Support marketing activities'] },
      { role: 'B2B / Retail Sales Intern', type: 'Internship', responsibilities: ['Assist with B2B outreach', 'Handle retail customer inquiries', 'Follow up on leads', 'Maintain customer database', 'Support product inquiries'] },
    ],
    duration: '6 Months', stipend: '₹10,000 - ₹15,000', startDate: 'ASAP',
    about: 'Drive revenue growth through B2B partnerships and retail channels while building brand awareness through strategic marketing campaigns.',
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship', '🌍 Global Impact'],
  },
  {
    id: 'agriculture', title: 'Agriculture Executive', type: 'Full-Time', location: 'On-Site',
    icon: 'fa-solid fa-tractor',
    desc: 'Manage farmer partnerships, coordinate organic certifications, and ensure quality supply chain operations for our export business.',
    skills: ['Farm Management', 'Supply Chain', 'Organic Certification', 'Crop Monitoring'],
    openings: [
      { role: 'Agriculture Executive', type: 'Full-Time', responsibilities: ['Manage farmer relationships', 'Coordinate organic certifications', 'Ensure quality standards', 'Optimize supply chain', 'Lead farm operations'] },
      { role: 'Agriculture Intern', type: 'Internship', responsibilities: ['Monitor crop health', 'Coordinate with farmers', 'Support organic practices', 'Document farm activities', 'Assist with produce handling'] },
    ],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Work directly with farming communities to ensure quality organic produce meets international standards for our export operations.',
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship', '🌍 Global Impact'],
  },
  {
    id: 'hr', title: 'HR Executive', type: 'Internship', location: 'Remote & On-Site',
    icon: 'fa-solid fa-users',
    desc: 'Manage recruitment, employee relations, and HR operations to build and sustain a motivated team across our farm and office locations.',
    skills: ['Recruitment', 'Employee Relations', 'HR Operations', 'Documentation'],
    openings: [
      { role: 'HR Executive', type: 'Internship', responsibilities: ['Manage end-to-end recruitment', 'Handle employee relations', 'Implement HR policies', 'Organize team events', 'Lead HR operations'] },
      { role: 'HR Intern', type: 'Internship', responsibilities: ['Screen resumes', 'Coordinate interviews', 'Maintain employee records', 'Assist with HR admin', 'Support onboarding documentation'] },
    ],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Build and sustain a world-class team by managing recruitment, employee engagement, and HR operations across our locations.',
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship', '🌍 Global Impact'],
  },
  {
    id: 'accountant', title: 'Accountant', type: 'Fresher', location: 'On-Site',
    icon: 'fa-solid fa-calculator',
    desc: 'Manage bookkeeping, invoicing, and financial records to keep our farm-to-table export operations running smoothly and profitably.',
    skills: ['Tally', 'GST', 'Bookkeeping', 'MS Excel'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Keep our financial operations running smoothly by managing books, invoices, and compliance for our growing export business.',
    responsibilities: ['Maintain financial records', 'Process invoices', 'Handle GST compliance', 'Generate financial reports'],
    requirements: ['Commerce background', 'Tally/Excel proficiency', 'Attention to detail', 'Basic accounting knowledge'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship', '🌍 Global Impact'],
  },
  {
    id: 'customer-support', title: 'Customer Support Intern', type: 'Internship', location: 'Remote',
    icon: 'fa-solid fa-headset',
    desc: 'Support customers with product inquiries, orders, delivery questions and service requests while maintaining a professional customer experience.',
    skills: ['Customer Support', 'Communication', 'Order Support', 'Problem Solving'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Be the first point of contact for our customers, ensuring they receive prompt and professional support for all their queries.',
    responsibilities: ['Handle customer inquiries', 'Process order requests', 'Resolve service issues', 'Document customer feedback'],
    requirements: ['Excellent communication', 'Patient and empathetic', 'Basic computer skills', 'Problem-solving attitude'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🏠 Remote-First', '🌴 Team Retreats', '👨‍🏫 Mentorship'],
  },
  {
    id: 'supply-chain', title: 'Supply Chain Intern', type: 'Internship', location: 'Hybrid & On-Site',
    icon: 'fa-solid fa-truck-fast',
    desc: 'Assist with inventory coordination, supplier communication, order movement and day-to-day farm-to-customer supply chain operations.',
    skills: ['Supply Chain', 'Inventory', 'Logistics', 'Coordination'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Learn the end-to-end supply chain process from farm to customer, ensuring timely delivery of fresh organic produce.',
    responsibilities: ['Track inventory levels', 'Coordinate with suppliers', 'Monitor order shipments', 'Update supply chain data'],
    requirements: ['Organizational skills', 'Basic Excel knowledge', 'Attention to detail', 'Willing to work on-site'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'ea-director', title: 'Executive Assistant to Director', type: 'Full-Time', location: 'Remote & On-Site',
    icon: 'fa-solid fa-briefcase',
    desc: 'Support the Director with scheduling, meeting coordination, documentation, communication and follow-up of important business activities.',
    skills: ['Scheduling', 'Documentation', 'Communication', 'Coordination'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Be the right hand to our Director, managing their schedule and ensuring smooth day-to-day operations.',
    responsibilities: ['Manage director calendar', 'Coordinate meetings', 'Prepare documents', 'Handle correspondence'],
    requirements: ['Excellent organizational skills', 'Strong communication', 'MS Office proficiency', 'Discretion and professionalism'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'pa-director', title: 'Personal Assistant to Director', type: 'Full-Time', location: 'Remote & On-Site',
    icon: 'fa-solid fa-user-tie',
    desc: 'Assist the Director with daily schedules, correspondence, meeting preparation, reminders and administrative coordination.',
    skills: ['Time Management', 'Communication', 'Scheduling', 'Administration'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Provide comprehensive personal and administrative support to ensure the Director operates efficiently.',
    responsibilities: ['Manage daily schedules', 'Handle personal correspondence', 'Set reminders', 'Coordinate travel'],
    requirements: ['Strong time management', 'Excellent communication', 'Proactive attitude', 'High level of organization'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'quality', title: 'Produce Quality / Food Quality Intern', type: 'Internship', location: 'On-Site',
    icon: 'fa-solid fa-magnifying-glass-chart',
    desc: 'Assist in inspecting fresh produce, maintaining quality standards, checking handling practices and supporting food-quality documentation.',
    skills: ['Quality Inspection', 'Food Quality', 'Documentation', 'Fresh Produce'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Ensure our organic produce meets the highest quality standards through inspection and documentation.',
    responsibilities: ['Inspect fresh produce', 'Document quality checks', 'Monitor handling practices', 'Support quality reports'],
    requirements: ['Attention to detail', 'Basic food safety knowledge', 'Good documentation skills', 'Willing to work on-site'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'procurement', title: 'Procurement Intern', type: 'Internship', location: 'On-Site',
    icon: 'fa-solid fa-cart-shopping',
    desc: 'Support product sourcing, supplier coordination, purchase tracking and procurement documentation for agricultural and grocery supplies.',
    skills: ['Procurement', 'Vendor Management', 'Sourcing', 'Purchase Tracking'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Learn the procurement process from sourcing to purchase, working with agricultural suppliers and vendors.',
    responsibilities: ['Assist with vendor outreach', 'Track purchase orders', 'Maintain procurement records', 'Support sourcing activities'],
    requirements: ['Analytical skills', 'Basic Excel knowledge', 'Good negotiation skills', 'Attention to detail'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'digital-marketing', title: 'Digital Marketing Intern', type: 'Internship', location: 'Remote',
    icon: 'fa-solid fa-chart-line',
    desc: 'Assist with digital campaigns, social media activities, content promotion, analytics and online brand visibility.',
    skills: ['Digital Marketing', 'Social Media', 'Content Marketing', 'Analytics'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Support our digital marketing efforts across social media, content, and online campaigns.',
    responsibilities: ['Manage social media posts', 'Assist with campaigns', 'Track analytics', 'Create content'],
    requirements: ['Social media familiarity', 'Creative mindset', 'Basic analytics knowledge', 'Good writing skills'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🏠 Remote-First', '🌴 Team Retreats', '👨‍🏫 Mentorship'],
  },
  {
    id: 'android-dev', title: 'Android Developer', type: 'Internship', location: 'Remote',
    icon: 'fa-brands fa-android',
    desc: 'Develop and maintain Android applications, integrate APIs, improve application performance and collaborate with the development team.',
    skills: ['Kotlin', 'Android SDK', 'REST APIs', 'Firebase'],
    duration: '6 Months', stipend: 'Based on the performance', startDate: 'ASAP',
    about: 'Build mobile applications that connect farmers and customers across our organic supply chain.',
    responsibilities: ['Develop Android features', 'Integrate REST APIs', 'Fix bugs', 'Optimize performance'],
    requirements: ['Android development experience', 'Kotlin/Java proficiency', 'API integration', 'Problem-solving skills'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🏠 Remote-First', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship'],
  },
  {
    id: 'b2b-sales', title: 'B2B / Retail Sales Executive Intern', type: 'Internship', location: 'On-Site & Field',
    icon: 'fa-solid fa-handshake',
    desc: 'Identify and connect with potential B2B and retail customers, generate and follow up on sales leads, and achieve assigned sales targets for VPNexues.',
    skills: ['B2B Sales', 'Lead Generation', 'Negotiation', 'Communication'],
    duration: '6 Months', stipend: '₹10,000 - ₹15,000', startDate: 'ASAP',
    about: 'Drive B2B and retail sales growth by connecting with customers, nurturing leads, and hitting targets for our organic product range.',
    responsibilities: ['Identify B2B and retail prospects', 'Generate and follow up leads', 'Promote organic products', 'Track sales targets', 'Maintain the lead database'],
    requirements: ['Good communication skills', 'Target-driven mindset', 'Basic computer skills', 'Willingness to work remotely and in the field'],
    perks: ['🌱 Farm Fresh Produce', '📚 Learning Budget', '🌴 Team Retreats', '💰 Growth Bonuses', '👨‍🏫 Mentorship', '🌍 Global Impact'],
  },
];

/**
 * The static list keyed by id. It doubles as the offline fallback AND as the
 * baseline the translation overlay is compared against (see displayJob).
 */
const BASELINE: Record<string, Job> = Object.fromEntries(JOBS.map((j) => [j.id, j]));

/** DB row → the shape this page renders. `slug` is the public/translation key. */
function toJob(row: CareerJobRow): Job {
  return {
    id: row.slug || row.id,
    title: row.title,
    type: row.type,
    location: row.location,
    icon: row.icon || 'fa-solid fa-briefcase',
    desc: row.description,
    skills: splitSkills(row.skills),
    duration: row.duration,
    stipend: row.stipend,
    startDate: row.startDate,
    about: row.about,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    perks: row.perks,
    openings: row.openings,
  };
}

/* ─── ApplyDropdown (portal-based) ──────────────────────────────────────── */

const LABEL_KEYS: Record<string, string> = {
  Internship: 'internship', Fresher: 'fresher', 'Full-Time': 'fullTime',
  Hybrid: 'hybrid', Remote: 'remote', 'On-Site': 'onSite', 'Remote / Field': 'remoteField',
  'On-Site & Field': 'onSiteField', 'Remote & On-Site': 'remoteOnSite', 'Hybrid & On-Site': 'hybridOnSite',
};

function ApplyDropdown({ openings, jobId }: { openings: { role: string }[]; jobId: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const navigate = useNavigate();
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const position = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const dropW = 240;
    let left = r.left;
    if (left + dropW > window.innerWidth - 12) left = window.innerWidth - dropW - 12;
    if (left < 12) left = 12;
    const spaceBelow = window.innerHeight - r.bottom;
    const dropH = openings.length * 40 + 48;
    const top = spaceBelow > dropH + 8 ? r.bottom + 8 : r.top - dropH - 8;
    setPos({ top, left, width: Math.max(r.width, dropW) });
  }, [openings.length]);

  /* Outside-click / outside-tap handler */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || dropRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => position();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open, position]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const handleOptionClick = (e: React.MouseEvent, _role: string) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/careers/apply?job=${jobId}`);
  };

  /* Desktop hover: only apply on non-touch devices */
  const handleBtnEnter = () => { if (!isTouchDevice) setOpen(true); };

  return (
    <div
      className={styles.applyDropdown}
      onMouseEnter={handleBtnEnter}
    >
      <button
        ref={btnRef as unknown as React.RefObject<HTMLButtonElement>}
        type="button"
        className={styles.applyBtn}
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t('careers.applyNow')}
      </button>
      {open && createPortal(
        <div
          ref={dropRef}
          className={styles.applyPopover}
          role="menu"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 1000 }}
        >
          <div className={styles.applyPopoverTitle}>{t('careers.selectRole')}</div>
          {openings.map((o, i) => (
            <button
              key={i}
              type="button"
              className={styles.applyPopoverOption}
              role="menuitem"
              onClick={(e) => handleOptionClick(e as unknown as React.MouseEvent, o.role)}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
            >
              {o.role}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

/** Smooth SVG path through a list of points (Catmull-Rom → cubic Bézier). */
function smoothPathThrough(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  const r1 = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)}, ${r1(c2x)} ${r1(c2y)}, ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

/** Extend the first/last points outward along their segment so the line overshoots the end nodes. */
function extendEnds(pts: Array<{ x: number; y: number }>, dist: number): Array<{ x: number; y: number }> {
  if (pts.length < 2) return pts;
  const ext = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / len) * dist, y: a.y + (dy / len) * dist };
  };
  return [ext(pts[0], pts[1]), ...pts, ext(pts[pts.length - 1], pts[pts.length - 2])];
}

export default function Careers() {
  const { t, tRaw, lang } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  // Static list until the API answers; an empty array from the server is trusted
  // (that is how sub-admin deletions reach this page).
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchCareerJobs()
      .then((rows) => {
        if (!cancelled) setJobs(rows.map(toJob));
      })
      .catch(() => {
        // Backend unreachable — keep the static fallback so the page still renders.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const arr = <T,>(key: string): T[] => {
    const v = tRaw(key);
    return Array.isArray(v) ? (v as T[]) : [];
  };
  const jobTypeLabel = (value: string): string => {
    const k = LABEL_KEYS[value];
    return k ? t(`careers.jobTypes.${k}`) : value;
  };

  /** True when two values are structurally identical (order-sensitive). */
  const same = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

  const displayJob = (job: Job) => {
    const base = BASELINE[job.id];
    /** Translation wins only while the stored value still matches the untouched default. */
    const localized = <F,>(field: string, current: F): F => {
      if (!base || !same(current, (base as unknown as Record<string, F>)[field])) return current;
      const v = tRaw(`careers.jobs.${job.id}.${field}`);
      return v !== undefined && v !== null ? (v as F) : current;
    };
    const translatedOpenings = job.openings?.map((o, i) => {
      const key = `careers.jobs.${job.id}.openings.${i}`;
      const role = tRaw(`${key}.role`);
      const resp = tRaw(`${key}.responsibilities`);
      const baseOpening = base?.openings?.[i];
      return {
        ...o,
        role: same(o.role, baseOpening?.role) && typeof role === 'string' ? role : o.role,
        responsibilities:
          same(o.responsibilities, baseOpening?.responsibilities) && Array.isArray(resp)
            ? (resp as string[])
            : o.responsibilities,
      };
    });
    return {
      ...job,
      title: localized('title', job.title),
      desc: localized('desc', job.desc),
      about: job.about == null ? job.about : localized('about', job.about),
      responsibilities:
        job.responsibilities == null ? job.responsibilities : localized('responsibilities', job.responsibilities),
      requirements:
        job.requirements == null ? job.requirements : localized('requirements', job.requirements),
      skills: localized('skills', job.skills),
      perks: localized('perks', job.perks),
      openings: translatedOpenings,
      typeLabel: jobTypeLabel(job.type),
      locationLabel: jobTypeLabel(job.location),
      // Per-job labels: keep the translated wording while the value is untouched,
      // show the stored text verbatim once the sub-admin edits it.
      durationLabel:
        job.duration == null || same(job.duration, base?.duration)
          ? t('careers.duration6Months')
          : job.duration,
      stipendLabel:
        job.stipend == null || same(job.stipend, base?.stipend)
          ? job.id === 'sales' || job.id === 'b2b-sales'
            ? t('careers.stipendRange')
            : t('careers.stipendUnpaid')
          : job.stipend,
      startDateLabel:
        job.startDate == null || same(job.startDate, base?.startDate)
          ? t('careers.startDateAsap')
          : job.startDate,
    };
  };

  const STATS = arr<StatItem>('careers.stats');
  const WHY_JOIN = arr<IconItem>('careers.whyJoin');
  const LIFE_AT = arr<LifeItem>('careers.lifeItems');
  const MISSION = arr<IconItem>('careers.missionItems');
  const BENEFITS = arr<IconItem>('careers.benefitItems');
  const HIRING_STEPS = arr<StepItem>('careers.hiringSteps');
  const TESTIMONIALS = arr<TestimonialItem>('careers.testimonials');
  const VALUES = arr<IconItem>('careers.valueItems');
  const FAQ = arr<FaqItem>('careers.faqItems');

  /* Hiring-path connector: SVG curve threading through the six node centers.
     Recomputed on layout changes so the line always connects the circles. */
  const pathTimelineRef = useRef<HTMLDivElement>(null);
  const [pathD, setPathD] = useState('');
  const computePath = useCallback(() => {
    const el = pathTimelineRef.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
      setPathD('');
      return;
    }
    const nums = Array.from(el.querySelectorAll(`.${styles.pathNum}`)) as HTMLElement[];
    if (nums.length < 2) {
      setPathD('');
      return;
    }
    const box = el.getBoundingClientRect();
    const centers = nums.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    setPathD(smoothPathThrough(extendEnds(centers, 56)));
  }, []);

  useEffect(() => {
    const el = pathTimelineRef.current;
    if (!el) return;
    computePath();
    const raf = requestAnimationFrame(computePath);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => computePath());
      ro.observe(el);
    }
    window.addEventListener('resize', computePath);
    let cancelled = false;
    if (document.fonts && document.fonts.ready) {
      void document.fonts.ready.then(() => { if (!cancelled) computePath(); });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', computePath);
    };
  }, [computePath, lang, HIRING_STEPS.length]);
  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <Reveal>
            <div className={styles.heroEyebrow}>
              <i className="fa-solid fa-seedling" /> {t('careers.heroEyebrow')}
            </div>
            <h1>
              {t('careers.heroTitle')}<br />
              <span className={styles.heroHighlight}>{t('careers.heroHighlight')}</span>
            </h1>
            <p className={styles.heroDesc}>
              {t('careers.heroDesc').split(/(growth[‐‑-]focused)/).map((part, i) =>
                /^growth[‐‑-]focused$/.test(part)
                  ? <span key={i} className={styles.nowrapWord}>{part}</span>
                  : <span key={i}>{part}</span>,
              )}
            </p>
            <a href="#open-positions" className={styles.heroBtn}>
              <i className="fa-solid fa-briefcase" /> {t('careers.viewOpenRoles')}
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.stats}>
        <Reveal>
          <div className={styles.statsInner}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statIcon}><i className={s.icon} /></div>
                <div className={styles.statNum}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Why Join ── */}
      <section className={`${styles.secPad} ${styles.whySection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.whyVpnexues')}</div>
              <p>{t('careers.whyDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.whyGrid}>
            {WHY_JOIN.map((w) => (
              <Reveal key={w.title}>
                <div className={styles.whyCard}>
                  <div className={styles.whyIcon}><i className={w.icon} /></div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Life At ── */}
      <section className={`${styles.secPad} ${styles.lifeSection}`} id="life-at">
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.culture')}</div>
              <h2>{t('careers.lifeAt')} <span>VPNexues</span></h2>
              <p>{t('careers.lifeDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.lifeGrid}>
            {LIFE_AT.map((item) => (
              <Reveal key={item.title}>
                <div className={styles.lifeCard}>
                  {item.farmGrid ? (
                    <div className={styles.farmGrid}>
                      <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001510/vpnexues/old/site-assets/careers/farm-visit-1.jpg" alt="Farm Visit 1" />
                      <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001512/vpnexues/old/site-assets/careers/farm-visit-2.jpg" alt="Farm Visit 2" />
                      <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001514/vpnexues/old/site-assets/careers/farm-visit-3.jpg" alt="Farm Visit 3" />
                    </div>
                  ) : (
                    <img src={item.img} alt={item.title} />
                  )}
                  <div className={styles.lifeOverlay}>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className={styles.lifeSwiper}>
            <Swiper
              modules={[Autoplay, Pagination]}
              loop
              speed={500}
              slidesPerView={2}
              spaceBetween={20}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
            >
              {LIFE_AT.map((item) => (
                <SwiperSlide key={item.title}>
                  <div className={styles.lifeCard}>
                    {item.farmGrid ? (
                      <div className={styles.farmGrid}>
                        <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001510/vpnexues/old/site-assets/careers/farm-visit-1.jpg" alt="Farm Visit 1" />
                        <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001512/vpnexues/old/site-assets/careers/farm-visit-2.jpg" alt="Farm Visit 2" />
                        <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001514/vpnexues/old/site-assets/careers/farm-visit-3.jpg" alt="Farm Visit 3" />
                      </div>
                    ) : (
                      <img src={item.img} alt={item.title} />
                    )}
                    <div className={styles.lifeOverlay}>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className={`${styles.secPad} ${styles.missionSection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.ourMission')}</div>
              <h2>{t('careers.empowering')} <span>{t('careers.farmers')}</span></h2>
              <p>{t('careers.missionDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.missionGrid}>
            {MISSION.map((m) => (
              <Reveal key={m.title}>
                <div className={styles.missionCard}>
                  <i className={m.icon} />
                  <h4>{m.title}</h4>
                  <p>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className={`${styles.secPad} ${styles.benefitsSection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.perks')}</div>
              <h2>{t('careers.benefitsTitle')} <span>{t('careers.perksWord')}</span></h2>
              <p>{t('careers.benefitsDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.hangBand}>
            {BENEFITS.map((b, idx) => (
              <Reveal key={b.title} delay={(idx % 4) * 0.06} className={styles.hangReveal}>
                <div
                  className={`${styles.hangItem} ${idx % 2 ? styles.hangLow : styles.hangHigh}`}
                  style={{ animationDelay: `${(idx * 0.55).toFixed(2)}s` }}
                >
                  <div className={styles.hangString} aria-hidden="true" />
                  <div className={styles.hangTag}>
                    <span className={styles.hangPin} aria-hidden="true" />
                    <span className={styles.hangNum}>{String(idx + 1).padStart(2, '0')}</span>
                    <h5>{b.title}</h5>
                    <p>{b.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hiring Process: your path starts here ── */}
      <section className={`${styles.secPad} ${styles.hiringSection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.pathHead}>
              <h2>
                <span className={styles.pathTitleLine1}>{t('careers.pathTitleLine1')}</span>
                <span className={styles.pathTitleLine2}>{t('careers.pathTitleLine2')}</span>
              </h2>
              <p>{t('careers.pathSub')}</p>
            </div>
          </Reveal>
          <div className={styles.pathTimeline} ref={pathTimelineRef}>
            <svg className={styles.pathSvg} aria-hidden="true" focusable="false">
              <path d={pathD} className={styles.pathSvgLine} fill="none" />
            </svg>
            {HIRING_STEPS.map((s, i) => (
              <Reveal key={s.step} onAnimationComplete={computePath}>
                <div className={`${styles.pathStep} ${i % 2 === 0 ? styles.pathBelow : styles.pathAbove}`}>
                  <div className={styles.pathNum}>{String(s.step).padStart(2, '0')}</div>
                  <h5>{s.title}</h5>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={`${styles.secPad} ${styles.testimonialsSection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.voices')}</div>
              <h2>{t('careers.whatTeamSays')} <span>{t('careers.teamSays')}</span></h2>
              <p>{t('careers.teamDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.voicesGrid}>
            {TESTIMONIALS.map((tm) => (
              <Reveal key={tm.name}>
                <div className={styles.voice}>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} className="fa-solid fa-star" />
                    ))}
                  </div>
                  <blockquote>"{tm.quote}"</blockquote>
                  <div className={styles.voiceAuthor}>
                    <div className={styles.avatar}>
                      <img src={tm.avatar} alt={tm.name} loading="lazy" />
                    </div>
                    <div>
                      <h5>{tm.name}</h5>
                      <span>{tm.role}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className={`${styles.secPad} ${styles.valuesSection}`}>
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.ourDna')}</div>
              <h2>{t('careers.coreValues')} <span>{t('careers.valuesWord')}</span></h2>
              <p>{t('careers.valuesDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <Reveal key={v.title}>
                <div className={styles.value}>
                  <i className={v.icon} />
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`${styles.secPad} ${styles.faqSection}`}>
        <div className="container">
          <div className={styles.faqLayout}>
            <Reveal className={styles.faqLeft}>
              <div className={styles.secTitle}>
                <div className={styles.secSub}>{t('careers.questions')}</div>
                <h2>{t('careers.frequentlyAsked')} <span>{t('careers.asked')}</span></h2>
                <p>{t('careers.faqDesc')}</p>
              </div>
              <div className={styles.faqVisual}>
                <div className={styles.faqBadge}>
                  <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" />
                  </svg>
                </div>
                <div className={styles.faqStatRow}>
                  <div className={styles.faqStat}>
                    <span className={styles.faqStatNum}>50+</span>
                    <span className={styles.faqStatLabel}>{t('careers.teamMembers')}</span>
                  </div>
                  <div className={styles.faqStat}>
                    <span className={styles.faqStatNum}>24h</span>
                    <span className={styles.faqStatLabel}>{t('careers.responseTime')}</span>
                  </div>
                </div>
                <Link to="/contact" className={styles.faqSupportBtn}>
                  <i className="fa-solid fa-headset" /> {t('careers.getSupport')} <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </Reveal>
            <div className={styles.faqRight}>
              <div className={styles.faqList}>
                {FAQ.map((item, i) => (
                  <div key={i} className={`${styles.faqItem} ${activeFaq === i ? styles.faqItemActive : ''}`}>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      aria-expanded={activeFaq === i}
                      aria-controls={`careers-faq-${i}`}
                    >
                      <span className={styles.faqNum}>{String(i + 1).padStart(2, '0')}</span>
                      {item.q}
                      <i className="fa-solid fa-plus" />
                    </button>
                    <div className={styles.faqAnswer} id={`careers-faq-${i}`}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section className={`${styles.secPad} ${styles.positionsSection}`} id="open-positions">
        <div className="container">
          <Reveal>
            <div className={styles.secTitle}>
              <div className={styles.secSub}>{t('careers.opportunities')}</div>
              <h2>{t('careers.openPositions')} <span>{t('careers.positionsTitle')}</span></h2>
              <p>{t('careers.positionsDesc')}</p>
            </div>
          </Reveal>
          <div className={styles.tnOnlyNotice} role="note">
            <div className={styles.tnOnlyNoticeTitle}>
              <i className="fa-solid fa-circle-info" /> {t('careers.tnOnlyTitle')}
            </div>
            <p className={styles.tnOnlyNoticeDesc}>{t('careers.tnOnlyDesc')}</p>
          </div>
          <div className={styles.posGrid}>
            {jobs.map((rawJob) => {
              const job = displayJob(rawJob);
              return (
              <Reveal key={job.id}>
                <div className={styles.pos}>
                  <div className={styles.posTop}>
                    <div className={styles.posIcon}>
                      <i className={job.icon} aria-hidden="true" />
                    </div>
                    <div>
                      <h4>{job.title}</h4>
                      <div className={styles.posMeta}>
                        <span><i className="fa-solid fa-clock" /> {job.typeLabel}</span>
                        <span><i className="fa-solid fa-location-dot" /> {job.locationLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.posDesc}>{job.desc}</p>
                  <div className={styles.posSkills}>
                    {job.skills.map((s) => <span key={s}>{s}</span>)}
                  </div>
                  {(() => {
                    const jobOpenings = job.openings?.length ? job.openings : [{ role: job.title }];
                    const isMulti = jobOpenings.length > 1;
                    return (
                      <>
                        <div className={styles.posOpenings}>
                          <span className={styles.openingsLabel}>{isMulti ? t('careers.openings') : t('careers.opening')}</span>
                          {jobOpenings.map((o, i) => (
                            <span key={i} className={styles.openingTag}>{o.role}</span>
                          ))}
                        </div>
                        <div className={styles.posBtns}>
                          {isMulti ? (
                            <ApplyDropdown openings={job.openings!} jobId={rawJob.id} />
                          ) : (
                            <button
                              type="button"
                              className={styles.applyBtn}
                              onClick={() => navigate(`/careers/apply?job=${rawJob.id}`)}
                            >
                              {t('careers.applyNow')}
                            </button>
                          )}
                          <button className={styles.detailBtn} type="button" onClick={() => setSelectedJob(rawJob)}>
                            {t('careers.details')}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <Reveal>
            <h2>{t('careers.readyToMake')} <span>{t('careers.difference')}</span></h2>
            <p className={styles.ctaDesc}>{t('careers.ctaDesc')}</p>
            <a href="#open-positions" className={styles.ctaBtn}>
              <i className="fa-solid fa-paper-plane" /> {t('careers.applyNow')}
            </a>
            <div className={styles.ctaContact}>
              <a href="mailto:support@vpnexues.com"><i className="fa-solid fa-envelope" /> support@vpnexues.com</a>
              <a href="tel:+917810077636"><i className="fa-solid fa-phone" /> +91 78100 77636</a>
              <span><i className="fa-solid fa-location-dot" /> {t('careers.ctaLocation')}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Job Detail Modal ── */}
      {selectedJob && (() => {
        const sj = displayJob(selectedJob);
        return (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedJob(null); }}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <button className={styles.modalClose} onClick={() => setSelectedJob(null)} aria-label="Close">
                <i className="fa-solid fa-times" />
              </button>
              <div className={styles.modalHeaderContent}>
                <div className={styles.modalHeaderIcon}>
                  <i className={sj.icon} aria-hidden="true" />
                </div>
                <div>
                  <h3>{sj.title}</h3>
                  <div className={styles.modalBadges}>
                    <span>{sj.typeLabel}</span>
                    <span>{sj.locationLabel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalInfoGrid}>
                <div className={styles.modalInfoItem}><div className={styles.modalInfoLabel}>{t('careers.duration')}</div><div className={styles.modalInfoValue}>{sj.durationLabel}</div></div>
                <div className={styles.modalInfoItem}><div className={styles.modalInfoLabel}>{t('careers.stipend')}</div><div className={styles.modalInfoValue}>{sj.stipendLabel}</div></div>
                <div className={styles.modalInfoItem}><div className={styles.modalInfoLabel}>{t('careers.location')}</div><div className={styles.modalInfoValue}>{sj.locationLabel}</div></div>
                <div className={styles.modalInfoItem}><div className={styles.modalInfoLabel}>{t('careers.startDate')}</div><div className={styles.modalInfoValue}>{sj.startDateLabel}</div></div>
              </div>
              <div className={styles.modalSection}><h4>{t('careers.aboutRole')}</h4><p>{sj.about}</p></div>

              {sj.openings && sj.openings.length > 1 ? (
                sj.openings.map((opening, idx) => (
                  <div key={idx} className={styles.modalOpeningSection}>
                    <h4 className={styles.modalOpeningTitle}>{opening.role} <span className={styles.modalOpeningType}>({jobTypeLabel(opening.type)})</span></h4>
                    <div className={styles.modalSection}>
                      <h5>{t('careers.responsibilities')}</h5>
                      <ul>{opening.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className={styles.modalSection}>
                    <h4>{t('careers.whatYoullDo')}</h4>
                    <ul>{sj.responsibilities?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                  <div className={styles.modalSection}>
                    <h4>{t('careers.requirements')}</h4>
                    <ul>{sj.requirements?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                </>
              )}

              <div className={styles.modalSection}>
                <h4>{t('careers.skills')}</h4>
                <div className={styles.modalSkills}>{sj.skills.map((s) => <span key={s}>{s}</span>)}</div>
              </div>
              <div className={styles.modalSection}>
                <h4>{t('careers.modalPerks')}</h4>
                <div className={styles.modalPerksGrid}>{sj.perks.map((p, i) => <div key={i} className={styles.modalPerk}>{p}</div>)}</div>
              </div>
              {sj.openings && sj.openings.length > 1 ? (
                <div className={styles.modalApplyGroup}>
                  {sj.openings.map((_o, i) => (
                    <button key={i} type="button" className={styles.modalApplyBtn} onClick={() => { setSelectedJob(null); navigate(`/careers/apply?job=${sj.id}`); }}>
                      {t('careers.applyFor')} {_o.role}
                    </button>
                  ))}
                </div>
              ) : (
                <button type="button" className={styles.modalApplyBtn} onClick={() => { setSelectedJob(null); navigate(`/careers/apply?job=${sj.id}`); }}>
                  {t('careers.applyNow')}
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
