import Link from "next/link";
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Send,
  Settings,
  Target,
} from "lucide-react";

const primaryCards = [
  {
    title: "إدخال نتائج الطلاب",
    desc: "أدخل النتائج عبر ملف Excel أو الإدخال اليدوي، ثم حوّل الدرجات إلى مؤشرات إتقان وتشخيص تربوي واضح.",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
    action: "ابدأ التحليل",
  },
  {
    title: "تحليل نافس",
    desc: "خدمة مستقلة لتحليل تدريبات نواتج التعلم المستهدفة في نافس، مع تقارير تفصيلية وتوصيات تربوية.",
    href: "/dashboard/analysis/nafs",
    icon: BarChart3,
    action: "فتح نافس",
  },
  {
    title: "التقارير ومشاركة واتساب",
    desc: "استعرض التحليلات المحفوظة، وافتح التقرير، وشاركه مع المعلم أو الموجه الطلابي عبر واتساب.",
    href: "/dashboard/reports",
    icon: Send,
    action: "عرض التقارير",
  },
];

const secondaryCards = [
  {
    title: "الخطط العلاجية",
    desc: "مساحة تنظيمية لبناء خطط الدعم والتحسين في ضوء نتائج التحليل.",
    href: "/dashboard/remedial",
    icon: Target,
  },
  {
    title: "الاختبارات والتدريبات",
    desc: "تنظيم الاختبارات والتدريبات التي تُبنى عليها التحليلات.",
    href: "/dashboard/assessments",
    icon: ClipboardCheck,
  },
  {
    title: "الإعدادات",
    desc: "إعدادات المدرسة والحساب والبيانات الأساسية للمنصة.",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-white via-teal-50/60 to-white p-6 shadow-sm md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p className="text-sm font-black text-teal-700">لوحة المستخدم</p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
              بصيرة لتحليل نتائج التعلم والاختبارات
            </h1>

            <p className="mt-4 max-w-4xl text-sm font-bold leading-8 text-slate-600 md:text-base">
              منصة تربوية ذكية تساعد المعلمين والمرشدين ومديري المدارس على تحويل نتائج الطلاب إلى مؤشرات إتقان، وتشخيص مهاري، وتقارير تربوية، وتوصيات عملية تدعم تحسين تعلم الطلاب.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/analysis/upload"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-800"
              >
                <FileSpreadsheet size={18} />
                ابدأ بإدخال النتائج
              </Link>

              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <FileText size={18} />
                التقارير المحفوظة
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-black text-teal-300">منصة بصيرة</p>

            <h2 className="mt-3 text-2xl font-black leading-9">
              من البيانات إلى فهم أعمق وقرارات أفضل
            </h2>

            <p className="mt-3 text-sm font-bold leading-7 text-slate-200">
              ابدأ بتحليل النتائج، ثم راجع التقرير وشاركه مع أصحاب العلاقة لدعم القرار التعليمي.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {primaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
            >
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Icon size={25} />
              </div>

              <h3 className="text-xl font-black text-slate-950">{card.title}</h3>

              <p className="mt-3 min-h-[72px] text-sm font-bold leading-7 text-slate-600">
                {card.desc}
              </p>

              <p className="mt-5 text-sm font-black text-teal-700">
                {card.action}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-teal-700">خدمات مساندة</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              أدوات تنظيمية داخل بصيرة
            </h2>
          </div>

          <GraduationCap className="text-teal-700" size={30} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {secondaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white text-teal-700">
                  <Icon size={22} />
                </div>

                <h3 className="font-black text-slate-950">{card.title}</h3>

                <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
