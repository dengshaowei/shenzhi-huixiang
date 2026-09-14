import { CONTENT_VERSION, RULE_VERSION, type LearningProgress, type ProgressRoute } from "./types";

export function createDefaultProgress(now = new Date().toISOString()): LearningProgress {
  return {
    schemaVersion: 1,
    contentVersion: CONTENT_VERSION,
    ruleVersion: RULE_VERSION,
    lessonCompleted: false,
    challengePassed: false,
    feynmanMastered: false,
    sensorUnlocked: false,
    caseCompleted: false,
    attempts: 0,
    lastRoute: "lesson",
    evidence: [],
    updatedAt: now,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRoute(value: unknown): value is ProgressRoute {
  return value === "lesson" || value === "feynman" || value === "case";
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function parseProgress(value: unknown, now = new Date().toISOString()): LearningProgress {
  const fallback = createDefaultProgress(now);
  if (!isRecord(value) || value.schemaVersion !== 1) {
    return fallback;
  }

  return {
    schemaVersion: 1,
    contentVersion: typeof value.contentVersion === "string" ? value.contentVersion : fallback.contentVersion,
    ruleVersion: typeof value.ruleVersion === "string" ? value.ruleVersion : fallback.ruleVersion,
    lessonCompleted: value.lessonCompleted === true,
    challengePassed: value.challengePassed === true,
    feynmanMastered: value.feynmanMastered === true,
    sensorUnlocked: value.sensorUnlocked === true,
    caseCompleted: value.caseCompleted === true,
    attempts: typeof value.attempts === "number" && Number.isInteger(value.attempts) && value.attempts >= 0 ? value.attempts : 0,
    lastRoute: isRoute(value.lastRoute) ? value.lastRoute : fallback.lastRoute,
    evidence: stringArray(value.evidence),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

export function calculateProgressPercent(progress: LearningProgress): number {
  const steps = [progress.lessonCompleted, progress.challengePassed, progress.sensorUnlocked, progress.caseCompleted];
  return steps.filter(Boolean).length * 25;
}

export function getNextRoute(progress: LearningProgress): ProgressRoute {
  if (!progress.lessonCompleted) return "lesson";
  if (!progress.sensorUnlocked) return "feynman";
  return "case";
}
