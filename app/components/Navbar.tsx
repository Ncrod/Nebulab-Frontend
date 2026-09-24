import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "./ArrowIcon";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About us", href: "/about" },
];

const fadeText =
  "bg-gradient-to-b from-white to-white/0 to-[115.97%] bg-clip-text text-transparent";

export default function Navbar() {
  return (
    <header className="flex w-full justify-center px-5 tablet:px-[10%] py-[28px]">
      <nav className="flex w-full max-w-[1654px] items-center justify-between">
        <Link href="/" aria-label="Nebulab">
          <Image
            src="/svg/nebulab-logo.svg"
            alt="Nebulab"
            width={229}
            height={53}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-[50px] font-display text-[20px] font-medium tablet:flex">
          {links.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className={fadeText}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[19px]">
          <Link
            href="/sign-in"
            className={`font-display text-[20px] font-normal ${fadeText}`}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="group flex items-center gap-[15px] overflow-clip rounded-[200px] bg-white py-[8px] pl-[31px] pr-[8px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-background"
          >
            Sign up
            <ArrowIcon />
          </Link>
        </div>
      </nav>
    </header>
  );
}
