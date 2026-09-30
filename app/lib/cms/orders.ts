"use client";

import { api, type Paginated } from "../api";
import { refreshCart } from "../cart";
import { useDebounced, useQuery } from "../resource";
import { invalidateCustomers } from "./customers";
import { invalidateProducts } from "./products";
import type { Order, OrderStatus, ShippingAddress } from "./types";

// Orders: the shop's checkout and the CMS "Sales" section, from the API. Totals, stock and the numbers of the cards and tabs
// are computed by the server.

export interface CheckoutInput {
  shippingAddress: ShippingAddress;
  cardLast4: string;
}

/**
 * The shop's "Pay". The server takes the customer from the session and the lines from their cart, takes the units out of the
 * stock and empties the cart. Throws ApiError (empty bag, no stock, blocked account, empty fields...).
 */
export async function placeOrder(input: CheckoutInput): Promise<Order> {
  const order = await api<Order>("/orders/", { method: "POST", session: "customer", body: input });
  await refreshCart();
  return order;
}

export interface OrdersSummary {
  revenue: number;
  orders: number;
  avgOrder: number;
}

export type StatusCounts = Record<OrderStatus | "all", number>;

interface OrdersPage extends Paginated<Order> {
  summary: OrdersSummary;
  statusCounts: StatusCounts;
}

const NO_SUMMARY: OrdersSummary = { revenue: 0, orders: 0, avgOrder: 0 };
const NO_COUNTS: StatusCounts = { all: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 };

export interface OrdersFilter {
  /** Orders placed in the last N days; "all" for no limit. */
  days: number | "all";
  status: OrderStatus | "all";
  search: string;
  /** Only the orders of this customer. */
  customer?: number;
  /** false: nothing is requested (the caller has nothing to show yet). */
  enabled?: boolean;
}

/** Every order that matches, with the `summary` of the cards and the `statusCounts` of the tabs (which ignore status and search). */
export function useAdminOrders({ days, status, search, customer, enabled = true }: OrdersFilter) {
  const text = useDebounced(search.trim(), 300);
  const params = new URLSearchParams();
  if (days !== "all") params.set("days", String(days));
  if (status !== "all") params.set("status", status);
  if (text) params.set("search", text);
  if (customer !== undefined) params.set("customer", String(customer));
  const key = `orders:${enabled}:${params}`;

  const result = useQuery(key, async () => {
    if (!enabled) return { orders: [] as Order[], summary: NO_SUMMARY, statusCounts: NO_COUNTS };
    // The tables sort and page in the browser, so every page of the answer is loaded (100 at a time).
    const first = await api<OrdersPage>(`/admin/orders/?${params}&page_size=100&page=1`, { session: "admin" });
    const orders = [...first.results];
    for (let page = 2, next = first.next; next; page++) {
      const more = await api<Paginated<Order>>(`/admin/orders/?${params}&page_size=100&page=${page}`, { session: "admin" });
      orders.push(...more.results);
      next = more.next;
    }
    return { orders, summary: first.summary, statusCounts: first.statusCounts };
  });

  return {
    orders: result.data?.orders ?? [],
    summary: result.data?.summary ?? NO_SUMMARY,
    statusCounts: result.data?.statusCounts ?? NO_COUNTS,
    loading: result.loading || text !== search.trim(),
    error: result.error,
    reload: result.reload,
  };
}

/** Changes an order's status. The server puts cancelled/refunded units back in the stock (and takes them again if that is undone). */
export async function setOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const order = await api<Order>(`/admin/orders/${id}/`, { method: "PATCH", session: "admin", body: { status } });
  // Stock and customer numbers changed on the server: those lists load again the next time they are shown.
  invalidateProducts();
  invalidateCustomers();
  return order;
}
