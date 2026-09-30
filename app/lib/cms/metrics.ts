"use client";

import type { CatalogProduct, Category } from "../../data/catalog";
import { api } from "../api";
import { useQuery } from "../resource";
import type { Order, OrderStatus } from "./types";
import { ORDER_STATUSES } from "./types";

// Everything the dashboard shows is computed by the server (GET /admin/dashboard/), with the days grouped in the
// America/Bogota time zone. This file only describes the answer and loads it.

export type RangeDays = 7 | 30 | 90;

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

/** A flat line of `days` days ending today, so the chart has something to draw until the server answers. */
function flatSeries(days: number): DayPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return { date, revenue: 0, orders: 0 };
  });
}

/** What the page draws until the first answer arrives. */
const emptyDashboard = (days: RangeDays): Dashboard => ({
  days,
  revenue: 0,
  orders: 0,
  avgOrder: 0,
  newCustomers: 0,
  revenueDelta: { pct: null },
  ordersDelta: { pct: null },
  avgOrderDelta: { pct: null },
  customersDelta: { pct: null },
  series: flatSeries(days),
  byStatus: ORDER_STATUSES.map((status) => ({ status, count: 0 })),
  byCategory: [],
  topProducts: [],
  lowStock: [],
  catalog: { live: 0, disabled: 0, soldOut: 0 },
  totals: { customers: 0, blocked: 0, orders: 0 },
  recent: [],
});

export function useDashboard(days: RangeDays) {
  const result = useQuery(`dashboard:${days}`, () => api<Dashboard>(`/admin/dashboard/?days=${days}`, { session: "admin" }));
  return { dashboard: result.data ?? emptyDashboard(days), loading: result.loading, error: result.error };
}
