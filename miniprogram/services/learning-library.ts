import { anonymizeProjectText } from "../core/project-learning";
import { PRIVATE_PROJECT_TITLE } from "../core/project-import";

export type LearningItemKind = "domain" | "module" | "lesson" | "project";

export interface LearningLibraryItem {
  readonly id: string;
  readonly kind: LearningItemKind;
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
  readonly domainId: string;
  readonly moduleId: string;
  readonly knowledgeTerms: readonly string[];
  readonly updatedAt: string;
}

export interface LearningLibrary {
  readonly schemaVersion: 1;
  readonly recent: readonly LearningLibraryItem[];
  readonly favorites: readonly LearningLibraryItem[];
}

const STORAGE_KEY = "shenzhi-huixiang:learning-library:v1";
const MAX_RECENT = 12;
const MAX_FAVORITES = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseItem(value: unknown): LearningLibraryItem | null {
  if (!isRecord(value) || !Array.isArray(value.knowledgeTerms)) return null;
  const { id, kind, title, subtitle, route, domainId, moduleId, knowledgeTerms, updatedAt } = value;
  if (
    typeof id !== "string"
    || !["domain", "module", "lesson", "project"].includes(String(kind))
    || typeof title !== "string"
    || typeof subtitle !== "string"
    || typeof route !== "string"
    || typeof domainId !== "string"
    || typeof moduleId !== "string"
    || !knowledgeTerms.every((term) => typeof term === "string")
    || typeof updatedAt !== "string"
  ) return null;
  const parsedKind = kind as LearningItemKind;
  if (parsedKind !== "project") return { id, kind: parsedKind, title, subtitle, route, domainId, moduleId, knowledgeTerms, updatedAt };
  const shortTitle = title.replace(/(?:项目|系统|平台|应用)$/u, "").trim();
  const privateNames = [title, ...(shortTitle.length >= 3 ? [shortTitle] : [])];
  return {
    id,
    kind: parsedKind,
    title: PRIVATE_PROJECT_TITLE,
    subtitle,
    route,
    domainId,
    moduleId,
    knowledgeTerms: knowledgeTerms.map((term) => anonymizeProjectText(term, privateNames)),
    updatedAt,
  };
}

export function createEmptyLearningLibrary(): LearningLibrary {
  return { schemaVersion: 1, recent: [], favorites: [] };
}

export function parseLearningLibrary(value: unknown): LearningLibrary {
  if (!isRecord(value)) return createEmptyLearningLibrary();
  const recent = Array.isArray(value.recent) ? value.recent.map(parseItem).filter((item): item is LearningLibraryItem => item !== null) : [];
  const favorites = Array.isArray(value.favorites) ? value.favorites.map(parseItem).filter((item): item is LearningLibraryItem => item !== null) : [];
  return { schemaVersion: 1, recent: recent.slice(0, MAX_RECENT), favorites: favorites.slice(0, MAX_FAVORITES) };
}

export function addRecent(library: LearningLibrary, item: LearningLibraryItem): LearningLibrary {
  return { ...library, recent: [item, ...library.recent.filter((entry) => entry.id !== item.id)].slice(0, MAX_RECENT) };
}

export function toggleFavoriteItem(library: LearningLibrary, item: LearningLibraryItem): LearningLibrary {
  const exists = library.favorites.some((entry) => entry.id === item.id);
  return {
    ...library,
    favorites: exists
      ? library.favorites.filter((entry) => entry.id !== item.id)
      : [item, ...library.favorites].slice(0, MAX_FAVORITES),
  };
}

export const learningLibraryRepository = {
  load(): LearningLibrary {
    return parseLearningLibrary(wx.getStorageSync(STORAGE_KEY));
  },

  save(library: LearningLibrary): void {
    wx.setStorageSync(STORAGE_KEY, library);
  },

  record(item: Omit<LearningLibraryItem, "updatedAt">): LearningLibrary {
    const next = addRecent(this.load(), { ...item, updatedAt: new Date().toISOString() });
    this.save(next);
    return next;
  },

  toggleFavorite(item: Omit<LearningLibraryItem, "updatedAt">): LearningLibrary {
    const next = toggleFavoriteItem(this.load(), { ...item, updatedAt: new Date().toISOString() });
    this.save(next);
    return next;
  },
};
