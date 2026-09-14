import { userSafeError } from "./async-guard";

export type AgentFeedbackRating = "helpful" | "needs-repair";

export interface AgentFeedbackRecord {
  readonly id: string;
  readonly contextKey: string;
  readonly question: string;
  readonly source: "cloud" | "local";
  readonly rating: AgentFeedbackRating;
  readonly createdAt: string;
}

const STORAGE_KEY = "shenzhi-huixiang:agent-feedback:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseAgentFeedback(value: unknown): readonly AgentFeedbackRecord[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<AgentFeedbackRecord[]>((records, item: unknown) => {
    if (
      !isRecord(item)
      || typeof item.id !== "string"
      || typeof item.contextKey !== "string"
      || typeof item.question !== "string"
      || (item.source !== "cloud" && item.source !== "local")
      || (item.rating !== "helpful" && item.rating !== "needs-repair")
      || typeof item.createdAt !== "string"
    ) return records;
    return [...records, {
      id: item.id,
      contextKey: item.contextKey,
      question: item.question.slice(0, 260),
      source: item.source,
      rating: item.rating,
      createdAt: item.createdAt,
    }];
  }, []).slice(0, 50);
}

export function addAgentFeedback(current: readonly AgentFeedbackRecord[], record: AgentFeedbackRecord): readonly AgentFeedbackRecord[] {
  return [record, ...current.filter((item) => item.id !== record.id)].slice(0, 50);
}

export const agentFeedbackRepository = {
  record(record: AgentFeedbackRecord): void {
    try {
      const current = parseAgentFeedback(wx.getStorageSync(STORAGE_KEY));
      wx.setStorageSync(STORAGE_KEY, addAgentFeedback(current, record));
    } catch (error: unknown) {
      throw new Error(`反馈保存失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },
};
