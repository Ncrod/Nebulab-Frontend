"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ArrowIcon from "./ArrowIcon";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About us", href: "/about" },
];

const fadeText =
  "bg-gradient-to-b from-white to-white/0 to-[115.97%] bg-clip-text text-transparent";

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

const line =
  "absolute left-1/2 h-[4px] w-[36px] max-tablet:h-[3px] max-tablet:w-[28px] -translate-x-1/2 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close with Escape, and whenever the desktop layout takes over.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1140px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    // Below notebook the header keeps the bar's height in the layout, and one
    // container (bar + dropdown) sits on top of it and grows when opened.
    <header className="relative z-30 w-full max-notebook:h-[110px] max-tablet:h-[70px]">
      <div className="max-notebook:absolute max-notebook:inset-x-0 max-notebook:top-0 max-notebook:border-b max-notebook:border-[#3f3f3f] max-notebook:bg-[#0f0f0f]">
      <div className="flex w-full justify-center px-5 py-[28px] max-tablet:py-[16px] tablet:px-[10%]">
        <nav className="flex w-full max-w-[1654px] items-center justify-between">
          <Link href="/" aria-label="Nebulab" onClick={() => setOpen(false)}>
            <Image
              src="/svg/nebulab-logo.svg"
              alt="Nebulab"
              width={229}
              height={53}
              priority
              className="max-tablet:h-auto max-tablet:w-[160px]"
            />
          </Link>

          <ul className="hidden items-center gap-[50px] font-display text-[20px] font-medium notebook:flex">
            {links.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={fadeText}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-[19px] notebook:flex">
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

          {/* Hamburger: two lines that turn into an X */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative h-[41px] w-[49px] max-tablet:h-[30px] max-tablet:w-[38px] shrink-0 cursor-pointer notebook:hidden"
          >
            <span
              className={`${line} top-[12px] max-tablet:top-[9px] ${open ? "translate-y-[6.5px] rotate-45 max-tablet:translate-y-[5px]" : ""}`}
            />
            <span
              className={`${line} top-[25px] max-tablet:top-[19px] ${open ? "-translate-y-[6.5px] -rotate-45 max-tablet:-translate-y-[5px]" : ""}`}
            />
          </button>
        </nav>
      </div>

      {/* Dropdown (tablet and mobile) */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`grid notebook:hidden ${
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        }`}
        style={{
          // Height eases out over 500ms; visibility only flips once a close has finished.
          transition: open
            ? `grid-template-rows 500ms ${ease}, visibility 0s`
            : `grid-template-rows 500ms ${ease}, visibility 0s linear 500ms`,
        }}
      >
        <div className="overflow-hidden">
          <div
            className={`flex flex-col items-center gap-[40px] px-5 py-[40px] text-center transition-[opacity,transform] duration-500 tablet:px-[10%] ${
              open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <ul className="flex flex-col items-center gap-[28px] font-display text-[24px] font-medium max-tablet:text-[20px]">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className={fadeText}
                    tabIndex={open ? undefined : -1}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-[19px]">
              <Link
                href="/sign-in"
                className={`font-display text-[24px] font-normal max-tablet:text-[20px] ${fadeText}`}
                tabIndex={open ? undefined : -1}
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center rounded-[200px] bg-white px-[31px] py-[15.5px] font-display text-[24px] font-medium max-tablet:text-[20px] leading-[24.32px] tracking-[0.304px] text-background"
                tabIndex={open ? undefined : -1}
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
