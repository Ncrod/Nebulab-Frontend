import type { CatalogProduct } from "../data/catalog";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://nebuback.onrender.com/api";

/**
 * A live product, read on the server (only for the page title). It gives up after a few seconds and answers null: the API may be
 * waking up, and the title is not worth making the page wait for it.
 */
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const response = await fetch(`${API}/products/${encodeURIComponent(slug)}/`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(3000) });
    return response.ok ? ((await response.json()) as CatalogProduct) : null;
  } catch {
    return null;
  }
}
