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
  grade_level: string | null;
  class_name: string | null;
  semester: string | null;
  assessment_title: string | null;
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
      .select("id,user_id,report_title,subject,analysis_type,assessment_timing,grade_level,class_name,semester,assessment_title,students_count,skills_count,overall_mastery,created_at,analysis_snapshot")
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
          <div className="grid grid-cols-[1fr_190px_1fr] items-start gap-6">
            <div className="text-center text-[13px] font-bold leading-7 text-slate-900">
              <p>المملكة العربية السعودية</p>
              <p>وزارة التعليم</p>
              <p>{settings?.education_department || "الإدارة التعليمية"}</p>
              <p>{settings?.school_name || "اسم المدرسة"}</p>
            </div>

            <div className="flex justify-center px-4 pt-1">
              <img
                src="/moe-logo.png"
                alt="شعار وزارة التعليم"
                className="h-16 w-24 object-contain"
              />
            </div>

            <div className="pr-3 text-right text-[13px] font-bold leading-7 text-slate-900">
              <p>رقم التقرير: {formatArabicReportNumber(record.id)}</p>
              <p>تاريخ التقرير: {formatHijriDate(record.created_at)}</p>
              <p>نوع التحليل: {getAnalysisTypeLabel(record.analysis_type)}</p>
            </div>
          </div>
        </header>

        <section className="mt-4 text-center">
          <h1 className="text-2xl font-extrabold text-slate-950">
            {record.report_title || "تقرير تحليل نتائج الطلاب"}
          </h1>
          
        </section>

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-300">
          <table className="w-full text-center text-xs">
            <tbody>
              <tr className="bg-slate-50 font-extrabold text-slate-500">
                <td className="border-l border-slate-300 p-2">المادة</td>
                <td className="border-l border-slate-300 p-2">الصف / المسار</td>
                <td className="border-l border-slate-300 p-2">الشعبة</td>
                <td className="border-l border-slate-300 p-2">الفصل الدراسي</td>
                <td className="p-2">نوع الاختبار</td>
              </tr>
              <tr className="font-black text-slate-900">
                <td className="border-l border-slate-300 p-2">{record.subject || "-"}</td>
                <td className="border-l border-slate-300 p-2">{record.grade_level || "-"}</td>
                <td className="border-l border-slate-300 p-2">{record.class_name || "-"}</td>
                <td className="border-l border-slate-300 p-2">{record.semester || "-"}</td>
                <td className="p-2">{record.assessment_timing || "-"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {!snapshot && (
          <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold leading-7 text-amber-800">
            هذا التقرير محفوظ قبل تفعيل حفظ التفاصيل التحليلية. أعد حفظ التحليل من صفحة رفع النتائج حتى تظهر تفاصيل المهارات والطلاب كاملة.
          </section>
        )}

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-300">
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

        <Section title="الرسوم البيانية">
          <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
            <ChartCard title="توزيع مستويات الطلاب">
              <ChartBar
                label="إتقان مرتفع"
                value={studentStats.excellent}
                max={studentAnalysis.length || 1}
              />
              <ChartBar
                label="متقنون"
                value={studentStats.mastered}
                max={studentAnalysis.length || 1}
              />
              <ChartBar
                label="بحاجة إلى تحسين"
                value={studentStats.needsImprovement}
                max={studentAnalysis.length || 1}
              />
              <ChartBar
                label="متعثرون"
                value={studentStats.atRisk}
                max={studentAnalysis.length || 1}
                danger
              />
            </ChartCard>

            <ChartCard title="إتقان المهارات">
              {skillAnalysis.length > 0 ? (
                skillAnalysis.slice(0, 6).map((skill: any, index: number) => (
                  <ChartBar
                    key={`${skill.skill}-${index}`}
                    label={skill.skill || "مهارة"}
                    value={Number(skill.average_mastery) || 0}
                    max={100}
                    suffix="%"
                    danger={(Number(skill.average_mastery) || 0) < 75}
                  />
                ))
              ) : (
                <p className="text-sm font-bold text-slate-400">
                  لا توجد بيانات مهارات للرسم.
                </p>
              )}
            </ChartCard>
          </div>
        </Section>

        <Section title="الملخص التنفيذي">
          <p className="text-sm font-bold leading-7 text-slate-700">
            {snapshot?.educational_summary ||
              `بلغ متوسط الإتقان العام ${record.overall_mastery ?? 0}%، ويعرض هذا التقرير ملخصًا تربويًا للنتائج المحفوظة.`}
          </p>
          {snapshot?.calculation_method && (
            <p className="mt-2 rounded-xl bg-slate-50 p-2 text-[11px] font-bold leading-6 text-slate-600">
              {snapshot.calculation_method}
            </p>
          )}
        </Section>

        <Section title="تحليل المهارات ومستويات الإتقان">
          <CompactTable
            headers={["المهارة", "ناتج التعلم", "الإتقان", "المستوى", "طلاب بحاجة متابعة", "التنبيه"]}
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
            headers={["اسم الطالب", "الدرجة", "الإتقان", "المستوى", "مجال المتابعة", "التنبيه"]}
            emptyText="لا توجد تفاصيل طلاب محفوظة لهذا التقرير."
            rows={studentAnalysis.map((student: any) => [
              formatStudentDisplayName(formatStudentDisplayName(student.student_name)),
                    student.score_summary || "-",
              `${student.average_mastery ?? 0}%`,
              levelText(student.level),
              student.follow_up_area ||
                (Array.isArray(student.weak_skills) && student.weak_skills.length > 0
                  ? student.weak_skills.join("، ")
                  : "لا يوجد"),
              getStudentAlert(student.level),
            ])}
          />
        </Section>

        <Section title="أولويات المتابعة العلاجية">
          <CompactTable
            headers={["البند", "التفصيل", "الإجراء المقترح"]}
            emptyText="لا توجد أولويات علاجية بارزة في هذا التحليل."
            rows={[
              ...weakSkills.slice(0, 3).map((skill: any) => [
                skill.priority_label || "أولوية تحسين",
                `${skill.skill || "-"} — متوسط الإتقان ${skill.average_mastery ?? 0}%`,
                skill.recommended_action || "إعادة تدريس قصيرة وتدريب موجّه",
              ]),
              ...studentsAtRisk.slice(0, 3).map((student: any) => [
                "طالب يحتاج متابعة",
                `${formatStudentDisplayName(student.student_name) || "-"} — متوسط الإتقان ${student.average_mastery ?? 0}%`,
                "تدخل علاجي فردي",
              ]),
            ]}
          />
        </Section>

        <Section title="التوصيات العلاجية">
          <ol className="list-decimal space-y-2 pr-5 text-sm font-bold leading-7 text-slate-700">
            <li>إعادة تدريس المهارات ذات الإتقان المنخفض باستخدام أمثلة متدرجة وتغذية راجعة فورية.</li>
            <li>تخصيص أنشطة قصيرة للطلاب المتعثرين مرتبطة مباشرة بالمهارات الحرجة.</li>
            <li>تنفيذ تقويم تكويني قصير بعد التدخل العلاجي لقياس التحسن.</li>
            <li>توثيق نتائج المتابعة ومقارنتها بالتحليل الحالي عند إعداد تقرير قياس الأثر.</li>
          </ol>
        </Section>

                <footer
          className="report-footer mt-3 border-t border-slate-300 pt-3"
          style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
        >
          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-800">
            <div
              className="rounded-xl border border-slate-300 p-3"
              style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
            >
              <p className="font-extrabold">{teacherLabel}</p>
              <p className="mt-2">{teacherName}</p>
              <div className="mt-2 flex items-center gap-2">
                <span>التوقيع:</span>
                <span className="h-4 flex-1 border-b border-dotted border-slate-500" />
              </div>
            </div>

            <div
              className="rounded-xl border border-slate-300 p-3"
              style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
            >
              <p className="font-extrabold">معتمد التقرير</p>
              <p className="mt-2">{settings?.principal_name || "........................"}</p>
              <div className="mt-2 flex items-center gap-2">
                <span>التوقيع:</span>
                <span className="h-4 flex-1 border-b border-dotted border-slate-500" />
              </div>
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
    <section className="mt-4 rounded-xl border border-slate-300 p-3">
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
              <td colSpan={headers.length} className="p-3 text-center font-bold text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-300 p-3">
      <h3 className="mb-3 text-base font-extrabold text-slate-950">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChartBar({
  label,
  value,
  max,
  suffix = "",
  danger = false,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  danger?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
        <span className="truncate">{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={[
            "h-full rounded-full",
            danger ? "bg-rose-600" : "bg-teal-700",
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
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

function formatArabicReportNumber(id: string) {
  let hash = 0;

  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  const number = String(hash).slice(0, 8).padStart(8, "0");
  return toArabicDigits(number);
}

function formatHijriDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  const formatted = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return formatted.includes("هـ") ? formatted : `${formatted} هـ`;
}

function toArabicDigits(value: string) {
  const map: Record<string, string> = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  };

  return value.replace(/[0-9]/g, (digit) => map[digit] || digit);
}




















function formatStudentDisplayName(name?: string | null) {
  if (!name) return "-";

  const excludedParts = new Set(["بن", "ابن"]);
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part && !excludedParts.has(part));

  if (parts.length <= 4) {
    return parts.join(" ");
  }

  return [parts[0], parts[1], parts[2], parts[parts.length - 1]]
    .filter(Boolean)
    .join(" ");
}





function getMasteryBarColor(percent?: number | null) {
  const value = Number(percent) || 0;

  if (value < 60) return "bg-rose-500";
  if (value < 75) return "bg-amber-500";
  if (value < 90) return "bg-emerald-600";

  return "bg-teal-700";
}


