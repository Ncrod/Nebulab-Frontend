"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOutAdmin, useAdminSession } from "../../lib/cms/admin-auth";
import { BoxIcon, ChevronDownIcon, DashboardIcon, LogOutIcon, MenuIcon, ReceiptIcon, ShieldIcon, StoreIcon, TagIcon, UsersIcon } from "./AdminIcons";
import { Dropdown, iconBtn } from "./ui";
import { initials } from "./format";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Products", href: "/admin/products", icon: BoxIcon },
  { label: "Categories", href: "/admin/categories", icon: TagIcon },
  { label: "Customers", href: "/admin/customers", icon: UsersIcon },
  { label: "Sales", href: "/admin/orders", icon: ReceiptIcon },
  { label: "Admins", href: "/admin/admins", icon: ShieldIcon },
];

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

/**
 * The CMS frame: sidebar, top bar and the scrolling content area. It covers the whole screen (above the shop's side
 * nav) and only opens with an admin session; without one it sends you to /login-admin.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session === null) router.replace("/login-admin");
  }, [session, router]);

  // While the session is unknown (server, hydration) or missing, only the dark backdrop shows: no flash of CMS content.
  if (!session) return <div className="fixed inset-0 z-50 bg-[#090909]" />;

  const current = NAV.find((item) => isActive(pathname, item.href));

  function signOut() {
    void signOutAdmin();
    router.replace("/login-admin");
  }

  const sidebar = (
    <div className="flex h-full w-[280px] flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
      <div className="flex h-[60px] shrink-0 items-center border-b border-white/[0.06] px-[10px]">
        <Dropdown
          label="CMS menu"
          className="flex h-[38px] items-center gap-[8px] rounded-[10px] bg-white/[0.06] px-[10px] font-display text-[16px] font-medium text-white transition-colors hover:bg-white/[0.1]"
          items={[
            { label: "View store", icon: <StoreIcon width={16} height={16} />, onSelect: () => window.open("/", "_blank") },
            { label: "Sign out", icon: <LogOutIcon width={16} height={16} />, onSelect: signOut, danger: true },
          ]}
        >
          <Image src="/svg/logologinn.svg" alt="" width={22} height={22} />
          CMS
          <ChevronDownIcon width={14} height={14} className="opacity-60" />
        </Dropdown>
      </div>

      <nav aria-label="CMS sections" className="flex flex-1 flex-col gap-[10px] p-[10px]">
        {NAV.map(({ label, href, icon: NavIcon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`flex h-[50px] items-center gap-[14px] rounded-[12px] px-[16px] font-display text-[18px] font-medium transition-colors ${
                active ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <NavIcon width={22} height={22} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-[12px] border-t border-white/[0.06] p-[14px]">
        <span aria-hidden="true" className="grid size-[38px] shrink-0 place-items-center rounded-full bg-white font-display text-[14px] font-medium text-[#050505]">
          {initials(session.name)}
        </span>
        <div className="min-w-0 flex-1 font-sans">
          <p className="m-0 truncate text-[14px] font-medium text-white">{session.name}</p>
          <p className="m-0 truncate text-[13px] text-[#98a2b3]">{session.email}</p>
        </div>
        <button type="button" onClick={signOut} aria-label="Sign out" className={iconBtn}>
          <LogOutIcon />
        </button>
      </div>
    </div>
  );

  return (
    // data-lenis-prevent: the CMS scrolls inside its own boxes, not with the site's smooth scroll.
    <div data-lenis-prevent className="fixed inset-0 z-50 flex bg-[#090909] font-sans text-white">
      <div className="max-notebook:hidden">{sidebar}</div>

      {menuOpen && (
        <div className="fixed inset-0 z-[56] notebook:hidden">
          <div onClick={() => setMenuOpen(false)} aria-hidden="true" className="absolute inset-0 bg-black/60" />
          <div className="relative h-full w-[280px] transition-transform duration-200 starting:-translate-x-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center gap-[12px] border-b border-white/[0.06] bg-[#0d0d0d] px-[20px] max-tablet:px-[12px]">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={`${iconBtn} notebook:hidden`}>
            <MenuIcon />
          </button>
          <p className="m-0 font-display text-[18px] font-medium text-white">{current?.label ?? "CMS"}</p>
          <Link href="/" target="_blank" className="ml-auto flex items-center gap-[8px] rounded-[10px] px-[10px] py-[8px] font-display text-[14px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white">
            <StoreIcon width={16} height={16} />
            <span className="max-tablet:hidden">View store</span>
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-[24px] p-[24px] max-tablet:p-[16px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
