import { LOW_STOCK, type CatalogProduct, type Category } from "../../data/catalog";
import { isRevenue, ORDER_STATUSES, type Customer, type Order, type OrderStatus } from "./types";

// Everything the dashboard shows is computed here from the raw collections, so the backend can later serve the same
// numbers with aggregate queries (one per block below) without the components changing.

export type RangeDays = 7 | 30 | 90;

const DAY = 86_400_000;

/** Local calendar day of a timestamp: "2026-09-25". */
export function dayKey(time: number | string | Date) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Orders placed in the last `days` days (a rolling window ending now). */
export function placedWithin(orders: Order[], days: number, now = Date.now()) {
  const from = now - days * DAY;
  return orders.filter((order) => new Date(order.createdAt).getTime() >= from);
}

function startOfDay(time: number) {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface DayPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface Delta {
  /** Change against the previous period, as a fraction (0.12 = +12%). null when there was nothing to compare. */
  pct: number | null;
}

export interface Dashboard {
  days: RangeDays;
  revenue: number;
  orders: number;
  avgOrder: number;
  newCustomers: number;
  revenueDelta: Delta;
  ordersDelta: Delta;
  avgOrderDelta: Delta;
  customersDelta: Delta;
  series: DayPoint[];
  byStatus: { status: OrderStatus; count: number }[];
  byCategory: { category: Category | "Other"; revenue: number; units: number }[];
  topProducts: { slug: string; name: string; image: string; units: number; revenue: number }[];
  lowStock: CatalogProduct[];
  catalog: { live: number; disabled: number; soldOut: number };
  totals: { customers: number; blocked: number; orders: number };
  recent: Order[];
}

const delta = (current: number, previous: number): Delta => ({ pct: previous > 0 ? current / previous - 1 : null });

export function buildDashboard(orders: Order[], customers: Customer[], products: CatalogProduct[], days: RangeDays, now = Date.now()): Dashboard {
  const end = startOfDay(now) + DAY;
  const start = end - days * DAY;
  const prevStart = start - days * DAY;

  const inRange = (time: string, from: number, to: number) => {
    const t = new Date(time).getTime();
    return t >= from && t < to;
  };
  const current = orders.filter((o) => inRange(o.createdAt, start, end));
  const previous = orders.filter((o) => inRange(o.createdAt, prevStart, start));

  const sum = (list: Order[]) => list.filter(isRevenue).reduce((total, o) => total + o.total, 0);
  const paidCount = (list: Order[]) => list.filter(isRevenue).length;
  const revenue = sum(current);
  const prevRevenue = sum(previous);
  const avg = (list: Order[]) => (paidCount(list) ? sum(list) / paidCount(list) : 0);

  const newIn = (from: number, to: number) => customers.filter((c) => inRange(c.createdAt, from, to)).length;
  const newCustomers = newIn(start, end);

  const series: DayPoint[] = Array.from({ length: days }, (_, i) => ({ date: dayKey(start + i * DAY + DAY / 2), revenue: 0, orders: 0 }));
  const index = new Map(series.map((point, i) => [point.date, i]));
  for (const order of current) {
    const point = series[index.get(dayKey(order.createdAt)) ?? -1];
    if (!point) continue;
    point.orders += 1;
    if (isRevenue(order)) point.revenue += order.total;
  }

  const byStatus = ORDER_STATUSES.map((status) => ({ status, count: current.filter((o) => o.status === status).length }));

  const category = new Map<string, { revenue: number; units: number }>();
  const product = new Map<string, { slug: string; name: string; image: string; units: number; revenue: number }>();
  for (const order of current.filter(isRevenue)) {
    for (const line of order.lines) {
      const key = line.category ?? "Other";
      const c = category.get(key) ?? { revenue: 0, units: 0 };
      c.revenue += line.price * line.quantity;
      c.units += line.quantity;
      category.set(key, c);
      const p = product.get(line.slug) ?? { slug: line.slug, name: line.name, image: line.image, units: 0, revenue: 0 };
      p.units += line.quantity;
      p.revenue += line.price * line.quantity;
      product.set(line.slug, p);
    }
  }

  return {
    days,
    revenue,
    orders: current.length,
    avgOrder: avg(current),
    newCustomers,
    revenueDelta: delta(revenue, prevRevenue),
    ordersDelta: delta(current.length, previous.length),
    avgOrderDelta: delta(avg(current), avg(previous)),
    customersDelta: delta(newCustomers, newIn(prevStart, start)),
    series,
    byStatus,
    byCategory: [...category.entries()].map(([name, v]) => ({ category: name as Category | "Other", ...v })).sort((a, b) => b.revenue - a.revenue),
    topProducts: [...product.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    lowStock: products.filter((p) => p.status === "live" && p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock),
    catalog: {
      live: products.filter((p) => p.status === "live").length,
      disabled: products.filter((p) => p.status === "disabled").length,
      soldOut: products.filter((p) => p.stock === 0).length,
    },
    totals: { customers: customers.length, blocked: customers.filter((c) => c.status === "blocked").length, orders: orders.length },
    recent: orders.slice(0, 6),
  };
}
