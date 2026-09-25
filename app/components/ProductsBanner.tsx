"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

const slides = [
  { src: "/images/slide1.webp", alt: "Featured products, slide 1" },
  { src: "/images/slide2.webp", alt: "Featured products, slide 2" },
  { src: "/images/slide3.webp", alt: "Featured products, slide 3" },
  { src: "/images/slide4.webp", alt: "Featured products, slide 4" },
];

const INTERVAL = 5;
const SLIDE_DURATION = 0.9;

/** Banner carousel of the products showcase: slides advance on their own, sliding left, and loop forever. */
export default function ProductsBanner() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = gsap.utils.toArray<HTMLElement>("[data-slide]", root);
    let current = 0;
    // Slides after the first start hidden (no flash before hydration); autoAlpha reveals them off-screen.
    gsap.set(items, { xPercent: (i) => (i === 0 ? 0 : 100), autoAlpha: 1 });

    const next = () => {
      const incoming = (current + 1) % items.length;
      // The incoming slide always waits on the right, so the loop never scrolls backwards.
      gsap.set(items[incoming], { xPercent: 100 });
      gsap.to(items[current], { xPercent: -100, duration: SLIDE_DURATION, ease: "power3.inOut" });
      gsap.to(items[incoming], { xPercent: 0, duration: SLIDE_DURATION, ease: "power3.inOut" });
      current = incoming;
    };

    const timer = gsap.delayedCall(INTERVAL, function tick() {
      next();
      timer.restart(true);
    });

    // Hover pauses the autoplay.
    const pause = () => timer.pause();
    const resume = () => timer.resume();
    root.addEventListener("pointerenter", pause);
    root.addEventListener("pointerleave", resume);

    return () => {
      root.removeEventListener("pointerenter", pause);
      root.removeEventListener("pointerleave", resume);
      timer.kill();
      gsap.killTweensOf(items);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto aspect-[1350/660] w-full max-tablet:max-w-[550px] overflow-clip rounded-[49px] bg-white max-tablet:rounded-[24px]">
      {slides.map(({ src, alt }, i) => (
        <div key={src} data-slide className={`absolute inset-0 ${i === 0 ? "" : "invisible"}`}>
          {/* unoptimized: the slides are already exported at full size, Next would recompress them at quality 75.
              object-fill stretches each slide over the whole frame (no crop, no bars). The last row and column of
              pixels of the files are semi-transparent, so the image is 1px larger than the frame: they fall outside. */}
          <Image
            src={src}
            alt={alt}
            width={2593}
            height={1180}
            unoptimized
            priority={i === 0}
            className="absolute left-0 top-0 h-[calc(100%+1px)] w-[calc(100%+1px)] max-w-none object-fill"
          />
        </div>
      ))}
    </div>
  );
}
