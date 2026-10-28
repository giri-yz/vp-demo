/**
 * Team members for a country sub-admin dashboard.
 *
 * Frontend-only for now — members persist in localStorage through the shared
 * demo store so they survive page refreshes. The first load seeds from the
 * same TEAM data the public /team pages render (photo, name, role), so the
 * dashboard starts with the real company team instead of an empty state.
 * When the backend feature lands, swap the bodies of `listTeamMembers` /
 * `addTeamMember` / `removeTeamMember` for real `/api/admin/team-members`
 * calls; the component contract stays the same, so SubTeamsView needs no
 * changes.
 */
import { loadCollectionVersioned, saveCollection } from './demo/demoStore';
import { TEAM } from '../pages/marketing/teamData';

/**
 * Seed version. Bump it when TEAM changes upstream — stored copies reseed on
 * the next load (this also clears the old empty-array seed). The trade-off:
 * manual add/remove edits made in the dashboard are reset on a bump.
 */
const SEED_VERSION = 'team-v2';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Image URL (public asset) or downscaled JPEG data URL; '' when no photo. */
  photo: string;
  createdAt: string;
}

export interface TeamMemberInput {
  name: string;
  role: string;
  photo?: string;
}

const storageKey = (countryId: string) => `team-members:${countryId}`;

function seedMembers(): TeamMember[] {
  const createdAt = new Date().toISOString();
  return TEAM.map((member) => ({
    id: `tm-${member.slug}`,
    name: member.name,
    role: member.isDirector ? 'Director' : member.role ?? '',
    photo: member.photo,
    createdAt,
  }));
}

export function listTeamMembers(countryId: string): TeamMember[] {
  return loadCollectionVersioned<TeamMember>(storageKey(countryId), SEED_VERSION, seedMembers);
}

export function addTeamMember(countryId: string, input: TeamMemberInput): TeamMember {
  const member: TeamMember = {
    id: `tm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    role: input.role.trim(),
    photo: input.photo ?? '',
    createdAt: new Date().toISOString(),
  };
  saveCollection(storageKey(countryId), [...listTeamMembers(countryId), member]);
  return member;
}

export function removeTeamMember(countryId: string, memberId: string): void {
  saveCollection(
    storageKey(countryId),
    listTeamMembers(countryId).filter((m) => m.id !== memberId),
  );
}

/**
 * Reads an image file into a small JPEG data URL (~320px by default, quality
 * 0.8) so a photo album of members can't blow past the localStorage quota.
 * Pass a larger maxEdge (e.g. 1280) for images shown big on the public site.
 */
export function readPhotoFile(file: File, maxEdge = 320): Promise<string> {
  const MAX_EDGE = maxEdge;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
