import httpClient from './httpClient';

/**
 * Feature B — one-time access pass (Super Admin side).
 *
 * The generated `code` is returned exactly once, by {@link generateAccessPass}; every
 * other call returns it as `null` because the backend only keeps a SHA-256 hash.
 */
export type AccessPassStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'INVALIDATED';

export interface AdminAccessPass {
  id: string;
  adminId: string;
  /** Plaintext 6-digit code — present ONLY in the generate response. */
  code: string | null;
  generatedAt: string | null;
  expiresAt: string;
  attemptsRemaining: number;
  status: AccessPassStatus;
  generatedByName: string | null;
  usedAt: string | null;
  usedIp: string | null;
}

/** Issue a fresh pass; any previous un-used pass for that account dies server-side. */
export async function generateAccessPass(adminId: string): Promise<AdminAccessPass> {
  const { data } = await httpClient.post<AdminAccessPass>(`/api/admin/admin-users/${adminId}/access-pass`);
  return data;
}

/** Current pass for the countdown UI. Returns null when nothing is pending. */
export async function getActiveAccessPass(adminId: string): Promise<AdminAccessPass | null> {
  const { data } = await httpClient.get<AdminAccessPass | null>(`/api/admin/admin-users/${adminId}/access-pass`);
  return data ?? null;
}

/** Newest-first audit trail: who issued it, for whom, when used, from which IP. */
export async function getAccessPassHistory(adminId: string): Promise<AdminAccessPass[]> {
  const { data } = await httpClient.get<AdminAccessPass[]>(`/api/admin/admin-users/${adminId}/access-pass/history`);
  return data ?? [];
}

/** Instant revocation of an un-used pass. */
export async function revokeAccessPass(adminId: string): Promise<void> {
  await httpClient.delete(`/api/admin/admin-users/${adminId}/access-pass`);
}
