import { describe, expect, it } from "vitest";
import { userSafeError, withTimeout } from "./async-guard";

describe("async guard", () => {
  it("normalizes WeChat callback errors", () => {
    expect(userSafeError({ errMsg: "uploadFile:fail network error" }, "失败")).toBe("fail network error");
    expect(userSafeError(new Error("明确错误"), "失败")).toBe("明确错误");
  });

  it("rejects operations that exceed their budget", async () => {
    await expect(withTimeout(new Promise<never>(() => undefined), 5, "操作超时")).rejects.toThrow("操作超时");
  });
});
