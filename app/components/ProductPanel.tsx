"use client";

import { useState } from "react";
import {
  findVariant,
  formatPrice,
  isCombinationInStock,
  priceRange,
  type CatalogProduct,
  type OptionChoice,
} from "../data/catalog";
import ProductPurchase from "./ProductPurchase";

/**
 * Right column of the product page: name, description, price, attributes and buttons. It is one client component
 * because the price depends on what is chosen: an iPhone in 1TB costs more than the same one in 128GB, so the chosen
 * combination (the variant) is picked here and the price above the attributes follows it.
 */
export default function ProductPanel({ product, loggedIn = false }: { product: CatalogProduct; loggedIn?: boolean }) {
  // The chosen button of each attribute, by position (a value can repeat: the design shows "Citrus" twice).
  const [chosen, setChosen] = useState<Record<string, number>>({});

  /** The values chosen so far, as the variants write them. */
  const choices: OptionChoice[] = product.options
    .filter((option) => chosen[option.name] !== undefined)
    .map((option) => ({ name: option.name, value: option.values[chosen[option.name]] }));

  const complete = choices.length === product.options.length;
  const variant = complete && product.variants.length > 0 ? findVariant(product, choices) : null;

  const { min, max } = priceRange(product);
  // Before everything is chosen the cheapest combination is shown as "From $x" (only when they differ).
  const price = variant ? variant.price : min;
  const from = !variant && max > min;

  /**
   * Chooses a value and drops the choices of the other attributes that cannot be bought with it any more (256GB left
   * in black only: choosing white clears the storage instead of leaving a combination that does not exist).
   */
  function choose(name: string, index: number) {
    setChosen((current) => {
      const next = { ...current, [name]: index };
      if (product.variants.length === 0) return next;
      const value = (attribute: string) => product.options.find((option) => option.name === attribute)!.values[next[attribute]];
      for (const option of product.options) {
        if (option.name === name || next[option.name] === undefined) continue;
        if (!isCombinationInStock(product, [{ name, value: value(name) }, { name: option.name, value: value(option.name) }])) delete next[option.name];
      }
      return next;
    });
  }

  return (
    <div className="flex min-w-0 flex-[695] flex-col gap-[45px] max-notebook:order-2 max-notebook:flex-none">
      <div className="flex flex-col gap-[23px] border-b border-black/20 pb-[21px]">
        <div className="flex flex-col gap-[15px]">
          <h1 className="font-display text-[60px] font-medium leading-[1.045] text-black max-desktop:text-[48px] max-tablet:text-[30px]">{product.name}</h1>
          <p className="font-sans text-[24px] leading-normal text-black/75 max-desktop:text-[20px] max-tablet:text-[18px]">{product.description}</p>
        </div>
        <p className="font-sans text-[40px] font-medium leading-[1.045] text-black max-tablet:text-[30px]">
          {from && <span className="mr-[10px] text-[24px] font-normal text-black/60 max-tablet:text-[18px]">From</span>}
          {formatPrice(price)}
        </p>
      </div>

      <ProductPurchase product={product} loggedIn={loggedIn} chosen={chosen} onChoose={choose} variant={variant} />
    </div>
  );
}
