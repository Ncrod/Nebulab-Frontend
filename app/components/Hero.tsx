import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "./ArrowIcon";
import HeroScale from "./HeroScale";

export default function Hero() {
  return (
    <section className="relative flex min-h-0 flex-col items-center gap-[10px] overflow-clip px-5 pb-[150px] pt-[calc(592px*var(--k))] tablet:max-notebook:pt-[calc(592px*var(--k)+30px)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:top-[calc(340px*var(--k))] after:z-[5] after:bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,5,0.35)_18%,rgba(5,5,5,0.8)_32%,rgba(5,5,5,0.95)_42%,#050505_50%)] after:content-[''] tablet:px-[10%] notebook:min-h-[980px] desktop:min-h-[1130px] notebook:overflow-x-clip notebook:overflow-y-visible notebook:pb-[273px] desktop:pb-[423px] notebook:pt-[152px] notebook:after:hidden">
      <HeroScale />
      {/* Tablet and mobile: one flat background picture, scaled to the section width */}
      <Image
        src="/images/Bgtabletnew.avif"
        alt=""
        width={1139}
        height={1744}
        aria-hidden="true"
        sizes="100vw"
        className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full max-w-none notebook:hidden"
      />
      {/* Notebook and up: decorative background, laid out on the 1920px design canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[1920px] -translate-x-1/2 notebook:block">
        <div className="absolute left-[-207px] top-[-196px] flex h-[465.722px] w-[540.862px] items-center justify-center">
          <div className="flex-none rotate-[-38.34deg]">
            <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
          </div>
        </div>
        <Image
          src="/images/agujeronegro.webp"
          alt=""
          width={1682}
          height={1256}
          className="absolute left-[610px] top-[-184px] desktop:left-[492px] desktop:top-[-142px] h-[1256px] w-[1682px] max-w-none object-cover"
        />
        <Image
          src="/images/cel.webp"
          alt=""
          width={751}
          height={932}
          className="absolute left-[1024px] top-[21px] h-[932px] w-[750.778px] max-w-none object-cover"
        />
      </div>

      <div className="relative z-10 flex w-[1470px] max-w-full flex-col items-start max-notebook:items-center">
        <div className="flex w-[826px] max-w-full max-tablet:w-full max-tablet:max-w-[445px] flex-col items-start gap-[39px] max-notebook:items-center">
          <div className="flex w-full flex-col items-start gap-[21px] max-notebook:items-center max-notebook:text-center">
            <h1 className="w-full bg-[linear-gradient(179.99deg,#fff_6.33%,rgba(255,255,255,0)_99.97%)] bg-clip-text font-display text-[90px] font-medium leading-[normal] text-transparent max-desktop:text-[70px] max-tablet:text-[40px]">
              Your Destination for Everything Apple
            </h1>
            <p className="w-[687px] max-w-full font-sans text-[30px] leading-[normal] text-white/75 max-desktop:text-[25px] max-tablet:text-[20px] notebook:max-desktop:max-w-[660px]">
              Explore genuine Apple gear and top-tier accessories engineered to
              power your day seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-[25px] max-notebook:w-[604px] max-notebook:max-w-full max-tablet:w-full max-tablet:flex-col max-tablet:items-stretch max-tablet:gap-[15px]">
            <Link
              href="/contact"
              className="flex items-center overflow-clip rounded-[200px] border-2 border-white/60 max-notebook:w-[297px] max-tablet:w-full max-notebook:justify-center px-[31px] py-[15.5px] font-display text-[20px] max-tablet:text-[18px] font-medium leading-[24.32px] tracking-[0.304px] text-white whitespace-nowrap"
            >
              Contact Us
            </Link>
            <Link
              href="/products"
              className="group flex items-center gap-[20px] overflow-clip rounded-[200px] bg-white py-[8px] pl-[31px] pr-[8px] font-display text-[20px] max-tablet:w-full max-tablet:min-h-[60px] max-tablet:justify-center max-tablet:px-[31px] max-tablet:text-[18px] font-medium leading-[24.32px] tracking-[0.304px] text-background whitespace-nowrap"
            >
              Explore the Collection
              <span className="max-tablet:hidden">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
