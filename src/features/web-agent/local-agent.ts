import { z } from "zod";
import { SENSOR_KNOWLEDGE } from "./content";
import type { AgentReply, EvidenceDimension, EvidenceId, KnowledgeEntry, MasteryResult } from "./types";

export const questionSchema = z.string().trim().min(2, "请至少输入两个字").max(260, "问题不能超过 260 字");
export const explanationSchema = z.string().trim().min(20, "再多说一点：至少写 20 个字").max(600, "解释不能超过 600 字");

const STOP_TERMS = new Set(["什么", "怎么", "为什么", "一下", "这个", "那个", "可以", "还是", "请问"]);

function splitTerms(text: string): readonly string[] {
  return text
    .split(/[\s，。！？、；：,.!?;:]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !STOP_TERMS.has(term));
}

function searchKnowledge(question: string, history: readonly string[]): readonly KnowledgeEntry[] {
  const rawTerms = [...splitTerms(question), ...history.slice(-2).flatMap(splitTerms)];
  const query = `${question}${rawTerms.join("")}`.toLocaleLowerCase();
  const ranked = SENSOR_KNOWLEDGE.map((entry) => {
    const score = entry.tags.reduce((total, tag) => total + (query.includes(tag.toLocaleLowerCase()) ? 3 : 0), 0)
      + (query.includes(entry.title.toLocaleLowerCase()) ? 5 : 0);
    return { entry, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);

  return (ranked.length > 0 ? ranked : SENSOR_KNOWLEDGE.slice(0, 3).map((entry) => ({ entry, score: 1 })))
    .slice(0, 3)
    .map(({ entry }) => entry);
}

function decisionGuidance(question: string): readonly string[] {
  if (["区别", "对比", "差异", "怎么选"].some((term) => question.includes(term))) {
    return ["先确认两种能力是不是服务同一个任务", "比较环境适应性、精度、延迟、成本和失效后果", "最后用真实边界场景验证取舍"];
  }
  return ["写清环境与任务约束", "组合测距、识别与安全能力", "检查每一层失效后由谁承接"];
}

export function answerLocally(rawQuestion: string, history: readonly string[] = []): AgentReply {
  const question = questionSchema.parse(rawQuestion);
  const sources = searchKnowledge(question, history);
  const asksForQuiz = ["考考我", "向我提问", "出题"].some((term) => question.includes(term));

  if (asksForQuiz) {
    return {
      answer: "好，先不讲答案。请完成右侧的掌握检测，并用自己的话解释选择依据。",
      followUp: "如果其中一类传感器突然失效，剩下的能力能否让机器人安全停下？",
      grounded: true,
      sources: [],
      branches: [],
      suggestions: ["给我一点提示", "先讲一个反例"],
    };
  }

  const isExample = ["例子", "场景", "案例"].some((term) => question.includes(term));
  const answer = isExample
    ? "以夜间仓储 AMR 为例：激光雷达负责稳定测距，深度相机识别人和货物，近距防撞负责最后急停。局部关灯或塑料膜强反光时，团队要分别复测视觉和雷达的失效边界，而不是相信一套参数覆盖所有现场。"
    : `先给结论：${sources[0].summary} 我把判断依据拆成四块，方便你检查自己是否真的理解。`;

  return {
    answer,
    followUp: "如果光照、反光或人员密度发生变化，你会优先重新验证哪项能力？",
    grounded: true,
    sources,
    branches: [
      { id: "meaning", title: "核心含义", points: [sources[0].summary] },
      { id: "mechanism", title: "能力组合", points: sources.slice(1).map((source) => source.summary) },
      { id: "decision", title: "怎样做判断", points: decisionGuidance(question) },
      { id: "boundary", title: "边界检查", points: ["不要只看单项参数", "安全相关能力必须有失效承接与真实场景验证"] },
    ],
    suggestions: ["再讲细一点", "给我一个反例", "考考我吧"],
  };
}

interface TermRule {
  readonly id: EvidenceId;
  readonly label: string;
  readonly terms: readonly string[];
  readonly minimum: number;
  readonly missing: string;
}

const RULES: readonly TermRule[] = [
  { id: "concept", label: "概念覆盖", terms: ["相机", "视觉", "激光雷达", "雷达", "深度相机", "防撞"], minimum: 2, missing: "请比较至少两类感知能力" },
  { id: "causality", label: "因果关系", terms: ["因为", "所以", "因此", "互补", "弥补", "光照", "遮挡", "人员", "通道"], minimum: 2, missing: "请把场景约束和选择理由连起来" },
  { id: "boundary", label: "边界与取舍", terms: ["成本", "稳定", "算力", "延迟", "冗余", "安全", "风险", "失效"], minimum: 1, missing: "请说明至少一个成本、安全或失效取舍" },
  { id: "transfer", label: "场景迁移", terms: ["仓库", "仓储", "机器人", "AMR", "工作人员", "避障", "识别"], minimum: 1, missing: "请把解释落到仓储机器人任务" },
] as const;

const CRITICAL_PATTERNS = [
  /(一个|单一).{0,6}(传感器|相机|雷达).{0,8}(解决|覆盖).{0,4}(所有|全部)/,
  /(越贵越好|参数越高越好|只要精度高)/,
  /相机.{0,8}(不受|不会受).{0,4}光照/,
] as const;

export function evaluateMastery(selectedOptionId: string, rawExplanation: string): MasteryResult {
  const explanation = explanationSchema.parse(rawExplanation);
  const dimensions: EvidenceDimension[] = RULES.map((rule) => {
    const matches = rule.terms.filter((term) => explanation.includes(term));
    return {
      id: rule.id,
      label: rule.label,
      passed: matches.length >= rule.minimum,
      evidence: matches.length >= rule.minimum ? `命中：${matches.join("、")}` : rule.missing,
    };
  });
  const misconceptionPassed = !CRITICAL_PATTERNS.some((pattern) => pattern.test(explanation));
  dimensions.splice(3, 0, {
    id: "misconception",
    label: "关键误区",
    passed: misconceptionPassed,
    evidence: misconceptionPassed ? "未发现预设关键误区" : "回答仍把单项能力当成万能方案",
  });
  const passedCount = dimensions.filter(({ passed }) => passed).length;
  const reasons: string[] = [];
  if (selectedOptionId !== "fusion") reasons.push("方案选择尚未通过");
  if (!misconceptionPassed) reasons.push("回答仍包含关键误区");
  if (passedCount < 4) reasons.push(`当前覆盖 ${passedCount}/5 个证据维度，需要至少 4 个`);

  return {
    unlocked: reasons.length === 0,
    passedCount,
    dimensions,
    reasons: reasons.length === 0 ? ["挑战通过", "未发现关键误区", "证据维度达到 4/5"] : reasons,
  };
}

