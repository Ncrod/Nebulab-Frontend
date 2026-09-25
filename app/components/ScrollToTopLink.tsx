"use client";

import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/** Logo link: when already on `href` (the signed-out or signed-in home) it scrolls smoothly to the very top, navbar included; elsewhere it navigates there. */
export default function ScrollToTopLink({ onClick, href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const lenis = useLenis();

  return (
    <Link
      {...props}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || pathname !== href) return;
        e.preventDefault();
        // Lenis is off for reduced motion, so fall back to an instant jump.
        if (!lenis) {
          window.scrollTo(0, 0);
          return;
        }
        // Longer trips take a bit longer, capped so the footer-to-top scroll never drags.
        lenis.scrollTo(0, { duration: Math.min(1.8, Math.max(0.6, window.scrollY / 4000)) });
      }}
    />
  );
}
