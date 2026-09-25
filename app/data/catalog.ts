// Mock catalog data. The real one will come from the backend; keep this file as the single place the
// catalog UI reads products, categories and the page size from.

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

export interface CatalogProduct {
  id: number;
  /** URL segment of the product page: /products/<slug>. */
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  isNew: boolean;
}

export const PAGE_SIZE = 9;

/** Reads the `?category=` value of a link into a filter: a category name (any case), "new", or everything. */
export function parseFilter(value: string | undefined): CatalogFilter {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "new") return "new";
  if (v === "watch") return "Apple Watch"; // the home page calls it just "Watch"
  return CATEGORIES.find((category) => category.toLowerCase() === v) ?? "all";
}

// Placeholder photo: every product uses the same one until the real images exist.
const IMAGE = "/images/catalog/airpods-pro-2.png";

const byCategory: Record<Category, { name: string; price: number; isNew?: boolean }[]> = {
  Iphone: [
    { name: "iPhone 18 Pro Max", price: 1199, isNew: true },
    { name: "iPhone 18 Pro", price: 1099, isNew: true },
    { name: "iPhone 18", price: 899 },
    { name: "iPhone Air", price: 999 },
    { name: "iPhone 17e", price: 599 },
  ],
  Macbook: [
    { name: "MacBook Neo", price: 699, isNew: true },
    { name: "MacBook Air 13\" M4", price: 1099 },
    { name: "MacBook Air 15\" M4", price: 1299 },
    { name: "MacBook Pro 14\" M5", price: 1599, isNew: true },
    { name: "MacBook Pro 16\" M5", price: 2499 },
  ],
  Ipad: [
    { name: "iPad Pro 13\"", price: 1299, isNew: true },
    { name: "iPad Pro 11\"", price: 999 },
    { name: "iPad Air", price: 599 },
    { name: "iPad mini", price: 499 },
    { name: "iPad", price: 349 },
  ],
  AirPods: [
    { name: "AirPods Pro 2 Gen", price: 249 },
    { name: "AirPods Pro 3", price: 249, isNew: true },
    { name: "AirPods Max", price: 549 },
    { name: "AirPods 4", price: 129 },
    { name: "AirPods 4 with ANC", price: 179 },
  ],
  "Apple Watch": [
    { name: "Apple Watch Ultra 3", price: 799, isNew: true },
    { name: "Apple Watch Series 11", price: 399 },
    { name: "Apple Watch SE 3", price: 249 },
    { name: "Apple Watch Hermès", price: 1249 },
  ],
  "Apple Vision Pro": [{ name: "Apple Vision Pro", price: 3499, isNew: true }],
  Accesories: [
    { name: "MagSafe Charger", price: 39 },
    { name: "USB-C Charge Cable", price: 19 },
    { name: "Apple Pencil Pro", price: 129, isNew: true },
    { name: "Magic Keyboard", price: 299 },
    { name: "Silicone Case", price: 49 },
    { name: "AirTag", price: 29 },
  ],
};

/** "MacBook Air 13" M4" -> "macbook-air-13-m4". */
function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Interleave the categories (one of each per round) so the unfiltered list, and every page of it,
// mixes them instead of listing one category after another.
function buildProducts(): CatalogProduct[] {
  const queues = CATEGORIES.map((category) => byCategory[category].map((p) => ({ ...p, category })));
  const rounds = Math.max(...queues.map((q) => q.length));
  const products: CatalogProduct[] = [];
  for (let round = 0; round < rounds; round++) {
    for (const queue of queues) {
      const item = queue[round];
      if (item) {
        products.push({
          id: products.length + 1,
          slug: slugify(item.name),
          name: item.name,
          category: item.category,
          price: item.price,
          image: IMAGE,
          isNew: item.isNew ?? false,
        });
      }
    }
  }
  return products;
}

export const PRODUCTS: CatalogProduct[] = buildProducts();

/** The product behind a /products/<slug> URL, or undefined (the page then answers 404). */
export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Lowercase, no accents: "Hermès" matches "hermes". */
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Products that match the sidebar filter and every word of the search text. */
export function filterProducts(filter: CatalogFilter, query: string): CatalogProduct[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return PRODUCTS.filter((product) => {
    if (filter === "new" && !product.isNew) return false;
    if (filter !== "all" && filter !== "new" && product.category !== filter) return false;
    const haystack = normalize(`${product.name} ${product.category}`);
    return words.every((word) => haystack.includes(word));
  });
}
