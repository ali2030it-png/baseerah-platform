import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="تحليل نافس"
      title="تحليل نواتج تعلم نافس"
      description="خدمة مستقلة لتحليل نتائج التدريب المرتبط بنافس، وتشخيص نواتج التعلم، وتحديد فرص التحسين وخطط الدعم."
      actions={[
        {
          title: "تحميل قالب نافس",
          description: "قالب Excel عربي باتجاه من اليمين إلى اليسار، يربط الأسئلة بنواتج التعلم.",
          href: "/templates/baseerah-nafs",
        },
        {
          title: "رفع وتحليل نافس",
          description: "ارفع قالب نافس وحلل النتائج حسب نواتج التعلم دون التأثير على التحليل العام.",
          href: "/dashboard/analysis/nafs/upload",
        },
        {
          title: "عرض التقارير",
          description: "انتقل إلى تقاريرك التربوية بعد حفظ تحليل نافس.",
          href: "/dashboard/reports",
        },
      ]}
    />
  );
}
