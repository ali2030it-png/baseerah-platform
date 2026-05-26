import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="تحليل نافس"
      title="تحليل نتائج نافس"
      description="ابدأ برفع نتائج نافس أو إدخالها يدويًا، ثم احفظ التحليل ليظهر في تقارير المدير العام."
      actions={[
        {
          title: "رفع نتائج نافس",
          description: "استخدم مركز إدخال النتائج لتحليل المهارات والمؤشرات المرتبطة بنافس.",
          href: "/dashboard/analysis/upload",
        },
        {
          title: "عرض التقارير",
          description: "انتقل إلى تقاريرك التربوية بعد حفظ التحليل.",
          href: "/dashboard/reports",
        },
      ]}
    />
  );
}
