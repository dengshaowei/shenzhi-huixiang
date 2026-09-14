import { describe, expect, it } from "vitest";
import {
  createKnowledgeRepository,
  getKnowledgeRepository,
  hydrateKnowledgeRepository,
  isKnowledgeHydrated,
  resetKnowledgeRepositoryForTest,
} from "./knowledge-repository";

const fixture = {
  manifest: {
    name: "测试知识库",
    version: "1",
    sourceType: "local-docx-directory",
    documentCount: 2,
    chunkCount: 2,
    generatedOn: "2026-08-03",
    notice: "test",
  },
  chunks: [
    {
      id: "sensor-1",
      documentId: "sensor",
      title: "感知系统",
      sourceFile: "084 感知系统.docx",
      sourceType: "local-docx",
      order: 1,
      tags: ["perception", "sensor-selection"],
      text: "激光雷达提供测距信息，相机补充视觉语义。",
    },
    {
      id: "finance-1",
      documentId: "finance",
      title: "融资",
      sourceFile: "110 融资.docx",
      sourceType: "local-docx",
      order: 1,
      tags: ["product"],
      text: "融资渠道与股权结构。",
    },
  ],
};

describe("knowledge repository", () => {
  it("retrieves relevant chunks and preserves local source attribution", () => {
    const repository = createKnowledgeRepository(fixture);
    const hits = repository.search({ terms: ["激光雷达", "感知系统"], requiredTags: ["perception"] });

    expect(hits).toHaveLength(1);
    expect(hits[0]?.title).toBe("感知系统");
    expect(hits[0]?.sourceFile).toBe("084 感知系统.docx");
    expect(hits[0]?.excerpt).toContain("激光雷达");
  });

  it("rejects malformed payloads", () => {
    expect(() => createKnowledgeRepository({ manifest: {}, chunks: [] })).toThrow("索引缺少有效内容");
  });

  it("serves the offline summary before hydration and swaps in the full pack", () => {
    resetKnowledgeRepositoryForTest();
    expect(isKnowledgeHydrated()).toBe(false);
    expect(getKnowledgeRepository().manifest.sourceType).toBe("curated-offline-summary");
    expect(getKnowledgeRepository().search({ terms: ["激光雷达"], limit: 2 }).length).toBeGreaterThan(0);

    expect(hydrateKnowledgeRepository(fixture)).toBe(true);
    expect(isKnowledgeHydrated()).toBe(true);
    expect(getKnowledgeRepository().manifest.name).toBe("测试知识库");

    expect(hydrateKnowledgeRepository({ manifest: {}, chunks: [] })).toBe(false);
    expect(getKnowledgeRepository().manifest.name).toBe("测试知识库");
    resetKnowledgeRepositoryForTest();
  });
});
