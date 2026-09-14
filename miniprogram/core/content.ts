import type { ChoiceOption, CompetencyDomain, CompetencyGroup, LessonBlock } from "./types";

export const COMPETENCY_GROUPS: readonly CompetencyGroup[] = [
  { id: "value", title: "场景与产品", summary: "先判断为什么做、为谁做，以及怎样形成产品价值。", domainIds: ["industry", "product"], accent: "#fb923c" },
  { id: "body", title: "身体与感知", summary: "理解机器人的身体、传感器与环境表示。", domainIds: ["hardware", "sensors", "mapping"], accent: "#fb7185" },
  { id: "intelligence", title: "决策与行动", summary: "把任务目标转化为规划、控制与安全动作。", domainIds: ["planning", "control"], accent: "#c2410c" },
  { id: "engineering", title: "数据与工程", summary: "用数据、评估、仿真和部署形成落地闭环。", domainIds: ["data", "simulation"], accent: "#2f7d61" },
];

export const COMPETENCY_DOMAINS: readonly CompetencyDomain[] = [
  {
    id: "industry", index: "01", title: "行业与产品场景", summary: "识别需求、价值链与落地边界",
    valueQuestion: "机器人为什么值得在这个场景落地？", learningOutcome: "能够描述目标用户、场景约束、价值链和落地边界。", estimatedMinutes: 40, prerequisite: "无需前置知识", available: false, accent: "#fb923c",
    modules: [
      { id: "technology-routes", title: "具身智能技术流派", summary: "理解模块化方法、强化学习、VLA 与具身大模型的基本关系。", knowledgeTerms: ["具身智能的技术流派", "VLA", "强化学习"], lessonAvailable: false },
      { id: "industry-chain", title: "机器人产业链", summary: "看懂上游核心部件、中游本体和下游场景的分工。", knowledgeTerms: ["机器人产业链分析", "上游", "中游", "下游"], lessonAvailable: false },
      { id: "scenarios", title: "机器人应用场景", summary: "比较工业、仓储、清洁与特种作业的环境差异。", knowledgeTerms: ["机器人运用场景梳理", "工业制造场景", "仓储物流机器人"], lessonAvailable: false },
      { id: "roles", title: "岗位与团队分工", summary: "理解产品、项目、算法、机械和控制岗位如何协作。", knowledgeTerms: ["技术团队分工", "产品经理", "项目经理"], lessonAvailable: false },
    ],
  },
  {
    id: "hardware", index: "02", title: "机器人本体与硬件", summary: "理解本体、执行器与算力约束",
    valueQuestion: "软件能力最终受到哪些硬件边界约束？", learningOutcome: "能够识别机器人形态、执行器、机械臂和端侧算力的关键约束。", estimatedMinutes: 55, prerequisite: "建议先了解行业与产品场景", available: false, accent: "#fb7185",
    modules: [
      { id: "robot-form", title: "机器人产品形态", summary: "比较固定机械臂、移动机器人、四足与人形机器人的能力边界。", knowledgeTerms: ["机器人产品形态", "固定机械臂", "四足机器人", "人形机器人"], lessonAvailable: false },
      { id: "body", title: "本体结构与骨架", summary: "理解骨架、躯干和整机结构怎样影响负载与稳定性。", knowledgeTerms: ["人形机器人关键硬件", "骨架", "躯干"], lessonAvailable: false },
      { id: "actuator", title: "执行器、减速器与电机", summary: "认识动作输出链路及其成本、精度和可靠性取舍。", knowledgeTerms: ["执行器", "减速器", "伺服电机"], lessonAvailable: false },
      { id: "arm-hand", title: "机械臂与灵巧手", summary: "理解自由度、末端执行和任务适配之间的关系。", knowledgeTerms: ["机械臂", "灵巧手", "自由度"], lessonAvailable: false },
      { id: "compute", title: "控制器与端侧算力", summary: "理解 CPU、显卡、控制器和推理设备的部署约束。", knowledgeTerms: ["控制器", "端侧推理设备", "CPU", "显卡"], lessonAvailable: false },
    ],
  },
  {
    id: "sensors", index: "03", title: "感知与传感器", summary: "把环境约束翻译成感知方案",
    valueQuestion: "机器人怎样可靠地知道周围发生了什么？", learningOutcome: "能够根据场景、任务、安全和成本约束解释传感器组合。", estimatedMinutes: 45, prerequisite: "无需前置知识，可作为首条学习路径", available: true, accent: "#c2410c",
    modules: [
      { id: "perception-basics", title: "感知系统基础", summary: "理解环境感知、自身状态感知和任务输入的作用。", knowledgeTerms: ["感知系统", "环境感知", "姿态感知"], lessonAvailable: true },
      { id: "camera", title: "相机与深度相机", summary: "认识视觉语义、深度估计以及光照和遮挡边界。", knowledgeTerms: ["深度相机", "视觉避障", "光照"], lessonAvailable: true },
      { id: "lidar", title: "激光雷达与测距", summary: "理解点云、稳定测距、定位与障碍物检测。", knowledgeTerms: ["激光雷达", "点云", "障碍物检测"], lessonAvailable: true },
      { id: "near-field", title: "近距与安全传感器", summary: "认识近距离防撞、力反馈和安全冗余。", knowledgeTerms: ["安全防护", "激光防撞", "力反馈"], lessonAvailable: true },
      { id: "fusion", title: "多传感器融合", summary: "通过能力互补降低单一传感器的失效风险。", knowledgeTerms: ["多传感器", "融合", "卡尔曼滤波"], lessonAvailable: true },
      { id: "sensor-selection", title: "产品选型与失效边界", summary: "把环境、任务、成本和安全约束转化为选型判断。", knowledgeTerms: ["产品选型", "场景需求", "失效", "安全"], lessonAvailable: true },
    ],
  },
  {
    id: "mapping", index: "04", title: "定位、建图与世界模型", summary: "理解机器人如何建立环境表示",
    valueQuestion: "机器人怎样知道自己在哪里，并理解环境？", learningOutcome: "能够说明定位、建图、环境表示和路径规划之间的关系。", estimatedMinutes: 45, prerequisite: "建议先学习感知与传感器", available: false, accent: "#facc15",
    modules: [
      { id: "slam", title: "SLAM 基础", summary: "理解同步定位与建图解决的核心问题。", knowledgeTerms: ["slam 算法", "SLAM", "定位与建图"], lessonAvailable: false },
      { id: "mapping", title: "环境建图", summary: "理解传感器数据如何形成可使用的环境地图。", knowledgeTerms: ["环境建图", "点云", "地图"], lessonAvailable: false },
      { id: "localization", title: "定位与姿态估计", summary: "认识位置、方向和运动状态的估计方式。", knowledgeTerms: ["定位", "姿态感知", "IMU"], lessonAvailable: false },
      { id: "world-model", title: "世界模型与环境表示", summary: "理解机器人如何表达物体、空间、状态和变化。", knowledgeTerms: ["世界模型", "环境表示", "具身大模型"], lessonAvailable: false },
      { id: "navigation", title: "路径规划与导航", summary: "理解地图如何进一步支持路径计算和动态避障。", knowledgeTerms: ["路径规划", "导航", "RRT", "Dijkstra"], lessonAvailable: false },
    ],
  },
  {
    id: "planning", index: "05", title: "规划、决策与任务编排", summary: "把目标拆成可执行行为",
    valueQuestion: "机器人怎样把一句目标变成一连串动作？", learningOutcome: "能够区分高层任务决策、动作策略和执行指令。", estimatedMinutes: 50, prerequisite: "建议先了解感知和环境表示", available: false, accent: "#fb923c",
    modules: [
      { id: "decision-system", title: "决策系统", summary: "理解感知输入怎样转化为目标和行为选择。", knowledgeTerms: ["决策系统", "上层决策", "任务指令"], lessonAvailable: false },
      { id: "vla", title: "视觉语言动作模型", summary: "认识视觉、语言与动作统一建模的基本思路。", knowledgeTerms: ["视觉语言动作模型", "VLA", "动作"], lessonAvailable: false },
      { id: "brain", title: "具身大脑与小脑", summary: "理解高层认知、任务规划和运动控制的分工。", knowledgeTerms: ["具身大脑", "具身小脑", "运动控制"], lessonAvailable: false },
      { id: "task-planning", title: "任务拆解与编排", summary: "把复杂目标拆成可执行、可监控和可恢复的步骤。", knowledgeTerms: ["任务", "规划", "机器人算法开发流程"], lessonAvailable: false },
      { id: "generalization", title: "泛化与异常恢复", summary: "理解环境变化时策略为什么会失效以及如何验证。", knowledgeTerms: ["泛化性", "持续学习", "失败"], lessonAvailable: false },
    ],
  },
  {
    id: "control", index: "06", title: "控制、执行与安全", summary: "连接决策、动作与风险控制",
    valueQuestion: "机器人如何把计划稳定、安全地执行出来？", learningOutcome: "能够识别控制链路、执行误差、安全约束和冗余设计。", estimatedMinutes: 50, prerequisite: "建议先了解机器人本体与任务规划", available: false, accent: "#fb7185",
    modules: [
      { id: "control-basics", title: "运动控制基础", summary: "理解位置、速度和力控制的基本目标。", knowledgeTerms: ["运动控制算法", "位置环", "速度环", "电流环"], lessonAvailable: false },
      { id: "execution", title: "执行系统", summary: "认识控制器、驱动器、执行器和机械结构的动作链路。", knowledgeTerms: ["执行系统", "控制器", "执行器"], lessonAvailable: false },
      { id: "whole-body", title: "机械臂与全身运动", summary: "理解臂手、腿足和全身协调的不同难点。", knowledgeTerms: ["臂手运动", "腿足运动", "全身运动"], lessonAvailable: false },
      { id: "safety", title: "安全防护与冗余", summary: "识别人员混行、碰撞和能力失效时的安全设计。", knowledgeTerms: ["安全防护", "防撞", "冗余"], lessonAvailable: false },
      { id: "validation", title: "控制效果验证", summary: "通过稳定性、误差和失败后果判断是否满足任务要求。", knowledgeTerms: ["稳定性", "误差", "验证", "安全"], lessonAvailable: false },
    ],
  },
  {
    id: "data", index: "07", title: "数据、训练与评估", summary: "建立数据闭环与评价指标",
    valueQuestion: "机器人能力需要什么数据，又怎样证明它在进步？", learningOutcome: "能够描述数据采集、处理、训练和真机评估的基本闭环。", estimatedMinutes: 60, prerequisite: "建议先理解任务与技术路线", available: false, accent: "#2f7d61",
    modules: [
      { id: "data-needs", title: "数据采集需求", summary: "从任务目标反推需要记录的观测、动作和结果。", knowledgeTerms: ["机器人数据采集", "数据采集需求"], lessonAvailable: false },
      { id: "collection", title: "采集方案与设备", summary: "比较第一视角、第三人称、遥操作和专用设备。", knowledgeTerms: ["数据采集方案对比", "第一视角数据集", "数据采集设备"], lessonAvailable: false },
      { id: "teleoperation", title: "遥操作与示范", summary: "理解人类示范怎样转化为机器人训练数据。", knowledgeTerms: ["遥控操作", "模仿学习", "动力教学"], lessonAvailable: false },
      { id: "processing", title: "数据处理", summary: "认识清洗、切分、标注与质量检查。", knowledgeTerms: ["采集数据的处理", "数据", "标注"], lessonAvailable: false },
      { id: "training", title: "模仿与强化学习", summary: "比较从示范学习和从交互反馈学习的差异。", knowledgeTerms: ["模仿学习", "强化学习", "训练流程"], lessonAvailable: false },
      { id: "evaluation", title: "评估与泛化", summary: "用成功率、失败类型和场景变化检验能力。", knowledgeTerms: ["关键评价指标", "泛化性", "真机评测"], lessonAvailable: false },
    ],
  },
  {
    id: "simulation", index: "08", title: "仿真、部署与系统工程", summary: "验证系统并稳定部署到真实机器人",
    valueQuestion: "实验室里的能力怎样可靠地运行在真机上？", learningOutcome: "能够识别仿真、端侧部署、系统集成和真机验证的关键风险。", estimatedMinutes: 45, prerequisite: "建议先了解数据、硬件和控制", available: false, accent: "#fb923c",
    modules: [
      { id: "simulation", title: "仿真与合成数据", summary: "理解仿真环境和合成数据的价值与局限。", knowledgeTerms: ["仿真合成", "仿真", "合成数据"], lessonAvailable: false },
      { id: "sim2real", title: "从仿真到真实", summary: "识别模型进入真实环境后的差距和验证方法。", knowledgeTerms: ["sim", "real", "真机评测"], lessonAvailable: false },
      { id: "edge-deployment", title: "端侧部署", summary: "理解算力、显存、延迟和功耗对模型部署的约束。", knowledgeTerms: ["端侧推理设备", "显卡显存", "部署"], lessonAvailable: false },
      { id: "architecture", title: "系统架构与集成", summary: "把感知、决策、控制和数据链路组成可运行系统。", knowledgeTerms: ["系统架构设计参考", "感知系统", "决策系统", "执行系统"], lessonAvailable: false },
      { id: "operations", title: "测试、维护与迭代", summary: "建立问题记录、版本验证和现场反馈闭环。", knowledgeTerms: ["机器人算法开发流程", "验证", "开发成本"], lessonAvailable: false },
    ],
  },
  {
    id: "product", index: "09", title: "产品定义、商业化与交付", summary: "形成可交付的产品决策",
    valueQuestion: "怎样把机器人技术变成客户愿意使用的产品？", learningOutcome: "能够完成场景需求、技术取舍、成本价值和交付风险的基础判断。", estimatedMinutes: 55, prerequisite: "建议结合一个真实机器人场景学习", available: false, accent: "#c2410c",
    modules: [
      { id: "pm-role", title: "机器人产品经理职责", summary: "理解产品经理在需求、方案和团队协作中的位置。", knowledgeTerms: ["产品经理", "非技术岗介绍", "技术团队分工"], lessonAvailable: false },
      { id: "requirements", title: "场景需求与产品定义", summary: "把用户任务、环境限制和成功标准写成产品要求。", knowledgeTerms: ["场景需求", "产品选型", "机器人运用场景梳理"], lessonAvailable: false },
      { id: "tradeoffs", title: "方案取舍与选型", summary: "在性能、安全、成本和交付周期之间做选择。", knowledgeTerms: ["产品选型核心评估指标", "开发成本", "安全"], lessonAvailable: false },
      { id: "cost", title: "成本与报价", summary: "认识硬件、算法、实施和维护成本的构成。", knowledgeTerms: ["开发成本拆解案例", "算法开发报价单", "成本"], lessonAvailable: false },
      { id: "commercialization", title: "商业化与项目交付", summary: "理解商业模式、项目管理、验证和客户验收。", knowledgeTerms: ["商业模式", "项目经理", "交付", "融资"], lessonAvailable: false },
    ],
  },
];

export function findCompetencyDomain(id: string): CompetencyDomain | null {
  return COMPETENCY_DOMAINS.find((domain) => domain.id === id) ?? null;
}

export const SENSOR_LESSON: readonly LessonBlock[] = [
  {
    id: "goal",
    label: "第一天上工",
    title: "凌晨三点，小仓撞倒了货架",
    body: "你是仓储机器人公司新来的产品经理。上班第一天，运营甩来一条事故记录：夜班机器人『小仓』在通道里撞倒了货架。它明明装着 8 个传感器，为什么还会撞？学完这一节，你要能回答这个问题——靠的不是背参数，而是会看场景、会做选择。",
    knowledgeTerms: ["感知系统", "传感器", "产品选型"],
  },
  {
    id: "analogy",
    label: "老师傅的比方",
    title: "传感器像一群各有脾气的观察员",
    body: "带你的老师傅打了个比方：相机眼神好，认得颜色和文字，但怕黑怕逆光；激光雷达像蝙蝠，靠回声量距离，黑夜也稳，可遇到玻璃会看走眼；毫米波雷达雨雪天也不慌，但看不清细节。没有一个观察员能独自看清全场——这就是为什么小仓要装 8 个。",
    knowledgeTerms: ["感知系统", "深度相机", "激光雷达"],
  },
  {
    id: "constraints",
    label: "主管的第一课",
    title: "别急着选传感器，先把现场写下来",
    body: "你去请教主管：怎样才不会再撞？主管一个型号都没提，只让你先把仓库现场写清楚——约束写不明，方案就是蒙的。",
    points: ["环境：光照、粉尘、反光、遮挡", "任务：识别、测距、定位还是避障", "工程：成本、算力、延迟、安装和维护", "安全：故障后果与冗余要求"],
    knowledgeTerms: ["仓储物流机器人", "产品选型", "场景需求"],
  },
  {
    id: "tradeoff",
    label: "评审会上的争论",
    title: "参数党输给了场景党",
    body: "评审会上，有人主张直接上最贵的激光雷达，参数表碾压全场。但夜班事故恰恰发生在『参数没问题』的配置下：局部关灯后相机失效，反光地膜又让雷达丢了回波。产品语言不是找万能冠军，而是说清：哪些指标优先、哪些风险可接受、出了事谁来兜底。",
    knowledgeTerms: ["产品选型核心评估指标", "场景需求", "参数"],
  },
  {
    id: "fusion",
    label: "最后的方案",
    title: "三件套：让短板都有人补位",
    body: "最终方案是激光雷达 + 深度相机 + 近距防撞传感器：雷达负责稳定测距和几何轮廓，相机负责认出『那是人还是货架』，近距防撞做最后一道保险。组合不是堆硬件，而是针对每一种失效模式，都安排另一个观察员补位。",
    knowledgeTerms: ["安全防护", "激光防撞", "视觉避障"],
  },
  {
    id: "mistake",
    label: "前任留下的坑",
    title: "交接文档最后一页的三句话",
    body: "你翻到前任 PM 的交接文档，最后一页写着：别只看单项精度，实验室数据不等于仓库表现；别以为一个传感器能覆盖所有风险；别在没写清场景约束之前谈型号。这三句话，正是小仓撞货架的原因。",
    knowledgeTerms: ["盲目追求高端参数", "产品选型", "场景需求"],
  },
];

export const SENSOR_CHALLENGE = {
  title: "为仓储 AMR 选择感知方案",
  scenario: "机器人在室内仓库运行：通道窄、货架遮挡明显、光照会变化，并与工作人员混行。要求稳定避障、识别人员，同时控制成本。",
  prompt: "以下哪种方案更符合当前约束？",
  options: [
    { id: "camera-only", title: "只使用单目相机", detail: "成本较低，主要依赖视觉识别与估距。" },
    { id: "fusion", title: "激光雷达 + 深度/视觉相机 + 近距防撞", detail: "几何测距、语义识别与安全冗余互补。" },
    { id: "gnss", title: "主要依赖高精度 GNSS", detail: "把卫星定位作为室内导航与避障的核心。" },
  ] satisfies readonly ChoiceOption[],
  correctOptionId: "fusion",
  explanationPrompt: "请用自己的话向一位非技术同事解释：你为什么这样选？至少说明场景约束、两种传感器的能力差异，以及一个取舍或失效边界。",
};

export const TRANSFER_CASE = {
  title: "夜间补货模式：方案需要改变吗？",
  scenario: "同一台仓储 AMR 进入夜间补货：局部照明关闭，塑料膜包装可能强反光，偶尔有人推车穿过通道。团队希望减少硬件成本，但安全等级不能下降。",
  prompt: "你会怎样处理感知方案？",
  options: [
    { id: "remove-lidar", title: "移除激光雷达，只保留相机", detail: "用更便宜的视觉方案覆盖全部任务。" },
    { id: "keep-fusion", title: "保留互补感知，并优化夜间配置", detail: "保留稳定测距和近距冗余，重新验证相机与反光场景。" },
    { id: "faster", title: "提高速度弥补夜间效率", detail: "通过加速减少补货总时长。" },
  ] satisfies readonly ChoiceOption[],
  correctOptionId: "keep-fusion",
};

export const SOURCES = [
  "课程版本：sensor-path-2026.08.03",
  "资料类型：公开机器人原理与传感器技术资料的项目原创转述",
  "案例声明：仓储 AMR 场景为教学用合成案例，不代表真实企业项目",
] as const;
