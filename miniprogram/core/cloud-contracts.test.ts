import { describe, expect, it } from "vitest";
import { parseCloudHealth, parseKnowledgePackPage, parseStudyChatReply } from "./cloud-contracts";

describe("parseCloudHealth", () => {
  it("accepts the versioned CloudBase health response", () => {
    expect(parseCloudHealth({
      ok: true,
      service: "jushen-puzzle-cloudbase",
      version: "1.0.0",
      region: "ap-shanghai",
      timestamp: "2026-08-03T14:20:00.000Z",
    })).toEqual({
      ok: true,
      service: "jushen-puzzle-cloudbase",
      version: "1.0.0",
      region: "ap-shanghai",
      timestamp: "2026-08-03T14:20:00.000Z",
    });
  });

  it("rejects malformed external data", () => {
    expect(() => parseCloudHealth({ ok: true, service: "unexpected" })).toThrow("无法识别");
  });
});

describe("parseKnowledgePackPage", () => {
  it("accepts a paged knowledge response", () => {
    const page = parseKnowledgePackPage({ manifest: { name: "测试" }, page: 0, pageCount: 4, chunks: [{ id: "c1" }] });
    expect(page.pageCount).toBe(4);
    expect(page.chunks).toHaveLength(1);
  });

  it("surfaces cloud errors and rejects malformed pages", () => {
    expect(() => parseKnowledgePackPage({ error: { message: "知识库暂时不可用" } })).toThrow("知识库暂时不可用");
    expect(() => parseKnowledgePackPage({ manifest: {}, page: 0, pageCount: 0, chunks: [] })).toThrow("无法识别");
  });
});

describe("parseStudyChatReply", () => {
  it("accepts a deepseek reply and trims suggestions", () => {
    const reply = parseStudyChatReply({
      mode: "deepseek",
      answer: "激光雷达靠测距点云避障。",
      followUp: "反光环境下你会担心什么？",
      suggestions: ["怎么选？", "", 42, "反光怎么办？", "成本呢？", "多余的"],
      evidenceCount: 3,
      grounded: true,
      toolsUsed: ["检索了知识库", "查看了课程地图", 7, ""],
    });
    expect(reply.mode).toBe("deepseek");
    if (reply.mode === "deepseek") {
      expect(reply.suggestions).toEqual(["怎么选？", "反光怎么办？", "成本呢？"]);
      expect(reply.toolsUsed).toEqual(["检索了知识库", "查看了课程地图"]);
    }
  });

  it("defaults toolsUsed to empty when the cloud omits it", () => {
    const reply = parseStudyChatReply({
      mode: "deepseek",
      answer: "黑夜中深度相机效果会下降。",
      followUp: "夜班场景怎么办？",
      suggestions: [],
      evidenceCount: 2,
      grounded: true,
    });
    expect(reply.mode === "deepseek" && reply.toolsUsed).toEqual([]);
  });

  it("passes through fallback mode and rejects broken payloads", () => {
    expect(parseStudyChatReply({ mode: "fallback" })).toEqual({ mode: "fallback" });
    expect(() => parseStudyChatReply({ mode: "deepseek", answer: 1 })).toThrow("无法识别");
    expect(() => parseStudyChatReply({ error: { message: "学习伙伴暂时不可用" } })).toThrow("学习伙伴暂时不可用");
  });
});
