"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";

const CARD = 384;
const GAP = 32;
const STEP = CARD + GAP;
/** Card that sits at the centre of the row, counted from the left edge of the visible cards. */
const CENTER = 2;

const navButton =
  "flex size-[68px] max-notebook:size-[56px] cursor-pointer items-center justify-center rounded-full border transition-colors duration-300";

function NavArrow({ className = "" }: { className?: string }) {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="currentColor" aria-hidden="true" className={`size-full ${className}`}>
      <path d="M20.5446 35.5569V32.5199H42.8037L31.578 21.9093L33.6156 19.8333L47.4554 33.135V34.8265L33.6156 48.1666L31.5396 46.0522L42.6884 35.5569H20.5446Z" />
    </svg>
  );
}

export default function ProductCarousel({ products }: { products: Product[] }) {
  const n = products.length;
  // Three copies so the track can wrap without a visible jump.
  const items = [...products, ...products, ...products];
  const [pos, setPos] = useState(n);
  const [animate, setAnimate] = useState(true);
  const busy = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const lastWheel = useRef(0);

  const go = useCallback((dir: 1 | -1) => {
    if (busy.current) return;
    busy.current = true;
    setAnimate(true);
    setPos((p) => p + dir);
  }, []);

  // After the slide ends, jump back into the middle copy without animating.
  const settle = () => {
    busy.current = false;
    if (pos >= 2 * n || pos < n) {
      setAnimate(false);
      setPos(((pos % n) + n) % n + n);
    }
  };

  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  // Sideways trackpad / shift+wheel scroll moves one card per gesture.
  // Native listener: React's wheel handler is passive and could not stop the browser's back-swipe.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !(e.shiftKey && !e.deltaX)) return;
      e.preventDefault();
      const now = performance.now();
      if (Math.abs(dx) < 8 || now - lastWheel.current < 700) return;
      lastWheel.current = now;
      go(dx > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  // Swipe (touch) or drag (mouse) sideways.
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d && Math.abs(e.clientX - d.x) > 6) d.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    // Keep `moved` until the click that follows the release has been swallowed.
    setTimeout(() => { drag.current = null; }, 0);
  };

  const offset = (pos + CENTER) * STEP + CARD / 2;

  return (
    <div className="relative w-full max-tablet:[zoom:0.75]">
      <div className="absolute bottom-[510px] left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-[38px] max-notebook:gap-[30px]">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(-1)}
          className={`${navButton} border-white bg-background text-white hover:bg-white hover:text-background`}
        >
          <NavArrow className="-scale-x-100" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(1)}
          className={`${navButton} border-white bg-background text-white hover:bg-white hover:text-background`}
        >
          <NavArrow />
        </button>
      </div>

      <div
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; }}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="h-[465px] w-full touch-pan-y overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12.5%,#000_87.5%,transparent)]">
        <div
          onTransitionEnd={settle}
          className={`relative left-1/2 flex items-start ${animate ? "transition-transform duration-500 ease-out" : ""}`}
          style={{ gap: GAP, transform: `translateX(-${offset}px)` }}
        >
          {items.map((product, i) => (
            <ProductCard key={`${product.name}-${i}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
