"use client";

import { useMemo, useState } from "react";
import { ApiError, errorMessage } from "../../lib/api";
import { deleteCategories, emptyCategory, isCategoryNameTaken, saveCategory, useCategories, type AdminCategory, type CategoryInput } from "../../lib/cms/categories";
import { showToast } from "../../lib/toast";
import { EditIcon, TrashIcon } from "./AdminIcons";
import { AddButton, Badge, btnDanger, btnGhost, btnPrimary, type Column, ConfirmDialog, DataTable, Drawer, Field, iconBtn, inputCls, PageHeader, SearchBox } from "./ui";

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Categories section: every category of the catalog in a table, with create, edit and delete. */
export default function CategoriesAdmin() {
  const { data: categories, loading, error } = useCategories();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return categories.filter((c) => words.every((word) => normalize(`${c.name} ${c.slug}`).includes(word)));
  }, [categories, query]);

  const columns: Column<AdminCategory>[] = [
    { id: "name", header: "Name", minWidth: 220, sort: (c) => c.name.toLowerCase(), cell: (c) => <span className="font-medium text-white">{c.name}</span> },
    { id: "slug", header: "Slug", minWidth: 200, sort: (c) => c.slug, className: "text-[#98a2b3]", cell: (c) => c.slug },
    { id: "products", header: "Products", minWidth: 110, align: "right", sort: (c) => c.productsCount, cell: (c) => <Badge>{c.productsCount}</Badge> },
    {
      id: "actions",
      header: "",
      minWidth: 90,
      cell: (c) => (
        <span className="flex justify-end gap-[2px]" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)} className={iconBtn}>
            <EditIcon width={18} height={18} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${c.name}`}
            disabled={c.productsCount > 0}
            title={c.productsCount > 0 ? "Move its products to another category or delete them first." : undefined}
            onClick={() => setToDelete(c)}
            className={`${iconBtn} disabled:cursor-not-allowed disabled:opacity-30`}
          >
            <TrashIcon width={18} height={18} />
          </button>
        </span>
      ),
    },
  ];

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategories([toDelete.id]);
      showToast(`${toDelete.name} deleted`);
      setToDelete(null);
      setEditing(null);
    } catch (failure) {
      showToast(errorMessage(failure));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Categories" description={`${categories.length} categories`} action={<AddButton label="New category" onClick={() => setEditing("new")} />} />

      <SearchBox value={query} onChange={setQuery} placeholder="Search by name or slug" />

      <DataTable
        rows={rows}
        columns={columns}
        getId={(c) => c.id}
        onRowClick={setEditing}
        defaultSort={{ id: "name", dir: "asc" }}
        resetKey={query}
        loading={loading}
        error={error}
        caption="Categories"
        emptyTitle="No categories found"
        emptyText={categories.length === 0 ? "Create the first category of the store." : "Try another word."}
      />

      {editing && <CategoryEditor key={editing === "new" ? "new" : editing.id} category={editing === "new" ? null : editing} onClose={() => setEditing(null)} onDelete={(c) => setToDelete(c)} />}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this category?"
        message="It disappears from the store and from the CMS. This only works while it has no products."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

/** Create/edit form of a category, in a drawer. */
function CategoryEditor({ category, onClose, onDelete }: { category: AdminCategory | null; onClose: () => void; onDelete: (category: AdminCategory) => void }) {
  const { data: categories } = useCategories();
  const [form, setForm] = useState<CategoryInput>(() => (category ? { name: category.name, slug: category.slug } : emptyCategory()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (saving) return;
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "The category needs a name.";
    else if (isCategoryNameTaken(categories, form.name, category?.id)) next.name = "Another category already uses this name.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const saved = await saveCategory(form, category?.id);
      showToast(category ? `${saved.name} updated` : `${saved.name} created`);
      onClose();
    } catch (failure) {
      const fields = failure instanceof ApiError ? failure.fields : {};
      setErrors(fields.name || fields.slug ? fields : { name: errorMessage(failure) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={category ? "Edit category" : "New category"}
      subtitle={category ? `${category.productsCount} product${category.productsCount === 1 ? "" : "s"}` : "It shows in the store once created"}
      footer={
        <>
          {category && (
            <button type="button" disabled={category.productsCount > 0} onClick={() => onDelete(category)} className={`${btnDanger} mr-auto disabled:cursor-not-allowed disabled:opacity-40`}>
              <TrashIcon width={18} height={18} />
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className={btnPrimary}>
            {category ? "Save changes" : "Create category"}
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
        <Field label="Name" htmlFor="cat-name" error={errors.name}>
          <input id="cat-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Apple TV" className={inputCls} autoFocus />
        </Field>

        <Field label="Slug" htmlFor="cat-slug" error={errors.slug} hint="Leave empty to generate it from the name.">
          <input id="cat-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="apple-tv" className={inputCls} />
        </Field>
      </form>
    </Drawer>
  );
}
