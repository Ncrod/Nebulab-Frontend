"use client";

import gsap from "gsap";
import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Lenis smooth scroll for the whole site, driven by GSAP's ticker so both share one frame loop. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  // Native scrolling for people who ask for less motion.
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const enabled = !reduced;

  useEffect(() => {
    if (!enabled) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [enabled]);

  // Lenis keeps its own scroll target, so after a page change it would pull the new page back to where the old one
  // was. New pages therefore start at the very top (the hero of the home, navbar included). Not for the
  // back/forward buttons, where the browser restores the old position, nor for links with a #anchor.
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  );
}
