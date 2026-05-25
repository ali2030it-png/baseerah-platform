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
  at_risk_count: number;
  level: MasteryLevel;
};

export type StudentAnalysis = {
  student_id: string;
  student_name: string;
  average_mastery: number;
  weak_skills: string[];
  mastered_skills: string[];
  level: MasteryLevel;
};

export type AssessmentAnalysisResult = {
  total_rows: number;
  total_students: number;
  total_skills: number;
  overall_mastery: number;
  level: MasteryLevel;
  skill_analysis: SkillAnalysis[];
  student_analysis: StudentAnalysis[];
  weak_skills: SkillAnalysis[];
  top_skills: SkillAnalysis[];
  students_at_risk: StudentAnalysis[];
  educational_summary: string;
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function masteryPercent(row: ParsedAssessmentRow) {
  if (!row.max_score || row.max_score <= 0) return 0;
  return (row.score / row.max_score) * 100;
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

export function analyzeAssessmentRows(
  rows: ParsedAssessmentRow[]
): AssessmentAnalysisResult {
  const validRows = rows.filter(
    (row) => row.student_name && row.skill && row.max_score > 0
  );

  const overall =
    validRows.length === 0
      ? 0
      : round(
          validRows.reduce((sum, row) => sum + masteryPercent(row), 0) /
            validRows.length
        );

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
      const average = round(
        items.reduce((sum, row) => sum + masteryPercent(row), 0) / items.length
      );

      return {
        skill: first.skill,
        learning_outcome: first.learning_outcome,
        subject: first.subject,
        average_mastery: average,
        total_attempts: items.length,
        at_risk_count: items.filter((row) => masteryPercent(row) < 60).length,
        level: getMasteryLevel(average),
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

      const average = round(
        items.reduce((sum, row) => sum + masteryPercent(row), 0) / items.length
      );

      const weakSkills = items
        .filter((row) => masteryPercent(row) < 60)
        .map((row) => row.skill);

      const masteredSkills = items
        .filter((row) => masteryPercent(row) >= 75)
        .map((row) => row.skill);

      return {
        student_id: first.student_id || studentKey,
        student_name: first.student_name,
        average_mastery: average,
        weak_skills: Array.from(new Set(weakSkills)),
        mastered_skills: Array.from(new Set(masteredSkills)),
        level: getMasteryLevel(average),
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
      student.level === "at_risk" || student.weak_skills.length > 0
  );

  return {
    total_rows: validRows.length,
    total_students: student_analysis.length,
    total_skills: skill_analysis.length,
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
  };
}

function buildEducationalSummary(
  overall: number,
  weakestSkill: SkillAnalysis | undefined,
  riskCount: number
) {
  if (overall === 0) {
    return "لم تتوفر بيانات كافية لإنتاج تحليل تربوي.";
  }

  if (weakestSkill) {
    return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، مع بروز مهارة "${weakestSkill.skill}" كأولوية علاجية؛ إذ بلغ متوسط إتقانها ${weakestSkill.average_mastery}%. ويوصى بتنفيذ تدخلات علاجية مركزة للطلاب المتعثرين وعددهم ${riskCount}.`;
  }

  return `تشير النتائج إلى أن متوسط الإتقان العام بلغ ${overall}%، ولا تظهر مهارات حرجة بدرجة عالية، مع أهمية الاستمرار في التقويم التكويني والمتابعة الدورية.`;
}
