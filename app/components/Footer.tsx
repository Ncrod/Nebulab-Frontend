import Image from "next/image";
import Link from "next/link";

const socials = [
  { label: "Instagram", href: "#", left: "left-0" },
  { label: "Facebook", href: "#", left: "left-[48px]" },
  { label: "WhatsApp", href: "#", left: "left-[90.209px]" },
];

export default function Footer() {
  return (
    <footer className="flex w-full py-[40px] notebook:h-[110px] notebook:py-0 items-center justify-center border-t px-section border-white/20 bg-[#0f0f0f]">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-[15px] notebook:max-w-[1303px] notebook:flex-row notebook:justify-between notebook:gap-[24px]">
        <Link href="/" aria-label="Nebulab" className="order-last notebook:order-none">
          <Image src="/svg/nebulab-logo.svg" alt="Nebulab" width={229} height={53} />
        </Link>

        <p className="whitespace-nowrap text-center font-sans text-[17px] leading-[27px] text-[#c9c9c9]">
          Copyright © Nebulab 2026. All rights reserved.
        </p>

        <div className="relative order-first h-[24px] w-[114.209px] shrink-0 notebook:order-none">
          <Image src="/svg/socials.svg" alt="" width={114} height={24} className="size-full max-w-none" />
          {socials.map(({ label, href, left }) => (
            <a key={label} href={href} aria-label={label} className={`absolute top-0 size-[24px] ${left}`} />
          ))}
        </div>
      </div>
    </footer>
  );
}
