"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  Settings,
  Target,
} from "lucide-react";

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  status: "ready" | "development";
};

const navigationItems: NavigationItem[] = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: Home,
    status: "ready",
  },
  {
    title: "رفع النتائج",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
    status: "ready",
  },
  {
    title: "تحليل نافس",
    href: "/dashboard/analysis/nafs",
    icon: BarChart3,
    status: "ready",
  },
  {
    title: "تحليل القدرات",
    href: "/dashboard/analysis/qudrat",
    icon: LineChart,
    status: "development",
  },
  {
    title: "تحليل التحصيلي",
    href: "/dashboard/analysis/tahsili",
    icon: GraduationCap,
    status: "development",
  },
  {
    title: "الاختبارات والتدريبات",
    href: "/dashboard/assessments",
    icon: ClipboardCheck,
    status: "development",
  },
  {
    title: "الخطط العلاجية",
    href: "/dashboard/remedial",
    icon: Target,
    status: "development",
  },
  {
    title: "التقارير",
    href: "/dashboard/reports",
    icon: FileText,
    status: "ready",
  },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    status: "ready",
  },
];

export function BasirahSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[280px] shrink-0 overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm xl:block">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-center text-white">
        <p className="text-xs font-black text-teal-300">منصة بصيرة</p>

        <h2 className="mt-2 text-2xl font-black">
          تحليل نتائج الطلاب
        </h2>

        <p className="mt-3 text-xs font-bold leading-6 text-slate-200">
          تحويل نتائج الطلاب إلى مؤشرات إتقان وتشخيص تربوي وتوصيات قابلة للتنفيذ.
        </p>
      </div>

      <nav className="mt-5 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isDevelopment = item.status === "development";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
                isActive
                  ? "border border-teal-200 bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                isDevelopment ? "opacity-85" : "",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.title}
              </span>

              {isDevelopment && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 ring-1 ring-amber-200">
                  تحت التطوير
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
