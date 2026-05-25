import * as XLSX from "xlsx";

export type AssessmentPurpose =
  | "diagnostic"
  | "formative"
  | "summative"
  | "learning_outcome"
  | "training"
  | "impact_pre"
  | "impact_post";

export type AssessmentTiming =
  | "daily"
  | "weekly"
  | "period_end"
  | "term_end"
  | "year_end"
  | "national";

export type NationalExamType =
  | "none"
  | "nafs"
  | "qudrat"
  | "tahsili";

export type ParsedAssessmentRow = {
  student_name: string;
  student_id: string;
  subject: string;
  skill: string;
  learning_outcome: string;
  score: number;
  max_score: number;
  assessment_purpose: AssessmentPurpose | string;
  assessment_timing: AssessmentTiming | string;
  national_exam_type: NationalExamType | string;
  grade_level: string;
  class_name: string;
  assessment_date: string;
};

function value(row: Record<string, unknown>, key: string) {
  return String(row[key] ?? "").trim();
}

function numberValue(row: Record<string, unknown>, key: string) {
  const raw = row[key];
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

export async function parseAssessmentExcel(
  file: File
): Promise<ParsedAssessmentRow[]> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows.map((row) => ({
    student_name: value(row, "student_name"),
    student_id: value(row, "student_id"),
    subject: value(row, "subject"),
    skill: value(row, "skill"),
    learning_outcome: value(row, "learning_outcome"),
    score: numberValue(row, "score"),
    max_score: numberValue(row, "max_score"),
    assessment_purpose: value(row, "assessment_purpose"),
    assessment_timing: value(row, "assessment_timing"),
    national_exam_type: value(row, "national_exam_type") || "none",
    grade_level: value(row, "grade_level"),
    class_name: value(row, "class_name"),
    assessment_date: value(row, "assessment_date"),
  }));
}

export function parsePastedTable(text: string): ParsedAssessmentRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(/\t|,/).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(/\t|,/).map((c) => c.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });

    return {
      student_name: row.student_name || "",
      student_id: row.student_id || "",
      subject: row.subject || "",
      skill: row.skill || "",
      learning_outcome: row.learning_outcome || "",
      score: Number(row.score || 0),
      max_score: Number(row.max_score || 0),
      assessment_purpose: row.assessment_purpose || "",
      assessment_timing: row.assessment_timing || "",
      national_exam_type: row.national_exam_type || "none",
      grade_level: row.grade_level || "",
      class_name: row.class_name || "",
      assessment_date: row.assessment_date || "",
    };
  });
}
