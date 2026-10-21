import Link from "next/link";
import ArrowIcon from "./ArrowIcon";
import CountUp from "./CountUp";

const STATS = [
  { value: 5, label: "Years of Experience" },
  { value: 3000, label: "Products Sold" },
  { value: 10, label: "Countries Served" },
  { value: 1000, label: "Clients" },
];

/** About us page, second section (Figma 331:7): call to action and animated numbers. */
export default function AboutStats({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="relative z-10 flex w-full justify-center px-section pb-[137px] pt-[66px] max-notebook:pb-[90px] max-tablet:pb-[60px] max-tablet:pt-[40px]">
      <div className="flex w-full max-w-[1134px] flex-col items-center gap-[60px] notebook:flex-row notebook:gap-[75px] max-tablet:gap-[40px]">
        <div className="flex w-full flex-col items-start gap-[40px] max-notebook:max-w-[560px] max-notebook:items-center max-notebook:text-center notebook:w-[507px] notebook:shrink-0">
          <div className="flex w-full flex-col gap-[16px] max-notebook:items-center">
            <h2 className="font-display text-[64px] font-medium leading-[normal] text-white max-desktop:text-[48px] max-tablet:text-[36px]">
              Your Gateway to Apple Innovation
            </h2>
            <p className="font-sans text-[20px] leading-[normal] text-[#a0a0a0] max-tablet:text-[16px]">
              Your trusted store for the newest Apple devices. Great prices, secure payments and delivery right to your door.
            </p>
          </div>
          <Link
            href={loggedIn ? "/home/products" : "/products"}
            className="group flex items-center gap-[20px] overflow-clip rounded-[200px] bg-white py-[8px] pl-[31px] pr-[8px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background"
          >
            Explore the Collection
            <ArrowIcon />
          </Link>
        </div>

        <dl className="grid w-full grid-cols-2 justify-items-center gap-x-[40px] gap-y-[60px] text-center text-white max-notebook:max-w-[560px] notebook:w-[552px] notebook:gap-x-[115px] notebook:gap-y-[115px]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex w-full max-w-[210px] flex-col items-center">
              <dd className="order-first font-display text-[64px] font-bold leading-[normal] max-desktop:text-[48px] max-tablet:text-[36px]">
                <CountUp to={value} suffix="+" />
              </dd>
              <dt className="font-sans text-[24px] leading-[normal] max-tablet:text-[16px]">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
