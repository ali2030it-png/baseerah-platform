import { EducationalReport } from "@/lib/reports/report-builder";

export function OfficialReportShell({
  report,
}: {
  report: EducationalReport;
}) {
  return (
    <article
      dir="rtl"
      className="mx-auto min-h-screen max-w-5xl bg-white p-6 text-slate-950 print:max-w-none print:p-0"
    >
      <div className="report-page rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <OfficialReportHeader report={report} />

        <section className="mt-8">
          <h2 className="text-2xl font-black">{report.title}</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{report.subtitle}</p>
        </section>

        <ReportMeta report={report} />
        <ExecutiveSummary report={report} />
        <EducationalAnalysis report={report} />
        <WeakSkillsTable report={report} />
        <Recommendations report={report} />
        <SignatureArea />
      </div>
    </article>
  );
}

function OfficialReportHeader({ report }: { report: EducationalReport }) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="text-right text-sm font-black leading-7">
          <p>المملكة العربية السعودية</p>
          <p>{report.organization.ministry}</p>
          <p>{report.organization.region}</p>
        </div>

        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-lg font-black text-teal-700 ring-1 ring-teal-100">
            بصيرة
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            منصة تحليل تعلم وتشخيص تربوي
          </p>
        </div>

        <div className="text-left text-xs font-bold leading-6 text-slate-500">
          <p>رقم التقرير: {report.report_number}</p>
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
    <section className="mt-6 grid gap-3 md:grid-cols-5 print:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black text-slate-500">{label}</p>
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
    <section className="mt-8">
      <SectionTitle title="الملخص التنفيذي" />
      <div className="mt-4 grid gap-3 md:grid-cols-3 print:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-black text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-teal-700">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationalAnalysis({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-8">
      <SectionTitle title="التحليل التربوي" />
      <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <p className="text-sm font-bold leading-8 text-slate-700">
          {report.summary.educational_summary}
        </p>
      </div>
    </section>
  );
}

function WeakSkillsTable({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-8">
      <SectionTitle title="المهارات الحرجة" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs font-black text-slate-500">
            <tr>
              <th className="p-4">المهارة</th>
              <th className="p-4">ناتج التعلم</th>
              <th className="p-4">متوسط الإتقان</th>
              <th className="p-4">عدد المتعثرين</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.weak_skills.length > 0 ? (
              report.weak_skills.map((skill) => (
                <tr key={`${skill.skill}-${skill.learning_outcome}`}>
                  <td className="p-4 font-black">{skill.skill}</td>
                  <td className="p-4">{skill.learning_outcome || "-"}</td>
                  <td className="p-4 font-black text-teal-700">{skill.average_mastery}%</td>
                  <td className="p-4">{skill.at_risk_count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center font-black text-slate-400">
                  لا توجد مهارات حرجة في هذا التحليل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Recommendations({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-8">
      <SectionTitle title="التوصيات العلاجية" />
      <div className="mt-4 space-y-3">
        {report.recommendations.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-7">
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignatureArea() {
  return (
    <footer className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 text-sm font-bold">
      <div>
        <p>معد التقرير:</p>
        <p className="mt-8">التوقيع: ........................</p>
      </div>
      <div>
        <p>اعتماد:</p>
        <p className="mt-8">التوقيع: ........................</p>
      </div>
    </footer>
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
