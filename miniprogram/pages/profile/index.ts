import { calculateProgressPercent, createDefaultProgress } from "../../core/progress";
import type { LearningProgress } from "../../core/types";
import { cloudService } from "../../services/cloud-service";
import { learningLibraryRepository, type LearningLibraryItem } from "../../services/learning-library";
import { getLearnerLevel, setLearnerLevel, type LearnerLevel } from "../../services/learner-profile";
import { progressRepository } from "../../services/progress-repository";
import { setStudyContext } from "../../services/study-context";

const LEVEL_OPTIONS: readonly { readonly level: LearnerLevel; readonly label: string }[] = [
  { level: "rookie", label: "🌱 我是小白，从零开始" },
  { level: "product", label: "💼 我做过产品，想转机器人方向" },
  { level: "tech", label: "🔧 我懂技术，想补产品视角" },
];

const LEVEL_LABELS: Record<LearnerLevel, string> = {
  rookie: "🌱 小白",
  product: "💼 产品背景",
  tech: "🔧 技术背景",
};

interface LibraryViewItem extends LearningLibraryItem {
  readonly kindLabel: string;
  readonly updatedLabel: string;
}

interface ProfileData {
  progress: LearningProgress;
  progressPercent: number;
  cloudStatus: "checking" | "online" | "offline";
  cloudStatusLabel: string;
  cloudMessage: string;
  levelLabel: string;
  saveError: string;
  recent: readonly LibraryViewItem[];
  favorites: readonly LibraryViewItem[];
  latest: LibraryViewItem | null;
}

function itemView(item: LearningLibraryItem): LibraryViewItem {
  return {
    ...item,
    kindLabel: item.kind === "module" ? "知识点" : item.kind === "domain" ? "能力领域" : item.kind === "project" ? "项目" : "微课",
    updatedLabel: item.updatedAt.slice(5, 16).replace("T", " "),
  };
}

Page<ProfileData, WechatMiniprogram.Page.CustomOption>({
  data: {
    progress: createDefaultProgress(),
    progressPercent: 0,
    cloudStatus: "checking",
    cloudStatusLabel: "正在检查",
    cloudMessage: "本地学习功能不受云服务状态影响",
    levelLabel: LEVEL_LABELS.rookie,
    saveError: "",
    recent: [],
    favorites: [],
    latest: null,
  },

  onShow(): void {
    this.refresh();
    void this.checkCloud();
  },

  async checkCloud(): Promise<void> {
    this.setData({ cloudStatus: "checking", cloudStatusLabel: "正在检查" });
    try {
      const health = await cloudService.healthCheck();
      this.setData({
        cloudStatus: "online",
        cloudStatusLabel: "已连接",
        cloudMessage: `CloudBase ${health.region} · 后台 ${health.version}`,
      });
    } catch (error: unknown) {
      this.setData({
        cloudStatus: "offline",
        cloudStatusLabel: "本地模式",
        cloudMessage: error instanceof Error ? error.message : "云服务暂不可用，已保留本地功能",
      });
    }
  },

  refresh(): void {
    try {
      const progress = progressRepository.load();
      const library = learningLibraryRepository.load();
      const recent = library.recent.map(itemView);
      this.setData({
        progress,
        progressPercent: calculateProgressPercent(progress),
        levelLabel: LEVEL_LABELS[getLearnerLevel()],
        recent,
        favorites: library.favorites.map(itemView),
        latest: recent[0] ?? null,
        saveError: "",
      });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "学习记录读取失败" });
    }
  },

  openLibraryItem(event: WechatMiniprogram.TouchEvent): void {
    const id = String(event.currentTarget.dataset.id ?? "");
    const item = [...this.data.recent, ...this.data.favorites].find((entry) => entry.id === id);
    if (!item) return;
    if (item.kind === "module") {
      setStudyContext({
        kind: "curriculum",
        domainId: item.domainId,
        domainTitle: item.subtitle,
        moduleId: item.moduleId,
        moduleTitle: item.title,
        knowledgeTerms: item.knowledgeTerms,
        project: null,
      });
      wx.switchTab({ url: "/pages/agent/index" });
      return;
    }
    wx.navigateTo({ url: item.route });
  },

  changeLevel(): void {
    wx.showActionSheet({
      itemList: LEVEL_OPTIONS.map((option) => option.label),
      success: (result): void => {
        const option = LEVEL_OPTIONS[result.tapIndex];
        if (!option) return;
        setLearnerLevel(option.level);
        this.setData({ levelLabel: LEVEL_LABELS[option.level] });
        wx.showToast({ title: "小响已切换讲法", icon: "none" });
      },
    });
  },

  openProject(): void {
    wx.navigateTo({ url: "/pages/project/index" });
  },

  openMap(): void {
    wx.switchTab({ url: "/pages/puzzle/index" });
  },

  resetProgress(): void {
    wx.showModal({
      title: "重置本地进度？",
      content: "微课、挑战、证据和案例记录都会清空，此操作无法撤销。",
      confirmText: "确认重置",
      confirmColor: "#d85865",
      success: (result): void => {
        if (!result.confirm) return;
        try {
          progressRepository.reset();
          this.refresh();
          wx.showToast({ title: "已重置", icon: "success" });
        } catch (error: unknown) {
          this.setData({ saveError: error instanceof Error ? error.message : "重置失败" });
        }
      },
    });
  },
});
