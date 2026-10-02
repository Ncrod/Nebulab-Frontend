"use client";

import { api } from "./api";
import { createResource } from "./resource";

// The public list of categories, shared by the shop: the catalog filters, the home page's category links. No
// token needed (anyone can read it) and it never changes per session, so it has no `owner`.

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

const store = createResource(() => api<CategoryItem[]>("/categories/"), [] as CategoryItem[]);

export const useCategories = store.use;
export const invalidatePublicCategories = store.invalidate;
