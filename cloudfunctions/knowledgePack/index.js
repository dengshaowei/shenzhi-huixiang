"use strict";
/* eslint-disable @typescript-eslint/no-require-imports -- CloudBase Node functions use the CommonJS handler contract. */

const fs = require("fs");
const path = require("path");

const PAGE_SIZE = 160;

let cachedPayload = null;

function loadPayload() {
  if (cachedPayload) return cachedPayload;
  const raw = fs.readFileSync(path.join(__dirname, "knowledge.json"), "utf8");
  const payload = JSON.parse(raw);
  if (!payload || !payload.manifest || !Array.isArray(payload.chunks) || payload.chunks.length === 0) {
    throw new Error("knowledge payload invalid");
  }
  cachedPayload = payload;
  return payload;
}

exports.main = async function main(event) {
  try {
    const payload = loadPayload();
    const pageCount = Math.ceil(payload.chunks.length / PAGE_SIZE);
    const requested = Number(event && event.page);
    const page = Number.isInteger(requested) ? requested : 0;
    if (page < 0 || page >= pageCount) {
      return { error: { code: "INVALID_PAGE", message: `page 需在 0 到 ${pageCount - 1} 之间` } };
    }
    const chunks = payload.chunks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return {
      manifest: payload.manifest,
      page,
      pageCount,
      chunkCount: payload.chunks.length,
      chunks,
    };
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "knowledge_pack_failed", message: error instanceof Error ? error.message : "unknown" }));
    return { error: { code: "KNOWLEDGE_PACK_FAILED", message: "知识库暂时不可用，请稍后重试" } };
  }
};
