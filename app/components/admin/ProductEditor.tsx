"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import {
  allCombinations,
  CATEGORIES,
  slugify,
  variantKey,
  variantsStock,
  type CatalogProduct,
  type Category,
  type OptionChoice,
  type ProductOption,
  type ProductStatus,
  type ProductVariant,
} from "../../data/catalog";
import { ApiError, errorMessage } from "../../lib/api";
import { emptyProduct, isSlugTaken, saveProduct, useProducts, type ProductInput } from "../../lib/cms/products";
import { showToast } from "../../lib/toast";
import { CloseIcon, PlusIcon, TrashIcon } from "./AdminIcons";
import { btnDanger, btnGhost, btnPrimary, Drawer, Field, iconBtn, inputCls, Select, textareaCls, Toggle } from "./ui";

/** The fields of the form that show an error message under them. */
const FORM_FIELDS = ["name", "slug", "category", "price", "stock", "image", "options", "variants"];

const PLACEHOLDER_IMAGE = "/images/catalog/airpods-pro-2.png";

/** The shop draws products with next/image: an https URL (any host is allowed in next.config.ts) or a path of this site. */
function isUsableImage(src: string) {
  if (/^\/(?!\/)/.test(src)) return true;
  try {
    return new URL(src).protocol === "https:";
  } catch {
    return false;
  }
}

/** Values of an attribute as removable chips; Enter or comma adds the typed one. */
function ChipInput({ values, onChange, label }: { values: string[]; onChange: (values: string[]) => void; label: string }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim().replace(/,$/, "");
    if (value) onChange([...values, value]);
    setDraft("");
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-[6px] rounded-[12px] border border-white/[0.12] bg-[#0f0f0f] px-[8px] py-[6px] focus-within:border-white/30">
      {values.map((value, i) => (
        <span key={`${value}-${i}`} className="flex items-center gap-[4px] rounded-[8px] bg-white/[0.1] py-[4px] pl-[10px] pr-[4px] font-sans text-[14px] text-white">
          {value}
          <button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((_, j) => j !== i))} className="grid size-[20px] cursor-pointer place-items-center rounded-[6px] text-white/60 hover:bg-white/[0.12] hover:text-white">
            <CloseIcon width={12} height={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        aria-label={label}
        placeholder={values.length ? "Add another…" : "Type a value and press Enter"}
        className="min-w-[140px] flex-1 bg-transparent px-[6px] py-[4px] font-sans text-[14px] text-white outline-none placeholder:text-[#98a2b3]/50"
      />
    </div>
  );
}

/** "256GB · Black": how a combination reads in the list of variants. */
const combinationLabel = (options: OptionChoice[]) => options.map((option) => option.value).join(" · ");

/**
 * The combinations of the current attributes, keeping the price, stock and SKU already typed for the ones that still
 * exist. Combinations whose values were removed from an attribute disappear; new ones start at `fallbackPrice`.
 */
function rebuildVariants(options: ProductOption[], current: ProductVariant[], fallbackPrice: number): ProductVariant[] {
  const byKey = new Map(current.map((variant) => [variantKey(variant.options), variant]));
  return allCombinations(options).map((combination) => {
    const kept = byKey.get(variantKey(combination));
    return kept ? { ...kept, options: combination } : { options: combination, price: Number.isFinite(fallbackPrice) ? fallbackPrice : 0, stock: 0 };
  });
}

const PRESET_OPTIONS: { label: string; option: ProductOption }[] = [
  { label: "Storage", option: { name: "Storage", values: [], layout: "stack" } },
  { label: "Color", option: { name: "Color", values: [] } },
  { label: "Size", option: { name: "Size", values: [] } },
  { label: "Custom", option: { name: "", values: [] } },
];

/**
 * Create/edit form of a product, in a drawer. Mount it with a `key` per product: the form starts from `product`
 * (or an empty one) and keeps its own state until it is closed.
 */
export default function ProductEditor({
  product,
  onClose,
  onDelete,
}: {
  product: CatalogProduct | null;
  onClose: () => void;
  onDelete: (product: CatalogProduct) => void;
}) {
  const { data: products } = useProducts();
  const [form, setForm] = useState<ProductInput>(() => (product ? { ...product, options: product.options.map((o) => ({ ...o, values: [...o.values] })) } : emptyProduct()));
  // A new product's slug follows its name until the admin types their own.
  const [slugTouched, setSlugTouched] = useState(product !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const slug = slugTouched ? form.slug : slugify(form.name);

  // With variants the price and the stock of the product are the cheapest combination and the sum of all of them: the
  // two fields at the top stop being typed and only show what the variants add up to (the server computes the same).
  const hasVariants = form.variants.length > 0;
  const fromPrice = hasVariants ? Math.min(...form.variants.map((v) => (Number.isFinite(v.price) ? v.price : 0))) : form.price;
  const totalStock = hasVariants ? variantsStock(form.variants) : form.stock;
  const combinationsCount = allCombinations(form.options).length;
  const complete = form.options.length > 0 && form.options.every((o) => o.values.length > 0);

  /** Once the combinations exist they follow the attributes: renaming or editing values keeps the list in step. */
  function withOptions(options: ProductOption[]) {
    setForm((f) => ({ ...f, options, variants: f.variants.length > 0 ? rebuildVariants(options, f.variants, f.price) : f.variants }));
  }

  function setOption(index: number, change: Partial<ProductOption>) {
    withOptions(form.options.map((o, i) => (i === index ? { ...o, ...change } : o)));
  }

  function setVariant(index: number, change: Partial<ProductVariant>) {
    set("variants", form.variants.map((v, i) => (i === index ? { ...v, ...change } : v)));
  }

  async function submit() {
    if (saving) return;
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "The product needs a name.";
    if (!slug) next.slug = "The slug cannot be empty.";
    else if (isSlugTaken(products, slug, product?.id)) next.slug = "Another product already uses this slug.";
    if (!Number.isFinite(form.price) || form.price < 0) next.price = "Enter a price of 0 or more.";
    if (!Number.isInteger(form.stock) || form.stock < 0) next.stock = "Stock must be a whole number, 0 or more.";
    if (!isUsableImage(form.image)) next.image = "Enter an image URL starting with https:// (or a path of this site, like /images/catalog/photo.png).";
    if (form.options.some((o) => !o.name.trim() || o.values.length === 0)) next.options = "Every attribute needs a name and at least one value.";
    if (form.variants.some((v) => !Number.isFinite(v.price) || v.price < 0)) next.variants = "Every combination needs a price of 0 or more.";
    else if (form.variants.some((v) => !Number.isInteger(v.stock) || v.stock < 0)) next.variants = "The stock of a combination must be a whole number, 0 or more.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const saved = await saveProduct(
        {
          ...form,
          name: form.name.trim(),
          slug,
          description: form.description.trim(),
          options: form.options.map((o) => ({ ...o, name: o.name.trim() })),
          price: fromPrice,
          stock: totalStock,
        },
        product?.id,
      );
      showToast(product ? `${saved.name} updated` : `${saved.name} created`);
      onClose();
    } catch (failure) {
      // The server checks everything again: its messages go under the field they belong to.
      const fields = failure instanceof ApiError ? failure.fields : {};
      const shown = Object.keys(fields).some((key) => FORM_FIELDS.includes(key));
      setErrors(shown ? fields : { name: errorMessage(failure) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={product ? "Edit product" : "New product"}
      subtitle={product ? `ID ${product.id}` : "It shows in the store once it is live"}
      width={620}
      footer={
        <>
          {product && (
            <button type="button" onClick={() => onDelete(product)} className={`${btnDanger} mr-auto`}>
              <TrashIcon width={18} height={18} />
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className={btnPrimary}>
            {product ? "Save changes" : "Create product"}
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
        <Field label="Name" htmlFor="p-name" error={errors.name}>
          <input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="iPhone 18 Pro Max" className={inputCls} autoFocus />
        </Field>

        <Field label="Slug" htmlFor="p-slug" error={errors.slug} hint={`Address of the product page: /products/${slug || "…"}`}>
          <input
            id="p-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-[16px] max-tablet:grid-cols-1">
          <Field label="Category" htmlFor="p-category" error={errors.category}>
            <Select<Category> id="p-category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Status" htmlFor="p-status" hint="Disabled products are hidden from the store.">
            <Select<ProductStatus>
              id="p-status"
              value={form.status}
              onChange={(v) => set("status", v)}
              options={[
                { value: "live", label: "Live" },
                { value: "disabled", label: "Disabled" },
              ]}
            />
          </Field>
          <Field label="Price (USD)" htmlFor="p-price" error={errors.price} hint={hasVariants ? "The cheapest combination; the store shows it as “From”." : undefined}>
            <input id="p-price" type="number" inputMode="decimal" min={0} step="0.01" disabled={hasVariants} value={hasVariants ? fromPrice : Number.isNaN(form.price) ? "" : form.price} onChange={(e) => set("price", e.target.value === "" ? NaN : Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Stock" htmlFor="p-stock" error={errors.stock} hint={hasVariants ? "The combinations added up." : "Units available. 0 shows “Sold out”."}>
            <input id="p-stock" type="number" inputMode="numeric" min={0} step={1} disabled={hasVariants} value={hasVariants ? totalStock : Number.isNaN(form.stock) ? "" : form.stock} onChange={(e) => set("stock", e.target.value === "" ? NaN : Number(e.target.value))} className={inputCls} />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-[16px] rounded-[12px] border border-white/[0.08] px-[16px] py-[12px]">
          <div>
            <p className="m-0 font-display text-[15px] font-medium text-white">New arrival</p>
            <p className="m-0 font-sans text-[13px] text-[#98a2b3]">Shows in the “New” filter of the catalog.</p>
          </div>
          <Toggle checked={form.isNew} onChange={(v) => set("isNew", v)} label="New arrival" />
        </div>

        <div className="flex items-center justify-between gap-[16px] rounded-[12px] border border-white/[0.08] px-[16px] py-[12px]">
          <div>
            <p className="m-0 font-display text-[15px] font-medium text-white">Recommended</p>
            <p className="m-0 font-sans text-[13px] text-[#98a2b3]">Shows in the carousel of the home page (only while it is live).</p>
          </div>
          <Toggle checked={form.recommended} onChange={(v) => set("recommended", v)} label="Recommended" />
        </div>

        <Field label="Description" htmlFor="p-description">
          <textarea id="p-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes this product special" className={textareaCls} />
        </Field>

        <Field label="Image URL" htmlFor="p-image" error={errors.image} hint="A wide picture (16:9) with the product in the middle works best.">
          <div className="flex items-center gap-[16px] max-tablet:flex-col max-tablet:items-stretch">
            <div className="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded-[12px] bg-white max-tablet:w-full">
              <Image src={isUsableImage(form.image) ? form.image : PLACEHOLDER_IMAGE} alt="" fill sizes="160px" className="object-contain" />
            </div>
            <input id="p-image" type="url" inputMode="url" value={form.image} onChange={(e) => set("image", e.target.value.trim())} placeholder="https://…" className={inputCls} />
          </div>
        </Field>

        <div className="flex flex-col gap-[12px]">
          <div>
            <h3 className="m-0 font-display text-[15px] font-medium text-white">Attributes</h3>
            <p className="m-0 font-sans text-[13px] text-[#98a2b3]">What the shopper must choose before adding it to the bag (storage, color, size…). Leave empty if there is none.</p>
          </div>

          {form.options.map((option, i) => (
            <div key={i} className="flex flex-col gap-[12px] rounded-[14px] border border-white/[0.08] p-[14px]">
              <div className="flex items-center gap-[10px]">
                <input aria-label="Attribute name" value={option.name} onChange={(e) => setOption(i, { name: e.target.value })} placeholder="Name (Storage, Color…)" className={inputCls} />
                <div className="w-[130px] shrink-0">
                  <Select<"wrap" | "stack"> id={`p-layout-${i}`} value={option.layout ?? "wrap"} onChange={(v) => setOption(i, { layout: v })} options={[{ value: "wrap", label: "In rows" }, { value: "stack", label: "Stacked" }]} />
                </div>
                <button type="button" aria-label="Remove attribute" onClick={() => withOptions(form.options.filter((_, j) => j !== i))} className={iconBtn}>
                  <TrashIcon />
                </button>
              </div>
              <ChipInput label={`Values of ${option.name || "the attribute"}`} values={option.values} onChange={(values) => setOption(i, { values })} />
            </div>
          ))}

          {errors.options && (
            <p role="alert" className="m-0 font-sans text-[13px] text-[#ff8a80]">
              {errors.options}
            </p>
          )}

          <div className="flex flex-wrap gap-[8px]">
            {PRESET_OPTIONS.map(({ label, option }) => (
              <button key={label} type="button" onClick={() => withOptions([...form.options, { ...option, values: [] }])} className="flex h-[36px] cursor-pointer items-center gap-[6px] rounded-full border border-white/[0.16] px-[14px] font-sans text-[14px] text-white transition-colors hover:border-white/40">
                <PlusIcon width={14} height={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-end justify-between gap-[16px] max-tablet:flex-col max-tablet:items-stretch">
            <div>
              <h3 className="m-0 font-display text-[15px] font-medium text-white">Combinations</h3>
              <p className="m-0 font-sans text-[13px] text-[#98a2b3]">
                {complete
                  ? "One price and one stock per combination of the attributes above. A combination with 0 units shows its button disabled in the store."
                  : "Add the attributes and their values above; the combinations are built from them."}
              </p>
            </div>
            {complete && (
              <button
                type="button"
                onClick={() => set("variants", rebuildVariants(form.options, form.variants, form.price))}
                className={`${btnGhost} h-[36px] px-[16px] text-[14px]`}
              >
                {hasVariants ? "Sync combinations" : `Generate ${combinationsCount} combination${combinationsCount === 1 ? "" : "s"}`}
              </button>
            )}
          </div>

          {hasVariants && (
            <div className="flex flex-col gap-[8px]">
              {/* Header of the list; on mobile every row carries its own labels instead. */}
              <div className="grid grid-cols-[1fr_120px_100px_34px] items-center gap-[10px] px-[14px] font-sans text-[12px] uppercase tracking-[0.04em] text-[#98a2b3] max-tablet:grid-cols-[1fr_84px_68px_30px] max-tablet:gap-[6px] max-tablet:px-[10px] max-tablet:text-[11px]">
                <span>Combination</span>
                <span>Price (USD)</span>
                <span>Stock</span>
                <span />
              </div>

              {form.variants.map((variant, i) => (
                <div key={variantKey(variant.options)} className="grid grid-cols-[1fr_120px_100px_34px] items-center gap-[10px] rounded-[12px] border border-white/[0.08] px-[14px] py-[10px] max-tablet:grid-cols-[1fr_84px_68px_30px] max-tablet:gap-[6px] max-tablet:px-[10px]">
                  <div className="min-w-0">
                    <p className="m-0 truncate font-sans text-[14px] text-white">{combinationLabel(variant.options)}</p>
                    {variant.stock === 0 && <p className="m-0 font-sans text-[12px] text-[#ff8a80]">Sold out</p>}
                    <input
                      aria-label={`SKU of ${combinationLabel(variant.options)}`}
                      value={variant.sku ?? ""}
                      onChange={(e) => setVariant(i, { sku: e.target.value })}
                      placeholder="SKU (optional)"
                      maxLength={60}
                      className="mt-[4px] h-[26px] w-full max-w-[200px] rounded-[6px] border border-white/[0.1] bg-transparent px-[8px] font-sans text-[12px] text-[#98a2b3] outline-none placeholder:text-[#98a2b3]/40 focus:border-white/30"
                    />
                  </div>
                  <input
                    aria-label={`Price of ${combinationLabel(variant.options)}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={Number.isNaN(variant.price) ? "" : variant.price}
                    onChange={(e) => setVariant(i, { price: e.target.value === "" ? NaN : Number(e.target.value) })}
                    className={`${inputCls} h-[38px] px-[10px] text-[14px]`}
                  />
                  <input
                    aria-label={`Stock of ${combinationLabel(variant.options)}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={Number.isNaN(variant.stock) ? "" : variant.stock}
                    onChange={(e) => setVariant(i, { stock: e.target.value === "" ? NaN : Number(e.target.value) })}
                    className={`${inputCls} h-[38px] px-[10px] text-[14px]`}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${combinationLabel(variant.options)}`}
                    onClick={() => set("variants", form.variants.filter((_, j) => j !== i))}
                    className={iconBtn}
                  >
                    <TrashIcon width={18} height={18} />
                  </button>
                </div>
              ))}

              <p className="m-0 font-sans text-[13px] text-[#98a2b3]">
                {form.variants.length} combination{form.variants.length === 1 ? "" : "s"} · from {fromPrice ? `$${fromPrice}` : "$0"} · {totalStock} units in total
              </p>
            </div>
          )}

          {errors.variants && (
            <p role="alert" className="m-0 font-sans text-[13px] text-[#ff8a80]">
              {errors.variants}
            </p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
