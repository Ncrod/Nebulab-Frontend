"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Horizontal distance between the two wordmarks on the design canvas (1022 - 50).
const SWAP = 972;

// Each wordmark moves during its own slice of the scroll progress (0 = section entering the viewport, 1 = fully scrolled past), one after the other.
const LEFT_RANGE = [0.2, 0.55] as const;
const RIGHT_RANGE = [0.4, 0.8] as const;
// Share of the remaining distance covered each frame: lower is smoother and slower to catch up.
const EASE = 0.07;
const within = ([from, to]: readonly [number, number], t: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));

/**
 * About us page, third section (Figma 338:49): the laptop over a dark glow, with two big faint "Nebulab"
 * wordmarks and two giant logo marks behind it. Everything is placed on the 1920x866 canvas of the design, and the
 * whole canvas is scaled down on smaller screens (the section's height follows the scale). Like the Figma frame, it
 * does not clip its content: the logo marks spill into the neighbouring sections (the page's `main` clips sideways).
 * The two wordmarks trade places as the page scrolls, independently: the left one first, then the right one. Progress
 * runs from the section entering the viewport to it leaving at the top.
 */
export default function AboutShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The scroll sets a target; each frame the wordmarks ease a fraction of the way to it, so they glide
    // instead of following every wheel tick.
    let raf = 0;
    let targetLeft = 0;
    let targetRight = 0;
    let left = 0;
    let right = 0;
    const measure = () => {
      const { top, height } = section.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
      targetLeft = within(LEFT_RANGE, t);
      targetRight = within(RIGHT_RANGE, t);
    };
    const frame = () => {
      raf = 0;
      left += (targetLeft - left) * EASE;
      right += (targetRight - right) * EASE;
      const settled = Math.abs(targetLeft - left) < 0.0005 && Math.abs(targetRight - right) < 0.0005;
      if (settled) {
        left = targetLeft;
        right = targetRight;
      } else {
        raf = requestAnimationFrame(frame);
      }
      section.style.setProperty("--p-left", left.toFixed(4));
      section.style.setProperty("--p-right", right.toFixed(4));
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    measure();
    left = targetLeft;
    right = targetRight;
    section.style.setProperty("--p-left", left.toFixed(4));
    section.style.setProperty("--p-right", right.toFixed(4));
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
      className="relative h-[866px] w-full max-desktop:h-[650px] max-notebook:h-[500px] max-tablet:h-[320px]"
    >
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
        <Image
          src="/images/about_us/nebulab-wordmark.svg"
          alt=""
          width={827}
          height={71}
          className="absolute left-[50px] top-[197px] max-w-none will-change-transform"
          style={{ transform: `translateX(calc(var(--p-left, 0) * ${SWAP}px))` }}
        />
        <Image
          src="/images/about_us/nebulab-wordmark.svg"
          alt=""
          width={827}
          height={71}
          className="absolute left-[1022px] top-[660px] max-w-none will-change-transform"
          style={{ transform: `translateX(calc(var(--p-right, 0) * ${-SWAP}px))` }}
        />

        {/* Glow behind the laptop */}
        <Image
          src="/images/about_us/laptop-glow.svg"
          alt=""
          width={1316.2}
          height={713.2}
          className="absolute left-[301.9px] top-[213.9px] max-w-none"
        />
        <Image
          src="/images/about_us/mack.webp"
          alt=""
          unoptimized
          width={884}
          height={625}
          className="absolute left-[518px] top-[115px] max-w-none"
        />
      </div>
    </section>
  );
}
