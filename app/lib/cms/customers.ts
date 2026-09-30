"use client";

import { api, apiAll } from "../api";
import { createResource } from "../resource";
import type { Customer, CustomerStatus } from "./types";

// The customers of the store, from the API. Orders count, total spent and last order come with each customer.

const store = createResource(() => apiAll<Customer>("/admin/customers/", { session: "admin" }), [] as Customer[], "admin");

export const useCustomers = store.use;
export const invalidateCustomers = store.invalidate;

export type CustomerInput = Pick<Customer, "name" | "email" | "notes">;

export const emptyCustomer = (): CustomerInput => ({ name: "", email: "", notes: "" });

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findCustomerByEmail(customers: Customer[], email: string) {
  const wanted = normalizeEmail(email);
  return customers.find((customer) => customer.email.toLowerCase() === wanted);
}

/** Creates (no id) or updates (with id) a customer. Returns the saved one; throws ApiError with the field errors. */
export async function saveCustomer(input: CustomerInput, id?: number): Promise<Customer> {
  const body = { name: input.name.trim(), email: normalizeEmail(input.email), notes: input.notes };
  const saved = await api<Customer>(id === undefined ? "/admin/customers/" : `/admin/customers/${id}/`, { method: id === undefined ? "POST" : "PATCH", session: "admin", body });
  store.update((customers) => (id === undefined ? [saved, ...customers] : customers.map((customer) => (customer.id === saved.id ? saved : customer))));
  return saved;
}

export async function setCustomerStatus(ids: number[], status: CustomerStatus) {
  const results = await Promise.allSettled(ids.map((id) => api<Customer>(`/admin/customers/${id}/`, { method: "PATCH", session: "admin", body: { status } })));
  const updated = new Map<number, Customer>();
  for (const result of results) if (result.status === "fulfilled") updated.set(result.value.id, result.value);
  store.update((customers) => customers.map((customer) => updated.get(customer.id) ?? customer));
  const failed = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failed) throw failed.reason;
}

/** Their orders stay in Sales. */
export async function deleteCustomers(ids: number[]) {
  const results = await Promise.allSettled(ids.map((id) => api<void>(`/admin/customers/${id}/`, { method: "DELETE", session: "admin" })));
  const done = ids.filter((_, i) => results[i].status === "fulfilled");
  store.update((customers) => customers.filter((customer) => !done.includes(customer.id)));
  const failed = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failed) throw failed.reason;
}
