import * as XLSX from "xlsx";
import type { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";

export type NafsParserMetadata = {
  subject?: string;
  grade_level?: string;
  class_name?: string;
  semester?: string;
  assessment_title?: string;
  assessment_purpose?: string;
  assessment_timing?: string;
  assessment_date?: string;
  national_exam_type?: string;
  analysis_type?: string;
};

export type NafsQuestionMapItem = {
  question_id: string;
  domain: string;
  learning_outcome: string;
  max_score: number;
  notes?: string;
};

export type NafsParseWarning = {
  row?: number;
  question_id?: string;
  message: string;
};

export type NafsParseResult = {
  rows: ParsedAssessmentRow[];
  question_map: NafsQuestionMapItem[];
  warnings: NafsParseWarning[];
  students_count: number;
  questions_count: number;
  outcomes_count: number;
};

const STUDENT_RESULTS_SHEET = "نتائج الطلاب";
const QUESTION_MAP_SHEET = "خريطة نواتج التعلم";

export async function parseNafsWorkbookFile(
  file: File,
  metadata: NafsParserMetadata = {}
): Promise<NafsParseResult> {
  const buffer = await file.arrayBuffer();
  return parseNafsWorkbook(buffer, metadata);
}

export function parseNafsWorkbook(
  workbookBuffer: ArrayBuffer,
  metadata: NafsParserMetadata = {}
): NafsParseResult {
  const workbook = XLSX.read(workbookBuffer, { type: "array" });

  const studentSheet =
    workbook.Sheets[STUDENT_RESULTS_SHEET] ||
    workbook.Sheets[workbook.SheetNames[0]];

  const questionMapSheet =
    workbook.Sheets[QUESTION_MAP_SHEET] ||
    workbook.Sheets[workbook.SheetNames[1]];

  if (!studentSheet) {
    throw new Error("لم يتم العثور على ورقة نتائج الطلاب في قالب نافس.");
  }

  if (!questionMapSheet) {
    throw new Error("لم يتم العثور على ورقة خريطة نواتج التعلم في قالب نافس.");
  }

  const studentRows = XLSX.utils.sheet_to_json<Array<string | number | null>>(
    studentSheet,
    {
      header: 1,
      defval: "",
      raw: false,
    }
  );

  const questionMapRows = XLSX.utils.sheet_to_json<Array<string | number | null>>(
    questionMapSheet,
    {
      header: 1,
      defval: "",
      raw: false,
    }
  );

  const questionMap = parseQuestionMap(questionMapRows);
  const parsedRows = parseStudentResults(studentRows, questionMap, metadata);

  const outcomeSet = new Set(
    questionMap
      .map((item) => normalizeText(item.learning_outcome))
      .filter(Boolean)
  );

  return {
    rows: parsedRows.rows,
    question_map: questionMap,
    warnings: parsedRows.warnings,
    students_count: parsedRows.studentsCount,
    questions_count: questionMap.length,
    outcomes_count: outcomeSet.size,
  };
}

function parseQuestionMap(
  rows: Array<Array<string | number | null>>
): NafsQuestionMapItem[] {
  if (rows.length < 2) {
    throw new Error("ورقة خريطة نواتج التعلم لا تحتوي على بيانات كافية.");
  }

  const header = rows[0].map((cell) => normalizeHeader(String(cell || "")));

  const questionIndex = findHeaderIndex(header, [
    "رقمالسؤال",
    "السؤال",
    "رقمالفقرة",
    "الفقرة",
  ]);

  const domainIndex = findHeaderIndex(header, [
    "المجال",
    "المهارة",
    "البعد",
  ]);

  const outcomeIndex = findHeaderIndex(header, [
    "ناتجالتعلم",
    "نواتجالتعلم",
    "الناتج",
    "المؤشر",
  ]);

  const maxScoreIndex = findHeaderIndex(header, [
    "الدرجةالعظمى",
    "درجةالسؤال",
    "الدرجة",
  ]);

  const notesIndex = findHeaderIndex(header, [
    "ملاحظات",
    "ملاحظة",
  ], false);

  if (questionIndex === -1 || outcomeIndex === -1 || maxScoreIndex === -1) {
    throw new Error(
      "خريطة نواتج التعلم يجب أن تحتوي على: رقم السؤال، ناتج التعلم، الدرجة العظمى."
    );
  }

  const questionMap: NafsQuestionMapItem[] = [];

  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];

    const questionId = normalizeQuestionId(row[questionIndex]);
    const learningOutcome = normalizeText(row[outcomeIndex]);
    const domain = domainIndex >= 0 ? normalizeText(row[domainIndex]) : "";
    const maxScore = toNumber(row[maxScoreIndex]);
    const notes = notesIndex >= 0 ? normalizeText(row[notesIndex]) : "";

    if (!questionId && !learningOutcome) continue;

    if (!questionId) {
      throw new Error(`يوجد ناتج تعلم بدون رقم سؤال في صف خريطة الأسئلة رقم ${index + 1}.`);
    }

    if (!learningOutcome) {
      throw new Error(`السؤال ${questionId} لا يحتوي على ناتج تعلم.`);
    }

    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      throw new Error(`السؤال ${questionId} لا يحتوي على درجة عظمى صحيحة.`);
    }

    questionMap.push({
      question_id: questionId,
      domain: domain || "نواتج التعلم",
      learning_outcome: learningOutcome,
      max_score: maxScore,
      notes,
    });
  }

  if (questionMap.length === 0) {
    throw new Error("لم يتم العثور على أسئلة صالحة في خريطة نواتج التعلم.");
  }

  const duplicate = findDuplicate(questionMap.map((item) => item.question_id));
  if (duplicate) {
    throw new Error(`يوجد تكرار في رقم السؤال داخل خريطة نواتج التعلم: ${duplicate}`);
  }

  return questionMap;
}

function parseStudentResults(
  rows: Array<Array<string | number | null>>,
  questionMap: NafsQuestionMapItem[],
  metadata: NafsParserMetadata
): {
  rows: ParsedAssessmentRow[];
  warnings: NafsParseWarning[];
  studentsCount: number;
} {
  if (rows.length < 2) {
    throw new Error("ورقة نتائج الطلاب لا تحتوي على بيانات كافية.");
  }

  const header = rows[0].map((cell) => normalizeHeader(String(cell || "")));

  const studentIdIndex = findHeaderIndex(header, [
    "رقمالطالب",
    "السجلالمدني",
    "المعرف",
    "الهوية",
  ], false);

  const studentNameIndex = findHeaderIndex(header, [
    "اسمالطالب",
    "الطالب",
    "الاسم",
  ]);

  if (studentNameIndex === -1) {
    throw new Error("ورقة نتائج الطلاب يجب أن تحتوي على عمود اسم الطالب.");
  }

  const questionColumns = new Map<string, number>();

  header.forEach((headerValue, index) => {
    const questionId = normalizeQuestionId(headerValue);
    if (questionMap.some((item) => item.question_id === questionId)) {
      questionColumns.set(questionId, index);
    }
  });

  const missingQuestions = questionMap.filter(
    (item) => !questionColumns.has(item.question_id)
  );

  if (missingQuestions.length > 0) {
    throw new Error(
      `توجد أسئلة في خريطة نواتج التعلم غير موجودة في ورقة نتائج الطلاب: ${missingQuestions
        .map((item) => item.question_id)
        .join("، ")}`
    );
  }

  const parsedRows: ParsedAssessmentRow[] = [];
  const warnings: NafsParseWarning[] = [];
  let studentsCount = 0;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const studentName = normalizeText(row[studentNameIndex]);

    if (!studentName) continue;

    studentsCount += 1;

    const studentId =
      studentIdIndex >= 0 ? normalizeText(row[studentIdIndex]) : String(studentsCount);

    for (const question of questionMap) {
      const columnIndex = questionColumns.get(question.question_id);

      if (columnIndex === undefined) continue;

      const rawScore = row[columnIndex];

      if (rawScore === "" || rawScore === null || rawScore === undefined) {
        warnings.push({
          row: rowIndex + 1,
          question_id: question.question_id,
          message: `درجة السؤال ${question.question_id} فارغة للطالب ${studentName}.`,
        });
        continue;
      }

      const score = toNumber(rawScore);

      if (!Number.isFinite(score)) {
        warnings.push({
          row: rowIndex + 1,
          question_id: question.question_id,
          message: `درجة السؤال ${question.question_id} غير رقمية للطالب ${studentName}.`,
        });
        continue;
      }

      if (score < 0 || score > question.max_score) {
        warnings.push({
          row: rowIndex + 1,
          question_id: question.question_id,
          message: `درجة السؤال ${question.question_id} للطالب ${studentName} خارج المدى المتوقع.`,
        });
      }

      parsedRows.push({
        student_id: studentId || String(studentsCount),
        student_name: studentName,
        subject: metadata.subject || "نافس",
        grade_level: metadata.grade_level || "",
        class_name: metadata.class_name || "",
        semester: metadata.semester || "",
        assessment_title: metadata.assessment_title || "تحليل تدريب نافس",
        assessment_purpose: metadata.assessment_purpose || "تحليل نواتج تعلم نافس",
        assessment_timing: metadata.assessment_timing || "تدريب نافس",
        assessment_date: metadata.assessment_date || "",
        national_exam_type: metadata.national_exam_type || "nafs",
        analysis_type: metadata.analysis_type || "nafs",
        skill: question.learning_outcome,
        learning_outcome: question.learning_outcome,
        domain: question.domain,
        item_id: question.question_id,
        score,
        max_score: question.max_score,
      } as ParsedAssessmentRow);
    }
  }

  if (parsedRows.length === 0) {
    throw new Error("لم يتم استخراج أي نتائج صالحة من قالب نافس.");
  }

  return {
    rows: parsedRows,
    warnings,
    studentsCount,
  };
}

function findHeaderIndex(
  header: string[],
  candidates: string[],
  required = true
) {
  const normalizedCandidates = candidates.map(normalizeHeader);

  const index = header.findIndex((value) =>
    normalizedCandidates.includes(value)
  );

  if (required && index === -1) {
    return -1;
  }

  return index;
}

function normalizeHeader(value: string) {
  return normalizeArabicDigits(value)
    .replace(/\s+/g, "")
    .replace(/[ـ_\-:：]/g, "")
    .trim();
}

function normalizeQuestionId(value: string | number | null | undefined) {
  const text = normalizeHeader(String(value || ""));

  const match = text.match(/^س?(\d+)$/);

  if (match?.[1]) {
    return `س${match[1]}`;
  }

  return text;
}

function normalizeText(value: string | number | null | undefined) {
  return normalizeArabicDigits(String(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArabicDigits(value: string) {
  const map: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return value.replace(/[٠-٩]/g, (digit) => map[digit] || digit);
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;

  const normalized = normalizeArabicDigits(String(value || ""))
    .replace(",", ".")
    .trim();

  if (!normalized) return Number.NaN;

  return Number(normalized);
}

function findDuplicate(values: string[]) {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }

  return "";
}
