"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  ClipboardPaste,
  FileSpreadsheet,
  Keyboard,
  UploadCloud,
} from "lucide-react";

import {
  parseAssessmentExcel,
  parsePastedTable,
  ParsedAssessmentRow,
} from "@/lib/analysis/excel-parser";

type InputMode = "excel" | "quick" | "paste" | "image";

const purposeLabels: Record<string, string> = {
  diagnostic: "تشخيصي",
  formative: "تكويني",
  summative: "ختامي",
  learning_outcome: "ناتج تعلم محدد",
  training: "تدريب",
  impact_pre: "قياس قبلي",
  impact_post: "قياس بعدي",
};

const timingLabels: Record<string, string> = {
  daily: "يومي / قصير",
  weekly: "أسبوعي",
  period_end: "نهاية فترة",
  term_end: "نهاية فصل",
  year_end: "نهاية عام",
  national: "اختبار وطني",
};

export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>("excel");
  const [rows, setRows] = useState<ParsedAssessmentRow[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    assessment_date: "",
  });

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const parsed = await parseAssessmentExcel(file);
      setRows(parsed);
    } catch {
      setError("تعذر قراءة ملف Excel. تأكد من استخدام قالب بصيرة الموحد.");
    }

    setLoading(false);
  }

  function handlePasteParse() {
    const parsed = parsePastedTable(pasteText);
    setRows(parsed);
  }

  function addQuickRow() {
    if (!quick.student_name || !quick.subject || !quick.skill) {
      setError("أكمل اسم الطالب والمادة والمهارة.");
      return;
    }

    setRows((current) => [...current, quick]);
    setError("");

    setQuick({
      ...quick,
      student_name: "",
      student_id: "",
      score: 0,
    });
  }

  const stats = useMemo(() => {
    const students = new Set(rows.map((row) => row.student_id || row.student_name)).size;
    const skills = new Set(rows.map((row) => row.skill)).size;

    const validRows = rows.filter((row) => row.max_score > 0);
    const avg =
      validRows.length === 0
        ? "0"
        : (
            validRows.reduce(
              (acc, row) => acc + (row.score / row.max_score) * 100,
              0
            ) / validRows.length
          ).toFixed(1);

    return { students, skills, avg };
  }, [rows]);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">مركز إدخال النتائج</p>
        <h1 className="mt-2 text-3xl font-black">إدخال نتائج الطلاب</h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-slate-600">
          اختر الطريقة الأنسب: رفع Excel، إدخال سريع من الجوال، لصق جدول، أو تصوير النتيجة لاحقًا.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <ModeButton active={mode === "excel"} onClick={() => setMode("excel")} icon={<FileSpreadsheet size={18} />} title="رفع Excel" />
          <ModeButton active={mode === "quick"} onClick={() => setMode("quick")} icon={<Keyboard size={18} />} title="إدخال سريع" />
          <ModeButton active={mode === "paste"} onClick={() => setMode("paste")} icon={<ClipboardPaste size={18} />} title="لصق جدول" />
          <ModeButton active={mode === "image"} onClick={() => setMode("image")} icon={<Camera size={18} />} title="تصوير النتيجة" />
        </div>
      </section>

      {mode === "excel" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">رفع قالب بصيرة الموحد</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">
            الأعمدة المطلوبة: student_name, student_id, subject, skill, learning_outcome, score, max_score, assessment_purpose, assessment_timing, national_exam_type, grade_level, class_name, assessment_date
          </p>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800">
            <UploadCloud size={18} />
            رفع ملف Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
          </label>
        </section>
      )}

      {mode === "quick" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">إدخال سريع من الجوال</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Input label="اسم الطالب" value={quick.student_name} onChange={(v) => setQuick({ ...quick, student_name: v })} />
            <Input label="رقم الطالب" value={quick.student_id} onChange={(v) => setQuick({ ...quick, student_id: v })} />
            <Input label="المادة" value={quick.subject} onChange={(v) => setQuick({ ...quick, subject: v })} />
            <Input label="المهارة" value={quick.skill} onChange={(v) => setQuick({ ...quick, skill: v })} />
            <Input label="ناتج التعلم" value={quick.learning_outcome} onChange={(v) => setQuick({ ...quick, learning_outcome: v })} />
            <Input label="الصف" value={quick.grade_level} onChange={(v) => setQuick({ ...quick, grade_level: v })} />
            <Input label="الفصل" value={quick.class_name} onChange={(v) => setQuick({ ...quick, class_name: v })} />
            <NumberInput label="الدرجة" value={quick.score} onChange={(v) => setQuick({ ...quick, score: v })} />
            <NumberInput label="الدرجة العظمى" value={quick.max_score} onChange={(v) => setQuick({ ...quick, max_score: v })} />

            <Select label="غرض التقويم" value={quick.assessment_purpose} options={purposeLabels} onChange={(v) => setQuick({ ...quick, assessment_purpose: v })} />
            <Select label="توقيت الاختبار" value={quick.assessment_timing} options={timingLabels} onChange={(v) => setQuick({ ...quick, assessment_timing: v })} />
          </div>

          <button onClick={addQuickRow} className="mt-5 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white">
            إضافة النتيجة
          </button>
        </section>
      )}

      {mode === "paste" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">لصق جدول من Excel</h2>
          <textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            className="mt-4 min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-teal-600"
            placeholder="الصق الجدول هنا مع صف العناوين..."
          />
          <button onClick={handlePasteParse} className="mt-4 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white">
            تحليل النص الملصق
          </button>
        </section>
      )}

      {mode === "image" && (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <Camera className="mx-auto text-teal-700" size={42} />
          <h2 className="mt-4 text-2xl font-black">تصوير النتيجة</h2>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
            هذه الميزة ستُفعّل لاحقًا بعد استقرار قالب الإدخال والتحليل؛ وسيتم فيها قراءة صورة كشف الدرجات تلقائيًا.
          </p>
        </section>
      )}

      {loading && <Notice text="جارٍ قراءة الملف..." />}
      {error && <Notice text={error} danger />}

      {rows.length > 0 && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Stat title="عدد الطلاب" value={stats.students} />
            <Stat title="عدد المهارات" value={stats.skills} />
            <Stat title="متوسط الإتقان" value={`${stats.avg}%`} />
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-xl font-black">معاينة البيانات</h2>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[1400px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-black text-slate-500">
                  <tr>
                    <th className="p-4">الطالب</th>
                    <th className="p-4">المادة</th>
                    <th className="p-4">المهارة</th>
                    <th className="p-4">ناتج التعلم</th>
                    <th className="p-4">الدرجة</th>
                    <th className="p-4">العظمى</th>
                    <th className="p-4">الغرض</th>
                    <th className="p-4">التوقيت</th>
                    <th className="p-4">الصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 30).map((row, index) => (
                    <tr key={index}>
                      <td className="p-4 font-bold">{row.student_name}</td>
                      <td className="p-4">{row.subject}</td>
                      <td className="p-4">{row.skill}</td>
                      <td className="p-4">{row.learning_outcome}</td>
                      <td className="p-4 font-black text-teal-700">{row.score}</td>
                      <td className="p-4">{row.max_score}</td>
                      <td className="p-4">{purposeLabels[row.assessment_purpose] || row.assessment_purpose}</td>
                      <td className="p-4">{timingLabels[row.assessment_timing] || row.assessment_timing}</td>
                      <td className="p-4">{row.grade_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function ModeButton({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button onClick={onClick} className={[
      "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition",
      active ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600",
    ].join(" ")}>
      {icon}
      {title}
    </button>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-600" />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-600" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-600">
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </label>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-teal-700">{value}</h2>
    </div>
  );
}

function Notice({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <section className={[
      "rounded-[2rem] border p-5 text-sm font-black",
      danger ? "border-rose-100 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600",
    ].join(" ")}>
      {text}
    </section>
  );
}
