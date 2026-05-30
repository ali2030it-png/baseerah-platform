"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Save, UploadCloud } from "lucide-react";

import {
  parseNafsWorkbookFile,
  type NafsParseWarning,
  type NafsQuestionMapItem,
} from "@/lib/analysis/nafs-parser";
import type { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";
import {
  analyzeAssessmentRows,
  masteryLabel,
} from "@/lib/analysis/skill-analytics";
import { saveAnalysisRecordToDatabase } from "@/lib/analysis/save-analysis-record";
import {
  semesterLabels,
  subjectLabels,
} from "@/lib/analysis/assessment-metadata";
import { supabase } from "@/lib/supabase/client";

const nafsGradeLevelLabels: Record<string, string> = {
  "": "اختر الصف المستهدف",
  "الثالث الابتدائي": "الثالث الابتدائي",
  "السادس الابتدائي": "السادس الابتدائي",
  "الثالث المتوسط": "الثالث المتوسط",
};

const DEFAULT_METADATA = {
  subject: "",
  grade_level: "",
  class_name: "",
  semester: "",
  assessment_title: "تحليل تدريب نافس - نواتج التعلم",
  assessment_purpose: "nafs",
  assessment_timing: "تدريب نافس",
  assessment_date: "",
  national_exam_type: "nafs",
  analysis_type: "nafs",
  max_score: 1,
};

export default function NafsUploadPage() {
  const [rows, setRows] = useState<ParsedAssessmentRow[]>([]);
  const [questionMap, setQuestionMap] = useState<NafsQuestionMapItem[]>([]);
  const [warnings, setWarnings] = useState<NafsParseWarning[]>([]);
  const [metadata, setMetadata] = useState(DEFAULT_METADATA);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const analysis = useMemo(() => analyzeAssessmentRows(rows), [rows]);

  function validateMetadata() {
    if (!metadata.subject) return "اختر المادة قبل رفع ملف نافس.";
    if (!metadata.grade_level) return "اختر الصف المستهدف قبل رفع ملف نافس.";

    if (!Object.keys(nafsGradeLevelLabels).includes(metadata.grade_level)) {
      return "تحليل نافس في بصيرة مخصص حاليًا للصف الثالث الابتدائي، والسادس الابتدائي، والثالث المتوسط.";
    }
    if (!metadata.semester) return "اختر الفصل الدراسي قبل رفع ملف نافس.";
    return "";
  }

  async function handleNafsFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    const validationMessage = validateMetadata();

    if (validationMessage) {
      setError(validationMessage);
      input.value = "";
      return;
    }

    setLoading(true);
    setError("");
    setSaveMessage("");
    setWarnings([]);
    setRows([]);
    setQuestionMap([]);

    try {
      const parsed = await parseNafsWorkbookFile(file, metadata);

      setRows(parsed.rows);
      setQuestionMap(parsed.question_map);
      setWarnings(parsed.warnings);
    } catch (parseError: any) {
      setError(parseError?.message || "تعذر قراءة قالب نافس. تأكد من استخدام القالب المعتمد.");
    } finally {
      setLoading(false);
      input.value = "";
    }
  }

  async function saveNafsAnalysis() {
    setError("");
    setSaveMessage("");

    if (rows.length === 0 || analysis.total_rows === 0) {
      setError("لا توجد بيانات نافس صالحة للحفظ.");
      return;
    }

    const validationMessage = validateMetadata();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setError("تعذر حفظ تحليل نافس؛ يرجى تسجيل الدخول مرة أخرى.");
      return;
    }

    try {
      const result = await saveAnalysisRecordToDatabase({
        userId: user.id,
        rows,
        analysis,
        metadata: metadata as any,
      });

      if (result.status === "created") {
        setSaveMessage("تم حفظ تحليل نافس بنجاح، وسيظهر في صفحة التقارير.");
      } else if (result.status === "updated") {
        setSaveMessage("تم تحديث تحليل نافس المحفوظ بنجاح دون إنشاء تقرير مكرر.");
      } else {
        setSaveMessage("لم تتغير بيانات نافس؛ التقرير محفوظ مسبقًا دون تكرار.");
      }
    } catch (saveError: any) {
      setError(saveError?.message || "تعذر حفظ تحليل نافس.");
    }

    setSaving(false);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">تحليل نافس</p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          تحليل نواتج تعلم نافس
        </h1>

        <p className="mt-2 max-w-4xl text-sm font-bold leading-7 text-slate-600">
          خدمة مستقلة لتحليل نتائج التدريب المرتبط بنافس؛ تربط كل سؤال بناتج تعلم، ثم تعرض مستوى الإتقان، وجوانب القوة، وفرص التحسين، والطلاب المحتاجين للدعم.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/templates/baseerah-nafs"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            <FileSpreadsheet size={18} />
            تحميل قالب نافس
          </a>

          <a
            href="/dashboard/reports"
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700"
          >
            عرض التقارير
          </a>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          بيانات تدريب نافس
        </h2>

        <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
          هذه البيانات تظهر في التقرير، بينما تفاصيل نواتج التعلم تُقرأ من ورقة خريطة نواتج التعلم داخل القالب.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Select
            label="المادة"
            value={metadata.subject}
            options={subjectLabels}
            onChange={(value) => setMetadata({ ...metadata, subject: value })}
          />

          <Select
            label="الصف"
            value={metadata.grade_level}
            options={nafsGradeLevelLabels}
            onChange={(value) => setMetadata({ ...metadata, grade_level: value })}
          />

          <Input
            label="الشعبة"
            value={metadata.class_name}
            onChange={(value) => setMetadata({ ...metadata, class_name: value })}
          />

          <Select
            label="الفصل الدراسي"
            value={metadata.semester}
            options={semesterLabels}
            onChange={(value) => setMetadata({ ...metadata, semester: value })}
          />

          <Input
            label="عنوان التدريب"
            value={metadata.assessment_title}
            onChange={(value) =>
              setMetadata({ ...metadata, assessment_title: value })
            }
          />

          <Input
            label="تاريخ التدريب"
            value={metadata.assessment_date}
            onChange={(value) =>
              setMetadata({ ...metadata, assessment_date: value })
            }
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          رفع قالب نافس
        </h2>

        <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
          ارفع ملف نافس المعتمد الذي يحتوي على ورقة نتائج الطلاب وورقة خريطة نواتج التعلم.
        </p>

        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800">
          <UploadCloud size={18} />
          رفع ملف نافس
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleNafsFile}
          />
        </label>

        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-bold leading-7 text-teal-800">
          لا يتم تخزين ملف Excel الأصلي؛ يتم استخراج بيانات التحليل والتقرير فقط.
        </div>
      </section>

      {loading && <Notice text="جارٍ قراءة قالب نافس..." />}
      {error && <Notice text={error} danger />}

      {warnings.length > 0 && (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-800">
          <h3 className="text-base font-black">تنبيهات جودة البيانات</h3>

          <ul className="mt-2 list-disc space-y-1 pr-5">
            {warnings.slice(0, 8).map((warning, index) => (
              <li key={`${warning.question_id}-${index}`}>
                {warning.message}
              </li>
            ))}
          </ul>

          {warnings.length > 8 && (
            <p className="mt-2">يوجد {warnings.length - 8} تنبيه إضافي.</p>
          )}
        </section>
      )}

      {saveMessage && (
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-sm font-black text-emerald-700">
          <p>{saveMessage}</p>

          <a
            href="/dashboard/reports"
            className="mt-4 inline-flex rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white"
          >
            عرض تحليلاتي المحفوظة
          </a>
        </section>
      )}

      {rows.length > 0 && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Stat title="عدد الطلاب" value={analysis.total_students} />
            <Stat title="نواتج التعلم" value={questionMap.length} />
            <Stat title="متوسط الإتقان" value={`${analysis.overall_mastery}%`} />
            <Stat title="مستوى الإتقان" value={masteryLabel(analysis.level)} />
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-teal-700">
                  معاينة تحليل نافس
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  راجع نواتج التعلم قبل الحفظ
                </h2>

                <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
                  لا تحفظ التحليل حتى تتأكد من عدد الطلاب، وعدد الأسئلة، وخريطة نواتج التعلم.
                </p>
              </div>

              <button
                type="button"
                onClick={saveNafsAnalysis}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "جارٍ الحفظ..." : "حفظ تحليل نافس"}
              </button>
            </div>

            <OutcomeTable rows={analysis.skill_analysis.slice(0, 10)} />

            <p className="mt-5 text-sm font-bold leading-7 text-slate-600">
              {analysis.educational_summary}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Stat title="الأسئلة المقروءة" value={questionMap.length} />
              <Stat title="نواتج بحاجة متابعة" value={analysis.weak_skills.length} />
              <Stat title="صفوف التحليل" value={analysis.total_rows} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">عينة من صفوف التحليل</h2>

            <PreviewTable rows={rows.slice(0, 12)} totalRows={rows.length} />
          </section>
        </>
      )}
    </main>
  );
}

function OutcomeTable({ rows }: { rows: any[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full text-right text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="border-l border-slate-200 p-3">ناتج التعلم</th>
            <th className="border-l border-slate-200 p-3">الإتقان</th>
            <th className="border-l border-slate-200 p-3">مستوى الإتقان</th>
            <th className="p-3">الإجراء المقترح</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row.skill}-${index}`} className="font-bold">
              <td className="border-l border-slate-100 p-3">{row.skill}</td>
              <td className="border-l border-slate-100 p-3">
                {row.average_mastery}%
              </td>
              <td className="border-l border-slate-100 p-3">
                {masteryLabel(row.level)}
              </td>
              <td className="p-3">{row.recommended_action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewTable({
  rows,
  totalRows,
}: {
  rows: ParsedAssessmentRow[];
  totalRows: number;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full text-right text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="border-l border-slate-200 p-3">رقم الطالب</th>
            <th className="border-l border-slate-200 p-3">اسم الطالب</th>
            <th className="border-l border-slate-200 p-3">ناتج التعلم</th>
            <th className="border-l border-slate-200 p-3">الدرجة</th>
            <th className="p-3">الدرجة العظمى</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row.student_id}-${row.skill}-${index}`} className="font-bold">
              <td className="border-l border-slate-100 p-3">{row.student_id || "-"}</td>
              <td className="border-l border-slate-100 p-3">{row.student_name}</td>
              <td className="border-l border-slate-100 p-3">{row.learning_outcome}</td>
              <td className="border-l border-slate-100 p-3">{row.score}</td>
              <td className="p-3">{row.max_score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalRows > rows.length && (
        <p className="border-t border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-500">
          يتم عرض أول {rows.length} صفًا فقط من أصل {totalRows} صفًا تحليليًا.
        </p>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-teal-600"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-teal-600"
      >
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Notice({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <section
      className={[
        "rounded-[2rem] border p-5 text-sm font-black",
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-teal-100 bg-teal-50 text-teal-800",
      ].join(" ")}
    >
      {text}
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-teal-700">{value}</p>
    </div>
  );
}
