import { CLOUD_FUNCTIONS } from "../config/cloud";
import { parseCloudHealth, parseStudyChatReply, type CloudHealth, type StudyChatReply } from "../core/cloud-contracts";
import { parseProjectLearningPlan, type ProjectLearningPlan } from "../core/project-learning";
import type { LearnerLevel } from "./learner-profile";
import type { StudyContext } from "./study-context";
import { withTimeout } from "./async-guard";

export const cloudService = {
  async healthCheck(): Promise<CloudHealth> {
    const response = await withTimeout(
      wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.healthCheck }),
      12_000,
      "云服务连接超时，本地学习功能仍可使用",
    );
    return parseCloudHealth(response.result);
  },

  async analyzeProject(input: { readonly downloadURL: string; readonly fileName: string; readonly fileSize: number }): Promise<ProjectLearningPlan> {
    const response = await withTimeout(
      wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.analyzeProject, data: input }),
      65_000,
      "项目分析超过 65 秒，请检查网络后重试",
    );
    if (typeof response.result === "object" && response.result !== null && "error" in response.result) {
      const error = (response.result as { readonly error?: unknown }).error;
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as { readonly message?: unknown }).message === "string") {
        throw new Error((error as { readonly message: string }).message);
      }
      throw new Error("项目分析服务暂不可用");
    }
    return parseProjectLearningPlan(response.result);
  },

  async studyChat(input: {
    readonly question: string;
    readonly context: StudyContext;
    readonly history: readonly string[];
    readonly level: LearnerLevel;
    readonly progress?: { readonly lessonCompleted: boolean; readonly challengePassed: boolean; readonly sensorUnlocked: boolean; readonly caseCompleted: boolean; readonly attempts: number };
  }): Promise<StudyChatReply> {
    const response = await withTimeout(
      wx.cloud.callFunction({
        name: CLOUD_FUNCTIONS.studyChat,
        data: {
          question: input.question,
          level: input.level,
          progress: input.progress,
          context: {
            kind: input.context.kind,
            domainTitle: input.context.domainTitle,
            moduleTitle: input.context.moduleTitle,
            knowledgeTerms: input.context.knowledgeTerms,
            project: input.context.project,
          },
          history: input.history.slice(-6),
        },
      }),
      65_000,
      "小响响应超时，已准备切换离线回答",
    );
    return parseStudyChatReply(response.result);
  },
};
