"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, PlusIcon, SearchIcon } from "./AdminIcons";

// Building blocks of the CMS screens. The look follows the store's brand: near-black surfaces, hairline borders,
// SF Pro headings, white pill buttons.

// ── Tokens ────────────────────────────────────────────────────────────────────

export const cardCls = "rounded-[16px] border border-white/[0.06] bg-[#0f0f0f]";
export const inputCls =
  "h-[44px] w-full rounded-[12px] border border-white/[0.12] bg-[#0f0f0f] px-[14px] font-sans text-[15px] text-white outline-none placeholder:text-[#98a2b3]/50 focus:border-white/30 disabled:opacity-50";
export const textareaCls = `${inputCls} h-auto min-h-[96px] resize-y py-[12px] leading-normal`;
const btn =
  "inline-flex h-[44px] shrink-0 cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap rounded-full px-[22px] font-display text-[16px] font-medium transition-[opacity,background-color,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-40";
export const btnPrimary = `${btn} bg-white text-[#050505] enabled:hover:opacity-85`;
export const btnGhost = `${btn} border border-white/[0.16] text-white enabled:hover:border-white/40`;
export const btnDanger = `${btn} border border-[#d03b3b]/50 bg-[#d03b3b]/15 text-[#ff8a80] enabled:hover:bg-[#d03b3b]/25`;
export const iconBtn =
  "grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[10px] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white";

// ── Badge ─────────────────────────────────────────────────────────────────────

export type Tone = "neutral" | "blue" | "green" | "amber" | "orange" | "red";

const TONES: Record<Tone, { box: string; dot: string }> = {
  neutral: { box: "bg-white/[0.08] text-white", dot: "bg-white" },
  blue: { box: "bg-[#3987e5]/15 text-[#7db4f2]", dot: "bg-[#3987e5]" },
  green: { box: "bg-[#0ca30c]/15 text-[#56d456]", dot: "bg-[#0ca30c]" },
  amber: { box: "bg-[#fab219]/15 text-[#fbc85b]", dot: "bg-[#fab219]" },
  orange: { box: "bg-[#ec835a]/15 text-[#f2a184]", dot: "bg-[#ec835a]" },
  red: { box: "bg-[#d03b3b]/20 text-[#ff8a80]", dot: "bg-[#d03b3b]" },
};

/** Status pill: a colour dot plus the label, so the state never depends on colour alone. */
export function Badge({ tone = "neutral", children, chevron = false }: { tone?: Tone; children: ReactNode; chevron?: boolean }) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-[8px] px-[10px] py-[4px] font-sans text-[13px] font-medium leading-none ${t.box}`}>
      <span aria-hidden="true" className={`size-[6px] rounded-full ${t.dot}`} />
      {children}
      {chevron && <ChevronDownIcon width={12} height={12} className="-mr-[2px] opacity-70" />}
    </span>
  );
}

// ── Dropdown (a menu that is not clipped by scrolling tables) ─────────────────

export interface MenuItem {
  label: string;
  onSelect: () => void;
  selected?: boolean;
  danger?: boolean;
  icon?: ReactNode;
}

const MENU_WIDTH = 210;

/** A button that opens a menu. The menu is `fixed`, so a table's scroll box cannot cut it. */
export function Dropdown({
  children,
  items,
  label,
  className = "",
  align = "left",
}: {
  children: ReactNode;
  items: MenuItem[];
  label: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const open = pos !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  function toggle() {
    if (open) return setPos(null);
    const rect = button.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(align === "right" ? rect.right - MENU_WIDTH : rect.left, window.innerWidth - MENU_WIDTH - 8));
    const height = items.length * 40 + 12;
    setPos(rect.bottom + 6 + height > window.innerHeight ? { bottom: window.innerHeight - rect.top + 6, left } : { top: rect.bottom + 6, left });
  }

  return (
    <>
      <button ref={button} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={toggle} className={`cursor-pointer ${className}`}>
        {children}
      </button>
      {open && (
        <div
          ref={menu}
          role="menu"
          style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: MENU_WIDTH }}
          className="z-[70] flex flex-col gap-[2px] rounded-[14px] border border-white/[0.1] bg-[#161617] p-[6px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] starting:translate-y-[-4px] starting:opacity-0 transition duration-150"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setPos(null);
                item.onSelect();
              }}
              className={`flex h-[38px] w-full cursor-pointer items-center gap-[10px] rounded-[9px] px-[10px] text-left font-sans text-[14px] transition-colors hover:bg-white/[0.06] ${
                item.danger ? "text-[#ff8a80]" : "text-white"
              }`}
            >
              {item.icon}
              <span className="flex-1 truncate">{item.label}</span>
              {item.selected && <span aria-hidden="true" className="size-[6px] rounded-full bg-white" />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ── Drawer & confirm dialog ───────────────────────────────────────────────────

/** Slide-over panel from the right, for creating/editing/reading a row without leaving the list. */
export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-black/60 transition-opacity duration-200 starting:opacity-0" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className="relative flex h-full w-full flex-col border-l border-white/[0.08] bg-[#0d0d0d] outline-none transition duration-300 ease-out starting:translate-x-[40px] starting:opacity-0"
      >
        <header className="flex items-start justify-between gap-[16px] border-b border-white/[0.06] px-[24px] py-[20px]">
          <div className="min-w-0">
            <h2 id={titleId} className="m-0 truncate font-display text-[22px] font-medium leading-tight text-white">
              {title}
            </h2>
            {subtitle && <p className="m-0 mt-[4px] truncate font-sans text-[14px] text-[#98a2b3]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className={iconBtn}>
            <CloseIcon />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[24px]">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-[12px] border-t border-white/[0.06] px-[24px] py-[16px]">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] grid place-items-center px-[20px]">
      <div onClick={onCancel} aria-hidden="true" className="absolute inset-0 bg-black/70 transition-opacity duration-150 starting:opacity-0" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardCls} relative w-full max-w-[420px] bg-[#131313] p-[24px] transition duration-200 starting:scale-95 starting:opacity-0`}
      >
        <h2 id={titleId} className="m-0 font-display text-[20px] font-medium text-white">
          {title}
        </h2>
        <p className="m-0 mt-[8px] font-sans text-[15px] leading-normal text-[#98a2b3]">{message}</p>
        <div className="mt-[24px] flex justify-end gap-[12px]">
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancel
          </button>
          <button type="button" autoFocus onClick={onConfirm} className={danger ? btnDanger : btnPrimary}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form controls ─────────────────────────────────────────────────────────────

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor?: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[8px]">
      <label htmlFor={htmlFor} className="font-display text-[15px] font-medium text-white">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="m-0 font-sans text-[13px] text-[#ff8a80]">
          {error}
        </p>
      ) : (
        hint && <p className="m-0 font-sans text-[13px] text-[#98a2b3]">{hint}</p>
      )}
    </div>
  );
}

export function Select<T extends string>({ id, value, onChange, options }: { id?: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={`${inputCls} cursor-pointer appearance-none pr-[38px]`}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#161617]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon width={16} height={16} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#98a2b3]" />
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${checked ? "bg-white" : "bg-white/[0.16]"}`}
    >
      <span className={`absolute left-[3px] top-[3px] size-[20px] rounded-full transition-transform duration-200 ${checked ? "translate-x-[20px] bg-[#050505]" : "bg-white"}`} />
    </button>
  );
}

/** A row of options where exactly one is on (date ranges, status tabs). */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-[4px] rounded-[12px] border border-white/[0.06] bg-[#0f0f0f] p-[4px]">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={`flex h-[34px] cursor-pointer items-center gap-[8px] rounded-[9px] px-[14px] font-sans text-[14px] font-medium transition-colors ${
              on ? "bg-white text-[#050505]" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className={`text-[12px] ${on ? "text-black/50" : "text-white/40"}`}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Toolbar & page frame ──────────────────────────────────────────────────────

/** Title row of a screen: heading and description on the left, the main action on the right. */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-[16px]">
      <div className="min-w-0">
        <h1 className="m-0 font-display text-[32px] font-medium leading-tight text-white max-tablet:text-[26px]">{title}</h1>
        {description && <p className="m-0 mt-[6px] font-sans text-[16px] text-[#98a2b3]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full max-w-[340px] max-tablet:max-w-none">
      <SearchIcon width={18} height={18} className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#98a2b3]" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputCls} pl-[42px]`} />
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={btnPrimary}>
      <PlusIcon width={18} height={18} />
      {label}
    </button>
  );
}

// ── Data table ────────────────────────────────────────────────────────────────

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable by this value. */
  sort?: (row: T) => string | number;
  className?: string;
  /** Minimum width in px (the table scrolls sideways when the screen is narrower). */
  minWidth?: number;
  align?: "right";
}

/**
 * Sortable, paged table with optional row selection. Same look as the Figma CMS: header in muted text, hairline rows,
 * a thin divider between columns. `resetKey` sends it back to page 1 when the caller's filters change.
 */
export function DataTable<T>({
  rows,
  columns,
  getId,
  selectable = false,
  selected = [],
  onSelectedChange,
  onRowClick,
  pageSize = 10,
  defaultSort,
  resetKey,
  emptyTitle,
  emptyText,
  caption,
}: {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string | number;
  selectable?: boolean;
  selected?: (string | number)[];
  onSelectedChange?: (ids: (string | number)[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  defaultSort?: { id: string; dir: "asc" | "desc" };
  resetKey?: string;
  emptyTitle: string;
  emptyText: string;
  caption: string;
}) {
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setPage(1);
  }

  const column = sort ? columns.find((c) => c.id === sort.id) : undefined;
  const sorted = (() => {
    if (!column?.sort || !sort) return rows;
    const value = column.sort;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * factor;
    });
  })();

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);
  const visibleIds = visible.map(getId);
  const allOnPage = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  function toggleSort(id: string) {
    setSort((s) => (s?.id === id ? (s.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" }));
  }
  function toggleRow(id: string | number) {
    onSelectedChange?.(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }
  function togglePage() {
    onSelectedChange?.(allOnPage ? selected.filter((id) => !visibleIds.includes(id)) : [...new Set([...selected, ...visibleIds])]);
  }

  const cellBase = "border-r border-white/[0.06] px-[14px] last:border-r-0";

  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans text-[15px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="h-[52px] border-b border-white/[0.06] text-[14px] text-[#98a2b3]">
              {selectable && (
                <th scope="col" className="w-[56px] border-r border-white/[0.06] px-[14px]">
                  <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={togglePage} className="size-[16px] cursor-pointer accent-white" />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.id === c.id;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    style={{ minWidth: c.minWidth }}
                    className={`${cellBase} whitespace-nowrap font-normal ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.sort ? (
                      <button type="button" onClick={() => toggleSort(c.id)} className={`inline-flex cursor-pointer items-center gap-[6px] transition-colors hover:text-white ${active ? "text-white" : ""}`}>
                        {c.header}
                        {active && (sort.dir === "asc" ? <ArrowUpIcon width={13} height={13} /> : <ArrowDownIcon width={13} height={13} />)}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const id = getId(row);
              const isSelected = selected.includes(id);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`h-[60px] border-b border-white/[0.06] text-white/85 transition-colors last:border-b-0 ${isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.025]"} ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {selectable && (
                    <td className="border-r border-white/[0.06] px-[14px]" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label="Select row" checked={isSelected} onChange={() => toggleRow(id)} className="size-[16px] cursor-pointer accent-white" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.id} className={`${cellBase} ${c.className ?? ""} ${c.align === "right" ? "text-right" : ""}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <div role="status" className="flex flex-col items-center gap-[6px] px-[20px] py-[64px] text-center">
          <p className="m-0 font-display text-[20px] font-medium text-white">{emptyTitle}</p>
          <p className="m-0 font-sans text-[15px] text-[#98a2b3]">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-[12px] border-t border-white/[0.06] px-[16px] py-[12px] font-sans text-[14px] text-[#98a2b3]">
          <span>
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-[8px]">
            <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} className={`${iconBtn} border border-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30`}>
              <ChevronLeftIcon width={16} height={16} />
            </button>
            <span className="min-w-[72px] text-center text-white/70">
              {current} / {pageCount}
            </span>
            <button type="button" aria-label="Next page" disabled={current >= pageCount} onClick={() => setPage(current + 1)} className={`${iconBtn} border border-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30`}>
              <ChevronRightIcon width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Bar shown over a list when rows are selected. */
export function BulkBar({ count, children, onClear }: { count: number; children: ReactNode; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-[12px] rounded-[14px] border border-white/[0.1] bg-[#161617] px-[16px] py-[10px] font-sans text-[14px] text-white">
      <span className="mr-auto">{count} selected</span>
      {children}
      <button type="button" onClick={onClear} className="cursor-pointer text-[#98a2b3] underline underline-offset-4 hover:text-white">
        Clear
      </button>
    </div>
  );
}
