// The data model of the CMS: what the admin edits and what the shop writes (orders, customers).
// Every interface here is a table/document the backend will need; field names and types are the contract.
// Dates are ISO 8601 strings, money is a plain number in USD (two decimals), ids are strings except products
// (their numeric id already exists in the shop).

import type { ChosenOption } from "../cart";
import type { Category } from "../../data/catalog";

export type { CatalogProduct as Product, ProductOption, ProductStatus, Category } from "../../data/catalog";
export type { ChosenOption } from "../cart";

export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: string;
  name: string;
  /** Unique (compared lowercase): checkout uses it to find the customer of an order. */
  email: string;
  status: CustomerStatus;
  /** Internal note, only visible in the CMS. */
  notes: string;
  createdAt: string;
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

export interface Order {
  id: string;
  /** What people read and search: "NB-1042". */
  number: string;
  customerId: string;
  /** Snapshots, so the order still reads well if the customer is edited or deleted. */
  customerName: string;
  customerEmail: string;
  lines: OrderLine[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: OrderStatus;
  /** Only the last four digits of the card are ever kept. */
  cardLast4: string;
  createdAt: string;
  updatedAt: string;
}

/** A CMS user. Any admin can create or remove others; there are no roles yet. */
export interface AdminUser {
  id: string;
  name: string;
  /** Unique (compared lowercase). */
  email: string;
  /** Never the password itself: the backend stores only a salted hash (bcrypt/argon2). */
  passwordHash: string;
  createdAt: string;
  /** Id of the admin who created this one, or null for the first admin. */
  createdBy: string | null;
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  signedInAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered", "cancelled", "refunded"];

/** Statuses that bring money in. */
export const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

export const isRevenue = (order: Order) => REVENUE_STATUSES.includes(order.status);
