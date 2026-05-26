export type DashboardMetric = {
  title: string;
  value: number | string;
  description: string;
};

export function buildSuperAdminMetrics(input: {
  users: number;
  schools: number;
  regions: number;
  analyses: number;
  mastery: number;
  atRisk: number;
}) {
  return [
    {
      title: "المستخدمون",
      value: input.users,
      description: "إجمالي مستخدمي منصة بصيرة",
    },
    {
      title: "المدارس",
      value: input.schools,
      description: "المدارس المرتبطة بالمنصة",
    },
    {
      title: "المناطق",
      value: input.regions,
      description: "المناطق التعليمية",
    },
    {
      title: "التحليلات",
      value: input.analyses,
      description: "عمليات تحليل النتائج",
    },
    {
      title: "متوسط الإتقان",
      value: `${input.mastery}%`,
      description: "الإتقان العام",
    },
    {
      title: "الطلاب المتعثرون",
      value: input.atRisk,
      description: "الحالات الحرجة",
    },
  ];
}
