import { calculateProgressPercent, createDefaultProgress, getNextRoute } from "../../core/progress";
import type { LearningProgress, ProgressRoute } from "../../core/types";
import { hasOnboarded, markOnboarded, parseLearnerLevel, setLearnerLevel } from "../../services/learner-profile";
import { progressRepository } from "../../services/progress-repository";
import { syncTabBarVisibility } from "../../services/tab-bar-visibility";

interface HomeData {
  progress: LearningProgress;
  progressPercent: number;
  primaryLabel: string;
  nextRoute: ProgressRoute;
  showOnboarding: boolean;
  onboardStep: number;
  saveError: string;
}

function routeLabel(route: ProgressRoute): string {
  if (route === "lesson") return "开始传感器微课";
  if (route === "feynman") return "继续挑战与复述";
  return "进入机器人案例";
}

Page<HomeData, WechatMiniprogram.Page.CustomOption>({
  data: {
    progress: createDefaultProgress(),
    progressPercent: 0,
    primaryLabel: "开始传感器微课",
    nextRoute: "lesson",
    showOnboarding: false,
    onboardStep: 0,
    saveError: "",
  },

  onShow(): void {
    try {
      const progress = progressRepository.load();
      const nextRoute = getNextRoute(progress);
      const needOnboarding = !hasOnboarded();
      this.setData({
        progress,
        progressPercent: calculateProgressPercent(progress),
        nextRoute,
        primaryLabel: routeLabel(nextRoute),
        showOnboarding: needOnboarding,
        saveError: "",
      });
      // 显式同步两种状态，避免 DevTools 热更新或存储迁移后残留隐藏的原生 TabBar。
      syncTabBarVisibility(needOnboarding, {
        hide: (): void => { void wx.hideTabBar({ animation: false }); },
        show: (): void => { void wx.showTabBar({ animation: false }); },
      });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "进度读取失败" });
    }
  },

  nextOnboard(): void {
    this.setData({ onboardStep: Math.min(this.data.onboardStep + 1, 2) });
  },

  chooseLevel(event: WechatMiniprogram.TouchEvent): void {
    const level = parseLearnerLevel(event.currentTarget.dataset.level);
    setLearnerLevel(level);
    markOnboarded();
    this.setData({ showOnboarding: false });
    wx.showTabBar({ animation: false });
  },

  noop(): void {
    // 仅用于 catchtouchmove，阻止引导层背后的页面滚动
  },

  continueLearning(): void {
    wx.navigateTo({ url: `/pages/${this.data.nextRoute}/index` });
  },

  openPuzzle(): void {
    wx.switchTab({ url: "/pages/puzzle/index" });
  },

  openAgent(): void {
    wx.switchTab({ url: "/pages/agent/index" });
  },
});
