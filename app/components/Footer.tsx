import Image from "next/image";
import Link from "next/link";

const socials = [
  { label: "Instagram", href: "#", left: "left-0" },
  { label: "Facebook", href: "#", left: "left-[48px]" },
  { label: "WhatsApp", href: "#", left: "left-[90.209px]" },
];

export default function Footer() {
  return (
    <footer className="flex h-[110px] w-full items-center justify-center border-t border-white/20 bg-[#0f0f0f]">
      <div className="flex items-center gap-[311px]">
        <Link href="/" aria-label="Nebulab">
          <Image src="/svg/nebulab-logo.svg" alt="Nebulab" width={229} height={53} />
        </Link>

        <p className="whitespace-nowrap text-center font-sans text-[17px] leading-[27px] text-[#c9c9c9]">
          Copyright © Nebulab 2026. All rights reserved.
        </p>

        <div className="relative h-[24px] w-[114.209px] shrink-0">
          <Image src="/svg/socials.svg" alt="" width={114} height={24} className="size-full max-w-none" />
          {socials.map(({ label, href, left }) => (
            <a key={label} href={href} aria-label={label} className={`absolute top-0 size-[24px] ${left}`} />
          ))}
        </div>
      </div>
    </footer>
  );
}
