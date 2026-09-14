import { describe, expect, it } from "vitest";
import { addRecent, createEmptyLearningLibrary, parseLearningLibrary, toggleFavoriteItem, type LearningLibraryItem } from "./learning-library";

const item: LearningLibraryItem = {
  id: "module:sensors/lidar",
  kind: "module",
  title: "激光雷达与测距",
  subtitle: "感知与传感器",
  route: "/pages/domain/index?id=sensors",
  domainId: "sensors",
  moduleId: "lidar",
  knowledgeTerms: ["激光雷达"],
  updatedAt: "2026-08-04T00:00:00.000Z",
};

describe("learning library", () => {
  it("keeps recent learning newest-first without duplicates", () => {
    const once = addRecent(createEmptyLearningLibrary(), item);
    const twice = addRecent(once, { ...item, updatedAt: "2026-08-04T01:00:00.000Z" });
    expect(twice.recent).toHaveLength(1);
    expect(twice.recent[0]?.updatedAt).toContain("01:00");
  });

  it("toggles favorites", () => {
    const added = toggleFavoriteItem(createEmptyLearningLibrary(), item);
    expect(added.favorites).toHaveLength(1);
    expect(toggleFavoriteItem(added, item).favorites).toHaveLength(0);
  });

  it("sanitizes malformed storage", () => {
    expect(parseLearningLibrary({ recent: [{ id: 1 }], favorites: "bad" })).toEqual(createEmptyLearningLibrary());
  });

  it("migrates old project records without exposing their real name", () => {
    const library = parseLearningLibrary({
      recent: [{ ...item, id: "project:1", kind: "project", title: "海星搬运项目", subtitle: "我的项目学习", knowledgeTerms: ["理解海星搬运的安全风险"] }],
      favorites: [],
    });
    expect(library.recent[0]?.title).toBe("个人项目");
    expect(library.recent[0]?.knowledgeTerms[0]).toBe("理解个人项目的安全风险");
  });
});
