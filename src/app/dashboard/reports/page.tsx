import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="التقارير"
      title="التقارير التربوية"
      description="هنا تُعرض تقارير التحليل والخطط العلاجية وقياس الأثر بعد اكتمال حفظ التحليلات."
      actions={[
        {
          title: "إنشاء تحليل جديد",
          description: "احفظ تحليلًا جديدًا حتى يظهر ضمن التقارير.",
          href: "/dashboard/analysis/upload",
        },
      ]}
    />
  );
}
