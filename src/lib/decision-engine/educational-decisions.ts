export type EducationalDecision = {
  priority: "critical" | "high" | "medium" | "normal";
  title: string;
  description: string;
  action: string;
};

export function generateEducationalDecisions(input: {
  overallMastery: number;
  weakSkillsCount: number;
  riskStudentsCount: number;
  assessmentType: string;
}) {
  const decisions: EducationalDecision[] = [];

  if (input.overallMastery < 60) {
    decisions.push({
      priority: "critical",
      title: "انخفاض التحصيل العام",
      description:
        "تشير النتائج إلى تدنٍ واضح في متوسط الإتقان العام.",
      action:
        "تنفيذ برنامج علاجي مكثف خلال أسبوعين مع إعادة التقويم.",
    });
  }

  if (input.weakSkillsCount >= 3) {
    decisions.push({
      priority: "high",
      title: "تعدد المهارات الحرجة",
      description:
        "يوجد عدد مرتفع من المهارات ذات الإتقان المنخفض.",
      action:
        "إعادة تدريس المهارات باستخدام تعلم نشط وتقويم تكويني.",
    });
  }

  if (input.riskStudentsCount >= 5) {
    decisions.push({
      priority: "high",
      title: "ارتفاع عدد الطلاب المتعثرين",
      description:
        "عدد الطلاب المتعثرين يتطلب تدخلاً تربويًا مباشرًا.",
      action:
        "إعداد خطط علاجية فردية ومتابعة أسبوعية.",
    });
  }

  if (
    input.assessmentType === "national" &&
    input.overallMastery < 70
  ) {
    decisions.push({
      priority: "critical",
      title: "جاهزية منخفضة للاختبارات الوطنية",
      description:
        "النتائج الحالية قد تؤثر على أداء المدرسة في الاختبارات الوطنية.",
      action:
        "تنفيذ تدريبات مكثفة ومحاكاة اختبارية وتحليل مهاري أسبوعي.",
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      priority: "normal",
      title: "المؤشرات مستقرة",
      description:
        "تشير النتائج إلى استقرار نسبي في مستويات الإتقان.",
      action:
        "الاستمرار في التقويم التكويني والمتابعة المستمرة.",
    });
  }

  return decisions;
}
