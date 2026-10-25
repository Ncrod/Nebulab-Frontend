"use client";

import { api, apiAll, ApiError, errorMessage, login, logout, saveSession, useSession, type SessionUser } from "../api";
import { createResource } from "../resource";
import { normalizeEmail } from "./customers";
import type { AdminUser } from "./types";

// CMS accounts and login, against the API. Access and user live only in memory.

const admins = createResource(() => apiAll<AdminUser>("/admin/admins/", { session: "admin" }), [] as AdminUser[], "admin");

export const MIN_PASSWORD = 8;

/**
 * Signs in to the CMS. Returns the admin, or null when the credentials are wrong or the account is not an admin (the message
 * is the same in both cases). Throws when the server cannot be reached.
 */
export async function signInAdmin(email: string, password: string): Promise<SessionUser | null> {
  try {
    const session = await login(email, password, "admin");
    saveSession("admin", session);
    return session.user;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 400)) return null;
    throw error;
  }
}

export function signOutAdmin() {
  return logout("admin");
}

/** The signed-in admin. undefined while it is not known yet (server / hydration), null when nobody is signed in. */
export function useAdminSession(): SessionUser | null | undefined {
  const session = useSession("admin");
  if (session === undefined) return undefined;
  return session?.user.role === "admin" ? session.user : null;
}

export const useAdmins = admins.use;

export type CreateAdminResult = { ok: true; admin: AdminUser } | { ok: false; field: "name" | "email" | "password"; error: string };

/** Creates an admin. */
export async function createAdmin(input: { name: string; email: string; password: string }): Promise<CreateAdminResult> {
  if (!input.name.trim()) return { ok: false, field: "name", error: "The admin needs a name." };
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) return { ok: false, field: "email", error: "Enter a valid email address." };
  if (input.password.length < MIN_PASSWORD) return { ok: false, field: "password", error: `Use at least ${MIN_PASSWORD} characters.` };
  try {
    const admin = await api<AdminUser>("/admin/admins/", { method: "POST", session: "admin", body: { name: input.name.trim(), email: normalizeEmail(input.email), password: input.password } });
    admins.update((list) => [...list, admin]);
    return { ok: true, admin };
  } catch (error) {
    const fields = error instanceof ApiError ? error.fields : {};
    const field = (["name", "email", "password"] as const).find((key) => fields[key]) ?? "email";
    return { ok: false, field, error: fields[field] ?? errorMessage(error) };
  }
}

/** Removes an admin. Returns why it cannot be done, or null when it was. */
export async function deleteAdmin(id: number): Promise<string | null> {
  try {
    await api<void>(`/admin/admins/${id}/`, { method: "DELETE", session: "admin" });
    admins.update((list) => list.filter((admin) => admin.id !== id));
    return null;
  } catch (error) {
    return errorMessage(error);
  }
}
