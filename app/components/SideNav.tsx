import Image from "next/image";
import Link from "next/link";

// Cart and account need a session: signed out they lead to the login.
const items = (loggedIn: boolean) => [
  { label: "Home", href: loggedIn ? "/home" : "/", icon: "/svg/icon-home.svg" },
  { label: "Products", href: "/products", icon: "/svg/icon-box.svg" },
  { label: "Cart", href: loggedIn ? "/cart" : "/login", icon: "/svg/icon-bag.svg" },
  { label: "Account", href: loggedIn ? "/account" : "/login", icon: "/svg/icon-user.svg" },
];

export default function SideNav({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed left-[15px] top-[268px] z-30 hidden flex-col items-center gap-[46.667px] overflow-clip rounded-[63.778px] bg-white px-[11.667px] py-[34.222px] notebook:flex"
    >
      {items(loggedIn).map(({ label, href, icon }) => (
        <Link key={label} href={href} aria-label={label} className="size-[46.667px]">
          <Image src={icon} alt="" width={47} height={47} className="size-full" />
        </Link>
      ))}
    </nav>
  );
}
