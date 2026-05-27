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
  const subject =
    mostCommon(rows.map((row) => row.subject)) ||
    firstRow?.subject ||
    "غير محدد";

  const purpose =
    mostCommon(rows.map((row) => String(row.assessment_purpose || ""))) || "";

  const timing =
    mostCommon(rows.map((row) => String(row.assessment_timing || ""))) || "";

  const gradeLevel =
    mostCommon(rows.map((row) => String(row.grade_level || ""))) || "";

  const className =
    mostCommon(rows.map((row) => String(row.class_name || ""))) || "";

  const assessmentTitle =
    mostCommon(rows.map((row) => String(row.skill || ""))) || "";

  const maxScoreValue =
    Number(mostCommon(rows.map((row) => String(row.max_score || "")))) || null;

  const fingerprint = buildRecordFingerprint(
    rows,
    analysisType,
    subject,
    purpose,
    timing
  );

  return {
    user_id: userId,
    analysis_type: analysisType,
    subject,
    assessment_purpose: purpose,
    assessment_timing: timing,
    grade_level: gradeLevel,
    class_name: className,
    assessment_title: assessmentTitle,
    max_score: maxScoreValue,
    students_count: analysis.total_students,
    skills_count: analysis.total_skills,
    overall_mastery: analysis.overall_mastery,
    report_title: buildReportTitle(subject, analysisType),
    record_fingerprint: fingerprint,
    analysis_snapshot: sanitizeAnalysisSnapshot(analysis),
    updated_at: new Date().toISOString(),
  };
}

function sanitizeAnalysisSnapshot(analysis: AssessmentAnalysisResult) {
  return {
    total_rows: analysis.total_rows,
    total_students: analysis.total_students,
    total_skills: analysis.total_skills,
    overall_mastery: analysis.overall_mastery,
    level: analysis.level,
    skill_analysis: analysis.skill_analysis,
    student_analysis: analysis.student_analysis,
    weak_skills: analysis.weak_skills,
    top_skills: analysis.top_skills,
    students_at_risk: analysis.students_at_risk,
    educational_summary: analysis.educational_summary,
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

function buildRecordFingerprint(
  rows: ParsedAssessmentRow[],
  analysisType: string,
  subject: string,
  purpose: string,
  timing: string
) {
  const normalizedRows = rows
    .map((row) =>
      [
        row.student_id || row.student_name,
        row.subject,
        row.skill,
        row.learning_outcome,
        row.score,
        row.max_score,
        row.assessment_purpose,
        row.assessment_timing,
        row.grade_level,
        row.class_name,
      ].join("|")
    )
    .sort()
    .join("||");

  return simpleHash(
    [analysisType, subject, purpose, timing, normalizedRows].join("###")
  );
}

function simpleHash(input: string) {
  let hash = 5381;

  for (let index = 0; index < input.length; index++) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return Math.abs(hash >>> 0).toString(16);
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

