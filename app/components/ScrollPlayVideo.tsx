"use client";

import { useEffect, useRef } from "react";

/**
 * Video that plays once, the first time it is scrolled into view, and then rests on its last frame
 * (or keeps looping with `loop`). It starts again on every page load. The poster shows until it starts; with reduced motion it never plays.
 */
export default function ScrollPlayVideo({
  src,
  poster,
  label,
  className,
  threshold = 0.5,
  loop = false,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
  /** Share of the video that must be visible before it plays. */
  threshold?: number;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // Muted + inline, so autoplay is allowed; a rejection just leaves the poster in place.
        video.play().catch(() => {});
      },
      { threshold },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <video
      ref={videoRef}
      src={encodeURI(src)}
      poster={poster}
      loop={loop}
      muted
      playsInline
      preload="auto"
      aria-label={label}
      className={className}
    />
  );
}
