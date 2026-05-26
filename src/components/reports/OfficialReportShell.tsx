import { EducationalReport } from "@/lib/reports/report-builder";

export function OfficialReportShell({ report }: { report: EducationalReport }) {
  return (
    <article dir="rtl" className="mx-auto max-w-5xl bg-white p-3 text-slate-950 print:max-w-none print:p-0">
      <div className="report-page rounded-[1rem] border border-slate-300 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <OfficialReportHeader report={report} />

        <section className="mt-4 text-center">
          <h1 className="text-[2rem] font-black leading-tight">{report.title}</h1>
          <p className="mt-1 text-sm font-bold text-slate-600">{report.subtitle}</p>
        </section>

        <ReportMeta report={report} />
        <ExecutiveSummary report={report} />
        <ProfessionalNotes report={report} />
        <EducationalAnalysis report={report} />
        <MasteryVisual report={report} />
        <WeakSkillsCards report={report} />
        <Recommendations report={report} />
        <SignatureArea report={report} />
      </div>
    </article>
  );
}

function OfficialReportHeader({ report }: { report: EducationalReport }) {
  return (
    <header className="border-b border-slate-300 pb-4">
      <div className="grid grid-cols-[1fr_110px_1fr] items-start gap-8">
        <div className="text-center text-sm font-black leading-7">
          <p>المملكة العربية السعودية</p>
          <p>{report.organization.ministry}</p>
          <p>{report.organization.region}</p>
          <p>{report.organization.school}</p>
        </div>

        <div className="flex justify-center pt-1">
          <img
            src="/moe-logo.png"
            alt="شعار وزارة التعليم"
            className="h-16 w-16 object-contain"
          />
        </div>

        <div className="pr-4 text-right text-xs font-black leading-7 text-slate-700">
          <p>
            رقم التقرير:
            <span dir="ltr" className="mr-2 inline-block font-black tracking-wide">
              {report.report_number}
            </span>
          </p>
          <p>تاريخ الإصدار: {report.generated_at}</p>
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
    <section className="mt-4 grid gap-2 md:grid-cols-5 print:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-center">
          <p className="text-[10px] font-black text-slate-600">{label}</p>
          <p className="mt-0.5 text-sm font-black text-slate-950">{value}</p>
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
    <section className="mt-4 avoid-break">
      <SectionTitle title="الملخص التنفيذي" />
      <div className="mt-3 grid gap-2 md:grid-cols-3 print:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-300 bg-white px-3 py-2.5">
            <p className="text-[10px] font-black text-slate-600">{label}</p>
            <p className="mt-1 text-lg font-black leading-tight text-teal-800">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfessionalNotes({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-4 grid gap-2 avoid-break">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-sm font-bold leading-7 text-slate-800">
          {report.summary.sample_note}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
        <p className="text-sm font-bold leading-7 text-slate-800">
          {report.summary.assessment_note}
        </p>
      </div>
    </section>
  );
}

function EducationalAnalysis({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-4 avoid-break">
      <SectionTitle title="التحليل التربوي" />
      <div className="mt-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
        <p className="text-sm font-bold leading-7 text-slate-800">
          {report.summary.educational_summary}
        </p>
      </div>
    </section>
  );
}

function MasteryVisual({ report }: { report: EducationalReport }) {
  const value = Math.max(0, Math.min(100, report.summary.overall_mastery));

  return (
    <section className="mt-4 avoid-break">
      <SectionTitle title="المؤشر البصري للإتقان" />
      <div className="mt-3 rounded-2xl border border-slate-300 px-4 py-3">
        <div className="flex items-center justify-between text-sm font-black">
          <span>مستوى الإتقان العام</span>
          <span className="text-teal-800">{value}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-300">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${value}%` }} />
        </div>
      </div>
    </section>
  );
}

function WeakSkillsCards({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-4 avoid-break">
      <SectionTitle title="تحليل المهارة الحرجة" />

      <div className="mt-3 space-y-3">
        {report.weak_skills.length > 0 ? (
          report.weak_skills.map((skill) => (
            <div key={`${skill.skill}-${skill.learning_outcome}`} className="rounded-2xl border border-slate-300 bg-white p-3">
              <div className="grid gap-2 md:grid-cols-4 print:grid-cols-4">
                <InfoItem title="المهارة" value={skill.skill} strong />
                <InfoItem title="ناتج التعلم" value={skill.learning_outcome || "-"} />
                <InfoItem title="متوسط الإتقان" value={`${skill.average_mastery}%`} strong />
                <InfoItem title="عدد المتعثرين" value={skill.at_risk_count} />
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 print:grid-cols-2">
                <TextBlock title="التحليل النوعي" text={skill.qualitative_diagnosis} />
                <TextBlock title="التدخل المقترح" text={skill.specific_intervention} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-300 p-4 text-center font-black text-slate-500">
            لا توجد مهارات حرجة في هذا التحليل.
          </div>
        )}
      </div>
    </section>
  );
}

function Recommendations({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-4 avoid-break">
      <SectionTitle title="التوصيات العلاجية" />
      <div className="mt-3 space-y-2">
        {report.recommendations.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-900">
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignatureArea({ report }: { report: EducationalReport }) {
  return (
    <footer className="mt-5 border-t border-slate-300 pt-4 text-sm font-bold avoid-break">
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-300 p-3.5">
          <p className="font-black">معد التقرير</p>
          <p className="mt-2.5">الاسم: {report.approval.preparer_name}</p>
          <p className="mt-5">التوقيع: ........................</p>
        </div>

        <div className="rounded-2xl border border-slate-300 p-3.5">
          <p className="font-black">اعتماد مدير المدرسة</p>
          <p className="mt-2.5">الاسم: {report.approval.principal_name}</p>
          <p className="mt-5">التوقيع: ........................</p>
        </div>
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-black text-slate-600">{title}</p>
      <p className={["mt-1 text-sm leading-6", strong ? "font-black text-teal-800" : "font-bold text-slate-800"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-black text-slate-600">{title}</p>
      <p className="mt-1.5 text-sm font-bold leading-7 text-slate-800">{text}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-6 w-1.5 rounded-full bg-teal-700" />
      <h3 className="text-[1.8rem] font-black leading-none text-slate-950">{title}</h3>
    </div>
  );
}
