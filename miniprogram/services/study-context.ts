import { anonymizeProjectText, type ProjectLearningPlan } from "../core/project-learning";
import { PRIVATE_PROJECT_TITLE } from "../core/project-import";

export interface ProjectStudyContext {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly goals: readonly string[];
  readonly branches: readonly { readonly title: string; readonly points: readonly string[] }[];
  readonly insights: readonly { readonly kind: string; readonly title: string; readonly detail: string }[];
  readonly documentCoverage: { readonly paragraphCount: number; readonly chunkCount: number; readonly traversalPercent: number };
}

export interface StudyContext {
  readonly kind: "curriculum" | "project";
  readonly domainId: string;
  readonly domainTitle: string;
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly knowledgeTerms: readonly string[];
  readonly project: ProjectStudyContext | null;
}

const DEFAULT_CONTEXT: StudyContext = {
  kind: "curriculum",
  domainId: "sensors",
  domainTitle: "感知与传感器",
  moduleId: "sensor-selection",
  moduleTitle: "产品选型与失效边界",
  knowledgeTerms: ["感知系统", "传感器", "产品选型", "安全"],
  project: null,
};

let activeContext: StudyContext = DEFAULT_CONTEXT;

export function setStudyContext(context: StudyContext): void {
  activeContext = {
    ...context,
    knowledgeTerms: [...context.knowledgeTerms],
    project: context.project
      ? { ...context.project, goals: [...context.project.goals], branches: context.project.branches.map((branch) => ({ ...branch, points: [...branch.points] })), insights: context.project.insights.map((insight) => ({ ...insight })), documentCoverage: { ...context.project.documentCoverage } }
      : null,
  };
}

export function createProjectStudyContext(plan: ProjectLearningPlan): StudyContext {
  const privateNames = [plan.title, plan.fileName.replace(/\.[^.]+$/, "")].reduce<string[]>((items, item) => {
    const shortName = item.replace(/(?:项目|系统|平台|应用)$/u, "").trim();
    return [...items, item, ...(shortName.length >= 3 ? [shortName] : [])];
  }, []).filter((item) => item.length >= 3 && item !== PRIVATE_PROJECT_TITLE);
  const mask = (text: string): string => anonymizeProjectText(text, privateNames);
  const project: ProjectStudyContext = {
    id: plan.id,
    title: PRIVATE_PROJECT_TITLE,
    summary: mask(plan.summary),
    goals: plan.goals.slice(0, 6).map(mask),
    branches: plan.branches.slice(0, 6).map((branch) => ({ title: mask(branch.title), points: branch.points.slice(0, 4).map(mask) })),
    insights: plan.insights.slice(0, 6).map((insight) => ({ kind: insight.kind, title: mask(insight.title), detail: mask(insight.detail) })),
    documentCoverage: {
      paragraphCount: plan.documentCoverage.paragraphCount,
      chunkCount: plan.documentCoverage.chunkCount,
      traversalPercent: plan.documentCoverage.traversalPercent,
    },
  };
  return {
    kind: "project",
    domainId: `project:${plan.id}`,
    domainTitle: "我的项目",
    moduleId: plan.id,
    moduleTitle: PRIVATE_PROJECT_TITLE,
    knowledgeTerms: [...new Set([...plan.goals.map(mask), ...plan.branches.map((branch) => mask(branch.title))])].slice(0, 10),
    project,
  };
}

export function studyContextKey(context: StudyContext): string {
  return `${context.kind}/${context.domainId}/${context.moduleId}`;
}

export function getStudyContext(): StudyContext {
  return activeContext;
}

export function resetStudyContext(): void {
  activeContext = DEFAULT_CONTEXT;
}
