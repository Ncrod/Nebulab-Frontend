"use client";

import { createStore } from "./store";
import { getDemoData } from "./demo-data";
import { isRevenue, type Customer, type CustomerStatus, type Order } from "./types";

const store = createStore<Customer[]>("nebulab-cms-customers", () => getDemoData().customers, []);

export const useCustomers = store.use;
export const readCustomers = store.read;
export const resetCustomers = store.reset;

export type CustomerInput = Pick<Customer, "name" | "email" | "notes">;

export const emptyCustomer = (): CustomerInput => ({ name: "", email: "", notes: "" });

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findCustomerByEmail(customers: Customer[], email: string) {
  const wanted = normalizeEmail(email);
  return customers.find((customer) => customer.email === wanted);
}

function nextId(customers: Customer[]) {
  const next = customers.reduce((max, c) => Math.max(max, Number(c.id.replace("cus_", "")) || 0), 0) + 1;
  return `cus_${String(next).padStart(3, "0")}`;
}

/** Creates (no id) or updates (with id) a customer. */
export function saveCustomer(input: CustomerInput, id?: string): Customer {
  const clean = { ...input, name: input.name.trim(), email: normalizeEmail(input.email) };
  const customers = store.read();
  if (id === undefined) {
    const created: Customer = { ...clean, id: nextId(customers), status: "active", createdAt: new Date().toISOString() };
    store.write([created, ...customers]);
    return created;
  }
  let saved!: Customer;
  store.write(
    customers.map((customer) => {
      if (customer.id !== id) return customer;
      saved = { ...customer, ...clean };
      return saved;
    }),
  );
  return saved;
}

/** The customer of a checkout: the one with that email, or a new one made from what the payment form knows. */
export function findOrCreateCustomer(name: string, email: string): Customer {
  return findCustomerByEmail(store.read(), email) ?? saveCustomer({ ...emptyCustomer(), name, email });
}

export function setCustomerStatus(id: string, status: CustomerStatus) {
  store.update((customers) => customers.map((customer) => (customer.id === id ? { ...customer, status } : customer)));
}

export function deleteCustomers(ids: string[]) {
  store.update((customers) => customers.filter((customer) => !ids.includes(customer.id)));
}

export interface CustomerStats {
  orders: number;
  /** Money from the orders that count as revenue. */
  spent: number;
  lastOrderAt: string | null;
}

/** Orders, total spent and last purchase of every customer, by customer id. */
export function customerStats(orders: Order[]): Map<string, CustomerStats> {
  const stats = new Map<string, CustomerStats>();
  for (const order of orders) {
    const current = stats.get(order.customerId) ?? { orders: 0, spent: 0, lastOrderAt: null };
    current.orders += 1;
    if (isRevenue(order)) current.spent += order.total;
    if (!current.lastOrderAt || order.createdAt > current.lastOrderAt) current.lastOrderAt = order.createdAt;
    stats.set(order.customerId, current);
  }
  return stats;
}
