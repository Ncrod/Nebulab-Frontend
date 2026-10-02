"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useSession } from "../lib/api";
import { signOutCustomer } from "../lib/auth";

const fade = "bg-[linear-gradient(to_bottom,#fff_6.335%,#050505_99.97%)] bg-clip-text text-transparent";

/**
 * Account page, section 2 (Figma 166:1435): the greeting with the user's name, the sign-out button and the glowing
 * horizon at the bottom.
 */
/** Long names shrink (and tighten their line height) so they don't blow past the width of the greeting. */
function nameSizeCls(name: string) {
  if (name.length > 24) return "text-[76px] leading-[1.05] max-notebook:text-[52px] max-tablet:text-[34px]";
  if (name.length > 16) return "text-[100px] leading-[1.1] max-notebook:text-[68px] max-tablet:text-[42px]";
  return "text-[128px] leading-normal max-notebook:text-[84px] max-tablet:text-[52px]";
}

export default function AccountGreeting() {
  const name = useSession("customer")?.user.name ?? "";

  // Ends the session and reloads the public home: nothing of the account stays in memory.
  function signOut(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    void signOutCustomer();
    window.location.replace("/");
  }

  return (
    <section className="relative flex min-h-[997px] flex-col items-center gap-[28px] px-section pt-[116px] max-notebook:min-h-[720px] max-notebook:pt-[80px] max-tablet:min-h-[600px] max-tablet:pt-[64px]">
      {/* Soft light in the top-left corner, same glow as the hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-207px] top-[-305px] hidden h-[465.722px] w-[540.862px] items-center justify-center notebook:flex">
        <div className="flex-none rotate-[-38.34deg]">
          <div className="h-[129.198px] w-[587.399px] rounded-full bg-white blur-[211.45px]" />
        </div>
      </div>
      {/* The horizon: its box starts 525px above the bottom edge of the section, whatever its height (measured from the photo:
          the top of the white core sits ~36px above the edge). The mask
          fades the top of the box. The section does not clip it: the part below the edge goes under the footer (z-10) and
          the page's main clips the rest. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[calc(100%-525px)] h-[1039.221px] w-[1994.666px] -translate-x-1/2"
        style={{
          maskImage: "url(/svg/account/horizon-mask.svg)",
          WebkitMaskImage: "url(/svg/account/horizon-mask.svg)",
          maskSize: "1965.451px 1024px",
          WebkitMaskSize: "1965.451px 1024px",
          maskPosition: "14.861px 7.611px",
          WebkitMaskPosition: "14.861px 7.611px",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 overflow-hidden mix-blend-lighten">
          <Image
            src="/images/account/horizon.png"
            alt=""
            width={3168}
            height={1344}
            sizes="2000px"
            quality={90}
            priority
            className="absolute left-0 top-[18.59%] h-[81.43%] w-full max-w-none"
          />
        </div>
      </div>

      <h1 className="relative flex w-full max-w-[1446px] flex-col items-center gap-[2px] text-center font-display font-medium leading-normal [word-break:break-word]">
        <span className={`${fade} block w-full text-[90px] max-notebook:text-[60px] max-tablet:text-[40px]`}>Hello</span>
        <span className={`${fade} block w-full ${nameSizeCls(name)}`}>{name}</span>
      </h1>

      <Link
        href="/"
        onClick={signOut}
        className="relative flex h-[60px] w-[308px] max-w-full items-center justify-center rounded-[200px] bg-white px-[31px] py-[8px] font-display text-[20px] font-medium leading-[24.32px] tracking-[0.304px] text-[#050505] transition-opacity duration-200 hover:opacity-80"
      >
        Sign Out
      </Link>
    </section>
  );
}
