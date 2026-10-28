import httpClient from './httpClient';
import type { AdminCustomer } from '../types';

export async function listCustomers(params: {
  type?: string;
  country?: string;
  search?: string;
}): Promise<AdminCustomer[]> {
  try {
    const { data } = await httpClient.get<AdminCustomer[]>('/api/admin/customers', { params });
    return data;
  } catch (err) {
        throw err;
  }
}

