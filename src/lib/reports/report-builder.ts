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
    sample_note: string;
    assessment_note: string;
  };
  weak_skills: {
    skill: string;
    learning_outcome: string;
    average_mastery: number;
    at_risk_count: number;
    qualitative_diagnosis: string;
    specific_intervention: string;
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
  const weakest = analysis.weak_skills[0];

  return {
    title: "تقرير تحليل نتائج الطلاب",
    subtitle: "تحليل تربوي لمؤشرات الإتقان والمهارات الحرجة",
    report_number: `RPT-${Date.now()}`,
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
      sample_note: buildSampleNote(analysis.total_students),
      assessment_note: buildAssessmentConsistencyNote(input.purpose || "", input.timing || ""),
    },
    weak_skills: analysis.weak_skills.slice(0, 6).map((skill) => ({
      skill: skill.skill,
      learning_outcome: skill.learning_outcome,
      average_mastery: skill.average_mastery,
      at_risk_count: skill.at_risk_count,
      qualitative_diagnosis: buildQualitativeDiagnosis(skill.skill),
      specific_intervention: buildSpecificIntervention(skill.skill),
    })),
    recommendations: buildRecommendations(analysis, weakest?.skill),
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

  return `بلغ متوسط الإتقان العام ${analysis.overall_mastery}%. وتظهر مهارة "${weakest.skill}" كأولوية علاجية؛ إذ بلغ متوسط إتقانها ${weakest.average_mastery}%. وينبغي التعامل مع هذا المؤشر في ضوء حجم العينة ونوع التقويم قبل تعميم الحكم على مستوى الصف.`;
}

function buildSampleNote(totalStudents: number) {
  if (totalStudents < 10) {
    return `تنبيه مهني: حجم العينة (${totalStudents} طلاب) محدود؛ لذلك تُفسر النتائج بوصفها مؤشرات تشخيصية لحالات فردية أو مجموعة صغيرة، ولا تصلح وحدها لتعميم حكم إحصائي على مستوى الصف أو المدرسة.`;
  }

  return "حجم العينة مناسب مبدئيًا لاستخلاص مؤشرات صفية عامة، مع أهمية دعم النتائج بأدلة أداء إضافية.";
}

function buildAssessmentConsistencyNote(purpose: string, timing: string) {
  const isDiagnostic = purpose.includes("تشخيص");
  const isEnd = timing.includes("نهاية");

  if (isDiagnostic && isEnd) {
    return "تنبيه تقويمي: يوجد تعارض بين غرض التقويم وتوقيته؛ فالاختبار التشخيصي يُستخدم غالبًا قبل التعلم أو في بداية الوحدة، أما نهاية الفترة فتناسب التقويم الختامي أو التكويني المرحلي.";
  }

  return "نوع التقويم وتوقيته متسقان مبدئيًا مع غرض التحليل.";
}

function buildQualitativeDiagnosis(skill: string) {
  if (skill.includes("حل المسائل")) {
    return "يُحتمل أن يكون موضع الضعف في قراءة نص المسألة، أو تحديد المعطيات، أو اختيار العملية المناسبة، أو ترتيب خطوات الحل. يلزم فحص إجابات الطلاب لتحديد سبب التعثر بدقة.";
  }

  return "يلزم تحليل إجابات الطلاب نوعيًا لتحديد ما إذا كان الضعف مفاهيميًا أو إجرائيًا أو مرتبطًا بمهارات سابقة.";
}

function buildSpecificIntervention(skill: string) {
  if (skill.includes("حل المسائل")) {
    return "تدريب الطلاب على استراتيجية: اقرأ المسألة، حدّد المعطيات، حدّد المطلوب، اختر العملية، نفّذ الحل، تحقق من الإجابة؛ مع استخدام مسائل قصيرة متدرجة وصوت تفكير المعلم أمام الطلاب.";
  }

  return "تصميم نشاط علاجي قصير مرتبط مباشرة بالمهارة، ثم تطبيق تقويم تكويني قصير لقياس التحسن.";
}

function buildRecommendations(analysis: AssessmentAnalysisResult, weakestSkill?: string) {
  const recommendations: string[] = [];

  if (weakestSkill) {
    recommendations.push(`بناء تدخل علاجي مباشر لمهارة "${weakestSkill}" بدل الاكتفاء بإعادة التدريس العامة.`);
  }

  if (analysis.total_students < 10) {
    recommendations.push("عدم تعميم النتيجة إحصائيًا بسبب محدودية العينة، والتعامل معها كحالات تحتاج متابعة فردية.");
  }

  if (analysis.students_at_risk.length > 0) {
    recommendations.push("تحليل إجابات الطلاب المتعثرين سؤالًا بسؤال لتحديد نوع الخطأ: فهم نص المسألة، اختيار العملية، أو تنفيذ خطوات الحل.");
  }

  recommendations.push("إعادة القياس بعد تنفيذ التدخل العلاجي باستخدام مهمة قصيرة مشابهة في ناتج التعلم نفسه.");

  return recommendations;
}
