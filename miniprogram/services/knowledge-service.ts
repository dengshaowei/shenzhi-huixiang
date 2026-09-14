import { CLOUD_FUNCTIONS } from "../config/cloud";
import { parseKnowledgePackPage } from "../core/cloud-contracts";
import {
  getKnowledgeRepository,
  hydrateKnowledgeRepository,
  isKnowledgeHydrated,
} from "../knowledge/knowledge-repository";
import { withTimeout } from "./async-guard";

const STORAGE_KEY = "shenzhi-knowledge-pack-v1";

function hydrateFromStorage(): boolean {
  try {
    const cached: unknown = wx.getStorageSync(STORAGE_KEY);
    if (!cached) return false;
    return hydrateKnowledgeRepository(cached);
  } catch {
    return false;
  }
}

function persistPayload(pages: readonly { readonly manifest: unknown; readonly chunks: readonly unknown[] }[]): void {
  try {
    const [first] = pages;
    wx.setStorageSync(STORAGE_KEY, {
      manifest: first?.manifest,
      chunks: pages.reduce<readonly unknown[]>((all, page) => [...all, ...page.chunks], []),
    });
  } catch {
    // 存储超限或失败时静默跳过：下次启动仍会尝试云端拉取。
  }
}

async function hydrateFromCloud(): Promise<boolean> {
  const firstPage = parseKnowledgePackPage(
    (await withTimeout(
      wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.knowledgePack, data: { page: 0 } }),
      12_000,
      "知识库连接超时",
    )).result,
  );
  const pages = [firstPage];
  for (let page = 1; page < firstPage.pageCount; page += 1) {
    pages.push(
      parseKnowledgePackPage(
        (await withTimeout(
          wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.knowledgePack, data: { page } }),
          12_000,
          "知识库连接超时",
        )).result,
      ),
    );
  }
  const payload = {
    manifest: firstPage.manifest,
    chunks: pages.reduce<readonly unknown[]>((all, page) => [...all, ...page.chunks], []),
  };
  if (!hydrateKnowledgeRepository(payload)) return false;
  persistPayload(pages);
  return true;
}

let pending: Promise<boolean> | null = null;

/**
 * 确保完整知识库就绪。顺序：内存 → 本地缓存 → 云端私有接口。
 * 任何一步失败都保留离线摘要，返回是否已获得完整知识库。
 */
export function ensureKnowledgeReady(): Promise<boolean> {
  if (isKnowledgeHydrated()) return Promise.resolve(true);
  if (pending) return pending;
  const task: Promise<boolean> = (async () => {
    if (hydrateFromStorage()) return true;
    try {
      return await hydrateFromCloud();
    } catch {
      return false;
    }
  })();
  pending = task.then(
    (ready) => {
      pending = null;
      return ready;
    },
    () => {
      pending = null;
      return false;
    },
  );
  return pending;
}

export function knowledgeModeLabel(): string {
  return isKnowledgeHydrated() ? "完整知识库已连接" : "离线知识摘要";
}

export function currentKnowledgeNotice(): string {
  return getKnowledgeRepository().manifest.notice;
}
