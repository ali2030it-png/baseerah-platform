import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";
import type { AssessmentMetadata } from "@/lib/analysis/assessment-metadata";

const ANALYSIS_ALGORITHM_VERSION = "official-report-v6-table-order";

type BuildAnalysisRecordPayloadInput = {
  userId: string;
  rows: ParsedAssessmentRow[];
  analysis: any;
  metadata?: AssessmentMetadata;
};

export function buildAnalysisRecordPayload({
  userId,
  rows,
  analysis,
  metadata,
}: BuildAnalysisRecordPayloadInput) {
  const subject =
    metadata?.subject?.trim() ||
    mostCommonDisplay(rows.map((row) => row.subject)) ||
    "غير محدد";

  const assessmentPurpose =
    mostCommonDisplay(rows.map((row) => String(row.assessment_purpose || ""))) ||
    "summative";

  const assessmentTiming =
    metadata?.assessment_timing?.trim() ||
    mostCommonDisplay(rows.map((row) => String(row.assessment_timing || ""))) ||
    "";

  const gradeLevel =
    metadata?.grade_level?.trim() ||
    mostCommonDisplay(rows.map((row) => String(row.grade_level || ""))) ||
    "";

  const className =
    metadata?.class_name?.trim() ||
    mostCommonDisplay(rows.map((row) => String(row.class_name || ""))) ||
    "";

  const semester =
    metadata?.semester?.trim() ||
    mostCommonDisplay(rows.map((row: any) => String(row.semester || ""))) ||
    "";

  const assessmentTitle =
    mostCommonDisplay(rows.map((row: any) => String(row.assessment_title || ""))) ||
    "";

  const maxScoreValue = Number(metadata?.max_score) || Number(
    mostCommonDisplay(rows.map((row) => String(row.max_score || "")))
  ) || null;

  const analysisType = purposeToAnalysisType(assessmentPurpose);

  const recordFingerprint = buildStableRecordKey({
    userId,
    subject,
    gradeLevel,
    className,
    semester,
    assessmentTiming,
    assessmentPurpose,
  });

  const contentHash = buildContentHash(rows);

  return {
    user_id: userId,
    analysis_type: analysisType,
    subject,
    assessment_purpose: assessmentPurpose,
    assessment_timing: assessmentTiming,
    grade_level: gradeLevel,
    class_name: className,
    semester,
    assessment_title: assessmentTitle,
    max_score: maxScoreValue,
    students_count: analysis.total_students ?? 0,
    skills_count: analysis.total_skills ?? 0,
    overall_mastery: analysis.overall_mastery ?? 0,
    improvement_rate: analysis.improvement_rate ?? null,
    report_title: `تحليل ${buildReportTitleLabel(analysisType, metadata?.assessment_timing)} - ${subject}`,
    analysis_snapshot: analysis,
    record_fingerprint: recordFingerprint,
    content_hash: contentHash,
    updated_at: new Date().toISOString(),
  };
}

function buildStableRecordKey({
  userId,
  subject,
  gradeLevel,
  className,
  semester,
  assessmentTiming,
  assessmentPurpose,
}: {
  userId: string;
  subject: string;
  gradeLevel: string;
  className: string;
  semester: string;
  assessmentTiming: string;
  assessmentPurpose: string;
}) {
  return hashText(
    [
      userId,
      subject,
      gradeLevel,
      className,
      semester,
      assessmentTiming,
      assessmentPurpose,
    ]
      .map(normalizeKeyPart)
      .join("|")
  );
}

function buildContentHash(rows: ParsedAssessmentRow[]) {
  const canonicalRows = rows
    .map((row) => ({
      student: normalizeKeyPart(row.student_id || row.student_name),
      name: normalizeKeyPart(row.student_name),
      skill: normalizeKeyPart(row.skill),
      score: normalizeNumber(row.score),
      max: normalizeNumber(row.max_score),
    }))
    .sort((a, b) =>
      `${a.student}|${a.name}|${a.skill}`.localeCompare(
        `${b.student}|${b.name}|${b.skill}`
      )
    )
    .map((row) => `${row.student}|${row.name}|${row.skill}|${row.score}|${row.max}`)
    .join("\n");

  return hashText(`${ANALYSIS_ALGORITHM_VERSION}\n${canonicalRows}`);
}

function normalizeKeyPart(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ـ]/g, "")
    .toLowerCase();
}

function normalizeNumber(value?: string | number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return String(Math.round(number * 1000) / 1000);
}

function hashText(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function mostCommonDisplay(values: Array<string | null | undefined>) {
  const counts = new Map<string, { display: string; count: number }>();

  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .forEach((display) => {
      const key = normalizeKeyPart(display);
      const current = counts.get(key);

      if (!current) {
        counts.set(key, { display, count: 1 });
      } else {
        current.count += 1;
      }
    });

  return [...counts.values()].sort((a, b) => b.count - a.count)[0]?.display || "";
}

function purposeToAnalysisType(purpose?: string | null) {
  if (!purpose) return "summative";

  if (
    [
      "diagnostic",
      "formative",
      "summative",
      "learning_outcome",
      "training",
      "impact_pre",
      "impact_post",
      "nafs",
      "qudrat",
      "tahsili",
    ].includes(purpose)
  ) {
    return purpose;
  }

  return "summative";
}

function getAnalysisTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    diagnostic: "تشخيصي",
    formative: "تكويني",
    summative: "ختامي",
    learning_outcome: "ناتج تعلم",
    training: "تدريب",
    impact_pre: "قياس قبلي",
    impact_post: "قياس بعدي",
    nafs: "نافس",
    qudrat: "قدرات",
    tahsili: "تحصيلي",
  };

  return labels[type || ""] || "ختامي";
}







function getAssessmentTimingReportLabel(timing?: string | null) {
  if (!timing) return "";

  const labels: Record<string, string> = {
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

  return labels[timing] || timing;
}

function buildReportTitleLabel(analysisType?: string | null, assessmentTiming?: string | null) {
  const timingLabel = getAssessmentTimingReportLabel(assessmentTiming);

  if (timingLabel.includes("نهاية الفترة")) {
    return timingLabel;
  }

  return getAnalysisTypeLabel(analysisType);
}
