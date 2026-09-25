"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { dismissToast, useToast } from "../lib/toast";

const VISIBLE_SECONDS = 3;

/**
 * The site's notification, mounted once in the root layout. Bottom-left from the notebook breakpoint up; on tablet and
 * mobile it sits bottom-centre: within reach of the thumb and away from the fixed menu at the top.
 */
export default function Toaster() {
  const toast = useToast();
  const toastId = toast?.id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (toastId === undefined || !el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Enters rising a little, waits, then leaves and clears itself. A new notification re-runs all of this.
    gsap.fromTo(el, { autoAlpha: 0, y: reduced ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.45, ease: "power3.out" });
    const timer = gsap.delayedCall(VISIBLE_SECONDS, () => {
      gsap.to(el, { autoAlpha: 0, y: reduced ? 0 : 12, duration: reduced ? 0 : 0.3, ease: "power2.in", onComplete: dismissToast });
    });

    return () => {
      timer.kill();
      gsap.killTweensOf(el);
    };
  }, [toastId]);

  return (
    // The live region stays mounted, so screen readers announce the text when it appears inside it.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[20px] z-[60] flex justify-center px-[20px] notebook:inset-x-auto notebook:bottom-[30px] notebook:left-[30px] notebook:justify-start notebook:px-0"
    >
      {toast && (
        <div
          ref={ref}
          key={toast.id}
          // Starts hidden: GSAP reveals it, so there is no flash before the animation begins.
          style={{ visibility: "hidden", opacity: 0 }}
          className="pointer-events-auto flex items-center gap-[12px] rounded-[16px] bg-white px-[20px] py-[14px] font-display text-[18px] font-medium leading-normal text-[#050505] shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-tablet:text-[16px]"
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="11" fill="#050505" />
            <path d="M6.5 11.4l3 3 6-6.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  );
}
