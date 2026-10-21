"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// One wordmark slot on the design canvas: the 1682px text box plus the 41.5px gap. Matches the ticker keyframes.
const SLOT = 1723.52;
// Enough slots for the row to cover the 1920px canvas along its whole travel.
const SLOTS = [0, 1, 2, 3];

/**
 * About us page, third section (Figma 355:110): the laptop over a dark glow, with two rows of big faint "Nebulab"
 * wordmarks and two giant logo marks behind it. Everything is placed on the 1920x866 canvas of the design, and the
 * whole canvas is scaled down on smaller screens (the section's height follows the scale). Like the Figma frame, it
 * does not clip its content: the logo marks spill into the neighbouring sections (the page's `main` clips sideways).
 * The wordmark rows are driven by the scroll: the top one slides right, the bottom one left, one slot over the
 * section's passage through the viewport (progress 0 = entering, 1 = fully scrolled past).
 */
function Ticker({ top, left, direction }: { top: number; left: number; direction: 1 | -1 }) {
  return (
    <div
      className="absolute flex will-change-transform"
      style={{ top, left, transform: `translateX(calc(var(--p, 0) * ${direction * SLOT}px))` }}
    >
      {SLOTS.map((i) => (
        <div key={i} className="shrink-0 pt-[115px]" style={{ width: SLOT }}>
          <Image
            src="/images/about_us/nebulab-wordmark.svg"
            alt=""
            width={1642}
            height={141}
            className="max-w-none"
          />
        </div>
      ))}
    </div>
  );
}

// Share of the remaining distance covered each frame: lower is smoother and slower to catch up.
const EASE = 0.08;

export default function AboutShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The scroll sets a target; each frame the rows ease a fraction of the way to it instead of following every wheel tick.
    let raf = 0;
    let target = 0;
    let current = 0;
    const measure = () => {
      const { top, height } = section.getBoundingClientRect();
      target = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
    };
    const frame = () => {
      raf = 0;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0005) current = target;
      else raf = requestAnimationFrame(frame);
      section.style.setProperty("--p", current.toFixed(4));
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    measure();
    current = target;
    section.style.setProperty("--p", current.toFixed(4));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[866px] w-full max-desktop:h-[650px] max-notebook:h-[500px] max-tablet:h-[320px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[866px] w-[1920px] origin-top [transform:translateX(-50%)] max-desktop:[transform:translateX(-50%)_scale(0.75)] max-notebook:[transform:translateX(-50%)_scale(0.58)] max-tablet:[transform:translateX(-50%)_scale(0.37)]"
      >
        <Image
          src="/images/about_us/about-logo-bg.svg"
          alt=""
          width={914.23}
          height={908}
          className="absolute left-[1240px] top-[358px] max-w-none"
        />
        <Image
          src="/images/about_us/about-logo-bg.svg"
          alt=""
          width={914.23}
          height={908}
          className="absolute left-[-141px] top-[-604px] max-w-none"
        />
        <Ticker top={31.11} left={-SLOT} direction={1} />
        <Ticker top={539.11} left={-1482} direction={-1} />

        {/* Glow behind the laptop */}
        <Image
          src="/images/about_us/laptop-glow.svg"
          alt=""
          width={1472.54}
          height={797.91}
          className="absolute left-[224.3px] top-[225.6px] max-w-none"
        />
        <Image
          src="/images/about_us/mack.png"
          alt=""
          width={989}
          height={699.24}
          className="absolute left-[466px] top-[115px] max-w-none"
        />
      </div>
    </section>
  );
}
