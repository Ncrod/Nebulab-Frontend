"use client";

import { useEffect } from "react";

/**
 * Below the notebook breakpoint the hero backdrop (black hole + phone) is
 * designed for a 1139px-wide tablet. This keeps a `--k` factor on <html> equal
 * to viewport / 1139, so the backdrop scales and keeps its position as the
 * window shrinks. From notebook up the backdrop ignores it.
 *
 * `--m` is the same idea for the Featured section: the macbook image is 870px
 * wide, capped at 770px below notebook (tablet and mobile), and the arc behind it scales
 * with it (--m = macbook width / 870).
 */
export default function HeroScale() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const w = root.clientWidth;
      root.style.setProperty("--k", String(w < 1140 ? w / 1139 : 1));
      root.style.setProperty("--m", String(w < 1140 ? Math.min(770, w) / 870 : 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return null;
}
