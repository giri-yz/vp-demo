import httpClient from './httpClient';
import type { B2BEnquiry } from '../types';

export async function listEnquiries(status?: string): Promise<B2BEnquiry[]> {
  const { data } = await httpClient.get<B2BEnquiry[]>('/api/admin/b2b-enquiries', { params: { status } });
  return data;
}

export async function updateEnquiryStatus(id: string, status: string): Promise<B2BEnquiry> {
  const { data } = await httpClient.put<B2BEnquiry>(`/api/admin/b2b-enquiries/${id}/status`, { status });
  return data;
}
