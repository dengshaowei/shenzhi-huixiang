import type { EvaluationResult, EvidenceDimension } from "./types";

interface TermGroup {
  readonly terms: readonly string[];
  readonly minimum: number;
}

const SENSOR_TERMS: TermGroup = {
  terms: ["相机", "视觉", "激光雷达", "雷达", "深度相机", "毫米波", "超声波", "防撞"],
  minimum: 2,
};

const SCENE_TERMS: TermGroup = {
  terms: ["光照", "遮挡", "货架", "通道", "人员", "室内", "粉尘", "反光", "场景", "环境"],
  minimum: 1,
};

const TRADEOFF_TERMS: TermGroup = {
  terms: ["成本", "精度", "范围", "视场", "稳定", "算力", "延迟", "维护", "冗余", "安全", "风险"],
  minimum: 1,
};

const CAUSAL_TERMS: TermGroup = {
  terms: ["因为", "所以", "因此", "从而", "互补", "弥补", "同时", "而", "相比"],
  minimum: 1,
};

const TRANSFER_TERMS: TermGroup = {
  terms: ["仓库", "机器人", "AMR", "工作人员", "避障", "识别", "产品", "部署"],
  minimum: 1,
};

const CRITICAL_PATTERNS: readonly { readonly pattern: RegExp; readonly message: string }[] = [
  { pattern: /(一个|单一).{0,6}(传感器|相机|雷达).{0,8}(解决|覆盖|适合).{0,4}(所有|全部)/, message: "把单一传感器当成可以覆盖所有场景" },
  { pattern: /(越贵越好|参数越高越好|只要精度高)/, message: "只按价格或单项参数判断方案" },
  { pattern: /相机.{0,8}(不受|不会受).{0,4}光照/, message: "忽略相机受光照条件影响的边界" },
  { pattern: /(GNSS|卫星定位).{0,8}(室内).{0,6}(避障|核心)/i, message: "把室内卫星定位误当成主要避障能力" },
];

function findTerms(answer: string, group: TermGroup): readonly string[] {
  return group.terms.filter((term) => answer.includes(term));
}

function makeDimension(
  id: EvidenceDimension["id"],
  label: string,
  matches: readonly string[],
  minimum: number,
  missingMessage: string,
): EvidenceDimension {
  const passed = matches.length >= minimum;
  return {
    id,
    label,
    passed,
    evidence: passed ? `命中：${matches.join("、")}` : missingMessage,
  };
}

export function evaluateFeynmanAnswer(rawAnswer: string): EvaluationResult {
  const answer = rawAnswer.trim();
  const sensorMatches = findTerms(answer, SENSOR_TERMS);
  const sceneMatches = findTerms(answer, SCENE_TERMS);
  const tradeoffMatches = findTerms(answer, TRADEOFF_TERMS);
  const causalMatches = findTerms(answer, CAUSAL_TERMS);
  const transferMatches = findTerms(answer, TRANSFER_TERMS);
  const criticalMisconceptions = CRITICAL_PATTERNS.filter(({ pattern }) => pattern.test(answer)).map(({ message }) => message);

  const concept = makeDimension("concept", "概念覆盖", sensorMatches, SENSOR_TERMS.minimum, "还需要比较至少两类传感器能力");
  const causality = makeDimension(
    "causality",
    "因果关系",
    [...sceneMatches, ...causalMatches],
    SCENE_TERMS.minimum + CAUSAL_TERMS.minimum,
    "请把一个场景约束和选择理由用因果关系连起来",
  );
  const boundary = makeDimension("boundary", "边界与取舍", tradeoffMatches, TRADEOFF_TERMS.minimum, "还需要说明成本、稳定性、安全或其他取舍");
  const misconception: EvidenceDimension = {
    id: "misconception",
    label: "关键误区",
    passed: criticalMisconceptions.length === 0,
    evidence: criticalMisconceptions.length === 0 ? "未发现预设关键误区" : criticalMisconceptions.join("；"),
  };
  const transfer = makeDimension("transfer", "场景迁移", transferMatches, TRANSFER_TERMS.minimum, "请把解释落到仓储机器人或避障任务中");
  const dimensions = [concept, causality, boundary, misconception, transfer] as const;
  const passedDimensionCount = dimensions.filter(({ passed }) => passed).length;
  const gaps = dimensions.filter(({ passed }) => !passed).map(({ evidence }) => evidence);

  return {
    passedDimensionCount,
    dimensions,
    criticalMisconceptions,
    gaps,
    summary:
      answer.length < 50
        ? "回答偏短，请补充具体场景、能力差异和取舍。"
        : passedDimensionCount >= 4
          ? "你已经覆盖了主要决策证据，掌握门槛还会结合选择题和关键误区判断。"
          : "已经有部分有效证据，请根据缺口补充后再试。",
  };
}
