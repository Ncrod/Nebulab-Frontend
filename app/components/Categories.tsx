import Link from "next/link";

// Each one opens the products catalog with that category already selected.
const categories = [
  { label: "Iphone", category: "Iphone" },
  { label: "Macbook", category: "Macbook" },
  { label: "Ipad", category: "Ipad" },
  { label: "Watch", category: "Apple Watch" },
  { label: "AirPods", category: "AirPods" },
  { label: "Accesories", category: "Accesories" },
];

/**
 * One pass of the list. Above 957px it is a centred row. At 957px and below it
 * becomes an endless ticker: the group is rendered twice and the track slides
 * by exactly one group, so the loop has no seam. Every item is followed by a
 * separator in ticker mode (the last one is hidden otherwise) so the spacing
 * stays even where the copies meet.
 */
function Group({ duplicate = false, productsHref }: { duplicate?: boolean; productsHref: string }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className={`items-center gap-[44px] font-display text-[30px] font-normal leading-[normal] whitespace-nowrap text-white/75 max-notebook:text-[22px] max-[957px]:flex max-[957px]:shrink-0 max-[957px]:pr-[44px] ${
        duplicate ? "hidden" : "flex"
      }`}
    >
      {categories.map(({ label, category }, i) => (
        <li key={label} className="flex items-center gap-[44px]">
          {i > 0 && <span aria-hidden="true" className="h-[25px] w-px bg-white" />}
          <Link href={`${productsHref}?category=${encodeURIComponent(category)}#catalog`} tabIndex={duplicate ? -1 : undefined}>
            {label}
          </Link>
          {i === categories.length - 1 && (
            <span aria-hidden="true" className="hidden h-[25px] w-px bg-white max-[957px]:block" />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Categories({ loggedIn = false }: { loggedIn?: boolean }) {
  const productsHref = loggedIn ? "/home/products" : "/products";
  return (
    <section className="flex h-[100px] items-center justify-center px-section py-[10px] max-[957px]:px-0">
      <div className="flex max-[957px]:w-full max-[957px]:overflow-hidden max-[957px]:[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max motion-reduce:animate-none max-[957px]:animate-ticker">
          <Group productsHref={productsHref} />
          <Group duplicate productsHref={productsHref} />
        </div>
      </div>
    </section>
  );
}
