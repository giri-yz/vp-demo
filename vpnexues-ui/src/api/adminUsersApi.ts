import httpClient from './httpClient';
import type { AdminRole, AdminUserSummary } from '../types';

export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  const { data } = await httpClient.get<AdminUserSummary[]>('/api/admin/admin-users');
  return data;
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  /** Required by the backend when role is SUB_ADMIN (allowed: IN, AE, US, SG, LK). */
  countryCode?: string | null;
  phone?: string | null;
  /** Granted module keys; required (at least one) for SUB_ADMIN. */
  modules?: string[];
  /** Granted action keys: view/edit/delete/export. */
  permissions?: string[];
}): Promise<AdminUserSummary> {
  const { data } = await httpClient.post<AdminUserSummary>('/api/admin/admin-users', input);
  return data;
}

export async function updateAdminUser(
  id: string,
  input: {
    name: string;
    role: AdminRole;
    active: boolean;
    countryCode?: string | null;
    phone?: string | null;
    modules?: string[];
    permissions?: string[];
  }
): Promise<AdminUserSummary> {
  const { data } = await httpClient.put<AdminUserSummary>(`/api/admin/admin-users/${id}`, input);
  return data;
}

/** Permanently removes a sub-admin. The backend refuses self-deletion and any SUPER_ADMIN row. */
export async function deleteAdminUser(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/admin-users/${id}`);
}
