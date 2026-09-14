import { describe, expect, it } from "vitest";
import { answerStudyQuestion, welcomeForContext } from "./study-companion";
import type { StudyContext } from "../services/study-context";

const context: StudyContext = {
  kind: "curriculum",
  domainId: "sensors",
  domainTitle: "感知与传感器",
  moduleId: "lidar",
  moduleTitle: "激光雷达与测距",
  knowledgeTerms: ["激光雷达", "点云", "障碍物检测"],
  project: null,
};

describe("study companion", () => {
  it("creates a context-aware welcome", () => {
    expect(welcomeForContext(context)).toContain("激光雷达与测距");
  });

  it("answers with a grounded learning mind map", () => {
    const reply = answerStudyQuestion(context, "激光雷达怎样帮助机器人避障？");
    expect(reply.grounded).toBe(true);
    expect(reply.sources.length).toBeGreaterThan(0);
    expect(reply.answer).not.toContain("内参");
    expect(reply.mindMap?.branches).toHaveLength(4);
    expect(reply.mindMap?.branches.every((branch) => branch.points.length > 0)).toBe(true);
    expect(reply.followUpQuestion.length).toBeGreaterThan(0);
  });

  it("answers from the bounded imported-project plan in offline mode", () => {
    const projectContext: StudyContext = {
      kind: "project",
      domainId: "project:1",
      domainTitle: "我的项目",
      moduleId: "project-1",
      moduleTitle: "仓储机器人项目",
      knowledgeTerms: ["搬运效率", "人员混行"],
      project: {
        id: "project-1",
        title: "仓储机器人项目",
        summary: "验证搬运效率和人员混行安全。",
        goals: ["说明目标用户", "验证安全风险"],
        branches: [
          { title: "项目目标", points: ["提升搬运效率"] },
          { title: "关键风险", points: ["人员混行"] },
        ],
        insights: [{ kind: "risk", title: "优先风险", detail: "人员混行" }],
        documentCoverage: { paragraphCount: 4, chunkCount: 1, traversalPercent: 100 },
      },
    };
    const reply = answerStudyQuestion(projectContext, "下一步怎么学？");
    expect(reply.answer).toContain("项目题目");
    expect(reply.mindMap?.rootTitle).toBe("仓储机器人项目");
    expect(welcomeForContext(projectContext)).toContain("已经切换到你的项目");
  });
});
