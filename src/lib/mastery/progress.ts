import type { CompetencyNodeData, MasteryStatus } from "@/content/competency-map";

export type CompetencyProgress = Record<string, MasteryStatus>;

export function summarizeProgress(nodes: Array<{ data: CompetencyNodeData }>) {
  const mastered = nodes.filter((node) => node.data.status === "mastered").length;
  const learning = nodes.filter((node) => node.data.status === "learning").length;
  const total = nodes.length;

  return {
    mastered,
    learning,
    total,
    percentage: total === 0 ? 0 : Math.round((mastered / total) * 100),
  };
}

