export interface CloudHealth {
  readonly ok: true;
  readonly service: "jushen-puzzle-cloudbase";
  readonly version: string;
  readonly region: string;
  readonly timestamp: string;
}

export interface KnowledgePackPage {
  readonly manifest: unknown;
  readonly page: number;
  readonly pageCount: number;
  readonly chunks: readonly unknown[];
}

export type StudyChatReply =
  | {
      readonly mode: "deepseek";
      readonly answer: string;
      readonly followUp: string;
      readonly suggestions: readonly string[];
      readonly evidenceCount: number;
      readonly grounded: boolean;
      readonly toolsUsed: readonly string[];
    }
  | { readonly mode: "fallback" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCloudError(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.error)) return null;
  return typeof value.error.message === "string" ? value.error.message : "云端服务暂时不可用";
}

export function parseKnowledgePackPage(value: unknown): KnowledgePackPage {
  const error = readCloudError(value);
  if (error) throw new Error(error);
  if (
    !isRecord(value)
    || !isRecord(value.manifest)
    || typeof value.page !== "number"
    || typeof value.pageCount !== "number"
    || value.pageCount < 1
    || !Array.isArray(value.chunks)
    || value.chunks.length === 0
  ) {
    throw new Error("云端知识库返回了无法识别的数据");
  }
  return { manifest: value.manifest, page: value.page, pageCount: value.pageCount, chunks: value.chunks };
}

export function parseStudyChatReply(value: unknown): StudyChatReply {
  const error = readCloudError(value);
  if (error) throw new Error(error);
  if (!isRecord(value)) throw new Error("学习伙伴返回了无法识别的数据");
  if (value.mode === "fallback") return { mode: "fallback" };
  if (
    value.mode !== "deepseek"
    || typeof value.answer !== "string"
    || typeof value.followUp !== "string"
    || typeof value.evidenceCount !== "number"
    || typeof value.grounded !== "boolean"
  ) {
    throw new Error("学习伙伴返回了无法识别的数据");
  }
  const suggestions = Array.isArray(value.suggestions)
    ? value.suggestions.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 3)
    : [];
  const toolsUsed = Array.isArray(value.toolsUsed)
    ? value.toolsUsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 4)
    : [];
  return {
    mode: "deepseek",
    answer: value.answer,
    followUp: value.followUp,
    suggestions,
    evidenceCount: value.evidenceCount,
    grounded: value.grounded,
    toolsUsed,
  };
}

export function parseCloudHealth(value: unknown): CloudHealth {
  if (
    !isRecord(value)
    || value.ok !== true
    || value.service !== "jushen-puzzle-cloudbase"
    || typeof value.version !== "string"
    || typeof value.region !== "string"
    || typeof value.timestamp !== "string"
  ) {
    throw new Error("云端健康检查返回了无法识别的数据");
  }

  return {
    ok: true,
    service: "jushen-puzzle-cloudbase",
    version: value.version,
    region: value.region,
    timestamp: value.timestamp,
  };
}
