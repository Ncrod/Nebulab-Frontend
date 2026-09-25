"use client";

import gsap from "gsap";
import Image from "next/image";
import { useRef, useState } from "react";
import { CATEGORIES, type CatalogFilter } from "../data/catalog";

const header =
  "flex w-full cursor-pointer items-center gap-[10px] overflow-clip rounded-[10px] px-[15px] py-[14px] text-left font-display text-[20px] font-medium text-white transition-colors";

function CategoryLabel({ label, icon = "/svg/catalog/category-bag.svg" }: { label: string; icon?: string }) {
  return (
    <>
      <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </>
  );
}

/** Catalog category list. "All product" also opens and closes its subcategories. */
export default function CatalogSidebar({
  selected,
  onSelect,
}: {
  selected: CatalogFilter;
  onSelect: (filter: CatalogFilter) => void;
}) {
  const [open, setOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  function toggle() {
    const panel = panelRef.current;
    const next = !open;
    setOpen(next);
    onSelect("all");
    if (!panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([panel, panel.querySelectorAll("li")]);
    if (next) {
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: reduced ? 0 : 0.45, ease: "power3.out" });
      gsap.fromTo(
        panel.querySelectorAll("li"),
        { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.35, stagger: reduced ? 0 : 0.03, ease: "power2.out" },
      );
    } else {
      gsap.to(panel, { height: 0, duration: reduced ? 0 : 0.35, ease: "power3.inOut" });
    }
  }

  // The selected header is a touch lighter than the rest.
  const bg = (active: boolean) => (active ? "bg-[#1e1e1e]" : "bg-[#101010] hover:bg-[#161616]");

  return (
    <aside className="flex w-[248px] shrink-0 flex-col gap-[44px] max-notebook:w-full">
      <h2 className="font-display text-[35px] font-medium text-white">Category</h2>

      <div className="flex flex-col gap-[12px]">
        <div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="catalog-subcategories"
            className={`${header} ${bg(selected === "all")}`}
          >
            <CategoryLabel label="All product" />
          </button>

          <div ref={panelRef} id="catalog-subcategories" inert={!open} className="overflow-hidden">
            <div className="relative pt-[25px]">
              {/* Vertical guide beside the subcategories, from the header down to the last one. */}
              <div aria-hidden="true" className="absolute bottom-0 left-[27px] top-[2px] w-px bg-white/[0.22]" />
              <ul className="flex flex-col gap-[12px] pl-[49px] font-display text-[20px] font-normal">
                {CATEGORIES.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => onSelect(name)}
                      aria-pressed={selected === name}
                      className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${selected === name ? "text-white" : "text-[#a0a0a0]"}`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect("new")}
          aria-pressed={selected === "new"}
          className={`${header} ${bg(selected === "new")}`}
        >
          <CategoryLabel label="New Arrival" icon="/svg/catalog/category-tag.svg" />
        </button>
        <button
          type="button"
          onClick={() => onSelect("Accesories")}
          aria-pressed={selected === "Accesories"}
          className={`${header} ${bg(selected === "Accesories")}`}
        >
          <CategoryLabel label="Accesories" icon="/svg/catalog/category-headphones.svg" />
        </button>
      </div>
    </aside>
  );
}
