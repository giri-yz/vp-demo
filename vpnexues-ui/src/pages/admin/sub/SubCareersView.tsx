import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faPenToSquare, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import * as adminContentApi from '../../../api/adminContentApi';
import type { CareerJobRow } from '../../../api/contentApi';
import Modal from '../../../components/admin/Modal';
import { useToast } from '../../../components/admin/Toast';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import { getErrorMessage } from '../../../utils/errors';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import styles from './SubCareersView.module.css';

/** Newline-separated textareas are converted to string[] on save. */
function toLines(v: string): string[] {
  return v
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function fromLines(v: string[] | undefined | null): string {
  return (v ?? []).join('\n');
}

interface OpeningFormState {
  role: string;
  type: string;
  /** Newline-separated. */
  responsibilities: string;
}

interface CareerJobFormState {
  title: string;
  type: string;
  location: string;
  icon: string;
  description: string;
  skills: string;
  duration: string;
  stipend: string;
  startDate: string;
  about: string;
  /** Newline-separated. */
  responsibilities: string;
  /** Newline-separated. */
  requirements: string;
  /** Newline-separated. */
  perks: string;
  openings: OpeningFormState[];
  active: boolean;
  displayOrder: string;
}

const EMPTY_JOB: CareerJobFormState = {
  title: '',
  type: '',
  location: '',
  icon: '',
  description: '',
  skills: '',
  duration: '',
  stipend: '',
  startDate: '',
  about: '',
  responsibilities: '',
  requirements: '',
  perks: '',
  openings: [],
  active: true,
  displayOrder: '',
};

export default function SubCareersView({ config }: { config: { name: string; code: string } }) {
  const { admin } = useAdminAuth();
  const canEdit = !!admin;
  const canDelete = !!admin;
  const [jobs, setJobs] = useState<CareerJobRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobModal, setJobModal] = useState<'create' | CareerJobRow | null>(null);
  const [jobForm, setJobForm] = useState<CareerJobFormState>(EMPTY_JOB);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    adminContentApi
      .listCareerJobsAdmin()
      .then((rows) => {
        setJobs(rows);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load career jobs.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function closeModals() {
    setJobModal(null);
    setFormError('');
  }

  function openJobCreate() {
    setJobForm(EMPTY_JOB);
    setFormError('');
    setJobModal('create');
  }

  function openJobEdit(job: CareerJobRow) {
    setJobForm({
      title: job.title,
      type: job.type,
      location: job.location,
      icon: job.icon ?? '',
      description: job.description,
      skills: job.skills,
      duration: job.duration ?? '',
      stipend: job.stipend ?? '',
      startDate: job.startDate ?? '',
      about: job.about ?? '',
      responsibilities: fromLines(job.responsibilities),
      requirements: fromLines(job.requirements),
      perks: fromLines(job.perks),
      openings: job.openings.map((o) => ({
        role: o.role,
        type: o.type ?? '',
        responsibilities: fromLines(o.responsibilities),
      })),
      active: job.active,
      displayOrder: String(job.displayOrder),
    });
    setFormError('');
    setJobModal(job);
  }

  async function handleJobSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = jobForm.title.trim();
    if (!title) {
      setFormError('Job title is required.');
      return;
    }
    setSaving(true);
    // Only send openings the admin actually filled in — a card with no role is noise.
    const openings = jobForm.openings
      .filter((o) => o.role.trim() !== '')
      .map((o) => ({
        role: o.role.trim(),
        type: o.type.trim() || null,
        responsibilities: toLines(o.responsibilities),
      }));
    const payload = {
      title,
      type: jobForm.type.trim(),
      location: jobForm.location.trim(),
      icon: jobForm.icon.trim() || undefined,
      description: jobForm.description.trim(),
      skills: jobForm.skills.trim(),
      duration: jobForm.duration.trim() || undefined,
      stipend: jobForm.stipend.trim() || undefined,
      startDate: jobForm.startDate.trim() || undefined,
      about: jobForm.about.trim() || undefined,
      responsibilities: toLines(jobForm.responsibilities),
      requirements: toLines(jobForm.requirements),
      perks: toLines(jobForm.perks),
      openings,
      active: jobForm.active,
      displayOrder:
        jobForm.displayOrder.trim() !== '' ? Number(jobForm.displayOrder) : undefined,
    };
    try {
      if (jobModal && jobModal !== 'create') {
        await adminContentApi.updateCareerJob(jobModal.id, payload);
        notify('Job updated.');
      } else {
        await adminContentApi.createCareerJob(payload);
        notify('Job added.');
      }
      closeModals();
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(job: CareerJobRow) {
    if (!window.confirm(`Remove "${job.title}"? It will disappear from the public careers page.`)) return;
    try {
      await adminContentApi.deleteCareerJob(job.id);
      load();
      notify('Job removed.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not remove job.'));
    }
  }

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => q === '' || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q))
      .sort((a, b) => a.displayOrder - b.displayOrder || Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [jobs, query]);

  return (
    <div>
      <ScrollReveal>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <div>
              <h1 className={styles.bannerTitle}>Careers</h1>
              <p className={styles.bannerSubtitle}>
                Public careers page job listings — edits here go live immediately
              </p>
            </div>
          </div>
          <div className={styles.bannerActions}>
            {canEdit && (
              <button type="button" className={styles.bannerBtn} onClick={openJobCreate}>
                Add Job
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search jobs..."
              aria-label="Search career jobs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.placeholder}>Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.placeholder}>{error}</p>
              <button type="button" className={styles.viewButton} onClick={load}>
                Retry
              </button>
            </div>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.placeholder}>No career jobs yet.</p>
              {canEdit && (
                <button type="button" className={styles.viewButton} onClick={openJobCreate}>
                  Add the first job
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.jobList}>
            {visibleJobs.map((job) => (
              <div key={job.id} className={`${styles.jobRow} ${job.active ? '' : styles.jobRowHidden}`}>
                <div className={styles.jobIdentity}>
                  <span className={styles.jobTitle}>{job.title}</span>
                  <span className={styles.jobMeta}>
                    <FontAwesomeIcon icon={faBriefcase} className={styles.jobMetaIcon} />
                    {job.type} &bull; {job.location}
                  </span>
                </div>
                <div className={styles.jobActions}>
                  {canEdit && (
                    <button type="button" className={styles.editBtn} onClick={() => openJobEdit(job)}>
                      <FontAwesomeIcon icon={faPenToSquare} /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" className={styles.deleteBtn} onClick={() => deleteJob(job)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>

      {jobModal && (
        <Modal
          title={jobModal === 'create' ? 'Add Career Job' : `Edit ${jobModal.title}`}
          onClose={closeModals}
          size="wide"
          headerDark
        >
          {formError && <p className={styles.err}>{formError}</p>}
          <form onSubmit={(e) => void handleJobSubmit(e)}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cj-title">Job Title *</label>
              <input
                id="cj-title"
                required
                className={styles.input}
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-type">Type</label>
                <input
                  id="cj-type"
                  className={styles.input}
                  placeholder="e.g. Internship / Full-Time"
                  value={jobForm.type}
                  onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-location">Location</label>
                <input
                  id="cj-location"
                  className={styles.input}
                  placeholder="e.g. Remote / On-Site"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cj-description">Description *</label>
              <textarea
                id="cj-description"
                required
                className={`${styles.textarea} ${styles.textareaShort}`}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-skills">Skills</label>
                <input
                  id="cj-skills"
                  className={styles.input}
                  placeholder="e.g. React, Node.js, Java"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-duration">Duration</label>
                <input
                  id="cj-duration"
                  className={styles.input}
                  placeholder="e.g. 6 Months"
                  value={jobForm.duration}
                  onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-stipend">Stipend</label>
                <input
                  id="cj-stipend"
                  className={styles.input}
                  placeholder="e.g. Based on performance"
                  value={jobForm.stipend}
                  onChange={(e) => setJobForm({ ...jobForm, stipend: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-start-date">Start Date</label>
                <input
                  id="cj-start-date"
                  className={styles.input}
                  placeholder="e.g. ASAP"
                  value={jobForm.startDate}
                  onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cj-icon">Icon (Font Awesome class)</label>
              <input
                id="cj-icon"
                className={styles.input}
                placeholder="e.g. fa-solid fa-laptop-code"
                value={jobForm.icon}
                onChange={(e) => setJobForm({ ...jobForm, icon: e.target.value })}
              />
              <div className={styles.helper}>Leave empty for the default briefcase icon.</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cj-about">About the Role</label>
              <textarea
                id="cj-about"
                className={`${styles.textarea} ${styles.textareaShort}`}
                value={jobForm.about}
                onChange={(e) => setJobForm({ ...jobForm, about: e.target.value })}
              />
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>Responsibilities, Requirements &amp; Perks</div>
              <div className={styles.helper}>
                One item per line. These show in the job detail modal when the role has a single opening.
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cj-resp">Responsibilities</label>
                  <textarea
                    id="cj-resp"
                    className={`${styles.textarea} ${styles.textareaShort}`}
                    placeholder={'Manage daily schedules\nHandle correspondence'}
                    value={jobForm.responsibilities}
                    onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cj-req">Requirements</label>
                  <textarea
                    id="cj-req"
                    className={`${styles.textarea} ${styles.textareaShort}`}
                    placeholder={'Excellent communication\nMS Office proficiency'}
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cj-perks">Perks</label>
                <textarea
                  id="cj-perks"
                  className={`${styles.textarea} ${styles.textareaShort}`}
                  placeholder={'🌱 Farm Fresh Produce\n📚 Learning Budget'}
                  value={jobForm.perks}
                  onChange={(e) => setJobForm({ ...jobForm, perks: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>Openings (multi-role jobs)</div>
              <div className={styles.helper}>
                Optional. Add an opening when one job card lists several roles (e.g. Executive + Intern).
                Leave empty for a single-role job.
              </div>
              {jobForm.openings.map((o, i) => (
                <div key={i} className={styles.openingCard}>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Role</label>
                      <input
                        className={styles.input}
                        placeholder="e.g. Sales & Marketing Executive"
                        value={o.role}
                        onChange={(e) => {
                          const next = [...jobForm.openings];
                          next[i] = { ...next[i], role: e.target.value };
                          setJobForm({ ...jobForm, openings: next });
                        }}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Type</label>
                      <input
                        className={styles.input}
                        placeholder="e.g. Fresher / Internship"
                        value={o.type}
                        onChange={(e) => {
                          const next = [...jobForm.openings];
                          next[i] = { ...next[i], type: e.target.value };
                          setJobForm({ ...jobForm, openings: next });
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Responsibilities (one per line)</label>
                    <textarea
                      className={`${styles.textarea} ${styles.textareaShort}`}
                      value={o.responsibilities}
                      onChange={(e) => {
                        const next = [...jobForm.openings];
                        next[i] = { ...next[i], responsibilities: e.target.value };
                        setJobForm({ ...jobForm, openings: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() =>
                      setJobForm({ ...jobForm, openings: jobForm.openings.filter((_, idx) => idx !== i) })
                    }
                  >
                    Remove opening
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.viewButton}
                onClick={() =>
                  setJobForm({ ...jobForm, openings: [...jobForm.openings, { role: '', type: '', responsibilities: '' }] })
                }
              >
                Add opening
              </button>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>Display &amp; Visibility</div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cj-order">Display order</label>
                  <input
                    id="cj-order"
                    className={styles.input}
                    inputMode="numeric"
                    placeholder="Leave empty to append"
                    value={jobForm.displayOrder}
                    onChange={(e) => setJobForm({ ...jobForm, displayOrder: e.target.value })}
                  />
                  <div className={styles.helper}>Lower numbers appear first.</div>
                </div>
                <div className={styles.field}>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={jobForm.active}
                      onChange={(e) => setJobForm({ ...jobForm, active: e.target.checked })}
                    />
                    Visible on the public careers page
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={closeModals}>
                Cancel
              </button>
              <button type="submit" className={styles.viewButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
