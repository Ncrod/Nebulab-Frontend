"use client";

import { normalizeEmail } from "./customers";
import { createStore, useHydrated } from "./store";
import type { AdminSession, AdminUser } from "./types";

// Mock admin accounts and login. The backend will replace all of it: real users table, hashed passwords, a session
// token. Nothing here is secure (it all lives in the browser); it only models the flow and the data.

/** The first admin. Created the first time someone signs in with these, when there are no admins yet. */
const FIRST_ADMIN = { name: "Nebulab Admin", email: "admin@nebulab.com", password: "nebulab-admin" };

const admins = createStore<AdminUser[]>("nebulab-cms-admins", () => [], []);
const session = createStore<AdminSession | null>("nebulab-admin-session", () => null, null);

export const MIN_PASSWORD = 8;

/** SHA-256 (salted with the email) where the browser allows it; a simple fallback on plain http (LAN testing). */
async function hashPassword(password: string, email: string): Promise<string> {
  const text = `${normalizeEmail(email)}:${password}`;
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `fnv-${(h >>> 0).toString(16)}`;
}

function nextId(list: AdminUser[]) {
  const next = list.reduce((max, a) => Math.max(max, Number(a.id.replace("adm_", "")) || 0), 0) + 1;
  return `adm_${String(next).padStart(3, "0")}`;
}

async function makeAdmin(list: AdminUser[], input: { name: string; email: string; password: string }, createdBy: string | null): Promise<AdminUser> {
  return {
    id: nextId(list),
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    passwordHash: await hashPassword(input.password, input.email),
    createdAt: new Date().toISOString(),
    createdBy,
  };
}

/** Returns the session, or null when the credentials are wrong. */
export async function signInAdmin(email: string, password: string): Promise<AdminSession | null> {
  let list = admins.read();
  if (list.length === 0 && normalizeEmail(email) === FIRST_ADMIN.email && password === FIRST_ADMIN.password) {
    list = [await makeAdmin(list, FIRST_ADMIN, null)];
    admins.write(list);
  }
  const admin = list.find((a) => a.email === normalizeEmail(email));
  if (!admin || admin.passwordHash !== (await hashPassword(password, email))) return null;
  const next: AdminSession = { id: admin.id, email: admin.email, name: admin.name, signedInAt: new Date().toISOString() };
  session.write(next);
  return next;
}

export function signOutAdmin() {
  session.write(null);
}

/**
 * The signed-in admin. undefined while it is not known yet (server / hydration), null when nobody is signed in — or when
 * the account of the session was deleted by another admin.
 */
export function useAdminSession(): AdminSession | null | undefined {
  const current = session.use();
  const list = admins.use();
  const hydrated = useHydrated();
  if (!hydrated) return undefined;
  return current && list.some((a) => a.id === current.id) ? current : null;
}

export const useAdmins = admins.use;

export type CreateAdminResult = { ok: true; admin: AdminUser } | { ok: false; field: "name" | "email" | "password"; error: string };

/** Creates an admin. `createdBy` is the id of the admin doing it. */
export async function createAdmin(input: { name: string; email: string; password: string }, createdBy: string): Promise<CreateAdminResult> {
  const list = admins.read();
  if (!input.name.trim()) return { ok: false, field: "name", error: "The admin needs a name." };
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) return { ok: false, field: "email", error: "Enter a valid email address." };
  if (list.some((a) => a.email === normalizeEmail(input.email))) return { ok: false, field: "email", error: "Another admin already uses this email." };
  if (input.password.length < MIN_PASSWORD) return { ok: false, field: "password", error: `Use at least ${MIN_PASSWORD} characters.` };
  const admin = await makeAdmin(list, input, createdBy);
  admins.write([...list, admin]);
  return { ok: true, admin };
}

/** Removes an admin. Returns why it cannot be done, or null when it was. */
export function deleteAdmin(id: string, currentId: string): string | null {
  const list = admins.read();
  if (id === currentId) return "You cannot delete your own account.";
  if (list.length <= 1) return "There must be at least one admin.";
  admins.write(list.filter((a) => a.id !== id));
  return null;
}
