import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { JOB_DATA, COMPANY_INFO, LIFE_AT_VPNEXUES, JOB_IDS, type JobData } from './jobData';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/JobApply.module.css';
import httpClient from '../../api/httpClient';
import { fetchCareerJobs, splitSkills, type CareerJobRow } from '../../api/contentApi';

/** Escapes text so admin-entered content can't inject HTML (aboutRole is rendered as HTML). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * DB-managed job → the JobData shape this page renders. Covers the roles that
 * were never in the static JOB_DATA plus anything the sub-admin adds later.
 */
function rowToJobData(row: CareerJobRow, labels: { roleType: string; location: string; duration: string; stipend: string; whatYoullDo: string }): JobData {
  const sections = row.openings.length
    ? row.openings.map((o) => ({ title: o.role, items: o.responsibilities }))
    : [{ title: labels.whatYoullDo, items: row.responsibilities }];
  const meta = [
    { key: labels.roleType, val: row.type },
    { key: labels.location, val: row.location },
    { key: labels.duration, val: row.duration ?? '—' },
    { key: labels.stipend, val: row.stipend ?? '—' },
    { key: 'Posted', val: 'Recently' },
  ];
  return {
    id: row.slug,
    title: row.title,
    breadcrumb: row.title,
    badges: [row.type, row.location],
    meta,
    aboutRole: escapeHtml(row.about || row.description),
    sections,
    expectations: row.requirements,
    skills: splitSkills(row.skills),
    goodToHave: [],
  };
}

export default function JobApply() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobKey = searchParams.get('job') || '';
  const staticJob = JOB_DATA[jobKey];

  // Jobs the static page doesn't know about (7 legacy roles + anything HR adds)
  // are resolved from the careers API so Apply never dead-ends on "not found".
  const [apiJob, setApiJob] = useState<JobData | null>(null);
  const [apiRows, setApiRows] = useState<CareerJobRow[]>([]);
  const [loading, setLoading] = useState(!staticJob);
  const job = staticJob ?? apiJob;

  const [showOverlay, setShowOverlay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    linkedin: '', github: '', availability: '', source: '',
    whyJoin: '', resume: '',
  });

  useEffect(() => {
    if (staticJob) return;
    let cancelled = false;
    fetchCareerJobs()
      .then((rows) => {
        if (cancelled) return;
        setApiRows(rows);
        const match = rows.find((r) => r.slug === jobKey || r.id === jobKey);
        if (match) {
          setApiJob(
            rowToJobData(match, {
              roleType: t('jobApply.roleType'),
              location: t('jobApply.locationSum'),
              duration: t('jobApply.durationSum'),
              stipend: t('jobApply.stipendSum'),
              whatYoullDo: t('jobApply.whatYoullBeDoing'),
            }),
          );
        }
      })
      .catch(() => {
        // Backend unreachable — fall through to the not-found panel below.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [staticJob, jobKey, t]);

  const relatedJobs = useMemo(() => {
    if (!job) return [];
    // API-sourced job → suggest other API jobs; static job → keep the old list.
    if (!staticJob && apiRows.length) {
      return apiRows
        .filter((r) => r.slug !== jobKey)
        .slice(0, 4)
        .map((r) => ({
          id: r.slug,
          title: r.title,
          // Sidebar renders meta[0] as role type and meta[1] as location.
          meta: [{ key: '', val: r.type }, { key: '', val: r.location }],
          badges: [r.type],
        }));
    }
    return JOB_IDS
      .filter((id) => id !== jobKey)
      .slice(0, 4)
      .map((id) => ({ id, ...JOB_DATA[id] }));
  }, [jobKey, job, staticJob, apiRows]);

  useEffect(() => {
    if (!showOverlay) return;
    const timer = setTimeout(() => navigate('/careers'), 4000);
    return () => clearTimeout(timer);
  }, [showOverlay, navigate]);

  if (!job) {
    if (loading) {
      return (
        <div className={styles.notFound}>
          <div className={styles.notFoundInner} aria-busy="true">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
          </div>
        </div>
      );
    }
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundInner}>
          <i className="fa-solid fa-briefcase" />
          <h2>{t('careers.jobNotFound')}</h2>
          <p>{t('careers.jobNotFoundDesc')}</p>
          <Link to="/careers" className={styles.backLink}>
            <i className="fa-solid fa-arrow-left" /> {t('careers.backToCareers')}
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert(t('careers.fillNameEmail'));
      return;
    }
    if (!form.resume.trim()) {
      alert(t('careers.uploadResume'));
      return;
    }

    setSubmitting(true);

    const timestamp = new Date().toLocaleString('en-IN');

    const backendData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      location: form.location,
      role: jobKey,
      linkedin: form.linkedin,
      github: form.github,
      resume: form.resume,
      availability: form.availability,
      source: form.source,
      whyJoin: form.whyJoin,
      timestamp,
    };

    httpClient
      .post('/api/careers/apply', backendData)
      .then(() => {
        setSubmitting(false);
        setShowOverlay(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        alert(t('jobApply.somethingWrong'));
        setSubmitting(false);
      });
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbInner}>
          <Link to="/">{t('jobApply.breadcrumbHome')}</Link>
          <span className={styles.sep}>/</span>
          <Link to="/careers">{t('jobApply.breadcrumbCareers')}</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{job.breadcrumb}</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── LEFT ── */}
        <div className={styles.leftCol}>

          {/* Job Header */}
          <div className={styles.jobHeader}>
            <div className={styles.headerTop}>
              <div className={styles.headerTopDecor1} />
              <div className={styles.headerTopDecor2} />
              <div className={styles.badgeRow}>
                {job.badges.map((b) => (
                  <span key={b} className={b === job.badges[0] ? `${styles.badge} ${styles.badgeGold}` : styles.badge}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.metaStrip}>
              {job.meta.map((m) => (
                <div key={m.key} className={styles.metaCell}>
                  <span className={styles.metaKey}>{m.key}</span>
                  <span className={styles.metaVal}>{m.val}</span>
                </div>
              ))}
            </div>

            <div className={styles.headerActions}>
              <a href="#apply" className={styles.btnApply}>
                <i className="fa-solid fa-paper-plane" /> {t('jobApply.applyNow')}
              </a>
              <a href={`mailto:${COMPANY_INFO.email}`} className={styles.btnSecondary}>
                <i className="fa-solid fa-envelope" /> {t('jobApply.emailInstead')}
              </a>
              <span className={styles.emailNote}>
                {t('jobApply.orEmail')} <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
              </span>
            </div>
          </div>

          {/* JD Content */}
          <div className={styles.jdCard}>
            {/* About VPNexues */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.aboutCompany')}</div>
              <p>{COMPANY_INFO.about}</p>
              <p>{COMPANY_INFO.mission}</p>
            </div>

            {/* About the Role */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.aboutRole')}</div>
              <p dangerouslySetInnerHTML={{ __html: job.aboutRole }} />
            </div>

            {/* What You'll Do */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.whatYoullBeDoing')}</div>
              {job.sections.map((s) => (
                <div key={s.title}>
                  <div className={styles.subHead}>{s.title}</div>
                  <ul className={styles.bulletList}>
                    {s.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* What We Expect */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.whatWeExpect')}</div>
              <ul className={styles.bulletList}>
                {job.expectations.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <div className={styles.skillWrap}>
                {job.skills.map((s) => (
                  <span key={s} className={`${styles.skillTag} ${styles.skillReq}`}>{s}</span>
                ))}
              </div>
            </div>

            {/* Good to Have */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.goodToHave')}</div>
              <ul className={styles.bulletList}>
                {job.goodToHave.map((g) => <li key={g}>{g}</li>)}
              </ul>
            </div>

            {/* Life at VPNexues */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.lifeAt')}</div>
              <div className={styles.perksGrid}>
                {LIFE_AT_VPNEXUES.map((p) => (
                  <div key={p.name} className={styles.perk}>
                    <div className={styles.perkEmoji}>{p.emoji}</div>
                    <div className={styles.perkName}>{p.name}</div>
                    <div className={styles.perkDesc}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className={styles.jdSection}>
              <div className={styles.sectionLabel}>{t('jobApply.companyInfo')}</div>
              <div className={styles.companyRow}>
                <span className={styles.companyKey}>{t('jobApply.website')}</span>
                <span className={styles.companyVal}><a href="https://www.vpnexues.com" target="_blank" rel="noreferrer">www.vpnexues.com</a></span>
                <span className={styles.companyKey}>{t('jobApply.indiaOffice')}</span>
                <span className={styles.companyVal}>{COMPANY_INFO.indiaOffice}</span>
                <span className={styles.companyKey}>{t('jobApply.singapore')}</span>
                <span className={styles.companyVal}>{COMPANY_INFO.singapore}</span>
                <span className={styles.companyKey}>{t('jobApply.email')}</span>
                <span className={styles.companyVal}><a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a></span>
                <span className={styles.companyKey}>{t('jobApply.phone')}</span>
                <span className={styles.companyVal}>{COMPANY_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* Apply Form */}
          <div className={styles.applyCard} id="apply">
              <div className={styles.applyHead}>
                <div>
                  <h3>{t('jobApply.applyTitle')}</h3>
                  <p>{t('jobApply.applyNote')}</p>
                </div>
                <a href={`mailto:${COMPANY_INFO.email}`} className={styles.btnSecondarySmall}>
                  <i className="fa-solid fa-envelope" /> {t('jobApply.emailInstead')}
                </a>
              </div>
              <div className={styles.applyBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.fullName')}</label>
                    <input type="text" name="name" placeholder={t('jobApply.namePlaceholder')} value={form.name} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.emailLabel')}</label>
                    <input type="email" name="email" placeholder={t('jobApply.emailPlaceholder')} value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.phoneLabel')}</label>
                    <input type="tel" name="phone" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.locationLabel')}</label>
                    <input type="text" name="location" placeholder={t('jobApply.locationPlaceholder')} value={form.location} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.linkedinLabel')}</label>
                    <input type="url" name="linkedin" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.githubLabel')}</label>
                    <input type="url" name="github" placeholder="https://github.com/..." value={form.github} onChange={handleChange} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.availabilityLabel')}</label>
                    <select name="availability" value={form.availability} onChange={handleChange} required>
                      <option value="">{t('jobApply.selectAvailability')}</option>
                      <option value="Immediately">{t('jobApply.immediately')}</option>
                      <option value="Within 2 weeks">{t('jobApply.within2Weeks')}</option>
                      <option value="Within 1 month">{t('jobApply.within1Month')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t('jobApply.sourceLabel')}</label>
                    <select name="source" value={form.source} onChange={handleChange}>
                      <option value="">{t('jobApply.selectSource')}</option>
                      <option>LinkedIn</option>
                      <option>Instagram</option>
                      <option value="Friend / Referral">{t('jobApply.friendReferral')}</option>
                      <option value="College / University">{t('jobApply.collegeUni')}</option>
                      <option value="Other">{t('jobApply.other')}</option>
                    </select>
                  </div>
                </div>
                <div className={`${styles.formGroup} ${styles.mb16}`}>
                  <label>{t('jobApply.whyLabel')}</label>
                  <textarea
                    name="whyJoin"
                    placeholder={t('jobApply.whyPlaceholder')}
                    value={form.whyJoin}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.uploadHint}>
                  <strong>{t('jobApply.uploadHint')}</strong>
                  <ol>
                    <li>{t('jobApply.stepGoTo')} <a href="https://drive.google.com" target="_blank" rel="noreferrer">drive.google.com</a> {t('jobApply.stepSignIn')}</li>
                    <li>{t('jobApply.stepClick')} <strong>{t('jobApply.stepNew')}</strong> {t('jobApply.stepArrow')} <strong>{t('jobApply.stepFileUpload')}</strong> {t('jobApply.stepArrow')} {t('jobApply.stepSelectResume')}</li>
                    <li>{t('jobApply.stepRightClick')} {t('jobApply.stepArrow')} <strong>{t('jobApply.stepShare')}</strong> {t('jobApply.stepArrow')} <strong>{t('jobApply.stepAnyone')}</strong></li>
                    <li>{t('jobApply.stepClick')} <strong>{t('jobApply.stepCopyLink')}</strong> {t('jobApply.stepPaste')}</li>
                  </ol>
                </div>

                <div className={`${styles.formGroup} ${styles.mb16}`}>
                  <label>{t('jobApply.resumeLabel')}</label>
                  <input type="url" name="resume" placeholder="https://drive.google.com/file/d/..." value={form.resume} onChange={handleChange} required />
                </div>

                <div className={styles.submitRow}>
                  <button
                    className={styles.btnSubmit}
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? t('jobApply.submitting') : <><i className="fa-solid fa-paper-plane" /> {t('jobApply.submitApplication')}</>}
                  </button>
                </div>
                <p className={styles.submitNote}>
                  {t('jobApply.orSendResume')} <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
                </p>
              </div>
            </div>
          </div>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          {/* Job Summary */}
          <div className={styles.sCard}>
            <div className={styles.sHead}><h4>{t('jobApply.jobSummary')}</h4></div>
            <div className={styles.sBody}>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-briefcase" />
                <div><div className={styles.sumLabel}>{t('jobApply.roleType')}</div><div className={styles.sumVal}>{job.meta[0]?.val}</div></div>
              </div>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-location-dot" />
                <div><div className={styles.sumLabel}>{t('jobApply.locationSum')}</div><div className={styles.sumVal}>{job.meta[1]?.val}</div></div>
              </div>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-clock" />
                <div><div className={styles.sumLabel}>{t('jobApply.durationSum')}</div><div className={styles.sumVal}>{job.meta[2]?.val}</div></div>
              </div>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-coins" />
                <div><div className={styles.sumLabel}>{t('jobApply.stipendSum')}</div><div className={styles.sumVal}>{job.meta[3]?.val}</div></div>
              </div>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-calendar" />
                <div><div className={styles.sumLabel}>{t('jobApply.posted')}</div><div className={styles.sumVal}>{job.meta[4]?.val}</div></div>
              </div>
              <div className={styles.sumRow}>
                <i className="fa-solid fa-building" />
                <div><div className={styles.sumLabel}>{t('jobApply.industry')}</div><div className={styles.sumVal}>{t('jobApply.industryVal')}</div></div>
              </div>
              <div className={`${styles.sumRow} ${styles.sumRowLast}`}>
                <i className="fa-solid fa-users" />
                <div><div className={styles.sumLabel}>{t('jobApply.teamSize')}</div><div className={styles.sumVal}>{t('jobApply.teamSizeVal')}</div></div>
              </div>
            </div>
          </div>

          {/* Related Jobs */}
          <div className={styles.sCard}>
            <div className={styles.sHead}><h4>{t('jobApply.relatedJobs')}</h4></div>
            <div className={styles.sBody}>
              {relatedJobs.map((r) => (
                <Link
                  key={r.id}
                  to={`/careers/apply?job=${r.id}`}
                  className={`${styles.relLink} ${r.id === jobKey ? styles.relActive : ''}`}
                >
                  <div>
                    <div className={styles.relRole}>{r.title}</div>
                    <div className={styles.relLoc}>{r.meta[1]?.val}</div>
                  </div>
                  <span className={styles.relBadge}>{r.badges[0]}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── FULL-SCREEN SUCCESS OVERLAY ── */}
      {showOverlay && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div className={styles.successCheck}>
              <i className="fa-solid fa-check" />
            </div>
            <h2>{t('jobApply.submittedTitle')}</h2>
            <p>{t('jobApply.thankYou')} <strong>{form.name}</strong></p>
            <p>{t('jobApply.receivedFor')} <strong>{job.title}</strong> {t('jobApply.receivedEnd')}</p>
            <p className={styles.successNote}>{t('jobApply.confirmEmail')}</p>
            <p className={styles.successNote}>{t('jobApply.redirecting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
