"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CATEGORIES, LOW_STOCK, priceRange, type CatalogProduct, type Category, type ProductStatus } from "../../data/catalog";
import { errorMessage } from "../../lib/api";
import { deleteProducts, setProductStatus, useProducts } from "../../lib/cms/products";
import { showToast } from "../../lib/toast";
import { EditIcon, TrashIcon } from "./AdminIcons";
import ProductEditor from "./ProductEditor";
import { PRODUCT_STATUS } from "./statuses";
import { AddButton, Badge, BulkBar, btnDanger, btnGhost, type Column, ConfirmDialog, DataTable, Dropdown, iconBtn, PageHeader, SearchBox, Select } from "./ui";
import { formatDate, formatMoney } from "./format";

type StatusFilter = "all" | ProductStatus | "low";

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Products section: every product of the catalog in a table, with create, edit, enable/disable and delete. */
export default function ProductsAdmin() {
  const { data: products, loading, error } = useProducts();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  // null: closed. "new": empty form. A product: editing it.
  const [editing, setEditing] = useState<CatalogProduct | "new" | null>(null);
  const [toDelete, setToDelete] = useState<CatalogProduct[] | null>(null);

  const rows = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (status === "low" ? p.stock > LOW_STOCK : status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      const haystack = normalize(`${p.name} ${p.slug} ${p.category}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [products, query, status, category]);

  // Selection only counts products that still exist.
  const selectedIds = selected.filter((id) => products.some((p) => p.id === id)) as number[];

  const columns: Column<CatalogProduct>[] = [
    {
      id: "name",
      header: "Product",
      minWidth: 240,
      sort: (p) => p.name.toLowerCase(),
      cell: (p) => (
        <div className="flex items-center gap-[12px]">
          <span className="relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[8px] bg-white">
            <Image src={p.image} alt="" fill sizes="64px" className="object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-white">{p.name}</span>
            {(p.isNew || p.recommended) && <span className="text-[12px] text-[#98a2b3]">{[p.isNew && "New arrival", p.recommended && "Recommended"].filter(Boolean).join(" · ")}</span>}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      minWidth: 120,
      sort: (p) => p.status,
      cell: (p) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown
            label={`Change status of ${p.name}`}
            items={(["live", "disabled"] as const).map((s) => ({
              label: PRODUCT_STATUS[s].label,
              selected: p.status === s,
              onSelect: () => {
                setProductStatus([p.id], s).then(
                  () => showToast(`${p.name} is now ${PRODUCT_STATUS[s].label.toLowerCase()}`),
                  (failure) => showToast(errorMessage(failure)),
                );
              },
            }))}
          >
            <Badge tone={PRODUCT_STATUS[p.status].tone} chevron>
              {PRODUCT_STATUS[p.status].label}
            </Badge>
          </Dropdown>
        </span>
      ),
    },
    { id: "slug", header: "Slug", minWidth: 170, sort: (p) => p.slug, className: "text-[#98a2b3]", cell: (p) => p.slug },
    { id: "category", header: "Category", minWidth: 120, sort: (p) => p.category, cell: (p) => <Badge>{p.category}</Badge> },
    {
      id: "price",
      header: "Price",
      minWidth: 110,
      sort: (p) => p.price,
      align: "right",
      // With variants the price is a range: the cheapest combination is what the store shows as "From".
      cell: (p) => {
        const { min, max } = priceRange(p);
        return max > min ? `${formatMoney(min)} – ${formatMoney(max)}` : formatMoney(min);
      },
    },
    {
      id: "stock",
      header: "Stock",
      minWidth: 100,
      sort: (p) => p.stock,
      align: "right",
      cell: (p) =>
        p.stock === 0 ? (
          <Badge tone="red">Sold out</Badge>
        ) : p.stock <= LOW_STOCK ? (
          <Badge tone="amber">{p.stock} left</Badge>
        ) : (
          p.stock
        ),
    },
    {
      id: "options",
      header: "Attributes",
      minWidth: 170,
      className: "text-[#98a2b3]",
      cell: (p) => {
        const attributes = p.options.map((o) => `${o.name} (${o.values.length})`).join(" · ");
        if (!attributes) return "—";
        const soldOut = p.variants.filter((v) => v.stock <= 0).length;
        return (
          <span className="min-w-0">
            <span className="block truncate">{attributes}</span>
            {p.variants.length > 0 && (
              <span className="block text-[12px]">
                {p.variants.length} combination{p.variants.length === 1 ? "" : "s"}
                {soldOut > 0 && <span className="text-[#ff8a80]"> · {soldOut} sold out</span>}
              </span>
            )}
          </span>
        );
      },
    },
    { id: "updated", header: "Updated", minWidth: 110, sort: (p) => p.updatedAt, className: "whitespace-nowrap text-[#98a2b3]", cell: (p) => formatDate(p.updatedAt) },
    {
      id: "actions",
      header: "",
      minWidth: 90,
      cell: (p) => (
        <span className="flex justify-end gap-[2px]" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)} className={iconBtn}>
            <EditIcon width={18} height={18} />
          </button>
          <button type="button" aria-label={`Delete ${p.name}`} onClick={() => setToDelete([p])} className={iconBtn}>
            <TrashIcon width={18} height={18} />
          </button>
        </span>
      ),
    },
  ];

  const live = products.filter((p) => p.status === "live").length;

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteProducts(toDelete.map((p) => p.id));
      showToast(toDelete.length === 1 ? `${toDelete[0].name} deleted` : `${toDelete.length} products deleted`);
    } catch (failure) {
      showToast(errorMessage(failure));
    }
    setSelected([]);
    setToDelete(null);
    setEditing(null);
  }

  async function bulkStatus(next: ProductStatus) {
    try {
      await setProductStatus(selectedIds, next);
      showToast(`${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"} ${next === "live" ? "enabled" : "disabled"}`);
    } catch (failure) {
      showToast(errorMessage(failure));
    }
    setSelected([]);
  }

  return (
    <>
      <PageHeader title="Products" description={`${products.length} products · ${live} live in the store`} action={<AddButton label="New product" onClick={() => setEditing("new")} />} />

      <div className="flex flex-wrap items-center gap-[12px]">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name, slug or category" />
        <div className="w-[170px] max-tablet:w-[calc(50%-6px)]">
          <Select<StatusFilter>
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "live", label: "Live" },
              { value: "disabled", label: "Disabled" },
              { value: "low", label: "Low stock" },
            ]}
          />
        </div>
        <div className="w-[190px] max-tablet:w-[calc(50%-6px)]">
          <Select<Category | "all"> value={category} onChange={setCategory} options={[{ value: "all", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
        </div>
      </div>

      <BulkBar count={selectedIds.length} onClear={() => setSelected([])}>
        <button type="button" onClick={() => bulkStatus("live")} className={`${btnGhost} h-[36px] px-[16px] text-[14px]`}>
          Enable
        </button>
        <button type="button" onClick={() => bulkStatus("disabled")} className={`${btnGhost} h-[36px] px-[16px] text-[14px]`}>
          Disable
        </button>
        <button type="button" onClick={() => setToDelete(products.filter((p) => selectedIds.includes(p.id)))} className={`${btnDanger} h-[36px] px-[16px] text-[14px]`}>
          Delete
        </button>
      </BulkBar>

      <DataTable
        rows={rows}
        columns={columns}
        getId={(p) => p.id}
        selectable
        selected={selectedIds}
        onSelectedChange={setSelected}
        onRowClick={setEditing}
        defaultSort={{ id: "updated", dir: "desc" }}
        resetKey={`${query}|${status}|${category}`}
        loading={loading}
        error={error}
        caption="Products"
        emptyTitle="No products found"
        emptyText={products.length === 0 ? "Create the first product of the store." : "Try another word or clear the filters."}
      />

      {editing && <ProductEditor key={editing === "new" ? "new" : editing.id} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} onDelete={(p) => setToDelete([p])} />}

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} products?` : "Delete this product?"}
        message={
          toDelete && toDelete.length === 1
            ? `${toDelete[0].name} disappears from the store and from the CMS. Past sales keep their copy of it. To only hide it, disable it instead.`
            : "They disappear from the store and from the CMS. Past sales keep their copy of them. To only hide them, disable them instead."
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
