"use client";

import { useLenis } from "lenis/react";
import { useMemo, useRef, useState } from "react";
import { PAGE_SIZE, filterProducts, type CatalogFilter } from "../data/catalog";
import CatalogPagination from "./CatalogPagination";
import CatalogProductCard from "./CatalogProductCard";
import CatalogSearch from "./CatalogSearch";
import CatalogSidebar from "./CatalogSidebar";

/**
 * Products page, section 3 (Figma 96:382): search, category list, product grid and pager.
 * Filtering, search and paging run on the mock data in ../data/catalog; the backend will replace that.
 */
export default function ProductsCatalog() {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const results = useMemo(() => filterProducts(filter, query), [filter, query]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectFilter(next: CatalogFilter) {
    setFilter(next);
    setPage(1);
  }

  // The list filters on every keystroke; a new search always starts on page 1.
  function changeQuery(text: string) {
    setQuery(text);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 1), totalPages));
    // Bring the top of the grid back into view, above the pager the user just pressed.
    const grid = gridRef.current;
    if (!grid) return;
    const top = grid.getBoundingClientRect().top + window.scrollY - 140;
    if (lenis) lenis.scrollTo(top, { duration: 0.8 });
    else window.scrollTo({ top, behavior: "smooth" });
  }

  function clearAll() {
    setQuery("");
    setFilter("all");
    setPage(1);
  }

  return (
    <section className="pb-[170px] pt-[120px] max-notebook:pb-[100px] max-notebook:pt-[80px] max-tablet:pb-[60px] max-tablet:pt-[48px]">
      {/* From the desktop breakpoint up to 1770px the fixed side nav would cover the left edge, so it gets room. */}
      <div className="mx-auto flex w-full max-w-[1550px] flex-col gap-[119px] px-section desktop:max-[1770px]:pl-[110px] max-notebook:gap-[56px] max-tablet:gap-[36px]">
        <div className="flex items-center justify-between gap-[24px] py-[10px] max-tablet:flex-col max-tablet:items-start">
          <h1 className="font-display text-[64px] font-medium leading-normal text-white max-notebook:text-[48px] max-tablet:text-[36px]">
            Give{" "}
            <span className="bg-[linear-gradient(90deg,#FFF_0%,#666_100%)] bg-clip-text text-transparent">all you need</span>
          </h1>

          <CatalogSearch value={query} onChange={changeQuery} />
        </div>

        <div className="flex items-start justify-between gap-[40px] max-notebook:flex-col">
          <CatalogSidebar selected={filter} onSelect={selectFilter} />

          <div ref={gridRef} className="flex w-full min-w-0 max-w-[1050px] flex-col gap-[46px] max-notebook:max-w-none">
            {visible.length > 0 ? (
              <div className="grid grid-cols-3 gap-[40px] max-desktop:gap-[24px] max-notebook:grid-cols-2 max-tablet:grid-cols-1">
                {visible.map((product) => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div role="status" className="flex flex-col items-center gap-[16px] py-[80px] text-center font-display text-white">
                <p className="text-[25px] font-medium">No products found</p>
                <p className="text-[18px] text-white/40">Try another word or another category.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-[8px] cursor-pointer rounded-[200px] border-2 border-white/60 px-[31px] py-[12px] text-[18px] font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
            <CatalogPagination page={page} totalPages={totalPages} onChange={goToPage} />
          </div>
        </div>
      </div>
    </section>
  );
}
