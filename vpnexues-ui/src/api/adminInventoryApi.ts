import httpClient from './httpClient';
import type { AdminInventoryItem } from '../types';

export async function listInventory(params: { category?: string; status?: string }): Promise<AdminInventoryItem[]> {
  try {
    const { data } = await httpClient.get<AdminInventoryItem[]>('/api/admin/inventory', { params });
    return data;
  } catch (err) {
        throw err;
  }
}

export async function updateInventory(
  id: string,
  input: { quantity: number; reorderThreshold: number }
): Promise<AdminInventoryItem> {
  try {
    const { data } = await httpClient.put<AdminInventoryItem>(`/api/admin/inventory/${id}`, input);
    return data;
  } catch (err) {
        throw err;
  }
}

