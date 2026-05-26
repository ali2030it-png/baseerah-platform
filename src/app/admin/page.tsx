import { DashboardMetricCard } from "@/components/admin/DashboardMetricCard";

import {
  buildSuperAdminMetrics,
} from "@/lib/dashboard/super-admin-metrics";

export default function SuperAdminDashboardPage() {
  const metrics = buildSuperAdminMetrics({
    users: 128,
    schools: 12,
    regions: 3,
    analyses: 542,
    mastery: 78,
    atRisk: 34,
  });

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">
          مركز القيادة
        </p>

        <h1 className="mt-2 text-3xl font-black">
          لوحة المدير العام
        </h1>

        <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-slate-600">
          مؤشرات وتحليلات شاملة لمنصة بصيرة تشمل المدارس والمناطق والتحصيل والتعثر والاختبارات الوطنية.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard
            key={metric.title}
            metric={metric}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            المدارس الحرجة
          </h2>

          <div className="mt-5 space-y-3">
            <CriticalSchool
              school="مدرسة حاكمة الدغارير"
              mastery={54}
            />

            <CriticalSchool
              school="مدرسة الأمير سلطان"
              mastery={58}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            أفضل المدارس أداءً
          </h2>

          <div className="mt-5 space-y-3">
            <TopSchool
              school="مدرسة الريادة"
              mastery={94}
            />

            <TopSchool
              school="مدرسة التميز"
              mastery={91}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function CriticalSchool({
  school,
  mastery,
}: {
  school: string;
  mastery: number;
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black">
            {school}
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-600">
            تحتاج إلى تدخل عاجل
          </p>
        </div>

        <div className="text-2xl font-black text-rose-700">
          {mastery}%
        </div>
      </div>
    </div>
  );
}

function TopSchool({
  school,
  mastery,
}: {
  school: string;
  mastery: number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black">
            {school}
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-600">
            أداء مرتفع
          </p>
        </div>

        <div className="text-2xl font-black text-emerald-700">
          {mastery}%
        </div>
      </div>
    </div>
  );
}
