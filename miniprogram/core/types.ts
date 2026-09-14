export const CONTENT_VERSION = "sensor-path-2026.08.03";
export const RULE_VERSION = "mastery-rule-1.0.0";

export type ProgressRoute = "lesson" | "feynman" | "case";
export type DomainState = "ready" | "learning" | "mastered" | "locked";

export interface LearningModule {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly knowledgeTerms: readonly string[];
  readonly lessonAvailable: boolean;
}

export interface CompetencyGroup {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly domainIds: readonly string[];
  readonly accent: string;
}

export interface CompetencyDomain {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly valueQuestion: string;
  readonly learningOutcome: string;
  readonly estimatedMinutes: number;
  readonly prerequisite: string;
  readonly modules: readonly LearningModule[];
  readonly available: boolean;
  readonly accent: string;
}

export interface LessonBlock {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly body: string;
  readonly points?: readonly string[];
  readonly knowledgeTerms: readonly string[];
}

export interface ChoiceOption {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
}

export interface EvidenceDimension {
  readonly id: "concept" | "causality" | "boundary" | "misconception" | "transfer";
  readonly label: string;
  readonly passed: boolean;
  readonly evidence: string;
}

export interface EvaluationResult {
  readonly passedDimensionCount: number;
  readonly dimensions: readonly EvidenceDimension[];
  readonly criticalMisconceptions: readonly string[];
  readonly gaps: readonly string[];
  readonly summary: string;
}

export interface LearningProgress {
  readonly schemaVersion: 1;
  readonly contentVersion: string;
  readonly ruleVersion: string;
  readonly lessonCompleted: boolean;
  readonly challengePassed: boolean;
  readonly feynmanMastered: boolean;
  readonly sensorUnlocked: boolean;
  readonly caseCompleted: boolean;
  readonly attempts: number;
  readonly lastRoute: ProgressRoute;
  readonly evidence: readonly string[];
  readonly updatedAt: string;
}

export interface MasteryDecision {
  readonly unlocked: boolean;
  readonly reasons: readonly string[];
}
