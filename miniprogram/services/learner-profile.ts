export type LearnerLevel = "rookie" | "product" | "tech";

const LEVEL_KEY = "shenzhi-learner-level";
const ONBOARDED_KEY = "shenzhi-onboarded-v1";

/** 把任意存储值收敛为合法的学习者背景档位，未知值一律按小白处理。 */
export function parseLearnerLevel(value: unknown): LearnerLevel {
  return value === "product" || value === "tech" ? value : "rookie";
}

export function getLearnerLevel(): LearnerLevel {
  try {
    return parseLearnerLevel(wx.getStorageSync(LEVEL_KEY));
  } catch {
    return "rookie";
  }
}

export function setLearnerLevel(level: LearnerLevel): void {
  try {
    wx.setStorageSync(LEVEL_KEY, level);
  } catch {
    // 存储失败时静默降级：下次启动重新选择即可
  }
}

export function hasOnboarded(): boolean {
  try {
    return wx.getStorageSync(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboarded(): void {
  try {
    wx.setStorageSync(ONBOARDED_KEY, "1");
  } catch {
    // 存储失败时下次启动会再次展示引导，可接受
  }
}
