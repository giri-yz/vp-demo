import httpClient from './httpClient';
import type { StoreSettings } from '../types';
import { demoGetSettings, demoUpdateSettings, isOfflineError } from './demo/demoAdmin';

export async function getSettings(): Promise<StoreSettings> {
  try {
    const { data } = await httpClient.get<StoreSettings>('/api/admin/settings');
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoGetSettings();
    throw err;
  }
}

export async function updateSettings(input: StoreSettings): Promise<StoreSettings> {
  try {
    const { data } = await httpClient.put<StoreSettings>('/api/admin/settings', input);
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoUpdateSettings(input);
    throw err;
  }
}
