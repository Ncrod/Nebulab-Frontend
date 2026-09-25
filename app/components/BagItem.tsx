"use client";

import Image from "next/image";
import { changeQuantity, type CartItem } from "../lib/cart";

/** One line of the order: photo, name, unit price, chosen options and the quantity pill. */
export default function BagItem({ item }: { item: CartItem }) {

  return (
    <li className="flex items-center gap-[34px] overflow-clip border-b border-black/[0.26] px-[42px] py-[26px] first:border-t max-notebook:px-[8px] max-tablet:gap-[16px] max-tablet:py-[18px]">
      <div className="relative h-[134px] w-[106px] shrink-0 overflow-clip rounded-[10px] bg-[#efefef] max-tablet:h-[110px] max-tablet:w-[88px]">
        {/* The photo has wide transparent margins: it is drawn larger than the frame so the product fills it. */}
        <div className="absolute left-1/2 top-1/2 size-[190%] -translate-x-1/2 -translate-y-1/2">
          <Image src={item.image} alt={item.name} fill sizes="200px" quality={90} className="object-contain" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <div className="flex items-center justify-between gap-[16px] font-sans text-[22px] font-medium leading-normal text-[#050505] max-desktop:text-[20px] max-tablet:text-[18px] min-[1141px]:max-w-[266px]">
          <p className="truncate">{item.name}</p>
          <p className="shrink-0">${item.price}</p>
        </div>

        <div className="flex items-end justify-between gap-[16px] max-tablet:flex-col max-tablet:items-start">
          <div className="flex flex-col gap-[7px] font-sans text-[20px] leading-normal text-black/[0.49] max-tablet:text-[16px]">
            {item.options.map(({ name, value }) => (
              <p key={name}>
                {name}: {value}
              </p>
            ))}
          </div>

          <div className="ml-auto flex w-[156px] shrink-0 items-center justify-between rounded-full border-[1.224px] border-black/[0.21] bg-white px-[20px] py-[16px] shadow-[0_4.897px_4.897px_0_rgba(0,0,0,0.16)] max-desktop:w-[120px] max-desktop:px-[14px] max-desktop:py-[10px] max-tablet:ml-0">
            <button
              type="button"
              onClick={() => changeQuantity(item.id, -1)}
              aria-label={item.quantity > 1 ? `One less ${item.name}` : `Remove ${item.name}`}
              className="flex size-[29.032px] shrink-0 cursor-pointer items-center justify-center max-desktop:size-[22px]"
            >
              <Image src="/svg/bag/trash.svg" alt="" width={29} height={29} className="size-full" />
            </button>
            <span aria-live="polite" className="font-display text-[21.774px] font-medium leading-normal text-[#050505] max-desktop:text-[18px]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity(item.id, 1)}
              aria-label={`One more ${item.name}`}
              className="flex size-[29.032px] shrink-0 cursor-pointer items-center justify-center max-desktop:size-[22px]"
            >
              <Image src="/svg/bag/plus.svg" alt="" width={29} height={29} className="size-full" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
