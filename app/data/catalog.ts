// Mock catalog data. The real one will come from the backend. This file holds the SEED of the catalog (what the
// store starts with) and the pure helpers; at runtime the products live in the CMS store (../lib/cms/products),
// which starts from this seed and is what the admin edits and the shop reads.

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

export const DEFAULT_DESCRIPTION =
  "Our most advanced series of chips ever built for a pro laptop. Each chip in the M5 family delivers phenomenal single- and multithreaded CPU performance and faster unified memory.";

/** Reads the `?category=` value of a link into a filter: a category name (any case), "new", or everything. */
export function parseFilter(value: string | undefined): CatalogFilter {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "new") return "new";
  if (v === "watch") return "Apple Watch"; // the home page calls it just "Watch"
  return CATEGORIES.find((category) => category.toLowerCase() === v) ?? "all";
}

// Placeholder photo: every product uses the same one until the real images exist.
const IMAGE = "/images/catalog/airpods-pro-2.png";

const storage = (...values: string[]): ProductOption => ({ name: "Storage", values, layout: "stack" });
const color = (...values: string[]): ProductOption => ({ name: "Color", values });
const size = (...values: string[]): ProductOption => ({ name: "Size", values });

// Each product lists only the attributes it really has: several, just one (only colour), or none at all.
const byCategory: Record<Category, { name: string; price: number; isNew?: boolean; options?: ProductOption[] }[]> = {
  Iphone: [
    { name: "iPhone 18 Pro Max", price: 1199, isNew: true, options: [storage("256GB", "512GB", "1TB", "2TB"), color("Silver", "Cosmic Orange", "Deep Blue")] },
    { name: "iPhone 18 Pro", price: 1099, isNew: true, options: [storage("256GB", "512GB", "1TB"), color("Silver", "Cosmic Orange", "Deep Blue")] },
    { name: "iPhone 18", price: 899, options: [storage("128GB", "256GB", "512GB"), color("Black", "White", "Pink", "Ultramarine")] },
    { name: "iPhone Air", price: 999, options: [storage("256GB", "512GB", "1TB"), color("Space Black", "Cloud White")] },
    { name: "iPhone 17e", price: 599, options: [color("Black", "White")] },
  ],
  Macbook: [
    // The options of the design (Figma 114:307), "Citrus" repeated as drawn there.
    { name: "MacBook Neo", price: 699, isNew: true, options: [storage("256GB", "1TB", "2TB"), color("Silver", "Blush", "Citrus", "Citrus")] },
    { name: "MacBook Air 13\" M4", price: 1099, options: [storage("256GB", "512GB", "1TB"), color("Midnight", "Starlight", "Sky Blue", "Silver")] },
    { name: "MacBook Air 15\" M4", price: 1299, options: [storage("256GB", "512GB", "1TB"), color("Midnight", "Starlight", "Sky Blue", "Silver")] },
    { name: "MacBook Pro 14\" M5", price: 1599, isNew: true, options: [storage("512GB", "1TB", "2TB"), color("Space Black", "Silver")] },
    { name: "MacBook Pro 16\" M5", price: 2499, options: [storage("1TB", "2TB", "4TB")] },
  ],
  Ipad: [
    { name: "iPad Pro 13\"", price: 1299, isNew: true, options: [storage("256GB", "512GB", "1TB", "2TB"), color("Silver", "Space Black")] },
    { name: "iPad Pro 11\"", price: 999, options: [storage("256GB", "512GB", "1TB", "2TB"), color("Silver", "Space Black")] },
    { name: "iPad Air", price: 599, options: [storage("128GB", "256GB", "512GB"), color("Blue", "Purple", "Starlight")] },
    { name: "iPad mini", price: 499, options: [color("Blue", "Purple", "Starlight", "Space Gray")] },
    { name: "iPad", price: 349, options: [storage("128GB", "256GB"), color("Blue", "Pink", "Silver")] },
  ],
  AirPods: [
    { name: "AirPods Pro 2 Gen", price: 249 },
    { name: "AirPods Pro 3", price: 249, isNew: true },
    { name: "AirPods Max", price: 549, options: [color("Midnight", "Starlight", "Blue", "Purple", "Orange")] },
    { name: "AirPods 4", price: 129 },
    { name: "AirPods 4 with ANC", price: 179 },
  ],
  "Apple Watch": [
    { name: "Apple Watch Ultra 3", price: 799, isNew: true, options: [color("Natural", "Black")] },
    { name: "Apple Watch Series 11", price: 399, options: [size("42mm", "46mm"), color("Jet Black", "Rose Gold", "Silver")] },
    { name: "Apple Watch SE 3", price: 249, options: [size("40mm", "44mm"), color("Midnight", "Starlight")] },
    { name: "Apple Watch Hermès", price: 1249, options: [size("42mm", "46mm")] },
  ],
  "Apple Vision Pro": [{ name: "Apple Vision Pro", price: 3499, isNew: true, options: [storage("256GB", "512GB", "1TB")] }],
  Accesories: [
    { name: "MagSafe Charger", price: 39 },
    { name: "USB-C Charge Cable", price: 19, options: [{ name: "Length", values: ["1 m", "2 m"] }] },
    { name: "Apple Pencil Pro", price: 129, isNew: true },
    { name: "Magic Keyboard", price: 299, options: [color("Black", "White")] },
    { name: "Silicone Case", price: 49, options: [color("Black", "Midnight", "Stone Gray", "Pink", "Blue", "Orange", "Clay")] },
    { name: "AirTag", price: 29, options: [{ name: "Pack", values: ["1 Pack", "4 Pack"] }] },
  ],
};

/** "MacBook Air 13" M4" -> "macbook-air-13-m4". */
export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Products the home carousel shows out of the box. */
const SEED_RECOMMENDED = ["ipad-pro-13", "iphone-18-pro-max", "apple-watch-ultra-3", "airpods-pro-2-gen", "macbook-air-13-m4"];

const SEED_DATE = "2026-01-15T12:00:00.000Z";

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
        const slug = slugify(item.name);
        products.push({
          id: products.length + 1,
          slug,
          name: item.name,
          category: item.category,
          price: item.price,
          image: IMAGE,
          isNew: item.isNew ?? false,
          recommended: SEED_RECOMMENDED.includes(slug),
          options: item.options ?? [],
          status: "live",
          // Deterministic, so the server and the browser seed the same numbers (a couple of products start low).
          stock: (products.length + 1) % 9 === 0 ? 3 : 8 + ((products.length * 7) % 43),
          description: DEFAULT_DESCRIPTION,
          createdAt: SEED_DATE,
          updatedAt: SEED_DATE,
        });
      }
    }
  }
  return products;
}

/** What the catalog starts with. Runtime code reads the CMS store instead (../lib/cms/products). */
export const SEED_PRODUCTS: CatalogProduct[] = buildProducts();

/** A product of the seed by slug: only for server-rendered metadata. The pages read the CMS store. */
export function getSeedProductBySlug(slug: string): CatalogProduct | undefined {
  return SEED_PRODUCTS.find((product) => product.slug === slug);
}

/** Lowercase, no accents: "Hermès" matches "hermes". */
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Products that match the sidebar filter and every word of the search text. */
export function filterProducts(products: CatalogProduct[], filter: CatalogFilter, query: string): CatalogProduct[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (filter === "new" && !product.isNew) return false;
    if (filter !== "all" && filter !== "new" && product.category !== filter) return false;
    const haystack = normalize(`${product.name} ${product.category}`);
    return words.every((word) => haystack.includes(word));
  });
}
