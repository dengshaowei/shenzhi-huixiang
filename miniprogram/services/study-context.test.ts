import { afterEach, describe, expect, it } from "vitest";
import { createProjectStudyContext, getStudyContext, resetStudyContext, setStudyContext, studyContextKey } from "./study-context";

afterEach(() => resetStudyContext());

describe("study context", () => {
  it("hands the selected module to the learning companion", () => {
    setStudyContext({
      kind: "curriculum",
      domainId: "data",
      domainTitle: "数据、训练与评估",
      moduleId: "evaluation",
      moduleTitle: "评估与泛化",
      knowledgeTerms: ["评估", "泛化性"],
      project: null,
    });
    expect(getStudyContext().moduleId).toBe("evaluation");
    expect(getStudyContext().knowledgeTerms).toEqual(["评估", "泛化性"]);
  });

  it("turns a generated project plan into a bounded companion context", () => {
    const context = createProjectStudyContext({
      schemaVersion: 1,
      id: "project-1",
      fileName: "demo.md",
      title: "仓储机器人项目",
      summary: "验证仓储机器人的搬运与安全能力。",
      goals: ["理解目标用户", "识别安全风险"],
      branches: [
        { id: "goal", title: "目标", points: ["提升搬运效率"] },
        { id: "risk", title: "风险", points: ["人员混行"] },
      ],
      mapGroups: [
        { id: "why", kind: "purpose", title: "为什么做", summary: "确认目标", relation: "问题驱动目标", children: [{ id: "goal", title: "目标", detail: "提升搬运效率", evidence: ["提升搬运效率"] }] },
        { id: "verify", kind: "validation", title: "怎么验证", summary: "确认风险", relation: "目标需要验证", children: [{ id: "risk", title: "风险", detail: "人员混行", evidence: ["人员混行"] }] },
      ],
      insights: [{ id: "risk-1", kind: "risk", title: "风险", detail: "人员混行", evidence: ["人员混行"] }],
      documentCoverage: { characterCount: 200, paragraphCount: 4, chunkCount: 1, representedChunkCount: 1, traversalPercent: 100 },
      questions: [
        { id: "q1", skill: "目标", prompt: "目标？", referencePoints: ["搬运"] },
        { id: "q2", skill: "方案", prompt: "方案？", referencePoints: ["机器人"] },
        { id: "q3", skill: "风险", prompt: "风险？", referencePoints: ["安全"] },
      ],
      mode: "fallback",
      notice: "规则生成",
      createdAt: "2026-08-09T00:00:00.000Z",
    });
    expect(context.kind).toBe("project");
    expect(context.project?.title).toBe("个人项目");
    expect(context.project?.summary).not.toContain("仓储机器人");
    expect(context.moduleTitle).toBe("个人项目");
    expect(studyContextKey(context)).toContain("project/project:project-1");
  });
});
