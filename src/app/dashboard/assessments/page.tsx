import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="اختبارات نهاية العام"
      title="تحليل اختبارات نهاية العام"
      description="ارفع نتائج الاختبارات الختامية واحفظ التحليل ليظهر في تقاريرك وتقارير مدير النظام."
      actions={[
        {
          title: "رفع نتائج الاختبار",
          description: "تحليل نتائج نهاية الفترة أو الفصل أو العام.",
          href: "/dashboard/analysis/upload",
        },
      ]}
    />
  );
}
