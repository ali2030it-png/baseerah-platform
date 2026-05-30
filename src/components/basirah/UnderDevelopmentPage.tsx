import Link from "next/link";
import { Construction, Home, Sparkles } from "lucide-react";

export function UnderDevelopmentPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50/60 to-white p-8 shadow-sm">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">
          <Construction size={16} />
          تحت التطوير
        </div>

        <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-sm font-bold leading-8 text-slate-600 md:text-base">
          {description}
        </p>

        <p className="mx-auto mt-3 max-w-3xl text-sm font-bold leading-8 text-slate-500">
          نعمل على تجهيز هذه الخدمة لتكون متاحة قريبًا داخل منصة بصيرة.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Home size={18} />
            العودة للرئيسية
          </Link>

          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles size={18} />
            عرض التقارير الجاهزة
          </Link>
        </div>
      </div>
    </section>
  );
}
