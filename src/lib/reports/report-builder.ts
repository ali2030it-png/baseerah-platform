import { AssessmentAnalysisResult } from "@/lib/analysis/skill-analytics";

export type EducationalReport = {
  title: string;
  subtitle: string;
  report_number: string;
  generated_at: string;
  organization: {
    ministry: string;
    region: string;
    school: string;
  };
  assessment: {
    subject: string;
    grade_level: string;
    class_name: string;
    purpose: string;
    timing: string;
  };
  summary: {
    overall_mastery: number;
    performance_label: string;
    total_students: number;
    total_skills: number;
    weak_skills_count: number;
    students_at_risk_count: number;
    educational_summary: string;
  };
  weak_skills: {
    skill: string;
    learning_outcome: string;
    average_mastery: number;
    at_risk_count: number;
  }[];
  recommendations: string[];
};

export function buildEducationalReport(input: {
  analysis: AssessmentAnalysisResult;
  subject?: string;
  grade_level?: string;
  class_name?: string;
  purpose?: string;
  timing?: string;
  region?: string;
  school?: string;
}): EducationalReport {
  const { analysis } = input;

  return {
    title: "تقرير تحليل نتائج الطلاب",
    subtitle: "تحليل تربوي مبني على مؤشرات الإتقان والمهارات الحرجة",
    report_number: `BAS-${Date.now()}`,
    generated_at: new Date().toLocaleDateString("ar-SA"),
    organization: {
      ministry: "وزارة التعليم",
      region: input.region || "غير محدد",
      school: input.school || "غير محدد",
    },
    assessment: {
      subject: input.subject || "غير محدد",
      grade_level: input.grade_level || "غير محدد",
      class_name: input.class_name || "غير محدد",
      purpose: input.purpose || "تحليل نتائج",
      timing: input.timing || "غير محدد",
    },
    summary: {
      overall_mastery: analysis.overall_mastery,
      performance_label: performanceLabel(analysis.overall_mastery),
      total_students: analysis.total_students,
      total_skills: analysis.total_skills,
      weak_skills_count: analysis.weak_skills.length,
      students_at_risk_count: analysis.students_at_risk.length,
      educational_summary: buildCleanSummary(analysis),
    },
    weak_skills: analysis.weak_skills.slice(0, 6).map((skill) => ({
      skill: skill.skill,
      learning_outcome: skill.learning_outcome,
      average_mastery: skill.average_mastery,
      at_risk_count: skill.at_risk_count,
    })),
    recommendations: buildRecommendations(analysis),
  };
}

function performanceLabel(value: number) {
  if (value >= 90) return "إتقان مرتفع";
  if (value >= 75) return "متقن";
  if (value >= 60) return "بحاجة إلى تحسين";
  return "متعثر";
}

function buildCleanSummary(analysis: AssessmentAnalysisResult) {
  const weakest = analysis.weak_skills[0];

  if (!weakest) {
    return `بلغ متوسط الإتقان العام ${analysis.overall_mastery}%، ولا تظهر مهارات حرجة في هذا التحليل. ويوصى بالاستمرار في التقويم التكويني والمتابعة الدورية للمحافظة على مستوى الأداء.`;
  }

  return `بلغ متوسط الإتقان العام ${analysis.overall_mastery}%. وتظهر مهارة "${weakest.skill}" كأولوية علاجية؛ إذ بلغ متوسط إتقانها ${weakest.average_mastery}%. ويوصى بتنفيذ تدخلات علاجية مركزة للطلاب المتعثرين وعددهم ${analysis.students_at_risk.length}.`;
}

function buildRecommendations(analysis: AssessmentAnalysisResult) {
  const recommendations: string[] = [];

  if (analysis.overall_mastery < 60) {
    recommendations.push("تنفيذ برنامج علاجي مكثف للمهارات الأساسية ذات الإتقان المنخفض.");
  }

  if (analysis.weak_skills.length > 0) {
    recommendations.push("إعادة تدريس المهارات الحرجة باستخدام أنشطة صفية قصيرة وتقويمات تكوينية متتابعة.");
  }

  if (analysis.students_at_risk.length > 0) {
    recommendations.push("إعداد خطة متابعة للطلاب المتعثرين تتضمن قياسًا قبليًا وبعديًا ومتابعة أسبوعية.");
  }

  recommendations.push("توظيف نتائج التحليل في بناء تدخلات علاجية مرتبطة بنواتج التعلم المستهدفة.");

  return recommendations;
}
