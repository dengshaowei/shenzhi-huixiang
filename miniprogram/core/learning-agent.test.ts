import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { learningAgent, LEARNING_AGENT_MODE } from "./learning-agent";
import { SENSOR_LESSON } from "./content";
import { hydrateKnowledgeRepository } from "../knowledge/knowledge-repository";

beforeAll(() => {
  const payload = JSON.parse(
    readFileSync(resolve(__dirname, "../../cloudfunctions/knowledgePack/knowledge.json"), "utf8"),
  ) as unknown;
  expect(hydrateKnowledgeRepository(payload)).toBe(true);
});

describe("local knowledge learning agent", () => {
  it("loads the public sample knowledge base", () => {
    const context = learningAgent.getLessonKnowledge(SENSOR_LESSON);

    expect(context.manifest.name).toBe("公开示例知识库");
    expect(context.manifest.documentCount).toBe(2);
    expect(context.manifest.chunkCount).toBe(2);
    expect(context.hits.length).toBeGreaterThan(0);
    expect(context.hits.every(({ sourceFile }) => sourceFile === "public-sample.md")).toBe(true);
    expect(context.points.some(({ knowledgeHit }) => knowledgeHit !== null)).toBe(true);
  });

  it("retrieves knowledge evidence while keeping mastery deterministic", () => {
    const response = learningAgent.evaluateSensorExplanation(
      "仓库通道窄、货架遮挡且光照会变化，因为激光雷达能稳定测距，而相机可以识别工作人员，所以两者互补，并保留防撞作为安全冗余，代价是成本和算力增加。",
      true,
    );

    expect(response.mode).toBe(LEARNING_AGENT_MODE);
    expect(response.knowledgeHits.length).toBeGreaterThan(0);
    expect(response.decision.unlocked).toBe(true);
    expect(response.followUpQuestion.length).toBeGreaterThan(0);
  });
});
