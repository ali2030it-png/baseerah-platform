import { TeacherFeaturePage } from "@/components/basirah/TeacherFeaturePage";

export default function Page() {
  return (
    <TeacherFeaturePage
      eyebrow="الخطط العلاجية"
      title="بناء الخطط العلاجية"
      description="بعد تحليل النتائج، يمكن تحويل المهارات الحرجة والطلاب المتعثرين إلى خطط علاجية قابلة للمتابعة."
      actions={[
        {
          title: "رفع تحليل جديد",
          description: "ابدأ بتحليل النتائج أولًا لتحديد المهارات الحرجة.",
          href: "/dashboard/analysis/upload",
        },
        {
          title: "خططي العلاجية",
          description: "عرض وتنظيم الخطط العلاجية.",
          href: "/dashboard/remedial/plans",
        },
      ]}
    />
  );
}
