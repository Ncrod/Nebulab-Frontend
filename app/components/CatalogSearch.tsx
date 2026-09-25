"use client";

import Image from "next/image";

/** Catalog search pill. The list filters as you type; Enter or the button just keep the text (there is nothing left to apply). */
export default function CatalogSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex w-[580px] max-w-full items-center justify-between gap-[10px] rounded-[300px] bg-white py-[7px] pl-[30px] pr-[9px] max-tablet:w-full"
    >
      <Image src="/svg/catalog/search.svg" alt="" width={24} height={24} className="shrink-0" />
      <input
        type="search"
        aria-label="Search products"
        placeholder="Type anything"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent font-sans text-[20px] text-[#050505] outline-none placeholder:text-[#444] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button type="submit" className="shrink-0 cursor-pointer rounded-[300px] bg-background px-[34px] py-[11px] font-sans text-[20px] text-white">
        Search
      </button>
    </form>
  );
}
