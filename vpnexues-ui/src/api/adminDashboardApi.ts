import httpClient from './httpClient';
import type { DashboardSummary } from '../types';
import { demoGetSummary, isOfflineError } from './demo/demoAdmin';

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await httpClient.get<DashboardSummary>('/api/admin/dashboard/summary');
  return data;
}
