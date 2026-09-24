import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "./ArrowIcon";

export interface Product {
  name: string;
  price: number;
  href: string;
  image: string;
  /** Position/size of the image frame inside the 349x313 preview area. */
  frameClassName: string;
  /** Extra classes for the image inside its frame (used to crop). */
  imageClassName?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { name, price, href, image, frameClassName, imageClassName } = product;

  return (
    <Link
      href={href}
      className="group flex w-[384px] shrink-0 flex-col items-center gap-[10px] overflow-clip rounded-[34px] bg-white px-[20px] pb-[30px] pt-[20px]"
    >
      <div className="relative h-[313px] w-[349px] shrink-0 overflow-clip bg-white">
        <div className={`absolute ${frameClassName}`}>
          <Image
            src={image}
            alt={name}
            width={700}
            height={700}
            className={`pointer-events-none max-w-none ${imageClassName ?? "absolute inset-0 size-full object-cover"}`}
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-between px-[10px]">
        <div className="flex flex-col items-start gap-[10px] whitespace-nowrap leading-[normal]">
          <p className="font-display text-[26px] font-medium text-black/70">{name}</p>
          <p className="font-display text-[30px] font-semibold text-black">${price}</p>
        </div>
        <ArrowIcon size={68} />
      </div>
    </Link>
  );
}
