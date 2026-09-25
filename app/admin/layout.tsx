import type { Metadata } from "next";
import AdminShell from "../components/admin/AdminShell";

export const metadata: Metadata = {
  title: "CMS | Nebulab",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
