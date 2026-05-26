import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";
import { AssessmentAnalysisResult } from "@/lib/analysis/skill-analytics";

export type SavedAnalysisPayload = {
  userId: string;
  rows: ParsedAssessmentRow[];
  analysis: AssessmentAnalysisResult;
};

const allowedAnalysisTypes = new Set([
  "diagnostic",
  "formative",
  "summative",
  "period_end",
  "term_end",
  "year_end",
  "learning_outcome",
  "nafs",
  "qudrat",
  "tahsili",
  "impact",
]);

export function buildAnalysisRecordPayload({
  userId,
  rows,
  analysis,
}: SavedAnalysisPayload) {
  const firstRow = rows.find((row) => row.student_name && row.subject) || rows[0];

  const analysisType = inferAnalysisType(rows);
  const subject = mostCommon(rows.map((row) => row.subject)) || firstRow?.subject || "غير محدد";
  const purpose = mostCommon(rows.map((row) => String(row.assessment_purpose || ""))) || "";
  const timing = mostCommon(rows.map((row) => String(row.assessment_timing || ""))) || "";

  return {
    user_id: userId,
    analysis_type: analysisType,
    subject,
    assessment_purpose: purpose,
    assessment_timing: timing,
    students_count: analysis.total_students,
    skills_count: analysis.total_skills,
    overall_mastery: analysis.overall_mastery,
    report_title: buildReportTitle(subject, analysisType),
    updated_at: new Date().toISOString(),
  };
}

function inferAnalysisType(rows: ParsedAssessmentRow[]) {
  const nationalType = mostCommon(
    rows
      .map((row) => String(row.national_exam_type || "").trim())
      .filter((value) => value && value !== "none")
  );

  if (nationalType && allowedAnalysisTypes.has(nationalType)) {
    return nationalType;
  }

  const purpose = mostCommon(
    rows.map((row) => String(row.assessment_purpose || "").trim())
  );

  if (purpose === "impact_pre" || purpose === "impact_post") {
    return "impact";
  }

  if (purpose && allowedAnalysisTypes.has(purpose)) {
    return purpose;
  }

  const timing = mostCommon(
    rows.map((row) => String(row.assessment_timing || "").trim())
  );

  if (timing && allowedAnalysisTypes.has(timing)) {
    return timing;
  }

  return "formative";
}

function mostCommon(values: string[]) {
  const counter = new Map<string, number>();

  values
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      counter.set(value, (counter.get(value) || 0) + 1);
    });

  return Array.from(counter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function buildReportTitle(subject: string, analysisType: string) {
  const labels: Record<string, string> = {
    diagnostic: "تحليل تشخيصي",
    formative: "تحليل تكويني",
    summative: "تحليل ختامي",
    period_end: "تحليل نهاية فترة",
    term_end: "تحليل نهاية فصل",
    year_end: "تحليل نهاية عام",
    learning_outcome: "تحليل ناتج تعلم",
    nafs: "تحليل نافس",
    qudrat: "تحليل القدرات",
    tahsili: "تحليل التحصيلي",
    impact: "قياس أثر",
  };

  return `${labels[analysisType] || "تحليل نتائج"} - ${subject || "غير محدد"}`;
}
