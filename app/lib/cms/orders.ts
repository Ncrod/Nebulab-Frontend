"use client";

import { clearCart, type CartItem } from "../cart";
import { findOrCreateCustomer } from "./customers";
import { TAX_RATE, getDemoData } from "./demo-data";
import { adjustStock, readProducts } from "./products";
import { createStore } from "./store";
import type { Order, OrderLine, OrderStatus, ShippingAddress } from "./types";

export { TAX_RATE };

const store = createStore<Order[]>("nebulab-cms-orders-v2", () => getDemoData().orders, []);

export const useOrders = store.use;
export const readOrders = store.read;
export const resetOrders = store.reset;

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface CheckoutInput {
  name: string;
  email: string;
  shipping: ShippingAddress;
  cardLast4: string;
  items: CartItem[];
}

/**
 * The shop's "Pay": creates the order (and the customer, if this email is new), takes the units out of the stock
 * and empties the bag. The backend will do all of this in one transaction.
 */
export function placeOrder({ name, email, shipping, cardLast4, items }: CheckoutInput): Order {
  const now = new Date().toISOString();
  const products = readProducts();

  const lines: OrderLine[] = items.map((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return {
      productId: product?.id ?? null,
      slug: item.slug,
      name: item.name,
      category: product?.category ?? null,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const tax = round2(subtotal * TAX_RATE);
  const customer = findOrCreateCustomer(name, email);

  const orders = store.read();
  const nextNumber = orders.reduce((max, order) => Math.max(max, Number(order.number.replace("NB-", "")) || 1000), 1000) + 1;
  const order: Order = {
    id: `ord_${String(nextNumber - 1000).padStart(4, "0")}`,
    number: `NB-${nextNumber}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    lines,
    subtotal,
    taxRate: TAX_RATE,
    tax,
    total: round2(subtotal + tax),
    status: "paid",
    shippingAddress: shipping,
    cardLast4,
    createdAt: now,
    updatedAt: now,
  };
  store.write([order, ...orders]);
  adjustStock(lines.map((line) => ({ slug: line.slug, delta: -line.quantity })));
  clearCart();
  return order;
}

const returnsStock = (status: OrderStatus) => status === "cancelled" || status === "refunded";

/** Changes an order's status. Cancelling/refunding gives the units back to the stock; undoing that takes them again. */
export function setOrderStatus(id: string, status: OrderStatus) {
  const order = store.read().find((o) => o.id === id);
  if (!order || order.status === status) return;
  if (returnsStock(status) !== returnsStock(order.status)) {
    const sign = returnsStock(status) ? 1 : -1;
    adjustStock(order.lines.map((line) => ({ slug: line.slug, delta: sign * line.quantity })));
  }
  const now = new Date().toISOString();
  store.update((orders) => orders.map((o) => (o.id === id ? { ...o, status, updatedAt: now } : o)));
}
