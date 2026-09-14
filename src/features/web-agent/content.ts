import type { KnowledgeEntry } from "./types";

export const WEB_AGENT_MODE = "小响 · 本地知识 Agent（无需 API Key）";
export const WEB_AGENT_CONTENT_VERSION = "web-demo-sensor-2026.08.09";

export const SENSOR_MODULES = [
  { id: "basics", title: "感知系统基础", summary: "理解机器人需要感知什么，以及信息怎样进入决策链。" },
  { id: "camera", title: "相机与深度相机", summary: "识别语义与深度，同时看见光照、遮挡和反光边界。" },
  { id: "lidar", title: "激光雷达与测距", summary: "用稳定测距与点云支撑避障、定位和建图。" },
  { id: "fusion", title: "多传感器融合", summary: "用能力互补和安全冗余承接单点失效。" },
  { id: "selection", title: "产品选型与验证", summary: "把场景、任务、成本与风险翻译成产品判断。" },
] as const;

export const SENSOR_KNOWLEDGE: readonly KnowledgeEntry[] = [
  {
    id: "perception",
    title: "感知系统",
    tags: ["感知", "传感器", "选型", "基础"],
    summary: "感知是机器人理解环境的入口。先确认任务需要测距、语义识别还是接近预警，再组合能力；安全场景不能把全部风险交给单一传感器。",
  },
  {
    id: "lidar",
    title: "激光雷达",
    tags: ["激光雷达", "点云", "测距", "夜间", "避障"],
    summary: "激光雷达通过测距形成点云，对环境光照不敏感，适合夜间测距、避障与建图；成本、强反光表面和语义理解是它的边界。",
  },
  {
    id: "camera",
    title: "深度相机",
    tags: ["相机", "视觉", "深度", "识别", "光照", "反光"],
    summary: "深度相机能提供图像与距离信息，擅长识别人、货架和障碍物类别，但暗光、强光、遮挡、透明与反光材质会降低可靠性。",
  },
  {
    id: "warehouse",
    title: "仓储 AMR",
    tags: ["仓库", "仓储", "AMR", "人员", "货架", "通道", "混行"],
    summary: "窄通道、货架遮挡和人员随机出现让安全成为硬约束。常见方案用雷达做远端避障、视觉做语义识别、近距防撞做最后兜底。",
  },
  {
    id: "safety",
    title: "安全与冗余",
    tags: ["安全", "冗余", "失效", "防撞", "风险"],
    summary: "安全设计要假设每一层都会失效：远端感知负责减速，近端传感器负责急停，物理缓冲承接残余风险，并让系统在故障时进入安全状态。",
  },
  {
    id: "selection",
    title: "产品选型",
    tags: ["选择", "选型", "方案", "成本", "验证", "取舍"],
    summary: "选型应按场景约束、任务要求、能力组合、失效边界、成本验证展开。真实场景测试比单项参数排名更能证明方案是否可用。",
  },
] as const;

export const QUICK_PROMPTS = [
  "为什么仓库机器人不能只用相机？",
  "激光雷达和深度相机怎么选？",
  "给我一个真实机器人场景例子",
  "考考我吧",
] as const;

export const MASTERY_CHALLENGE = {
  scenario: "室内仓库通道狭窄、货架遮挡明显、光照会变化，并与工作人员混行。团队要求稳定避障、识别人员，同时控制成本。",
  prompt: "你会选择哪套感知方案？",
  options: [
    { id: "camera", title: "只使用单目相机", detail: "成本较低，主要依赖视觉识别与估距。" },
    { id: "fusion", title: "雷达 + 深度相机 + 近距防撞", detail: "测距、语义识别和安全兜底互补。" },
    { id: "gnss", title: "主要依赖高精度 GNSS", detail: "把卫星定位作为室内避障核心。" },
  ],
  correctOptionId: "fusion",
} as const;

