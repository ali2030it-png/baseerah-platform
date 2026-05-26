import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="تحليل القدرات"
      title="تحليل نتائج القدرات"
      description="صفحة مخصصة لتحليل نتائج القدرات عند توفر البيانات، مع إمكانية البدء من مركز إدخال النتائج."
      actions={[
        {
          title: "رفع نتائج القدرات",
          description: "ابدأ بإدخال النتائج وحفظ التحليل.",
          href: "/dashboard/analysis/upload",
        },
      ]}
    />
  );
}
