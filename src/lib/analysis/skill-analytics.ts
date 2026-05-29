import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";
import {
  classifyMastery,
  getMasteryActionLabel,
  getMasteryLabel,
  type MasteryLevel,
} from "@/lib/analysis/recommendation-engine";

export type { MasteryLevel };

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
  return classifyMastery(percent).level;
}

export function masteryLabel(level: MasteryLevel) {
  return getLevelLabel(level);
}

function getLevelLabel(level: MasteryLevel) {
  if (level === "very_high") return "إتقان مرتفع جدًا";
  if (level === "high") return "إتقان مرتفع";
  if (level === "medium_follow_up") return "إتقان متوسط يحتاج متابعة";
  if (level === "low_support") return "إتقان منخفض يحتاج دعمًا";
  return "إتقان متدنٍ يحتاج تدخلًا علاجيًا";
}

function skillPriorityLabel(level: MasteryLevel) {
  if (level === "very_low_intervention") return "مهارة حرجة";
  if (level === "low_support") return "أولوية دعم";
  if (level === "medium_follow_up") return "أولوية متابعة";
  if (level === "high") return "مهارة متقنة";
  return "نقطة قوة";
}

function skillRecommendedAction(level: MasteryLevel) {
  if (level === "very_low_intervention") return "تدخل علاجي مركز";
  if (level === "low_support") return "إعادة تدريس قصيرة وتدريب موجّه";
  if (level === "medium_follow_up") return "متابعة تعليمية وتقويم تكويني";
  if (level === "high") return "تعزيز";
  return "إثراء";
}

function studentAlertLabel(level: MasteryLevel) {
  if (level === "very_low_intervention") return "تدخل علاجي";
  if (level === "low_support") return "دعم تعليمي";
  if (level === "medium_follow_up") return "متابعة تعليمية";
  if (level === "high") return "تعزيز وتحسين";
  return "إثراء ومتابعة";
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
        at_risk_count: items.filter((row) => masteryPercent(row) < 70).length,
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

  const student_analysis: StudentAnalysis[] = Array.from(studentMap.entries()).map(
    ([studentKey, items]) => {
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
        .filter((row) => masteryPercent(row) < 80)
        .map((row) => row.skill);

      const masteredSkills = items
        .filter((row) => masteryPercent(row) >= 80)
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
            : level === "medium_follow_up" || level === "low_support"
              ? "متابعة عامة في الدرجة الكلية"
              : "لا يوجد",
        alert_label: studentAlertLabel(level),
        level,
      };
    }
  );

  const weak_skills = skill_analysis.filter(
    (skill) => skill.level !== "very_high" && skill.level !== "high"
  );

  const top_skills = [...skill_analysis]
    .sort((a, b) => b.average_mastery - a.average_mastery)
    .slice(0, 5);

  const students_at_risk = student_analysis
    .filter((student) => student.level !== "very_high" && student.level !== "high")
    .sort((a, b) => a.average_mastery - b.average_mastery);

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

  const classification = classifyMastery(overall);

  if (weakestSkill) {
    return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، ويصنف في مستوى "${classification.label}"، مع بروز "${weakestSkill.skill}" بوصفها ${weakestSkill.priority_label}؛ إذ بلغ متوسط إتقانها ${weakestSkill.average_mastery}%. ويوصى بتنفيذ ${weakestSkill.recommended_action} للطلاب المحتاجين للمتابعة وعددهم ${followUpCount}.`;
  }

  return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، ويصنف في مستوى "${classification.label}"، ولا تظهر مهارات بحاجة إلى تدخل مباشر، مع أهمية الاستمرار في التقويم التكويني والمتابعة الدورية.`;
}
