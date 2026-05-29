import Link from "next/link";
import { FileSpreadsheet, FileText, Target, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "رفع نتائج الطلاب",
    desc: "ارفع ملف Excel أو CSV، ثم دع بصيرة تحول الدرجات إلى مؤشرات إتقان وتشخيص مهاري واضح.",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
  },
  {
    title: "التقارير التربوية",
    desc: "تقارير رسمية مرتبة تتضمن مؤشرات الإتقان، الرسوم البيانية، النتائج التفصيلية، والتوصيات العلاجية.",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "الخطط العلاجية",
    desc: "حوّل نتائج التحليل إلى إجراءات دعم ومتابعة قابلة للتنفيذ داخل الصف والمدرسة.",
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
          بصيرة لتحليل نتائج التعلم والاختبارات
        </h1>

        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-slate-600">
          منصة تربوية ذكية تساعد المعلمين والمرشدين على تحويل نتائج الاختبارات
          والتدريب إلى مؤشرات إتقان، وتشخيص مهاري، وتقارير رسمية، وتوصيات عملية
          تدعم تحسين تعلم الطلاب.
        </p>

        <div className="mt-6">
          <Link
            href="/dashboard/analysis/upload"
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

        <h2 className="mt-2 text-2xl font-black">
          من الدرجة إلى القرار التربوي
        </h2>

        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-slate-300">
          لا تكتفي بصيرة بعرض الأرقام، بل تساعد على تفسير مستوى الإتقان، وتحديد
          مجالات التحسين، وترتيب أولويات المتابعة، وبناء تدخلات علاجية قابلة
          للقياس والمتابعة.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/10">
          <TrendingUp size={18} />
          قياس أثر التدريب قبليًا وبعديًا
        </div>
      </section>
    </div>
  );
}
