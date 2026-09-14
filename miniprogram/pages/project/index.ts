import { ALLOWED_PROJECT_EXTENSIONS, anonymousProjectFileName, PROJECT_IMPORT_CONFIRM_TEXT, validateProjectFile, type ValidatedProjectFile } from "../../core/project-import";
import { createProjectLearningProgress, evaluateProjectAnswer, projectNextAction, recordProjectAnswer, type ProjectAnswerFeedback, type ProjectDocumentCoverage, type ProjectInsight, type ProjectInsightKind, type ProjectLearningPlan, type ProjectLearningProgress, type ProjectMapGroup, type ProjectMapNode, type ProjectQuestion } from "../../core/project-learning";
import { userSafeError, withTimeout } from "../../services/async-guard";
import { cloudService } from "../../services/cloud-service";
import { learningLibraryRepository } from "../../services/learning-library";
import { projectProgressRepository } from "../../services/project-progress-repository";
import { projectRepository } from "../../services/project-repository";
import { createProjectStudyContext, setStudyContext } from "../../services/study-context";

interface ProjectPageData {
  plan: ProjectLearningPlan | null;
  status: "idle" | "uploading" | "analyzing" | "ready" | "error";
  statusText: string;
  errorMessage: string;
  currentQuestion: ProjectQuestion | null;
  questionIndex: number;
  answer: string;
  answerSubmitted: boolean;
  feedback: ProjectAnswerFeedback | null;
  progress: ProjectLearningProgress | null;
  passedCount: number;
  nextAction: string;
  cleanupWarning: string;
  saveError: string;
  mapGroups: readonly ProjectMapGroupView[];
  selectedMapNode: ProjectMapNode | null;
  visibleInsights: readonly ProjectInsight[];
  insightFilter: "all" | ProjectInsightKind;
  documentCoverage: ProjectDocumentCoverage | null;
  celebrating: boolean;
}

interface ProjectMapGroupView extends ProjectMapGroup {
  readonly expanded: boolean;
  readonly kindLabel: string;
}

function mapGroupKindLabel(kind: ProjectMapGroup["kind"]): string {
  if (kind === "purpose") return "WHY";
  if (kind === "experience") return "WHAT";
  if (kind === "validation") return "VERIFY";
  return "HOW";
}

function mapGroupViews(plan: ProjectLearningPlan, expandedIds: readonly string[] = []): readonly ProjectMapGroupView[] {
  return plan.mapGroups.map((group, index) => ({
    ...group,
    expanded: expandedIds.length === 0 ? index === 0 : expandedIds.includes(group.id),
    kindLabel: mapGroupKindLabel(group.kind),
  }));
}

function chooseProjectFile(): Promise<ValidatedProjectFile> {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: [...ALLOWED_PROJECT_EXTENSIONS],
      success: (result): void => {
        const file = result.tempFiles[0];
        if (!file) {
          reject(new Error("没有选择文件"));
          return;
        }
        try {
          resolve(validateProjectFile({ name: file.name, path: file.path, size: file.size }));
        } catch (error: unknown) {
          reject(error);
        }
      },
      fail: (error): void => reject(new Error(error.errMsg.includes("cancel") ? "已取消选择" : userSafeError(error, "无法读取所选文件"))),
    });
  });
}

function confirmDataUse(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: "确认分析这个项目？",
      content: "所选项目文件将以匿名名称临时上传到腾讯云，原文件名不会发送给分析模型。若已配置 DeepSeek，提取并脱敏后的文字会用于生成学习计划。请先确认文件不含密码、API Key、个人信息或未授权机密。",
      confirmText: PROJECT_IMPORT_CONFIRM_TEXT,
      confirmColor: "#C2410C",
      success: (result): void => resolve(result.confirm),
      fail: (error): void => reject(new Error(`确认窗口打开失败：${userSafeError(error, "请稍后重试")}`)),
    });
  });
}

Page<ProjectPageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    plan: null,
    status: "idle",
    statusText: "",
    errorMessage: "",
    currentQuestion: null,
    questionIndex: 0,
    answer: "",
    answerSubmitted: false,
    feedback: null,
    progress: null,
    passedCount: 0,
    nextAction: "",
    cleanupWarning: "",
    saveError: "",
    mapGroups: [],
    selectedMapNode: null,
    visibleInsights: [],
    insightFilter: "all",
    documentCoverage: null,
    celebrating: false,
  },

  onShow(): void {
    try {
      const plan = projectRepository.load();
      if (!plan) return;
      const progress = projectProgressRepository.load(plan.id);
      const firstPendingIndex = plan.questions.findIndex((question) => !progress.passedQuestionIds.includes(question.id));
      const questionIndex = firstPendingIndex >= 0 ? firstPendingIndex : 0;
      this.setData({
        plan,
        status: "ready",
        currentQuestion: plan.questions[questionIndex] ?? null,
        questionIndex,
        progress,
        passedCount: progress.passedQuestionIds.length,
        nextAction: projectNextAction(plan, progress),
        saveError: "",
        mapGroups: mapGroupViews(plan),
        visibleInsights: plan.insights,
        insightFilter: "all",
        documentCoverage: plan.documentCoverage,
      });
    } catch (error: unknown) {
      this.setData({ saveError: userSafeError(error, "项目计划读取失败") });
    }
  },

  async importProject(): Promise<void> {
    let uploadedFileID = "";
    try {
      const file = await chooseProjectFile();
      if (!(await confirmDataUse())) return;
      this.setData({ status: "uploading", statusText: "第 1/3 步：正在安全上传项目文件", errorMessage: "", cleanupWarning: "", saveError: "" });
      const cloudPath = `project-imports/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${file.extension}`;
      const uploaded = await withTimeout(
        wx.cloud.uploadFile({ cloudPath, filePath: file.path }),
        20_000,
        "文件上传超过 20 秒，请检查网络后重试",
      );
      uploadedFileID = uploaded.fileID;
      this.setData({ statusText: "第 2/3 步：正在创建临时读取地址" });
      const tempURLResult = await withTimeout(
        wx.cloud.getTempFileURL({ fileList: [uploaded.fileID] }),
        12_000,
        "临时文件地址创建超时，请稍后重试",
      );
      const downloadURL = tempURLResult.fileList[0]?.tempFileURL;
      if (!downloadURL) throw new Error("无法创建临时文件读取地址");
      this.setData({ status: "analyzing", statusText: "第 3/3 步：Agent 正在阅读并制定学习计划（最长约 65 秒）" });
      const plan = await cloudService.analyzeProject({ downloadURL, fileName: anonymousProjectFileName(file.extension), fileSize: file.size });
      projectRepository.save(plan);
      const progress = createProjectLearningProgress(plan.id);
      projectProgressRepository.save(progress);
      learningLibraryRepository.record({
        id: `project:${plan.id}`,
        kind: "project",
        title: plan.title,
        subtitle: "我的项目学习",
        route: "/pages/project/index",
        domainId: "",
        moduleId: "",
        knowledgeTerms: plan.goals,
      });
      this.setData({
        plan,
        status: "ready",
        statusText: "",
        currentQuestion: plan.questions[0] ?? null,
        questionIndex: 0,
        answer: "",
        answerSubmitted: false,
        feedback: null,
        progress,
        passedCount: 0,
        nextAction: projectNextAction(plan, progress),
        cleanupWarning: "",
        saveError: "",
        mapGroups: mapGroupViews(plan),
        selectedMapNode: null,
        visibleInsights: plan.insights,
        insightFilter: "all",
        documentCoverage: plan.documentCoverage,
        celebrating: false,
      });
      wx.showToast({ title: "学习计划已生成", icon: "success" });
    } catch (error: unknown) {
      const message = userSafeError(error, "项目分析失败，请稍后重试");
      if (message !== "已取消选择") this.setData({ status: "error", errorMessage: message, statusText: "" });
    } finally {
      wx.hideLoading();
      if (uploadedFileID) {
        this.setData({ statusText: "正在删除临时项目文件" });
        try {
          await withTimeout(
            wx.cloud.deleteFile({ fileList: [uploadedFileID] }),
            10_000,
            "临时文件删除超时",
          );
          this.setData({ statusText: "" });
        } catch (error: unknown) {
          console.warn("[projectImport] 临时文件清理失败：", error);
          this.setData({ statusText: "", cleanupWarning: "学习计划已处理，但临时文件自动删除未确认。请稍后重试导入，或在云开发存储中检查 project-imports。" });
        }
      }
    }
  },

  updateAnswer(event: WechatMiniprogram.TextareaInput): void {
    this.setData({ answer: event.detail.value });
  },

  submitAnswer(): void {
    const question = this.data.currentQuestion;
    if (!question || this.data.answer.trim().length < 10) {
      wx.showToast({ title: "请先写出你的项目判断", icon: "none" });
      return;
    }
    const plan = this.data.plan;
    if (!plan) return;
    const feedback = evaluateProjectAnswer(this.data.answer, question);
    try {
      const current = projectProgressRepository.load(plan.id);
      const progress = recordProjectAnswer(current, question, this.data.answer, feedback, plan.questions.length);
      projectProgressRepository.save(progress);
      this.setData({
        feedback,
        answerSubmitted: true,
        progress,
        passedCount: progress.passedQuestionIds.length,
        nextAction: projectNextAction(plan, progress),
        saveError: "",
        celebrating: progress.completed && !current.completed,
      });
      if (progress.completed) wx.showToast({ title: "项目学习已闭环", icon: "success" });
    } catch (error: unknown) {
      this.setData({ saveError: userSafeError(error, "项目回答保存失败") });
    }
  },

  nextQuestion(): void {
    const plan = this.data.plan;
    if (!plan) return;
    const nextPending = plan.questions.findIndex((question, index) => index > this.data.questionIndex && !this.data.progress?.passedQuestionIds.includes(question.id));
    const firstPending = plan.questions.findIndex((question) => !this.data.progress?.passedQuestionIds.includes(question.id));
    const nextIndex = nextPending >= 0 ? nextPending : firstPending >= 0 ? firstPending : (this.data.questionIndex + 1) % plan.questions.length;
    this.setData({ questionIndex: nextIndex, currentQuestion: plan.questions[nextIndex] ?? null, answer: "", answerSubmitted: false, feedback: null });
  },

  retryQuestion(): void {
    this.setData({ answerSubmitted: false, feedback: null, saveError: "" });
  },

  toggleMapGroup(event: WechatMiniprogram.TouchEvent): void {
    const id = String(event.currentTarget.dataset.id ?? "");
    this.setData({
      mapGroups: this.data.mapGroups.map((group) => group.id === id ? { ...group, expanded: !group.expanded } : group),
      selectedMapNode: null,
    });
  },

  expandAllMapGroups(): void {
    const allExpanded = this.data.mapGroups.every((group) => group.expanded);
    this.setData({ mapGroups: this.data.mapGroups.map((group) => ({ ...group, expanded: !allExpanded })), selectedMapNode: null });
  },

  focusMapNode(event: WechatMiniprogram.TouchEvent): void {
    const groupId = String(event.currentTarget.dataset.groupId ?? "");
    const nodeId = String(event.currentTarget.dataset.nodeId ?? "");
    const node = this.data.mapGroups.find((group) => group.id === groupId)?.children.find((item) => item.id === nodeId) ?? null;
    this.setData({ selectedMapNode: node });
  },

  filterInsights(event: WechatMiniprogram.TouchEvent): void {
    const filter = String(event.currentTarget.dataset.kind ?? "all") as "all" | ProjectInsightKind;
    if (!["all", "decision", "risk", "gap", "metric"].includes(filter)) return;
    const insights = this.data.plan?.insights ?? [];
    this.setData({ insightFilter: filter, visibleInsights: filter === "all" ? insights : insights.filter((item) => item.kind === filter) });
  },

  closeProjectCelebration(): void {
    this.setData({ celebrating: false });
  },

  noop(): void {
    // Used by catchtouchmove to keep the celebration modal in place.
  },

  openMap(): void {
    wx.switchTab({ url: "/pages/puzzle/index" });
  },

  openCompanion(): void {
    wx.switchTab({ url: "/pages/agent/index" });
  },

  openProjectCompanion(): void {
    const plan = this.data.plan;
    if (!plan) return;
    setStudyContext(createProjectStudyContext(plan));
    wx.switchTab({ url: "/pages/agent/index" });
  },

  clearProject(): void {
    wx.showModal({
      title: "移除当前项目？",
      content: "只会清除当前设备上的学习计划，不会影响原文件。",
      confirmText: "确认移除",
      confirmColor: "#d85865",
      success: (result): void => {
        if (!result.confirm) return;
        try {
          projectRepository.clear();
          projectProgressRepository.clear();
          this.setData({ plan: null, status: "idle", currentQuestion: null, questionIndex: 0, answer: "", answerSubmitted: false, feedback: null, progress: null, passedCount: 0, nextAction: "", cleanupWarning: "", saveError: "", mapGroups: [], selectedMapNode: null, visibleInsights: [], insightFilter: "all", documentCoverage: null, celebrating: false });
        } catch (error: unknown) {
          this.setData({ saveError: userSafeError(error, "项目清除失败") });
        }
      },
    });
  },
});
