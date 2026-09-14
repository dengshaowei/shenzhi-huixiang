export type AgentMessageRole = "agent" | "user";

export interface KnowledgeEntry {
  readonly id: string;
  readonly title: string;
  readonly tags: readonly string[];
  readonly summary: string;
}

export interface MindMapBranch {
  readonly id: string;
  readonly title: string;
  readonly points: readonly string[];
}

export interface AgentReply {
  readonly answer: string;
  readonly followUp: string;
  readonly grounded: boolean;
  readonly sources: readonly KnowledgeEntry[];
  readonly branches: readonly MindMapBranch[];
  readonly suggestions: readonly string[];
}

export interface AgentMessage {
  readonly id: string;
  readonly role: AgentMessageRole;
  readonly text: string;
  readonly reply?: AgentReply;
}

export type EvidenceId = "concept" | "causality" | "boundary" | "misconception" | "transfer";

export interface EvidenceDimension {
  readonly id: EvidenceId;
  readonly label: string;
  readonly passed: boolean;
  readonly evidence: string;
}

export interface MasteryResult {
  readonly unlocked: boolean;
  readonly passedCount: number;
  readonly dimensions: readonly EvidenceDimension[];
  readonly reasons: readonly string[];
}

