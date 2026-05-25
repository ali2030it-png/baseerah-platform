import Link from "next/link";
import { FileSpreadsheet, FileText, Target, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "رفع نتائج التدريب",
    desc: "ارفع ملف Excel أو CSV لبدء تحليل نافس أو القدرات أو التحصيلي.",
    href: "/dashboard/analysis",
    icon: FileSpreadsheet,
  },
  {
    title: "التقارير التربوية",
    desc: "تقارير مرتبة تحوي تحليلًا تربويًا ورسومًا بيانية وتوصيات علاجية.",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "الخطط العلاجية",
    desc: "حوّل نتائج التحليل إلى تدخلات عملية قابلة للمتابعة.",
    href: "/dashboard/remedial",
    icon: Target,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-l from-teal-50 via-white to-slate-50 p-6 ring-1 ring-slate-100">
        <p className="text-sm font-black text-teal-700">لوحة المستخدم</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">
          بصيرة لتحليل نتائج التدريب والاختبارات
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-slate-600">
          منصة مركزة للمعلمين والمرشدين الطلابيين لتحليل نتائج نافس، القدرات،
          التحصيلي، واختبارات نهاية العام، مع تقارير تربوية احترافية.
        </p>

        <div className="mt-6">
          <Link
            href="/dashboard/analysis"
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800"
          >
            <FileSpreadsheet size={18} />
            ابدأ برفع النتائج
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-200"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
              <card.icon size={22} />
            </div>
            <h2 className="text-xl font-black">{card.title}</h2>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
              {card.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white">
        <p className="text-sm font-black text-teal-300">فلسفة بصيرة</p>
        <h2 className="mt-2 text-2xl font-black">من الدرجة إلى القرار التربوي</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-slate-300">
          لا تكتفي بصيرة بعرض الأرقام، بل تفسر مستوى الإتقان، تكشف المهارات
          الحرجة، تقيس أثر التدريب، وتقترح تدخلات علاجية مبنية على أسس القياس
          والتقويم.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/10">
          <TrendingUp size={18} />
          قياس أثر التدريب قبليًا وبعديًا
        </div>
      </section>
    </div>
  );
}
