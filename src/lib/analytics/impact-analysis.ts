export type ImpactInput = {
  preAverage: number;
  postAverage: number;
};

export type ImpactResult = {
  preAverage: number;
  postAverage: number;
  improvementPoints: number;
  improvementRate: number;
  interpretation: string;
};

export function calculateImpact(input: ImpactInput): ImpactResult {
  const pre = round(input.preAverage);
  const post = round(input.postAverage);
  const points = round(post - pre);

  const rate =
    pre > 0
      ? round((points / pre) * 100)
      : post > 0
      ? 100
      : 0;

  return {
    preAverage: pre,
    postAverage: post,
    improvementPoints: points,
    improvementRate: rate,
    interpretation: buildImpactInterpretation(pre, post, points, rate),
  };
}

function buildImpactInterpretation(
  pre: number,
  post: number,
  points: number,
  rate: number
) {
  if (points > 0) {
    return `تشير النتائج إلى تحسن بعدي؛ إذ ارتفع متوسط الأداء من ${pre}% إلى ${post}%، بفارق تحسن قدره ${points} نقطة، ونسبة تحسن بلغت ${rate}%.`;
  }

  if (points === 0) {
    return `لم تظهر النتائج تغيرًا بين القياس القبلي والبعدي؛ إذ بقي متوسط الأداء عند ${post}%.`;
  }

  return `تشير النتائج إلى انخفاض في الأداء البعدي؛ إذ تغير المتوسط من ${pre}% إلى ${post}%، بفارق ${points} نقطة.`;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
