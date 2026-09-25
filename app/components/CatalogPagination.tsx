import Image from "next/image";

type Item = number | "gap-start" | "gap-end";

/**
 * Page buttons to show. Up to 7 pages: all of them. More: the design's "1 2 3 … 8 9 10" at the ends,
 * and "1 … 4 5 6 … 10" (current page and its neighbours) in the middle.
 */
function pageItems(page: number, total: number): Item[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3 || page >= total - 2) return [1, 2, 3, "gap-start", total - 2, total - 1, total];
  return [1, "gap-start", page - 1, page, page + 1, "gap-end", total];
}

const pageBase = "flex size-[32px] items-center justify-center rounded-[4px] font-display text-[18px] text-white";
const step =
  "flex items-center gap-[4px] font-display text-[18px] text-white enabled:cursor-pointer disabled:opacity-40";

/** Catalog pager: previous / page numbers / next. */
export default function CatalogPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-white/[0.24] py-[12px]">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className={step}>
        <Image src="/svg/catalog/arrow-prev.svg" alt="" width={20} height={20} />
        Previous
      </button>

      <div className="flex items-center gap-[8px]">
        {pageItems(page, totalPages).map((item) =>
          typeof item === "string" ? (
            <span key={item} aria-hidden="true" className={pageBase}>
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={`${pageBase} cursor-pointer transition-colors ${item === page ? "bg-[#2a2a2a]" : "hover:bg-white/10"}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className={step}>
        Next
        <Image src="/svg/catalog/arrow-prev.svg" alt="" width={20} height={20} className="-scale-x-100" />
      </button>
    </nav>
  );
}
