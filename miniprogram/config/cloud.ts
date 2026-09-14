// 可选：部署云函数后替换为自己的 CloudBase 环境 ID。
// 未配置云端时，核心学习路径仍可使用本地内容和规则运行。
export const CLOUD_ENV_ID = "your-cloudbase-env-id";

export const CLOUD_FUNCTIONS = {
  healthCheck: "healthCheck",
  analyzeProject: "analyzeProject",
  knowledgePack: "knowledgePack",
  studyChat: "studyChat",
} as const;

export interface MiniProgramApp {
  globalData: {
    cloudReady: boolean;
    cloudInitializationError: string;
  };
}
