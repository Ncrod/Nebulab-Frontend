"use client";

import { api, apiAll } from "../api";
import { createResource } from "../resource";
import { invalidatePublicCategories } from "../categories";

// Categories, from the API. The shop reads the public list (see ../categories); the CMS reads and edits every one.

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  productsCount: number;
}

const store = createResource(() => apiAll<AdminCategory>("/admin/categories/", { session: "admin" }), [] as AdminCategory[], "admin");

/** Every category (the CMS). */
export const useCategories = store.use;
export const invalidateCategories = store.invalidate;

export interface CategoryInput {
  name: string;
  /** Left empty to let the server generate it from the name. */
  slug: string;
}

export const emptyCategory = (): CategoryInput => ({ name: "", slug: "" });

/** Is `name` used by another category? (`exceptId`: the one being edited.) */
export function isCategoryNameTaken(categories: AdminCategory[], name: string, exceptId?: number) {
  const wanted = name.trim().toLowerCase();
  return categories.some((category) => category.name.toLowerCase() === wanted && category.id !== exceptId);
}

/** Creates (no id) or updates (with id) a category. Returns the saved one; throws ApiError with the field errors. */
export async function saveCategory(input: CategoryInput, id?: number): Promise<AdminCategory> {
  const body: Partial<CategoryInput> = { name: input.name.trim() };
  if (input.slug.trim()) body.slug = input.slug.trim();
  const saved = await api<AdminCategory>(id === undefined ? "/admin/categories/" : `/admin/categories/${id}/`, {
    method: id === undefined ? "POST" : "PATCH",
    session: "admin",
    body,
  });
  store.update((categories) => (id === undefined ? [saved, ...categories] : categories.map((category) => (category.id === saved.id ? saved : category))));
  invalidatePublicCategories();
  return saved;
}

/** Runs one DELETE per id. What worked is kept; if any failed (e.g. a category still has products), the first error is thrown afterwards. */
export async function deleteCategories(ids: number[]) {
  const results = await Promise.allSettled(ids.map((id) => api<void>(`/admin/categories/${id}/`, { method: "DELETE", session: "admin" })));
  const done = ids.filter((_, i) => results[i].status === "fulfilled");
  store.update((categories) => categories.filter((category) => !done.includes(category.id)));
  if (done.length > 0) invalidatePublicCategories();
  const failed = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failed) throw failed.reason;
}
