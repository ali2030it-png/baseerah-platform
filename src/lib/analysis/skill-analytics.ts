import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";

export type MasteryLevel =
  | "excellent"
  | "mastered"
  | "needs_improvement"
  | "at_risk";

export type SkillAnalysis = {
  skill: string;
  learning_outcome: string;
  subject: string;
  average_mastery: number;
  total_attempts: number;
  total_score: number;
  total_max_score: number;
  score_summary: string;
  at_risk_count: number;
  level: MasteryLevel;
  priority_label: string;
  recommended_action: string;
};

export type StudentAnalysis = {
  student_id: string;
  student_name: string;
  average_mastery: number;
  total_score: number;
  total_max_score: number;
  score_summary: string;
  weak_skills: string[];
  mastered_skills: string[];
  follow_up_area: string;
  alert_label: string;
  level: MasteryLevel;
};

export type AssessmentAnalysisResult = {
  total_rows: number;
  total_students: number;
  total_skills: number;
  total_score: number;
  total_max_score: number;
  score_summary: string;
  overall_mastery: number;
  level: MasteryLevel;
  skill_analysis: SkillAnalysis[];
  student_analysis: StudentAnalysis[];
  weak_skills: SkillAnalysis[];
  top_skills: SkillAnalysis[];
  students_at_risk: StudentAnalysis[];
  educational_summary: string;
  calculation_method: string;
};

const CALCULATION_METHOD =
  "تم احتساب الإتقان وفق المعادلة: مجموع الدرجات المحصلة ÷ مجموع الدرجات العظمى × 100.";

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function cleanNumber(value: number) {
  return Math.round(value * 100) / 100;
}

function formatNumber(value: number) {
  const rounded = cleanNumber(value);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function scoreSummary(score: number, maxScore: number) {
  return `${formatNumber(score)} / ${formatNumber(maxScore)}`;
}

function masteryPercentFromTotals(score: number, maxScore: number) {
  if (!maxScore || maxScore <= 0) return 0;
  return round((score / maxScore) * 100);
}

function masteryPercent(row: ParsedAssessmentRow) {
  return masteryPercentFromTotals(
    Number(row.score) || 0,
    Number(row.max_score) || 0
  );
}

export function getMasteryLevel(percent: number): MasteryLevel {
  if (percent >= 90) return "excellent";
  if (percent >= 75) return "mastered";
  if (percent >= 60) return "needs_improvement";
  return "at_risk";
}

export function masteryLabel(level: MasteryLevel) {
  if (level === "excellent") return "إتقان مرتفع";
  if (level === "mastered") return "متقن";
  if (level === "needs_improvement") return "بحاجة إلى تحسين";
  return "متعثر";
}

function skillPriorityLabel(level: MasteryLevel) {
  if (level === "at_risk") return "مهارة حرجة";
  if (level === "needs_improvement") return "أولوية تحسين";
  if (level === "mastered") return "مهارة متقنة";
  return "نقطة قوة";
}

function skillRecommendedAction(level: MasteryLevel) {
  if (level === "at_risk") return "تدخل علاجي عاجل";
  if (level === "needs_improvement") return "إعادة تدريس قصيرة وتدريب موجّه";
  if (level === "mastered") return "تعزيز";
  return "إثراء";
}

function studentAlertLabel(level: MasteryLevel) {
  if (level === "at_risk") return "تدخل علاجي مباشر";
  if (level === "needs_improvement") return "متابعة علاجية";
  if (level === "mastered") return "تعزيز";
  return "إثراء";
}

export function analyzeAssessmentRows(
  rows: ParsedAssessmentRow[]
): AssessmentAnalysisResult {
  const validRows = rows.filter((row) => {
    const score = Number(row.score);
    const maxScore = Number(row.max_score);

    return (
      row.student_name &&
      row.skill &&
      Number.isFinite(score) &&
      Number.isFinite(maxScore) &&
      maxScore > 0
    );
  });

  const totalScore = cleanNumber(
    validRows.reduce((sum, row) => sum + (Number(row.score) || 0), 0)
  );

  const totalMaxScore = cleanNumber(
    validRows.reduce((sum, row) => sum + (Number(row.max_score) || 0), 0)
  );

  const overall = masteryPercentFromTotals(totalScore, totalMaxScore);

  const skillMap = new Map<string, ParsedAssessmentRow[]>();

  for (const row of validRows) {
    const key = `${row.subject}__${row.skill}__${row.learning_outcome}`;
    const current = skillMap.get(key) || [];
    current.push(row);
    skillMap.set(key, current);
  }

  const skill_analysis: SkillAnalysis[] = Array.from(skillMap.values())
    .map((items) => {
      const first = items[0];

      const skillScore = cleanNumber(
        items.reduce((sum, row) => sum + (Number(row.score) || 0), 0)
      );

      const skillMaxScore = cleanNumber(
        items.reduce((sum, row) => sum + (Number(row.max_score) || 0), 0)
      );

      const average = masteryPercentFromTotals(skillScore, skillMaxScore);
      const level = getMasteryLevel(average);

      return {
        skill: first.skill,
        learning_outcome: first.learning_outcome,
        subject: first.subject,
        average_mastery: average,
        total_attempts: items.length,
        total_score: skillScore,
        total_max_score: skillMaxScore,
        score_summary: scoreSummary(skillScore, skillMaxScore),
        at_risk_count: items.filter((row) => masteryPercent(row) < 75).length,
        level,
        priority_label: skillPriorityLabel(level),
        recommended_action: skillRecommendedAction(level),
      };
    })
    .sort((a, b) => a.average_mastery - b.average_mastery);

  const studentMap = new Map<string, ParsedAssessmentRow[]>();

  for (const row of validRows) {
    const key = row.student_id || row.student_name;
    const current = studentMap.get(key) || [];
    current.push(row);
    studentMap.set(key, current);
  }

  const student_analysis: StudentAnalysis[] = Array.from(studentMap.entries())
    .map(([studentKey, items]) => {
      const first = items[0];

      const studentScore = cleanNumber(
        items.reduce((sum, row) => sum + (Number(row.score) || 0), 0)
      );

      const studentMaxScore = cleanNumber(
        items.reduce((sum, row) => sum + (Number(row.max_score) || 0), 0)
      );

      const average = masteryPercentFromTotals(studentScore, studentMaxScore);
      const level = getMasteryLevel(average);

      const skillsNeedingFollowUp = items
        .filter((row) => masteryPercent(row) < 75)
        .map((row) => row.skill);

      const masteredSkills = items
        .filter((row) => masteryPercent(row) >= 75)
        .map((row) => row.skill);

      const uniqueFollowUpSkills = Array.from(new Set(skillsNeedingFollowUp));

      return {
        student_id: first.student_id || studentKey,
        student_name: first.student_name,
        average_mastery: average,
        total_score: studentScore,
        total_max_score: studentMaxScore,
        score_summary: scoreSummary(studentScore, studentMaxScore),
        weak_skills: uniqueFollowUpSkills,
        mastered_skills: Array.from(new Set(masteredSkills)),
        follow_up_area:
          uniqueFollowUpSkills.length > 0
            ? uniqueFollowUpSkills.join("، ")
            : level === "needs_improvement"
              ? "تحسين عام في الدرجة الكلية"
              : "لا يوجد",
        alert_label: studentAlertLabel(level),
        level,
      };
    })
    .sort((a, b) => a.average_mastery - b.average_mastery);

  const weak_skills = skill_analysis.filter(
    (skill) =>
      skill.level === "at_risk" || skill.level === "needs_improvement"
  );

  const top_skills = [...skill_analysis]
    .sort((a, b) => b.average_mastery - a.average_mastery)
    .slice(0, 5);

  const students_at_risk = student_analysis.filter(
    (student) =>
      student.level === "at_risk" || student.level === "needs_improvement"
  );

  return {
    total_rows: validRows.length,
    total_students: student_analysis.length,
    total_skills: skill_analysis.length,
    total_score: totalScore,
    total_max_score: totalMaxScore,
    score_summary: scoreSummary(totalScore, totalMaxScore),
    overall_mastery: overall,
    level: getMasteryLevel(overall),
    skill_analysis,
    student_analysis,
    weak_skills,
    top_skills,
    students_at_risk,
    educational_summary: buildEducationalSummary(
      overall,
      weak_skills[0],
      students_at_risk.length
    ),
    calculation_method: CALCULATION_METHOD,
  };
}

function buildEducationalSummary(
  overall: number,
  weakestSkill: SkillAnalysis | undefined,
  followUpCount: number
) {
  if (overall === 0) {
    return "لم تتوفر بيانات كافية لإنتاج تحليل تربوي.";
  }

  if (weakestSkill) {
    return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، مع بروز مهارة "${weakestSkill.skill}" بوصفها ${weakestSkill.priority_label}؛ إذ بلغ متوسط إتقانها ${weakestSkill.average_mastery}%. ويوصى بتنفيذ ${weakestSkill.recommended_action} للطلاب المحتاجين للمتابعة وعددهم ${followUpCount}.`;
  }

  return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، ولا تظهر مهارات بحاجة إلى تدخل مباشر، مع أهمية الاستمرار في التقويم التكويني والمتابعة الدورية.`;
}

