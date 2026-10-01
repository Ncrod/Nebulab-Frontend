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

/** One chosen value per attribute: [{ name: "Storage", value: "256GB" }, { name: "Color", value: "Black" }]. */
export type OptionChoice = { name: string; value: string };

/**
 * One buyable combination of the product's attributes (an iPhone 18 Pro Max, 256GB, Black). It carries its own final
 * price and its own stock, so the same product can cost more in 1TB than in 128GB and run out in one colour only.
 */
export interface ProductVariant {
  /** Given by the server. A combination added in the CMS form and not saved yet has none. */
  id?: number;
  /** One entry per attribute of the product, in the order of `options`. */
  options: OptionChoice[];
  /** Final unit price of this combination, in USD (not a surcharge over `price`). */
  price: number;
  /** Units available of this combination. 0 = that combination is sold out. */
  stock: number;
  /** Reference code, only shown in the CMS. */
  sku?: string;
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
  /**
   * The buyable combinations of `options`, each with its price and its stock. Empty when the product is sold as one
   * thing only: then `price` and `stock` are the real ones. With variants, `price` is the "from" price (the cheapest
   * combination) and `stock` the sum of them — both computed by the server.
   */
  variants: ProductVariant[];
  /** The cheapest and the dearest combination, computed by the server. Equal to `price` when there are no variants. */
  priceMin?: number;
  priceMax?: number;
  status: ProductStatus;
  /** Units in stock. With variants it is the sum of their stock. 0 = sold out. */
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

// ── Variants ──────────────────────────────────────────────────────────────────
// A combination is identified by its chosen values, not by a position: the same set of { name, value } pairs is the
// same variant whatever order they come in and whatever case they are written with.

const fold = (text: string) => text.trim().toLowerCase();

/**
 * Reads a product as the API sends it. `variants` is missing while the backend has not been updated yet: such a
 * product is simply one without combinations, priced and stocked by `price` and `stock`.
 */
export const readProduct = <T extends { variants?: ProductVariant[] }>(product: T): T & { variants: ProductVariant[] } => ({
  ...product,
  variants: Array.isArray(product.variants) ? product.variants : [],
});

/** "color=black|storage=256gb": the identity of a combination. */
export function variantKey(options: OptionChoice[]) {
  return options
    .map((option) => `${fold(option.name)}=${fold(option.value)}`)
    .sort()
    .join("|");
}

/** The variant of `product` that matches the chosen values exactly, or null (it was never configured). */
export function findVariant(product: Pick<CatalogProduct, "variants">, chosen: OptionChoice[]): ProductVariant | null {
  const key = variantKey(chosen);
  return product.variants.find((variant) => variantKey(variant.options) === key) ?? null;
}

/** Every combination of the attributes' values, in the order the attributes are listed. [] when there is no attribute. */
export function allCombinations(options: ProductOption[]): OptionChoice[][] {
  if (options.length === 0) return [];
  return options.reduce<OptionChoice[][]>(
    (combinations, option) => combinations.flatMap((combination) => option.values.map((value) => [...combination, { name: option.name, value }])),
    [[]],
  );
}

/** Does `variant` carry this value for this attribute? */
const carries = (variant: ProductVariant, name: string, value: string) =>
  variant.options.some((option) => fold(option.name) === fold(name) && fold(option.value) === fold(value));

/**
 * Is there anything left to sell with this value of this attribute? Only the value itself is looked at, so choosing
 * one attribute never disables another one for good: 128GB goes out only when no 128GB combination has stock.
 */
export function isValueInStock(product: Pick<CatalogProduct, "variants" | "stock">, name: string, value: string) {
  if (product.variants.length === 0) return product.stock > 0;
  return product.variants.some((variant) => variant.stock > 0 && carries(variant, name, value));
}

/** Can these values still be bought together? (Used to drop the choices that the last click made impossible.) */
export function isCombinationInStock(product: Pick<CatalogProduct, "variants" | "stock">, chosen: OptionChoice[]) {
  if (product.variants.length === 0) return product.stock > 0;
  return product.variants.some((variant) => variant.stock > 0 && chosen.every((choice) => carries(variant, choice.name, choice.value)));
}

/** The cheapest and the dearest combination. Without variants both are the product's price. The server computes them (`priceMin`/`priceMax`); this only covers a product read before the server sent those two fields. */
export function priceRange(product: Pick<CatalogProduct, "variants" | "price" | "priceMin" | "priceMax">): { min: number; max: number } {
  if (product.priceMin !== undefined && product.priceMax !== undefined) return { min: product.priceMin, max: product.priceMax };
  if (product.variants.length === 0) return { min: product.price, max: product.price };
  const prices = product.variants.map((variant) => variant.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** The units of a product: the sum of its variants, or its own stock. */
export const variantsStock = (variants: ProductVariant[]) => variants.reduce((total, variant) => total + (Number.isFinite(variant.stock) ? variant.stock : 0), 0);

/** "$1,299" with no cents when there are none, as the shop writes prices. */
export const formatPrice = (amount: number) => `$${Number.isInteger(amount) ? amount.toLocaleString("en-US") : amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
