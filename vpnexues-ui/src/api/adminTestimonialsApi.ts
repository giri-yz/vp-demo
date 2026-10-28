import httpClient from './httpClient';
import type { Testimonial } from '../types';
import {
  demoCreateTestimonial,
  demoListTestimonials,
  demoRemoveTestimonial,
  demoUpdateTestimonial,
  isOfflineError,
} from './demo/demoAdmin';

export interface TestimonialInput {
  name: string;
  role?: string;
  location?: string;
  rating: number;
  quote: string;
  photoUrl?: string;
}

export async function listAll(): Promise<Testimonial[]> {
  try {
    const { data } = await httpClient.get<Testimonial[]>('/api/admin/testimonials');
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoListTestimonials();
    throw err;
  }
}

export async function create(input: TestimonialInput): Promise<Testimonial> {
  try {
    const { data } = await httpClient.post<Testimonial>('/api/admin/testimonials', input);
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoCreateTestimonial(input);
    throw err;
  }
}

export async function update(id: string, input: TestimonialInput & { active: boolean }): Promise<Testimonial> {
  try {
    const { data } = await httpClient.put<Testimonial>(`/api/admin/testimonials/${id}`, input);
    return data;
  } catch (err) {
    if (isOfflineError(err)) return demoUpdateTestimonial(id, input);
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await httpClient.delete(`/api/admin/testimonials/${id}`);
  } catch (err) {
    if (isOfflineError(err)) {
      demoRemoveTestimonial(id);
      return;
    }
    throw err;
  }
}
