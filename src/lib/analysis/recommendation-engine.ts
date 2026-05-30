export type MasteryLevel =
  | "very_high"
  | "high"
  | "medium_follow_up"
  | "low_support"
  | "very_low_intervention";

export type RecommendationLevel =
  | "enrichment"
  | "enhancement"
  | "follow_up"
  | "support"
  | "intervention";

export type MasteryClassification = {
  level: MasteryLevel;
  label: string;
  shortLabel: string;
  actionLabel: string;
};

export type EducationalRecommendationInput = {
  overallMastery: number;
  studentsBelow60?: number;
  studentsBetween60And70?: number;
  studentsBetween70And80?: number;
  weakSkillsCount?: number;
  weakestSkills?: string[];
};

export type EducationalRecommendation = {
  level: RecommendationLevel;
  title: string;
  summary: string;
  suggestedActions: string[];
  focusStudentsNote?: string;
  focusSkillsNote?: string;
};

export const METHODOLOGY_NOTE =
  "يعتمد هذا التقرير على تحليل نتائج الطلاب بهدف وصف مستوى الأداء، وتحديد مواطن القوة والضعف، ودعم اتخاذ قرارات تعليمية لتحسين نواتج التعلم. ولا يُعد بديلًا عن السجلات الرسمية المعتمدة في أنظمة وزارة التعليم.";

export function classifyMastery(percentage: number): MasteryClassification {
  const value = normalizePercentage(percentage);

  if (value >= 90) {
    return {
      level: "very_high",
      label: "إتقان مرتفع جدًا",
      shortLabel: "مرتفع جدًا",
      actionLabel: "إثراء ومتابعة",
    };
  }

  if (value >= 80) {
    return {
      level: "high",
      label: "إتقان مرتفع",
      shortLabel: "مرتفع",
      actionLabel: "تعزيز وتحسين",
    };
  }

  if (value >= 70) {
    return {
      level: "medium_follow_up",
      label: "إتقان متوسط يحتاج متابعة",
      shortLabel: "متوسط",
      actionLabel: "متابعة تعليمية",
    };
  }

  if (value >= 60) {
    return {
      level: "low_support",
      label: "إتقان منخفض يحتاج دعمًا",
      shortLabel: "منخفض",
      actionLabel: "دعم تعليمي",
    };
  }

  return {
    level: "very_low_intervention",
    label: "إتقان متدنٍ يحتاج تدخلًا علاجيًا",
    shortLabel: "متدنٍ",
    actionLabel: "تدخل علاجي",
  };
}

export function getMasteryLabel(percentage: number): string {
  return classifyMastery(percentage).label;
}

export function getMasteryActionLabel(percentage: number): string {
  return classifyMastery(percentage).actionLabel;
}

export function buildEducationalRecommendation(
  input: EducationalRecommendationInput
): EducationalRecommendation {
  const overall = normalizePercentage(input.overallMastery);
  const classification = classifyMastery(overall);

  const studentsBelow60 = Math.max(0, input.studentsBelow60 ?? 0);
  const studentsBetween60And70 = Math.max(0, input.studentsBetween60And70 ?? 0);
  const studentsBetween70And80 = Math.max(0, input.studentsBetween70And80 ?? 0);
  const weakSkillsCount = Math.max(0, input.weakSkillsCount ?? 0);
  const weakestSkills = input.weakestSkills?.filter(Boolean).slice(0, 5) ?? [];

  const focusStudentsNote = buildStudentsNote(
    studentsBelow60,
    studentsBetween60And70,
    studentsBetween70And80
  );

  const focusSkillsNote = buildSkillsNote(weakestSkills, weakSkillsCount);

  if (classification.level === "very_high" && studentsBelow60 === 0 && weakSkillsCount === 0) {
    return {
      level: "enrichment",
      title: "توصيات إثرائية ومتابعة",
      summary:
        "تشير النتائج إلى مستوى إتقان مرتفع جدًا، ويوصى بالاستمرار في تعزيز التعلم من خلال أنشطة إثرائية وتطبيقية، مع متابعة دورية لضمان ثبات مستوى الإتقان.",
      suggestedActions: [
        "تقديم أنشطة إثرائية قصيرة للطلاب المتقنين.",
        "توظيف أسئلة تطبيقية ومهام تفكير عليا.",
        "متابعة مؤشرات الإتقان في التقويمات اللاحقة.",
      ],
      focusStudentsNote,
      focusSkillsNote,
    };
  }

  if (classification.level === "high") {
    return {
      level: "enhancement",
      title: "توصيات تعزيز وتحسين",
      summary:
        "تشير النتائج إلى مستوى إتقان مرتفع، مع وجود فرص لتحسين بعض الجوانب، ويوصى بتقديم أنشطة تعزيزية مركزة ومراجعة المهارات التي ظهر فيها تفاوت في الأداء.",
      suggestedActions: [
        "تحليل إجابات الطلاب الأقل أداءً لتحديد سبب الفجوة.",
        "تقديم تدريبات قصيرة موجهة للمهارات الأقل إتقانًا.",
        "إعادة قياس جزئي بعد أنشطة التعزيز.",
      ],
      focusStudentsNote,
      focusSkillsNote,
    };
  }

  if (classification.level === "medium_follow_up") {
    return {
      level: "follow_up",
      title: "توصيات متابعة تعليمية",
      summary:
        "تشير النتائج إلى مستوى إتقان متوسط يحتاج متابعة، ويوصى بتحليل أخطاء الطلاب، وتقديم أنشطة علاجية قصيرة، ثم تنفيذ تقويم تكويني للتحقق من تحسن الأداء.",
      suggestedActions: [
        "تصنيف الطلاب إلى مجموعات متابعة حسب مستوى الإتقان.",
        "تنفيذ أنشطة قصيرة لمعالجة المفاهيم أو المهارات الأضعف.",
        "استخدام تقويم تكويني سريع بعد التدخل.",
      ],
      focusStudentsNote,
      focusSkillsNote,
    };
  }

  if (classification.level === "low_support") {
    return {
      level: "support",
      title: "توصيات دعم تعليمي",
      summary:
        "تشير النتائج إلى مستوى إتقان منخفض يحتاج دعمًا، ويوصى بإعادة تدريس الجوانب الأضعف، وتقسيم الطلاب إلى مجموعات دعم، وتنفيذ أنشطة علاجية موجهة، ثم إعادة قياس مستوى الإتقان.",
      suggestedActions: [
        "إعادة تدريس المهارات أو المفاهيم ذات الإتقان المنخفض.",
        "بناء مجموعات دعم صغيرة وفق مستوى الأداء.",
        "تحديد نشاط علاجي قصير لكل فجوة تعلم.",
        "إعادة القياس بعد فترة دعم محددة.",
      ],
      focusStudentsNote,
      focusSkillsNote,
    };
  }

  return {
    level: "intervention",
    title: "توصيات تدخل علاجي",
    summary:
      "تشير النتائج إلى مستوى إتقان متدنٍ يحتاج تدخلًا علاجيًا، ويوصى ببناء خطة دعم قصيرة المدى تبدأ بتحديد المفاهيم أو المهارات غير المتقنة، ثم تنفيذ تدخل علاجي مركز، يعقبه تقويم قصير لقياس أثر التدخل.",
    suggestedActions: [
      "تحديد أولويات التدخل بناءً على الطلاب الأقل إتقانًا.",
      "إعادة تدريس المهارات الأساسية قبل الانتقال إلى مهام أكثر تقدمًا.",
      "تنفيذ أنشطة علاجية مباشرة ومحددة بزمن.",
      "إجراء تقويم قصير بعد التدخل لقياس التحسن.",
      "توثيق ملاحظات المعلم حول أسباب الضعف وفرص التحسن.",
    ],
    focusStudentsNote,
    focusSkillsNote,
  };
}

function normalizePercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function buildStudentsNote(
  studentsBelow60: number,
  studentsBetween60And70: number,
  studentsBetween70And80: number
): string | undefined {
  if (
    studentsBelow60 <= 0 &&
    studentsBetween60And70 <= 0 &&
    studentsBetween70And80 <= 0
  ) {
    return undefined;
  }

  return "توجد حاجة إلى متابعة تعليمية موجهة.";
}

function buildSkillsNote(
  weakestSkills: string[],
  weakSkillsCount: number
): string | undefined {
  if (weakestSkills.length === 0 && weakSkillsCount === 0) return undefined;

  if (weakestSkills.length === 0) {
    return `توجد ${weakSkillsCount} مهارة/مجال بحاجة إلى متابعة أو دعم تعليمي.`;
  }

  return `ينبغي تركيز المعالجة على المهارات أو المجالات الأقل إتقانًا، وأبرزها: ${weakestSkills.join("، ")}.`;
}
