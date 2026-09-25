import Image from "next/image";

// Placeholder reviews from the design: they will come from the backend.
const REVIEWS = [
  "Excellent experience from start to finish. The product arrived quickly, perfectly packaged, and the quality was exactly as expected. Definitely recommend!",
  "Great service and excellent product quality. Everything was exactly as described, and the whole purchasing process was simple, smooth, and reliable.",
  "I’m very happy with my purchase. The product arrived in perfect condition, and the attention throughout the process made the experience even better.",
  "Amazing shopping experience! The product feels premium, arrived on time, and was carefully packaged. I’ll definitely come back for my next Apple purchase.",
  "Everything went perfectly with my order. Great quality, fast delivery, and a very easy buying process. You can tell they really care about their customers.",
  "Very satisfied with my purchase. The product was exactly what I expected, the quality is excellent, and the delivery was fast and hassle-free.",
  "One of the best online shopping experiences I’ve had. Great products, excellent quality, and a smooth process from placing the order to delivery.",
];

function ReviewCard({ text }: { text: string }) {
  return (
    <li
      // The card's own glow: a soft light in the top-left corner of the frame.
      className="w-[376.66px] shrink-0 rounded-[20px] border-[1.5px] border-[#3c3c3c] bg-[radial-gradient(ellipse_222px_85px_at_8.7px_3.9px,#2c2c2c_0%,#1c1c1c_50%,#0d0d0d_100%)] p-[10px] max-tablet:w-[300px]"
    >
      <figure className="m-0 flex h-[220.56px] flex-col gap-[21px] rounded-[10px] bg-black/[0.54] p-[16px]">
        <Image src="/svg/reviews/quote.svg" alt="" width={22} height={25} className="shrink-0" />
        <blockquote className="m-0 py-px font-sans text-[18px] leading-[25.6px] text-[#d0d0d0]">{text}</blockquote>
      </figure>
    </li>
  );
}

/**
 * One pass of the reviews. The ticker renders it twice and slides the track by exactly one pass, so the loop has
 * no seam; each pass ends with the same gap that separates the cards, to keep the spacing even where they meet.
 */
function Group({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul aria-hidden={duplicate || undefined} className="flex shrink-0 items-center gap-[33px] pr-[33px]">
      {REVIEWS.map((text) => (
        <ReviewCard key={text} text={text} />
      ))}
    </ul>
  );
}

/** Product page, section 3 (Figma 128:620): heading and a ticker of customer reviews. */
export default function ProductReviews() {
  return (
    <section className="relative flex flex-col items-center gap-[99px] overflow-clip pb-[184px] pt-[125px] max-notebook:gap-[56px] max-notebook:pb-[200px] max-notebook:pt-[80px] max-tablet:gap-[40px] max-tablet:pb-[160px] max-tablet:pt-[48px]">
      {/* Wide dark glow on the right, behind the ticker. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+113px)] top-[-7px] hidden h-[1600.171px] w-[1543.61px] items-center justify-center notebook:flex">
        <div className="relative h-[1576.367px] w-[648.69px] flex-none rotate-[-42.53deg]">
          <Image src="/svg/product/side-glow.svg" alt="" width={1550} height={2478} className="absolute inset-[-28.6%_-69.51%] size-auto max-w-none" />
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center gap-[16px] px-section text-center max-tablet:max-w-[550px]">
        <h2 className="bg-[linear-gradient(-66.94deg,#999_14.907%,#fff_64.578%)] bg-clip-text font-display text-[64px] font-medium leading-[1.2] text-transparent max-notebook:text-[44px] max-tablet:text-[32px]">
          What our customers say about us
        </h2>
        <p className="w-[636px] max-w-full font-sans text-[20px] leading-[1.48] text-[#a0a0a0] max-tablet:text-[18px]">
          Every device we deliver comes with our total dedication to excellence, resulting in unmatched satisfaction and top-tier quality for all our clients.
        </p>
      </div>

      {/* Full width; the edges fade out (transparent → opaque at 12.5% → opaque at 87.5% → transparent). */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12.5%,#000_87.5%,transparent)]">
        {/* Inline duration: slower than the site's default ticker (30s), so the reviews are readable. */}
        <div
          className="flex w-max animate-ticker motion-reduce:animate-none"
          style={{ animationDuration: "70s" }}
        >
          <Group />
          <Group duplicate />
        </div>
      </div>
    </section>
  );
}
