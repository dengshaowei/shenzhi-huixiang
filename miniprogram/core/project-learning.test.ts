import { describe, expect, it } from "vitest";
import { createProjectLearningProgress, evaluateProjectAnswer, parseProjectLearningPlan, projectNextAction, recordProjectAnswer } from "./project-learning";

const plan = {
  schemaVersion: 1,
  id: "project-1",
  fileName: "demo.pdf",
  title: "仓储机器人项目",
  summary: "仓储机器人项目为仓储场景定义机器人能力。",
  goals: ["理解场景约束", "完成方案取舍"],
  branches: [
    { id: "goal", title: "项目目标", points: ["完成仓储搬运"] },
    { id: "risk", title: "关键风险", points: ["人员混行"] },
  ],
  mapGroups: [
    { id: "why", kind: "purpose" as const, title: "为什么做", summary: "理解仓储场景", relation: "问题驱动目标", children: [{ id: "goal", title: "项目目标", detail: "完成仓储搬运", evidence: ["完成仓储搬运"] }] },
    { id: "verify", kind: "validation" as const, title: "怎么验证", summary: "检查安全边界", relation: "目标需要验证", children: [{ id: "risk", title: "关键风险", detail: "人员混行", evidence: ["人员混行"] }] },
  ],
  insights: [{ id: "risk-1", kind: "risk" as const, title: "优先风险", detail: "人员混行需要安全冗余", evidence: ["人员混行"] }],
  documentCoverage: { characterCount: 1200, paragraphCount: 20, chunkCount: 2, representedChunkCount: 2, traversalPercent: 100 },
  questions: [
    { id: "q1", skill: "需求", prompt: "项目目标是什么？", referencePoints: ["仓储搬运"] },
    { id: "q2", skill: "方案", prompt: "怎样选型？", referencePoints: ["人员混行"] },
    { id: "q3", skill: "风险", prompt: "最大风险是什么？", referencePoints: ["安全冗余"] },
  ],
  mode: "fallback",
  notice: "规则降级",
  createdAt: "2026-08-04T00:00:00.000Z",
};

describe("project learning", () => {
  it("validates a structured project plan", () => {
    const parsed = parseProjectLearningPlan(plan);
    expect(parsed.questions).toHaveLength(3);
    expect(parsed.mapGroups).toHaveLength(2);
    expect(parsed.documentCoverage.traversalPercent).toBe(100);
    expect(parsed.title).toBe("个人项目");
    expect(parsed.fileName).toBe("原文件名已隐藏");
    expect(JSON.stringify(parsed)).not.toContain("仓储机器人");
  });

  it("converts legacy branches into an interactive map", () => {
    const legacy: Record<string, unknown> = { ...plan };
    delete legacy.mapGroups;
    delete legacy.insights;
    delete legacy.documentCoverage;
    const parsed = parseProjectLearningPlan(legacy);
    expect(parsed.mapGroups[0]?.children[0]?.evidence).toEqual(["完成仓储搬运"]);
    expect(parsed.documentCoverage.traversalPercent).toBe(0);
  });

  it("rejects incomplete model output", () => {
    expect(() => parseProjectLearningPlan({ schemaVersion: 1 })).toThrow("缺少必要内容");
  });

  it("evaluates answers with deterministic project evidence", () => {
    expect(evaluateProjectAnswer("这个项目需要完成仓储搬运，并且需要说明任务边界和验证方式。", plan.questions[0]).passed).toBe(true);
  });

  it("records monotonic project evidence and exposes the next action", () => {
    const initial = createProjectLearningProgress(plan.id);
    const feedback = evaluateProjectAnswer("这个项目需要完成仓储搬运，并验证人员混行条件下的安全边界。", plan.questions[0]);
    const updated = recordProjectAnswer(initial, plan.questions[0], "这个项目需要完成仓储搬运，并验证人员混行条件下的安全边界。", feedback, plan.questions.length, "2026-08-09T00:00:00.000Z");
    expect(updated.passedQuestionIds).toEqual(["q1"]);
    expect(updated.answers[0]?.evidence).toEqual(["仓储搬运"]);
    expect(projectNextAction(plan, updated)).toContain("2 道未通过");
  });
});
