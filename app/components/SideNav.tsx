"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSignedInPath, pageOf } from "../lib/session-routes";

// One side nav for the whole site (mounted in the root layout, so it survives page changes and the
// black ball can travel between icons). Session and active page are read from the URL: everything
// under /home is the signed-in variant. Cart and account need a session, so signed out they lead to
// the login.
const items = (loggedIn: boolean) => [
  { label: "Home", href: loggedIn ? "/home" : "/", match: "/", glyph: "/svg/sidenav/home.svg" },
  { label: "Products", href: loggedIn ? "/home/products" : "/products", match: "/products", glyph: "/svg/sidenav/box.svg" },
  { label: "Cart", href: loggedIn ? "/bag" : "/login", match: "/bag", glyph: "/svg/sidenav/bag.svg" },
  { label: "Account", href: loggedIn ? "/account" : "/login", match: "/account", glyph: "/svg/sidenav/user.svg" },
];

const ITEM = 46.667;
const GAP = 46.667;
const PAD_X = 11.667;
const PAD_Y = 34.222;
const STEP = ITEM + GAP;

const DARK = "#050505";
const LIGHT = "#ffffff";

/** Index of the item whose page we are on, or -1 (login, or a page without an item). */
function activeIndexFor(pathname: string) {
  const loggedIn = isSignedInPath(pathname);
  // "/home/products" and "/products" both mean the products page.
  const page = pageOf(pathname);
  return items(loggedIn).findIndex(({ match }) => (match === "/" ? page === "/" : page === match || page.startsWith(`${match}/`)));
}

export default function SideNav() {
  const pathname = usePathname();
  const onLogin = pathname.startsWith("/login");
  const loggedIn = isSignedInPath(pathname);
  const activeIndex = activeIndexFor(pathname);

  // Where the ball and the light glyph are on the very first render. It never changes, so React does not
  // rewrite those styles later: from the first paint on, GSAP owns them.
  const [initial] = useState(activeIndex);
  const base = Math.max(initial, 0);

  const ballRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = useRef(initial); // index the ball is currently at (or heading to)

  const moveTo = useCallback(
    (next: number) => {
      const ball = ballRef.current;
      const glyphs = glyphRefs.current;
      const prev = shown.current;
      if (!ball || next === prev) return;
      shown.current = next;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduced ? 0 : 0.6;

      const all = glyphs.filter((g): g is HTMLSpanElement => g !== null);
      gsap.killTweensOf([ball, ...all]);
      gsap.set(ball, { scaleY: 1 });
      // Glyphs that are neither leaving nor arriving are dark, even if a fast click interrupted a tween.
      glyphs.forEach((glyph, i) => {
        if (glyph && i !== prev && i !== next) gsap.set(glyph, { backgroundColor: DARK });
      });

      if (next < 0) {
        // A page with no item of its own: the ball fades out.
        gsap.to(ball, { autoAlpha: 0, duration: dur / 2 });
        if (prev >= 0 && glyphs[prev]) gsap.to(glyphs[prev], { backgroundColor: DARK, duration: dur / 2 });
        return;
      }

      const y = (next - base) * STEP;
      if (prev < 0) {
        // Nothing was selected: the ball appears in place instead of travelling from nowhere.
        gsap.set(ball, { y });
        gsap.to(ball, { autoAlpha: 1, duration: dur / 2 });
        if (glyphs[next]) gsap.to(glyphs[next], { backgroundColor: LIGHT, duration: dur / 2 });
        return;
      }

      // The ball rolls to the new icon, stretching a little as it goes; the old glyph goes dark as it
      // leaves and the new one lights up as the ball reaches it.
      const tl = gsap.timeline();
      tl.to(ball, { y, duration: dur, ease: "power3.inOut" }, 0);
      tl.to(ball, { scaleY: 1.3, duration: dur / 2, ease: "power1.out", yoyo: true, repeat: 1 }, 0);
      if (glyphs[prev]) tl.to(glyphs[prev], { backgroundColor: DARK, duration: dur * 0.4, ease: "power1.out" }, dur * 0.1);
      if (glyphs[next]) tl.to(glyphs[next], { backgroundColor: LIGHT, duration: dur * 0.4, ease: "power1.in" }, dur * 0.5);
    },
    [base],
  );

  // Follows the URL: back/forward, links elsewhere on the site, and the first arrival from the login.
  useEffect(() => {
    moveTo(activeIndex);
  }, [activeIndex, moveTo]);

  return (
    <nav
      aria-label="Quick navigation"
      // Kept mounted on the login so the ball's position survives; there it is just not displayed.
      className={`fixed left-[15px] top-[268px] z-30 flex-col items-center gap-[46.667px] overflow-clip rounded-[63.778px] bg-white px-[11.667px] py-[34.222px] ${
        onLogin ? "hidden" : "hidden notebook:flex"
      }`}
    >
      {/* The black ball, behind the icons. */}
      <span
        ref={ballRef}
        aria-hidden="true"
        className="absolute rounded-full bg-[#050505]"
        style={{
          left: PAD_X,
          top: PAD_Y + base * STEP,
          width: ITEM,
          height: ITEM,
          ...(initial < 0 ? { opacity: 0, visibility: "hidden" } : null),
        }}
      />

      {items(loggedIn).map(({ label, href, glyph }, i) => (
        <Link
          key={label}
          href={href}
          aria-label={label}
          aria-current={i === activeIndex ? "page" : undefined}
          // Going to the login has no item to move to, so the ball stays put until the URL says otherwise.
          onClick={() => {
            if (!href.startsWith("/login")) moveTo(i);
          }}
          className="relative size-[46.667px] shrink-0"
        >
          {/* The icon is a mask, so its colour (dark, or white on the ball) is a plain background GSAP can tween. */}
          <span
            ref={(el) => {
              glyphRefs.current[i] = el;
            }}
            aria-hidden="true"
            className={`absolute inset-0 ${i === initial ? "bg-white" : "bg-[#050505]"}`}
            style={{
              maskImage: `url(${glyph})`,
              WebkitMaskImage: `url(${glyph})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </Link>
      ))}
    </nav>
  );
}
