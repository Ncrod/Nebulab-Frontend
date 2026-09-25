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

/** An attribute the shopper must choose on the product page (storage, colour, size...). */
export interface ProductOption {
  name: string;
  values: string[];
  /** "stack": one full-width button per row (storage). "wrap" (default): buttons flowing in rows. */
  layout?: "stack" | "wrap";
}

export interface CatalogProduct {
  id: number;
  /** URL segment of the product page: /products/<slug>. */
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  isNew: boolean;
  /** What must be chosen before adding it to the bag. Empty when the product has no attributes. */
  options: ProductOption[];
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
          options: item.options ?? [],
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
