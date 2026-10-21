import Image from "next/image";
import GlobePulse from "./GlobePulse";

const CAROUSEL = [
  "/images/about_us/Frame 2147238042.webp",
  "/images/about_us/Frame 2147238043.webp",
  "/images/about_us/Frame 2147238044.webp",
  "/images/about_us/Frame 2147238045.webp",
  "/images/about_us/Frame 2147238046.webp",
  "/images/about_us/Frame 2147238047.webp",
  "/images/about_us/Frame 2147238048.webp",
];

const cardBase =
  "flex flex-col overflow-clip rounded-[18px] border border-white/[0.06] bg-[#101010]";

function Tile({ src }: { src: string }) {
  return (
    <div className="size-[80px] shrink-0 overflow-clip rounded-[20px] bg-[#101010]">
      <Image src={src} alt="" width={158} height={158} className="size-full object-cover" />
    </div>
  );
}

/** One pass of tiles; the row renders it twice and slides by exactly one pass for a seamless loop. */
function TileRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      <div
        className="flex w-max animate-ticker gap-[20px] motion-reduce:animate-none"
        style={{ animationDuration: "18s", animationDirection: reverse ? "reverse" : "normal" }}
      >
        <div className="flex shrink-0 gap-[20px]">
          {CAROUSEL.map((src, i) => (
            <Tile key={i} src={src} />
          ))}
        </div>
        <div aria-hidden className="flex shrink-0 gap-[20px]">
          {CAROUSEL.map((src, i) => (
            <Tile key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** About us page, first section (Figma 306:16): headline, backdrop glow and the three highlight cards. */
export default function AboutIntro() {
  return (
    <section className="relative flex w-full flex-col items-center gap-[342px] overflow-clip px-section pb-[132px] pt-[144px] max-desktop:gap-[260px] max-notebook:gap-[160px] max-notebook:pb-[90px] max-notebook:pt-[90px] max-tablet:gap-[90px] max-tablet:pb-[60px] max-tablet:pt-[60px]">
      {/* Backdrop glow (Figma 307:247): the black hole ring, with its ambient ellipse glow nested inside and
          sized/positioned as a percentage of the ring's own box, so the two always stay locked together instead
          of drifting apart across breakpoints. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[242px] z-0 h-[895px] w-[1603.59px] -translate-x-1/2 max-desktop:top-[190px] max-desktop:h-[660px] max-desktop:w-[1182px] max-notebook:top-[150px] max-notebook:h-[480px] max-notebook:w-[860px] max-tablet:top-[90px] max-tablet:h-[280px] max-tablet:w-[502px]"
      >
        <div className="absolute left-1/2 top-1/2 h-[159%] w-[91%] -translate-x-1/2 -translate-y-1/2 blur-[2px]">
          <Image src="/images/about_us/hole-ellipse.svg" alt="" fill className="object-contain" />
        </div>
        <Image src="/images/about_us/hole-ring.png" alt="" fill className="object-contain mix-blend-lighten" priority />
      </div>

      <div className="relative flex w-full max-w-[988px] flex-col items-center gap-[21px] text-center">
        <h1 className="bg-gradient-to-b from-white from-[6%] to-white/0 bg-clip-text font-display text-[90px] font-medium leading-[1.05] text-transparent max-desktop:text-[64px] max-notebook:text-[52px] max-tablet:text-[36px]">
          Technology, made simple
        </h1>
        <p className="max-w-[776px] font-sans text-[30px] leading-[1.35] text-white/75 max-notebook:text-[22px] max-tablet:text-[18px]">
          We&apos;re Nebulab: a store built for people who want genuine Apple products without the guesswork
        </p>
      </div>

      <div
        className="relative flex w-full max-w-[1368px] flex-col items-center gap-[40px] rounded-[18px] border border-white/[0.08] bg-[rgba(25,25,25,0.54)] px-[20px] py-[40px] backdrop-blur-[20px] backdrop-saturate-150 notebook:px-[30px] notebook:py-[60px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.18), inset 1px 0 0 rgba(255,255,255,0.08), inset -12px -10px 40px rgba(0,0,0,0.25), inset 12px 10px 40px rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex w-full max-w-[930px] flex-col items-center gap-[22px] notebook:gap-[40px]">
          <div className="flex w-full flex-col items-stretch gap-[22px] notebook:flex-row notebook:gap-[40px]">
            {/* Card 1: two mini carousels */}
            <div className={`${cardBase} w-full items-start justify-between gap-[27px] px-[30px] py-[35px] notebook:w-[445px] max-tablet:px-[20px] max-tablet:py-[24px]`}>
              <div className="flex w-full flex-col gap-[20px]">
                <TileRow />
                <TileRow reverse />
              </div>
              <div className="flex w-full flex-col items-start gap-[10px]">
                <h3 className="font-display text-[32px] font-normal leading-[normal] text-white max-tablet:text-[26px]">
                  Every Apple essential,
                  <br />
                  in one place
                </h3>
                <p className="font-sans text-[20px] leading-[1.3] text-[#a0a0a0] max-tablet:text-[16px]">
                  We offer 100% genuine Apple devices and accessories, backed by warranty and ready to ship to your door.
                </p>
              </div>
            </div>

            {/* Card 2: engagement graph */}
            <div className={`${cardBase} relative w-full items-center justify-end gap-[10px] px-[30px] pb-[35px] pt-[252px] notebook:w-[445px] max-tablet:px-[20px] max-tablet:pb-[24px] max-tablet:pt-[200px]`}>
              <div className="pointer-events-none absolute left-1/2 top-[-30px] h-[322px] w-[322px] -translate-x-1/2 max-tablet:h-[250px] max-tablet:w-[250px]">
                <Image src="/images/about_us/gra.webp" alt="" fill className="object-contain" />
              </div>
              <div className="flex w-full flex-col items-start gap-[10px]">
                <h3 className="font-display text-[32px] font-normal leading-[normal] text-white max-tablet:text-[26px]">
                  Trusted by thousands
                </h3>
                <p className="font-sans text-[20px] leading-[1.3] text-[#a0a0a0] max-tablet:text-[16px]">
                  Every month, thousands of customers choose us for authentic products, fast delivery and real support after the sale. It&apos;s why they keep coming back.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: worldwide shipping */}
          <div className={`${cardBase} w-full flex-col-reverse items-center gap-[30px] px-[30px] py-[35px] notebook:flex-row notebook:justify-between notebook:gap-0 notebook:px-[44px] max-tablet:px-[20px] max-tablet:py-[24px]`}>
            <div className="relative h-[220px] w-[220px] shrink-0 notebook:h-[278.89px] notebook:w-[278px]">
              <GlobePulse />
            </div>
            <div className="flex w-full flex-col items-start gap-[10px] notebook:w-[486px]">
              <h3 className="font-display text-[32px] font-normal leading-[normal] text-white max-tablet:text-[26px]">
                Worldwide Shipping
              </h3>
              <p className="font-sans text-[20px] leading-[1.3] text-[#a0a0a0] max-tablet:text-[16px]">
                Wherever you are in the world, your favorite Apple products are just a click away. We offer reliable worldwide shipping, ensuring your order reaches your doorstep safely and conveniently. Experience the best of Apple technology, delivered right to you, wherever life takes you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
