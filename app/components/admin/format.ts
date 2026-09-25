// Small formatters shared by the CMS screens.

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const moneyRound = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** $1,234.50 */
export const formatMoney = (amount: number) => money.format(amount);
/** $1,235 */
export const formatMoneyRound = (amount: number) => moneyRound.format(amount);
/** $12.4K, for tight spaces such as chart ticks. */
export const formatCompactMoney = (amount: number) => `$${compact.format(amount)}`;
export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
/** "Sep 25" from a "2026-09-25" day key. */
export const formatDayKey = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/** "+12%" / "-4%" */
export const formatPct = (pct: number) => `${pct >= 0 ? "+" : "−"}${Math.abs(Math.round(pct * 100))}%`;

/** "Storage: 256GB · Color: Silver" */
export const formatOptions = (options: { name: string; value: string }[]) => options.map((o) => `${o.name}: ${o.value}`).join(" · ");
