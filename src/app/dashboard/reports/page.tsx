"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, MessageCircle, Search, UploadCloud } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { DeleteAnalysisRecordButton } from "@/components/basirah/DeleteAnalysisRecordButton";

type AnalysisRecord = {
  id: string;
  analysis_type: string | null;
  subject: string | null;
  grade_level: string | null;
  assessment_purpose: string | null;
  assessment_timing: string | null;
  students_count: number | null;
  skills_count: number | null;
  overall_mastery: number | null;
  improvement_rate: number | null;
  report_title: string | null;
  created_at: string | null;
  updated_at: string | null;
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

export default function TeacherReportsPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError("تعذر قراءة بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
      return;
    }

    const { data, error: recordsError } = await supabase
      .from("analysis_records")
      .select(
        "id,analysis_type,subject,grade_level,assessment_purpose,assessment_timing,students_count,skills_count,overall_mastery,improvement_rate,report_title,created_at,updated_at"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (recordsError) {
      setError(recordsError.message);
      return;
    }

    setRecords(data || []);
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filteredRecords = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) return records;

    return records.filter((record) =>
      [
        record.report_title,
        record.subject,
        record.grade_level,
        getAnalysisTypeLabel(record.analysis_type),
        record.assessment_purpose,
        record.assessment_timing,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text)
    );
  }, [records, query]);

  const stats = useMemo(() => {
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
      total: records.length,
      subjects: subjects.size,
      averageMastery,
    };
  }, [records]);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-teal-700">
              تقارير المعلم
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              تحليلاتي المحفوظة
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-bold leading-8 text-slate-600">
              هنا تظهر التحليلات التي قمت بحفظها بعد رفع نتائج الطلاب أو إدخالها.
            </p>
          </div>

          <Link
            href="/dashboard/analysis/upload"
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-800"
          >
            <UploadCloud size={18} />
            تحليل جديد
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<FileText size={22} />}
          title="إجمالي التحليلات"
          value={stats.total}
          subtitle="تحليلات محفوظة"
        />

        <StatCard
          icon={<BarChart3 size={22} />}
          title="عدد المواد"
          value={stats.subjects}
          subtitle="مواد ظهرت في تحليلاتك"
        />

        <StatCard
          icon={<BarChart3 size={22} />}
          title="متوسط الإتقان"
          value={`${stats.averageMastery}%`}
          subtitle="متوسط عام لتحليلاتك"
        />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم التقرير، المادة، الصف، أو نوع التحليل..."
            className="h-14 flex-1 bg-transparent text-sm font-bold outline-none"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-400">
            جارٍ تحميل تحليلاتك...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-black text-slate-500">
              لا توجد تحليلات محفوظة حتى الآن.
            </p>

            <Link
              href="/dashboard/analysis/upload"
              className="mt-4 inline-flex rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white"
            >
              ابدأ بتحليل جديد
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[1020px] text-right text-sm">
              <thead className="bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="p-4">عنوان التقرير</th>
                  <th className="p-4">المادة</th>
                  <th className="p-4">الصف</th>
                  <th className="p-4">نوع التحليل</th>
                  <th className="p-4">الطلاب</th>
                  <th className="p-4">المهارات</th>
                  <th className="p-4">الإتقان</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="p-4 font-black text-slate-900">
                      {getReportTitleDisplay(record)}
                    </td>

                    <td className="p-4 font-bold">
                      {record.subject || "غير محدد"}
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {record.grade_level || "-"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                        {getReportTypeDisplay(record)}
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

                    <td className="p-4 text-xs font-bold text-slate-500">
                      {formatDate(record.updated_at || record.created_at)}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/reports/analysis/${record.id}`}
                          className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
                        >
                          عرض التقرير
                        </Link>

                        <a
                          href={buildWhatsAppShareUrl(record)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="مشاركة التقرير عبر واتساب"
                          aria-label="مشاركة التقرير عبر واتساب"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <MessageCircle size={16} />
                          <span className="sr-only">مشاركة واتساب</span>
                        </a>

                        <DeleteAnalysisRecordButton
                          recordId={record.id}
                          reportTitle={getReportTitleDisplay(record)}
                          onDeleted={() =>
                            setRecords((currentRecords) =>
                              currentRecords.filter((item) => item.id !== record.id)
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
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


function getReportTypeDisplay(record: AnalysisRecord) {
  const timing = String(record.assessment_timing || "").trim();

  const timingLabels: Record<string, string> = {
    first_period: "نهاية الفترة الأولى",
    second_period: "نهاية الفترة الثانية",
    period_1: "نهاية الفترة الأولى",
    period_2: "نهاية الفترة الثانية",
    period_one: "نهاية الفترة الأولى",
    period_two: "نهاية الفترة الثانية",
    first_period_end: "نهاية الفترة الأولى",
    second_period_end: "نهاية الفترة الثانية",
    "نهاية الفترة الأولى": "نهاية الفترة الأولى",
    "نهاية الفترة الثانية": "نهاية الفترة الثانية",
  };

  const timingLabel = timingLabels[timing] || timing;

  if (timingLabel.includes("نهاية الفترة")) {
    return timingLabel;
  }

  if (
    timingLabel.includes("نافس") ||
    String(record.analysis_type || "").toLowerCase() === "nafs"
  ) {
    return "تدريب نافس";
  }

  return getAnalysisTypeLabel(record.analysis_type);
}

function getReportTitleDisplay(record: AnalysisRecord) {
  const typeLabel = getReportTypeDisplay(record);
  const subject = record.subject || "نتائج الطلاب";

  if (typeLabel.includes("نافس")) {
    return `تحليل ${typeLabel} - ${subject}`;
  }

  return record.report_title || `تقرير تحليل نتائج ${subject}`;
}

function buildWhatsAppShareUrl(record: AnalysisRecord) {
  const title = getReportTitleDisplay(record);
  const subject = record.subject || "غير محدد";
  const gradeLevel = record.grade_level || "";
  const reportPath = `/reports/analysis/${record.id}`;
  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${reportPath}`
      : reportPath;

  const message = [
    "السلام عليكم،",
    `نرفق لكم تقرير تحليل نتائج الطلاب: ${title}.`,
    `المادة: ${subject}.`,
    gradeLevel ? `الصف: ${gradeLevel}.` : "",
    `رابط التقرير: ${reportUrl}`,
    "نأمل الاطلاع على مؤشرات الإتقان والتوصيات واتخاذ ما يلزم من إجراءات الدعم والتحسين.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
