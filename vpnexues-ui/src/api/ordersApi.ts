import httpClient from './httpClient';
import type { CheckoutInput, Order } from '../types';

export async function checkout(input: CheckoutInput, country: string): Promise<Order> {
  const { data } = await httpClient.post<Order>('/api/orders', input, { params: { country } });
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await httpClient.get<Order[]>('/api/orders');
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await httpClient.get<Order>(`/api/orders/${id}`);
  return data;
}

export async function getOrderTracking(id: string): Promise<Order> {
  const { data } = await httpClient.get<Order>(`/api/orders/${id}/tracking`);
  return data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await httpClient.post<Order>(`/api/orders/${id}/cancel`);
  return data;
}
