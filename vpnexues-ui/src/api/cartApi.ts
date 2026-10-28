import httpClient from './httpClient';
import type { Cart } from '../types';

export async function getCart(country: string): Promise<Cart> {
  const { data } = await httpClient.get<Cart>('/api/cart', { params: { country } });
  return data;
}

export async function addCartItem(productId: string, qty: number, country: string): Promise<Cart> {
  const { data } = await httpClient.post<Cart>('/api/cart/items', { productId, qty }, { params: { country } });
  return data;
}

/**
 * Upserts a Small/Big Box line for a product — qty/weightKg is the new ABSOLUTE value for that
 * product+boxType, not an increment (matches the box-builder page's toggle/stepper interaction).
 */
export async function setBoxItem(
  productId: string,
  boxType: 'SMALL_BOX' | 'BIG_BOX',
  qty: number,
  weightKg: number | null,
  country: string
): Promise<Cart> {
  const { data } = await httpClient.post<Cart>(
    '/api/cart/items',
    { productId, qty, boxType, weightKg },
    { params: { country } }
  );
  return data;
}

export async function updateCartItem(itemId: string, qty: number, weightKg?: number): Promise<Cart> {
  const { data } = await httpClient.put<Cart>(`/api/cart/items/${itemId}`, { qty, weightKg });
  return data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await httpClient.delete<Cart>(`/api/cart/items/${itemId}`);
  return data;
}

export async function clearCart(): Promise<Cart> {
  const { data } = await httpClient.delete<Cart>('/api/cart');
  return data;
}
