import httpClient from './httpClient';
import type { AdminSession } from '../types';
import { isOfflineError } from './demo/demoAdmin';

/**
 * Admin sign-in. `passcode` is Feature B's one-time access pass — required by the backend
 * for delegated accounts (ADMIN / SUB_ADMIN), ignored for the Super Admin.
 */
export async function login(email: string, password: string, passcode?: string): Promise<AdminSession> {
  const { data } = await httpClient.post<AdminSession>('/api/admin/auth/login', {
    email,
    password,
    ...(passcode && passcode.trim() ? { passcode: passcode.trim() } : {}),
  });
  return data;
}

/** Returns null (not thrown) when not logged in, so callers can treat it as "no session" during app bootstrap. */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const { data } = await httpClient.get<AdminSession>('/api/admin/auth/me');
    return data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await httpClient.post('/api/admin/auth/logout');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await httpClient.post('/api/admin/auth/change-password', { currentPassword, newPassword });
  } catch (err) {
    if (isOfflineError(err)) return;
    throw err;
  }
}
