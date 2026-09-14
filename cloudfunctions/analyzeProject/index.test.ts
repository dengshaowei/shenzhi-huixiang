import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

interface TestAnalysis {
  readonly coverage: { readonly characterCount: number; readonly paragraphCount: number; readonly chunkCount: number; readonly traversalPercent: number };
}

interface TestPlan {
  readonly title: string;
  readonly summary: string;
  readonly mapGroups: readonly { readonly title: string; readonly children: readonly { readonly detail: string; readonly evidence: readonly string[] }[] }[];
  readonly insights: readonly { readonly kind: string; readonly detail: string; readonly evidence: readonly string[] }[];
  readonly documentCoverage: { readonly traversalPercent: number };
}

interface AnalyzeProjectTestApi {
  readonly analyzeWholeDocument: (text: string) => TestAnalysis;
  readonly buildModelDigest: (analysis: TestAnalysis) => string;
  readonly fallbackPlan: (text: string, fileName: string, reason: string, analysis: TestAnalysis) => TestPlan;
  readonly redactProjectIdentity: (text: string) => string;
}

const require = createRequire(import.meta.url);
const moduleValue = require("./index.js") as { readonly __test: AnalyzeProjectTestApi };

describe("analyzeProject whole-document intelligence", () => {
  it("traverses the full document and carries evidence from its end into the graph", () => {
    const middle = Array.from({ length: 24 }, (_, index) => `第 ${index + 1} 个流程步骤描述机器人任务、功能需求和系统方案。${"流程内容".repeat(80)}`);
    const text = [
      "项目背景：仓库搬运效率不足，需要为一线员工降低重复劳动。",
      ...middle,
      "关键风险：人员混行时可能发生碰撞，异常情况下必须安全停机。",
      "验收指标：平均搬运时延低于目标值，安全测试通过率达到项目要求。",
    ].join("\n");
    const analysis = moduleValue.__test.analyzeWholeDocument(text);
    const plan = moduleValue.__test.fallbackPlan(text, "demo.md", "测试", analysis);
    expect(analysis.coverage.traversalPercent).toBe(100);
    expect(analysis.coverage.chunkCount).toBeGreaterThan(1);
    expect(moduleValue.__test.buildModelDigest(analysis)).toContain("人员混行");
    expect(plan.mapGroups.find((group) => group.title === "怎么验证")?.children.some((node) => node.detail.includes("人员混行"))).toBe(true);
    expect(plan.insights.some((insight) => insight.kind === "risk" && insight.detail.includes("人员混行"))).toBe(true);
    expect(plan.documentCoverage.traversalPercent).toBe(100);
  });

  it("removes heading decorations and conversational noise without turning the graph into an excerpt wall", () => {
    const text = [
      "# **智能仓储项目** 🚀",
      "嗯，就是那个，大家先随便看一下，对吧？",
      "你是谁的朋友，我才跟你说这种话。",
      "文章中出现了什么？",
      "## 【项目背景】",
      "- 当前仓库依赖人工搬运，高峰期等待时间较长，重复劳动强度高。",
      "### ◆ 目标与价值",
      "* 项目目标是降低平均搬运时延，并提升一线员工的作业安全。",
      "> 关键风险：人员混行时存在遮挡，需要保证异常情况下安全停机。",
      "✅ 验收指标：任务完成率和安全测试通过率需要达到既定目标。",
    ].join("\n");
    const analysis = moduleValue.__test.analyzeWholeDocument(text);
    const digest = moduleValue.__test.buildModelDigest(analysis);
    const plan = moduleValue.__test.fallbackPlan(text, "【智能仓储】.md", "测试", analysis);
    const visibleText = JSON.stringify({ title: plan.title, summary: plan.summary, groups: plan.mapGroups, insights: plan.insights });
    expect(plan.title).toBe("个人项目");
    expect(digest).not.toContain("嗯，就是那个");
    expect(digest).not.toContain("你是谁的朋友");
    expect(digest).not.toContain("文章中出现了什么");
    expect(visibleText).not.toMatch(/[#*◆🚀✅]/u);
    expect(visibleText).not.toContain("我才跟你说");
    expect(plan.summary).toContain("该项目");
    expect(plan.summary).toContain("降低平均搬运时延");
    expect(plan.mapGroups.flatMap((group) => group.children).every((node) => node.detail.length <= 110)).toBe(true);
    expect(plan.mapGroups.flatMap((group) => group.children).every((node) => node.evidence.length <= 3)).toBe(true);
  });

  it("replaces the real project identity before model analysis", () => {
    const redacted = moduleValue.__test.redactProjectIdentity([
      "# 海星搬运项目",
      "海星搬运项目用于改善仓库周转效率。",
      "海星搬运的目标是降低平均搬运时延。",
    ].join("\n"));
    expect(redacted).not.toContain("海星搬运");
    expect(redacted).toContain("个人项目");
  });
});
