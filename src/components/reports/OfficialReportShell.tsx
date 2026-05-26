import { EducationalReport } from "@/lib/reports/report-builder";

export function OfficialReportShell({ report }: { report: EducationalReport }) {
  return (
    <article dir="rtl" className="mx-auto max-w-5xl bg-white p-4 text-slate-950 print:max-w-none print:p-0">
      <div className="report-page rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <OfficialReportHeader report={report} />

        <section className="mt-5 text-center">
          <h1 className="text-3xl font-black">{report.title}</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">{report.subtitle}</p>
        </section>

        <ReportMeta report={report} />
        <ExecutiveSummary report={report} />
        <ProfessionalNotes report={report} />
        <EducationalAnalysis report={report} />
        <MasteryVisual report={report} />
        <WeakSkillsCards report={report} />
        <Recommendations report={report} />
        <SignatureArea />
      </div>
    </article>
  );
}

function OfficialReportHeader({ report }: { report: EducationalReport }) {
  return (
    <header className="border-b border-slate-200 pb-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <div className="text-right text-sm font-black leading-7">
          <p>المملكة العربية السعودية</p>
          <p>{report.organization.ministry}</p>
          <p>{report.organization.region}</p>
        </div>

        <div className="flex justify-center">
          <img
            src="/moe-logo.png"
            alt="شعار وزارة التعليم"
            className="h-16 w-16 object-contain"
          />
        </div>

        <div className="text-left text-xs font-bold leading-6 text-slate-500">
          <p>
            رقم التقرير:{" "}
            <span dir="ltr" className="inline-block font-black">
              {report.report_number}
            </span>
          </p>
          <p>تاريخ الإصدار: {report.generated_at}</p>
          <p>المدرسة: {report.organization.school}</p>
        </div>
      </div>
    </header>
  );
}

function ReportMeta({ report }: { report: EducationalReport }) {
  const items = [
    ["المادة", report.assessment.subject],
    ["الصف", report.assessment.grade_level],
    ["الفصل", report.assessment.class_name],
    ["غرض التقويم", report.assessment.purpose],
    ["توقيت الاختبار", report.assessment.timing],
  ];

  return (
    <section className="mt-5 grid gap-2 md:grid-cols-5 print:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[11px] font-black text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-black">{value}</p>
        </div>
      ))}
    </section>
  );
}

function ExecutiveSummary({ report }: { report: EducationalReport }) {
  const items = [
    ["متوسط الإتقان", `${report.summary.overall_mastery}%`],
    ["تصنيف الأداء", report.summary.performance_label],
    ["عدد الطلاب", report.summary.total_students],
    ["عدد المهارات", report.summary.total_skills],
    ["المهارات الحرجة", report.summary.weak_skills_count],
    ["الطلاب المتعثرون", report.summary.students_at_risk_count],
  ];

  return (
    <section className="mt-6 avoid-break">
      <SectionTitle title="الملخص التنفيذي" />
      <div className="mt-3 grid gap-2 md:grid-cols-3 print:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 p-3">
            <p className="text-[11px] font-black text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-teal-700">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfessionalNotes({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-5 grid gap-3 avoid-break">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold leading-8 text-slate-700">
          {report.summary.sample_note}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold leading-8 text-slate-700">
          {report.summary.assessment_note}
        </p>
      </div>
    </section>
  );
}

function EducationalAnalysis({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-5 avoid-break">
      <SectionTitle title="التحليل التربوي" />
      <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm font-bold leading-8 text-slate-700">
          {report.summary.educational_summary}
        </p>
      </div>
    </section>
  );
}

function MasteryVisual({ report }: { report: EducationalReport }) {
  const value = Math.max(0, Math.min(100, report.summary.overall_mastery));

  return (
    <section className="mt-5 avoid-break">
      <SectionTitle title="المؤشر البصري للإتقان" />
      <div className="mt-3 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm font-black">
          <span>مستوى الإتقان العام</span>
          <span className="text-teal-700">{value}%</span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${value}%` }} />
        </div>
      </div>
    </section>
  );
}

function WeakSkillsCards({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-5 avoid-break">
      <SectionTitle title="تحليل المهارة الحرجة" />

      <div className="mt-3 space-y-3">
        {report.weak_skills.length > 0 ? (
          report.weak_skills.map((skill) => (
            <div key={`${skill.skill}-${skill.learning_outcome}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-4 print:grid-cols-4">
                <InfoItem title="المهارة" value={skill.skill} strong />
                <InfoItem title="ناتج التعلم" value={skill.learning_outcome || "-"} />
                <InfoItem title="متوسط الإتقان" value={`${skill.average_mastery}%`} strong />
                <InfoItem title="عدد المتعثرين" value={skill.at_risk_count} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 print:grid-cols-2">
                <TextBlock title="التحليل النوعي" text={skill.qualitative_diagnosis} />
                <TextBlock title="التدخل المقترح" text={skill.specific_intervention} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 p-5 text-center font-black text-slate-400">
            لا توجد مهارات حرجة في هذا التحليل.
          </div>
        )}
      </div>
    </section>
  );
}

function Recommendations({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-5 avoid-break">
      <SectionTitle title="التوصيات العلاجية" />
      <div className="mt-3 space-y-2">
        {report.recommendations.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold leading-7">
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignatureArea() {
  return (
    <footer className="mt-7 grid grid-cols-2 gap-6 border-t border-slate-200 pt-5 text-sm font-bold avoid-break">
      <div>
        <p>معد التقرير:</p>
        <p className="mt-6">التوقيع: ........................</p>
      </div>
      <div>
        <p>اعتماد:</p>
        <p className="mt-6">التوقيع: ........................</p>
      </div>
    </footer>
  );
}

function InfoItem({
  title,
  value,
  strong = false,
}: {
  title: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[11px] font-black text-slate-500">{title}</p>
      <p className={["mt-1 text-sm", strong ? "font-black text-teal-700" : "font-bold text-slate-700"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-black text-slate-500">{title}</p>
      <p className="mt-2 text-sm font-bold leading-8 text-slate-700">{text}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-1.5 rounded-full bg-teal-700" />
      <h3 className="text-xl font-black">{title}</h3>
    </div>
  );
}
