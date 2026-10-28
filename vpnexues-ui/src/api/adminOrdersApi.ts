import httpClient from './httpClient';
import type { AdminOrderDetail, AdminOrderSummary, PageResponse } from '../types';

export interface ListAdminOrdersParams {
  status?: string;
  channel?: string;
  country?: string;
  buyerPhone?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export async function listOrders(params: ListAdminOrdersParams): Promise<PageResponse<AdminOrderSummary>> {
  try {
    const { data } = await httpClient.get<PageResponse<AdminOrderSummary>>('/api/admin/orders', { params });
    return data;
  } catch (err) {
        throw err;
  }
}

export async function getOrder(id: string): Promise<AdminOrderDetail> {
  try {
    const { data } = await httpClient.get<AdminOrderDetail>(`/api/admin/orders/${id}`);
    return data;
  } catch (err) {
        throw err;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<AdminOrderDetail> {
  try {
    const { data } = await httpClient.put<AdminOrderDetail>(`/api/admin/orders/${id}/status`, { status });
    return data;
  } catch (err) {
        throw err;
  }
}

