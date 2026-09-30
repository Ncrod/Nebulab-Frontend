"use client";

import { api, readSession } from "./api";
import { createResource } from "./resource";

// The shopper's bag, kept by the API (one per account). Every call answers with the whole cart, prices and totals
// included, so nothing is calculated in the browser.

/** One chosen attribute: { name: "Storage", value: "256GB" }. */
export interface ChosenOption {
  name: string;
  value: string;
}

export interface CartItem {
  /** Id of the line (an integer given by the server). */
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  options: ChosenOption[];
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

const EMPTY_CART: Cart = { items: [], subtotal: 0, taxRate: 0, tax: 0, total: 0 };

const store = createResource(async () => (readSession("customer") ? api<Cart>("/cart/", { session: "customer" }) : EMPTY_CART), EMPTY_CART, "customer");

/** The cart, live. `loading` is true until the server has answered. */
export const useCart = store.use;

export const refreshCart = store.refresh;

/** Adds one unit; the same product with the same options adds to its existing line. Products with no attributes pass []. Throws ApiError. */
export async function addToCart(slug: string, options: ChosenOption[]) {
  store.set(await api<Cart>("/cart/items/", { method: "POST", session: "customer", body: { slug, options } }));
}

/** Sets the final quantity of a line; 0 removes it. Throws ApiError ("Only 3 left in stock."). */
export async function changeQuantity(id: number, quantity: number) {
  store.set(await api<Cart>(`/cart/items/${id}/`, { method: "PATCH", session: "customer", body: { quantity } }));
}
