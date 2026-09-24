import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "./ArrowIcon";

export default function HeroBackup() {
  return (
    <section className="relative flex min-h-[1230px] flex-col items-center gap-[10px] px-[10px] pb-[523px] pt-[152px]">
      {/* Decorative background, laid out on the 1920px design canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-[1920px] -translate-x-1/2">
        <div className="absolute left-[-207px] top-[-196px] flex h-[465.722px] w-[540.862px] items-center justify-center">
          <div className="flex-none rotate-[-38.34deg]">
            <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
          </div>
        </div>
        <Image
          src="/images/hero-iphone.png"
          alt=""
          width={1682}
          height={1256}
          priority
          className="absolute left-[492px] top-[-142px] h-[1256px] w-[1682px] max-w-none object-cover"
        />
        <Image
          src="/images/cel.webp"
          alt=""
          width={751}
          height={932}
          priority
          className="absolute left-[1024px] top-[21px] h-[932px] w-[750.778px] max-w-none object-cover"
        />
      </div>

      <div className="relative flex w-[1470px] max-w-full flex-col items-start">
        <div className="flex w-[826px] max-w-full flex-col items-start gap-[39px]">
          <div className="flex w-full flex-col items-start gap-[21px]">
            <h1 className="w-full bg-[linear-gradient(179.99deg,#fff_6.33%,rgba(255,255,255,0)_99.97%)] bg-clip-text font-display text-[90px] font-medium leading-[normal] text-transparent">
              Your Destination for Everything Apple
            </h1>
            <p className="w-[687px] max-w-full font-sans text-[30px] leading-[normal] text-white/75">
              Explore genuine Apple gear and top-tier accessories engineered to
              power your day seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-[25px]">
            <Link
              href="/contact"
              className="flex items-center overflow-clip rounded-[200px] border-2 border-white/60 px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-white whitespace-nowrap"
            >
              Contact Us
            </Link>
            <Link
              href="/products"
              className="group flex items-center gap-[20px] overflow-clip rounded-[200px] bg-white py-[8px] pl-[31px] pr-[8px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background whitespace-nowrap"
            >
              Explore the Collection
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
