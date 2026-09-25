"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { addToCart } from "../lib/cart";
import type { CatalogProduct } from "../data/catalog";

const optionTitle = "font-display text-[32px] font-medium leading-[1.045] text-black max-tablet:text-[25px]";
// Hover and selected look the same: dark button, white text.
const option =
  "flex items-center justify-center rounded-[15px] border px-[30px] py-[21px] font-display text-[20px] font-medium leading-[1.045] cursor-pointer transition-colors duration-200 hover:border-[#050505] hover:bg-[#050505] hover:text-white";
const optionOff = "border-black/40 text-black";
const optionOn = "border-[#050505] bg-[#050505] text-white";
const action =
  "flex min-w-0 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-[200px] px-[31px] py-[23px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] transition-opacity duration-200 hover:opacity-80";
const addStyle = `${action} border-2 border-black bg-white text-[#050505]`;
// The 2px border matches the outlined "Add to cart", so the two are the same height when stacked on mobile.
const buyStyle = `${action} border-2 border-[#050505] bg-[#050505] text-white`;

/**
 * Options (storage, colour) and the two purchase buttons.
 * Signed out, both buttons lead to the login. Signed in, "Add to cart" adds the product and stays here;
 * "Buy now" adds it and goes to the cart.
 */
export default function ProductPurchase({
  product,
  storage,
  colors,
  loggedIn,
}: {
  product: CatalogProduct;
  storage: string[];
  colors: string[];
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [storageIndex, setStorageIndex] = useState<number | null>(null);
  // Colours are picked by position: the design repeats a name.
  const [colorIndex, setColorIndex] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  function addCurrent() {
    addToCart(
      { slug: product.slug, name: product.name, price: product.price, image: product.image },
      {
        storage: storageIndex === null ? null : storage[storageIndex],
        color: colorIndex === null ? null : colors[colorIndex],
      },
    );
  }

  function handleAdd() {
    addCurrent();
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  function handleBuy() {
    addCurrent();
    router.push("/cart");
  }

  return (
    <>
      <div className="flex flex-col gap-[45px]">
        <div className="flex flex-col gap-[20px]">
          <h2 className={optionTitle}>Storage</h2>
          {/* Tablet: options fill the width, three to a row. */}
          <div className="flex flex-col gap-[10px] tablet:max-notebook:grid tablet:max-notebook:grid-cols-3">
            {storage.map((size, i) => (
              <button
                key={size}
                type="button"
                aria-pressed={storageIndex === i}
                onClick={() => setStorageIndex(i)}
                className={`${option} ${storageIndex === i ? optionOn : optionOff} w-[216px] max-tablet:w-full tablet:max-notebook:w-full`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[20px]">
          <h2 className={optionTitle}>Color</h2>
          <div className="flex flex-wrap gap-[10px] tablet:max-notebook:grid tablet:max-notebook:grid-cols-3">
            {colors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                type="button"
                aria-pressed={colorIndex === i}
                onClick={() => setColorIndex(i)}
                className={`${option} ${colorIndex === i ? optionOn : optionOff} w-[200px] max-tablet:w-[calc(50%-5px)] tablet:max-notebook:w-full`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-[573px] items-stretch gap-[20px] tablet:max-notebook:max-w-none max-tablet:flex-col">
        {loggedIn ? (
          <>
            <button type="button" onClick={handleAdd} className={addStyle}>
              {added ? "Added to cart" : "Add to cart"}
            </button>
            <button type="button" onClick={handleBuy} className={buyStyle}>
              Buy now
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={addStyle}>
              Add to cart
            </Link>
            <Link href="/login" className={buyStyle}>
              Buy now
            </Link>
          </>
        )}
      </div>
      <p role="status" className="sr-only">
        {added ? `${product.name} added to the cart` : ""}
      </p>
    </>
  );
}
