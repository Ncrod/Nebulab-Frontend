import Image from "next/image";
import Link from "next/link";
import { formatPrice, priceRange, type CatalogProduct } from "../data/catalog";

/** Catalog product tile: photo, name, category, price and a "Buy now" link to the product page. */
export default function CatalogProductCard({ product, href }: { product: CatalogProduct; href: string }) {
  const { name, category, image } = product;
  // Products with variants cost different amounts per combination: the tile shows the cheapest one as "From $x".
  const { min, max } = priceRange(product);
  const soldOut = product.stock <= 0;

  return (
    <article className="flex min-w-0 flex-col gap-[15px]">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square w-full overflow-clip rounded-[20px] bg-[#F6F5F8]">
        {/* Whatever the photo's shape, it is shown whole, centred, with a margin around it (fit, not cropped). */}
        <Image
          src={image}
          alt={name}
          fill
          // The frame is the card's own width, so that is what `sizes` says.
          sizes="(min-width: 1440px) 340px, (min-width: 1140px) 30vw, (min-width: 768px) 45vw, 400px"
          quality={90}
          className="pointer-events-none object-contain p-[8%]"
        />
      </Link>

      <div className="flex flex-col gap-[27px]">
        <div className="flex flex-col gap-[10px] font-display text-[25px] leading-normal max-desktop:text-[20px]">
          <Link href={href} className="truncate font-medium text-white hover:underline">
            {name}
          </Link>
          <div className="flex items-center justify-between">
            <p className="font-normal text-white/40">{category}</p>
            <p className="shrink-0 font-medium text-white">
              {max > min && <span className="mr-[6px] text-[16px] font-normal text-white/40 max-desktop:text-[14px]">From</span>}
              {formatPrice(min)}
            </p>
          </div>
        </div>

        {/* Adding needs the product's attributes chosen, so the only action here is to open its page. With nothing left
            in any combination the action goes dead instead. */}
        {soldOut ? (
          <p
            aria-disabled="true"
            className="flex w-full cursor-not-allowed items-center justify-center whitespace-nowrap rounded-[200px] bg-white/30 px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background/60 max-desktop:text-[16px]"
          >
            Sold out
          </p>
        ) : (
          <Link
            href={href}
            className="flex w-full items-center justify-center whitespace-nowrap rounded-[200px] bg-white px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background transition-opacity duration-200 hover:opacity-80 max-desktop:text-[16px]"
          >
            Buy now
          </Link>
        )}
      </div>
    </article>
  );
}
