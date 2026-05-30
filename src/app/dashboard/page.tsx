import Link from "next/link";
import { FileSpreadsheet, FileText, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "إدخال نتائج الطلاب",
    desc: "أدخل النتائج عبر ملف Excel أو الإدخال اليدوي، ثم دع بصيرة تحول الدرجات إلى مؤشرات إتقان وتشخيص تربوي واضح.",
    href: "/dashboard/analysis/upload",
    icon: FileSpreadsheet,
  },
  {
    title: "التقارير التربوية",
    desc: "تقارير تحليلية مرتبة تتضمن مؤشرات الإتقان، الرسوم البيانية، النتائج التفصيلية، والتوصيات التربوية.",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
</div>
  );
}
