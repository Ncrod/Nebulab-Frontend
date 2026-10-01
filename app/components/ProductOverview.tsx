import Image from "next/image";
import type { CatalogProduct } from "../data/catalog";
import ProductPanel from "./ProductPanel";

const perks = [
  { icon: "/svg/product/shipping.svg", text: "Shop your favorite Apple products and enjoy complimentary shipping on orders over $200." },
  { icon: "/svg/product/returns.svg", text: "Hassle-free returns for a simple, worry-free shopping experience." },
];

/** Product page, section 2 (Figma 114:307): the white card with the photo, the perks, and the name, price, options and buttons. */
export default function ProductOverview({ product, loggedIn = false }: { product: CatalogProduct; loggedIn?: boolean }) {
  return (
    <section className="relative pb-[56px]">
      {/* Soft light in the top-left corner, same glow as the hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-207px] top-[-305px] hidden h-[465.722px] w-[540.862px] items-center justify-center notebook:flex">
        <div className="flex-none rotate-[-38.34deg]">
          <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
        </div>
      </div>
      {/* Wide dark glow on the left, behind the card. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-673px] top-[273px] hidden h-[1600.171px] w-[1543.61px] items-center justify-center notebook:flex">
        <div className="relative h-[1576.367px] w-[648.69px] flex-none rotate-[-42.53deg]">
          <Image src="/svg/product/side-glow.svg" alt="" width={1550} height={2478} className="absolute inset-[-28.6%_-69.51%] size-auto max-w-none" />
        </div>
      </div>

      {/* From the desktop breakpoint up to 1770px the fixed side nav would cover the left edge, so it gets room. */}
      <div className="relative mx-auto w-full max-w-[1540px] px-section pt-[116px] desktop:max-[1770px]:pl-[110px] max-notebook:pt-[40px] max-tablet:pt-[24px]">
        <div className="flex items-start justify-center gap-[55px] rounded-[31px] bg-white p-[80px] max-desktop:p-[48px] max-notebook:mx-auto max-notebook:w-full max-notebook:max-w-[720px] max-tablet:max-w-[550px] max-notebook:flex-col max-notebook:items-stretch max-notebook:gap-[48px] max-tablet:rounded-[20px] max-tablet:p-[20px] max-tablet:pb-[50px]">
          {/* Left: photo and perks. Below the notebook breakpoint this box disappears (`contents`, and with it its
              bottom line and padding) and its children join the card's column, reordered: photo, product info, perks. */}
          <div className="flex min-w-0 flex-[639] flex-col items-center gap-[57px] border-b border-black/20 pb-[39px] max-notebook:contents">
            {/* The photo is placed in the middle of the frame; whatever it does not cover shows the frame's colour. */}
            <div className="relative aspect-[639/465] w-full overflow-clip rounded-[20px] bg-[#F6F5F8] p-[10px] max-notebook:order-1">
              <div className="relative size-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1140px) 640px, 90vw"
                  className="object-contain"
                  quality={90}
                  priority
                />
              </div>
            </div>

            {/* Stacked and centred from 1304px down to the notebook minimum (1140px), and again on mobile. */}
            <div className="flex w-full max-w-[572px] items-start justify-center gap-[36px] notebook:max-[1305px]:flex-col notebook:max-[1305px]:items-center notebook:max-[1305px]:gap-[24px] max-tablet:max-w-[380px] max-tablet:flex-col max-tablet:gap-[24px] max-notebook:order-3 max-notebook:mx-auto">
              {perks.map(({ icon, text }) => (
                <div key={icon} className="flex min-w-0 flex-1 flex-col items-center gap-[10px] notebook:max-[1305px]:max-w-[360px] notebook:max-[1305px]:flex-none">
                  <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
                  <p className="text-center font-sans text-[18px] font-medium leading-normal text-[#222]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: name, price, options and actions. Keyed by product: going to another product must not carry over
              the choices made on this one. */}
          <ProductPanel key={product.slug} product={product} loggedIn={loggedIn} />
        </div>
      </div>
    </section>
  );
}
