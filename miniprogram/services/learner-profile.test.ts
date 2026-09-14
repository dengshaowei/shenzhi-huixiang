import { describe, expect, it } from "vitest";
import { parseLearnerLevel } from "./learner-profile";

describe("learner profile", () => {
  it("keeps valid learner levels", () => {
    expect(parseLearnerLevel("rookie")).toBe("rookie");
    expect(parseLearnerLevel("product")).toBe("product");
    expect(parseLearnerLevel("tech")).toBe("tech");
  });

  it("falls back to rookie for malformed storage values", () => {
    expect(parseLearnerLevel(undefined)).toBe("rookie");
    expect(parseLearnerLevel("")).toBe("rookie");
    expect(parseLearnerLevel("expert")).toBe("rookie");
    expect(parseLearnerLevel(42)).toBe("rookie");
    expect(parseLearnerLevel(null)).toBe("rookie");
  });
});
