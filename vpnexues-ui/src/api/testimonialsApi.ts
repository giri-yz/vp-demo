import httpClient from './httpClient';
import type { Testimonial } from '../types';

/** Public, active-only testimonials — backs this marketing page and (potentially) the Home page later. */
export async function listPublicTestimonials(): Promise<Testimonial[]> {
  const { data } = await httpClient.get<Testimonial[]>('/api/testimonials');
  return data;
}
