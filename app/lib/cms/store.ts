"use client";

import { useSyncExternalStore } from "react";

// A tiny localStorage-backed store, one per CMS collection (products, customers, orders, admin session).
// It is the mock of the backend: components only call the collection modules next to this file (products.ts,
// orders.ts...), so replacing this with API calls later does not touch any component.

export interface Store<T> {
  /** Current value; seeds the storage the first time it is read. Browser only. */
  read: () => T;
  /** Replaces the value and re-renders everything that uses it (in every open tab too). */
  write: (next: T) => void;
  update: (change: (current: T) => T) => void;
  /** Back to the seed. */
  reset: () => void;
  /** The value, live. Server (and hydration) render `serverSnapshot`. */
  use: () => T;
}

export function createStore<T>(key: string, seed: () => T, serverSnapshot: T): Store<T> {
  const listeners = new Set<() => void>();
  // useSyncExternalStore compares snapshots by identity: parse only when the stored text changed.
  let cache: { raw: string | null; value: T } | null = null;
  // Only used when the storage is blocked (private window, site data off): the CMS then works for the session.
  let memory: T | null = null;

  function commit(value: T) {
    const raw = JSON.stringify(value);
    cache = { raw, value };
    try {
      window.localStorage.setItem(key, raw);
      memory = null;
    } catch {
      memory = value; // could not save (blocked or full): keep it in memory
    }
  }

  function read(): T {
    if (memory !== null) return memory;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      memory = seed();
      return memory;
    }
    if (cache && cache.raw === raw) return cache.value;
    if (raw !== null) {
      try {
        const value = JSON.parse(raw) as T;
        cache = { raw, value };
        return value;
      } catch {
        // Corrupted text: fall through and start again from the seed.
      }
    }
    const value = seed();
    commit(value);
    return value;
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) onChange(); // another tab changed it
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }

  function write(next: T) {
    commit(next);
    emit();
  }

  return {
    read,
    write,
    update: (change) => write(change(read())),
    reset: () => write(seed()),
    use: () => useSyncExternalStore(subscribe, read, () => serverSnapshot),
  };
}

/** False while the server (and the hydrating render) draw the page, true from the first client render after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
