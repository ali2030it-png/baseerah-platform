"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Camera,
  ClipboardPaste,
  FileSpreadsheet,
  Keyboard,
  Save,
  UploadCloud,
} from "lucide-react";

import {
  parseAssessmentExcel,
  parsePastedTable,
  ParsedAssessmentRow,
} from "@/lib/analysis/excel-parser";

import {
  analyzeAssessmentRows,
  masteryLabel,
} from "@/lib/analysis/skill-analytics";

import { saveAnalysisRecordToDatabase } from "@/lib/analysis/save-analysis-record";

import {
  applyAssessmentMetadataToRows,
  assessmentTimingLabels,
  defaultAssessmentMetadata,
  gradeLevelLabels,
  semesterLabels,
  subjectLabels,
  validateAssessmentMetadata,
} from "@/lib/analysis/assessment-metadata";

import { supabase } from "@/lib/supabase/client";

type InputMode = "excel" | "quick" | "paste" | "image";

export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>("excel");
  const [rows, setRows] = useState<ParsedAssessmentRow[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [metadata, setMetadata] = useState(defaultAssessmentMetadata);

  const [quick, setQuick] = useState<ParsedAssessmentRow>({
    student_name: "",
    student_id: "",
    subject: "",
    skill: "",
    learning_outcome: "",
    score: 0,
    max_score: 10,
    assessment_purpose: "formative",
    assessment_timing: "daily",
    national_exam_type: "none",
    grade_level: "",
    class_name: "",
    semester: "",
    assessment_title: "",
    assessment_date: "",
  });

  const analysis = useMemo(() => analyzeAssessmentRows(rows), [rows]);

  function replaceRows(nextRows: ParsedAssessmentRow[]) {
    setRows(nextRows);
    setSaveMessage("");
  }

  function validateMetadataBeforeImport() {
    const validationMessage = validateAssessmentMetadata(metadata);

    if (validationMessage) {
      setError(validationMessage);
      return false;
    }

    return true;
  }

  async function handleExcelFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!validateMetadataBeforeImport()) {
      input.value = "";
      return;
    }

    setLoading(true);
    setError("");
    setSaveMessage("");

    try {
      const parsed = await parseAssessmentExcel(file);
      const enrichedRows = applyAssessmentMetadataToRows(parsed, metadata);
      replaceRows(enrichedRows);
    } catch {
      setError("تعذر قراءة ملف Excel. تأكد من استخدام قالب بصيرة العربي أو ملف درجات منظم.");
    } finally {
      setLoading(false);
      input.value = "";
    }
  }

  function handlePasteParse() {
    if (!validateMetadataBeforeImport()) return;

    const parsed = parsePastedTable(pasteText);
    const enrichedRows = applyAssessmentMetadataToRows(parsed, metadata);

    replaceRows(enrichedRows);
  }

  function addQuickRow() {
    if (!quick.student_name) {
      setError("أكمل اسم الطالب.");
      return;
    }

    const validationMessage = validateAssessmentMetadata(metadata);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const enriched = applyAssessmentMetadataToRows(
      [
        {
          ...quick,
          score: Number(quick.score) || 0,
          max_score: Number(metadata.max_score) || Number(quick.max_score) || 100,
        },
      ],
      metadata
    )[0];

    replaceRows([...rows, enriched]);
    setError("");

    setQuick({
      ...quick,
      student_name: "",
      student_id: "",
      score: 0,
    });
  }

  async function saveAnalysisRecord() {
    setError("");
    setSaveMessage("");

    if (rows.length === 0 || analysis.total_rows === 0) {
      setError("لا توجد بيانات صالحة للحفظ.");
      return;
    }

    const validationMessage = validateAssessmentMetadata(metadata);

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
      setError("تعذر حفظ التحليل؛ يرجى تسجيل الدخول مرة أخرى.");
      return;
    }

    try {
      const result = await saveAnalysisRecordToDatabase({
        userId: user.id,
        rows,
        analysis,
        metadata,
      });

      if (result.status === "created") {
        setSaveMessage("تم حفظ التحليل بنجاح، وسيظهر في صفحة التقارير.");
      } else if (result.status === "updated") {
        setSaveMessage("تم تحديث التحليل المحفوظ بنجاح دون إنشاء تقرير مكرر.");
      } else {
        setSaveMessage("لم تتغير بيانات الدرجات؛ التقرير محفوظ مسبقًا دون تكرار.");
      }
    } catch (saveError: any) {
      setError(saveError?.message || "تعذر حفظ التحليل.");
    }

    setSaving(false);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">مركز إدخال النتائج</p>

        <h1 className="mt-2 text-3xl font-black">إدخال نتائج الطلاب</h1>

        <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-slate-600">
          عرّف الاختبار أولًا، ثم ارفع ملف Excel أو أدخل النتائج يدويًا أو الصق جدول الدرجات.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <ModeButton
            active={mode === "excel"}
            onClick={() => setMode("excel")}
            icon={<FileSpreadsheet size={18} />}
            title="رفع ملف Excel"
          />

          <ModeButton
            active={mode === "quick"}
            onClick={() => setMode("quick")}
            icon={<Keyboard size={18} />}
            title="إدخال يدوي"
          />

          <ModeButton
            active={mode === "paste"}
            onClick={() => setMode("paste")}
            icon={<ClipboardPaste size={18} />}
            title="لصق جدول"
          />

          <ModeButton
            active={mode === "image"}
            onClick={() => setMode("image")}
            icon={<Camera size={18} />}
            title="تصوير النتيجة"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-teal-700">
              بيانات الاختبار قبل رفع الملف
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              عرّف الاختبار أولًا
            </h2>

            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
              هذه البيانات ستظهر في التحليل والتقرير، وتعالج نقص البيانات في ملفات Excel.
            </p>
          </div>

          <a
            href="/templates/baseerah-simple"
            className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            تحميل قالب Excel العربي
          </a>
        </div>

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
            options={gradeLevelLabels}
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

          <Select
            label="نوع الاختبار"
            value={metadata.assessment_timing}
            options={assessmentTimingLabels}
            onChange={(value) =>
              setMetadata({ ...metadata, assessment_timing: value })
            }
          />

          <NumberInput
            label="الدرجة العظمى"
            value={metadata.max_score}
            onChange={(value) => setMetadata({ ...metadata, max_score: value })}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-bold leading-7 text-teal-800">
          المسار المعتمد حاليًا: رفع ملف Excel أو الإدخال اليدوي، مع حفظ بيانات التحليل والتقرير دون تخزين ملف الدرجات الأصلي.
        </div>
      </section>

      {mode === "excel" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">رفع ملف الدرجات</h2>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
            استخدم قالب بصيرة العربي البسيط، أو ملف Excel يحتوي على أسماء الطلاب ودرجاتهم.
          </p>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800">
            <UploadCloud size={18} />
            رفع ملف Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelFile}
            />
          </label>
        </section>
      )}

      {mode === "quick" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">إدخال يدوي للدرجات</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Input
              label="اسم الطالب"
              value={quick.student_name}
              onChange={(value) => setQuick({ ...quick, student_name: value })}
            />

            <Input
              label="رقم الطالب"
              value={quick.student_id}
              onChange={(value) => setQuick({ ...quick, student_id: value })}
            />

            <NumberInput
              label="الدرجة"
              value={quick.score}
              onChange={(value) => setQuick({ ...quick, score: value })}
            />
          </div>

          <button
            onClick={addQuickRow}
            className="mt-5 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white"
          >
            إضافة النتيجة
          </button>
        </section>
      )}

      {mode === "paste" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">لصق جدول من Excel</h2>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
            الصق جدولًا يحتوي على: رقم الطالب، اسم الطالب، درجة الطالب.
          </p>

          <textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            className="mt-4 min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-teal-600"
            placeholder={"رقم الطالب\tاسم الطالب\tدرجة الطالب"}
          />

          <button
            onClick={handlePasteParse}
            className="mt-4 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white"
          >
            تحليل النص الملصق
          </button>
        </section>
      )}

      {mode === "image" && (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <Camera className="mx-auto text-teal-700" size={42} />

          <h2 className="mt-4 text-2xl font-black">تصوير النتيجة</h2>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
            هذه الميزة ستُفعّل لاحقًا بعد استقرار قوالب الإدخال والتحليل.
          </p>
        </section>
      )}

      {loading && <Notice text="جارٍ قراءة الملف..." />}
      {error && <Notice text={error} danger />}

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
            <Stat title="عدد المهارات" value={analysis.total_skills} />
            <Stat title="متوسط الإتقان" value={`${analysis.overall_mastery}%`} />
            <Stat title="مستوى الإتقان" value={masteryLabel(analysis.level)} />
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-teal-700">
                  معاينة البيانات المستخرجة
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  راجع الطلاب والدرجات قبل الحفظ
                </h2>

                <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
                  لا تحفظ التحليل حتى تتأكد من صحة عدد الطلاب والأسماء والدرجات.
                </p>
              </div>

              <button
                type="button"
                onClick={saveAnalysisRecord}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "جارٍ الحفظ..." : "حفظ التحليل"}
              </button>
            </div>

            <PreviewTable rows={rows.slice(0, 12)} totalRows={rows.length} />

            <p className="mt-5 text-sm font-bold leading-7 text-slate-600">
              {analysis.educational_summary}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Stat title="مجالات المتابعة" value={analysis.weak_skills.length} />
              <Stat title="طلاب بحاجة متابعة" value={analysis.students_at_risk.length} />
              <Stat title="صفوف البيانات الصحيحة" value={analysis.total_rows} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition",
        active
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-slate-200 bg-white text-slate-600",
      ].join(" ")}
    >
      {icon}
      {title}
    </button>
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

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
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
            <th className="border-l border-slate-200 p-3">الدرجة</th>
            <th className="p-3">الدرجة العظمى</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row.student_id}-${index}`} className="font-bold">
              <td className="border-l border-slate-100 p-3">{row.student_id || "-"}</td>
              <td className="border-l border-slate-100 p-3">{row.student_name}</td>
              <td className="border-l border-slate-100 p-3">{row.score}</td>
              <td className="p-3">{row.max_score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalRows > rows.length && (
        <p className="border-t border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-500">
          يتم عرض أول {rows.length} طالبًا فقط من أصل {totalRows} طالبًا.
        </p>
      )}
    </div>
  );
}
