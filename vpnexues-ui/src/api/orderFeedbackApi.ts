import httpClient from './httpClient';

export interface OrderFeedbackInput {
  orderNumber?: string;
  rating: number;
  tags?: string[];
  headline?: string;
  comment?: string;
  countryCode?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/** Public endpoint — submits the post-order feedback popup's rating/tags/review. */
export async function submitOrderFeedback(input: OrderFeedbackInput): Promise<void> {
  await httpClient.post('/api/order-feedback', input);
}
