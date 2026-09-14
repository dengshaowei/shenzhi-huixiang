import { createProjectLearningProgress, parseProjectLearningProgress, type ProjectLearningProgress } from "../core/project-learning";
import { userSafeError } from "./async-guard";

const STORAGE_KEY = "shenzhi-huixiang:project-progress:v1";

export const projectProgressRepository = {
  load(projectId: string): ProjectLearningProgress {
    try {
      const value: unknown = wx.getStorageSync(STORAGE_KEY);
      if (value === "" || value === undefined || value === null) return createProjectLearningProgress(projectId);
      return parseProjectLearningProgress(value, projectId);
    } catch (error: unknown) {
      throw new Error(`读取项目进度失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },

  save(progress: ProjectLearningProgress): void {
    try {
      wx.setStorageSync(STORAGE_KEY, progress);
    } catch (error: unknown) {
      throw new Error(`保存项目进度失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },

  clear(): void {
    try {
      wx.removeStorageSync(STORAGE_KEY);
    } catch (error: unknown) {
      throw new Error(`清除项目进度失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },
};
