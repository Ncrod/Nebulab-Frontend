// The catalog model and its pure helpers. The products themselves come from the API (see ../lib/cms/products).

export const CATEGORIES = [
  "Iphone",
  "Macbook",
  "Ipad",
  "AirPods",
  "Apple Watch",
  "Apple Vision Pro",
  "Accesories",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** What the sidebar can select: every product, only the new arrivals, or one category. */
export type CatalogFilter = "all" | "new" | Category;

/** An attribute the shopper must choose on the product page (storage, colour, size...). */
export interface ProductOption {
  name: string;
  values: string[];
  /** "stack": one full-width button per row (storage). "wrap" (default): buttons flowing in rows. */
  layout?: "stack" | "wrap";
}

/** "live" products show in the shop; "disabled" ones only exist in the CMS. */
export type ProductStatus = "live" | "disabled";

export interface CatalogProduct {
  id: number;
  /** URL segment of the product page: /products/<slug>. */
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  isNew: boolean;
  /** Shows in the carousel of the home page ("Selected to upgrade your day"). */
  recommended: boolean;
  /** What must be chosen before adding it to the bag. Empty when the product has no attributes. */
  options: ProductOption[];
  status: ProductStatus;
  /** Units in stock (per product, not per option combination). 0 = sold out. */
  stock: number;
  description: string;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

export const PAGE_SIZE = 9;

/** Stock at or under this is flagged as "low" in the CMS. */
export const LOW_STOCK = 5;

/** Reads the `?category=` value of a link into a filter: a category name (any case), "new", or everything. */
export function parseFilter(value: string | undefined): CatalogFilter {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "new") return "new";
  if (v === "watch") return "Apple Watch"; // the home page calls it just "Watch"
  return CATEGORIES.find((category) => category.toLowerCase() === v) ?? "all";
}

/** "MacBook Air 13" M4" -> "macbook-air-13-m4". */
export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
