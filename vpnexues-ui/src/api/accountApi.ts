import httpClient from './httpClient';
import type { User } from '../types';

export async function sendEmailCode(email: string): Promise<void> {
  await httpClient.post('/api/account/email/send-code', { email });
}

export async function verifyEmailCode(email: string, code: string): Promise<User> {
  const { data } = await httpClient.post<User>('/api/account/email/verify', { email, code });
  return data;
}

export async function updateProfile(name: string): Promise<User> {
  const { data } = await httpClient.put<User>('/api/account/profile', { name });
  return data;
}

export async function updatePhone(phone: string): Promise<User> {
  const { data } = await httpClient.put<User>('/api/account/profile', { phone });
  return data;
}
