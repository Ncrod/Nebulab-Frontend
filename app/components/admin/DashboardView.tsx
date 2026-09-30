"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useDashboard, type Delta, type RangeDays } from "../../lib/cms/metrics";
import type { OrderStatus } from "../../lib/cms/types";
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon } from "./AdminIcons";
import RevenueChart from "./RevenueChart";
import { ORDER_STATUS } from "./statuses";
import { Badge, cardCls, PageHeader, Segmented } from "./ui";
import { formatDateTime, formatMoney, formatMoneyRound, formatNumber, formatPct } from "./format";

// Segment colours of the status bar: the reserved status hues, plus a light grey for "paid" (in progress).
const STATUS_FILL: Record<OrderStatus, string> = {
  paid: "#d9d9d9",
  shipped: "#fab219",
  delivered: "#0ca30c",
  cancelled: "#d03b3b",
  refunded: "#ec835a",
};

function Card({ title, subtitle, action, children, className = "" }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${cardCls} flex min-w-0 flex-col gap-[16px] p-[20px] ${className}`}>
      <header className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <h2 className="m-0 font-display text-[18px] font-medium text-white">{title}</h2>
          {subtitle && <p className="m-0 mt-[2px] font-sans text-[13px] text-[#98a2b3]">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** "+12%" with an arrow and its colour (up is good here), or nothing to compare against. */
function DeltaTag({ delta, days }: { delta: Delta; days: number }) {
  if (delta.pct === null) return <span className="font-sans text-[13px] text-[#98a2b3]">No data in the previous {days} days</span>;
  const up = delta.pct >= 0;
  return (
    <span className="flex items-center gap-[6px] font-sans text-[13px] text-[#98a2b3]">
      <span className={`flex items-center gap-[2px] font-medium ${up ? "text-[#56d456]" : "text-[#ff8a80]"}`}>
        {up ? <ArrowUpIcon width={13} height={13} /> : <ArrowDownIcon width={13} height={13} />}
        {formatPct(delta.pct)}
      </span>
      vs previous {days} days
    </span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="m-0 py-[24px] text-center font-sans text-[14px] text-[#98a2b3]">{children}</p>;
}

/** Dashboard: the numbers of the store for a period (revenue, orders, customers), the charts behind them and what needs attention. All of it comes from the server. */
export default function DashboardView() {
  const [days, setDays] = useState<RangeDays>(30);
  const { dashboard: d, loading, error } = useDashboard(days);
  const categoryMax = Math.max(...d.byCategory.map((c) => c.revenue), 1);
  const productMax = Math.max(...d.topProducts.map((p) => p.revenue), 1);
  const statusTotal = d.byStatus.reduce((sum, s) => sum + s.count, 0);

  const tiles: { label: string; value: string; delta: Delta }[] = [
    { label: "Orders", value: formatNumber(d.orders), delta: d.ordersDelta },
    { label: "Average order", value: formatMoney(d.avgOrder), delta: d.avgOrderDelta },
    { label: "New customers", value: formatNumber(d.newCustomers), delta: d.customersDelta },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={error ? `We could not load the numbers: ${error}` : loading ? "Loading… the server can take a few seconds to wake up." : "How the store is doing."}
        action={
          <Segmented<RangeDays>
            ariaLabel="Period"
            value={days}
            onChange={setDays}
            options={[
              { value: 7, label: "7 days" },
              { value: 30, label: "30 days" },
              { value: 90, label: "90 days" },
            ]}
          />
        }
      />

      {/* Headline: the one big number of the page, then the supporting ones. */}
      <div className="grid grid-cols-4 gap-[16px] max-desktop:grid-cols-2 max-tablet:grid-cols-1">
        <div className={`${cardCls} flex flex-col gap-[8px] p-[20px] max-desktop:col-span-2 max-tablet:col-span-1`}>
          <p className="m-0 font-sans text-[14px] text-[#98a2b3]">Revenue</p>
          <p className="m-0 font-display text-[52px] font-medium leading-none text-white max-tablet:text-[44px]">{formatMoneyRound(d.revenue)}</p>
          <DeltaTag delta={d.revenueDelta} days={days} />
        </div>
        {tiles.map((tile) => (
          <div key={tile.label} className={`${cardCls} flex flex-col justify-between gap-[8px] p-[20px]`}>
            <p className="m-0 font-sans text-[14px] text-[#98a2b3]">{tile.label}</p>
            <p className="m-0 font-display text-[32px] font-medium leading-none text-white">{tile.value}</p>
            <DeltaTag delta={tile.delta} days={days} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[16px] max-notebook:grid-cols-1">
        <Card title="Revenue" subtitle={`Per day, last ${days} days. Cancelled and refunded orders do not count.`}>
          <RevenueChart series={d.series} />
        </Card>

        <Card title="Orders by status" subtitle={`${statusTotal} order${statusTotal === 1 ? "" : "s"} in the period`}>
          {statusTotal === 0 ? (
            <Empty>No orders in this period.</Empty>
          ) : (
            <>
              {/* One bar split by status, a 2px gap between segments. */}
              <div className="flex h-[14px] gap-[2px]" role="img" aria-label={d.byStatus.map((s) => `${ORDER_STATUS[s.status].label} ${s.count}`).join(", ")}>
                {d.byStatus
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <span key={s.status} title={`${ORDER_STATUS[s.status].label}: ${s.count}`} style={{ flexGrow: s.count, backgroundColor: STATUS_FILL[s.status] }} className="min-w-[6px] first:rounded-l-[4px] last:rounded-r-[4px]" />
                  ))}
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                {d.byStatus.map((s) => (
                  <li key={s.status} className="flex items-center justify-between gap-[12px] border-b border-white/[0.06] py-[10px] font-sans text-[14px] last:border-b-0">
                    <span className="flex items-center gap-[10px] text-white/85">
                      <span aria-hidden="true" style={{ backgroundColor: STATUS_FILL[s.status] }} className="size-[10px] rounded-[3px]" />
                      {ORDER_STATUS[s.status].label}
                    </span>
                    <span className="text-white">
                      {s.count} <span className="text-[#98a2b3]">· {statusTotal ? Math.round((s.count / statusTotal) * 100) : 0}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-[16px] max-desktop:grid-cols-2 max-notebook:grid-cols-1">
        <Card title="Sales by category" subtitle="Revenue in the period">
          {d.byCategory.length === 0 ? (
            <Empty>No sales in this period.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
              {d.byCategory.map((c) => (
                <li key={c.category} title={`${c.category}: ${formatMoney(c.revenue)} · ${c.units} units`} className="flex flex-col gap-[6px] font-sans text-[14px]">
                  <span className="flex justify-between gap-[8px] text-white/85">
                    <span className="truncate">{c.category}</span>
                    <span className="text-white">{formatMoneyRound(c.revenue)}</span>
                  </span>
                  <span className="block h-[10px] w-full rounded-full bg-white/[0.05]">
                    <span className="block h-full rounded-r-[4px] rounded-l-full bg-white" style={{ width: `${Math.max((c.revenue / categoryMax) * 100, 2)}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top products" subtitle="By revenue in the period">
          {d.topProducts.length === 0 ? (
            <Empty>No sales in this period.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-[12px] p-0">
              {d.topProducts.map((p) => (
                <li key={p.slug} className="flex items-center gap-[12px] font-sans">
                  <span className="relative h-[40px] w-[60px] shrink-0 overflow-hidden rounded-[8px] bg-white">
                    <Image src={p.image} alt="" fill sizes="60px" className="object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-[8px] text-[14px]">
                      <span className="truncate text-white">{p.name}</span>
                      <span className="shrink-0 text-white">{formatMoneyRound(p.revenue)}</span>
                    </span>
                    <span className="mt-[6px] block h-[4px] w-full rounded-full bg-white/[0.05]">
                      <span className="block h-full rounded-full bg-white/70" style={{ width: `${(p.revenue / productMax) * 100}%` }} />
                    </span>
                    <span className="mt-[4px] block text-[12px] text-[#98a2b3]">{p.units} sold</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Low stock"
          subtitle="Live products with 5 units or fewer"
          className="max-desktop:col-span-2 max-notebook:col-span-1"
          action={
            <Link href="/admin/products" className="flex items-center gap-[2px] font-sans text-[13px] text-[#98a2b3] transition-colors hover:text-white">
              Manage <ChevronRightIcon width={14} height={14} />
            </Link>
          }
        >
          {d.lowStock.length === 0 ? (
            <Empty>Every live product has stock.</Empty>
          ) : (
            <ul className="m-0 flex max-h-[300px] list-none flex-col overflow-y-auto p-0">
              {d.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-[12px] border-b border-white/[0.06] py-[10px] font-sans text-[14px] last:border-b-0">
                  <span className="truncate text-white/85">{p.name}</span>
                  <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[16px] max-notebook:grid-cols-1">
        <Card
          title="Recent orders"
          action={
            <Link href="/admin/orders" className="flex items-center gap-[2px] font-sans text-[13px] text-[#98a2b3] transition-colors hover:text-white">
              All sales <ChevronRightIcon width={14} height={14} />
            </Link>
          }
        >
          {d.recent.length === 0 ? (
            <Empty>Orders show up here when someone pays in the store.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {d.recent.map((o) => (
                <li key={o.id} className="flex items-center gap-[12px] border-b border-white/[0.06] py-[12px] font-sans text-[14px] last:border-b-0">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-white">
                      {o.number} <span className="font-normal text-[#98a2b3]">· {o.customerName}</span>
                    </span>
                    <span className="block truncate text-[13px] text-[#98a2b3]">{formatDateTime(o.createdAt)}</span>
                  </span>
                  <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
                  <span className="w-[90px] text-right text-white max-tablet:w-auto">{formatMoney(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Store" subtitle="All time">
          <dl className="m-0 flex flex-col font-sans text-[14px]">
            {[
              ["Live products", d.catalog.live, "/admin/products"],
              ["Disabled products", d.catalog.disabled, "/admin/products"],
              ["Sold out", d.catalog.soldOut, "/admin/products"],
              ["Customers", d.totals.customers, "/admin/customers"],
              ["Blocked customers", d.totals.blocked, "/admin/customers"],
              ["Orders", d.totals.orders, "/admin/orders"],
            ].map(([label, value, href]) => (
              <div key={label as string} className="flex items-center justify-between border-b border-white/[0.06] py-[11px] last:border-b-0">
                <dt>
                  <Link href={href as string} className="text-white/85 transition-colors hover:text-white">
                    {label}
                  </Link>
                </dt>
                <dd className="m-0 font-medium text-white">{formatNumber(value as number)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
