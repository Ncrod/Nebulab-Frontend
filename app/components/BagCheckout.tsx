"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../lib/cart";
import { TAX_RATE } from "../lib/cms/orders";
import BagItem from "./BagItem";
import BagPayment from "./BagPayment";

/**
 * Bag page, section 2 (Figma 145:855): the white card with the order summary (the cart's lines, with quantities)
 * on the left and the payment details with the totals on the right. The bag only exists with a session, so
 * the links here are the signed-in ones.
 */
export default function BagCheckout() {
  const items = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="relative pb-[151px] max-notebook:pb-[100px] max-tablet:pb-[80px]">
      {/* Soft light in the top-left corner, same glow as the hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-207px] top-[-305px] hidden h-[465.722px] w-[540.862px] items-center justify-center notebook:flex">
        <div className="flex-none rotate-[-38.34deg]">
          <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
        </div>
      </div>
      {/* Wide dark glows, one behind the card on the left and one lower on the right. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-673px] top-[273px] hidden h-[1600.171px] w-[1543.61px] items-center justify-center notebook:flex">
        <div className="relative h-[1576.367px] w-[648.69px] flex-none rotate-[-42.53deg]">
          <Image src="/svg/product/side-glow.svg" alt="" width={1550} height={2478} className="absolute inset-[-28.6%_-69.51%] size-auto max-w-none" />
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+292px)] top-[575px] hidden h-[1600.171px] w-[1543.61px] items-center justify-center notebook:flex">
        <div className="relative h-[1576.367px] w-[648.69px] flex-none rotate-[-42.53deg]">
          <Image src="/svg/product/side-glow.svg" alt="" width={1550} height={2478} className="absolute inset-[-28.6%_-69.51%] size-auto max-w-none" />
        </div>
      </div>

      {/* From the desktop breakpoint up to 1770px the fixed side nav would cover the left edge, so it gets room. */}
      <div className="relative mx-auto w-full max-w-[1540px] px-section pt-[116px] desktop:max-[1770px]:pl-[110px] max-notebook:pt-[40px] max-tablet:pt-[24px]">
        <div className="flex items-stretch justify-center gap-[86px] overflow-clip rounded-[31px] bg-white p-[80px] max-desktop:gap-[48px] max-desktop:p-[48px] notebook:h-[1083px] max-notebook:mx-auto max-notebook:max-w-[720px] max-notebook:flex-col max-notebook:gap-[48px] max-tablet:max-w-[550px] max-tablet:rounded-[20px] max-tablet:p-[20px] max-tablet:pb-[50px]">
          {/* Left: order summary */}
          <div className="flex min-h-0 min-w-0 flex-[695] flex-col gap-[45px] max-notebook:flex-none max-notebook:gap-[24px]">
            <div className="flex flex-col gap-[15px] pb-[21px] max-notebook:pb-0">
              <h1 className="font-display text-[60px] font-medium leading-[1.045] text-black max-desktop:text-[48px] max-tablet:text-[30px]">
                Summary Order
              </h1>
              <p className="font-sans text-[24px] leading-normal text-black/75 max-desktop:text-[20px] max-tablet:text-[18px]">
                Check your item and select your shipping for better order item
              </p>
            </div>

            {items.length > 0 ? (
              // Tall bags scroll inside the card; data-lenis-prevent lets the mouse wheel scroll this list instead of the page.
              <ul data-lenis-prevent className="m-0 flex min-h-0 list-none flex-col overflow-y-auto p-0 notebook:flex-1">
                {items.map((item) => (
                  <BagItem key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <div role="status" className="flex flex-col items-start gap-[16px] border-y border-black/[0.26] px-[42px] py-[48px] max-notebook:px-[8px]">
                <p className="font-sans text-[22px] font-medium text-[#050505]">Your bag is empty</p>
                <p className="font-sans text-[18px] text-black/50">Add products from the catalog and they will show up here.</p>
                <Link
                  href="/home/products"
                  className="mt-[8px] rounded-[200px] bg-[#050505] px-[31px] py-[15px] font-display text-[18px] font-medium text-white transition-opacity duration-200 hover:opacity-80"
                >
                  Go to products
                </Link>
              </div>
            )}
          </div>

          {/* Right: payment details */}
          <div className="min-w-0 flex-[572] max-notebook:flex-none">
            <BagPayment items={items} subtotal={subtotal} taxRate={TAX_RATE} />
          </div>
        </div>
      </div>
    </section>
  );
}
