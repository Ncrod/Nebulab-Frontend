import ProductsBanner from "./ProductsBanner";
import ProductsCards from "./ProductsCards";

/** Products page, section 2 (Figma 85:283): rotating banner, the three product cards and the soft glow behind them. */
export default function ProductsShowcase() {
  return (
    <section className="relative">
      {/* Soft light in the top-left corner, same glow as the hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-207px] top-[-305px] hidden h-[465.722px] w-[540.862px] items-center justify-center notebook:flex">
        <div className="flex-none rotate-[-38.34deg]">
          <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1370px] flex-col gap-[40px] px-section pb-[56px] pt-[116px] max-notebook:pt-[40px] max-tablet:gap-[20px] max-tablet:pt-[24px]">
        <ProductsBanner />
        <ProductsCards />
      </div>
    </section>
  );
}
