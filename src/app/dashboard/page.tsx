import Link from "next/link";
import {
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Settings,
  Target,
} from "lucide-react";

const primaryCards = [
  {
    title: "إدخال نتائج الطلاب",
    desc: "ابدأ بإدخال النتائج أو رفع ملف Excel لتحويل الدرجات إلى مؤشرات واضحة قابلة للتحليل.",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
    action: "ابدأ التحليل",
    iconStyle: "bg-[var(--accent-soft)] text-[var(--accent)]",
  },
  {
    title: "تحليل نافس",
    desc: "حلل نواتج التعلم المستهدفة واستخرج مؤشرات الإتقان والتشخيص والتوصيات التربوية.",
    href: "/dashboard/analysis/nafs",
    icon: BarChart3,
    action: "فتح تحليل نافس",
    iconStyle: "bg-blue-50 text-[var(--analytics)]",
  },
  {
    title: "التقارير",
    desc: "استعرض التحليلات المحفوظة وافتح التقارير وشارك النتائج مع أصحاب العلاقة.",
    href: "/dashboard/reports",
    icon: FileText,
    action: "عرض التقارير",
    iconStyle: "bg-emerald-50 text-[var(--success)]",
  },
];

const secondaryCards = [
  {
    title: "الخطط العلاجية",
    desc: "بناء خطط الدعم والتحسين في ضوء نتائج التحليل.",
    href: "/dashboard/remedial",
    icon: Target,
    development: true,
  },
  {
    title: "الاختبارات والتدريبات",
    desc: "تنظيم الاختبارات والتدريبات المرتبطة بنواتج التعلم.",
    href: "/dashboard/assessments",
    icon: ClipboardCheck,
    development: true,
  },
  {
    title: "الإعدادات",
    desc: "إدارة بيانات الحساب والمدرسة وإعدادات المنصة.",
    href: "/dashboard/settings",
    icon: Settings,
    development: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_310px]">
          <div className="flex flex-col justify-center p-7 md:p-9">
            <p className="text-sm font-black text-[var(--accent)]">
              لوحة بصيرة
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.4] text-[var(--primary)] md:text-4xl">
              من النتائج إلى قرار تعليمي أوضح
            </h1>

            <p className="mt-4 max-w-3xl text-sm font-bold leading-8 text-[var(--muted)] md:text-base">
              حلل نتائج الطلاب واقرأ مؤشرات الإتقان وحدد جوانب التحسين من خلال مسار واضح ومترابط.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard/analysis/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--primary-hover)]"
              >
                <FileSpreadsheet size={18} />
                إدخال النتائج
              </Link>

              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--primary)] transition hover:bg-[var(--primary-soft)]"
              >
                <FileText size={18} />
                التقارير المحفوظة
              </Link>
            </div>
          </div>

          <div className="bg-[var(--primary)] p-7 text-white md:p-8">
            <p className="text-xs font-black text-[#8be0dd]">
              مسار العمل
            </p>

            <h2 className="mt-2 text-xl font-black">
              رحلة التحليل في بصيرة
            </h2>

            <div className="mt-6 space-y-4">
              <JourneyStep number="01" title="إدخال النتائج" />
              <JourneyStep number="02" title="تحليل المؤشرات" />
              <JourneyStep number="03" title="قراءة التشخيص" />
              <JourneyStep number="04" title="التقارير والمتابعة" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-black text-[var(--accent)]">
            الخدمات الأساسية
          </p>

          <h2 className="mt-1 text-2xl font-black text-[var(--primary)]">
            ابدأ من هنا
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {primaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group flex min-h-[230px] flex-col rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#b9d7df] hover:shadow-md"
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${card.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-xl font-black text-[var(--primary)]">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm font-bold leading-7 text-[var(--muted)]">
                  {card.desc}
                </p>

                <p className="mt-auto pt-5 text-sm font-black text-[var(--accent)]">
                  {card.action}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-black text-[var(--accent)]">
            خدمات إضافية
          </p>

          <h2 className="mt-1 text-xl font-black text-[var(--primary)]">
            أدوات تدعم رحلة العمل
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {secondaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--primary)]">
                    <Icon size={20} />
                  </div>

                  {card.development && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                      قريبًا
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-black text-[var(--primary)]">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
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

function JourneyStep({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-black text-[#8be0dd]">
        {number}
      </span>

      <span className="text-sm font-black text-white/90">
        {title}
      </span>
    </div>
  );
}
