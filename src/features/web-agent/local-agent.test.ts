import { describe, expect, it } from "vitest";
import { answerLocally, evaluateMastery, explanationSchema, questionSchema } from "./local-agent";

describe("local web agent", () => {
  it("returns a grounded answer with evidence and a learning map", () => {
    const reply = answerLocally("为什么仓库机器人不能只用相机？");
    expect(reply.grounded).toBe(true);
    expect(reply.sources.length).toBeGreaterThan(0);
    expect(reply.branches).toHaveLength(4);
    expect(reply.followUp.length).toBeGreaterThan(0);
  });

  it("routes quiz requests to the deterministic mastery check", () => {
    const reply = answerLocally("考考我吧");
    expect(reply.answer).toContain("掌握检测");
    expect(reply.branches).toHaveLength(0);
  });

  it("unlocks only when choice and explanation evidence pass", () => {
    const result = evaluateMastery(
      "fusion",
      "仓储机器人因为通道有人员且光照变化，所以用激光雷达稳定测距，用深度相机识别人员，并用近距防撞形成安全冗余；虽然成本更高，但能承接单点失效风险。",
    );
    expect(result.unlocked).toBe(true);
    expect(result.passedCount).toBe(5);
  });

  it("blocks a wrong choice even when the explanation is detailed", () => {
    const result = evaluateMastery(
      "camera",
      "仓储机器人因为通道有人员且光照变化，所以用激光雷达测距和相机识别，并考虑安全冗余与成本。",
    );
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toContain("方案选择尚未通过");
  });

  it("validates user input boundaries", () => {
    expect(questionSchema.safeParse(" ").success).toBe(false);
    expect(explanationSchema.safeParse("太短").success).toBe(false);
  });
});
