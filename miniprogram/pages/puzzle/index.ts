import { COMPETENCY_DOMAINS, COMPETENCY_GROUPS } from "../../core/content";
import type { DomainState } from "../../core/types";
import { progressRepository } from "../../services/progress-repository";

interface DomainView {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly moduleCount: number;
  readonly estimatedMinutes: number;
  readonly learningOutcome: string;
  readonly accent: string;
  readonly state: DomainState;
  readonly stateLabel: string;
}

interface PuzzleData {
  domains: readonly DomainView[];
  groups: readonly DomainGroupView[];
  masteredCount: number;
  saveError: string;
}

interface DomainGroupView {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly accent: string;
  readonly domains: readonly DomainView[];
}

function stateLabel(state: DomainState): string {
  if (state === "mastered") return "已点亮";
  if (state === "learning") return "学习中";
  if (state === "ready") return "可开始";
  return "目录预览";
}

Page<PuzzleData, WechatMiniprogram.Page.CustomOption>({
  data: { domains: [], groups: [], masteredCount: 0, saveError: "" },

  onShow(): void {
    try {
      const progress = progressRepository.load();
      const domains = COMPETENCY_DOMAINS.map((domain): DomainView => {
        const state: DomainState = !domain.available
          ? "locked"
          : progress.sensorUnlocked
            ? "mastered"
            : progress.lessonCompleted
              ? "learning"
              : "ready";
        return {
          ...domain,
          moduleCount: domain.modules.length,
          estimatedMinutes: domain.estimatedMinutes,
          learningOutcome: domain.learningOutcome,
          state,
          stateLabel: stateLabel(state),
        };
      });
      const groups = COMPETENCY_GROUPS.map((group): DomainGroupView => ({
        ...group,
        domains: group.domainIds
          .map((id) => domains.find((domain) => domain.id === id))
          .filter((domain): domain is DomainView => domain !== undefined),
      }));
      this.setData({ domains, groups, masteredCount: progress.sensorUnlocked ? 1 : 0, saveError: "" });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "知识导图读取失败" });
    }
  },

  selectDomain(event: WechatMiniprogram.TouchEvent): void {
    const id = String(event.currentTarget.dataset.id ?? "");
    if (!COMPETENCY_DOMAINS.some((domain) => domain.id === id)) return;
    wx.navigateTo({ url: `/pages/domain/index?id=${id}` });
  },
});
