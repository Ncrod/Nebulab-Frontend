"use client";

import { useMemo, useState } from "react";
import { customerStats, deleteCustomers, emptyCustomer, findCustomerByEmail, saveCustomer, setCustomerStatus, useCustomers, type CustomerInput } from "../../lib/cms/customers";
import { useOrders } from "../../lib/cms/orders";
import { isRevenue, type Customer, type CustomerStatus } from "../../lib/cms/types";
import { showToast } from "../../lib/toast";
import { EditIcon, TrashIcon } from "./AdminIcons";
import { CUSTOMER_STATUS, ORDER_STATUS } from "./statuses";
import { AddButton, Badge, BulkBar, btnDanger, btnGhost, btnPrimary, type Column, ConfirmDialog, DataTable, Drawer, Dropdown, Field, iconBtn, inputCls, PageHeader, SearchBox, Segmented, textareaCls } from "./ui";
import { formatDate, formatDateTime, formatMoney, initials } from "./format";

type StatusFilter = "all" | CustomerStatus;

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <span aria-hidden="true" style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-white/[0.1] font-display text-[13px] font-medium text-white">
    {initials(name)}
  </span>
);

/** Customers section: everyone who signed up or bought, their spending, and the tools to block or edit them. */
export default function CustomersAdmin() {
  const customers = useCustomers();
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Customer[] | null>(null);

  const stats = useMemo(() => customerStats(orders), [orders]);

  const rows = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return customers.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      const haystack = normalize(`${c.name} ${c.email}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [customers, query, status]);

  const selectedIds = selected.filter((id) => customers.some((c) => c.id === id)) as string[];
  const count = (s: CustomerStatus) => customers.filter((c) => c.status === s).length;

  const columns: Column<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      minWidth: 250,
      sort: (c) => c.name.toLowerCase(),
      cell: (c) => (
        <div className="flex items-center gap-[12px]">
          <Avatar name={c.name} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-white">{c.name}</span>
            <span className="block truncate text-[13px] text-[#98a2b3]">{c.email}</span>
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      minWidth: 130,
      sort: (c) => c.status,
      cell: (c) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown
            label={`Change status of ${c.name}`}
            items={(["active", "blocked"] as const).map((s) => ({
              label: CUSTOMER_STATUS[s].label,
              selected: c.status === s,
              onSelect: () => {
                setCustomerStatus(c.id, s);
                showToast(`${c.name} is now ${CUSTOMER_STATUS[s].label.toLowerCase()}`);
              },
            }))}
          >
            <Badge tone={CUSTOMER_STATUS[c.status].tone} chevron>
              {CUSTOMER_STATUS[c.status].label}
            </Badge>
          </Dropdown>
        </span>
      ),
    },
    { id: "orders", header: "Orders", minWidth: 100, align: "right", sort: (c) => stats.get(c.id)?.orders ?? 0, cell: (c) => stats.get(c.id)?.orders ?? 0 },
    { id: "spent", header: "Total spent", minWidth: 130, align: "right", sort: (c) => stats.get(c.id)?.spent ?? 0, cell: (c) => formatMoney(stats.get(c.id)?.spent ?? 0) },
    {
      id: "last",
      header: "Last order",
      minWidth: 120,
      sort: (c) => stats.get(c.id)?.lastOrderAt ?? "",
      className: "whitespace-nowrap text-[#98a2b3]",
      cell: (c) => {
        const last = stats.get(c.id)?.lastOrderAt;
        return last ? formatDate(last) : "—";
      },
    },
    { id: "joined", header: "Joined", minWidth: 120, sort: (c) => c.createdAt, className: "whitespace-nowrap text-[#98a2b3]", cell: (c) => formatDate(c.createdAt) },
    {
      id: "actions",
      header: "",
      minWidth: 96,
      cell: (c) => (
        <span className="flex justify-end gap-[2px]" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label={`Open ${c.name}`} onClick={() => setEditing(c)} className={iconBtn}>
            <EditIcon width={18} height={18} />
          </button>
          <button type="button" aria-label={`Delete ${c.name}`} onClick={() => setToDelete([c])} className={iconBtn}>
            <TrashIcon width={18} height={18} />
          </button>
        </span>
      ),
    },
  ];

  function confirmDelete() {
    if (!toDelete) return;
    deleteCustomers(toDelete.map((c) => c.id));
    showToast(toDelete.length === 1 ? `${toDelete[0].name} deleted` : `${toDelete.length} customers deleted`);
    setSelected([]);
    setToDelete(null);
    setEditing(null);
  }

  function bulkStatus(next: CustomerStatus) {
    selectedIds.forEach((id) => setCustomerStatus(id, next));
    showToast(`${selectedIds.length} customer${selectedIds.length === 1 ? "" : "s"} ${next === "blocked" ? "blocked" : "activated"}`);
    setSelected([]);
  }

  const withOrders = toDelete?.reduce((sum, c) => sum + (stats.get(c.id)?.orders ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} customers · ${count("blocked")} blocked`} action={<AddButton label="New customer" onClick={() => setEditing("new")} />} />

      <div className="flex flex-wrap items-center gap-[12px]">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name or email" />
        <Segmented<StatusFilter>
          ariaLabel="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: customers.length },
            { value: "active", label: "Active", count: count("active") },
            { value: "blocked", label: "Blocked", count: count("blocked") },
          ]}
        />
      </div>

      <BulkBar count={selectedIds.length} onClear={() => setSelected([])}>
        <button type="button" onClick={() => bulkStatus("active")} className={`${btnGhost} h-[36px] px-[16px] text-[14px]`}>
          Activate
        </button>
        <button type="button" onClick={() => bulkStatus("blocked")} className={`${btnGhost} h-[36px] px-[16px] text-[14px]`}>
          Block
        </button>
        <button type="button" onClick={() => setToDelete(customers.filter((c) => selectedIds.includes(c.id)))} className={`${btnDanger} h-[36px] px-[16px] text-[14px]`}>
          Delete
        </button>
      </BulkBar>

      <DataTable
        rows={rows}
        columns={columns}
        getId={(c) => c.id}
        selectable
        selected={selectedIds}
        onSelectedChange={setSelected}
        onRowClick={setEditing}
        defaultSort={{ id: "joined", dir: "desc" }}
        resetKey={`${query}|${status}`}
        caption="Customers"
        emptyTitle="No customers found"
        emptyText={customers.length === 0 ? "Customers appear here when they buy, or when you add them." : "Try another word or clear the filter."}
      />

      {editing && <CustomerDrawer key={editing === "new" ? "new" : editing.id} customer={editing === "new" ? null : editing} onClose={() => setEditing(null)} onDelete={(c) => setToDelete([c])} />}

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} customers?` : "Delete this customer?"}
        message={`${withOrders > 0 ? `Their ${withOrders} order${withOrders === 1 ? "" : "s"} stay in Sales. ` : ""}To only stop them from buying, block them instead.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

/** Profile form of a customer (or the form of a new one), their numbers and their order history. */
function CustomerDrawer({ customer, onClose, onDelete }: { customer: Customer | null; onClose: () => void; onDelete: (customer: Customer) => void }) {
  const customers = useCustomers();
  const orders = useOrders();
  const [form, setForm] = useState<CustomerInput>(() => (customer ? { name: customer.name, email: customer.email, notes: customer.notes } : emptyCustomer()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  // The live version of the customer (its status can change from the list while the drawer is open).
  const live = customer ? (customers.find((c) => c.id === customer.id) ?? customer) : null;
  const history = customer ? orders.filter((o) => o.customerId === customer.id) : [];
  const spent = history.filter(isRevenue).reduce((sum, o) => sum + o.total, 0);
  const paid = history.filter(isRevenue).length;

  function submit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "The customer needs a name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    else {
      const same = findCustomerByEmail(customers, form.email);
      if (same && same.id !== customer?.id) next.email = "Another customer already uses this email.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const saved = saveCustomer(form, customer?.id);
    showToast(customer ? `${saved.name} updated` : `${saved.name} added`);
    onClose();
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={customer ? form.name || customer.name : "New customer"}
      subtitle={customer ? `Customer since ${formatDate(customer.createdAt)}` : "They can then buy from the store with this email"}
      footer={
        <>
          {customer && (
            <button type="button" onClick={() => onDelete(customer)} className={`${btnDanger} mr-auto`}>
              <TrashIcon width={18} height={18} />
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} className={btnPrimary}>
            {customer ? "Save changes" : "Add customer"}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
        className="flex flex-col gap-[22px]"
      >
        {live && (
          <>
            <div className="grid grid-cols-3 gap-[10px]">
              {[
                ["Orders", String(history.length)],
                ["Total spent", formatMoney(spent)],
                ["Avg. order", formatMoney(paid ? spent / paid : 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[12px] border border-white/[0.08] p-[14px]">
                  <p className="m-0 font-sans text-[13px] text-[#98a2b3]">{label}</p>
                  <p className="m-0 mt-[4px] font-display text-[20px] font-medium text-white max-tablet:text-[17px]">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-[16px] rounded-[12px] border border-white/[0.08] px-[16px] py-[12px]">
              <div>
                <p className="m-0 font-display text-[15px] font-medium text-white">Account status</p>
                <p className="m-0 font-sans text-[13px] text-[#98a2b3]">Blocked customers cannot place orders.</p>
              </div>
              <Segmented<CustomerStatus>
                ariaLabel="Account status"
                value={live.status}
                onChange={(s) => setCustomerStatus(live.id, s)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "blocked", label: "Blocked" },
                ]}
              />
            </div>
          </>
        )}

        <Field label="Name" htmlFor="c-name" error={errors.name}>
          <input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} autoFocus={!customer} />
        </Field>
        <Field label="Email" htmlFor="c-email" error={errors.email}>
          <input id="c-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Internal notes" htmlFor="c-notes" hint="Only visible in the CMS.">
          <textarea id="c-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} className={textareaCls} />
        </Field>

        {customer && (
          <div className="flex flex-col gap-[10px]">
            <h3 className="m-0 font-display text-[15px] font-medium text-white">Order history</h3>
            {history.length === 0 ? (
              <p className="m-0 font-sans text-[14px] text-[#98a2b3]">No orders yet.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {history.slice(0, 8).map((order) => (
                  <li key={order.id} className="flex items-center gap-[12px] border-b border-white/[0.06] py-[12px] font-sans text-[14px] last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-white">{order.number}</span>
                      <span className="block truncate text-[13px] text-[#98a2b3]">
                        {formatDateTime(order.createdAt)} · {order.lines.reduce((n, l) => n + l.quantity, 0)} item(s)
                      </span>
                    </span>
                    <Badge tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</Badge>
                    <span className="w-[86px] text-right text-white">{formatMoney(order.total)}</span>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 8 && <p className="m-0 font-sans text-[13px] text-[#98a2b3]">Showing the latest 8 of {history.length}. See all of them in Sales.</p>}
          </div>
        )}
      </form>
    </Drawer>
  );
}
