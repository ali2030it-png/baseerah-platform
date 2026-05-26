"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, ShieldCheck, UsersRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { statusLabel } from "@/lib/auth/roles";

type Profile = {
  id: string;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

type AnalysisRecord = {
  id: string;
  analysis_type: string | null;
  subject: string | null;
  improvement_rate: number | null;
  created_at: string | null;
};

export default function SuperAdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const [profilesResult, recordsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,role,status,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("analysis_records")
        .select("id,analysis_type,subject,improvement_rate,created_at")
        .order("created_at", { ascending: false }),
    ]);

    setLoading(false);

    if (profilesResult.error) {
      setError(profilesResult.error.message);
      return;
    }

    if (recordsResult.error) {
      setError(recordsResult.error.message);
      return;
    }

    setProfiles(profilesResult.data || []);
    setRecords(recordsResult.data || []);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = profiles.filter((item) => item.status === "active").length;
    const pendingUsers = profiles.filter((item) => item.status === "pending").length;
    const suspendedUsers = profiles.filter((item) => item.status === "suspended").length;

    const subjects = new Set(
      records
        .map((item) => item.subject?.trim())
        .filter(Boolean)
    );

    const impactRecords = records.filter((item) => item.analysis_type === "impact");

    const improvementValues = impactRecords
      .map((item) => Number(item.improvement_rate))
      .filter((value) => Number.isFinite(value));

    const averageImprovement =
      improvementValues.length > 0
        ? Math.round(
            (improvementValues.reduce((sum, value) => sum + value, 0) /
              improvementValues.length) *
              100
          ) / 100
        : 0;

    return {
      totalUsers: profiles.length,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalAnalyses: records.length,
      subjectsCount: subjects.size,
      impactCount: impactRecords.length,
      averageImprovement,
    };
  }, [profiles, records]);

  const topSubjects = useMemo(() => {
    const counter = new Map<string, number>();

    records.forEach((record) => {
      const subject = record.subject?.trim() || "غير محدد";
      counter.set(subject, (counter.get(subject) || 0) + 1);
    });

    return Array.from(counter.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [records]);

  const analysisTypes = useMemo(() => {
    const labels: Record<string, string> = {
      diagnostic: "تشخيصي",
      formative: "تكويني",
      summative: "ختامي",
      period_end: "نهاية فترة",
      term_end: "نهاية فصل",
      year_end: "نهاية عام",
      learning_outcome: "ناتج تعلم",
      nafs: "نافس",
      qudrat: "قدرات",
      tahsili: "تحصيلي",
      impact: "قياس أثر",
    };

    const counter = new Map<string, number>();

    records.forEach((record) => {
      const type = record.analysis_type || "غير محدد";
      counter.set(type, (counter.get(type) || 0) + 1);
    });

    return Array.from(counter.entries())
      .map(([type, count]) => ({
        type,
        label: labels[type] || type,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [records]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-teal-700">
                مركز القيادة
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                لوحة مدير النظام
              </h1>

              <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
                متابعة المستخدمين، الحسابات، التحليلات، المواد الأكثر استخدامًا، ومؤشرات قياس الأثر.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
              <ShieldCheck size={18} />
              صلاحيات المدير العام
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<UsersRound size={22} />}
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            subtitle="جميع الحسابات المسجلة"
          />

          <MetricCard
            icon={<ShieldCheck size={22} />}
            title="الحسابات المفعّلة"
            value={stats.activeUsers}
            subtitle={`${stats.pendingUsers} قيد المراجعة، ${stats.suspendedUsers} معطّل`}
          />

          <MetricCard
            icon={<FileText size={22} />}
            title="إجمالي التحليلات"
            value={stats.totalAnalyses}
            subtitle="كل عمليات التحليل المسجلة"
          />

          <MetricCard
            icon={<BarChart3 size={22} />}
            title="متوسط التحسن"
            value={`${stats.averageImprovement}%`}
            subtitle={`${stats.impactCount} تحليل قياس أثر`}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel title="المواد الأكثر تحليلًا">
            {loading ? (
              <Empty text="جارٍ تحميل البيانات..." />
            ) : topSubjects.length > 0 ? (
              <div className="space-y-3">
                {topSubjects.map((item) => (
                  <RowCard key={item.subject} title={item.subject} value={item.count} />
                ))}
              </div>
            ) : (
              <Empty text="لا توجد تحليلات محفوظة حتى الآن." />
            )}
          </Panel>

          <Panel title="أنواع التحليل الأكثر استخدامًا">
            {loading ? (
              <Empty text="جارٍ تحميل البيانات..." />
            ) : analysisTypes.length > 0 ? (
              <div className="space-y-3">
                {analysisTypes.map((item) => (
                  <RowCard key={item.type} title={item.label} value={item.count} />
                ))}
              </div>
            ) : (
              <Empty text="لا توجد تحليلات محفوظة حتى الآن." />
            )}
          </Panel>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            حالة الحسابات
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["pending", "active", "suspended", "rejected"].map((status) => (
              <div
                key={status}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-black text-slate-500">
                  {statusLabel(status)}
                </p>

                <p className="mt-2 text-3xl font-black text-teal-700">
                  {profiles.filter((profile) => profile.status === status).length}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>

      <p className="text-xs font-black text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black text-teal-700">
        {value}
      </h2>

      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

function RowCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="font-black text-slate-800">
        {title}
      </span>

      <span className="text-2xl font-black text-teal-700">
        {value}
      </span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-sm font-black text-slate-400">
      {text}
    </div>
  );
}
