"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  FileSpreadsheet,
  BarChart3,
  GraduationCap,
  LineChart,
  ClipboardCheck,
  UsersRound,
  Target,
  FileText,
  Settings,
} from "lucide-react";

const items = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },

  {
    title: "رفع النتائج",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
  },

  {
    title: "تحليل نافس",
    href: "/dashboard/analysis/nafs",
    icon: BarChart3,
  },

  {
    title: "تحليل القدرات",
    href: "/dashboard/analysis/qudrat",
    icon: LineChart,
  },

  {
    title: "تحليل التحصيلي",
    href: "/dashboard/analysis/tahsili",
    icon: GraduationCap,
  },

  {
    title: "التقارير",
    href: "/dashboard/reports",
    icon: FileText,
  },

  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function BasirahSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:block">
      <div className="mb-6 rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="text-xs font-black text-teal-300">
          منصة بصيرة
        </p>

        <h2 className="mt-1 text-2xl font-black">
          تحليل نتائج الطلاب
        </h2>

        <p className="mt-2 text-xs font-bold leading-6 text-slate-300">
          تحويل نتائج الطلاب إلى مؤشرات إتقان وتشخيص تربوي وتوصيات تعليمية قابلة للتنفيذ.
          وإنتاج تقارير تربوية احترافية.
        </p>
      </div>

      <nav className="space-y-1">
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
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                active
                  ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              ].join(" ")}
            >
              <item.icon size={18} />

              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
