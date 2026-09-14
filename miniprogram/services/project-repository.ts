import { parseProjectLearningPlan, type ProjectLearningPlan } from "../core/project-learning";
import { userSafeError } from "./async-guard";

const STORAGE_KEY = "shenzhi-huixiang:project-plan:v1";

export const projectRepository = {
  load(): ProjectLearningPlan | null {
    try {
      const value: unknown = wx.getStorageSync(STORAGE_KEY);
      if (value === "" || value === undefined || value === null) return null;
      return parseProjectLearningPlan(value);
    } catch (error: unknown) {
      throw new Error(`读取项目计划失败：${userSafeError(error, "本地数据格式无效")}`);
    }
  },

  save(plan: ProjectLearningPlan): void {
    try {
      wx.setStorageSync(STORAGE_KEY, plan);
    } catch (error: unknown) {
      throw new Error(`保存项目计划失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },

  clear(): void {
    try {
      wx.removeStorageSync(STORAGE_KEY);
    } catch (error: unknown) {
      throw new Error(`清除项目计划失败：${userSafeError(error, "本地存储不可用")}`);
    }
  },
};
