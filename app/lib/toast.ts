"use client";

import { useSyncExternalStore } from "react";

// A tiny store for the site's notification: anything calls `showToast(message)` and the <Toaster /> in the root layout
// shows it. One notification at a time; showing another while one is up replaces it and restarts its timer.

export interface Toast {
  /** Changes on every notification, so the same text shown twice still counts as a new one. */
  id: number;
  message: string;
}

let current: Toast | null = null;
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function showToast(message: string) {
  current = { id: ++counter, message };
  emit();
}

export function dismissToast() {
  if (current === null) return;
  current = null;
  emit();
}

export function useToast(): Toast | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
