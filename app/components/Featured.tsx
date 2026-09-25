"use client";

import Image from "next/image";
import { useLiveProducts } from "../lib/cms/products";
import ProductCarousel from "./ProductCarousel";
import type { Product } from "./ProductCard";

const cardImage = "absolute inset-0 size-full object-cover";

// The home carousel shows the products marked "Recommended" in the CMS. These five have their own cut-out art, cropped
// by hand; any other product uses its catalog photo (a wide render) with the same crop as the catalog cards.
const ART: Record<string, Pick<Product, "image" | "frameClassName" | "imageClassName">> = {
  "ipad-pro-13": { image: "/images/products/ipad-pro.png", frameClassName: "left-px top-[-17px] size-[348px]", imageClassName: cardImage },
  "iphone-18-pro-max": { image: "/images/products/iphone.png", frameClassName: "left-px top-[-17px] size-[348px]", imageClassName: cardImage },
  "apple-watch-ultra-3": {
    image: "/images/products/watch-ultra.png",
    frameClassName: "left-[49.5px] top-[15px] h-[283px] w-[249px] overflow-hidden",
    imageClassName: "absolute left-0 top-[-5.12%] h-[109.27%] w-full",
  },
  "airpods-pro-2-gen": {
    image: "/images/products/airpods-pro.png",
    frameClassName: "left-[30.5px] top-[41px] h-[232.39px] w-[288.727px] overflow-hidden",
    imageClassName: "absolute left-[-54.05%] top-[-13.28%] h-[145.45%] w-[208.13%]",
  },
  "macbook-air-13-m4": { image: "/images/products/macbook-air.png", frameClassName: "left-px top-[-17px] size-[348px]", imageClassName: cardImage },
};

const WIDE_RENDER = {
  frameClassName: "left-[30.5px] top-[41px] h-[232.39px] w-[288.727px] overflow-hidden",
  imageClassName: "absolute left-[-54.05%] top-[-13.28%] h-[145.45%] w-[208.13%]",
};

export default function Featured({ loggedIn = false }: { loggedIn?: boolean }) {
  const productsBase = loggedIn ? "/home/products" : "/products";
  const products: Product[] = useLiveProducts()
    .filter((product) => product.recommended)
    .map((product) => ({
      name: product.name,
      price: product.price,
      href: `${productsBase}/${product.slug}`,
      ...(ART[product.slug] ?? { image: product.image, ...WIDE_RENDER }),
    }));

  return (
    <section className="relative flex flex-col items-center overflow-x-clip pb-[134px] pt-[93px]">
      {/* Planet horizon, fading in from the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(50%-0.53px)] top-[-235.61px] h-[1039.221px] w-[1994.666px] -translate-x-1/2 origin-[50%_328.61px] scale-[var(--m)] mix-blend-lighten [mask-image:linear-gradient(to_bottom,transparent_220px,#000_565px)]"
      >
        <Image
          src="/images/planet.png"
          alt=""
          width={3168}
          height={1344}
          className="absolute left-0 top-[18.59%] h-[81.43%] w-full max-w-none"
        />
      </div>

      <Image
        src="/images/mcbook.webp"
        alt=""
        width={870}
        height={486}
        className="relative h-[486px] w-[870px] shrink-0 object-cover max-notebook:h-auto max-notebook:w-full max-notebook:max-w-[770px]"
      />

      <div className="relative mt-[117px] flex w-full flex-col items-center gap-[262px] max-notebook:gap-[160px]">
        <div className="flex w-full justify-center px-section">
        <h2 className="w-[1171px] max-w-full text-center font-display text-[80px] font-medium leading-[1.045] text-white notebook:max-desktop:text-[70px] max-notebook:text-[47px] max-tablet:text-[40px]">
          Selected to{" "}
          <span className="bg-gradient-to-r from-white to-[#666] bg-clip-text text-transparent">
            upgrade your day
          </span>
        </h2>
        </div>
        {/* The carousel needs at least one card; with none marked "Recommended" only the heading stays. */}
        {products.length > 0 && <ProductCarousel key={products.map((p) => p.href).join()} products={products} />}
      </div>
    </section>
  );
}
