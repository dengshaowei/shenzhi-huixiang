import { createDefaultProgress, parseProgress } from "../core/progress";
import type { LearningProgress } from "../core/types";

const STORAGE_KEY = "jushen-puzzle:progress:v1";

export const progressRepository = {
  load(): LearningProgress {
    try {
      return parseProgress(wx.getStorageSync(STORAGE_KEY));
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? `读取进度失败：${error.message}` : "读取进度失败");
    }
  },

  save(progress: LearningProgress): void {
    try {
      wx.setStorageSync(STORAGE_KEY, progress);
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? `保存进度失败：${error.message}` : "保存进度失败，请稍后重试");
    }
  },

  reset(): LearningProgress {
    const next = createDefaultProgress();
    try {
      wx.removeStorageSync(STORAGE_KEY);
      return next;
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? `重置进度失败：${error.message}` : "重置进度失败");
    }
  },
};
