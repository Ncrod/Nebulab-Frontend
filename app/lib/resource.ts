"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { errorMessage, onSessionCleared, type SessionKind } from "./api";

// Two small helpers to read API data in components:
//  - createResource: a list or object shared across consumers (the CMS tables, the cart), refetched on each mount. Mutations update the cached copy right away.
//  - useQuery: a request that depends on parameters (catalog page, filtered sales, dashboard period) and runs again when they change.

export interface ResourceState<T> {
  data: T;
  /** True until the first answer arrives. */
  loading: boolean;
  error: string | null;
}

export interface Resource<T> {
  /** The data, live. Refetches every time a component mounts it. */
  use: () => ResourceState<T>;
  /** Replaces the cached data (after a mutation whose response already has the new version). */
  set: (data: T) => void;
  update: (change: (current: T) => T) => void;
  /** Loads it again, keeping what is shown until the answer arrives. */
  refresh: () => Promise<void>;
  /** Forgets it: the next component that uses it loads it again. */
  invalidate: () => void;
}

/** `owner`: the session the data belongs to. It is forgotten when that session ends, so nobody sees the previous user's data. */
export function createResource<T>(load: () => Promise<T>, empty: T, owner?: SessionKind): Resource<T> {
  const initial: ResourceState<T> = { data: empty, loading: true, error: null };
  const server: ResourceState<T> = initial;
  let state = initial;
  let run = 0;
  // Dedupes concurrent calls (e.g. two consumers mounting on the same page): they share one in-flight fetch.
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  function commit(next: ResourceState<T>) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function refresh(): Promise<void> {
    if (pending) return pending;
    const mine = ++run;
    pending = (async () => {
      try {
        const data = await load();
        if (mine === run) commit({ data, loading: false, error: null });
      } catch (error) {
        if (mine === run) commit({ ...state, loading: false, error: errorMessage(error) });
      } finally {
        pending = null;
      }
    })();
    return pending;
  }

  function invalidate() {
    run++; // an answer still on its way belongs to the old data
    commit(initial);
  }

  if (owner) onSessionCleared((kind) => kind === owner && invalidate());

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }

  return {
    use() {
      const current = useSyncExternalStore(subscribe, () => state, () => server);
      // Refetches on every mount, so switching to a CMS section always shows the latest data
      // (e.g. a customer who signed up, or an admin created elsewhere, without a full page reload).
      useEffect(() => {
        void refresh();
      }, []);
      return current;
    },
    set: (data) => commit({ data, loading: false, error: null }),
    update: (change) => commit({ ...state, data: change(state.data) }),
    refresh,
    invalidate,
  };
}

export interface QueryState<T> {
  /** The last answer received (of an earlier request while a new one is loading), or null before the first. */
  data: T | null;
  loading: boolean;
  error: string | null;
  /** HTTP status of the error, when the server answered. */
  errorStatus: number | null;
  reload: () => void;
}

/** Runs `load` when `key` changes (or `reload` is called). `key` must describe every input of `load`. */
export function useQuery<T>(key: string, load: () => Promise<T>): QueryState<T> {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{ stamp: string; data: T | null; error: string | null; errorStatus: number | null }>({
    stamp: "",
    data: null,
    error: null,
    errorStatus: null,
  });
  const stamp = `${key}#${version}`;
  const start = useEffectEvent(load);

  useEffect(() => {
    let cancelled = false;
    start().then(
      (data) => {
        if (!cancelled) setResult({ stamp, data, error: null, errorStatus: null });
      },
      (error: unknown) => {
        if (cancelled) return;
        const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status: unknown }).status) : null;
        setResult((current) => ({ stamp, data: current.data, error: errorMessage(error), errorStatus: status }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [stamp]);

  const settled = result.stamp === stamp;
  return {
    data: result.data,
    loading: !settled,
    error: settled ? result.error : null,
    errorStatus: settled ? result.errorStatus : null,
    reload: () => setVersion((v) => v + 1),
  };
}

/** The value after it stops changing for `ms`. */
export function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/** False while the server (and the hydrating render) draw the page, true from the first client render after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
