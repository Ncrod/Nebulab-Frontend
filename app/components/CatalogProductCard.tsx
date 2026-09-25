import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "../data/catalog";

/** Catalog product tile: photo, name, category, price and the two actions. Static for now. */
export default function CatalogProductCard({ product, href }: { product: CatalogProduct; href: string }) {
  const { name, category, price, image } = product;

  return (
    <article className="flex min-w-0 flex-col gap-[15px]">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square w-full overflow-clip rounded-[20px] bg-white">
        {/* The photo is a wide render: this frame crops it around the product. */}
        <div className="absolute left-1/2 top-1/2 h-[63.8%] w-[79.3%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={2048}
            height={1152}
            // The photo is drawn at ~165% of the card's width (it is cropped by the frame), so `sizes` is that,
            // not the card's own width: otherwise the browser picks a too-small file and stretches it.
            sizes="(min-width: 1440px) 533px, (min-width: 1140px) 45vw, (min-width: 768px) 75vw, 660px"
            quality={90}
            className="pointer-events-none absolute left-[-54.05%] top-[-13.28%] h-[145.45%] w-[208.13%] max-w-none"
          />
        </div>
      </Link>

      <div className="flex flex-col gap-[27px]">
        <div className="flex flex-col gap-[10px] font-display text-[25px] leading-normal max-desktop:text-[20px]">
          <Link href={href} className="truncate font-medium text-white hover:underline">
            {name}
          </Link>
          <div className="flex items-center justify-between">
            <p className="font-normal text-white/40">{category}</p>
            <p className="font-medium text-white">${price}</p>
          </div>
        </div>

        <div className="flex items-center gap-[20px] max-desktop:gap-[12px]">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[200px] border-2 border-white/60 px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-white max-desktop:px-[12px] max-desktop:text-[16px]"
          >
            Add to cart
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[200px] bg-white px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background max-desktop:px-[12px] max-desktop:text-[16px]"
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}
