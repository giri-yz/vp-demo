/**
 * Public content API backing the /team, /news and /gallery pages.
 *
 * The pages fetch on mount and keep their static data as a fallback, so the
 * site still renders offline (same behaviour as before the backend landed).
 * An empty array from the server is trusted — that is how admin deletions
 * reach the public site.
 */
import { API_BASE_URL } from '../config/appConfig';
import { mediaUrl } from '../utils/mediaUrl';
import httpClient from './httpClient';

/**
 * Resolves server-relative upload paths (/uploads/...) against the API origin so
 * admin-uploaded photos keep loading when the frontend is hosted separately from
 * the backend. Data URLs and ordinary asset paths pass through unchanged.
 *
 * Image-cutover funnel (16-Oct-2026): every API-driven image URL (products via
 * productsApi/adminProductsApi, plus gallery/news/team rows) passes through
 * here, so the Cloudinary→AWS mirror rewrite is composed into the final return.
 * mediaUrl() is a passthrough unless VITE_MEDIA_BASE_URL was set at build time
 * (AWS build) and only touches res.cloudinary.com URLs — /uploads/, data: URLs
 * and placehold.co fallbacks are unaffected.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (API_BASE_URL && path.startsWith('/uploads/')) return API_BASE_URL + path;
  return mediaUrl(path);
}

/** One "Roles & Responsibilities" row on the public team detail page. */
export interface ResponsibilityItem {
  title: string;
  description: string;
}

export interface TeamMemberRow {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  photoUrl: string | null;
  description: string | null;
  isDirector: boolean;
  displayOrder: number;
  /** false = hidden from the public /team page (still listed for admins). */
  active: boolean;
  /** null = public page falls back to the role-based defaults. */
  responsibilities: ResponsibilityItem[] | null;
  /** null = public page falls back to the role-based defaults. */
  keySkills: string[] | null;
  /** ISO-8601 timestamp; drives the admin "Newest First" sort. */
  createdAt: string;
}

export interface NewsArticleRow {
  id: string;
  /** '1'..'7' for seeded articles — links the row to its rich static layout. */
  legacyKey: string | null;
  title: string;
  author: string;
  imageUrl: string;
  excerpt: string | null;
  /** Paragraphs separated by blank lines. */
  content: string;
  /** Comma-separated tags. */
  tags: string | null;
  /** ISO date, 'YYYY-MM-DD'. */
  publishedDate: string;
  readTime: string;
  comments: number;
  displayOrder: number;
  /** false = hidden from public /news and its detail page. */
  active: boolean;
  /** Optional admin label (e.g. Organic, Farm). */
  category: string | null;
}

export interface GalleryImageRow {
  id: string;
  imageUrl: string;
  /** Short description shown under the photo and in the lightbox; null = public page falls back to its own note. */
  caption: string | null;
  altText: string | null;
  displayOrder: number;
  /** false = hidden from the public /gallery page (still listed for admins). */
  active: boolean;
}

/** A public careers job listing managed from the sub-admin dashboard. */
export interface CareerJobOpening {
  role: string;
  type: string | null;
  responsibilities: string[];
}

export interface CareerJobRow {
  id: string;
  /** Stable public key — /careers/apply?job=<slug> and the job translations key off it. */
  slug: string;
  title: string;
  type: string;
  location: string;
  /** Font Awesome class (e.g. 'fa-solid fa-laptop-code'); null → the page uses its default icon. */
  icon: string | null;
  description: string;
  /** Comma-separated, e.g. 'Node.js, React, Java'. */
  skills: string;
  duration: string | null;
  stipend: string | null;
  startDate: string | null;
  about: string | null;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  /** Empty = single-role job (rendered from the job's own responsibilities). */
  openings: CareerJobOpening[];
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

/**
 * Parses a comma-separated skills string into a clean list.
 * 'Node.js, React, Java' → ['Node.js', 'React', 'Java'].
 */
export function splitSkills(skills: string | null | undefined): string[] {
  if (!skills) return [];
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Last successful /api/team-members payload. The team list fills it, so opening a
 * profile after browsing the list renders instantly (and survives a backend hiccup). */
let _teamCache: TeamMemberRow[] | null = null;
export function getCachedTeamMembers(): TeamMemberRow[] | null {
  return _teamCache;
}

export async function fetchTeamMembers(): Promise<TeamMemberRow[]> {
  const { data } = await httpClient.get<TeamMemberRow[]>('/api/team-members');
  _teamCache = data;
  return data;
}

export async function fetchNews(): Promise<NewsArticleRow[]> {
  const { data } = await httpClient.get<NewsArticleRow[]>('/api/news');
  return data;
}

export async function fetchGalleryImages(): Promise<GalleryImageRow[]> {
  const { data } = await httpClient.get<GalleryImageRow[]>('/api/gallery-images');
  return data;
}

/** Active career jobs only — same contract as the sub-admin's visibility flag. */
export async function fetchCareerJobs(): Promise<CareerJobRow[]> {
  const { data } = await httpClient.get<CareerJobRow[]>('/api/careers/jobs');
  return data;
}

/** null ONLY when the article genuinely does not exist (HTTP 404). */
export async function fetchNewsById(id: string): Promise<NewsArticleRow | null> {
  try {
    const { data } = await httpClient.get<NewsArticleRow>(`/api/news/${id}`);
    return data;
  } catch (err: unknown) {
    // Only a real 404 means "no such article" — network errors, timeouts and
    // Render cold starts must propagate so the page shows a retry panel instead
    // of a FAKE NotFound for an article that exists.
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw err;
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2026-06-12' → '12 June, 2026' (matches the static site's dateDisplay). */
export function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]}, ${y}`;
}

/** 'Organic,Farm' (or 'Organic, Farm') → ['Organic', 'Farm']. */
export function splitTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
