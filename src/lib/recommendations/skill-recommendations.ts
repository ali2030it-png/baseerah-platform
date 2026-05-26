type RecommendationInput = {
  skill: string;
  mastery: number;
};

export function generateSkillRecommendation(
  input: RecommendationInput
) {
  if (input.mastery < 50) {
    return {
      level: "حرج",
      recommendation:
        `يوصى بإعادة تدريس مهارة "${input.skill}" باستخدام أنشطة علاجية فردية وتطبيقات عملية مكثفة.`,
    };
  }

  if (input.mastery < 70) {
    return {
      level: "متوسط",
      recommendation:
        `يوصى بتكثيف التدريب على مهارة "${input.skill}" عبر أنشطة صفية قصيرة وتقويمات تكوينية متتابعة.`,
    };
  }

  return {
    level: "جيد",
    recommendation:
      `مستوى الإتقان في مهارة "${input.skill}" جيد مع أهمية الاستمرار في التعزيز.`,
  };
}
