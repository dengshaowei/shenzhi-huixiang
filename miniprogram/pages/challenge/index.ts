import type { LearningProgress } from "../../core/types";
import { createDefaultProgress } from "../../core/progress";
import { progressRepository } from "../../services/progress-repository";

interface ChallengeData {
  progress: LearningProgress;
  saveError: string;
}

Page<ChallengeData, WechatMiniprogram.Page.CustomOption>({
  data: { progress: createDefaultProgress(), saveError: "" },

  onShow(): void {
    try {
      this.setData({ progress: progressRepository.load(), saveError: "" });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "挑战状态读取失败" });
    }
  },

  openFeynman(): void {
    wx.navigateTo({ url: "/pages/feynman/index" });
  },

  openCase(): void {
    if (!this.data.progress.sensorUnlocked) {
      wx.showToast({ title: "先通过传感器挑战", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/case/index" });
  },
});
