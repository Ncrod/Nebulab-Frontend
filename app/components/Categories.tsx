"use client";

import Link from "next/link";
import { useCategories } from "../lib/categories";

/**
 * One pass of the list. Above 957px it is a centred row. At 957px and below it
 * becomes an endless ticker: the group is rendered twice and the track slides
 * by exactly one group, so the loop has no seam. Every item is followed by a
 * separator in ticker mode (the last one is hidden otherwise) so the spacing
 * stays even where the copies meet.
 */
function Group({ names, duplicate = false, productsHref }: { names: string[]; duplicate?: boolean; productsHref: string }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className={`items-center gap-[44px] font-display text-[30px] font-normal leading-[normal] whitespace-nowrap text-white/75 max-notebook:text-[22px] max-[957px]:flex max-[957px]:shrink-0 max-[957px]:pr-[44px] ${
        duplicate ? "hidden" : "flex"
      }`}
    >
      {names.map((name, i) => (
        <li key={name} className="flex items-center gap-[44px]">
          {i > 0 && <span aria-hidden="true" className="h-[25px] w-px bg-white" />}
          <Link href={`${productsHref}?category=${encodeURIComponent(name)}#catalog`} tabIndex={duplicate ? -1 : undefined}>
            {name}
          </Link>
          {i === names.length - 1 && (
            <span aria-hidden="true" className="hidden h-[25px] w-px bg-white max-[957px]:block" />
          )}
        </li>
      ))}
    </ul>
  );
}

/** Reads the live categories from the API, not a list baked into the code (categories can be renamed or removed in the CMS). */
export default function Categories({ loggedIn = false }: { loggedIn?: boolean }) {
  const { data: categories } = useCategories();
  const names = categories.map((c) => c.name);
  const productsHref = loggedIn ? "/home/products" : "/products";
  if (names.length === 0) return null;
  return (
    <section className="flex h-[100px] items-center justify-center px-section py-[10px] max-[957px]:px-0">
      <div className="flex max-[957px]:w-full max-[957px]:overflow-hidden max-[957px]:[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max motion-reduce:animate-none max-[957px]:animate-ticker">
          <Group names={names} productsHref={productsHref} />
          <Group names={names} duplicate productsHref={productsHref} />
        </div>
      </div>
    </section>
  );
}
