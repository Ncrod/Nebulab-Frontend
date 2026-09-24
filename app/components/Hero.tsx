import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "./ArrowIcon";
import BlackHole from "./BlackHole";
import HeroScale from "./HeroScale";

export default function Hero() {
  return (
    <section className="relative flex min-h-0 flex-col items-center gap-[10px] overflow-clip px-5 pb-[150px] pt-[calc(592px*var(--k))] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:top-[calc(340px*var(--k))] after:z-[5] after:bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,5,0.35)_18%,rgba(5,5,5,0.8)_32%,rgba(5,5,5,0.95)_42%,#050505_50%)] after:content-[''] tablet:px-[10%] notebook:min-h-[980px] desktop:min-h-[1130px] notebook:overflow-x-clip notebook:overflow-y-visible notebook:pb-[273px] desktop:pb-[423px] notebook:pt-[152px] notebook:after:hidden">
      <HeroScale />
      {/* Decorative background, laid out on the 1920px design canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[calc(50%-1222.4px*var(--k))] top-[calc(73px*var(--k))] h-full w-[1920px] origin-top-left scale-[calc(0.888*var(--k))] notebook:left-1/2 notebook:top-0 notebook:-translate-x-1/2 notebook:scale-100">
        <div className="absolute left-[-207px] top-[-196px] flex h-[465.722px] w-[540.862px] items-center justify-center">
          <div className="flex-none rotate-[-38.34deg]">
            <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
          </div>
        </div>
        <BlackHole
          distance={19}
          diskOuter={12}
          diskThickness={0.18}
          grain={0.9}
          glow={0.5}
          brightness={1.6}
          fov={52.97}
          resolution={0.55}
          focus={[0.4694, 0.518]}
          className="absolute left-[62px] top-[-400px] notebook:left-[152px] h-[1630px] w-[2768px] [mask-image:linear-gradient(70deg,transparent_488px,#000_1287px)]"
        />
        <Image
          src="/images/cel.webp"
          alt=""
          width={751}
          height={932}
          priority
          className="absolute left-[1024px] top-[-13px] notebook:top-[21px] h-[932px] w-[750.778px] max-w-none object-cover"
        />
      </div>

      <div className="relative z-10 flex w-[1470px] max-w-full flex-col items-start tablet:max-notebook:items-center">
        <div className="flex w-[826px] max-w-full flex-col items-start gap-[39px] tablet:max-notebook:items-center">
          <div className="flex w-full flex-col items-start gap-[21px] tablet:max-notebook:items-center tablet:max-notebook:text-center">
            <h1 className="w-full bg-[linear-gradient(179.99deg,#fff_6.33%,rgba(255,255,255,0)_99.97%)] bg-clip-text font-display text-[90px] font-medium leading-[normal] text-transparent tablet:max-desktop:text-[70px]">
              Your Destination for Everything Apple
            </h1>
            <p className="w-[687px] max-w-full font-sans text-[30px] leading-[normal] text-white/75 tablet:max-desktop:text-[25px] notebook:max-desktop:max-w-[660px]">
              Explore genuine Apple gear and top-tier accessories engineered to
              power your day seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-[25px] tablet:max-notebook:w-[604px] tablet:max-notebook:max-w-full">
            <Link
              href="/contact"
              className="flex items-center overflow-clip rounded-[200px] border-2 border-white/60 tablet:max-notebook:w-[297px] tablet:max-notebook:justify-center px-[31px] py-[15.5px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-white whitespace-nowrap"
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
