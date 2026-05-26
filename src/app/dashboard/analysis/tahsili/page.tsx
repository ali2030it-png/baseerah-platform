import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="تحليل التحصيلي"
      title="تحليل نتائج التحصيلي"
      description="صفحة مخصصة لتحليل نتائج التحصيلي، وربطها لاحقًا بالتقارير والمؤشرات العامة."
      actions={[
        {
          title: "رفع نتائج التحصيلي",
          description: "ابدأ بتحليل النتائج من مركز الإدخال.",
          href: "/dashboard/analysis/upload",
        },
      ]}
    />
  );
}
