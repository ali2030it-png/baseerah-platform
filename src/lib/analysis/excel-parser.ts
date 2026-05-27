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
  | "national"
  | string;

export type NationalExamType = "none" | "nafs" | "qudrat" | "tahsili";

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
  const num = Number(row[key]);
  return Number.isFinite(num) ? num : 0;
}

function text(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function numeric(value: unknown) {
  const cleaned = String(value ?? "")
    .replace("%", "")
    .replace("٪", "")
    .trim();

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export async function parseAssessmentExcel(
  file: File
): Promise<ParsedAssessmentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  });

  const simpleArabicRows = parseSimpleArabicScoreSheet(matrix);

  if (simpleArabicRows.length > 0) {
    return simpleArabicRows;
  }

  const arabicGradeRows = parseArabicGradeSheet(matrix, file.name);

  if (arabicGradeRows.length > 0) {
    return arabicGradeRows;
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows
    .map((row) => ({
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
    }))
    .filter((row) => row.student_name && row.skill && row.max_score > 0);
}

function parseSimpleArabicScoreSheet(matrix: unknown[][]): ParsedAssessmentRow[] {
  const headerIndex = matrix.findIndex((row) => {
    const joined = row.map(text).join(" ");
    return (
      joined.includes("اسم الطالب") &&
      (joined.includes("درجة الطالب") ||
        joined.includes("الدرجة") ||
        joined.includes("درجة"))
    );
  });

  if (headerIndex === -1) return [];

  const headerRow = matrix[headerIndex] || [];

  const studentNameIndex = findHeaderIndex(headerRow, ["اسم الطالب", "الطالب"]);
  const studentIdIndex = findHeaderIndex(headerRow, ["رقم الطالب", "السجل المدني", "رقم الهوية"]);
  const scoreIndex = findHeaderIndex(headerRow, ["درجة الطالب", "الدرجة", "درجة"]);

  if (studentNameIndex === -1 || scoreIndex === -1) return [];

  const rows: ParsedAssessmentRow[] = [];

  for (let rowIndex = headerIndex + 1; rowIndex < matrix.length; rowIndex++) {
    const row = matrix[rowIndex] || [];
    const studentName = text(row[studentNameIndex]);
    const studentId = studentIdIndex >= 0 ? text(row[studentIdIndex]) : "";
    const score = numeric(row[scoreIndex]);

    if (!studentName) continue;

    rows.push({
      student_name: studentName,
      student_id: studentId,
      subject: "غير محدد",
      skill: "درجة الطالب",
      learning_outcome: "درجة الطالب",
      score,
      max_score: 100,
      assessment_purpose: "summative",
      assessment_timing: "",
      national_exam_type: "none",
      grade_level: "",
      class_name: "",
      assessment_date: "",
    });
  }

  return rows.filter((row) => row.student_name && row.score >= 0);
}

function parseArabicGradeSheet(
  matrix: unknown[][],
  fileName: string
): ParsedAssessmentRow[] {
  const headerIndex = matrix.findIndex((row) => {
    const joined = row.map(text).join(" ");
    return joined.includes("رقم الطالب") && joined.includes("اسم الطالب");
  });

  if (headerIndex === -1) return [];

  const headerRow = matrix[headerIndex] || [];
  const maxRow = matrix[headerIndex + 1] || [];

  const studentIdIndex = findHeaderIndex(headerRow, ["رقم الطالب"]);
  const studentNameIndex = findHeaderIndex(headerRow, ["اسم الطالب"]);

  if (studentIdIndex === -1 || studentNameIndex === -1) return [];

  const subject =
    findMetadataValue(matrix, "المادة") ||
    inferSubjectFromFileName(fileName) ||
    "غير محدد";

  const classText = findMetadataValue(matrix, "الفصل") || "";
  const { gradeLevel, className } = splitGradeAndClass(classText);

  const scoreColumns = headerRow
    .map((cell, index) => ({
      index,
      title: text(cell),
      maxScore: numeric(maxRow[index]),
    }))
    .filter((column) => {
      if (!column.title) return false;
      if (column.index <= studentNameIndex) return false;
      if (column.maxScore <= 0) return false;
      if (column.title === "المجموع") return false;
      return true;
    });

  if (scoreColumns.length === 0) return [];

  const result: ParsedAssessmentRow[] = [];

  for (let rowIndex = headerIndex + 2; rowIndex < matrix.length; rowIndex++) {
    const row = matrix[rowIndex] || [];

    const studentName = text(row[studentNameIndex]);
    const studentId = text(row[studentIdIndex]);

    if (!studentName) continue;

    for (const column of scoreColumns) {
      result.push({
        student_name: studentName,
        student_id: studentId,
        subject,
        skill: column.title,
        learning_outcome: column.title,
        score: numeric(row[column.index]),
        max_score: column.maxScore,
        assessment_purpose: "summative",
        assessment_timing: detectAssessmentTiming(matrix, fileName),
        national_exam_type: "none",
        grade_level: gradeLevel,
        class_name: className,
        assessment_date: "",
      });
    }
  }

  return result;
}

function findHeaderIndex(row: unknown[], names: string[]) {
  return row.findIndex((cell) => {
    const value = text(cell);
    return names.some((name) => value === name || value.includes(name));
  });
}

function detectAssessmentTiming(matrix: unknown[][], fileName: string) {
  const source = `${matrix.slice(0, 12).flat().map(text).join(" ")} ${fileName}`;

  if (source.includes("نهاية الفترة الثانية") || source.includes("الفترة الثانية")) {
    return "نهاية الفترة الثانية";
  }

  if (source.includes("نهاية الفترة الأولى") || source.includes("الفترة الأولى")) {
    return "نهاية الفترة الأولى";
  }

  if (source.includes("نهاية الفصل الدراسي الأول")) return "نهاية الفصل الدراسي الأول";
  if (source.includes("نهاية الفصل الدراسي الثاني")) return "نهاية الفصل الدراسي الثاني";
  if (source.includes("نهاية الفصل الدراسي الثالث")) return "نهاية الفصل الدراسي الثالث";
  if (source.includes("نهاية العام")) return "نهاية العام";

  return "";
}

function findMetadataValue(matrix: unknown[][], label: string) {
  for (const row of matrix.slice(0, 8)) {
    for (let index = 0; index < row.length; index++) {
      if (text(row[index]) === label) {
        const next = text(row[index + 1]);
        if (next) return next;
      }
    }
  }

  return "";
}

function inferSubjectFromFileName(fileName: string) {
  if (fileName.includes("الرياضيات")) return "الرياضيات";
  if (fileName.includes("لغتي")) return "لغتي";
  if (fileName.includes("العلوم")) return "العلوم";
  if (fileName.includes("الإنجليزي") || fileName.includes("اللغة الإنجليزية")) {
    return "اللغة الإنجليزية";
  }

  return "";
}

function splitGradeAndClass(value: string) {
  const cleaned = text(value);
  const match = cleaned.match(/^(.+?)\s+(\d+|[أ-ي])$/);

  if (!match) {
    return {
      gradeLevel: cleaned,
      className: "",
    };
  }

  return {
    gradeLevel: match[1].trim(),
    className: match[2].trim(),
  };
}

export function parsePastedTable(textInput: string): ParsedAssessmentRow[] {
  const lines = textInput
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
      student_name: row.student_name || row["اسم الطالب"] || "",
      student_id: row.student_id || row["رقم الطالب"] || "",
      subject: row.subject || row["المادة"] || "",
      skill: row.skill || row["المهارة"] || row["درجة الطالب"] || "درجة الطالب",
      learning_outcome: row.learning_outcome || row["ناتج التعلم"] || row["المهارة"] || "درجة الطالب",
      score: Number(row.score || row["الدرجة"] || row["درجة الطالب"] || 0),
      max_score: Number(row.max_score || row["الدرجة العظمى"] || 100),
      assessment_purpose: row.assessment_purpose || "summative",
      assessment_timing: row.assessment_timing || "",
      national_exam_type: row.national_exam_type || "none",
      grade_level: row.grade_level || row["الصف"] || "",
      class_name: row.class_name || row["الفصل"] || "",
      assessment_date: row.assessment_date || "",
    };
  });
}
