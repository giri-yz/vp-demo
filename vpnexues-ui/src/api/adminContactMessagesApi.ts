import httpClient from './httpClient';
import type { ContactMessage } from '../types';

export async function list(status?: string): Promise<ContactMessage[]> {
  const { data } = await httpClient.get<ContactMessage[]>('/api/admin/contact-messages', { params: { status } });
  return data;
}

/** Fetching the detail auto-marks a NEW message as READ (matches the backend behavior). */
export async function get(id: string): Promise<ContactMessage> {
  const { data } = await httpClient.get<ContactMessage>(`/api/admin/contact-messages/${id}`);
  return data;
}

export async function updateStatus(id: string, status: string): Promise<ContactMessage> {
  const { data } = await httpClient.put<ContactMessage>(`/api/admin/contact-messages/${id}/status`, { status });
  return data;
}

export async function remove(id: string): Promise<void> {
  await httpClient.delete(`/api/admin/contact-messages/${id}`);
}
