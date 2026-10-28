import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn,
  faCrown,
  faCode,
  faPalette,
  faPlus,
  faTrash,
  faUser,
  faUserGroup,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../../../components/admin/Modal';
import { useToast } from '../../../components/admin/Toast';
import {
  addTeamMember,
  listTeamMembers,
  readPhotoFile,
  removeTeamMember,
  type TeamMember,
} from '../../../api/adminTeamApi';
import type { CountryConfig } from '../../../config/countryConfig';
import styles from './SubTeamsView.module.css';

/** Same idea as the public /team page: a role icon sits on the photo ring. */
const ROLE_ICONS: { match: RegExp; icon: typeof faUser }[] = [
  { match: /lead|head|director|manager/i, icon: faCrown },
  { match: /develop|engineer|technic|code/i, icon: faCode },
  { match: /design|creative|ui|ux/i, icon: faPalette },
  { match: /sales|market|growth/i, icon: faBullhorn },
  { match: /admin|operation|hr|account/i, icon: faUserTie },
];

function roleIcon(role: string): typeof faUser {
  return ROLE_ICONS.find((r) => r.match.test(role))?.icon ?? faUser;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export default function SubTeamsView({ config }: { config: CountryConfig }) {
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMembers(listTeamMembers(config.id));
  }, [config.id]);

  function resetForm() {
    setName('');
    setRole('');
    setPhoto('');
    setFormError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await readPhotoFile(file));
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not read that image.');
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    if (!trimmedName || !trimmedRole) {
      setFormError('Name and role are both required.');
      return;
    }
    setBusy(true);
    try {
      addTeamMember(config.id, { name: trimmedName, role: trimmedRole, photo });
      setMembers(listTeamMembers(config.id));
      setAdding(false);
      resetForm();
      notify(`${trimmedName} added to the team.`);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!pendingDelete) return;
    removeTeamMember(config.id, pendingDelete.id);
    setMembers(listTeamMembers(config.id));
    notify(`${pendingDelete.name} removed from the team.`);
    setPendingDelete(null);
  }

  return (
    <div>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Team — {config.name}</h2>
          <p className={styles.subtitle}>
            {members.length === 0
              ? 'No team members yet.'
              : `${members.length} team member${members.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => setAdding(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Member
        </button>
      </div>

      <section className={styles.stage}>
        <h3 className={styles.sectionLabel}>Team Members</h3>
        {members.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyTitle}>Build your team</span>
            Add the people who run {config.name} — their photo, name and role show up here.
          </div>
        ) : (
          <ul className={styles.memberRow}>
            {members.map((member) => (
              <li key={member.id} className={styles.memberItem}>
                <div className={styles.memberCard}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => setPendingDelete(member)}
                    aria-label={`Remove ${member.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <span className={styles.photoWrap}>
                    <span className={styles.initials} aria-hidden="true">{initialsOf(member.name)}</span>
                    {member.photo && <img src={member.photo} alt={member.name} className={styles.photo} />}
                    <span className={styles.iconBadge} aria-hidden="true">
                      <FontAwesomeIcon icon={roleIcon(member.role)} />
                    </span>
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>{member.name}</span>
                    <span className={styles.rolePill}>{member.role}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {adding && (
        <Modal title="Add Team Member" onClose={() => { setAdding(false); resetForm(); }}>
          <form onSubmit={handleAdd}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(''); }}
                placeholder="e.g. Priya Sharma"
                autoFocus
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Role</span>
              <input
                className={styles.input}
                value={role}
                onChange={(e) => { setRole(e.target.value); setFormError(''); }}
                placeholder="e.g. Operations Manager"
              />
            </label>
            <div className={styles.field}>
              <span className={styles.label}>Photo</span>
              <div className={styles.photoRow}>
                {photo && <img src={photo} alt="Preview" className={styles.photoPreview} />}
                <button type="button" className={styles.fileBtn} onClick={() => fileRef.current?.click()}>
                  {photo ? 'Change photo' : 'Choose photo'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => void handlePhoto(e.target.files?.[0])}
                />
              </div>
              <p className={styles.hint}>Optional — initials are shown when there is no photo.</p>
            </div>
            {formError && <p className={styles.error}>{formError}</p>}
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setAdding(false); resetForm(); }}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={busy}>
                <FontAwesomeIcon icon={faUserGroup} /> Add to Team
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Remove Team Member" onClose={() => setPendingDelete(null)}>
          <p className={styles.confirmText}>Remove this member from the {config.name} team?</p>
          <p className={styles.confirmMember}>{pendingDelete.name} — {pendingDelete.role}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button type="button" className={styles.dangerBtn} onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} /> Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
