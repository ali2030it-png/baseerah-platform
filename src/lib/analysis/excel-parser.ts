import * as XLSX from "xlsx";

export type AssessmentPurpose =
  | "diagnostic"
  | "formative"
  | "summative"
  | "learning_outcome"
  | "training"
  | "impact_pre"
  | "impact_post"
  | string;

export type AssessmentTiming =
  | "daily"
  | "weekly"
  | "period_end"
  | "term_end"
  | "year_end"
  | "national"
  | string;

export type NationalExamType = "none" | "nafs" | "qudrat" | "tahsili" | string;

export type ParsedAssessmentRow = {
  student_name: string;
  student_id: string;
  subject: string;
  skill: string;
  learning_outcome: string;
  score: number;
  max_score: number;
  assessment_purpose: AssessmentPurpose;
  assessment_timing: AssessmentTiming;
  national_exam_type: NationalExamType;
  grade_level: string;
  class_name: string;
  semester: string;
  assessment_title: string;
  assessment_date: string;
};

function text(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function value(row: Record<string, unknown>, key: string) {
  return text(row[key]);
}

function numeric(value: unknown) {
  const cleaned = String(value ?? "")
    .replace("%", "")
    .replace("٪", "")
    .replace(",", ".")
    .trim();

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function numericOrNull(value: unknown) {
  const raw = text(value);
  if (!raw) return null;

  const cleaned = raw
    .replace("%", "")
    .replace("٪", "")
    .replace(",", ".")
    .trim();

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function numberValue(row: Record<string, unknown>, key: string) {
  return numeric(row[key]);
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

  const arabicGradeRows = parseArabicGradeSheet(matrix, file.name);
  if (arabicGradeRows.length > 0) return arabicGradeRows;

  const simpleArabicRows = parseSimpleArabicScoreSheet(matrix);
  if (simpleArabicRows.length > 0) return simpleArabicRows;

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows
    .map((row) => {
      const skill =
        value(row, "skill") ||
        value(row, "المهارة") ||
        value(row, "مسمى المهارة") ||
        "درجة الطالب";

      const assessmentTitle =
        value(row, "assessment_title") ||
        value(row, "مسمى الاختبار") ||
        skill ||
        "درجة الاختبار";

      return {
        student_name: value(row, "student_name") || value(row, "اسم الطالب"),
        student_id:
          value(row, "student_id") ||
          value(row, "رقم الطالب") ||
          value(row, "رقم الجلوس") ||
          value(row, "السجل المدني"),
        subject: value(row, "subject") || value(row, "المادة") || "غير محدد",
        skill,
        learning_outcome:
          value(row, "learning_outcome") ||
          value(row, "ناتج التعلم") ||
          skill,
        score:
          numberValue(row, "score") ||
          numberValue(row, "درجة الطالب") ||
          numberValue(row, "الدرجة") ||
          numberValue(row, "المجموع"),
        max_score:
          numberValue(row, "max_score") ||
          numberValue(row, "الدرجة العظمى") ||
          100,
        assessment_purpose:
          value(row, "assessment_purpose") ||
          value(row, "غرض التقويم") ||
          "summative",
        assessment_timing:
          value(row, "assessment_timing") ||
          value(row, "نوع الاختبار") ||
          "",
        national_exam_type:
          value(row, "national_exam_type") ||
          value(row, "نوع الاختبار الوطني") ||
          "none",
        grade_level: value(row, "grade_level") || value(row, "الصف"),
        class_name:
          value(row, "class_name") ||
          value(row, "الشعبة") ||
          value(row, "الفصل"),
        semester: value(row, "semester") || value(row, "الفصل الدراسي"),
        assessment_title: assessmentTitle,
        assessment_date:
          value(row, "assessment_date") || value(row, "تاريخ الاختبار"),
      };
    })
    .filter((row) => row.student_name && row.max_score > 0);
}

function parseSimpleArabicScoreSheet(matrix: unknown[][]): ParsedAssessmentRow[] {
  const headerIndex = matrix.findIndex((row) => {
    const joined = row.map(text).join(" ");
    return (
      joined.includes("اسم الطالب") &&
      (joined.includes("المجموع") ||
        joined.includes("درجة الطالب") ||
        joined.includes("الدرجة") ||
        joined.includes("درجة"))
    );
  });

  if (headerIndex === -1) return [];

  const headerRow = matrix[headerIndex] || [];

  const studentNameIndex = findHeaderIndex(headerRow, ["اسم الطالب", "الطالب"]);
  const studentIdIndex = findHeaderIndex(headerRow, [
    "رقم الطالب",
    "رقم الجلوس",
    "السجل المدني",
    "رقم الهوية",
  ]);

  const scoreIndex = findHeaderIndex(headerRow, [
    "المجموع",
    "درجة الطالب",
    "الدرجة",
    "درجة",
  ]);

  if (studentNameIndex === -1 || scoreIndex === -1) return [];

  const result: ParsedAssessmentRow[] = [];

  for (let rowIndex = headerIndex + 1; rowIndex < matrix.length; rowIndex++) {
    const row = matrix[rowIndex] || [];
    const studentName = text(row[studentNameIndex]);
    const score = numericOrNull(row[scoreIndex]);

    if (!studentName) continue;
    if (score === null) continue;

    result.push({
      student_name: studentName,
      student_id: studentIdIndex >= 0 ? text(row[studentIdIndex]) : "",
      subject: "غير محدد",
      skill: "الدرجة الكلية للمادة",
      learning_outcome: "نتيجة المادة",
      score,
      max_score: 100,
      assessment_purpose: "summative",
      assessment_timing: "",
      national_exam_type: "none",
      grade_level: "",
      class_name: "",
      semester: "",
      assessment_title: "درجة الاختبار",
      assessment_date: "",
    });
  }

  return removeDuplicateStudents(result);
}

function parseArabicGradeSheet(
  matrix: unknown[][],
  fileName: string
): ParsedAssessmentRow[] {
  const headerIndex = matrix.findIndex((row) => {
    const joined = row.map(text).join(" ");
    return (
      (joined.includes("رقم الطالب") ||
        joined.includes("رقم الجلوس") ||
        joined.includes("السجل المدني")) &&
      joined.includes("اسم الطالب")
    );
  });

  if (headerIndex === -1) return [];

  const headerRow = matrix[headerIndex] || [];
  const maxRow = matrix[headerIndex + 1] || [];

  const studentIdIndex = findHeaderIndex(headerRow, [
    "رقم الطالب",
    "رقم الجلوس",
    "السجل المدني",
  ]);

  const studentNameIndex = findHeaderIndex(headerRow, ["اسم الطالب"]);

  if (studentIdIndex === -1 || studentNameIndex === -1) return [];

  const totalIndex = findHeaderIndex(headerRow, [
    "المجموع",
    "مجموع",
    "المجموع النهائي",
  ]);

  const subject =
    findMetadataValue(matrix, "المادة") ||
    inferSubjectFromFileName(fileName) ||
    "غير محدد";

  const classText = findMetadataValue(matrix, "الفصل") || "";
  const { gradeLevel, className } = splitGradeAndClass(classText);

  const timing = detectAssessmentTiming(matrix, fileName);

  if (totalIndex >= 0) {
    const totalMaxScore = numeric(maxRow[totalIndex]) || 100;
    const result: ParsedAssessmentRow[] = [];

    for (let rowIndex = headerIndex + 2; rowIndex < matrix.length; rowIndex++) {
      const row = matrix[rowIndex] || [];
      const studentName = text(row[studentNameIndex]);
      const studentId = text(row[studentIdIndex]);
      const score = numericOrNull(row[totalIndex]);

      if (!studentName) continue;
      if (score === null) continue;

      result.push({
        student_name: studentName,
        student_id: studentId,
        subject,
        skill: "الدرجة الكلية للمادة",
        learning_outcome: "نتيجة نهاية الفصل في المادة",
        score,
        max_score: totalMaxScore,
        assessment_purpose: "summative",
        assessment_timing: timing || "نهاية فصل",
        national_exam_type: "none",
        grade_level: gradeLevel,
        class_name: className,
        semester: "",
        assessment_title: "كشف درجات الطلاب",
        assessment_date: "",
      });
    }

    return removeDuplicateStudents(result);
  }

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
      const score = numericOrNull(row[column.index]);
      if (score === null) continue;

      result.push({
        student_name: studentName,
        student_id: studentId,
        subject,
        skill: column.title,
        learning_outcome: column.title,
        score,
        max_score: column.maxScore,
        assessment_purpose: "summative",
        assessment_timing: timing,
        national_exam_type: "none",
        grade_level: gradeLevel,
        class_name: className,
        semester: "",
        assessment_title: "درجة الاختبار",
        assessment_date: "",
      });
    }
  }

  return result;
}

function removeDuplicateStudents(rows: ParsedAssessmentRow[]) {
  const seen = new Set<string>();
  const result: ParsedAssessmentRow[] = [];

  for (const row of rows) {
    const key = row.student_id || row.student_name;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(row);
  }

  return result;
}

function findHeaderIndex(row: unknown[], names: string[]) {
  return row.findIndex((cell) => {
    const current = text(cell);
    return names.some((name) => current === name || current.includes(name));
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

  if (source.includes("نهاية الفصل الدراسي الأول")) {
    return "نهاية الفصل الدراسي الأول";
  }

  if (source.includes("نهاية الفصل الدراسي الثاني")) {
    return "نهاية الفصل الدراسي الثاني";
  }

  if (source.includes("نهاية الفصل الدراسي الثالث")) {
    return "نهاية الفصل الدراسي الثالث";
  }

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
  if (fileName.includes("القرآن") || fileName.includes("الدراسات الإسلامية")) {
    return "القرآن الكريم والدراسات الإسلامية";
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

  const headers = lines[0].split(/\t|,/).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(/\t|,/).map((cell) => cell.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });

    const skill =
      row.skill ||
      row["المهارة"] ||
      row["درجة الطالب"] ||
      row["المجموع"] ||
      "درجة الطالب";

    return {
      student_name: row.student_name || row["اسم الطالب"] || "",
      student_id:
        row.student_id ||
        row["رقم الطالب"] ||
        row["رقم الجلوس"] ||
        row["السجل المدني"] ||
        "",
      subject: row.subject || row["المادة"] || "",
      skill,
      learning_outcome: row.learning_outcome || row["ناتج التعلم"] || skill,
      score: Number(
        row.score || row["الدرجة"] || row["درجة الطالب"] || row["المجموع"] || 0
      ),
      max_score: Number(row.max_score || row["الدرجة العظمى"] || 100),
      assessment_purpose: row.assessment_purpose || "summative",
      assessment_timing: row.assessment_timing || row["نوع الاختبار"] || "",
      national_exam_type: row.national_exam_type || "none",
      grade_level: row.grade_level || row["الصف"] || "",
      class_name: row.class_name || row["الشعبة"] || row["الفصل"] || "",
      semester: row.semester || row["الفصل الدراسي"] || "",
      assessment_title:
        row.assessment_title || row["مسمى الاختبار"] || "درجة الاختبار",
      assessment_date: row.assessment_date || "",
    };
  });
}
