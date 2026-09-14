import type { Edge, Node } from "@xyflow/react";

export type MasteryStatus = "mastered" | "learning" | "available" | "locked";

export type CompetencyNodeData = {
  order: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  status: MasteryStatus;
  progress: number;
  pieces: number;
  outcome: string;
  prerequisite?: string;
  accent: string;
};

export const STATUS_LABELS: Record<MasteryStatus, string> = {
  mastered: "已掌握",
  learning: "学习中",
  available: "可开始",
  locked: "待解锁",
};

export const competencyNodes: Node<CompetencyNodeData>[] = [
  {
    id: "industry",
    type: "competency",
    position: { x: 40, y: 250 },
    data: {
      order: "01",
      title: "行业与产品场景",
      shortTitle: "行业场景",
      icon: "⌁",
      description: "理解具身智能为何存在，以及哪些真实问题值得机器人进入。",
      status: "mastered",
      progress: 100,
      pieces: 4,
      outcome: "能从用户、任务、环境三个维度判断机器人产品机会。",
      accent: "mint",
    },
  },
  {
    id: "hardware",
    type: "competency",
    position: { x: 330, y: 90 },
    data: {
      order: "02",
      title: "机器人本体与硬件",
      shortTitle: "本体硬件",
      icon: "⚙",
      description: "认识身体结构、执行器、算力、电源与成本之间的制约。",
      status: "available",
      progress: 0,
      pieces: 4,
      outcome: "能读懂一台机器人的基础硬件构成与工程边界。",
      prerequisite: "行业与产品场景",
      accent: "amber",
    },
  },
  {
    id: "perception",
    type: "competency",
    position: { x: 330, y: 405 },
    data: {
      order: "03",
      title: "感知与传感器",
      shortTitle: "感知系统",
      icon: "◉",
      description: "理解相机、激光雷达与惯性传感器如何共同建立环境认知。",
      status: "learning",
      progress: 35,
      pieces: 5,
      outcome: "能在场景约束下选择感知组合，并解释关键取舍。",
      prerequisite: "行业与产品场景",
      accent: "cyan",
    },
  },
  {
    id: "world-model",
    type: "competency",
    position: { x: 650, y: 245 },
    data: {
      order: "04",
      title: "定位、建图与世界模型",
      shortTitle: "世界模型",
      icon: "◇",
      description: "把连续感知组织成机器人可定位、可预测的内部世界。",
      status: "available",
      progress: 0,
      pieces: 4,
      outcome: "能解释定位、地图与世界模型对产品能力的影响。",
      prerequisite: "感知与传感器",
      accent: "violet",
    },
  },
  {
    id: "planning",
    type: "competency",
    position: { x: 970, y: 70 },
    data: {
      order: "05",
      title: "规划、决策与任务编排",
      shortTitle: "规划决策",
      icon: "⌘",
      description: "让机器人从目标出发，选择下一步行动与任务顺序。",
      status: "locked",
      progress: 0,
      pieces: 4,
      outcome: "能拆解任务规划链路，并设计异常与恢复路径。",
      prerequisite: "世界模型",
      accent: "rose",
    },
  },
  {
    id: "control",
    type: "competency",
    position: { x: 970, y: 340 },
    data: {
      order: "06",
      title: "控制、执行与安全",
      shortTitle: "控制安全",
      icon: "△",
      description: "把决策变成稳定动作，并管理人与环境中的安全边界。",
      status: "locked",
      progress: 0,
      pieces: 4,
      outcome: "能定义动作指标、安全约束和失效保护。",
      prerequisite: "规划、决策与任务编排",
      accent: "orange",
    },
  },
  {
    id: "data",
    type: "competency",
    position: { x: 1280, y: 10 },
    data: {
      order: "07",
      title: "数据、训练与评估",
      shortTitle: "数据评估",
      icon: "▦",
      description: "设计数据闭环、模型训练与能反映真实能力的评估体系。",
      status: "locked",
      progress: 0,
      pieces: 4,
      outcome: "能把产品失败转化为数据、训练与评测问题。",
      prerequisite: "控制、执行与安全",
      accent: "blue",
    },
  },
  {
    id: "simulation",
    type: "competency",
    position: { x: 1280, y: 280 },
    data: {
      order: "08",
      title: "仿真、部署与系统工程",
      shortTitle: "系统工程",
      icon: "⬡",
      description: "在仿真与真实环境之间验证、部署和维护机器人能力。",
      status: "locked",
      progress: 0,
      pieces: 4,
      outcome: "能设计从原型到现场的测试与交付链路。",
      prerequisite: "数据、训练与评估",
      accent: "indigo",
    },
  },
  {
    id: "delivery",
    type: "competency",
    position: { x: 1280, y: 550 },
    data: {
      order: "09",
      title: "产品定义、商业化与交付",
      shortTitle: "产品交付",
      icon: "✦",
      description: "把技术能力变成可落地、可衡量、可持续交付的产品。",
      status: "locked",
      progress: 0,
      pieces: 3,
      outcome: "能完成产品分析、需求文档和技术方案协同。",
      prerequisite: "系统工程 + 全局能力",
      accent: "lime",
    },
  },
];

const connection = (source: string, target: string, animated = false): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  type: "smoothstep",
  animated,
  style: { stroke: animated ? "#5eead4" : "rgba(148, 163, 184, .28)", strokeWidth: animated ? 2.3 : 1.4 },
});

export const competencyEdges: Edge[] = [
  connection("industry", "hardware"),
  connection("industry", "perception", true),
  connection("hardware", "world-model"),
  connection("perception", "world-model", true),
  connection("world-model", "planning"),
  connection("world-model", "control"),
  connection("planning", "data"),
  connection("control", "simulation"),
  connection("data", "delivery"),
  connection("simulation", "delivery"),
];

export const DEFAULT_SELECTED_NODE_ID = "perception";

