/**
 * Delivery fee + free-delivery threshold per market — ONE source of truth for
 * every frontend surface (Shop, ShopDetails, Cart, Checkout, CheckoutTemp),
 * mirroring the backend `OrderService` maps:
 *   fees       IN ₹40 · SG S$5 · US $5 · AE د.إ15 (default 40)
 *   thresholds IN ₹1000 · SG S$20 · US $15 · AE د.إ60 (default 1000)
 * All values are in the ORDER'S OWN CURRENCY (never converted here).
 */

export const DELIVERY_FEES: Record<string, number> = { IN: 40, SG: 5, US: 5, AE: 15 };
export const DEFAULT_DELIVERY_FEE = 40;

export const FREE_DELIVERY_THRESHOLDS: Record<string, number> = { IN: 1000, SG: 20, US: 15, AE: 60 };
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 1000;

export function freeDeliveryThresholdFor(country: string | null | undefined): number {
  return FREE_DELIVERY_THRESHOLDS[(country ?? '').toUpperCase()] ?? DEFAULT_FREE_DELIVERY_THRESHOLD;
}

export function deliveryFeeFor(country: string | null | undefined, subtotal: number): number {
  return subtotal >= freeDeliveryThresholdFor(country)
    ? 0
    : (DELIVERY_FEES[(country ?? '').toUpperCase()] ?? DEFAULT_DELIVERY_FEE);
}
