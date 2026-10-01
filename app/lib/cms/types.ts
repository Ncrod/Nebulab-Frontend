// The data model of the CMS, as the API sends it (camelCase JSON). Ids are integers, dates are ISO 8601 strings in UTC and
// money is a plain number in USD. Totals, stock and statistics are always computed by the server.

import type { ChosenOption } from "../cart";
import type { Category } from "../../data/catalog";

export type { CatalogProduct as Product, ProductOption, ProductVariant, ProductStatus, Category } from "../../data/catalog";
export type { ChosenOption } from "../cart";

export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: number;
  name: string;
  /** Unique (compared lowercase). */
  email: string;
  status: CustomerStatus;
  /** Internal note, only visible in the CMS. */
  notes: string;
  createdAt: string;
  ordersCount: number;
  /** Money from the orders that count as revenue. */
  totalSpent: number;
  lastOrderAt: string | null;
}

/** paid -> shipped -> delivered is the normal way; cancelled and refunded give the stock back and stop counting as revenue. */
export type OrderStatus = "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

/** A line of an order: a snapshot of the product when it was bought (later edits to the product do not change it). */
export interface OrderLine {
  productId: number | null;
  slug: string;
  name: string;
  category: Category | null;
  image: string;
  /** Unit price at the time of the purchase. */
  price: number;
  quantity: number;
  options: ChosenOption[];
}

/** Where an order is sent (asked at checkout). */
export interface ShippingAddress {
  /** Street and number. */
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  /** What people read and search: "NB-1042". */
  number: string;
  /** null when the customer was deleted: the order stays. */
  customerId: number | null;
  /** Snapshots, so the order still reads well if the customer is edited or deleted. */
  customerName: string;
  customerEmail: string;
  lines: OrderLine[];
  units: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  /** The payment is simulated: only the last four digits of the fake card are kept, to show them in the CMS. */
  cardLast4: string;
  createdAt: string;
  updatedAt: string;
}

/** A CMS user. Any admin can create or remove others; there are no roles yet. */
export interface AdminUser {
  id: number;
  name: string;
  /** Unique (compared lowercase). */
  email: string;
  createdAt: string;
  /** Id and name of the admin who created this one, or null for the first admin. */
  createdBy: number | null;
  createdByName: string | null;
}

export const ORDER_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered", "cancelled", "refunded"];
