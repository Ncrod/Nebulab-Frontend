"use client";

import { useSyncExternalStore } from "react";

// The one HTTP client of the site. It adds the token, renews it when it expires and sends the user to the login when the
// session is lost. There are two independent sessions: the shopper's ("nebulab-session") and the CMS admin's
// ("nebulab-admin-session", used under /admin).

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://nebuback.onrender.com/api";

export type SessionKind = "customer" | "admin";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "cliente" | "admin";
}

export interface Session {
  access: string;
  refresh: string;
  user: SessionUser;
}

const KEY: Record<SessionKind, string> = { customer: "nebulab-session", admin: "nebulab-admin-session" };
const LOGIN: Record<SessionKind, string> = { customer: "/login", admin: "/login-admin" };

// Data of the mock era that older visits left in the browser. The API owns all of it now.
const LEGACY_KEYS = ["nebulab-cart", "nebulab-cms-products-v2", "nebulab-cms-customers", "nebulab-cms-orders-v2", "nebulab-cms-admins"];

// ── Session storage ───────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
const cache: Record<SessionKind, { raw: string | null; session: Session | null }> = {
  customer: { raw: null, session: null },
  admin: { raw: null, session: null },
};
// Only used when the storage is blocked (private window, site data off): the session then lasts until the tab closes.
const memory: Partial<Record<SessionKind, Session | null>> = {};

function isSession(value: unknown): value is Session {
  const session = value as Session | null;
  return !!session && typeof session.access === "string" && typeof session.refresh === "string" && !!session.user;
}

export function readSession(kind: SessionKind): Session | null {
  if (kind in memory) return memory[kind] ?? null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY[kind]);
  } catch {
    return null;
  }
  // useSyncExternalStore compares snapshots by identity: parse only when the stored text changed.
  if (cache[kind].raw === raw && (raw === null || cache[kind].session)) return cache[kind].session;
  let session: Session | null = null;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      session = isSession(parsed) ? parsed : null; // an old mock session has no token: it is not a session
    } catch {
      session = null;
    }
  }
  cache[kind] = { raw, session };
  return session;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function saveSession(kind: SessionKind, session: Session) {
  try {
    window.localStorage.setItem(KEY[kind], JSON.stringify(session));
    delete memory[kind];
  } catch {
    memory[kind] = session;
  }
  emit();
}

const clearHandlers = new Set<(kind: SessionKind) => void>();

/** Runs `handler` whenever a session ends (sign out, or the server refused it), to forget what belonged to it. */
export function onSessionCleared(handler: (kind: SessionKind) => void) {
  clearHandlers.add(handler);
}

export function clearSessionLocal(kind: SessionKind) {
  try {
    window.localStorage.removeItem(KEY[kind]);
    delete memory[kind];
  } catch {
    memory[kind] = null;
  }
  cache[kind] = { raw: null, session: null };
  clearHandlers.forEach((handler) => handler(kind));
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || Object.values(KEY).includes(event.key)) onChange(); // another tab signed in or out
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The session of that kind, live. undefined while it is not known yet (server and hydration), null when there is none. */
export function useSession(kind: SessionKind): Session | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readSession(kind),
    () => undefined,
  );
}

/** Removes what the mock version of the site stored in this browser. */
export function clearLegacyData() {
  try {
    LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // storage blocked: nothing to clear
  }
}

// ── Requests ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(messageOf(data) ?? `HTTP ${status}`);
  }

  /** Field errors as { field: "first message" }, from { field: ["message"] } (nested objects, like shippingAddress, are flattened). */
  get fields(): Record<string, string> {
    return fieldErrors(this.data);
  }
}

function messageOf(data: unknown): string | null {
  if (data && typeof data === "object" && "detail" in data) return String((data as { detail: unknown }).detail);
  const first = Object.values(fieldErrors(data))[0];
  return first ?? null;
}

function fieldErrors(data: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data || typeof data !== "object") return out;
  for (const [key, value] of Object.entries(data)) {
    if (key === "detail") continue;
    if (typeof value === "string") out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === "string") out[key] = value[0];
    else if (value && typeof value === "object") Object.assign(out, fieldErrors(value));
  }
  return out;
}

/** What to show the user for any error: the server's own message, or a generic one when it could not be reached. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

const renewing: Partial<Record<SessionKind, Promise<boolean>>> = {};

function renew(kind: SessionKind): Promise<boolean> {
  const session = readSession(kind);
  if (!session) return Promise.resolve(false);
  renewing[kind] ??= fetch(`${API}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refresh }),
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const { access, refresh } = (await response.json()) as { access: string; refresh: string };
      saveSession(kind, { ...session, access, refresh });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      delete renewing[kind];
    });
  return renewing[kind]!;
}

type Options = Omit<RequestInit, "body"> & { session?: SessionKind; body?: unknown };

/**
 * Calls the API. `session` picks whose token goes with the request. A 401 renews the token once; if that fails the
 * session is dropped and the browser goes to its login. A 403 is a permission error: the session stays.
 */
export async function api<T = unknown>(path: string, options: Options = {}, retry = true): Promise<T> {
  const { session: kind, body, ...init } = options;
  const token = kind ? readSession(kind)?.access : undefined;
  const response = await fetch(`${API}${path}`, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (response.status === 401 && kind && token) {
    if (retry && (await renew(kind))) return api<T>(path, options, false);
    clearSessionLocal(kind);
    window.location.href = LOGIN[kind];
  }
  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

/** A page of a list endpoint. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Every item of a list endpoint (the CMS tables sort and page in the browser, so they load it all, 100 at a time). */
export async function apiAll<T>(path: string, options: Options = {}): Promise<T[]> {
  const joiner = path.includes("?") ? "&" : "?";
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const data = await api<Paginated<T>>(`${path}${joiner}page_size=100&page=${page}`, options);
    items.push(...data.results);
    if (!data.next) return items;
  }
}

/** Signs in with the API. Returns the session; throws ApiError (401 "Wrong email or password.") when it is refused. */
export async function login(email: string, password: string): Promise<Session> {
  return api<Session>("/auth/login/", { method: "POST", body: { email, password } });
}

/**
 * Ends the session in this browser at once and on the server right after (best effort: the token may already be dead).
 * The returned promise is for the server part; nobody has to wait for it.
 */
export function logout(kind: SessionKind): Promise<void> {
  const session = readSession(kind);
  clearSessionLocal(kind);
  if (!session) return Promise.resolve();
  // The token goes by hand (not `session`) so an expired one does not bounce the user to the login page. `keepalive` lets the
  // request finish even if the page is being left.
  return api("/auth/logout/", {
    method: "POST",
    keepalive: true,
    headers: { Authorization: `Bearer ${session.access}` },
    body: { refresh: session.refresh },
  }).then(
    () => undefined,
    () => undefined,
  );
}
