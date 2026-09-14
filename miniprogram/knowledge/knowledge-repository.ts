import { FALLBACK_KNOWLEDGE_PACK } from "./fallback-knowledge";

export interface KnowledgeManifest {
  readonly name: string;
  readonly version: string;
  readonly sourceType: string;
  readonly documentCount: number;
  readonly chunkCount: number;
  readonly generatedOn: string;
  readonly notice: string;
}

export interface KnowledgeChunk {
  readonly id: string;
  readonly documentId: string;
  readonly title: string;
  readonly sourceFile: string;
  readonly sourceType: string;
  readonly order: number;
  readonly tags: readonly string[];
  readonly text: string;
}

export interface KnowledgeHit {
  readonly id: string;
  readonly title: string;
  readonly sourceFile: string;
  readonly tags: readonly string[];
  readonly excerpt: string;
  readonly score: number;
}

export interface KnowledgeSearch {
  readonly terms: readonly string[];
  readonly requiredTags?: readonly string[];
  readonly preferredTitles?: readonly string[];
  readonly limit?: number;
}

interface KnowledgePayload {
  readonly manifest: KnowledgeManifest;
  readonly chunks: readonly KnowledgeChunk[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseManifest(value: unknown): KnowledgeManifest | null {
  if (!isRecord(value)) return null;
  const { name, version, sourceType, documentCount, chunkCount, generatedOn, notice } = value;
  if (
    typeof name !== "string" ||
    typeof version !== "string" ||
    typeof sourceType !== "string" ||
    typeof documentCount !== "number" ||
    typeof chunkCount !== "number" ||
    typeof generatedOn !== "string" ||
    typeof notice !== "string"
  ) {
    return null;
  }
  return { name, version, sourceType, documentCount, chunkCount, generatedOn, notice };
}

function parseChunk(value: unknown): KnowledgeChunk | null {
  if (!isRecord(value)) return null;
  const { id, documentId, title, sourceFile, sourceType, order, tags, text } = value;
  if (
    typeof id !== "string" ||
    typeof documentId !== "string" ||
    typeof title !== "string" ||
    typeof sourceFile !== "string" ||
    typeof sourceType !== "string" ||
    typeof order !== "number" ||
    !isStringArray(tags) ||
    typeof text !== "string"
  ) {
    return null;
  }
  return { id, documentId, title, sourceFile, sourceType, order, tags, text };
}

export function parseKnowledgePayload(value: unknown): KnowledgePayload {
  if (!isRecord(value) || !Array.isArray(value.chunks)) {
    throw new Error("本地知识库索引格式无效");
  }
  const manifest = parseManifest(value.manifest);
  const chunks = value.chunks.map(parseChunk).filter((chunk): chunk is KnowledgeChunk => chunk !== null);
  if (!manifest || chunks.length === 0) {
    throw new Error("本地知识库索引缺少有效内容");
  }
  return { manifest, chunks };
}

function createExcerpt(text: string, terms: readonly string[]): string {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 12)
    .filter((line) => !/^(机器人产品内参|由飞书|目录|提示|〔图片〕|〔同步内容块〕)/.test(line));
  const clauses = lines
    .reduce<string[]>((items, line) => [...items, ...line.split(/[。；！？]/)], [])
    .reduce<string[]>((items, clause) => clause.length > 90 ? [...items, ...clause.split(/[，,]/)] : [...items, clause], [])
    .map((clause) => clause.trim())
    .filter((clause) => clause.length >= 12);
  const lowerTerms = terms.map((term) => term.toLocaleLowerCase());
  const matched = clauses.filter((clause) => lowerTerms.some((term) => clause.toLocaleLowerCase().includes(term)));
  const selected = (matched.length > 0 ? matched : clauses).slice(0, 2);
  return selected.map((clause) => `${clause}。`).join("");
}

export interface KnowledgeRepository {
  readonly manifest: KnowledgeManifest;
  search(search: KnowledgeSearch): readonly KnowledgeHit[];
}

export function createKnowledgeRepository(payloadValue: unknown): KnowledgeRepository {
  const payload = parseKnowledgePayload(payloadValue);

  return {
    manifest: payload.manifest,

    search(search: KnowledgeSearch): readonly KnowledgeHit[] {
      const terms = search.terms.map((term) => term.trim()).filter(Boolean);
      const requiredTags = search.requiredTags ?? [];
      const preferredTitles = search.preferredTitles ?? [];
      const limit = Math.max(1, Math.min(search.limit ?? 6, 12));

      return payload.chunks
        .map((chunk) => {
          if (requiredTags.length > 0 && !requiredTags.some((tag) => chunk.tags.includes(tag))) {
            return null;
          }
          const lowerTitle = chunk.title.toLocaleLowerCase();
          const lowerText = chunk.text.toLocaleLowerCase();
          let score = 0;
          for (const term of terms) {
            const lowerTerm = term.toLocaleLowerCase();
            if (lowerTitle.includes(lowerTerm)) score += 9;
            if (chunk.tags.some((tag) => tag.toLocaleLowerCase() === lowerTerm)) score += 7;
            if (lowerText.includes(lowerTerm)) score += 2;
          }
          if (preferredTitles.includes(chunk.title)) score += 8;
          if (score === 0) return null;
          return {
            id: chunk.id,
            title: chunk.title,
            sourceFile: chunk.sourceFile,
            tags: chunk.tags,
            excerpt: createExcerpt(chunk.text, terms),
            score,
          } satisfies KnowledgeHit;
        })
        .filter((hit): hit is KnowledgeHit => hit !== null)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, limit);
    },
  };
}

let activeRepository: KnowledgeRepository = createKnowledgeRepository(FALLBACK_KNOWLEDGE_PACK);
let hydrated = false;

/** 当前可用的知识库：云端完整知识库就绪前为离线摘要。 */
export function getKnowledgeRepository(): KnowledgeRepository {
  return activeRepository;
}

/** 用云端下发的完整知识库替换离线摘要。返回是否切换成功。 */
export function hydrateKnowledgeRepository(payloadValue: unknown): boolean {
  try {
    activeRepository = createKnowledgeRepository(payloadValue);
    hydrated = true;
    return true;
  } catch {
    return false;
  }
}

export function isKnowledgeHydrated(): boolean {
  return hydrated;
}

/** 测试专用：重置为离线摘要。 */
export function resetKnowledgeRepositoryForTest(): void {
  activeRepository = createKnowledgeRepository(FALLBACK_KNOWLEDGE_PACK);
  hydrated = false;
}
