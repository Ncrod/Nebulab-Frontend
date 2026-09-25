"use client";

import { SEED_PRODUCTS, slugify, type CatalogProduct } from "../../data/catalog";
import { createStore } from "./store";

// The catalog, editable. Starts as the seed of ../../data/catalog; the admin creates/edits/removes products here and
// the shop (catalog, product page) reads the same store, so a change shows up on both sides.

const store = createStore<CatalogProduct[]>("nebulab-cms-products-v2", () => SEED_PRODUCTS, SEED_PRODUCTS);

/** Every product, live and disabled (the CMS). */
export const useProducts = store.use;

/** Only what the shop may show. */
export function useLiveProducts(): CatalogProduct[] {
  const products = store.use();
  return products.filter((product) => product.status === "live");
}

export const readProducts = store.read;
export const resetProducts = store.reset;

/** The data of a product that the admin form edits. */
export type ProductInput = Omit<CatalogProduct, "id" | "createdAt" | "updatedAt">;

export const emptyProduct = (): ProductInput => ({
  slug: "",
  name: "",
  category: "Iphone",
  price: 0,
  image: "/images/catalog/airpods-pro-2.png",
  isNew: false,
  recommended: false,
  options: [],
  status: "live",
  stock: 0,
  description: "",
});

/** Is `slug` used by another product? (`exceptId`: the one being edited.) */
export function isSlugTaken(products: CatalogProduct[], slug: string, exceptId?: number) {
  return products.some((product) => product.slug === slug && product.id !== exceptId);
}

/** Creates (no id) or updates (with id) a product. Returns the saved one. */
export function saveProduct(input: ProductInput, id?: number): CatalogProduct {
  const now = new Date().toISOString();
  const products = store.read();
  const slug = slugify(input.slug || input.name);
  if (id === undefined) {
    const created: CatalogProduct = {
      ...input,
      slug,
      id: products.reduce((max, product) => Math.max(max, product.id), 0) + 1,
      createdAt: now,
      updatedAt: now,
    };
    store.write([created, ...products]);
    return created;
  }
  let saved!: CatalogProduct;
  store.write(
    products.map((product) => {
      if (product.id !== id) return product;
      saved = { ...product, ...input, slug, updatedAt: now };
      return saved;
    }),
  );
  return saved;
}

export function setProductStatus(ids: number[], status: CatalogProduct["status"]) {
  const now = new Date().toISOString();
  store.update((products) => products.map((product) => (ids.includes(product.id) ? { ...product, status, updatedAt: now } : product)));
}

export function deleteProducts(ids: number[]) {
  store.update((products) => products.filter((product) => !ids.includes(product.id)));
}

/** Adds (or, with a negative delta, takes) units of stock. Never goes under 0. */
export function adjustStock(changes: { slug: string; delta: number }[]) {
  store.update((products) =>
    products.map((product) => {
      const total = changes.filter((change) => change.slug === product.slug).reduce((sum, change) => sum + change.delta, 0);
      return total === 0 ? product : { ...product, stock: Math.max(0, product.stock + total) };
    }),
  );
}
