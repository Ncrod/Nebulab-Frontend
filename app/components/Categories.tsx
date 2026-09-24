import * as React from "react";
import Link from "next/link";

const categories = [
  { label: "Iphone", href: "/products?category=iphone" },
  { label: "Macbook", href: "/products?category=macbook" },
  { label: "Ipad", href: "/products?category=ipad" },
  { label: "Watch", href: "/products?category=watch" },
  { label: "AirPods", href: "/products?category=airpods" },
  { label: "Accesories", href: "/products?category=accesories" },
];

export default function Categories() {
  return (
    <section className="flex h-[100px] items-center justify-center p-[10px]">
      <ul className="flex items-center gap-[44px] font-display text-[30px] font-normal leading-[normal] text-white/75 whitespace-nowrap">
        {categories.map(({ label, href }, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <li aria-hidden="true" className="h-[25px] w-px bg-white" />
            )}
            <li>
              <Link href={href}>{label}</Link>
            </li>
          </React.Fragment>
        ))}
      </ul>
    </section>
  );
}
