import type { EvaluationResult, MasteryDecision } from "./types";

export function decideSensorMastery(challengePassed: boolean, evaluation: EvaluationResult): MasteryDecision {
  const reasons: string[] = [];

  if (!challengePassed) {
    reasons.push("方案选择尚未通过");
  }
  if (evaluation.criticalMisconceptions.length > 0) {
    reasons.push("回答仍包含关键误区");
  }
  if (evaluation.passedDimensionCount < 4) {
    reasons.push(`当前覆盖 ${evaluation.passedDimensionCount}/5 个证据维度，需要至少 4 个`);
  }

  return {
    unlocked: reasons.length === 0,
    reasons: reasons.length === 0 ? ["挑战通过", "未发现关键误区", "证据维度达到 4/5"] : reasons,
  };
}
