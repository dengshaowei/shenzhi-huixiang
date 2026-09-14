import { describe, expect, it } from "vitest";
import { anonymousProjectFileName, MAX_PROJECT_FILE_SIZE, PROJECT_IMPORT_CONFIRM_TEXT, validateProjectFile } from "./project-import";

describe("project import validation", () => {
  it("accepts supported files case-insensitively", () => {
    expect(validateProjectFile({ name: "机器人.PDF", path: "/tmp/demo", size: 1024 }).extension).toBe("pdf");
  });

  it("keeps the WeChat modal confirmation label within four characters", () => {
    expect([...PROJECT_IMPORT_CONFIRM_TEXT]).toHaveLength(4);
  });

  it("never sends the original project name to the analysis function", () => {
    expect(anonymousProjectFileName("pdf")).toBe("个人项目.pdf");
  });

  it("rejects unsupported, empty and oversized files", () => {
    expect(() => validateProjectFile({ name: "demo.pages", path: "/tmp/demo", size: 1024 })).toThrow("仅支持");
    expect(() => validateProjectFile({ name: "demo.txt", path: "/tmp/demo", size: 0 })).toThrow("大于 0");
    expect(() => validateProjectFile({ name: "demo.docx", path: "/tmp/demo", size: MAX_PROJECT_FILE_SIZE + 1 })).toThrow("小于 10 MB");
  });
});
