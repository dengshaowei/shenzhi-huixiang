import { evaluateFeynmanAnswer } from "./evaluator";
import { decideSensorMastery } from "./mastery";
import type { EvaluationResult, LessonBlock, MasteryDecision } from "./types";
import { getKnowledgeRepository, type KnowledgeHit, type KnowledgeManifest } from "../knowledge/knowledge-repository";

export const LEARNING_AGENT_MODE = "本地知识 Agent · 知识库检索 + 规则评估";

export interface LessonKnowledgeContext {
  readonly manifest: KnowledgeManifest;
  readonly hits: readonly KnowledgeHit[];
  readonly points: readonly LessonKnowledgePoint[];
}

export interface LessonKnowledgePoint extends LessonBlock {
  readonly knowledgeHit: KnowledgeHit | null;
}

export interface LearningAgentEvaluation {
  readonly mode: typeof LEARNING_AGENT_MODE;
  readonly evaluation: EvaluationResult;
  readonly decision: MasteryDecision;
  readonly knowledgeHits: readonly KnowledgeHit[];
  readonly followUpQuestion: string;
}

export interface CaseAgentEvaluation {
  readonly mode: typeof LEARNING_AGENT_MODE;
  readonly passed: boolean;
  readonly title: string;
  readonly body: string;
  readonly followUpQuestion: string;
  readonly knowledgeHits: readonly KnowledgeHit[];
}

function nextQuestion(evaluation: EvaluationResult): string {
  const missing = evaluation.dimensions.find(({ passed }) => !passed);
  if (!missing) return "如果光照、反光或人员密度发生变化，你会如何重新验证这套方案？";
  if (missing.id === "concept") return "请比较至少两类传感器：它们分别擅长什么、不能稳定完成什么？";
  if (missing.id === "causality") return "哪个具体场景约束导致了你的传感器选择？请用“因为—所以”讲清楚。";
  if (missing.id === "boundary") return "这套方案在成本、安全、算力或失效情况下有什么边界？";
  if (missing.id === "misconception") return "如果这个传感器失效或环境变化，为什么单一传感器不能覆盖全部风险？";
  return "请把结论放进仓储机器人避障或人员混行任务中再解释一次。";
}

function sensorKnowledge(terms: readonly string[], limit = 5): readonly KnowledgeHit[] {
  return getKnowledgeRepository().search({
    terms,
    requiredTags: ["perception", "sensor-selection", "warehouse"],
    preferredTitles: ["感知系统", "深度相机", "仓储物流机器人", "上游（感知、决策、执行系统）"],
    limit,
  });
}

export const learningAgent = {
  getLessonKnowledge(blocks: readonly LessonBlock[]): LessonKnowledgeContext {
    const points = blocks.map((block): LessonKnowledgePoint => ({
      ...block,
      knowledgeHit:
        getKnowledgeRepository().search({
          terms: block.knowledgeTerms,
          requiredTags: ["perception", "sensor-selection", "warehouse", "product"],
          preferredTitles: ["感知系统", "深度相机", "仓储物流机器人"],
          limit: 1,
        })[0] ?? null,
    }));
    return {
      manifest: getKnowledgeRepository().manifest,
      hits: sensorKnowledge(["感知系统", "深度相机", "激光雷达", "安全防护", "视觉避障"], 6),
      points,
    };
  },

  evaluateSensorExplanation(answer: string, challengePassed: boolean): LearningAgentEvaluation {
    const evaluation = evaluateFeynmanAnswer(answer);
    const decision = decideSensorMastery(challengePassed, evaluation);
    const knowledgeHits = sensorKnowledge([
      "感知系统",
      "深度相机",
      "激光雷达",
      "安全",
      "仓储",
      ...evaluation.dimensions.filter(({ passed }) => !passed).map(({ label }) => label),
    ]);
    return {
      mode: LEARNING_AGENT_MODE,
      evaluation,
      decision,
      knowledgeHits,
      followUpQuestion: nextQuestion(evaluation),
    };
  },

  evaluateWarehouseCase(selectedOptionId: string, reason: string, correctOptionId: string): CaseAgentEvaluation {
    const correctChoice = selectedOptionId === correctOptionId;
    const hasSafetyReason = ["安全", "冗余", "光照", "反光", "人员", "失效", "验证"].some((term) => reason.includes(term));
    const passed = correctChoice && hasSafetyReason;
    const knowledgeHits = getKnowledgeRepository().search({
      terms: ["仓储物流机器人", "安全防护", "激光防撞", "视觉避障", "人机混行"],
      requiredTags: ["warehouse", "perception"],
      preferredTitles: ["仓储物流机器人", "感知系统"],
      limit: 4,
    });
    return {
      mode: LEARNING_AGENT_MODE,
      passed,
      title: passed ? "迁移完成：你保留了能力互补" : "再补一层失效与安全判断",
      body: passed
        ? "你的结论与知识库中仓储机器人多重安全防护、视觉适配和场景选型原则一致。夜间和反光会改变视觉可靠性，但安全约束没有降低。"
        : correctChoice
          ? "方案方向正确，但需要明确光照或反光如何影响视觉，以及为什么知识库强调安全防护与冗余。"
          : "当前选择把变化环境中的风险集中到单一能力上。请结合知识库中的仓储安全防护和视觉适配内容重新判断。",
      followUpQuestion: passed ? "如果预算继续下降，你会优先优化哪项成本，而不牺牲安全？" : "环境变化后，哪个失效后果最不能接受？需要哪种冗余来承接？",
      knowledgeHits,
    };
  },
};
