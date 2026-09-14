import { PRIVATE_PROJECT_FILE_LABEL, PRIVATE_PROJECT_TITLE } from "./project-import";

export type ProjectAgentMode = "deepseek" | "fallback";

export interface ProjectMindMapBranch {
  readonly id: string;
  readonly title: string;
  readonly points: readonly string[];
}

export type ProjectMapGroupKind = "purpose" | "experience" | "solution" | "validation";
export type ProjectInsightKind = "decision" | "risk" | "gap" | "metric";

export interface ProjectMapNode {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly evidence: readonly string[];
}

export interface ProjectMapGroup {
  readonly id: string;
  readonly kind: ProjectMapGroupKind;
  readonly title: string;
  readonly summary: string;
  readonly relation: string;
  readonly children: readonly ProjectMapNode[];
}

export interface ProjectInsight {
  readonly id: string;
  readonly kind: ProjectInsightKind;
  readonly title: string;
  readonly detail: string;
  readonly evidence: readonly string[];
}

export interface ProjectDocumentCoverage {
  readonly characterCount: number;
  readonly paragraphCount: number;
  readonly chunkCount: number;
  readonly representedChunkCount: number;
  readonly traversalPercent: number;
}

export interface ProjectQuestion {
  readonly id: string;
  readonly skill: string;
  readonly prompt: string;
  readonly referencePoints: readonly string[];
}

export interface ProjectLearningPlan {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly fileName: string;
  readonly title: string;
  readonly summary: string;
  readonly goals: readonly string[];
  readonly branches: readonly ProjectMindMapBranch[];
  readonly mapGroups: readonly ProjectMapGroup[];
  readonly insights: readonly ProjectInsight[];
  readonly documentCoverage: ProjectDocumentCoverage;
  readonly questions: readonly ProjectQuestion[];
  readonly mode: ProjectAgentMode;
  readonly notice: string;
  readonly createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringList(value: unknown, min = 1, max = 12): readonly string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, max);
  return items.length >= min ? items : null;
}

function parseBranch(value: unknown, index: number): ProjectMindMapBranch | null {
  if (!isRecord(value) || typeof value.title !== "string") return null;
  const points = stringList(value.points, 1, 6);
  if (!points) return null;
  return { id: typeof value.id === "string" ? value.id : `branch-${index + 1}`, title: value.title, points };
}

function parseQuestion(value: unknown, index: number): ProjectQuestion | null {
  if (!isRecord(value) || typeof value.prompt !== "string") return null;
  const referencePoints = stringList(value.referencePoints, 1, 5);
  if (!referencePoints) return null;
  return {
    id: typeof value.id === "string" ? value.id : `question-${index + 1}`,
    skill: typeof value.skill === "string" ? value.skill : "项目理解",
    prompt: value.prompt,
    referencePoints,
  };
}

function parseMapNode(value: unknown, groupIndex: number, nodeIndex: number): ProjectMapNode | null {
  if (!isRecord(value) || typeof value.title !== "string" || typeof value.detail !== "string") return null;
  const evidence = stringList(value.evidence, 1, 5);
  if (!evidence) return null;
  return {
    id: typeof value.id === "string" ? value.id : `group-${groupIndex + 1}-node-${nodeIndex + 1}`,
    title: value.title,
    detail: value.detail,
    evidence,
  };
}

function parseMapGroup(value: unknown, index: number): ProjectMapGroup | null {
  if (!isRecord(value) || typeof value.title !== "string" || typeof value.summary !== "string") return null;
  const children = Array.isArray(value.children)
    ? value.children.map((item, nodeIndex) => parseMapNode(item, index, nodeIndex)).filter((item): item is ProjectMapNode => item !== null).slice(0, 5)
    : [];
  if (children.length === 0) return null;
  const kind: ProjectMapGroupKind = value.kind === "purpose" || value.kind === "experience" || value.kind === "validation" ? value.kind : "solution";
  return {
    id: typeof value.id === "string" ? value.id : `group-${index + 1}`,
    kind,
    title: value.title,
    summary: value.summary,
    relation: typeof value.relation === "string" ? value.relation : "项目要素之间相互影响",
    children,
  };
}

function parseInsight(value: unknown, index: number): ProjectInsight | null {
  if (!isRecord(value) || typeof value.title !== "string" || typeof value.detail !== "string") return null;
  const evidence = stringList(value.evidence, 1, 5);
  if (!evidence) return null;
  const kind: ProjectInsightKind = value.kind === "risk" || value.kind === "gap" || value.kind === "metric" ? value.kind : "decision";
  return { id: typeof value.id === "string" ? value.id : `insight-${index + 1}`, kind, title: value.title, detail: value.detail, evidence };
}

function legacyMapGroups(branches: readonly ProjectMindMapBranch[]): readonly ProjectMapGroup[] {
  const kinds: readonly ProjectMapGroupKind[] = ["purpose", "experience", "solution", "validation"];
  return branches.map((branch, index) => ({
    id: branch.id,
    kind: kinds[index % kinds.length] ?? "solution",
    title: branch.title,
    summary: branch.points[0] ?? "项目结构",
    relation: index === 0 ? "项目起点" : "承接上一层项目判断",
    children: branch.points.map((point, nodeIndex) => ({ id: `${branch.id}-node-${nodeIndex + 1}`, title: `要点 ${nodeIndex + 1}`, detail: point, evidence: [point] })),
  }));
}

function parseCoverage(value: unknown): ProjectDocumentCoverage {
  if (!isRecord(value)) return { characterCount: 0, paragraphCount: 0, chunkCount: 0, representedChunkCount: 0, traversalPercent: 0 };
  const number = (item: unknown): number => typeof item === "number" && Number.isFinite(item) ? Math.max(0, Math.floor(item)) : 0;
  return {
    characterCount: number(value.characterCount),
    paragraphCount: number(value.paragraphCount),
    chunkCount: number(value.chunkCount),
    representedChunkCount: number(value.representedChunkCount),
    traversalPercent: Math.min(100, number(value.traversalPercent)),
  };
}

function projectIdentityTokens(title: string, fileName: string): readonly string[] {
  const fileBase = fileName.replace(/\.[^.]+$/, "").trim();
  const names = [title.trim(), fileBase].reduce<string[]>((items, item) => {
    const shortName = item.replace(/(?:项目|系统|平台|应用)$/u, "").trim();
    return [...items, item, ...(shortName.length >= 3 ? [shortName] : [])];
  }, []);
  return [...new Set(names)].filter((item) => item.length >= 3 && item !== PRIVATE_PROJECT_TITLE && item !== PRIVATE_PROJECT_FILE_LABEL);
}

export function anonymizeProjectText(text: string, privateNames: readonly string[]): string {
  return privateNames.reduce((masked, name) => masked.split(name).join(PRIVATE_PROJECT_TITLE), text);
}

export function parseProjectLearningPlan(value: unknown): ProjectLearningPlan {
  if (!isRecord(value)) throw new Error("项目分析结果格式无效");
  const goals = stringList(value.goals, 2, 8);
  const branches = Array.isArray(value.branches)
    ? value.branches.map(parseBranch).filter((item): item is ProjectMindMapBranch => item !== null).slice(0, 8)
    : [];
  const questions = Array.isArray(value.questions)
    ? value.questions.map(parseQuestion).filter((item): item is ProjectQuestion => item !== null).slice(0, 8)
    : [];
  const parsedMapGroups = Array.isArray(value.mapGroups)
    ? value.mapGroups.map(parseMapGroup).filter((item): item is ProjectMapGroup => item !== null).slice(0, 6)
    : [];
  const mapGroups = parsedMapGroups.length >= 2 ? parsedMapGroups : legacyMapGroups(branches);
  const insights = Array.isArray(value.insights)
    ? value.insights.map(parseInsight).filter((item): item is ProjectInsight => item !== null).slice(0, 8)
    : [];
  if (
    value.schemaVersion !== 1
    || typeof value.id !== "string"
    || typeof value.fileName !== "string"
    || typeof value.title !== "string"
    || typeof value.summary !== "string"
    || !goals
    || branches.length < 2
    || questions.length < 3
    || (value.mode !== "deepseek" && value.mode !== "fallback")
    || typeof value.notice !== "string"
    || typeof value.createdAt !== "string"
  ) throw new Error("项目分析结果缺少必要内容");
  const privateNames = projectIdentityTokens(value.title, value.fileName);
  const mask = (text: string): string => anonymizeProjectText(text, privateNames);
  return {
    schemaVersion: 1,
    id: value.id,
    fileName: PRIVATE_PROJECT_FILE_LABEL,
    title: PRIVATE_PROJECT_TITLE,
    summary: mask(value.summary),
    goals: goals.map(mask),
    branches: branches.map((branch) => ({ ...branch, title: mask(branch.title), points: branch.points.map(mask) })),
    mapGroups: mapGroups.map((group) => ({
      ...group,
      title: mask(group.title),
      summary: mask(group.summary),
      relation: mask(group.relation),
      children: group.children.map((node) => ({ ...node, title: mask(node.title), detail: mask(node.detail), evidence: node.evidence.map(mask) })),
    })),
    insights: insights.map((insight) => ({ ...insight, title: mask(insight.title), detail: mask(insight.detail), evidence: insight.evidence.map(mask) })),
    documentCoverage: parseCoverage(value.documentCoverage),
    questions: questions.map((question) => ({ ...question, skill: mask(question.skill), prompt: mask(question.prompt), referencePoints: question.referencePoints.map(mask) })),
    mode: value.mode,
    notice: value.notice,
    createdAt: value.createdAt,
  };
}

export interface ProjectAnswerFeedback {
  readonly passed: boolean;
  readonly title: string;
  readonly body: string;
}

export interface ProjectAnswerRecord {
  readonly questionId: string;
  readonly answer: string;
  readonly passed: boolean;
  readonly evidence: readonly string[];
  readonly attempts: number;
  readonly updatedAt: string;
}

export interface ProjectLearningProgress {
  readonly schemaVersion: 1;
  readonly projectId: string;
  readonly answers: readonly ProjectAnswerRecord[];
  readonly passedQuestionIds: readonly string[];
  readonly completed: boolean;
  readonly totalAttempts: number;
  readonly updatedAt: string;
}

export function createProjectLearningProgress(projectId: string): ProjectLearningProgress {
  return {
    schemaVersion: 1,
    projectId,
    answers: [],
    passedQuestionIds: [],
    completed: false,
    totalAttempts: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

export function parseProjectLearningProgress(value: unknown, projectId: string): ProjectLearningProgress {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.projectId !== projectId) return createProjectLearningProgress(projectId);
  const answers = Array.isArray(value.answers)
    ? value.answers.reduce<ProjectAnswerRecord[]>((records, item: unknown) => {
      if (
        !isRecord(item)
        || typeof item.questionId !== "string"
        || typeof item.answer !== "string"
        || typeof item.passed !== "boolean"
        || typeof item.attempts !== "number"
        || typeof item.updatedAt !== "string"
      ) return records;
      const evidence = stringList(item.evidence, 0, 5) ?? [];
      return [...records, { questionId: item.questionId, answer: item.answer.slice(0, 800), passed: item.passed, evidence, attempts: Math.max(1, Math.floor(item.attempts)), updatedAt: item.updatedAt }];
    }, []).slice(0, 8)
    : [];
  const passedQuestionIds = Array.isArray(value.passedQuestionIds)
    ? [...new Set(value.passedQuestionIds.filter((item): item is string => typeof item === "string"))].slice(0, 8)
    : [];
  return {
    schemaVersion: 1,
    projectId,
    answers,
    passedQuestionIds,
    completed: value.completed === true,
    totalAttempts: typeof value.totalAttempts === "number" ? Math.max(0, Math.floor(value.totalAttempts)) : answers.reduce((total, item) => total + item.attempts, 0),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
  };
}

export function recordProjectAnswer(
  progress: ProjectLearningProgress,
  question: ProjectQuestion,
  answer: string,
  feedback: ProjectAnswerFeedback,
  totalQuestions: number,
  now = new Date().toISOString(),
): ProjectLearningProgress {
  const previous = progress.answers.find((item) => item.questionId === question.id);
  const passed = previous?.passed === true || feedback.passed;
  const record: ProjectAnswerRecord = {
    questionId: question.id,
    answer: answer.trim().slice(0, 800),
    passed,
    evidence: passed ? question.referencePoints.slice(0, 5) : [],
    attempts: (previous?.attempts ?? 0) + 1,
    updatedAt: now,
  };
  const answers = [...progress.answers.filter((item) => item.questionId !== question.id), record];
  const passedQuestionIds = [...new Set([...progress.passedQuestionIds, ...(passed ? [question.id] : [])])];
  return {
    schemaVersion: 1,
    projectId: progress.projectId,
    answers,
    passedQuestionIds,
    completed: totalQuestions > 0 && passedQuestionIds.length >= totalQuestions,
    totalAttempts: progress.totalAttempts + 1,
    updatedAt: now,
  };
}

export function projectNextAction(plan: ProjectLearningPlan, progress: ProjectLearningProgress): string {
  if (progress.completed) return "项目题目已全部通过。下一步让小响用新场景反问你，检查能否迁移应用。";
  const remaining = plan.questions.filter((question) => !progress.passedQuestionIds.includes(question.id));
  if (remaining.length === plan.questions.length) return "先完成第一道项目题，用项目原文中的目标、约束和证据回答。";
  return `继续完成 ${remaining.length} 道未通过题目；优先补充“${remaining[0]?.skill ?? "项目判断"}”的项目依据。`;
}

export function evaluateProjectAnswer(answer: string, question: ProjectQuestion): ProjectAnswerFeedback {
  const normalized = answer.trim();
  const keywords = question.referencePoints
    .reduce<string[]>((terms, point) => [...terms, ...point.split(/[\s，。；、：,.!！？]+/)], [])
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && term.length <= 12);
  const matched = keywords.filter((term) => normalized.includes(term));
  const passed = normalized.length >= 20 && matched.length >= 1;
  return passed
    ? { passed: true, title: "回答已覆盖关键依据", body: "你已经把项目内容和自己的判断连接起来。继续检查条件、取舍和失败后果，会让答案更完整。" }
    : { passed: false, title: "还需要更多项目依据", body: normalized.length < 20 ? "请再展开一些：说明项目目标、具体做法以及为什么这样判断。" : "回答有自己的判断，但和项目关键内容连接不足。请对照参考要点重新组织。" };
}
