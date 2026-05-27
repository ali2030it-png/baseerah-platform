import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";

export type AssessmentMetadata = {
  subject: string;
  grade_level: string;
  class_name: string;
  assessment_timing: string;
  assessment_title: string;
  max_score: number;
};

export const defaultAssessmentMetadata: AssessmentMetadata = {
  subject: "",
  grade_level: "",
  class_name: "",
  assessment_timing: "نهاية الفترة الثانية",
  assessment_title: "درجة الاختبار",
  max_score: 100,
};

export function validateAssessmentMetadata(metadata: AssessmentMetadata) {
  if (!metadata.subject.trim()) return "اختر المادة قبل رفع الملف.";
  if (!metadata.grade_level.trim()) return "اكتب الصف قبل رفع الملف.";
  if (!metadata.assessment_timing.trim()) return "اختر نوع الاختبار قبل رفع الملف.";
  if (!metadata.assessment_title.trim()) return "اكتب مسمى الاختبار أو المهارة.";
  if (!Number.isFinite(Number(metadata.max_score)) || Number(metadata.max_score) <= 0) {
    return "اكتب الدرجة العظمى بشكل صحيح.";
  }

  return "";
}

export function applyAssessmentMetadataToRows(
  rows: ParsedAssessmentRow[],
  metadata: AssessmentMetadata
): ParsedAssessmentRow[] {
  const title = metadata.assessment_title.trim() || "درجة الاختبار";
  const maxScore = Number(metadata.max_score) || 100;

  return rows.map((row) => {
    const currentSkill = String(row.skill || "").trim();
    const shouldUseTitleAsSkill =
      !currentSkill ||
      ["درجة", "الدرجة", "درجة الطالب", "المجموع", "غير محدد"].includes(
        currentSkill
      );

    return {
      ...row,
      subject: metadata.subject.trim(),
      grade_level: metadata.grade_level.trim(),
      class_name: metadata.class_name.trim(),
      assessment_timing: metadata.assessment_timing.trim(),
      assessment_purpose: row.assessment_purpose || "summative",
      skill: shouldUseTitleAsSkill ? title : row.skill,
      learning_outcome: shouldUseTitleAsSkill
        ? title
        : row.learning_outcome || row.skill,
      max_score: maxScore,
    };
  });
}
