import { describe, expect, it } from "vitest";
import { addAgentFeedback, parseAgentFeedback, type AgentFeedbackRecord } from "./agent-feedback";

const feedback: AgentFeedbackRecord = {
  id: "agent-1",
  contextKey: "project/1",
  question: "这个项目最大的风险是什么？",
  source: "cloud",
  rating: "needs-repair",
  createdAt: "2026-08-09T00:00:00.000Z",
};

describe("agent feedback ledger", () => {
  it("sanitizes and de-duplicates feedback records", () => {
    expect(parseAgentFeedback([{ bad: true }])).toEqual([]);
    expect(addAgentFeedback([feedback], { ...feedback, rating: "helpful" })).toEqual([{ ...feedback, rating: "helpful" }]);
  });
});
