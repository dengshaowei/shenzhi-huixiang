import { TRANSFER_CASE } from "../../core/content";
import { learningAgent, LEARNING_AGENT_MODE } from "../../core/learning-agent";
import type { KnowledgeHit } from "../../knowledge/knowledge-repository";
import { ensureKnowledgeReady } from "../../services/knowledge-service";
import { progressRepository } from "../../services/progress-repository";

interface CaseFeedback {
  readonly passed: boolean;
  readonly title: string;
  readonly body: string;
}

interface CaseData {
  caseStudy: typeof TRANSFER_CASE;
  selectedOptionId: string;
  reason: string;
  hasSubmitted: boolean;
  feedback: CaseFeedback | null;
  agentMode: string;
  knowledgeHits: readonly KnowledgeHit[];
  followUpQuestion: string;
  locked: boolean;
  celebrating: boolean;
  saveError: string;
}

Page<CaseData, WechatMiniprogram.Page.CustomOption>({
  data: {
    caseStudy: TRANSFER_CASE,
    selectedOptionId: "",
    reason: "",
    hasSubmitted: false,
    feedback: null,
    agentMode: LEARNING_AGENT_MODE,
    knowledgeHits: [],
    followUpQuestion: "",
    locked: true,
    celebrating: false,
    saveError: "",
  },

  onLoad(): void {
    void ensureKnowledgeReady();
    try {
      const progress = progressRepository.load();
      this.setData({ locked: !progress.sensorUnlocked, saveError: "" });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "案例状态读取失败" });
    }
  },

  selectOption(event: WechatMiniprogram.TouchEvent): void {
    if (this.data.hasSubmitted || this.data.locked) return;
    this.setData({ selectedOptionId: String(event.currentTarget.dataset.id ?? "") });
  },

  updateReason(event: WechatMiniprogram.TextareaInput): void {
    this.setData({ reason: event.detail.value });
  },

  submitCase(): void {
    if (this.data.locked) return;
    const reason = this.data.reason.trim();
    if (!this.data.selectedOptionId) {
      wx.showToast({ title: "请先选择处理方案", icon: "none" });
      return;
    }
    if (reason.length < 20) {
      wx.showToast({ title: "请至少说明 20 个字", icon: "none" });
      return;
    }

    const agentResponse = learningAgent.evaluateWarehouseCase(this.data.selectedOptionId, reason, TRANSFER_CASE.correctOptionId);
    const feedback: CaseFeedback = {
      passed: agentResponse.passed,
      title: agentResponse.title,
      body: agentResponse.body,
    };

    try {
      const current = progressRepository.load();
      const firstPass = agentResponse.passed && !current.caseCompleted;
      progressRepository.save({ ...current, caseCompleted: agentResponse.passed, lastRoute: "case", updatedAt: new Date().toISOString() });
      this.setData({
        hasSubmitted: true,
        feedback,
        agentMode: agentResponse.mode,
        knowledgeHits: agentResponse.knowledgeHits,
        followUpQuestion: agentResponse.followUpQuestion,
        celebrating: firstPass,
        saveError: "",
      });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "案例结果保存失败" });
    }
  },

  closeCelebration(): void {
    this.setData({ celebrating: false });
    wx.switchTab({ url: "/pages/home/index" });
  },

  retry(): void {
    this.setData({ hasSubmitted: false, feedback: null, knowledgeHits: [], followUpQuestion: "" });
  },

  backHome(): void {
    wx.switchTab({ url: "/pages/home/index" });
  },
});
