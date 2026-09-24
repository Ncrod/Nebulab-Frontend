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

      <div className="h-[465px] w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12.5%,#000_87.5%,transparent)]">
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
