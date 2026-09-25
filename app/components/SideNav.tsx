"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// One side nav for the whole site (mounted in the root layout). Session and active page are read
// from the URL: everything under /home is the signed-in variant. Cart and account need a session,
// so signed out they lead to the login.
const items = (loggedIn: boolean) => [
  { label: "Home", href: loggedIn ? "/home" : "/", match: "/", icon: "/svg/icon-home.svg", activeIcon: null },
  { label: "Products", href: loggedIn ? "/home/products" : "/products", match: "/products", icon: "/svg/icon-box.svg", activeIcon: "/svg/icon-box-active.svg" },
  { label: "Cart", href: loggedIn ? "/cart" : "/login", match: "/cart", icon: "/svg/icon-bag.svg", activeIcon: null },
  { label: "Account", href: loggedIn ? "/account" : "/login", match: "/account", icon: "/svg/icon-user.svg", activeIcon: null },
];

export default function SideNav() {
  const pathname = usePathname();
  // The login screen is full screen and has no side nav.
  if (pathname.startsWith("/login")) return null;

  const loggedIn = pathname === "/home" || pathname.startsWith("/home/");
  // "/home/products" and "/products" both mean the products page.
  const page = loggedIn ? pathname.slice("/home".length) || "/" : pathname;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed left-[15px] top-[268px] z-30 hidden flex-col items-center gap-[46.667px] overflow-clip rounded-[63.778px] bg-white px-[11.667px] py-[34.222px] notebook:flex"
    >
      {items(loggedIn).map(({ label, href, match, icon, activeIcon }) => {
        const active = match === "/" ? page === "/" : page === match || page.startsWith(`${match}/`);
        return (
          <Link key={label} href={href} aria-label={label} aria-current={active ? "page" : undefined} className="size-[46.667px]">
            <Image src={active && activeIcon ? activeIcon : icon} alt="" width={47} height={47} className="size-full" />
          </Link>
        );
      })}
    </nav>
  );
}
