import httpClient from './httpClient';
import type { CouponApplyResult } from '../types';

export async function applyCoupon(code: string, country: string): Promise<CouponApplyResult> {
  const { data } = await httpClient.post<CouponApplyResult>(
    '/api/coupons/apply',
    { code },
    { params: { country } }
  );
  return data;
}

/** Raw English message the backend sends when the shopper isn't eligible (CouponService). */
export const COUPON_NOT_ELIGIBLE_MESSAGE = 'You are not eligible for this coupon code';

/**
 * Maps a backend coupon message to a `cart.*` i18n key so the UI shows it in the
 * shopper's language. Returns '' for unknown messages.
 */
export function couponMessageKey(message: string | undefined): string {
  switch ((message ?? '').trim()) {
    case 'Coupon applied':
      return 'cart.couponApplied';
    case COUPON_NOT_ELIGIBLE_MESSAGE:
      return 'cart.couponNotEligible';
    case 'This coupon has expired':
      return 'cart.couponExpired';
    case 'Invalid or expired coupon code':
      return 'cart.couponInvalid';
    default:
      return '';
  }
}
