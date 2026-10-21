"use client";

import { useEffect, useRef } from "react";

/** Counts through every number from 0 up to `to` the first time it scrolls into view. */
export default function CountUp({
  to,
  suffix = "",
  duration = 2600,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
    let raf = 0;
    // The text is written straight to the DOM: no React render per frame, so the count stays smooth.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / ms, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = `${Math.round(to * eased)}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, suffix, duration]);

  return (
    <span aria-label={`${to}${suffix}`} className={`tabular-nums ${className}`}>
      <span ref={ref} aria-hidden="true">
        0{suffix}
      </span>
    </span>
  );
}
