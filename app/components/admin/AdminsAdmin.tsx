"use client";

import { useState } from "react";
import { createAdmin, deleteAdmin, MIN_PASSWORD, useAdminSession, useAdmins } from "../../lib/cms/admin-auth";
import type { AdminUser } from "../../lib/cms/types";
import { showToast } from "../../lib/toast";
import { TrashIcon } from "./AdminIcons";
import { AddButton, Badge, btnGhost, btnPrimary, type Column, ConfirmDialog, DataTable, Drawer, Field, iconBtn, inputCls, PageHeader } from "./ui";
import { formatDate, initials } from "./format";

/** Admins section: the people who can sign in to this CMS. Any admin can add another one or remove one. */
export default function AdminsAdmin() {
  const { data: admins, loading, error } = useAdmins();
  const me = useAdminSession();
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const nameOf = (admin: AdminUser) => (admin.createdBy === null ? "—" : (admin.createdByName ?? "Removed admin"));

  const columns: Column<AdminUser>[] = [
    {
      id: "name",
      header: "Admin",
      minWidth: 280,
      sort: (a) => a.name.toLowerCase(),
      cell: (a) => (
        <div className="flex items-center gap-[12px]">
          <span aria-hidden="true" className="grid size-[36px] shrink-0 place-items-center rounded-full bg-white/[0.1] font-display text-[13px] font-medium text-white">
            {initials(a.name)}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-[8px]">
              <span className="truncate font-medium text-white">{a.name}</span>
              {a.id === me?.id && <Badge>You</Badge>}
            </span>
            <span className="block truncate text-[13px] text-[#98a2b3]">{a.email}</span>
          </span>
        </div>
      ),
    },
    { id: "created", header: "Created", minWidth: 140, sort: (a) => a.createdAt, className: "whitespace-nowrap text-[#98a2b3]", cell: (a) => formatDate(a.createdAt) },
    { id: "by", header: "Created by", minWidth: 170, className: "text-[#98a2b3]", cell: nameOf },
    {
      id: "actions",
      header: "",
      minWidth: 70,
      cell: (a) => (
        <span className="flex justify-end">
          {a.id !== me?.id && (
            <button
              type="button"
              aria-label={`Delete ${a.name}`}
              onClick={() => {
                setDeleteError(null);
                setToDelete(a);
              }}
              className={iconBtn}
            >
              <TrashIcon width={18} height={18} />
            </button>
          )}
        </span>
      ),
    },
  ];

  async function confirmDelete() {
    if (!toDelete || !me) return;
    const refused = await deleteAdmin(toDelete.id);
    if (refused) return setDeleteError(refused);
    showToast(`${toDelete.name} removed`);
    setToDelete(null);
  }

  return (
    <>
      <PageHeader title="Admins" description={`${admins.length} admin${admins.length === 1 ? "" : "s"} can sign in to this CMS.`} action={<AddButton label="New admin" onClick={() => setCreating(true)} />} />

      <DataTable
        rows={admins}
        columns={columns}
        getId={(a) => a.id}
        defaultSort={{ id: "created", dir: "asc" }}
        loading={loading}
        error={error}
        caption="Admins"
        emptyTitle="No admins"
        emptyText="Sign in again to create the first one."
      />

      {creating && <NewAdminDrawer onClose={() => setCreating(false)} />}

      <ConfirmDialog
        open={toDelete !== null}
        title="Remove this admin?"
        message={deleteError ?? `${toDelete?.name ?? "They"} will not be able to sign in anymore. If they are signed in right now, they are signed out.`}
        confirmLabel="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

function NewAdminDrawer({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (saving) return;
    if (form.password !== form.confirm) return setErrors({ confirm: "The passwords do not match." });
    setSaving(true);
    const result = await createAdmin(form);
    setSaving(false);
    if (!result.ok) return setErrors({ [result.field]: result.error });
    showToast(`${result.admin.name} is now an admin`);
    onClose();
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="New admin"
      subtitle="They will sign in at /login-admin with this email and password"
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className={btnPrimary}>
            {saving ? "Creating…" : "Create admin"}
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
        <Field label="Name" htmlFor="a-name" error={errors.name}>
          <input id="a-name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" autoFocus className={inputCls} />
        </Field>
        <Field label="Email" htmlFor="a-email" error={errors.email}>
          <input id="a-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" className={inputCls} />
        </Field>
        <Field label="Password" htmlFor="a-password" error={errors.password} hint={`At least ${MIN_PASSWORD} characters. Share it with them safely; they should not reuse another one.`}>
          <input id="a-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" className={inputCls} />
        </Field>
        <Field label="Repeat password" htmlFor="a-confirm" error={errors.confirm}>
          <input id="a-confirm" type={showPassword ? "text" : "password"} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} autoComplete="new-password" className={inputCls} />
        </Field>
        <label className="flex cursor-pointer items-center gap-[10px] font-sans text-[14px] text-[#98a2b3]">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="size-[16px] cursor-pointer accent-white" />
          Show passwords
        </label>
        {/* Enter submits from any field, since the footer button lives outside the form. */}
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}
