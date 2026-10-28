import httpClient from './httpClient';
import { assetUrl } from './contentApi';
import type { AdminProduct, PageResponse } from '../types';
import {
  demoDeactivateProduct,
  demoSetProductVisibility,
  isOfflineError,
} from './demo/demoAdmin';

/** Resolve /uploads/... image paths against the API origin (absolute URLs pass through). */
function mapProduct(p: AdminProduct): AdminProduct {
  return { ...p, imageUrl: assetUrl(p.imageUrl) };
}

export interface ListAdminProductsParams {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  basePrice: number;
  oldPrice?: number;
  unit: string;
  sku: string;
  imageUrl?: string;
  discountPct?: number;
  badges?: string[];
  /** Market the entered price belongs to — backend stores it as that region's override. */
  countryCode?: string;
}

export interface UpdateProductInput {
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  oldPrice?: number;
  unit: string;
  imageUrl?: string;
  discountPct?: number;
  badges?: string[];
  active: boolean;
  /** When set, basePrice/oldPrice update this region's shop price instead of the SGD base. */
  countryCode?: string;
}

export async function listProducts(params: ListAdminProductsParams): Promise<PageResponse<AdminProduct>> {
  try {
    const { data } = await httpClient.get<PageResponse<AdminProduct>>('/api/admin/products', { params });
    return { ...data, content: data.content.map(mapProduct) };
  } catch (err) {
        throw err;
  }
}

export async function createProduct(input: CreateProductInput): Promise<AdminProduct> {
  try {
    const { data } = await httpClient.post<AdminProduct>('/api/admin/products', input);
    return mapProduct(data);
  } catch (err) {
        throw err;
  }
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<AdminProduct> {
  try {
    const { data } = await httpClient.put<AdminProduct>(`/api/admin/products/${id}`, input);
    return mapProduct(data);
  } catch (err) {
        throw err;
  }
}

export async function deactivateProduct(id: string): Promise<void> {
  try {
    await httpClient.delete(`/api/admin/products/${id}`);
  } catch (err) {
    if (isOfflineError(err)) {
      demoDeactivateProduct(id);
      return;
    }
    throw err;
  }
}

/**
 * Show/hide a product on the storefront.
 *
 * Backed by its own endpoint that accepts only the `active` flag, so a visibility change
 * can never carry — or silently rewrite — a price, and it works with the dedicated
 * "Hide / Show" permission as well as full Edit.
 */
export async function setProductVisibility(id: string, active: boolean): Promise<AdminProduct> {
  try {
    const { data } = await httpClient.put<AdminProduct>(`/api/admin/products/${id}/visibility`, null, {
      params: { active },
    });
    return mapProduct(data);
  } catch (err) {
    if (isOfflineError(err)) {
      return mapProduct(demoSetProductVisibility(id, active));
    }
    throw err;
  }
}

