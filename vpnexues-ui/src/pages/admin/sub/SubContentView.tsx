import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSearch, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import * as adminContentApi from '../../../api/adminContentApi';
import { assetUrl, formatDateDisplay, splitTags, type GalleryImageRow, type NewsArticleRow, type ResponsibilityItem, type TeamMemberRow } from '../../../api/contentApi';
import { readPhotoFile } from '../../../api/adminTeamApi';
import Modal from '../../../components/admin/Modal';
import { useToast } from '../../../components/admin/Toast';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import { getErrorMessage } from '../../../utils/errors';
import { hasPermission } from '../../../utils/adminScope';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getRoleContent } from '../../marketing/teamData';
import type { CountryConfig } from '../../../config/countryConfig';
import SubLiveStrip from './SubLiveStrip';
import s from './SubContentView.module.css';

type Tab = 'team' | 'news' | 'gallery';
type SortKey = 'newest' | 'oldest' | 'az' | 'za';

interface TeamFormState {
  name: string;
  role: string;
  photoUrl: string;
  description: string;
  isDirector: boolean;
  displayOrder: string;
  active: boolean;
  responsibilities: ResponsibilityItem[];
  keySkills: string[];
}

interface NewsFormState {
  title: string;
  author: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  tags: string;
  publishedDate: string;
  readTime: string;
  category: string;
  active: boolean;
}

interface GalleryFormState {
  imageUrl: string;
  caption: string;
  altText: string;
  displayOrder: string;
  active: boolean;
}

const EMPTY_TEAM: TeamFormState = { name: '', role: '', photoUrl: '', description: '', isDirector: false, displayOrder: '', active: true, responsibilities: [], keySkills: [] };
const EMPTY_NEWS: NewsFormState = { title: '', author: '', imageUrl: '', excerpt: '', content: '', tags: '', publishedDate: '', readTime: '', category: '', active: true };
const EMPTY_GALLERY: GalleryFormState = { imageUrl: '', caption: '', altText: '', displayOrder: '', active: true };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Label shown in the list rows and the role filter (directors always read "Director"). */
function displayRole(member: TeamMemberRow): string {
  return member.isDirector ? 'Director' : member.role?.trim() || '—';
}

/** Converts a data URL (from the client-side downscale) into a Blob for upload. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = /data:([^;,]+)/.exec(head)?.[1] ?? 'image/jpeg';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function SubContentView({ config }: { config: CountryConfig }) {
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'edit');
  const canDelete = hasPermission(admin, 'delete');
  const [tab, setTab] = useState<Tab>('team');
  const [team, setTeam] = useState<TeamMemberRow[]>([]);
  const [news, setNews] = useState<NewsArticleRow[]>([]);
  const [gallery, setGallery] = useState<GalleryImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const [teamModal, setTeamModal] = useState<'create' | TeamMemberRow | null>(null);
  const [newsModal, setNewsModal] = useState<'create' | NewsArticleRow | null>(null);
  const [galleryModal, setGalleryModal] = useState<'create' | GalleryImageRow | null>(null);
  const [teamForm, setTeamForm] = useState<TeamFormState>(EMPTY_TEAM);
  const [newsForm, setNewsForm] = useState<NewsFormState>(EMPTY_NEWS);
  const [galleryForm, setGalleryForm] = useState<GalleryFormState>(EMPTY_GALLERY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    Promise.all([
      adminContentApi.listTeamMembersAdmin(),
      adminContentApi.listNewsAdmin(),
      adminContentApi.listGalleryImagesAdmin(),
    ])
      .then(([teamRows, newsRows, galleryRows]) => {
        setTeam(teamRows);
        setNews(newsRows);
        setGallery(galleryRows);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load team, news and gallery.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function closeModals() {
    setTeamModal(null);
    setNewsModal(null);
    setGalleryModal(null);
    setFormError('');
  }

  function openTeamCreate() {
    setTeamForm(EMPTY_TEAM);
    setFormError('');
    setTeamModal('create');
  }

  function openTeamEdit(member: TeamMemberRow) {
    // Prefill with what the public page currently shows: saved values first,
    // then the role-based defaults for members never edited before.
    const defaults = getRoleContent(member.role ?? undefined, member.isDirector);
    setTeamForm({
      name: member.name,
      role: member.role ?? '',
      photoUrl: member.photoUrl ?? '',
      description: member.description ?? '',
      isDirector: member.isDirector,
      displayOrder: String(member.displayOrder),
      active: member.active,
      responsibilities: member.responsibilities ?? defaults?.responsibilities ?? [],
      keySkills: member.keySkills ?? defaults?.skills ?? [],
    });
    setFormError('');
    setTeamModal(member);
  }

  /** Typing a known role (or toggling Director) fills the lists with that role's
   * defaults — on create and on edit alike, so the form always matches what the
   * public page will show for that role. */
  function seedFromRole(role: string, isDirector: boolean) {
    setTeamForm((f) => {
      const next = { ...f, role, isDirector };
      const defaults = getRoleContent(role || undefined, isDirector);
      if (defaults) {
        next.responsibilities = defaults.responsibilities;
        next.keySkills = defaults.skills;
      }
      return next;
    });
  }

  function updateResponsibility(index: number, field: keyof ResponsibilityItem, value: string) {
    setTeamForm((f) => {
      const list = [...f.responsibilities];
      list[index] = { ...list[index], [field]: value };
      return { ...f, responsibilities: list };
    });
  }

  function addResponsibility() {
    setTeamForm((f) => ({ ...f, responsibilities: [...f.responsibilities, { title: '', description: '' }] }));
  }

  function removeResponsibility(index: number) {
    setTeamForm((f) => ({ ...f, responsibilities: f.responsibilities.filter((_, i) => i !== index) }));
  }

  function updateSkill(index: number, value: string) {
    setTeamForm((f) => {
      const list = [...f.keySkills];
      list[index] = value;
      return { ...f, keySkills: list };
    });
  }

  function addSkill() {
    setTeamForm((f) => ({ ...f, keySkills: [...f.keySkills, ''] }));
  }

  function removeSkill(index: number) {
    setTeamForm((f) => ({ ...f, keySkills: f.keySkills.filter((_, i) => i !== index) }));
  }

  function openNewsCreate() {
    setNewsForm({ ...EMPTY_NEWS, publishedDate: new Date().toISOString().slice(0, 10) });
    setFormError('');
    setNewsModal('create');
  }

  function openNewsEdit(article: NewsArticleRow) {
    setNewsForm({
      title: article.title,
      author: article.author,
      imageUrl: article.imageUrl,
      excerpt: article.excerpt ?? '',
      content: article.content,
      tags: article.tags ?? '',
      publishedDate: article.publishedDate,
      readTime: article.readTime,
      category: article.category ?? '',
      active: article.active,
    });
    setFormError('');
    setNewsModal(article);
  }

  function openGalleryCreate() {
    setGalleryForm(EMPTY_GALLERY);
    setFormError('');
    setGalleryModal('create');
  }

  function openGalleryEdit(image: GalleryImageRow) {
    setGalleryForm({
      imageUrl: image.imageUrl,
      caption: image.caption ?? '',
      altText: image.altText ?? '',
      displayOrder: String(image.displayOrder),
      active: image.active,
    });
    setFormError('');
    setGalleryModal(image);
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = teamForm.name.trim();
    if (!name) {
      setFormError('Name is required.');
      return;
    }
    const role = teamForm.role.trim();
    if (!role && !teamForm.isDirector) {
      setFormError('Role is required unless the member is a director.');
      return;
    }
    let displayOrder: number | undefined;
    if (teamForm.displayOrder.trim() !== '') {
      displayOrder = Number(teamForm.displayOrder);
      if (!Number.isInteger(displayOrder)) {
        setFormError('Display order must be a whole number.');
        return;
      }
    }
    setSaving(true);
    const payload = {
      name,
      role,
      photoUrl: teamForm.photoUrl.trim(),
      description: teamForm.description.trim(),
      isDirector: teamForm.isDirector,
      displayOrder,
      active: teamForm.active,
      responsibilities: teamForm.responsibilities
        .map((r) => ({ title: r.title.trim(), description: r.description.trim() }))
        .filter((r) => r.title !== '' || r.description !== ''),
      keySkills: teamForm.keySkills.map((skill) => skill.trim()).filter((skill) => skill !== ''),
    };
    try {
      if (teamModal && teamModal !== 'create') {
        await adminContentApi.updateTeamMember(teamModal.id, payload);
        notify('Team member updated.');
      } else {
        await adminContentApi.createTeamMember(payload);
        notify('Team member added.');
      }
      closeModals();
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleNewsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = newsForm.title.trim();
    const content = newsForm.content.trim();
    const imageUrl = newsForm.imageUrl.trim();
    if (!title) {
      setFormError('Title is required.');
      return;
    }
    if (!imageUrl) {
      setFormError('Image is required — upload a file or paste a URL.');
      return;
    }
    if (!content) {
      setFormError('Content is required.');
      return;
    }
    setSaving(true);
    const shared = {
      title,
      author: newsForm.author.trim() || 'Admin',
      imageUrl,
      excerpt: newsForm.excerpt.trim(),
      content,
      tags: newsForm.tags.trim(),
      publishedDate: newsForm.publishedDate || undefined,
      readTime: newsForm.readTime.trim() || undefined,
      category: newsForm.category.trim(),
      active: newsForm.active,
    };
    try {
      if (newsModal && newsModal !== 'create') {
        await adminContentApi.updateNews(newsModal.id, shared);
        notify('Article updated.');
      } else {
        await adminContentApi.createNews(shared);
        notify('Article added.');
      }
      closeModals();
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleGallerySubmit(e: React.FormEvent) {
    e.preventDefault();
    const imageUrl = galleryForm.imageUrl.trim();
    if (!imageUrl) {
      setFormError('Image is required — upload a file or paste a URL.');
      return;
    }
    let displayOrder: number | undefined;
    if (galleryForm.displayOrder.trim() !== '') {
      displayOrder = Number(galleryForm.displayOrder);
      if (!Number.isInteger(displayOrder)) {
        setFormError('Display order must be a whole number.');
        return;
      }
    }
    setSaving(true);
    const payload = {
      imageUrl,
      caption: galleryForm.caption.trim(),
      altText: galleryForm.altText.trim(),
      displayOrder,
      active: galleryForm.active,
    };
    try {
      if (galleryModal && galleryModal !== 'create') {
        await adminContentApi.updateGalleryImage(galleryModal.id, payload);
        notify('Gallery image updated.');
      } else {
        await adminContentApi.createGalleryImage(payload);
        notify('Gallery image added.');
      }
      closeModals();
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeamMember(member: TeamMemberRow) {
    if (!window.confirm(`Remove ${member.name}? They will disappear from the public /team page.`)) return;
    try {
      await adminContentApi.deleteTeamMember(member.id);
      load();
      notify('Team member removed.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not remove team member.'));
    }
  }

  async function deleteNews(article: NewsArticleRow) {
    if (!window.confirm(`Delete "${article.title}"? It will disappear from the public /news page.`)) return;
    try {
      await adminContentApi.deleteNews(article.id);
      load();
      notify('Article deleted.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not delete article.'));
    }
  }

  async function deleteGalleryImage(image: GalleryImageRow) {
    if (!window.confirm('Remove this photo? It will disappear from the public /gallery page.')) return;
    try {
      await adminContentApi.deleteGalleryImage(image.id);
      load();
      notify('Gallery image removed.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not remove gallery image.'));
    }
  }

  /** Downscales the photo, then uploads it to the server so the DB stores a
   * short /uploads/... path (named after the member) instead of a base64 blob. */
  function pickTeamPhoto() {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setSaving(true);
      setFormError('');
      const name = teamForm.name.trim();
      const previous = teamForm.photoUrl;
      readPhotoFile(file, 1280)
        .then((dataUrl) => adminContentApi.uploadPhoto(dataUrlToBlob(dataUrl), name || undefined, previous || undefined, 'team'))
        .then((url) => setTeamForm((f) => ({ ...f, photoUrl: url })))
        .catch((err: unknown) => setFormError(getErrorMessage(err, 'Could not upload that photo.')))
        .finally(() => setSaving(false));
    };
  }

  /** News images: same file-upload flow, stored under /uploads/news/ named after the article title. */
  function pickNewsImage() {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setSaving(true);
      setFormError('');
      const title = newsForm.title.trim();
      const previous = newsForm.imageUrl;
      readPhotoFile(file, 1280)
        .then((dataUrl) => adminContentApi.uploadPhoto(dataUrlToBlob(dataUrl), title || undefined, previous || undefined, 'news'))
        .then((url) => setNewsForm((f) => ({ ...f, imageUrl: url })))
        .catch((err: unknown) => setFormError(getErrorMessage(err, 'Could not upload that image.')))
        .finally(() => setSaving(false));
    };
  }

  /** Gallery photos: same flow, stored under /uploads/gallery/ named after the caption. */
  function pickGalleryImage() {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setSaving(true);
      setFormError('');
      const caption = galleryForm.caption.trim();
      const previous = galleryForm.imageUrl;
      readPhotoFile(file, 1280)
        .then((dataUrl) => adminContentApi.uploadPhoto(dataUrlToBlob(dataUrl), caption || undefined, previous || undefined, 'gallery'))
        .then((url) => setGalleryForm((f) => ({ ...f, imageUrl: url })))
        .catch((err: unknown) => setFormError(getErrorMessage(err, 'Could not upload that image.')))
        .finally(() => setSaving(false));
    };
  }

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(team.map(displayRole)))
        .filter((role) => role !== '—')
        .sort((a, b) => a.localeCompare(b)),
    [team],
  );

  const visibleTeam = useMemo(() => {
    const query = teamQuery.trim().toLowerCase();
    const rows = team.filter((member) => {
      const matchesQuery =
        query === '' ||
        member.name.toLowerCase().includes(query) ||
        (member.role ?? '').toLowerCase().includes(query);
      const matchesRole = roleFilter === '' || displayRole(member) === roleFilter;
      return matchesQuery && matchesRole;
    });
    return rows.sort((a, b) => {
      if (sortKey === 'az') return a.name.localeCompare(b.name);
      if (sortKey === 'za') return b.name.localeCompare(a.name);
      const timeA = Date.parse(a.createdAt) || 0;
      const timeB = Date.parse(b.createdAt) || 0;
      return sortKey === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [team, teamQuery, roleFilter, sortKey]);

  return (
    <div>
      <ScrollReveal>
        <div className={s.banner}>
          <div className={s.bannerContent}>
            <div>
              <h1 className={s.bannerTitle}>Team, News &amp; Gallery</h1>
              <p className={s.bannerSubtitle}>
                Public /team, /news and /gallery pages — edits here go live immediately
              </p>
            </div>
          </div>
          <div className={s.bannerActions}>
            {canEdit && (tab === 'team' ? (
              <button type="button" className={s.bannerBtn} onClick={openTeamCreate}>
                Add Member
              </button>
            ) : tab === 'news' ? (
              <button type="button" className={s.bannerBtn} onClick={openNewsCreate}>
                Add Article
              </button>
            ) : (
              <button type="button" className={s.bannerBtn} onClick={openGalleryCreate}>
                Add Image
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <SubLiveStrip config={config} />

      <ScrollReveal delay={100}>
        <div className={s.toolbar}>
          <div className={s.tabs}>
            <button
              type="button"
              className={`${s.tab} ${tab === 'team' ? s.tabActive : ''}`}
              onClick={() => setTab('team')}
            >
              Team ({team.length})
            </button>
            <button
              type="button"
              className={`${s.tab} ${tab === 'news' ? s.tabActive : ''}`}
              onClick={() => setTab('news')}
            >
              News ({news.length})
            </button>
            <button
              type="button"
              className={`${s.tab} ${tab === 'gallery' ? s.tabActive : ''}`}
              onClick={() => setTab('gallery')}
            >
              Gallery ({gallery.length})
            </button>
          </div>
          {tab === 'team' && (
            <div className={s.teamToolbar}>
              <div className={s.searchBox}>
                <FontAwesomeIcon icon={faSearch} className={s.searchIcon} />
                <input
                  type="search"
                  className={s.searchInput}
                  placeholder="Search team members..."
                  aria-label="Search team members"
                  value={teamQuery}
                  onChange={(e) => setTeamQuery(e.target.value)}
                />
              </div>
              <select
                className={s.select}
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                className={s.select}
                aria-label="Sort team members"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Name A–Z</option>
                <option value="za">Name Z–A</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className={s.panel}>
            <div className={s.panelBody}>
              <p className={s.placeholder}>Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className={s.panel}>
            <div className={s.panelBody}>
              <p className={s.placeholder}>{error}</p>
              <button type="button" className={s.viewButton} onClick={load}>
                Retry
              </button>
            </div>
          </div>
        ) : tab === 'team' ? (
          team.length === 0 ? (
            <div className={s.panel}>
              <div className={s.panelBody}>
                <p className={s.placeholder}>No team members yet.</p>
                <button type="button" className={s.viewButton} onClick={openTeamCreate}>
                  Add the first member
                </button>
              </div>
            </div>
          ) : visibleTeam.length === 0 ? (
            <div className={s.panel}>
              <div className={s.panelBody}>
                <p className={s.placeholder}>No team members match your search.</p>
                <button
                  type="button"
                  className={s.viewButton}
                  onClick={() => {
                    setTeamQuery('');
                    setRoleFilter('');
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className={s.teamList}>
              {visibleTeam.map((member) => (
                  <div
                    key={member.id}
                    className={`${s.teamRow} ${member.active ? '' : s.teamRowHidden}`}
                  >
                    <div className={s.avatarWrap}>
                      <span className={s.avatarInitials}>{initials(member.name)}</span>
                      {member.photoUrl && (
                        <img
                          className={s.avatarImg}
                          src={assetUrl(member.photoUrl)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className={s.rowIdentity}>
                      <span className={s.rowName}>{member.name}</span>
                      <span className={s.rowMeta}>
                        <FontAwesomeIcon icon={faUser} className={s.rowMetaIcon} />
                        {displayRole(member)}
                      </span>
                    </div>
                    <div className={s.rowActions}>
                      {canEdit && (
                        <button
                          type="button"
                          className={s.editBtn}
                          onClick={() => openTeamEdit(member)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className={s.deleteBtn}
                          onClick={() => void deleteTeamMember(member)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )
        ) : tab === 'gallery' ? (
          gallery.length === 0 ? (
            <div className={s.panel}>
              <div className={s.panelBody}>
                <p className={s.placeholder}>No gallery images yet.</p>
                <button type="button" className={s.viewButton} onClick={openGalleryCreate}>
                  Add the first image
                </button>
              </div>
            </div>
          ) : (
            <div className={s.galleryList}>
              {gallery.map((image) => (
                <div key={image.id} className={`${s.galleryCard} ${image.active ? '' : s.galleryCardHidden}`}>
                  <div className={s.galleryThumb}>
                    <span className={s.thumbIcon}>G</span>
                    <img
                      className={s.thumbImg}
                      src={assetUrl(image.imageUrl)}
                      alt={image.altText ?? ''}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className={s.galleryOrder}>#{image.displayOrder}</span>
                    <span className={s.galleryCaption}>{image.caption || 'Untitled photo'}</span>
                  </div>
                  <div className={s.galleryBody}>
                    {!image.active && <span className={s.badgeHidden}>Hidden from /gallery</span>}
                    <div className={s.rowActions}>
                      {canEdit && (
                        <button
                          type="button"
                          className={s.editBtn}
                          onClick={() => openGalleryEdit(image)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className={s.deleteBtn}
                          onClick={() => void deleteGalleryImage(image)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : news.length === 0 ? (
          <div className={s.panel}>
            <div className={s.panelBody}>
              <p className={s.placeholder}>No articles yet.</p>
              <button type="button" className={s.viewButton} onClick={openNewsCreate}>
                Write the first article
              </button>
            </div>
          </div>
        ) : (
          <div className={s.newsList}>
            {news.map((article) => (
              <div key={article.id} className={`${s.newsRow} ${article.active ? '' : s.newsRowHidden}`}>
                <div className={s.thumbWrap}>
                  <span className={s.thumbIcon}>N</span>
                  <img
                    className={s.thumbImg}
                    src={assetUrl(article.imageUrl)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className={s.newsMeta}>
                  <span className={s.newsTitle}>{article.title}</span>
                  <span className={s.newsSub}>
                    {formatDateDisplay(article.publishedDate)} · {article.author}
                    {splitTags(article.tags).length > 0 && ` · ${splitTags(article.tags).join(', ')}`}
                    {article.category && ` · ${article.category}`}
                  </span>
                </div>
                {!article.active && <span className={s.badgeHidden}>Hidden from /news</span>}
                <div className={s.rowActions}>
                  {canEdit && (
                    <button type="button" className={s.viewButton} onClick={() => openNewsEdit(article)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className={s.deleteBtn}
                      onClick={() => void deleteNews(article)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>

      {teamModal && (
        <Modal
          title={teamModal === 'create' ? 'Add Team Member' : `Edit ${teamModal.name}`}
          onClose={closeModals}
          size="wide"
          headerDark
        >
          {formError && <p className={s.err}>{formError}</p>}
          <form onSubmit={(e) => void handleTeamSubmit(e)}>
            <div className={s.formGrid2}>
              <div className={s.field}>
                <label className={s.label} htmlFor="tm-name">Name *</label>
                <input
                  id="tm-name"
                  required
                  className={s.input}
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="tm-role">Role / Designation</label>
                <input
                  id="tm-role"
                  className={s.input}
                  placeholder="e.g. Web Developer"
                  value={teamForm.role}
                  onChange={(e) => seedFromRole(e.target.value, teamForm.isDirector)}
                />
              </div>
            </div>
              <div className={s.helper}>Role is required unless “Director” is checked. Entering a known role auto-fills Responsibilities and Key Skills below with that role’s defaults.</div>
            <div className={s.field}>
              <label className={s.label} htmlFor="tm-photo">Profile photo</label>
              <div className={s.imageRow}>
                <input
                  id="tm-photo"
                  className={s.input}
                  placeholder="/images/team/... or https://..."
                  value={teamForm.photoUrl}
                  onChange={(e) => setTeamForm({ ...teamForm, photoUrl: e.target.value })}
                />
                <label className={s.fileBtn}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={pickTeamPhoto()}
                  />
                </label>
                {teamForm.photoUrl && <img className={s.preview} src={assetUrl(teamForm.photoUrl)} alt="" />}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="tm-bio">Short description</label>
              <textarea
                id="tm-bio"
                className={`${s.textarea} ${s.textareaShort}`}
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
              />
            </div>
            <div className={s.formSection}>
              <div className={s.sectionTitle}>Roles &amp; Responsibilities</div>
              {teamForm.responsibilities.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key -- ordered editor rows, no stable ids
                <div key={index} className={s.itemRow}>
                  <input
                    className={s.input}
                    placeholder="Title (e.g. Task Planning)"
                    value={item.title}
                    onChange={(e) => updateResponsibility(index, 'title', e.target.value)}
                  />
                  <input
                    className={`${s.input} ${s.itemDesc}`}
                    placeholder="Description (e.g. Break requirements into clear tasks and assign work effectively.)"
                    value={item.description}
                    onChange={(e) => updateResponsibility(index, 'description', e.target.value)}
                  />
                  <button
                    type="button"
                    className={s.removeBtn}
                    aria-label="Remove responsibility"
                    onClick={() => removeResponsibility(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className={s.addBtn} onClick={addResponsibility}>
                + Add responsibility
              </button>
            </div>
            <div className={s.formSection}>
              <div className={s.sectionTitle}>Key Skills</div>
              {teamForm.keySkills.map((skill, index) => (
                // eslint-disable-next-line react/no-array-index-key -- ordered editor rows, no stable ids
                <div key={index} className={s.itemRow}>
                  <input
                    className={s.input}
                    placeholder="e.g. Leadership"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                  />
                  <button
                    type="button"
                    className={s.removeBtn}
                    aria-label="Remove skill"
                    onClick={() => removeSkill(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className={s.addBtn} onClick={addSkill}>
                + Add skill
              </button>
            </div>
            <div className={s.formSection}>
              <div className={s.sectionTitle}>Display &amp; Visibility</div>
              <div className={s.field}>
                <label className={s.label} htmlFor="tm-order">Display order</label>
                <input
                  id="tm-order"
                  className={s.input}
                  inputMode="numeric"
                  placeholder="Leave empty to append"
                  value={teamForm.displayOrder}
                  onChange={(e) => setTeamForm({ ...teamForm, displayOrder: e.target.value })}
                />
                <div className={s.helper}>Lower numbers appear first within their section.</div>
              </div>
              <div className={s.row2}>
                <div className={s.field}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={teamForm.isDirector}
                      onChange={(e) => seedFromRole(teamForm.role, e.target.checked)}
                    />
                    Director (shown in the Directors section)
                  </label>
                </div>
                <div className={s.field}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={teamForm.active}
                      onChange={(e) => setTeamForm({ ...teamForm, active: e.target.checked })}
                    />
                    Visible on the public /team page
                  </label>
                </div>
              </div>
            </div>
            <div className={s.formActions}>
              <button type="button" className={s.cancelBtn} onClick={closeModals}>
                Cancel
              </button>
              <button type="submit" className={s.viewButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {newsModal && (
        <Modal
          title={newsModal === 'create' ? 'Add News Article' : 'Edit Article'}
          onClose={closeModals}
          size="wide"
        >
          {formError && <p className={s.err}>{formError}</p>}
          <form onSubmit={(e) => void handleNewsSubmit(e)}>
            <div className={s.field}>
              <label className={s.label} htmlFor="na-title">Title *</label>
              <input
                id="na-title"
                required
                className={s.input}
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label} htmlFor="na-author">Author</label>
                <input
                  id="na-author"
                  className={s.input}
                  placeholder="Admin"
                  value={newsForm.author}
                  onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="na-date">Published date</label>
                <input
                  id="na-date"
                  type="date"
                  className={s.input}
                  value={newsForm.publishedDate}
                  onChange={(e) => setNewsForm({ ...newsForm, publishedDate: e.target.value })}
                />
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="na-image">Image *</label>
              <div className={s.imageRow}>
                <input
                  id="na-image"
                  className={s.input}
                  placeholder="https://... or upload"
                  value={newsForm.imageUrl}
                  onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                />
                <label className={s.fileBtn}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={pickNewsImage()}
                  />
                </label>
                {newsForm.imageUrl && <img className={s.preview} src={assetUrl(newsForm.imageUrl)} alt="" />}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="na-excerpt">Short description</label>
              <textarea
                id="na-excerpt"
                className={`${s.textarea} ${s.textareaShort}`}
                value={newsForm.excerpt}
                onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
              />
              <div className={s.helper}>Shown on the news list and as the meta description.</div>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="na-content">Content * (blank line = new paragraph)</label>
              <textarea
                id="na-content"
                required
                className={`${s.textarea} ${s.textareaTall}`}
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label} htmlFor="na-tags">Tags (comma separated)</label>
                <input
                  id="na-tags"
                  className={s.input}
                  placeholder="Organic, Farm, Fresh"
                  value={newsForm.tags}
                  onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="na-category">Category</label>
                <input
                  id="na-category"
                  className={s.input}
                  placeholder="e.g. Organic, Farm"
                  value={newsForm.category}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label} htmlFor="na-read">Read time</label>
                <input
                  id="na-read"
                  className={s.input}
                  placeholder="3 min"
                  value={newsForm.readTime}
                  onChange={(e) => setNewsForm({ ...newsForm, readTime: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={newsForm.active}
                    onChange={(e) => setNewsForm({ ...newsForm, active: e.target.checked })}
                  />
                  Visible on the public /news page
                </label>
              </div>
            </div>
            <div className={s.formActions}>
              <button type="submit" className={s.viewButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {galleryModal && (
        <Modal
          title={galleryModal === 'create' ? 'Add Gallery Image' : 'Edit Gallery Image'}
          onClose={closeModals}
          size="wide"
        >
          {formError && <p className={s.err}>{formError}</p>}
          <form onSubmit={(e) => void handleGallerySubmit(e)}>
            <div className={s.field}>
              <label className={s.label} htmlFor="gi-image">Image *</label>
              <div className={s.imageRow}>
                <input
                  id="gi-image"
                  required
                  className={s.input}
                  placeholder="https://... or upload"
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                />
                <label className={s.fileBtn}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={pickGalleryImage()}
                  />
                </label>
                {galleryForm.imageUrl && <img className={s.preview} src={assetUrl(galleryForm.imageUrl)} alt="" />}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="gi-caption">Caption</label>
              <input
                id="gi-caption"
                className={s.input}
                placeholder="e.g. Harvest season in the fields"
                value={galleryForm.caption}
                onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
              />
              <div className={s.helper}>Shown under the photo and in the lightbox on the public /gallery page.</div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label} htmlFor="gi-alt">Alt text</label>
                <input
                  id="gi-alt"
                  className={s.input}
                  placeholder="Describe the photo for screen readers"
                  value={galleryForm.altText}
                  onChange={(e) => setGalleryForm({ ...galleryForm, altText: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="gi-order">Display order</label>
                <input
                  id="gi-order"
                  className={s.input}
                  inputMode="numeric"
                  placeholder="Leave empty to append"
                  value={galleryForm.displayOrder}
                  onChange={(e) => setGalleryForm({ ...galleryForm, displayOrder: e.target.value })}
                />
                <div className={s.helper}>Lower numbers appear first.</div>
              </div>
            </div>
            <div className={s.field}>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={galleryForm.active}
                  onChange={(e) => setGalleryForm({ ...galleryForm, active: e.target.checked })}
                />
                Visible on the public /gallery page
              </label>
            </div>
            <div className={s.formActions}>
              <button type="button" className={s.cancelBtn} onClick={closeModals}>
                Cancel
              </button>
              <button type="submit" className={s.viewButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
