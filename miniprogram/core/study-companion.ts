import { getKnowledgeRepository, type KnowledgeHit } from "../knowledge/knowledge-repository";
import type { StudyContext } from "../services/study-context";
import { findCompetencyDomain } from "./content";

export const STUDY_COMPANION_MODE = "小响 · 本地学习伙伴（离线模式）";

export interface MindMapBranch {
  readonly id: string;
  readonly title: string;
  readonly points: readonly string[];
}

export interface CompanionMindMap {
  readonly rootTitle: string;
  readonly rootSummary: string;
  readonly branches: readonly MindMapBranch[];
}

export interface CompanionReply {
  readonly answer: string;
  readonly followUpQuestion: string;
  readonly sources: readonly KnowledgeHit[];
  readonly grounded: boolean;
  readonly mindMap: CompanionMindMap | null;
}

const STOP_TERMS = new Set(["什么", "怎么", "为什么", "一下", "这个", "那个", "可以", "还是", "以及", "帮我", "请问"]);

function splitTerms(text: string): readonly string[] {
  return text
    .split(/[\s，。！？、；：,.!?;:]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !STOP_TERMS.has(term));
}

function extractTerms(question: string, context: StudyContext, conversationHistory: readonly string[]): readonly string[] {
  const recentTerms = conversationHistory.slice(-2).reduce<string[]>((terms, item) => [...terms, ...splitTerms(item)], []);
  return [...new Set([...splitTerms(question), ...recentTerms, context.moduleTitle, ...context.knowledgeTerms])].slice(0, 12);
}

function guidanceFor(question: string): string {
  if (["区别", "对比", "差异"].some((term) => question.includes(term))) {
    return "比较时先看任务目标，再比较环境适应性、精度、延迟、成本和失效后果，不要只看单项参数。";
  }
  if (["选择", "选型", "方案", "怎么做"].some((term) => question.includes(term))) {
    return "做产品判断时，建议按“场景约束 → 任务要求 → 能力组合 → 失效边界 → 成本验证”的顺序展开。";
  }
  if (["不懂", "解释", "是什么", "意思"].some((term) => question.includes(term))) {
    return "先抓住它解决的任务，再看输入、输出和边界；暂时不用记住全部技术名词。";
  }
  return "你可以把这段知识放回一个具体机器人任务里，检查它解决什么问题、依赖什么条件、失败会造成什么后果。";
}

function sourcePoints(sources: readonly KnowledgeHit[]): readonly string[] {
  return sources
    .reduce<string[]>((points, source) => [...points, ...source.excerpt.split(/[。；！？]/)], [])
    .reduce<string[]>((points, point) => point.length > 90 ? [...points, ...point.split(/[，,]/)] : [...points, point], [])
    .map((point) => point.trim())
    .filter((point) => point.length >= 12)
    .slice(0, 3);
}

function learningMap(context: StudyContext, question: string, sources: readonly KnowledgeHit[]): CompanionMindMap {
  const evidencePoints = sourcePoints(sources);
  const isComparison = ["区别", "对比", "差异", "比较"].some((term) => question.includes(term));
  const isSelection = ["选择", "选型", "方案", "怎么做"].some((term) => question.includes(term));
  const decisionPoints = isComparison
    ? ["先确认两种方案服务的是不是同一个任务", "比较环境适应性、精度、延迟、成本与失效后果", "最后用真实场景测试决定取舍"]
    : isSelection
      ? ["先写清环境与任务约束", "再组合需要的能力", "最后检查失效边界、成本与验证方法"]
      : ["先理解它解决的任务", "再看输入、输出与工作链路", "最后回到真实场景检查边界"];
  return {
    rootTitle: context.moduleTitle,
    rootSummary: `围绕“${context.domainTitle}”建立可应用的理解`,
    branches: [
      {
        id: "meaning",
        title: "核心含义",
        points: evidencePoints.slice(0, 1).length > 0 ? evidencePoints.slice(0, 1) : [`它属于“${context.domainTitle}”中的关键能力，需要结合任务理解。`],
      },
      {
        id: "mechanism",
        title: "如何发挥作用",
        points: evidencePoints.slice(1).length > 0 ? evidencePoints.slice(1) : context.knowledgeTerms.map((term) => `理解 ${term} 在任务链路中的作用`).slice(0, 2),
      },
      { id: "decision", title: "怎样做判断", points: decisionPoints },
      { id: "boundary", title: "场景与边界", points: [guidanceFor(question), followUpFor(context)] },
    ],
  };
}

function followUpFor(context: StudyContext): string {
  if (context.kind === "project") {
    return `如果“${context.moduleTitle}”的核心假设失效，你会先验证哪项风险？`;
  }
  if (context.domainId === "sensors") {
    return "如果环境光照、遮挡或人员密度发生变化，你会优先重新验证哪项能力？";
  }
  if (context.domainId === "product") {
    return "如果客户预算下降，但安全要求不变，你会保留什么、调整什么？";
  }
  if (context.domainId === "data") {
    return "你会用什么任务结果判断这批数据真的提升了机器人能力？";
  }
  return `你能用一个真实机器人场景解释“${context.moduleTitle}”为什么重要吗？`;
}

function projectReply(context: StudyContext, question: string): CompanionReply | null {
  const project = context.project;
  if (!project) return null;
  const asksNext = ["下一步", "接下来", "怎么学"].some((term) => question.includes(term));
  const branches = project.branches.slice(0, 4).map((branch, index) => ({
    id: `project-${index + 1}`,
    title: branch.title,
    points: branch.points.slice(0, 4),
  }));
  return {
    answer: asksNext
      ? `先用项目题目验证你能否说清“${project.goals[0] ?? "项目目标"}”，再补齐风险和验收依据。下面是当前项目计划的关键分支。`
      : `我会只依据已保存的项目计划讨论“${project.title}”。先把你的问题放回项目目标、方案、约束和验证证据里判断。`,
    followUpQuestion: followUpFor(context),
    sources: [],
    grounded: true,
    mindMap: {
      rootTitle: project.title,
      rootSummary: project.summary,
      branches: branches.length >= 2
        ? branches
        : [
          { id: "project-goals", title: "学习目标", points: project.goals.slice(0, 4) },
          { id: "project-check", title: "完成标准", points: ["能引用项目依据回答", "能说明风险、取舍与验证方法"] },
        ],
    },
  };
}

export function answerStudyQuestion(
  context: StudyContext,
  question: string,
  conversationHistory: readonly string[] = [],
): CompanionReply {
  if (["向我提问", "考考我", "出题"].some((term) => question.includes(term))) {
    return {
      answer: `好，先不讲结论。请结合“${context.moduleTitle}”完成下面这道场景题。`,
      followUpQuestion: followUpFor(context),
      sources: [],
      grounded: true,
      mindMap: null,
    };
  }

  if (context.kind === "project") {
    const reply = projectReply(context, question);
    if (reply) return reply;
  }

  const terms = extractTerms(question, context, conversationHistory);
  const sources = getKnowledgeRepository().search({ terms, limit: 3 });
  if (sources.length === 0) {
    return {
      answer: `这个问题目前缺少足够的知识依据，我先不继续扩展。你可以补充具体场景，或者先查看“${context.moduleTitle}”的知识目录。`,
      followUpQuestion: "你能补充机器人类型、任务和使用环境吗？",
      sources: [],
      grounded: false,
      mindMap: null,
    };
  }

  const primary = sources[0];
  if (["下一步", "接下来"].some((term) => question.includes(term))) {
    const domain = findCompetencyDomain(context.domainId);
    const currentIndex = domain?.modules.findIndex((module) => module.id === context.moduleId) ?? -1;
    const nextModule = domain?.modules[currentIndex + 1];
    const recommendation = nextModule
      ? `下一步建议学习“${nextModule.title}”：${nextModule.summary}`
      : "你已经来到这个领域目录的最后一个模块，可以进入挑战或换一个能力域。";
    return {
      answer: "我把下一步学习顺序整理成了导图，你可以按节点逐个完成。",
      followUpQuestion: nextModule ? "你希望先听一个初学者解释，还是直接看一个机器人场景？" : "要进入挑战，还是返回知识地图？",
      sources,
      grounded: true,
      mindMap: {
        rootTitle: context.moduleTitle,
        rootSummary: "当前学习位置",
        branches: [
          { id: "learned", title: "先确认已掌握", points: [primary.excerpt] },
          { id: "next", title: "下一步", points: [recommendation] },
          { id: "method", title: "学习方式", points: ["先讲清概念，再放进机器人场景", "完成一次判断，并说明选择依据"] },
          { id: "check", title: "完成标准", points: ["能解释作用、条件与失效边界", "能把知识迁移到一个新场景"] },
        ],
      },
    };
  }
  return {
    answer: "我把讲解拆成了四个部分。先看全图，再点着每个分支理解，会比读一大段文字更清楚。",
    followUpQuestion: followUpFor(context),
    sources,
    grounded: true,
    mindMap: learningMap(context, question, sources),
  };
}

export function welcomeForContext(context: StudyContext): string {
  if (context.kind === "project") {
    return `嗨，我是小响 🤖 我已经切换到你的项目“${context.moduleTitle}”。我会围绕已生成的项目目标、结构和风险回答，不会假装记得已经删除的原文件。你可以问我“这个项目最大的取舍是什么”或让我换一个场景考你。`;
  }
  return `嗨，我是小响 🤖 你的具身智能学习伙伴。我们现在一起看“${context.domainTitle} → ${context.moduleTitle}”。你可以直接问我任何具体问题——比如“这个方案什么时候会失效”“两个传感器怎么选”——我会先回答问题，再带你拆解。也可以让我考考你。`;
}
