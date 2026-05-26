import { EducationalReport } from "@/lib/reports/report-builder";

export function OfficialReportShell({ report }: { report: EducationalReport }) {
  return (
    <article dir="rtl" className="mx-auto max-w-5xl bg-white p-4 text-slate-950 print:max-w-none print:p-0">
      <div className="report-page rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <OfficialReportHeader report={report} />

        <section className="mt-5 text-center">
          <h1 className="text-3xl font-black">تقرير تحليل نتائج الطلاب</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">
            تحليل تربوي مبني على مؤشرات الإتقان والمهارات الحرجة
          </p>
        </section>

        <ReportMeta report={report} />
        <ExecutiveSummary report={report} />
        <EducationalAnalysis report={report} />
        <MasteryVisual report={report} />
        <WeakSkillsTable report={report} />
        <Recommendations report={report} />
        <SignatureArea />
      </div>
    </article>
  );
}

function OfficialReportHeader({ report }: { report: EducationalReport }) {
  return (
    <header className="border-b border-slate-200 pb-4">
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="text-right text-sm font-black leading-7">
          <p>المملكة العربية السعودية</p>
          <p>{report.organization.ministry}</p>
          <p>{report.organization.region}</p>
        </div>

        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-base font-black text-teal-700 ring-1 ring-teal-100">
            بصيرة
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            منصة تحليل تعلم وتشخيص تربوي
          </p>
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
    <section className="mt-6">
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

function EducationalAnalysis({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-6">
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
    <section className="mt-6">
      <SectionTitle title="المؤشر البصري للإتقان" />
      <div className="mt-3 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm font-black">
          <span>مستوى الإتقان العام</span>
          <span className="text-teal-700">{value}%</span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${value}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
          <span>متعثر</span>
          <span>بحاجة إلى تحسين</span>
          <span>متقن</span>
          <span>إتقان مرتفع</span>
        </div>
      </div>
    </section>
  );
}

function WeakSkillsTable({ report }: { report: EducationalReport }) {
  return (
    <section className="mt-6">
      <SectionTitle title="المهارات الحرجة" />
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs font-black text-slate-500">
            <tr>
              <th className="p-3">المهارة</th>
              <th className="p-3">ناتج التعلم</th>
              <th className="p-3">متوسط الإتقان</th>
              <th className="p-3">عدد المتعثرين</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.weak_skills.length > 0 ? (
              report.weak_skills.map((skill) => (
                <tr key={`${skill.skill}-${skill.learning_outcome}`}>
                  <td className="p-3 font-black">{skill.skill}</td>
                  <td className="p-3">{skill.learning_outcome || "-"}</td>
                  <td className="p-3 font-black text-teal-700">{skill.average_mastery}%</td>
                  <td className="p-3">{skill.at_risk_count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-5 text-center font-black text-slate-400">
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
    <section className="mt-6">
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
    <footer className="mt-7 grid grid-cols-2 gap-6 border-t border-slate-200 pt-5 text-sm font-bold">
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-1.5 rounded-full bg-teal-700" />
      <h3 className="text-xl font-black">{title}</h3>
    </div>
  );
}
