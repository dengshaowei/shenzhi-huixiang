import { answerStudyQuestion, welcomeForContext } from "../../core/study-companion";
import type { CompanionMindMap } from "../../core/study-companion";
import type { MiniProgramApp } from "../../config/cloud";
import { cloudService } from "../../services/cloud-service";
import { ensureKnowledgeReady } from "../../services/knowledge-service";
import { getLearnerLevel } from "../../services/learner-profile";
import { progressRepository } from "../../services/progress-repository";
import { agentFeedbackRepository, type AgentFeedbackRating } from "../../services/agent-feedback";
import { getStudyContext, studyContextKey, type StudyContext } from "../../services/study-context";

type MessageRole = "agent" | "user";
type ReplySource = "cloud" | "local" | "none";

interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly text: string;
  readonly followUpQuestion: string;
  readonly evidenceCount: number;
  readonly grounded: boolean;
  readonly mindMap: CompanionMindMap | null;
  readonly suggestions: readonly string[];
  readonly source: ReplySource;
  readonly thinking: boolean;
  readonly toolsUsedText: string;
  readonly relatedQuestion: string;
  readonly rating: AgentFeedbackRating | "";
}

interface QuickPrompt {
  readonly id: string;
  readonly label: string;
  readonly question: string;
}

interface AgentData {
  context: StudyContext;
  contextKey: string;
  messages: readonly ChatMessage[];
  quickPrompts: readonly QuickPrompt[];
  draft: string;
  scrollTarget: string;
  agentMode: string;
  sending: boolean;
}

const QUICK_PROMPTS: readonly QuickPrompt[] = [
  { id: "explain", label: "给我讲懂", question: "请用初学者能听懂的方式解释这个知识点。" },
  { id: "compare", label: "比较方案", question: "这个知识点里常见的方案有什么区别，应该怎么比较？" },
  { id: "quiz", label: "向我提问", question: "请结合一个机器人场景向我提一个检查理解的问题。" },
  { id: "next", label: "下一步学什么", question: "学完这个知识点后，我下一步应该关注什么？" },
];

const CLOUD_MODE_LABEL = "小响 · 云端学习伙伴（DeepSeek）";
const LOCAL_MODE_LABEL = "小响 · 离线模式（本地知识摘要）";

let messageSequence = 0;

function messageId(prefix: MessageRole): string {
  messageSequence += 1;
  return `${prefix}-${messageSequence}`;
}

function cloudAvailable(): boolean {
  try {
    return getApp<MiniProgramApp>().globalData.cloudReady;
  } catch {
    return false;
  }
}

function welcomeMessage(context: StudyContext): ChatMessage {
  return {
    id: messageId("agent"),
    role: "agent",
    text: welcomeForContext(context),
    followUpQuestion: "你想先问一个具体问题，还是让我考考你？",
    evidenceCount: 0,
    grounded: true,
    mindMap: null,
    suggestions: ["我下一步该学什么？", "这个知识点什么时候会失效？", "给我一个真实机器人例子"],
    source: "none",
    thinking: false,
    toolsUsedText: "",
    relatedQuestion: "",
    rating: "",
  };
}

function userMessage(question: string): ChatMessage {
  return {
    id: messageId("user"),
    role: "user",
    text: question,
    followUpQuestion: "",
    evidenceCount: 0,
    grounded: true,
    mindMap: null,
    suggestions: [],
    source: "none",
    thinking: false,
    toolsUsedText: "",
    relatedQuestion: question,
    rating: "",
  };
}

function thinkingMessage(): ChatMessage {
  return {
    id: messageId("agent"),
    role: "agent",
    text: "",
    followUpQuestion: "",
    evidenceCount: 0,
    grounded: true,
    mindMap: null,
    suggestions: [],
    source: "none",
    thinking: true,
    toolsUsedText: "",
    relatedQuestion: "",
    rating: "",
  };
}

function localReplyMessage(context: StudyContext, question: string, history: readonly string[]): ChatMessage {
  const reply = answerStudyQuestion(context, question, history);
  return {
    id: messageId("agent"),
    role: "agent",
    text: reply.answer,
    followUpQuestion: reply.followUpQuestion,
    evidenceCount: reply.sources.length,
    grounded: reply.grounded,
    mindMap: reply.mindMap,
    suggestions: ["再讲细一点", "给我一个机器人场景例子", "考考我吧"],
    source: "local",
    thinking: false,
    toolsUsedText: "",
    relatedQuestion: question,
    rating: "",
  };
}

const INITIAL_CONTEXT = getStudyContext();

Page<AgentData, WechatMiniprogram.Page.CustomOption>({
  data: {
    context: INITIAL_CONTEXT,
    contextKey: studyContextKey(INITIAL_CONTEXT),
    messages: [welcomeMessage(INITIAL_CONTEXT)],
    quickPrompts: QUICK_PROMPTS,
    draft: "",
    scrollTarget: "",
    agentMode: cloudAvailable() ? CLOUD_MODE_LABEL : LOCAL_MODE_LABEL,
    sending: false,
  },

  onShow(): void {
    const context = getStudyContext();
    const contextKey = studyContextKey(context);
    if (contextKey !== this.data.contextKey) {
      const message = welcomeMessage(context);
      this.setData({
        context,
        contextKey,
        messages: [message],
        draft: "",
        sending: false,
        scrollTarget: message.id,
      });
    }
    // 后台补齐完整知识库，提升本地降级回答的质量。
    void ensureKnowledgeReady();
  },

  updateDraft(event: WechatMiniprogram.TextareaInput): void {
    this.setData({ draft: event.detail.value });
  },

  sendQuestion(): void {
    const question = this.data.draft.trim();
    if (question.length < 2) {
      wx.showToast({ title: "请输入一个具体问题", icon: "none" });
      return;
    }
    this.setData({ draft: "" });
    void this.ask(question);
  },

  usePrompt(event: WechatMiniprogram.TouchEvent): void {
    const question = String(event.currentTarget.dataset.question ?? "").trim();
    if (!question) return;
    void this.ask(question);
  },

  useSuggestion(event: WechatMiniprogram.TouchEvent): void {
    const question = String(event.currentTarget.dataset.question ?? "").trim();
    if (!question) return;
    void this.ask(question);
  },

  async ask(question: string): Promise<void> {
    if (this.data.sending) return;
    const pending = [...this.data.messages, userMessage(question), thinkingMessage()];
    this.setData({ messages: pending, sending: true, scrollTarget: pending[pending.length - 1].id });

    const history = this.data.messages.filter((message) => message.role === "user").map((message) => message.text);
    let replyMessage: ChatMessage;
    let modeLabel = LOCAL_MODE_LABEL;

    if (cloudAvailable()) {
      try {
        const progress = progressRepository.load();
        const reply = await cloudService.studyChat({
          question,
          context: this.data.context,
          history,
          level: getLearnerLevel(),
          progress: {
            lessonCompleted: progress.lessonCompleted,
            challengePassed: progress.challengePassed,
            sensorUnlocked: progress.sensorUnlocked,
            caseCompleted: progress.caseCompleted,
            attempts: progress.attempts,
          },
        });
        if (reply.mode === "deepseek") {
          replyMessage = {
            id: messageId("agent"),
            role: "agent",
            text: reply.answer,
            followUpQuestion: reply.followUp,
            evidenceCount: reply.evidenceCount,
            grounded: reply.grounded,
            mindMap: null,
            suggestions: reply.suggestions,
            source: "cloud",
            thinking: false,
            toolsUsedText: reply.toolsUsed.length > 0 ? `小响行动：${reply.toolsUsed.join("、")}` : "",
            relatedQuestion: question,
            rating: "",
          };
          modeLabel = CLOUD_MODE_LABEL;
        } else {
          console.warn("[studyChat] 云端返回降级模式，使用本地回答。");
          await ensureKnowledgeReady();
          replyMessage = localReplyMessage(this.data.context, question, history);
        }
      } catch (error: unknown) {
        console.warn("[studyChat] 云端调用失败，已切换离线模式：", error);
        await ensureKnowledgeReady();
        replyMessage = localReplyMessage(this.data.context, question, history);
      }
    } else {
      await ensureKnowledgeReady();
      replyMessage = localReplyMessage(this.data.context, question, history);
    }

    const messages = [...this.data.messages.slice(0, -1), replyMessage];
    this.setData({ messages, sending: false, agentMode: modeLabel, scrollTarget: replyMessage.id });
  },

  rateReply(event: WechatMiniprogram.TouchEvent): void {
    const id = String(event.currentTarget.dataset.id ?? "");
    const rating = String(event.currentTarget.dataset.rating ?? "") as AgentFeedbackRating;
    if (rating !== "helpful" && rating !== "needs-repair") return;
    const message = this.data.messages.find((item) => item.id === id);
    if (!message || message.role !== "agent" || message.source === "none" || message.rating) return;
    try {
      agentFeedbackRepository.record({
        id,
        contextKey: this.data.contextKey,
        question: message.relatedQuestion,
        source: message.source,
        rating,
        createdAt: new Date().toISOString(),
      });
      this.setData({ messages: this.data.messages.map((item) => item.id === id ? { ...item, rating } : item) });
      if (rating === "helpful") {
        wx.showToast({ title: "已记录有帮助", icon: "none" });
        return;
      }
      const repairQuestion = `刚才对“${message.relatedQuestion}”的回答没有解决我的问题。请只针对项目或课程上下文，换一种更具体的方式解释，并明确依据和边界。`;
      void this.ask(repairQuestion);
    } catch (error: unknown) {
      wx.showToast({ title: error instanceof Error ? error.message : "反馈保存失败", icon: "none" });
    }
  },

  openMap(): void {
    wx.switchTab({ url: "/pages/puzzle/index" });
  },

  openLesson(): void {
    if (this.data.context.kind === "project") {
      wx.navigateTo({ url: "/pages/project/index" });
      return;
    }
    if (this.data.context.domainId !== "sensors") {
      wx.showToast({ title: "该领域微课仍在审核，可继续向小响提问", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/lesson/index" });
  },

  openChallenge(): void {
    if (this.data.context.kind === "project") {
      wx.navigateTo({ url: "/pages/project/index" });
      return;
    }
    wx.switchTab({ url: "/pages/challenge/index" });
  },
});
