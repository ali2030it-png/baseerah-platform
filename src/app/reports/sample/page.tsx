import { OfficialReportShell } from "@/components/reports/OfficialReportShell";
import { PrintReportButton } from "@/components/reports/PrintReportButton";
import { analyzeAssessmentRows } from "@/lib/analysis/skill-analytics";
import { buildEducationalReport } from "@/lib/reports/report-builder";
import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";

const sampleRows: ParsedAssessmentRow[] = [
  {
    student_name: "أحمد علي",
    student_id: "1",
    subject: "الرياضيات",
    skill: "حل المسائل",
    learning_outcome: "يحل مسائل رياضية متعددة الخطوات",
    score: 4,
    max_score: 10,
    assessment_purpose: "summative",
    assessment_timing: "period_end",
    national_exam_type: "none",
    grade_level: "الخامس الابتدائي",
    class_name: "أ",
    assessment_date: "2026-05-26",
  },
  {
    student_name: "محمد سالم",
    student_id: "2",
    subject: "الرياضيات",
    skill: "حل المسائل",
    learning_outcome: "يحل مسائل رياضية متعددة الخطوات",
    score: 5,
    max_score: 10,
    assessment_purpose: "summative",
    assessment_timing: "period_end",
    national_exam_type: "none",
    grade_level: "الخامس الابتدائي",
    class_name: "أ",
    assessment_date: "2026-05-26",
  },
  {
    student_name: "خالد يحيى",
    student_id: "3",
    subject: "الرياضيات",
    skill: "قراءة الجداول",
    learning_outcome: "يفسر البيانات الممثلة في الجداول",
    score: 9,
    max_score: 10,
    assessment_purpose: "summative",
    assessment_timing: "period_end",
    national_exam_type: "none",
    grade_level: "الخامس الابتدائي",
    class_name: "أ",
    assessment_date: "2026-05-26",
  },
];

export default function SampleReportPage() {
  const analysis = analyzeAssessmentRows(sampleRows);

  const report = buildEducationalReport({
    analysis,
    subject: "الرياضيات",
    grade_level: "الخامس الابتدائي",
    class_name: "أ",
    purpose: "اختبار ختامي",
    timing: "نهاية فترة",
    region: "تعليم جازان",
    school: "ابتدائية ومتوسطة حاكمة الدغارير",
    preparer_name: "........................",
    principal_name: "علي بن أحمد مباركي",
  });

  return (
    <main className="bg-[#f6f8fb] py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-5xl justify-end px-6 print:hidden">
        <PrintReportButton />
      </div>

      <OfficialReportShell report={report} />
    </main>
  );
}
