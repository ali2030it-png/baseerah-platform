"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type AnalysisRecord = {
  id: string;
  user_id: string;
  report_title: string | null;
  subject: string | null;
  analysis_type: string | null;
  assessment_timing: string | null;
  students_count: number | null;
  skills_count: number | null;
  overall_mastery: number | null;
  created_at: string | null;
  analysis_snapshot: any | null;
};

type ReportSettings = {
  school_name: string | null;
  education_department: string | null;
  principal_name: string | null;
  preparer_name: string | null;
};

type Profile = {
  full_name: string | null;
  role: string | null;
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

const timingLabels: Record<string, string> = {
  daily: "يومي / قصير",
  weekly: "أسبوعي",
  period_end: "نهاية فترة",
  term_end: "نهاية فصل",
  year_end: "نهاية عام",
  national: "اختبار وطني",
};

const levelLabels: Record<string, string> = {
  excellent: "إتقان مرتفع",
  mastered: "متقن",
  needs_improvement: "بحاجة إلى تحسين",
  at_risk: "متعثر",
};

export default function PrintableAnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [settings, setSettings] = useState<ReportSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");

    const { data: reportData, error: reportError } = await supabase
      .from("analysis_records")
      .select("id,user_id,report_title,subject,analysis_type,assessment_timing,students_count,skills_count,overall_mastery,created_at,analysis_snapshot")
      .eq("id", reportId)
      .single();

    if (reportError || !reportData) {
      setError("تعذر تحميل التقرير أو لا تملك صلاحية الوصول إليه.");
      setLoading(false);
      return;
    }

    setRecord(reportData);

    const [{ data: settingsData }, { data: profileData }] = await Promise.all([
      supabase
        .from("report_settings")
        .select("school_name,education_department,principal_name,preparer_name")
        .eq("user_id", reportData.user_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", reportData.user_id)
        .maybeSingle(),
    ]);

    setSettings(settingsData || null);
    setProfile(profileData || null);
    setLoading(false);
  }

  useEffect(() => {
    if (reportId) loadReport();
  }, [reportId]);

  const snapshot = record?.analysis_snapshot;

  const skillAnalysis = useMemo(
    () => (Array.isArray(snapshot?.skill_analysis) ? snapshot.skill_analysis : []),
    [snapshot]
  );

  const studentAnalysis = useMemo(
    () => (Array.isArray(snapshot?.student_analysis) ? snapshot.student_analysis : []),
    [snapshot]
  );

  const weakSkills = useMemo(
    () => (Array.isArray(snapshot?.weak_skills) ? snapshot.weak_skills : []),
    [snapshot]
  );

  const studentsAtRisk = useMemo(
    () => (Array.isArray(snapshot?.students_at_risk) ? snapshot.students_at_risk : []),
    [snapshot]
  );

  const studentStats = useMemo(() => {
    return {
      excellent: studentAnalysis.filter((s: any) => s.level === "excellent").length,
      mastered: studentAnalysis.filter((s: any) => s.level === "mastered").length,
      needsImprovement: studentAnalysis.filter((s: any) => s.level === "needs_improvement").length,
      atRisk: studentAnalysis.filter((s: any) => s.level === "at_risk").length,
    };
  }, [studentAnalysis]);

  if (loading) {
    return <main className="min-h-screen p-8 text-center font-black">جارٍ تحميل التقرير...</main>;
  }

  if (error || !record) {
    return <main className="min-h-screen p-8 text-center font-black text-rose-700">{error || "لم يتم العثور على التقرير."}</main>;
  }

  const teacherName = settings?.preparer_name || profile?.full_name || "........................";
  const teacherLabel = getTeacherLabel(profile?.role);
  const followUpCount = studentStats.needsImprovement + studentStats.atRisk;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => router.push("/dashboard/reports")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
        >
          <ArrowRight size={17} />
          العودة
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
        >
          <Printer size={17} />
          طباعة
        </button>
      </div>

      <article className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="border-b border-slate-300 pb-4">
          <div className="grid grid-cols-[1fr_150px_1fr] items-start gap-10">
            <div className="text-center text-[13px] font-bold leading-7 text-slate-900">
              <p>المملكة العربية السعودية</p>
              <p>وزارة التعليم</p>
              <p>{settings?.education_department || "الإدارة التعليمية"}</p>
              <p>{settings?.school_name || "اسم المدرسة"}</p>
            </div>

            <div className="flex justify-center px-5 pt-1">
              <img
                src="/moe-logo.png"
                alt="شعار وزارة التعليم"
                className="h-16 w-24 object-contain"
              />
            </div>

            <div className="text-right text-[13px] font-bold leading-7 text-slate-900">
              <p>رقم التقرير: {shortReportNumber(record.id)}</p>
              <p>تاريخ التقرير: {formatDate(record.created_at)}</p>
              <p>نوع التحليل: {getAnalysisTypeLabel(record.analysis_type)}</p>
            </div>
          </div>
        </header>

        <section className="mt-5 text-center">
          <h1 className="text-2xl font-extrabold text-slate-950">
            {record.report_title || "تقرير تحليل نتائج الطلاب"}
          </h1>
          
        </section>

        {!snapshot && (
          <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold leading-7 text-amber-800">
            هذا التقرير محفوظ قبل تفعيل حفظ التفاصيل التحليلية. أعد حفظ التحليل من صفحة رفع النتائج حتى تظهر تفاصيل المهارات والطلاب كاملة.
          </section>
        )}

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-300">
          <table className="w-full text-center text-sm">
            <tbody>
              <tr className="bg-slate-50">
                <IndicatorTitle title="عدد الطلاب" />
                <IndicatorTitle title="عدد المهارات" />
                <IndicatorTitle title="متوسط الإتقان" />
                <IndicatorTitle title="طلاب بحاجة متابعة" />
              </tr>
              <tr>
                <IndicatorValue value={record.students_count ?? 0} />
                <IndicatorValue value={record.skills_count ?? 0} />
                <IndicatorValue value={`${record.overall_mastery ?? 0}%`} />
                <IndicatorValue value={followUpCount || studentsAtRisk.length} danger />
              </tr>
              <tr className="bg-slate-50">
                <IndicatorTitle title="إتقان مرتفع" />
                <IndicatorTitle title="متقنون" />
                <IndicatorTitle title="بحاجة إلى تحسين" />
                <IndicatorTitle title="متعثرون" />
              </tr>
              <tr>
                <IndicatorValue value={studentStats.excellent} />
                <IndicatorValue value={studentStats.mastered} />
                <IndicatorValue value={studentStats.needsImprovement} />
                <IndicatorValue value={studentStats.atRisk} danger />
              </tr>
            </tbody>
          </table>
        </section>

        <Section title="الملخص التنفيذي">
          <p className="text-sm font-bold leading-7 text-slate-700">
            {snapshot?.educational_summary ||
              `بلغ متوسط الإتقان العام ${record.overall_mastery ?? 0}%، ويعرض هذا التقرير ملخصًا تربويًا للنتائج المحفوظة.`}
          </p>
        </Section>

        <Section title="تحليل المهارات ومستويات الإتقان">
          <CompactTable
            headers={["المهارة", "ناتج التعلم", "الإتقان", "المستوى", "المتعثرون", "التنبيه"]}
            emptyText="لا توجد تفاصيل مهارات محفوظة لهذا التقرير."
            rows={skillAnalysis.map((skill: any) => [
              skill.skill || "-",
              skill.learning_outcome || "-",
              `${skill.average_mastery ?? 0}%`,
              levelText(skill.level),
              skill.at_risk_count ?? 0,
              getSkillAlert(skill.level, skill.at_risk_count),
            ])}
          />
        </Section>

        <Section title="نتائج الطلاب ومستوياتهم">
          <CompactTable
            headers={["اسم الطالب", "الإتقان", "المستوى", "المهارات الضعيفة", "التنبيه"]}
            emptyText="لا توجد تفاصيل طلاب محفوظة لهذا التقرير."
            rows={studentAnalysis.map((student: any) => [
              student.student_name || "-",
              `${student.average_mastery ?? 0}%`,
              levelText(student.level),
              Array.isArray(student.weak_skills) && student.weak_skills.length > 0
                ? student.weak_skills.join("، ")
                : "لا توجد",
              getStudentAlert(student.level),
            ])}
          />
        </Section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 print:grid-cols-2">
          <div className="rounded-xl border border-slate-300 p-4">
            <h2 className="text-base font-extrabold text-slate-950">المهارات ذات الأولوية العلاجية</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold leading-7 text-slate-700">
              {weakSkills.length > 0 ? (
                weakSkills.slice(0, 6).map((skill: any, index: number) => (
                  <li key={`${skill.skill}-${index}`}>
                    • {skill.skill} — متوسط الإتقان {skill.average_mastery}%
                  </li>
                ))
              ) : (
                <li>لا توجد مهارات حرجة بدرجة عالية في هذا التحليل.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-300 p-4">
            <h2 className="text-base font-extrabold text-slate-950">الطلاب الذين يحتاجون متابعة</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold leading-7 text-slate-700">
              {studentsAtRisk.length > 0 ? (
                studentsAtRisk.slice(0, 8).map((student: any, index: number) => (
                  <li key={`${student.student_name}-${index}`}>
                    • {student.student_name} — متوسط الإتقان {student.average_mastery}%
                  </li>
                ))
              ) : (
                <li>لا توجد حالات تعثر بارزة في هذا التحليل.</li>
              )}
            </ul>
          </div>
        </section>

        <Section title="التوصيات العلاجية">
          <ol className="list-decimal space-y-2 pr-5 text-sm font-bold leading-7 text-slate-700">
            <li>إعادة تدريس المهارات ذات الإتقان المنخفض باستخدام أمثلة متدرجة وتغذية راجعة فورية.</li>
            <li>تخصيص أنشطة قصيرة للطلاب المتعثرين مرتبطة مباشرة بالمهارات الحرجة.</li>
            <li>تنفيذ تقويم تكويني قصير بعد التدخل العلاجي لقياس التحسن.</li>
            <li>توثيق نتائج المتابعة ومقارنتها بالتحليل الحالي عند إعداد تقرير قياس الأثر.</li>
          </ol>
        </Section>

        <footer className="mt-6 border-t border-slate-300 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-800">
            <div className="rounded-xl border border-slate-300 p-4">
              <p className="font-extrabold">{teacherLabel}</p>
              <p className="mt-4">{teacherName}</p>
              <p className="mt-4">التوقيع: ........................</p>
            </div>

            <div className="rounded-xl border border-slate-300 p-4">
              <p className="font-extrabold">معتمد التقرير</p>
              <p className="mt-4">{settings?.principal_name || "........................"}</p>
              <p className="mt-4">التوقيع: ........................</p>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}

function IndicatorTitle({ title }: { title: string }) {
  return (
    <td className="border-l border-slate-300 p-2 text-xs font-bold text-slate-500">
      {title}
    </td>
  );
}

function IndicatorValue({
  value,
  danger = false,
}: {
  value: string | number;
  danger?: boolean;
}) {
  return (
    <td className={["border-l border-slate-300 p-2 text-xl font-extrabold", danger ? "text-rose-700" : "text-teal-700"].join(" ")}>
      {value}
    </td>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-xl border border-slate-300 p-4">
      <h2 className="border-r-4 border-teal-700 pr-3 text-xl font-extrabold text-slate-950">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function CompactTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300">
      <table className="w-full text-right text-xs">
        <thead className="bg-slate-100 font-extrabold text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-l border-slate-300 p-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="border-l border-slate-200 p-2 font-bold leading-6">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="p-4 text-center font-bold text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function levelText(level?: string) {
  return levelLabels[level || ""] || "غير محدد";
}

function getSkillAlert(level?: string, atRiskCount?: number) {
  if (level === "at_risk") return "تدخل عاجل";
  if (level === "needs_improvement") return "إعادة تدريس";
  if ((atRiskCount || 0) > 0) return "متابعة";
  if (level === "excellent") return "إثراء";
  if (level === "mastered") return "تعزيز";
  return "متابعة";
}

function getStudentAlert(level?: string) {
  if (level === "at_risk") return "تدخل علاجي مباشر";
  if (level === "needs_improvement") return "متابعة علاجية";
  if (level === "excellent") return "إثراء";
  if (level === "mastered") return "تعزيز";
  return "متابعة";
}

function getTeacherLabel(role?: string | null) {
  if (role === "teacher_female") return "اسم المعلمة";
  if (role === "counselor_male") return "اسم المرشد";
  if (role === "counselor_female") return "اسم المرشدة";
  return "اسم المعلم";
}

function getAnalysisTypeLabel(type?: string | null) {
  if (!type) return "غير محدد";
  return analysisTypeLabels[type] || type;
}

function formatTiming(value?: string | null) {
  if (!value) return "-";
  return timingLabels[value] || value;
}

function shortReportNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(value));
}


