import { SENSOR_CHALLENGE } from "../../core/content";
import { learningAgent, LEARNING_AGENT_MODE } from "../../core/learning-agent";
import type { EvaluationResult, MasteryDecision } from "../../core/types";
import type { KnowledgeHit } from "../../knowledge/knowledge-repository";
import { ensureKnowledgeReady } from "../../services/knowledge-service";
import { progressRepository } from "../../services/progress-repository";

interface FeynmanData {
  challenge: typeof SENSOR_CHALLENGE;
  selectedOptionId: string;
  answer: string;
  hasSubmitted: boolean;
  challengePassed: boolean;
  evaluation: EvaluationResult | null;
  decision: MasteryDecision | null;
  agentMode: string;
  knowledgeHits: readonly KnowledgeHit[];
  followUpQuestion: string;
  celebrating: boolean;
  saveError: string;
}

Page<FeynmanData, WechatMiniprogram.Page.CustomOption>({
  data: {
    challenge: SENSOR_CHALLENGE,
    selectedOptionId: "",
    answer: "",
    hasSubmitted: false,
    challengePassed: false,
    evaluation: null,
    decision: null,
    agentMode: LEARNING_AGENT_MODE,
    knowledgeHits: [],
    followUpQuestion: "",
    celebrating: false,
    saveError: "",
  },

  onLoad(): void {
    // 提前拉取完整知识库；提交费曼复述时评估证据更充分，失败也不影响本地规则判定。
    void ensureKnowledgeReady();
  },

  selectOption(event: WechatMiniprogram.TouchEvent): void {
    if (this.data.hasSubmitted) return;
    this.setData({ selectedOptionId: String(event.currentTarget.dataset.id ?? "") });
  },

  updateAnswer(event: WechatMiniprogram.TextareaInput): void {
    this.setData({ answer: event.detail.value });
  },

  submitAttempt(): void {
    const selectedOptionId = this.data.selectedOptionId;
    const answer = this.data.answer.trim();
    if (!selectedOptionId) {
      wx.showToast({ title: "请先选择一个方案", icon: "none" });
      return;
    }
    if (answer.length < 40) {
      wx.showToast({ title: "请至少写 40 个字", icon: "none" });
      return;
    }

    const challengePassed = selectedOptionId === SENSOR_CHALLENGE.correctOptionId;
    const agentResponse = learningAgent.evaluateSensorExplanation(answer, challengePassed);
    const { evaluation, decision } = agentResponse;

    try {
      const current = progressRepository.load();
      const remainsUnlocked = current.sensorUnlocked || decision.unlocked;
      progressRepository.save({
        ...current,
        challengePassed: current.sensorUnlocked ? true : challengePassed,
        feynmanMastered: current.feynmanMastered || decision.unlocked,
        sensorUnlocked: remainsUnlocked,
        attempts: current.attempts + 1,
        lastRoute: remainsUnlocked ? "case" : "feynman",
        evidence: decision.unlocked && !current.sensorUnlocked
          ? evaluation.dimensions.filter(({ passed }) => passed).map(({ label, evidence }) => `${label}：${evidence}`)
          : current.evidence,
        updatedAt: new Date().toISOString(),
      });
      this.setData({
        hasSubmitted: true,
        challengePassed,
        evaluation,
        decision,
        agentMode: agentResponse.mode,
        knowledgeHits: agentResponse.knowledgeHits,
        followUpQuestion: agentResponse.followUpQuestion,
        celebrating: decision.unlocked && !current.sensorUnlocked,
        saveError: "",
      });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "本次结果保存失败" });
    }
  },

  closeCelebration(): void {
    this.setData({ celebrating: false });
    wx.navigateTo({ url: "/pages/case/index" });
  },

  retry(): void {
    this.setData({ hasSubmitted: false, evaluation: null, decision: null, knowledgeHits: [], followUpQuestion: "", saveError: "" });
  },

  goToCase(): void {
    wx.navigateTo({ url: "/pages/case/index" });
  },
});
