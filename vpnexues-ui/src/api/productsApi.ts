import httpClient from './httpClient';
import type { PageResponse, Product } from '../types';
import { getMockProducts } from './mockProducts'; // TODO: replace with real API when endpoint ready
import { assetUrl } from './contentApi';

function mapProduct(p: Product): Product {
  return { ...p, imageUrl: assetUrl(p.imageUrl) };
}

/* TEMPORARY (head instruction, 07-Oct-2026): beverages must not appear on any
   storefront page until we're told otherwise. Remove this list to bring them back.
   Server-side: sent as `excludeCategory` so paging/totals stay exact.
   Client-side: filter below is the safety net while the backend is still on an
   older build that ignores the param. */
export const HIDDEN_CATEGORIES = ['Beverages'];

function isHiddenCategory(p: Product): boolean {
  const cat = (p.category ?? '').trim().toLowerCase();
  return HIDDEN_CATEGORIES.some((c) => c.toLowerCase() === cat);
}

function applyHiddenCategories(page: PageResponse<Product>): PageResponse<Product> {
  if (!page.content.some(isHiddenCategory)) return page;
  const content = page.content.filter((p) => !isHiddenCategory(p));
  const removed = page.content.length - content.length;
  const size = page.size > 0 ? page.size : content.length + removed;
  const totalElements = Math.max(0, page.totalElements - removed);
  return {
    ...page,
    content,
    totalElements,
    totalPages: size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : page.totalPages,
  };
}

function mapPage(page: PageResponse<Product>): PageResponse<Product> {
  return applyHiddenCategories({ ...page, content: page.content.map(mapProduct) });
}

export interface ListProductsParams {
  category?: string;
  search?: string;
  recipeProductNames?: string[];
  country: string;
  page?: number;
  size?: number;
}

const CATALOG_FETCH_SIZE = 200; // backend caps page size at 200

/* The backend has no recipe filter (it ignores `recipeProductNames` and returns the
   first bestseller page), so a recipe's ingredients that sit beyond that page never
   showed. Load the whole catalog and select the recipe's products client-side,
   keeping the recipe's ingredient order. */
async function listRecipeProducts(params: ListProductsParams): Promise<PageResponse<Product>> {
  const { recipeProductNames = [], page = 0, size = 24, ...rest } = params;
  const all: Product[] = [];
  let totalPages = 1;
  for (let p = 0; p < totalPages; p++) {
    const res = await listProducts({ ...rest, page: p, size: CATALOG_FETCH_SIZE });
    all.push(...res.content);
    totalPages = res.totalPages;
  }
  const wanted = recipeProductNames.map((n) => n.trim().toLowerCase());
  const matched = wanted
    .map((n) => all.find((p) => p.name.trim().toLowerCase() === n))
    .filter((p, i, arr): p is Product => !!p && arr.indexOf(p) === i);
  const totalElements = matched.length;
  return {
    content: matched.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
  };
}

export async function listProducts(params: ListProductsParams): Promise<PageResponse<Product>> {
  if (params.recipeProductNames && params.recipeProductNames.length > 0) {
    return listRecipeProducts(params);
  }
  try {
    /* Backend list takes ~5-6s (price-override lookups) — the default 10s axios
       timeout was tripping it, sending every caller into the mock fallback whose
       ids never match backend cart/product UUIDs. */
    const { data } = await httpClient.get<PageResponse<Product>>('/api/products', {
      params: { ...params, excludeCategory: HIDDEN_CATEGORIES.join(',') },
      timeout: 25000,
    });
    return mapPage(data);
  } catch (err) {
    // DEV-only: mock ids are numeric strings the backend rejects (@NotNull UUID),
    // so a production fake catalog silently breaks add-to-cart (400). Prod must
    // surface the real failure; dev keeps the offline mock.
    if (!import.meta.env.DEV) throw err;
    const e = err as { code?: string; message?: string; response?: { status?: number } };
    console.warn('[productsApi] fell back to mock:', e?.code, e?.message, e?.response?.status);
    return mapPage(getMockProducts(params));
  }
}

export async function getProductBySlug(slug: string, country: string): Promise<Product> {
  try {
    const { data } = await httpClient.get<Product>(`/api/products/${slug}`, { params: { country }, timeout: 25000 });
    return mapProduct(data);
  } catch (err) {
    // A dead/unknown slug (or a cold-start failure) must NOT silently render the
    // FIRST mock product under the requested URL — wrong name/price/images, and its
    // mock id can't even be added to the server cart. Propagate so the page can show
    // its not-found/error state instead.
    throw err;
  }
}
