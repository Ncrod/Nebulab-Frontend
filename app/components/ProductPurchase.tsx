"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../lib/api";
import { addToCart } from "../lib/cart";
import { showToast } from "../lib/toast";
import type { CatalogProduct } from "../data/catalog";

const optionTitle = "font-display text-[32px] font-medium leading-[1.045] text-black max-tablet:text-[25px]";
// Hover and selected look the same: dark button, white text.
const option =
  "flex items-center justify-center rounded-[15px] border px-[30px] py-[21px] font-display text-[20px] font-medium leading-[1.045] cursor-pointer transition-colors duration-200 hover:border-[#050505] hover:bg-[#050505] hover:text-white";
const optionOff = "border-black/40 text-black";
const optionOn = "border-[#050505] bg-[#050505] text-white";
const action =
  "flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[200px] px-[31px] py-[23px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] transition-opacity duration-200";
// As buttons they go dimmed while an attribute is still to be chosen; as links (signed out) they just lead to the login.
const asButton = "cursor-pointer enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
const asLink = "cursor-pointer hover:opacity-80";
const addStyle = `${action} border-2 border-black bg-white text-[#050505]`;
// The 2px border matches the outlined "Add to cart", so the two are the same height when stacked on mobile.
const buyStyle = `${action} border-2 border-[#050505] bg-[#050505] text-white`;

/** "storage" / "storage and color" / "size, color and storage" */
function listOf(names: string[]) {
  const lower = names.map((name) => name.toLowerCase());
  return lower.length > 1 ? `${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}` : lower[0];
}

/**
 * The product's attributes and the two purchase buttons.
 * Each product shows only the attributes it has (several, one, or none); the shopper has to choose every one shown
 * before "Add to cart" and "Buy now" work. Signed out, both buttons lead to the login instead. Signed in, "Add to cart"
 * adds the product and stays here; "Buy now" adds it and goes to the bag.
 */
export default function ProductPurchase({ product, loggedIn }: { product: CatalogProduct; loggedIn: boolean }) {
  const router = useRouter();
  // The chosen button of each attribute, by position (a value can repeat: the design shows "Citrus" twice).
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const missing = product.options.filter((option) => chosen[option.name] === undefined);
  const soldOut = product.stock <= 0;
  const complete = missing.length === 0 && !soldOut;

  /** Sends the product and its chosen options to the bag (the server sets name, price and photo). False when it was refused. */
  async function addCurrent(): Promise<boolean> {
    if (!complete || busy) return false; // the buttons are disabled too; this keeps the rule even if one is triggered another way
    setBusy(true);
    try {
      await addToCart(
        product.slug,
        product.options.map((option) => ({ name: option.name, value: option.values[chosen[option.name]] })),
      );
      return true;
    } catch (error) {
      showToast(errorMessage(error)); // "Only 3 left in stock."
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!(await addCurrent())) return;
    showToast("Product added to your bag");
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  async function handleBuy() {
    if (await addCurrent()) router.push("/bag");
  }

  return (
    <>
      {product.options.length > 0 && (
        <div className="flex flex-col gap-[45px]">
          {product.options.map(({ name, values, layout }) => {
            const stacked = layout === "stack";
            return (
              <div key={name} className="flex flex-col gap-[20px]">
                <h2 className={optionTitle}>{name}</h2>
                {/* Tablet: options fill the width, three to a row. */}
                <div
                  className={`${stacked ? "flex flex-col" : "flex flex-wrap"} gap-[10px] tablet:max-notebook:grid tablet:max-notebook:grid-cols-3`}
                >
                  {values.map((value, i) => (
                    <button
                      key={`${value}-${i}`}
                      type="button"
                      aria-pressed={chosen[name] === i}
                      onClick={() => setChosen((current) => ({ ...current, [name]: i }))}
                      className={`${option} ${chosen[name] === i ? optionOn : optionOff} ${
                        stacked ? "w-[216px] max-tablet:w-full" : "w-[200px] max-tablet:w-[calc(50%-5px)]"
                      } tablet:max-notebook:w-full`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex w-full max-w-[573px] flex-col gap-[14px] tablet:max-notebook:max-w-none">
        <div className="flex items-stretch gap-[20px] max-tablet:flex-col">
          {loggedIn ? (
            <>
              <button type="button" onClick={handleAdd} disabled={!complete} aria-describedby={complete ? undefined : "purchase-hint"} className={`${addStyle} ${asButton}`}>
                {soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
              </button>
              <button type="button" onClick={handleBuy} disabled={!complete} aria-describedby={complete ? undefined : "purchase-hint"} className={`${buyStyle} ${asButton}`}>
                Buy now
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`${addStyle} ${asLink}`}>
                Add to cart
              </Link>
              <Link href="/login" className={`${buyStyle} ${asLink}`}>
                Buy now
              </Link>
            </>
          )}
        </div>

        {loggedIn && !complete && (
          <p id="purchase-hint" className="font-sans text-[16px] leading-normal text-black/60">
            {soldOut ? "This product is sold out for now." : `Choose ${listOf(missing.map((option) => option.name))} to add this product to your bag.`}
          </p>
        )}
      </div>
    </>
  );
}
