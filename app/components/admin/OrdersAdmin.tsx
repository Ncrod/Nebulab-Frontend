"use client";

import Image from "next/image";
import { useState } from "react";
import { errorMessage } from "../../lib/api";
import { setOrderStatus, useAdminOrders } from "../../lib/cms/orders";
import { ORDER_STATUSES, type Order, type OrderStatus } from "../../lib/cms/types";
import { showToast } from "../../lib/toast";
import { ORDER_STATUS } from "./statuses";
import { Badge, btnGhost, btnPrimary, cardCls, type Column, DataTable, Drawer, Dropdown, Field, PageHeader, SearchBox, Segmented, Select } from "./ui";
import { formatDateTime, formatMoney, formatOptions } from "./format";

type StatusFilter = "all" | OrderStatus;
type Range = "7" | "30" | "90" | "all";

const units = (order: Order) => order.units;

/** The natural next step of an order, offered as the main button of its drawer. */
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  paid: { status: "shipped", label: "Mark as shipped" },
  shipped: { status: "delivered", label: "Mark as delivered" },
};

/** Sales section: every order the store received, with its lines, totals and the tools to move it along or cancel it. */
export default function OrdersAdmin() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<Range>("30");
  const [openId, setOpenId] = useState<number | null>(null);

  // The server filters by range, status and text. The cards (`summary`) count what the filters leave; the status tabs
  // (`statusCounts`) count what the range leaves, whatever the status and text are.
  const { orders: rows, summary, statusCounts, loading, error, reload } = useAdminOrders({ days: range === "all" ? "all" : Number(range), status, search: query });
  const opened = rows.find((o) => o.id === openId) ?? null;

  /** Changes the status on the server, then loads the list again (the cards, the tabs and the stock changed with it). */
  async function changeStatus(order: Order, next: OrderStatus) {
    try {
      await setOrderStatus(order.id, next);
      showToast(`${order.number} is now ${ORDER_STATUS[next].label.toLowerCase()}`);
      reload();
    } catch (failure) {
      showToast(errorMessage(failure));
    }
  }

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
          {o.lines[0]?.name}
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
              onSelect: () => changeStatus(o, s),
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
    ["Revenue", formatMoney(summary.revenue)],
    ["Orders", String(summary.orders)],
    ["Avg. order", formatMoney(summary.avgOrder)],
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
        options={[{ value: "all", label: "All", count: statusCounts.all }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label, count: statusCounts[s] }))]}
      />

      <DataTable
        rows={rows}
        columns={columns}
        getId={(o) => o.id}
        onRowClick={(o) => setOpenId(o.id)}
        defaultSort={{ id: "date", dir: "desc" }}
        resetKey={`${query}|${status}|${range}`}
        loading={loading}
        error={error}
        caption="Orders"
        emptyTitle="No orders found"
        emptyText={statusCounts.all === 0 && !query ? "Orders show up here when someone pays in the store." : "Try another word, status or date range."}
      />

      {opened && <OrderDrawer key={opened.id} order={opened} onClose={() => setOpenId(null)} onChange={(next) => changeStatus(opened, next)} />}
    </>
  );
}

function OrderDrawer({ order, onClose, onChange: change }: { order: Order; onClose: () => void; onChange: (status: OrderStatus) => void }) {
  const next = NEXT[order.status];

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

        <section aria-label="Shipping address" className="flex flex-col gap-[4px] rounded-[12px] border border-white/[0.08] p-[16px] font-sans">
          <p className="m-0 text-[13px] text-[#98a2b3]">Ship to</p>
          <p className="m-0 text-[16px] text-white">{order.shippingAddress.address}</p>
          <p className="m-0 text-[14px] text-[#98a2b3]">
            {order.shippingAddress.city}, {order.shippingAddress.postalCode} · {order.shippingAddress.country}
          </p>
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
