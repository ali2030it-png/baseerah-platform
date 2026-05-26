"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, Search, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type AnalysisRecord = {
  id: string;
  user_id: string;
  analysis_type: string | null;
  subject: string | null;
  assessment_purpose: string | null;
  assessment_timing: string | null;
  students_count: number | null;
  skills_count: number | null;
  overall_mastery: number | null;
  pre_average: number | null;
  post_average: number | null;
  improvement_points: number | null;
  improvement_rate: number | null;
  report_title: string | null;
  created_at: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

const analysisTypeLabels: Record<string, string> = {
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

export default function AdminReportsPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  async function loadReports() {
    setLoading(true);
    setError("");

    const [recordsResult, profilesResult] = await Promise.all([
      supabase
        .from("analysis_records")
        .select(
          "id,user_id,analysis_type,subject,assessment_purpose,assessment_timing,students_count,skills_count,overall_mastery,pre_average,post_average,improvement_points,improvement_rate,report_title,created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id,full_name,email"),
    ]);

    setLoading(false);

    if (recordsResult.error) {
      setError(recordsResult.error.message);
      return;
    }

    if (profilesResult.error) {
      setError(profilesResult.error.message);
      return;
    }

    setRecords(recordsResult.data || []);
    setProfiles(profilesResult.data || []);
  }

  useEffect(() => {
    loadReports();
  }, []);

  const profileMap = useMemo(() => {
    const map = new Map<string, Profile>();

    profiles.forEach((profile) => {
      map.set(profile.id, profile);
    });

    return map;
  }, [profiles]);

  const filteredRecords = useMemo(() => {
    const text = query.trim().toLowerCase();

    return records.filter((record) => {
      const profile = profileMap.get(record.user_id);

      const matchesType =
        typeFilter === "all" || record.analysis_type === typeFilter;

      const matchesText =
        !text ||
        [
          record.report_title,
          record.subject,
          record.assessment_purpose,
          record.assessment_timing,
          getAnalysisTypeLabel(record.analysis_type),
          profile?.full_name,
          profile?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);

      return matchesType && matchesText;
    });
  }, [records, profileMap, query, typeFilter]);

  const stats = useMemo(() => {
    const impactRecords = records.filter(
      (record) => record.analysis_type === "impact"
    );

    const improvementValues = impactRecords
      .map((record) => Number(record.improvement_rate))
      .filter((value) => Number.isFinite(value));

    const averageImprovement =
      improvementValues.length > 0
        ? round(
            improvementValues.reduce((sum, value) => sum + value, 0) /
              improvementValues.length
          )
        : 0;

    const subjects = new Set(
      records.map((record) => record.subject?.trim()).filter(Boolean)
    );

    const masteryValues = records
      .map((record) => Number(record.overall_mastery))
      .filter((value) => Number.isFinite(value));

    const averageMastery =
      masteryValues.length > 0
        ? round(
            masteryValues.reduce((sum, value) => sum + value, 0) /
              masteryValues.length
          )
        : 0;

    return {
      totalReports: records.length,
      subjectsCount: subjects.size,
      impactCount: impactRecords.length,
      averageImprovement,
      averageMastery,
    };
  }, [records]);

  const availableTypes = useMemo(() => {
    const types = Array.from(
      new Set(records.map((record) => record.analysis_type).filter(Boolean))
    ) as string[];

    return types.sort();
  }, [records]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black text-teal-700">
            تقارير المدير العام
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            تقارير التحليلات العامة
          </h1>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
            متابعة جميع عمليات التحليل المنفذة في المنصة، مع عرض المادة، نوع التحليل، متوسط الإتقان، ومؤشرات قياس الأثر.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<FileText size={22} />}
            title="إجمالي التقارير"
            value={stats.totalReports}
            subtitle="كل التحليلات المحفوظة"
          />

          <MetricCard
            icon={<BarChart3 size={22} />}
            title="عدد المواد"
            value={stats.subjectsCount}
            subtitle="مواد ظهرت في التحليلات"
          />

          <MetricCard
            icon={<TrendingUp size={22} />}
            title="تقارير قياس الأثر"
            value={stats.impactCount}
            subtitle="قبلي / بعدي"
          />

          <MetricCard
            icon={<TrendingUp size={22} />}
            title="متوسط التحسن"
            value={`${stats.averageImprovement}%`}
            subtitle={`متوسط الإتقان العام ${stats.averageMastery}%`}
          />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search size={18} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث باسم التقرير، المادة، نوع التحليل، أو اسم المستخدم..."
                className="h-14 flex-1 bg-transparent text-sm font-bold outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-teal-600"
            >
              <option value="all">كل أنواع التحليل</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {getAnalysisTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-400">
              جارٍ تحميل التقارير...
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[1200px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-black text-slate-500">
                  <tr>
                    <th className="p-4">عنوان التقرير</th>
                    <th className="p-4">المستخدم</th>
                    <th className="p-4">المادة</th>
                    <th className="p-4">نوع التحليل</th>
                    <th className="p-4">الطلاب</th>
                    <th className="p-4">المهارات</th>
                    <th className="p-4">الإتقان</th>
                    <th className="p-4">التحسن</th>
                    <th className="p-4">التاريخ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const profile = profileMap.get(record.user_id);

                    return (
                      <tr key={record.id}>
                        <td className="p-4 font-black text-slate-900">
                          {record.report_title || "تقرير تحليل نتائج"}
                        </td>

                        <td className="p-4">
                          <p className="font-black text-slate-800">
                            {profile?.full_name || "-"}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {profile?.email || "-"}
                          </p>
                        </td>

                        <td className="p-4 font-bold">
                          {record.subject || "غير محدد"}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                            {getAnalysisTypeLabel(record.analysis_type)}
                          </span>
                        </td>

                        <td className="p-4 font-black">
                          {record.students_count ?? 0}
                        </td>

                        <td className="p-4 font-black">
                          {record.skills_count ?? 0}
                        </td>

                        <td className="p-4 font-black text-teal-700">
                          {formatPercent(record.overall_mastery)}
                        </td>

                        <td className="p-4 font-black text-emerald-700">
                          {record.analysis_type === "impact"
                            ? formatPercent(record.improvement_rate)
                            : "-"}
                        </td>

                        <td className="p-4 text-xs font-bold text-slate-500">
                          {formatDate(record.created_at)}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center font-black text-slate-400"
                      >
                        لا توجد تقارير مطابقة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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

      <p className="text-xs font-black text-slate-500">{title}</p>

      <h2 className="mt-2 text-3xl font-black text-teal-700">
        {value}
      </h2>

      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function getAnalysisTypeLabel(type?: string | null) {
  if (!type) return "غير محدد";
  return analysisTypeLabels[type] || type;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `${round(Number(value))}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
