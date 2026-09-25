"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { placedWithin } from "../../lib/cms/metrics";
import { setOrderStatus, useOrders } from "../../lib/cms/orders";
import { isRevenue, ORDER_STATUSES, type Order, type OrderStatus } from "../../lib/cms/types";
import { showToast } from "../../lib/toast";
import { ORDER_STATUS } from "./statuses";
import { Badge, btnGhost, btnPrimary, cardCls, type Column, DataTable, Drawer, Dropdown, Field, PageHeader, SearchBox, Segmented, Select } from "./ui";
import { formatDateTime, formatMoney, formatOptions } from "./format";

type StatusFilter = "all" | OrderStatus;
type Range = "7" | "30" | "90" | "all";

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const units = (order: Order) => order.lines.reduce((n, line) => n + line.quantity, 0);

/** The natural next step of an order, offered as the main button of its drawer. */
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  paid: { status: "shipped", label: "Mark as shipped" },
  shipped: { status: "delivered", label: "Mark as delivered" },
};

/** Sales section: every order the store received, with its lines, totals and the tools to move it along or cancel it. */
export default function OrdersAdmin() {
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<Range>("30");
  const [openId, setOpenId] = useState<string | null>(null);

  // The range filter is applied first: the status tabs count what is left in it.
  const inRange = useMemo(() => {
    return range === "all" ? orders : placedWithin(orders, Number(range));
  }, [orders, range]);

  const rows = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return inRange.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      const haystack = normalize(`${o.number} ${o.customerName} ${o.customerEmail} ${o.lines.map((l) => l.name).join(" ")}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [inRange, query, status]);

  const revenue = rows.filter(isRevenue).reduce((sum, o) => sum + o.total, 0);
  const paid = rows.filter(isRevenue).length;
  const opened = orders.find((o) => o.id === openId) ?? null;

  const columns: Column<Order>[] = [
    { id: "number", header: "Order", minWidth: 110, sort: (o) => Number(o.number.replace("NB-", "")), cell: (o) => <span className="font-medium text-white">{o.number}</span> },
    { id: "date", header: "Date", minWidth: 180, sort: (o) => o.createdAt, className: "whitespace-nowrap text-[#98a2b3]", cell: (o) => formatDateTime(o.createdAt) },
    {
      id: "customer",
      header: "Customer",
      minWidth: 230,
      sort: (o) => o.customerName.toLowerCase(),
      cell: (o) => (
        <span className="block min-w-0">
          <span className="block truncate text-white">{o.customerName}</span>
          <span className="block truncate text-[13px] text-[#98a2b3]">{o.customerEmail}</span>
        </span>
      ),
    },
    {
      id: "items",
      header: "Items",
      minWidth: 190,
      className: "text-[#98a2b3]",
      cell: (o) => (
        <span className="block truncate">
          {o.lines[0].name}
          {o.lines.length > 1 && ` +${o.lines.length - 1} more`}
        </span>
      ),
    },
    { id: "units", header: "Units", minWidth: 80, align: "right", sort: units, cell: units },
    { id: "total", header: "Total", minWidth: 120, align: "right", sort: (o) => o.total, cell: (o) => <span className="text-white">{formatMoney(o.total)}</span> },
    { id: "card", header: "Payment", minWidth: 120, className: "whitespace-nowrap text-[#98a2b3]", cell: (o) => `•••• ${o.cardLast4}` },
    {
      id: "status",
      header: "Status",
      minWidth: 140,
      sort: (o) => o.status,
      cell: (o) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown
            label={`Change status of ${o.number}`}
            items={ORDER_STATUSES.map((s) => ({
              label: ORDER_STATUS[s].label,
              selected: o.status === s,
              onSelect: () => {
                setOrderStatus(o.id, s);
                showToast(`${o.number} is now ${ORDER_STATUS[s].label.toLowerCase()}`);
              },
            }))}
          >
            <Badge tone={ORDER_STATUS[o.status].tone} chevron>
              {ORDER_STATUS[o.status].label}
            </Badge>
          </Dropdown>
        </span>
      ),
    },
  ];

  const kpis = [
    ["Revenue", formatMoney(revenue)],
    ["Orders", String(rows.length)],
    ["Avg. order", formatMoney(paid ? revenue / paid : 0)],
  ];

  return (
    <>
      <PageHeader title="Sales" description="Every order placed in the store. Cancelling or refunding one gives its units back to the stock." />

      <div className="grid grid-cols-3 gap-[12px] max-tablet:grid-cols-1">
        {kpis.map(([label, value]) => (
          <div key={label} className={`${cardCls} px-[20px] py-[16px]`}>
            <p className="m-0 font-sans text-[14px] text-[#98a2b3]">{label}</p>
            <p className="m-0 mt-[4px] font-display text-[28px] font-medium leading-tight text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-[12px]">
        <SearchBox value={query} onChange={setQuery} placeholder="Search order, customer or product" />
        <div className="w-[170px]">
          <Select<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
              { value: "all", label: "All time" },
            ]}
          />
        </div>
      </div>

      <Segmented<StatusFilter>
        ariaLabel="Filter by status"
        value={status}
        onChange={setStatus}
        options={[{ value: "all", label: "All", count: inRange.length }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label, count: inRange.filter((o) => o.status === s).length }))]}
      />

      <DataTable
        rows={rows}
        columns={columns}
        getId={(o) => o.id}
        onRowClick={(o) => setOpenId(o.id)}
        defaultSort={{ id: "date", dir: "desc" }}
        resetKey={`${query}|${status}|${range}`}
        caption="Orders"
        emptyTitle="No orders found"
        emptyText={orders.length === 0 ? "Orders show up here when someone pays in the store." : "Try another word, status or date range."}
      />

      {opened && <OrderDrawer key={opened.id} order={opened} onClose={() => setOpenId(null)} />}
    </>
  );
}

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const next = NEXT[order.status];

  function change(status: OrderStatus) {
    setOrderStatus(order.id, status);
    showToast(`${order.number} is now ${ORDER_STATUS[status].label.toLowerCase()}`);
  }

  const restocks = order.status === "cancelled" || order.status === "refunded";

  return (
    <Drawer
      open
      onClose={onClose}
      title={order.number}
      subtitle={formatDateTime(order.createdAt)}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>
            Close
          </button>
          {next && (
            <button type="button" onClick={() => change(next.status)} className={btnPrimary}>
              {next.label}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-[24px]">
        <Field label="Status" htmlFor="o-status" hint={restocks ? "The units of this order are back in the stock." : "Cancelling or refunding gives the units back to the stock."}>
          <Select<OrderStatus> id="o-status" value={order.status} onChange={change} options={ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label }))} />
        </Field>

        <section aria-label="Customer" className="flex flex-col gap-[4px] rounded-[12px] border border-white/[0.08] p-[16px] font-sans">
          <p className="m-0 text-[13px] text-[#98a2b3]">Customer</p>
          <p className="m-0 text-[16px] font-medium text-white">{order.customerName}</p>
          <p className="m-0 text-[14px] text-[#98a2b3]">{order.customerEmail}</p>
        </section>

        <section aria-label="Items" className="flex flex-col gap-[4px]">
          <h3 className="m-0 mb-[6px] font-display text-[15px] font-medium text-white">Items</h3>
          <ul className="m-0 flex list-none flex-col p-0">
            {order.lines.map((line, i) => (
              <li key={`${line.slug}-${i}`} className="flex items-center gap-[14px] border-b border-white/[0.06] py-[12px] font-sans last:border-b-0">
                <span className="relative h-[48px] w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-white">
                  <Image src={line.image} alt="" fill sizes="72px" className="object-contain" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-white">{line.name}</span>
                  <span className="block truncate text-[13px] text-[#98a2b3]">{formatOptions(line.options) || "No attributes"}</span>
                </span>
                <span className="text-right text-[14px] text-white">
                  <span className="block">{formatMoney(line.price * line.quantity)}</span>
                  <span className="block text-[13px] text-[#98a2b3]">
                    {line.quantity} × {formatMoney(line.price)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="m-0 flex flex-col gap-[10px] rounded-[12px] border border-white/[0.08] p-[16px] font-sans text-[15px] text-white">
          <div className="flex justify-between">
            <dt className="text-[#98a2b3]">Subtotal</dt>
            <dd className="m-0">{formatMoney(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#98a2b3]">Tax ({Math.round(order.taxRate * 100)}%)</dt>
            <dd className="m-0">{formatMoney(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-white/[0.06] pt-[10px] text-[17px] font-medium">
            <dt>Total</dt>
            <dd className="m-0">{formatMoney(order.total)}</dd>
          </div>
          <div className="flex justify-between text-[14px]">
            <dt className="text-[#98a2b3]">Paid with</dt>
            <dd className="m-0">Card •••• {order.cardLast4}</dd>
          </div>
          <div className="flex justify-between text-[14px]">
            <dt className="text-[#98a2b3]">Last update</dt>
            <dd className="m-0">{formatDateTime(order.updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </Drawer>
  );
}
