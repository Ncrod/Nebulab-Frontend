"use client";

import { PAGE_SIZE, readProduct, type CatalogFilter, type CatalogProduct } from "../../data/catalog";
import { api, apiAll, type Paginated } from "../api";
import { createResource, useDebounced, useQuery } from "../resource";

// The catalog, from the API. The shop reads the public endpoints (only live products); the CMS reads and edits every product.

// ── Shop ──────────────────────────────────────────────────────────────────────

/** One page of the catalog with the sidebar filter and the search text applied by the server. */
export function useCatalogPage({ filter, query, page }: { filter: CatalogFilter; query: string; page: number }) {
  const search = useDebounced(query.trim(), 300);
  const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
  if (filter === "new") params.set("is_new", "true");
  else if (filter !== "all") params.set("category", filter);
  if (search) params.set("search", search);
  const path = `/products/?${params}`;

  const result = useQuery(path, async () => {
    const page = await api<Paginated<CatalogProduct>>(path);
    return { ...page, results: page.results.map(readProduct) };
  });
  return {
    products: result.data?.results ?? [],
    count: result.data?.count ?? 0,
    // While the text is still being debounced the list on screen is about to change too.
    loading: result.loading || search !== query.trim(),
    error: result.error,
    /** The requested page does not exist (the catalog got shorter): the caller goes back to page 1. */
    invalidPage: result.errorStatus === 404,
  };
}

/** The products marked "Recommended", for the carousel of the home page. */
const recommended = createResource(async () => (await api<Paginated<CatalogProduct>>("/products/?recommended=true&page_size=50")).results.map(readProduct), []);

export const useRecommendedProducts = () => recommended.use();

/** One live product by slug. `notFound`: it does not exist or is disabled. */
export function useProduct(slug: string) {
  const result = useQuery(`product:${slug}`, async () => readProduct(await api<CatalogProduct>(`/products/${encodeURIComponent(slug)}/`)));
  return {
    product: result.data?.slug === slug ? result.data : null,
    loading: result.loading,
    notFound: result.errorStatus === 404,
    error: result.error,
  };
}

// ── CMS ───────────────────────────────────────────────────────────────────────

const store = createResource(async () => (await apiAll<CatalogProduct>("/admin/products/", { session: "admin" })).map(readProduct), [] as CatalogProduct[], "admin");

/** Every product, live and disabled (the CMS). */
export const useProducts = store.use;
export const invalidateProducts = store.invalidate;

/** The data of a product that the admin form edits. */
export type ProductInput = Omit<CatalogProduct, "id" | "createdAt" | "updatedAt">;

export const emptyProduct = (): ProductInput => ({
  slug: "",
  name: "",
  // The editor fills this in as soon as the live category list loads (there is no fixed default anymore).
  category: "",
  price: 0,
  image: "/images/catalog/airpods-pro-2.png",
  isNew: false,
  recommended: false,
  options: [],
  variants: [],
  status: "live",
  stock: 0,
  description: "",
});

/** Is `slug` used by another product? (`exceptId`: the one being edited.) */
export function isSlugTaken(products: CatalogProduct[], slug: string, exceptId?: number) {
  return products.some((product) => product.slug === slug && product.id !== exceptId);
}

/** Creates (no id) or updates (with id) a product. Returns the saved one; throws ApiError with the field errors. */
export async function saveProduct(input: ProductInput, id?: number): Promise<CatalogProduct> {
  const saved = readProduct(
    await api<CatalogProduct>(id === undefined ? "/admin/products/" : `/admin/products/${id}/`, {
      method: id === undefined ? "POST" : "PATCH",
      session: "admin",
      body: input,
    }),
  );
  store.update((products) => (id === undefined ? [saved, ...products] : products.map((product) => (product.id === saved.id ? saved : product))));
  recommended.invalidate();
  return saved;
}

/** Runs one request per id. What worked is kept; if any failed, the first error is thrown afterwards. */
async function eachId(ids: number[], request: (id: number) => Promise<void>, onDone: (doneIds: number[]) => void) {
  const results = await Promise.allSettled(ids.map((id) => request(id)));
  onDone(ids.filter((_, i) => results[i].status === "fulfilled"));
  const failed = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failed) throw failed.reason;
}

export async function setProductStatus(ids: number[], status: CatalogProduct["status"]) {
  const updated = new Map<number, CatalogProduct>();
  await eachId(
    ids,
    async (id) => {
      updated.set(id, readProduct(await api<CatalogProduct>(`/admin/products/${id}/`, { method: "PATCH", session: "admin", body: { status } })));
    },
    () => store.update((products) => products.map((product) => updated.get(product.id) ?? product)),
  );
  recommended.invalidate();
}

export async function deleteProducts(ids: number[]) {
  await eachId(
    ids,
    (id) => api<void>(`/admin/products/${id}/`, { method: "DELETE", session: "admin" }),
    (done) => store.update((products) => products.filter((product) => !done.includes(product.id))),
  );
  recommended.invalidate();
}
