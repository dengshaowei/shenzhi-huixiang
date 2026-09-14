import { describe, expect, it } from "vitest";
import { summarizeProgress } from "./progress";
import type { CompetencyNodeData } from "@/content/competency-map";

function node(status: CompetencyNodeData["status"]): { data: CompetencyNodeData } {
  return {
    data: {
      order: "01",
      title: "Test",
      shortTitle: "Test",
      icon: "•",
      description: "Test",
      status,
      progress: status === "mastered" ? 100 : 0,
      pieces: 1,
      outcome: "Test",
      accent: "cyan",
    },
  };
}

describe("summarizeProgress", () => {
  it("summarizes mastered and learning nodes", () => {
    expect(summarizeProgress([node("mastered"), node("learning"), node("locked")])).toEqual({
      mastered: 1,
      learning: 1,
      total: 3,
      percentage: 33,
    });
  });

  it("handles an empty map", () => {
    expect(summarizeProgress([]).percentage).toBe(0);
  });
});

