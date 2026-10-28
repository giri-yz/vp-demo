/**
 * Admin CRUD for the public /team, /news and /gallery content (sub-admin dashboard).
 *
 * No demo fallback here: content is shared across the whole public site, so a
 * failure must surface as an error toast instead of silently editing a local
 * copy nobody else can see.
 */
import httpClient from './httpClient';
import type { CareerJobOpening, CareerJobRow, GalleryImageRow, NewsArticleRow, ResponsibilityItem, TeamMemberRow } from './contentApi';

export interface TeamMemberInput {
  name: string;
  role: string;
  photoUrl: string;
  description: string;
  isDirector: boolean;
  displayOrder?: number;
  active?: boolean;
  /** null keeps the stored rows; [] clears them (update only — create stores what is sent). */
  responsibilities?: ResponsibilityItem[] | null;
  keySkills?: string[] | null;
}

export interface NewsArticleInput {
  title: string;
  author: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  tags: string;
  /** 'YYYY-MM-DD'; empty string falls back to today on the server. */
  publishedDate?: string;
  readTime?: string;
  displayOrder?: number;
  category?: string;
  active?: boolean;
}

/** Same shape the update endpoint accepts (displayOrder optional there too). */
export type TeamMemberUpdate = TeamMemberInput;
export type NewsArticleUpdate = Omit<NewsArticleInput, 'displayOrder'>;

export interface GalleryImageInput {
  imageUrl: string;
  caption?: string;
  altText?: string;
  /** null/undefined on update keeps the stored order (append on create). */
  displayOrder?: number;
  active?: boolean;
}

export type GalleryImageUpdate = GalleryImageInput;

export async function listTeamMembersAdmin(): Promise<TeamMemberRow[]> {
  const { data } = await httpClient.get<TeamMemberRow[]>('/api/admin/team-members');
  return data;
}

/** Uploads a photo; resolves to the server-relative /uploads/... URL (not base64).
 * `name` becomes the filename (slugified, e.g. nageswaran-duraiswamy.jpg);
 * `replace` is the previous /uploads/... path whose file should be cleaned up;
 * `folder` is 'team' (default), 'news', 'products' or 'gallery'. */
export async function uploadPhoto(file: Blob, name?: string, replace?: string, folder?: 'team' | 'news' | 'products' | 'gallery'): Promise<string> {
  const form = new FormData();
  form.append('file', file, 'photo.jpg');
  if (name) form.append('name', name);
  if (replace) form.append('replace', replace);
  form.append('folder', folder ?? 'team');
  const { data } = await httpClient.post<{ url: string }>('/api/admin/uploads/photo', form);
  return data.url;
}

export async function createTeamMember(input: TeamMemberInput): Promise<TeamMemberRow> {
  const { data } = await httpClient.post<TeamMemberRow>('/api/admin/team-members', input);
  return data;
}

export async function updateTeamMember(id: string, input: TeamMemberUpdate): Promise<TeamMemberRow> {
  const { data } = await httpClient.put<TeamMemberRow>(`/api/admin/team-members/${id}`, input);
  return data;
}

export async function deleteTeamMember(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/team-members/${id}`);
}

export async function listNewsAdmin(): Promise<NewsArticleRow[]> {
  const { data } = await httpClient.get<NewsArticleRow[]>('/api/admin/news');
  return data;
}

export async function createNews(input: NewsArticleInput): Promise<NewsArticleRow> {
  const { data } = await httpClient.post<NewsArticleRow>('/api/admin/news', input);
  return data;
}

export async function updateNews(id: string, input: NewsArticleUpdate): Promise<NewsArticleRow> {
  const { data } = await httpClient.put<NewsArticleRow>(`/api/admin/news/${id}`, input);
  return data;
}

export async function deleteNews(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/news/${id}`);
}

export async function listGalleryImagesAdmin(): Promise<GalleryImageRow[]> {
  const { data } = await httpClient.get<GalleryImageRow[]>('/api/admin/gallery-images');
  return data;
}

export async function createGalleryImage(input: GalleryImageInput): Promise<GalleryImageRow> {
  const { data } = await httpClient.post<GalleryImageRow>('/api/admin/gallery-images', input);
  return data;
}

export async function updateGalleryImage(id: string, input: GalleryImageUpdate): Promise<GalleryImageRow> {
  const { data } = await httpClient.put<GalleryImageRow>(`/api/admin/gallery-images/${id}`, input);
  return data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/gallery-images/${id}`);
}

/** Career jobs admin CRUD — sub-admin "careers" module. */
export interface CareerJobInput {
  title: string;
  type: string;
  location: string;
  description: string;
  skills: string;
  /** Font Awesome class, e.g. 'fa-solid fa-laptop-code'. */
  icon?: string;
  duration?: string;
  stipend?: string;
  startDate?: string;
  about?: string;
  /** One item per entry. On update, null keeps the stored list and [] clears it. */
  responsibilities?: string[];
  requirements?: string[];
  perks?: string[];
  /** Multi-role openings; on update null keeps the stored ones and [] clears them. */
  openings?: CareerJobOpening[];
  active?: boolean;
  displayOrder?: number;
}

export type CareerJobUpdate = CareerJobInput;

export async function listCareerJobsAdmin(): Promise<CareerJobRow[]> {
  const { data } = await httpClient.get<CareerJobRow[]>('/api/admin/career-jobs');
  return data;
}

export async function createCareerJob(input: CareerJobInput): Promise<CareerJobRow> {
  const { data } = await httpClient.post<CareerJobRow>('/api/admin/career-jobs', input);
  return data;
}

export async function updateCareerJob(id: string, input: CareerJobUpdate): Promise<CareerJobRow> {
  const { data } = await httpClient.put<CareerJobRow>(`/api/admin/career-jobs/${id}`, input);
  return data;
}

export async function deleteCareerJob(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/career-jobs/${id}`);
}
