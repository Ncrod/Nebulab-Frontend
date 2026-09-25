"use client";

import { useSyncExternalStore } from "react";

// Mock cart, kept in the browser (localStorage) until the backend has a real one. Everything that reads or
// changes the cart goes through this file, so swapping the storage for an API later only touches it.

/** One chosen attribute: { name: "Storage", value: "256GB" }. */
export interface ChosenOption {
  name: string;
  value: string;
}

export interface CartItem {
  /** slug + chosen options: the same product with other options is another line. */
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  options: ChosenOption[];
  quantity: number;
}

const KEY = "nebulab-cart";
const EMPTY: CartItem[] = [];

const listeners = new Set<() => void>();
let cache: { raw: string | null; items: CartItem[] } | null = null;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY; // storage blocked (private window, site data off): the cart just starts empty
  }
  // useSyncExternalStore compares snapshots by identity: parse only when the stored text changed.
  if (cache && cache.raw === raw) return cache.items;
  let items = EMPTY;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed.map(normalize);
    } catch {
      items = EMPTY;
    }
  }
  cache = { raw, items };
  return items;
}

/** Carts saved before options became a list had `storage` and `color` fields: read them as options. */
function normalize(stored: Partial<CartItem> & { storage?: string | null; color?: string | null }): CartItem {
  const options =
    stored.options ??
    [
      stored.storage ? { name: "Storage", value: stored.storage } : null,
      stored.color ? { name: "Color", value: stored.color } : null,
    ].filter((option): option is ChosenOption => option !== null);
  return { ...(stored as CartItem), options };
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // another tab changed the cart
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Adds one unit; the same product with the same options adds to its existing line. Products with no attributes pass []. */
export function addToCart(product: Pick<CartItem, "slug" | "name" | "price" | "image">, options: ChosenOption[]) {
  const id = [product.slug, ...options.map((option) => option.value)].join("|");
  const items = [...read()];
  const line = items.find((item) => item.id === id);
  if (line) {
    items[items.indexOf(line)] = { ...line, quantity: line.quantity + 1 };
  } else {
    // Only the fields of a line are copied, so nothing else the caller passes can overwrite the line's own id.
    items.push({ id, slug: product.slug, name: product.name, price: product.price, image: product.image, options, quantity: 1 });
  }
  save(items);
}

function save(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    return; // could not save (blocked or full): nothing changed
  }
  listeners.forEach((listener) => listener());
}

/** Changes a line's quantity by `delta`; a line that reaches 0 is removed. */
export function changeQuantity(id: string, delta: number) {
  const items = read()
    .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
    .filter((item) => item.quantity > 0);
  save(items);
}

/** Empties the cart (after an order is placed). */
export function clearCart() {
  save(EMPTY);
}

/** The cart lines, live: components re-render when anything adds to the cart. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
