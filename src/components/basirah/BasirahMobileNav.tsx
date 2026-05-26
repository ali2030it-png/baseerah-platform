"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  FileSpreadsheet,
  BarChart3,
  FileText,
  UserRound,
} from "lucide-react";

const items = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },

  {
    title: "رفع",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
  },

  {
    title: "تحليل",
    href: "/dashboard/analysis/nafs",
    icon: BarChart3,
  },

  {
    title: "تقارير",
    href: "/dashboard/reports",
    icon: FileText,
  },

  {
    title: "حسابي",
    href: "/dashboard/settings",
    icon: UserRound,
  },
];

export function BasirahMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-500",
              ].join(" ")}
            >
              <item.icon size={18} />

              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


