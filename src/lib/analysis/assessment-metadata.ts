import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";

export type AssessmentMetadata = {
  subject: string;
  grade_level: string;
  class_name: string;
  semester: string;
  assessment_timing: string;
  max_score: number;
};

export const defaultAssessmentMetadata: AssessmentMetadata = {
  subject: "",
  grade_level: "",
  class_name: "",
  semester: "",
  assessment_timing: "",
  max_score: 100,
};

export const subjectLabels: Record<string, string> = {
  "": "اختر المادة",
  "القرآن الكريم": "القرآن الكريم",
  "الدراسات الإسلامية": "الدراسات الإسلامية",
  "لغتي": "لغتي",
  "اللغة العربية": "اللغة العربية",
  "اللغة الإنجليزية": "اللغة الإنجليزية",
  "الرياضيات": "الرياضيات",
  "العلوم": "العلوم",
  "الدراسات الاجتماعية": "الدراسات الاجتماعية",
  "المهارات الرقمية": "المهارات الرقمية",
  "التربية الفنية": "التربية الفنية",
  "التربية البدنية": "التربية البدنية",
  "المهارات الحياتية والأسرية": "المهارات الحياتية والأسرية",
  "التفكير الناقد": "التفكير الناقد",
  "الكفايات اللغوية": "الكفايات اللغوية",
  "الفيزياء": "الفيزياء",
  "الكيمياء": "الكيمياء",
  "الأحياء": "الأحياء",
  "علم البيئة": "علم البيئة",
  "التقنية الرقمية": "التقنية الرقمية",
  "الصحة واللياقة": "الصحة واللياقة",
  "الثقافة المالية": "الثقافة المالية",
  "إدارة الأعمال": "إدارة الأعمال",
  "العلوم الشرعية": "العلوم الشرعية",
  "أخرى": "أخرى",
};

export const gradeLevelLabels: Record<string, string> = {
  "": "اختر الصف / المسار",
  "الأول الابتدائي": "الأول الابتدائي",
  "الثاني الابتدائي": "الثاني الابتدائي",
  "الثالث الابتدائي": "الثالث الابتدائي",
  "الرابع الابتدائي": "الرابع الابتدائي",
  "الخامس الابتدائي": "الخامس الابتدائي",
  "السادس الابتدائي": "السادس الابتدائي",
  "الأول المتوسط": "الأول المتوسط",
  "الثاني المتوسط": "الثاني المتوسط",
  "الثالث المتوسط": "الثالث المتوسط",
  "الأول الثانوي - السنة المشتركة": "الأول الثانوي - السنة المشتركة",
  "الثاني الثانوي - المسار العام": "الثاني الثانوي - المسار العام",
  "الثاني الثانوي - مسار الصحة والحياة": "الثاني الثانوي - مسار الصحة والحياة",
  "الثاني الثانوي - مسار علوم الحاسب والهندسة": "الثاني الثانوي - مسار علوم الحاسب والهندسة",
  "الثاني الثانوي - مسار إدارة الأعمال": "الثاني الثانوي - مسار إدارة الأعمال",
  "الثاني الثانوي - المسار الشرعي": "الثاني الثانوي - المسار الشرعي",
  "الثالث الثانوي - المسار العام": "الثالث الثانوي - المسار العام",
  "الثالث الثانوي - مسار الصحة والحياة": "الثالث الثانوي - مسار الصحة والحياة",
  "الثالث الثانوي - مسار علوم الحاسب والهندسة": "الثالث الثانوي - مسار علوم الحاسب والهندسة",
  "الثالث الثانوي - مسار إدارة الأعمال": "الثالث الثانوي - مسار إدارة الأعمال",
  "الثالث الثانوي - المسار الشرعي": "الثالث الثانوي - المسار الشرعي",
};

export const semesterLabels: Record<string, string> = {
  "": "اختر الفصل الدراسي",
  "الفصل الدراسي الأول": "الفصل الدراسي الأول",
  "الفصل الدراسي الثاني": "الفصل الدراسي الثاني",
};

export const assessmentTimingLabels: Record<string, string> = {
  "": "اختر نوع الاختبار",
  "اختبار قصير": "اختبار قصير",
  "اختبار تشخيصي": "اختبار تشخيصي",
  "اختبار تكويني": "اختبار تكويني",
  "نهاية الفترة الأولى": "نهاية الفترة الأولى",
  "نهاية الفترة الثانية": "نهاية الفترة الثانية",
  "نهاية الفصل الدراسي الأول": "نهاية الفصل الدراسي الأول",
  "نهاية الفصل الدراسي الثاني": "نهاية الفصل الدراسي الثاني",
  "نهاية العام": "نهاية العام",
};

export function validateAssessmentMetadata(metadata: AssessmentMetadata) {
  if (!metadata.subject.trim()) return "اختر المادة قبل رفع الملف.";
  if (!metadata.grade_level.trim()) return "اختر الصف أو المسار قبل رفع الملف.";
  if (!metadata.semester.trim()) return "اختر الفصل الدراسي قبل رفع الملف.";
  if (!metadata.assessment_timing.trim()) return "اختر نوع الاختبار قبل رفع الملف.";
  if (!Number.isFinite(Number(metadata.max_score)) || Number(metadata.max_score) <= 0) {
    return "اكتب الدرجة العظمى بشكل صحيح.";
  }

  return "";
}

export function applyAssessmentMetadataToRows(
  rows: ParsedAssessmentRow[],
  metadata: AssessmentMetadata
): ParsedAssessmentRow[] {
  const maxScore = Number(metadata.max_score) || 100;

  return rows.map((row) => {
    const currentSkill = String(row.skill || "").trim();
    const skill = currentSkill || "درجة الطالب";

    return {
      ...row,
      subject: metadata.subject.trim(),
      grade_level: metadata.grade_level.trim(),
      class_name: metadata.class_name.trim(),
      semester: metadata.semester.trim(),
      assessment_timing: metadata.assessment_timing.trim(),
      assessment_title: "",
      assessment_purpose: row.assessment_purpose || "summative",
      skill,
      learning_outcome: row.learning_outcome || skill,
      max_score: maxScore,
    };
  });
}
