"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  buildEducationalRecommendation,
  METHODOLOGY_NOTE,
} from "@/lib/analysis/recommendation-engine";

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

const levelLabels: Record<string, string> = {
  very_high: "إتقان مرتفع جدًا",
  high: "إتقان مرتفع",
  medium_follow_up: "إتقان متوسط يحتاج متابعة",
  low_support: "إتقان منخفض يحتاج دعمًا",
  very_low_intervention: "إتقان متدنٍ يحتاج تدخلًا علاجيًا",

  excellent: "إتقان مرتفع جدًا",
  mastered: "إتقان مرتفع",
  needs_improvement: "إتقان منخفض يحتاج دعمًا",
  at_risk: "إتقان متدنٍ يحتاج تدخلًا علاجيًا",
};

const CALCULATION_METHOD =
  "تم احتساب الإتقان وفق المعادلة: مجموع الدرجات المحصلة ÷ مجموع الدرجات العظمى × 100.";

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
      .select(
        "id,user_id,report_title,subject,analysis_type,assessment_timing,grade_level,class_name,semester,assessment_title,students_count,skills_count,overall_mastery,created_at,analysis_snapshot"
      )
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
      excellent: studentAnalysis.filter((student: any) => student.level === "excellent").length,
      mastered: studentAnalysis.filter((student: any) => student.level === "mastered").length,
      needsImprovement: studentAnalysis.filter((student: any) => student.level === "needs_improvement").length,
      atRisk: studentAnalysis.filter((student: any) => student.level === "at_risk").length,
    };
  }, [studentAnalysis]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 text-center font-black">
        جارٍ تحميل التقرير...
      </main>
    );
  }

  if (error || !record) {
    return (
      <main className="min-h-screen p-8 text-center font-black text-rose-700">
        {error || "لم يتم العثور على التقرير."}
      </main>
    );
  }

  const teacherName =
    settings?.preparer_name || profile?.full_name || "........................";

  const teacherLabel = getTeacherLabel(profile?.role);
  const followUpCount = studentAnalysis.filter((student: any) => {
    const value = Number(student.average_mastery) || 0;
    return value < 80;
  }).length;

  const educationalRecommendation = buildEducationalRecommendation({
    overallMastery: Number(record.overall_mastery) || 0,
    studentsBelow60: studentAnalysis.filter((student: any) => (Number(student.average_mastery) || 0) < 60).length,
    studentsBetween60And70: studentAnalysis.filter((student: any) => {
      const value = Number(student.average_mastery) || 0;
      return value >= 60 && value < 70;
    }).length,
    studentsBetween70And80: studentAnalysis.filter((student: any) => {
      const value = Number(student.average_mastery) || 0;
      return value >= 70 && value < 80;
    }).length,
    weakSkillsCount: weakSkills.length,
    weakestSkills: weakSkills
      .slice(0, 5)
      .map((skill: any) => String(skill.skill || ""))
      .filter(Boolean),
  });

  const scoreHeader = "الدرجة";

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 px-4 py-5 print:bg-white print:p-0">
      <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => router.push("/dashboard/reports")}
          className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-bold"
        >
          <ArrowRight size={17} />
          العودة
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-teal-700 px-4 py-2 text-sm font-bold text-white"
        >
          <Printer size={17} />
          طباعة
        </button>
      </div>

      <article className="mx-auto max-w-5xl bg-white p-5 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <ReportHeader record={record} settings={settings} />

        <section className="mt-3 text-center">
          <h1 className="text-[22px] font-extrabold leading-tight text-slate-950">
            {record.report_title || "تقرير تحليل نتائج الطلاب"}
          </h1>
        </section>

        <ReportInfoTable record={record} />

        {!snapshot && (
          <section className="mt-3 border border-amber-300 bg-amber-50 p-2 text-[10.5px] font-bold leading-6 text-amber-800">
            هذا التقرير محفوظ قبل تفعيل حفظ التفاصيل التحليلية. أعد حفظ التحليل من صفحة رفع النتائج حتى تظهر تفاصيل المهارات والطلاب كاملة.
          </section>
        )}

        <IndicatorsTable
          record={record}
          studentStats={studentStats}
          followUpCount={followUpCount || studentsAtRisk.length}
        />

        <Section title="الرسوم البيانية">
          <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
            <ChartCard title="توزيع مستويات الطلاب">
              <ChartBar
                label="إتقان مرتفع"
                value={studentStats.excellent}
                max={studentAnalysis.length || 1}
                barClassName="bg-teal-700"
              />
              <ChartBar
                label="متقنون"
                value={studentStats.mastered}
                max={studentAnalysis.length || 1}
                barClassName="bg-emerald-600"
              />
              <ChartBar
                label="بحاجة إلى تحسين"
                value={studentStats.needsImprovement}
                max={studentAnalysis.length || 1}
                barClassName="bg-amber-500"
              />
              <ChartBar
                label="متعثرون"
                value={studentStats.atRisk}
                max={studentAnalysis.length || 1}
                barClassName="bg-rose-600"
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
                    barClassName={getMasteryBarColor(Number(skill.average_mastery) || 0)}
                  />
                ))
              ) : (
                <p className="text-[10.5px] font-bold text-slate-400">
                  لا توجد بيانات مهارات للرسم.
                </p>
              )}
            </ChartCard>
          </div>
        </Section>

        <Section title="الملخص التنفيذي">
          <p className="text-[11px] font-bold leading-6 text-slate-700">
            {snapshot?.educational_summary ||
              `بلغ متوسط الإتقان العام ${record.overall_mastery ?? 0}%، ويعرض هذا التقرير ملخصًا تربويًا للنتائج المحفوظة.`}
          </p>

          <p className="mt-2 border border-slate-200 bg-slate-50 p-2 text-[10px] font-bold leading-5 text-slate-600">
            {snapshot?.calculation_method || CALCULATION_METHOD}
          </p>
        </Section>

        <Section title="تحليل المهارات ومستويات الإتقان">
          <CompactTable
            compact
            headers={["المهارة", "ناتج التعلم", "الإتقان", "مستوى الإتقان", "طلاب بحاجة متابعة", "الإجراء المقترح"]}
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

        <Section title="نتائج الطلاب ومستوياتهم" printBreakBefore>
          <CompactTable
            dense
            headers={["اسم الطالب", scoreHeader, "الإتقان", "مستوى الإتقان", "مجال المتابعة", "الإجراء المقترح"]}
            emptyText="لا توجد تفاصيل طلاب محفوظة لهذا التقرير."
            rows={studentAnalysis.map((student: any) => [
              formatStudentDisplayName(student.student_name),
              formatStudentScoreOnly(student.score_summary),
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

        <Section title="أولويات المتابعة العلاجية" avoidBreak>
          <CompactTable
            compact
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

        <Section title={educationalRecommendation.title} printBreakBefore avoidBreak>
          <div className="space-y-2 text-[11px] font-bold leading-6 text-slate-700">
            <p>{educationalRecommendation.summary}</p>

            {educationalRecommendation.focusStudentsNote && (
              <p className="border border-amber-200 bg-amber-50 p-2 text-amber-800">
                {educationalRecommendation.focusStudentsNote}
              </p>
            )}

            {educationalRecommendation.focusSkillsNote && (
              <p className="border border-teal-100 bg-teal-50 p-2 text-teal-800">
                {educationalRecommendation.focusSkillsNote}
              </p>
            )}

            <ol className="list-decimal space-y-1.5 pr-5">
              {educationalRecommendation.suggestedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>
        </Section>

        <Section title="ملاحظة منهجية" avoidBreak>
          <p className="text-[10.5px] font-bold leading-6 text-slate-600">
            {METHODOLOGY_NOTE}
          </p>
        </Section>

        <ReportFooter
          teacherLabel={teacherLabel}
          teacherName={teacherName}
          principalName={settings?.principal_name}
        />
      </article>
    </main>
  );
}

function ReportHeader({
  record,
  settings,
}: {
  record: AnalysisRecord;
  settings: ReportSettings | null;
}) {
  return (
    <header className="border-b border-slate-300 pb-3">
      <div className="grid grid-cols-[1fr_120px_1fr] items-start gap-12">
        <div className="text-center text-[12px] font-bold leading-6 text-slate-900">
          <p>المملكة العربية السعودية</p>
          <p>وزارة التعليم</p>
          <p>{settings?.education_department || "الإدارة التعليمية"}</p>
          <p>{settings?.school_name || "اسم المدرسة"}</p>
        </div>

        <div className="flex justify-center px-2 pt-1">
          <img
            src="/moe-logo.png"
            alt="شعار وزارة التعليم"
            className="h-14 w-24 object-contain"
          />
        </div>

        <div className="text-center text-[12px] font-bold leading-6 text-slate-900">
          <p>تاريخ التقرير: {formatHijriDate(record.created_at)}</p>
          <p>نوع التحليل: {getAnalysisTypeLabel(record.analysis_type)}</p>
        </div>
      </div>
    </header>
  );
}

function ReportInfoTable({ record }: { record: AnalysisRecord }) {
  return (
    <section className="mt-3 overflow-hidden border border-slate-300 bg-white">
      <table className="w-full border-collapse text-center text-[10.5px]">
        <tbody>
          <tr className="bg-slate-100 font-extrabold text-slate-600">
            <td className="border border-slate-300 px-2 py-1.5">المادة</td>
            <td className="border border-slate-300 px-2 py-1.5">الصف</td>
            <td className="border border-slate-300 px-2 py-1.5">الشعبة</td>
            <td className="border border-slate-300 px-2 py-1.5">الفصل الدراسي</td>
            <td className="border border-slate-300 px-2 py-1.5">نوع الاختبار</td>
          </tr>
          <tr className="font-black text-slate-900">
            <td className="border border-slate-300 px-2 py-1.5">{record.subject || "-"}</td>
            <td className="border border-slate-300 px-2 py-1.5">{record.grade_level || "-"}</td>
            <td className="border border-slate-300 px-2 py-1.5">{record.class_name || "-"}</td>
            <td className="border border-slate-300 px-2 py-1.5">{record.semester || "-"}</td>
            <td className="border border-slate-300 px-2 py-1.5">{record.assessment_timing || "-"}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function IndicatorsTable({
  record,
  studentStats,
  followUpCount,
}: {
  record: AnalysisRecord;
  studentStats: {
    excellent: number;
    mastered: number;
    needsImprovement: number;
    atRisk: number;
  };
  followUpCount: number;
}) {
  return (
    <section className="mt-3 overflow-hidden border border-slate-300 bg-white">
      <table className="w-full border-collapse text-center text-[10.5px]">
        <tbody>
          <tr className="bg-slate-100">
            <IndicatorTitle title="عدد الطلاب" />
            <IndicatorTitle title="عدد المهارات" />
            <IndicatorTitle title="متوسط الإتقان" />
            <IndicatorTitle title="طلاب بحاجة متابعة" />
          </tr>
          <tr>
            <IndicatorValue value={record.students_count ?? 0} />
            <IndicatorValue value={record.skills_count ?? 0} />
            <IndicatorValue value={`${record.overall_mastery ?? 0}%`} />
            <IndicatorValue value={followUpCount} danger />
          </tr>
          <tr className="bg-slate-100">
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
  );
}

function IndicatorTitle({ title }: { title: string }) {
  return (
    <td className="border border-slate-300 px-2 py-1.5 text-[10px] font-extrabold text-slate-600">
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
    <td
      className={[
        "border border-slate-300 px-2 py-1.5 text-[19px] font-extrabold",
        danger ? "text-rose-700" : "text-teal-700",
      ].join(" ")}
    >
      {value}
    </td>
  );
}

function Section({
  title,
  children,
  avoidBreak = false,
  printBreakBefore = false,
}: {
  title: string;
  children: ReactNode;
  avoidBreak?: boolean;
  printBreakBefore?: boolean;
}) {
  return (
    <section
      className="mt-3 border border-slate-300 bg-white p-3"
      style={{
        breakBefore: printBreakBefore ? "page" : "auto",
        pageBreakBefore: printBreakBefore ? "always" : "auto",
        breakInside: avoidBreak ? "avoid" : "auto",
        pageBreakInside: avoidBreak ? "avoid" : "auto",
      }}
    >
      <h2 className="border-r-4 border-teal-700 pr-2 text-[17px] font-extrabold leading-7 text-slate-950">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function CompactTable({
  headers,
  rows,
  emptyText,
  dense = false,
  compact = false,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
  emptyText: string;
  dense?: boolean;
  compact?: boolean;
}) {
  const tableClass = dense
    ? "w-full border-collapse text-right text-[10px]"
    : compact
      ? "w-full border-collapse text-right text-[10.5px]"
      : "w-full border-collapse text-right text-[11px]";

  const headerCellClass = dense
    ? "border border-slate-300 bg-slate-100 px-1.5 py-1 text-center font-extrabold leading-[1.2] text-slate-700"
    : "border border-slate-300 bg-slate-100 px-2 py-1.5 text-center font-extrabold leading-[1.25] text-slate-700";

  const bodyCellClass = dense
    ? "border border-slate-200 px-1.5 py-[2.5px] align-middle font-bold leading-[1.2] text-slate-900"
    : "border border-slate-200 px-2 py-1.5 align-middle font-bold leading-[1.25] text-slate-900";

  return (
    <div className="overflow-hidden border border-slate-300 bg-white">
      <table className={tableClass}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className={headerCellClass}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
              >
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className={bodyCellClass}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-slate-200 p-3 text-center text-[10px] font-bold text-slate-400"
              >
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
  children: ReactNode;
}) {
  return (
    <div className="border border-slate-300 bg-white p-3">
      <h3 className="mb-2 text-[15px] font-extrabold leading-6 text-slate-950">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function ChartBar({
  label,
  value,
  max,
  suffix = "",
  barClassName = "bg-teal-700",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  barClassName?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-[10.5px] font-bold leading-5 text-slate-600">
        <span className="truncate">{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden bg-slate-100">
        <div
          className={["h-full", barClassName].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ReportFooter({
  teacherLabel,
  teacherName,
  principalName,
}: {
  teacherLabel: string;
  teacherName: string;
  principalName?: string | null;
}) {
  return (
    <footer
      className="report-footer mt-3 border-t border-slate-300 pt-3"
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
    >
      <div className="grid grid-cols-2 gap-3 text-center text-[11px] font-bold text-slate-800">
        <div className="border border-slate-300 p-3">
          <p className="font-extrabold">{teacherLabel}</p>
          <p className="mt-2">{teacherName}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span>التوقيع:</span>
            <span className="h-4 w-40 border-b border-dotted border-slate-500" />
          </div>
        </div>

        <div className="border border-slate-300 p-3">
          <p className="font-extrabold">معتمد التقرير</p>
          <p className="mt-2">{principalName || "........................"}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span>التوقيع:</span>
            <span className="h-4 w-40 border-b border-dotted border-slate-500" />
          </div>
        </div>
      </div>
    </footer>
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

function formatStudentScoreOnly(scoreSummary?: string | null) {
  if (!scoreSummary) return "-";
  const score = String(scoreSummary).split("/")[0]?.trim();
  return score || "-";
}

function getStudentScoreHeader(_students: any[]) {
  return "الدرجة";
}

function getMasteryBarColor(percent?: number | null) {
  const value = Number(percent) || 0;

  if (value < 60) return "bg-rose-600";
  if (value < 75) return "bg-amber-500";
  if (value < 90) return "bg-emerald-600";

  return "bg-teal-700";
}

