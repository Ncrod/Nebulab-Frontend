import Image from "next/image";
import ProductCarousel from "./ProductCarousel";
import type { Product } from "./ProductCard";

const cardImage = "absolute inset-0 size-full object-cover";

const products: Product[] = [
  {
    name: "Ipad pro",
    price: 1199,
    href: "/products/ipad-pro",
    image: "/images/products/ipad-pro.png",
    frameClassName: "left-px top-[-17px] size-[348px]",
    imageClassName: cardImage,
  },
  {
    name: "iPhone 18 Pro Max",
    price: 1199,
    href: "/products/iphone-18-pro-max",
    image: "/images/products/iphone.png",
    frameClassName: "left-px top-[-17px] size-[348px]",
    imageClassName: cardImage,
  },
  {
    name: "Watch Ultra",
    price: 1199,
    href: "/products/watch-ultra",
    image: "/images/products/watch-ultra.png",
    frameClassName: "left-[49.5px] top-[15px] h-[283px] w-[249px] overflow-hidden",
    imageClassName: "absolute left-0 top-[-5.12%] h-[109.27%] w-full",
  },
  {
    name: "Airpods Pro",
    price: 1199,
    href: "/products/airpods-pro",
    image: "/images/products/airpods-pro.png",
    frameClassName: "left-[30.5px] top-[41px] h-[232.39px] w-[288.727px] overflow-hidden",
    imageClassName: "absolute left-[-54.05%] top-[-13.28%] h-[145.45%] w-[208.13%]",
  },
  {
    name: "Mackbook Air",
    price: 1199,
    href: "/products/macbook-air",
    image: "/images/products/macbook-air.png",
    frameClassName: "left-px top-[-17px] size-[348px]",
    imageClassName: cardImage,
  },
];

export default function Featured() {
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
        className="relative h-[486px] w-[870px] shrink-0 object-cover tablet:max-notebook:h-auto tablet:max-notebook:w-full tablet:max-notebook:max-w-[770px]"
      />

      <div className="relative mt-[117px] flex w-full flex-col items-center gap-[262px] tablet:max-notebook:gap-[160px]">
        <div className="flex w-full justify-center px-section">
        <h2 className="w-[1171px] max-w-full text-center font-display text-[80px] font-medium leading-[1.045] text-white notebook:max-desktop:text-[70px] tablet:max-notebook:text-[47px]">
          Selected to{" "}
          <span className="bg-gradient-to-r from-white to-[#666] bg-clip-text text-transparent">
            upgrade your day
          </span>
        </h2>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
