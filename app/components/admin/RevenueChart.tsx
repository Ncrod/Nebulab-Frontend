"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { DayPoint } from "../../lib/cms/metrics";
import { formatCompactMoney, formatDayKey, formatMoney } from "./format";

const HEIGHT = 280;
const PAD = { left: 56, right: 18, top: 16, bottom: 30 };
const SURFACE = "#0f0f0f";

/** A round step (1, 2, 2.5, 5 × 10ⁿ) so the axis reads 0 / 1,000 / 2,000 instead of odd numbers. */
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * pow;
}

/**
 * Daily revenue as one line with a soft area. Hover (or the arrow keys) snaps a crosshair to a day and shows its
 * revenue and orders; "View as table" gives the same numbers without hovering. Single series: the card title names it.
 */
export default function RevenueChart({ series }: { series: DayPoint[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [asTable]);

  const n = series.length;
  const max = Math.max(...series.map((p) => p.revenue), 0);
  const step = niceStep(max / 4);
  const top = Math.max(step * 4, step);
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (value: number) => PAD.top + innerH - (value / top) * innerH;

  const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.revenue).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, 1, 2, 3, 4].map((k) => k * step);
  const labelCount = Math.min(n, width < 520 ? 4 : 6);
  const labelIdx = Array.from({ length: labelCount }, (_, k) => Math.round((k / (labelCount - 1)) * (n - 1)));

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
    else if (event.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
    else if (event.key === "Escape") setHover(null);
    else return;
    event.preventDefault();
  }

  const total = series.reduce((sum, p) => sum + p.revenue, 0);
  const point = hover !== null ? series[hover] : null;
  const tipLeft = point ? Math.min(Math.max(x(hover!), 90), width - 90) : 0;

  return (
    <div>
      <div className="mb-[8px] flex justify-end">
        <button type="button" onClick={() => setAsTable((v) => !v)} className="cursor-pointer font-sans text-[13px] text-[#98a2b3] underline underline-offset-4 transition-colors hover:text-white">
          {asTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-[280px] overflow-y-auto rounded-[12px] border border-white/[0.06]">
          <table className="w-full border-collapse text-left font-sans text-[14px] tabular-nums">
            <caption className="sr-only">Revenue and orders per day</caption>
            <thead className="sticky top-0 bg-[#131313] text-[#98a2b3]">
              <tr>
                <th scope="col" className="px-[14px] py-[10px] font-normal">
                  Day
                </th>
                <th scope="col" className="px-[14px] py-[10px] text-right font-normal">
                  Revenue
                </th>
                <th scope="col" className="px-[14px] py-[10px] text-right font-normal">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.date} className="border-t border-white/[0.06] text-white/85">
                  <td className="px-[14px] py-[8px]">{formatDayKey(p.date)}</td>
                  <td className="px-[14px] py-[8px] text-right">{formatMoney(p.revenue)}</td>
                  <td className="px-[14px] py-[8px] text-right">{p.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative w-full select-none">
          {width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={`Revenue per day, ${formatDayKey(series[0].date)} to ${formatDayKey(series[n - 1].date)}: ${formatMoney(total)} in total. Use the arrow keys to read each day.`}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onFocus={() => setHover((h) => h ?? n - 1)}
              onBlur={() => setHover(null)}
              className="block rounded-[8px] outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"} strokeWidth={1} />
                  <text x={PAD.left - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" fill="#898781" fontSize={12} className="tabular-nums">
                    {formatCompactMoney(t)}
                  </text>
                </g>
              ))}
              {labelIdx.map((i, k) => (
                <text key={i} x={x(i)} y={HEIGHT - 8} textAnchor={k === 0 ? "start" : k === labelIdx.length - 1 ? "end" : "middle"} fill="#898781" fontSize={12}>
                  {formatDayKey(series[i].date)}
                </text>
              ))}

              <path d={area} fill="rgba(255,255,255,0.1)" />
              <path d={line} fill="none" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

              {point ? (
                <g pointerEvents="none">
                  <line x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={y(0)} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                  <circle cx={x(hover!)} cy={y(point.revenue)} r={5} fill="#ffffff" stroke={SURFACE} strokeWidth={2} />
                </g>
              ) : (
                <circle cx={x(n - 1)} cy={y(series[n - 1].revenue)} r={5} fill="#ffffff" stroke={SURFACE} strokeWidth={2} pointerEvents="none" />
              )}

              {/* The whole plot is the hit target: the pointer only has to be near a day, never on the line. */}
              <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent" onPointerMove={onPointerMove} onPointerLeave={() => setHover(null)} />
            </svg>
          )}

          {point && (
            <div
              role="status"
              style={{ left: tipLeft, top: 8 }}
              className="pointer-events-none absolute z-10 w-[168px] -translate-x-1/2 rounded-[12px] border border-white/[0.1] bg-[#1a1a1a] px-[12px] py-[10px] font-sans shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              <p className="m-0 text-[12px] text-[#98a2b3]">{formatDayKey(point.date)}</p>
              <p className="m-0 mt-[2px] flex items-center gap-[8px] text-[18px] font-medium text-white">
                <span aria-hidden="true" className="h-[2px] w-[12px] rounded-full bg-white" />
                {formatMoney(point.revenue)}
              </p>
              <p className="m-0 mt-[2px] text-[13px] text-[#c3c2b7]">
                {point.orders} order{point.orders === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
