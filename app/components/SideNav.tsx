import Image from "next/image";
import Link from "next/link";

const items = [
  { label: "Home", href: "/", icon: "/svg/icon-home.svg" },
  { label: "Products", href: "/products", icon: "/svg/icon-box.svg" },
  { label: "Cart", href: "/cart", icon: "/svg/icon-bag.svg" },
  { label: "Account", href: "/account", icon: "/svg/icon-user.svg" },
];

export default function SideNav() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed left-[15px] top-[268px] z-30 hidden flex-col items-center gap-[46.667px] overflow-clip rounded-[63.778px] bg-white px-[11.667px] py-[34.222px] notebook:flex"
    >
      {items.map(({ label, href, icon }) => (
        <Link key={label} href={href} aria-label={label} className="size-[46.667px]">
          <Image src={icon} alt="" width={47} height={47} className="size-full" />
        </Link>
      ))}
    </nav>
  );
}
