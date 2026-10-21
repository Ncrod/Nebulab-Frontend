"use client";

import type { Globe } from "cobe";
import { useEffect, useRef } from "react";

const MARKERS: { location: [number, number]; phase: number }[] = [
  { location: [37.7749, -122.4194], phase: 0 },
  { location: [40.7128, -74.006], phase: 1.1 },
  { location: [19.4326, -99.1332], phase: 2.2 },
  { location: [-23.5505, -46.6333], phase: 3.3 },
  { location: [51.5074, -0.1278], phase: 4.4 },
  { location: [35.6762, 139.6503], phase: 5.5 },
  { location: [-33.8688, 151.2093], phase: 0.7 },
  { location: [28.6139, 77.209], phase: 1.8 },
];

// The canvas is drawn this much larger than the host and centered on it, so the globe grows without changing the layout.
const OVERSCAN = 1.25;

/**
 * Black and white dotted globe with pulsing markers. Drag to rotate. The parent sets the (square) size.
 *
 * Kept cheap on purpose: the cobe library is only downloaded and the WebGL context only created once the globe is
 * about to be seen; the render loop stops completely while it is off screen or the tab is hidden; and on phones
 * (small or touch screens) it draws fewer pixels, fewer dots and 30 frames per second instead of 60.
 */
export default function GlobePulse({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2);
    const frameMs = light ? 1000 / 30 : 0;
    const px = () => Math.max(1, Math.round(host.offsetWidth * OVERSCAN * dpr));

    let globe: Globe | null = null;
    let cancelled = false;
    let running = false;
    let onScreen = false;
    let raf = 0;
    let lastFrame = 0;
    let phi = 1.2;
    let theta = 0.25;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const pulse = (t: number) =>
      MARKERS.map(({ location, phase }) => ({
        location,
        size: 0.018 + 0.022 * (0.5 + 0.5 * Math.sin(t * 2.2 + phase)),
      }));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!globe || now - lastFrame < frameMs) return;
      lastFrame = now;
      if (!dragging) phi += light ? 0.006 : 0.003;
      globe.update({ phi, theta, markers: pulse(now / 1000) });
    };
    const sync = () => {
      const shouldRun = !!globe && onScreen && !document.hidden && !reduced;
      if (shouldRun && !running) raf = requestAnimationFrame(frame);
      if (!shouldRun && running) cancelAnimationFrame(raf);
      running = shouldRun;
    };

    const init = async () => {
      const { default: createGlobe } = await import("cobe");
      if (cancelled) return;
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: px(),
        height: px(),
        phi,
        theta,
        dark: 1,
        diffuse: 1.2,
        mapSamples: light ? 9000 : 16000,
        mapBrightness: 6,
        baseColor: [1, 1, 1],
        markerColor: [1, 1, 1],
        glowColor: [0.12, 0.12, 0.12],
        markerElevation: 0,
        markers: pulse(0),
      });
      sync();
    };

    // Nothing is loaded or created until the globe is within 200px of the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !globe && !cancelled) void init();
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(host);
    document.addEventListener("visibilitychange", sync);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      phi += (e.clientX - lastX) / 120;
      theta = Math.max(-1, Math.min(1, theta + (e.clientY - lastY) / 120));
      lastX = e.clientX;
      lastY = e.clientY;
      if (!running) globe?.update({ phi, theta });
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(() => globe?.update({ width: px(), height: px() }));
    ro.observe(host);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe?.destroy();
    };
  }, []);

  return (
    <div ref={hostRef} className={`relative size-full ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 cursor-grab"
        style={{ width: `${OVERSCAN * 100}%`, height: `${OVERSCAN * 100}%`, touchAction: "pan-y" }}
      />
    </div>
  );
}
