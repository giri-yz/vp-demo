import httpClient from './httpClient';
import type { Category } from '../types';
import {
  demoCreateCategory,
  demoDeleteCategory,
  demoListCategories,
  demoUpdateCategory,
  isOfflineError,
} from './demo/demoAdmin';

export async function listCategories(): Promise<Category[]> {
  try {
    const { data } = await httpClient.get<Category[]>('/api/admin/categories');
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoListCategories();
    throw err;
  }
}

export async function createCategory(input: { name: string; slug?: string; emoji?: string }): Promise<Category> {
  try {
    const { data } = await httpClient.post<Category>('/api/admin/categories', input);
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoCreateCategory(input);
    throw err;
  }
}

export async function updateCategory(
  id: string,
  input: { name: string; emoji: string | null; active: boolean }
): Promise<Category> {
  try {
    const { data } = await httpClient.put<Category>(`/api/admin/categories/${id}`, input);
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoUpdateCategory(id, input);
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await httpClient.delete(`/api/admin/categories/${id}`);
  } catch (err) {
    if (isOfflineError(err)) {
      demoDeleteCategory(id);
      return;
    }
    throw err;
  }
}
