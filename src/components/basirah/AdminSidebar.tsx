"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const adminItems = [
  {
    title: "لوحة المدير",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "إدارة المستخدمين",
    href: "/admin/users",
    icon: UsersRound,
  },
  {
    title: "تقارير التحليلات",
    href: "/admin/reports",
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-50 hidden w-72 border-l border-[var(--border)] bg-white p-5 shadow-sm lg:flex lg:flex-col">
        <div className="rounded-[1.5rem] bg-[var(--primary)] p-5 text-white">
          <p className="text-xs font-black text-[#8be0dd]">مركز القيادة</p>
          <h2 className="mt-2 text-2xl font-black">لوحة مدير النظام</h2>
          <p className="mt-3 text-xs font-bold leading-6 text-white/80">
            إدارة الحسابات ومتابعة الإحصاءات العامة للمنصة.
          </p>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-black text-[var(--primary)]">
          <ShieldCheck size={18} />
          صلاحيات المدير العام
        </div>

        <nav className="mt-6 space-y-2">
          {adminItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                  active
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]",
                ].join(" ")}
              >
                <item.icon size={19} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={19} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto">
          {adminItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black",
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] text-[var(--primary)]",
                ].join(" ")}
              >
                <item.icon size={17} />
                {item.title}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700"
          >
            <LogOut size={17} />
            خروج
          </button>
        </div>
      </div>
    </>
  );
}
