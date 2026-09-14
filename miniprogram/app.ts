import { CLOUD_ENV_ID, type MiniProgramApp } from "./config/cloud";
import { ensureKnowledgeReady } from "./services/knowledge-service";

App<MiniProgramApp>({
  globalData: {
    cloudReady: false,
    cloudInitializationError: "",
  },

  onLaunch(): void {
    try {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      });
      this.globalData.cloudReady = true;
      // 后台预热完整知识库；失败时保留离线摘要，不阻塞启动。
      void ensureKnowledgeReady();
    } catch (error: unknown) {
      this.globalData.cloudInitializationError = error instanceof Error
        ? error.message
        : "云服务初始化失败";
    }
  },
});
