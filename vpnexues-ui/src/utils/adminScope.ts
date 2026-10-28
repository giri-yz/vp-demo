import type { AdminSession } from '../types';
/**
 * Country-scope helper for admin routes.
 *
 * Primary source: the backend session (`GET /api/admin/auth/me` / login),
 * which returns the admin's assigned `countryCode` (e.g. "IN"). The email map
 * below remains only as a fallback for local demo sessions and legacy accounts
 * created before `countryCode` was exposed on the session.
 * SUPER_ADMIN may access all country routes (this also covers the legacy "preview" use case).
 */
const SUB_ADMIN_COUNTRY_BY_EMAIL: Record<string, string> = {
  'india@vpnexues.com': 'india',
  'singapore@vpnexues.com': 'singapore',
  'uae@vpnexues.com': 'uae',
  'usa@vpnexues.com': 'us',
  'us@vpnexues.com': 'us',
  'lk@vpnexues.com': 'lk',
};

/** Country code ("IN") → route slug ("india"). */
const COUNTRY_CODE_TO_SLUG: Record<string, string> = {
  IN: 'india',
  AE: 'uae',
  US: 'us',
  SG: 'singapore',
  LK: 'lk',
};

/** Country route slug for an ADMIN, or null for SUPER_ADMIN / unknown. */
export function getSubAdminCountry(admin: AdminSession): string | null {
  if (admin.role === 'SUPER_ADMIN') return null;
  const code = admin.countryCode?.trim().toUpperCase();
  if (code) return COUNTRY_CODE_TO_SLUG[code] ?? code.toLowerCase();
  return SUB_ADMIN_COUNTRY_BY_EMAIL[admin.email.toLowerCase().trim()] ?? null;
}

/** Default landing page after login. */
export function getAdminHome(admin: AdminSession): string {
  if (admin.role === 'SUPER_ADMIN') return '/admin/super-admin';
  const country = getSubAdminCountry(admin);
  return country ? `/admin/sub-admin/${country}` : '/admin';
}

/** Whether this admin may view the given sub-admin country route slug. */
export function isSubAdminCountryAllowed(admin: AdminSession, countrySlug: string): boolean {
  if (admin.role === 'SUPER_ADMIN') return true;
  return getSubAdminCountry(admin) === countrySlug.toLowerCase().trim();
}

/**
 * Whether the admin may use the given module (dashboard, orders, products, users,
 * reports, payments, support, content). SUPER_ADMIN and legacy sessions without
 * grants (empty/missing list) have full access — mirrors AdminAccessService.
 */
export function hasModule(admin: AdminSession | null, module: string): boolean {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN') return true;
  const modules = admin.modules;
  if (!modules || modules.length === 0) return true;
  return modules.includes(module);
}

/** Whether the admin may perform the action (view/edit/delete/export) — same legacy rules as hasModule. */
export function hasPermission(admin: AdminSession | null, permission: string): boolean {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN') return true;
  const permissions = admin.permissions;
  if (!permissions || permissions.length === 0) return true;
  return permissions.includes(permission);
}

/** Whether a `?redirect=` value is safe and permitted for this admin. */
export function isAllowedRedirect(admin: AdminSession, redirect: string): boolean {
  if (!redirect.startsWith('/admin')) return false;
  if (redirect.startsWith('/admin/sub-admin/')) {
    const slug = redirect.split('/')[3] ?? '';
    return isSubAdminCountryAllowed(admin, slug);
  }
  if (redirect.startsWith('/admin/super-admin')) return admin.role === 'SUPER_ADMIN';
  if (redirect.startsWith('/admin/admin-users')) return admin.role === 'SUPER_ADMIN';
  return true;
}

/**
 * Dev-only demo session for offline UI work (no backend running).
 * Returns null for unknown emails. The demo role/country mapping mirrors the
 * legacy login accounts. Never used in production builds.
 */
export function getDemoSession(email: string): AdminSession | null {
  const normalized = email.toLowerCase().trim();
  if (normalized === 'superadmin@vpnexues.com') {
    return { id: normalized, email: normalized, name: 'superadmin', role: 'SUPER_ADMIN' };
  }
  if (SUB_ADMIN_COUNTRY_BY_EMAIL[normalized]) {
    return { id: normalized, email: normalized, name: normalized.split('@')[0], role: 'ADMIN' };
  }
  return null;
}
