"use client";

import { useSyncExternalStore } from "react";
import { apiUrl } from "./api-url";
import { showToast } from "./toast";

// The two sessions are kept in memory. The browser holds their separate, HttpOnly refresh cookies.

const API = apiUrl;

export type SessionKind = "customer" | "admin";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "cliente" | "admin";
}

export interface Session {
  access: string;
  user: SessionUser;
}

const KEY: Record<SessionKind, string> = { customer: "nebulab-session", admin: "nebulab-admin-session" };
const LOGIN: Record<SessionKind, string> = { customer: "/login", admin: "/login-admin" };

const LEGACY_KEYS = [...Object.values(KEY), "nebulab-cart", "nebulab-cms-products-v2", "nebulab-cms-customers", "nebulab-cms-orders-v2", "nebulab-cms-admins"];

// ── Session storage ───────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
const memory: Record<SessionKind, Session | null | undefined> = { customer: undefined, admin: undefined };
const version: Record<SessionKind, number> = { customer: 0, admin: 0 };
const bootstrapping: Partial<Record<SessionKind, Promise<void>>> = {};
let channel: BroadcastChannel | null = null;

export function readSession(kind: SessionKind): Session | null {
  return memory[kind] ?? null;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function saveSession(kind: SessionKind, session: Session) {
  version[kind]++;
  memory[kind] = session;
  emit();
}

const clearHandlers = new Set<(kind: SessionKind) => void>();

/** Runs `handler` whenever a session ends (sign out, or the server refused it), to forget what belonged to it. */
export function onSessionCleared(handler: (kind: SessionKind) => void) {
  clearHandlers.add(handler);
}

export function clearSessionLocal(kind: SessionKind, broadcast = false) {
  version[kind]++;
  memory[kind] = null;
  clearHandlers.forEach((handler) => handler(kind));
  emit();
  if (broadcast) channel?.postMessage({ type: "logout", kind });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** The session of that kind, live. undefined while it is not known yet (server and hydration), null when there is none. */
export function useSession(kind: SessionKind): Session | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => memory[kind],
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

/** Called once by the root client gate. Each kind is restored independently. */
export function initializeSessions(): void {
  clearLegacyData();
  if (!channel && typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("nebulab-auth");
    channel.onmessage = (event: MessageEvent<{ type: string; kind: SessionKind }>) => {
      if (event.data?.type === "logout" && (event.data.kind === "customer" || event.data.kind === "admin")) {
        clearSessionLocal(event.data.kind);
      }
    };
  }
  for (const kind of ["customer", "admin"] as const) {
    if (memory[kind] !== undefined || bootstrapping[kind]) continue;
    const initialVersion = version[kind];
    bootstrapping[kind] = renew(kind).then(
      () => { if (memory[kind] === undefined && version[kind] === initialVersion) clearSessionLocal(kind); },
      (error) => {
        if (memory[kind] === undefined && version[kind] === initialVersion) clearSessionLocal(kind);
        if (error instanceof ApiError && error.status === 403) showToast(errorMessage(error));
        console.error(`Could not restore ${kind} session:`, error);
      },
    ).finally(() => { delete bootstrapping[kind]; });
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
    // Usually one message; `variants` can carry one per invalid combination ("Combination 2: ...", "Combination 5: ...").
    else if (Array.isArray(value) && typeof value[0] === "string") out[key] = value.join(" ");
    else if (value && typeof value === "object") Object.assign(out, fieldErrors(value));
  }
  return out;
}

/** What to show the user for any error: the server's own message, or a generic one when it could not be reached. */
export function errorMessage(error: unknown): string {
  // The server's 429 message ("Request was throttled. Expected available in N seconds.") is meant for logs, not shoppers.
  if (error instanceof ApiError && error.status === 429) return "Too many requests. Try again in a few minutes.";
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

const renewing: Partial<Record<SessionKind, Promise<boolean>>> = {};

async function withRefreshLock<T>(kind: SessionKind, task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request<Promise<T>>(`nebulab-refresh-${kind}`, task);
  }
  return task();
}

function renew(kind: SessionKind): Promise<boolean> {
  if (renewing[kind]) return renewing[kind];
  const initialVersion = version[kind];
  const promise = withRefreshLock(kind, async () => {
    // The cookie may have rotated in another tab while this request waited for the lock.
    const response = await fetch(`${API}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    if (response.status === 401) return false;
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, data);
    const session = data as Session;
    if (version[kind] === initialVersion) saveSession(kind, session);
    return !!memory[kind];
  }).finally(() => { delete renewing[kind]; });
  renewing[kind] = promise;
  return promise;
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
    // Another request may already have installed a new access token.
    const current = readSession(kind);
    if (retry && current && (current.access !== token || (await renew(kind)))) {
      return api<T>(path, options, false);
    }
    if (readSession(kind)?.access === token) {
      clearSessionLocal(kind, true);
      window.location.href = LOGIN[kind];
    }
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
export async function login(email: string, password: string, kind: SessionKind): Promise<Session> {
  return api<Session>("/auth/login/", { method: "POST", credentials: "include", body: { email, password, kind } });
}

/**
 * Ends the session in this browser at once and on the server right after (best effort: the token may already be dead).
 * The returned promise is for the server part; nobody has to wait for it.
 */
export function logout(kind: SessionKind): Promise<void> {
  clearSessionLocal(kind, true);
  return withRefreshLock(kind, () => api("/auth/logout/", {
    method: "POST",
    credentials: "include",
    keepalive: true,
    body: { kind },
  })).then(
    () => undefined,
    (error) => {
      if (error instanceof ApiError && error.status === 403) showToast(errorMessage(error));
      console.error(`Could not revoke ${kind} session:`, error);
    },
  );
}
