import { describe, expect, it } from "vitest";
import { calculateProgressPercent, createDefaultProgress, getNextRoute, parseProgress } from "./progress";

describe("mini-program progress", () => {
  it("starts at the lesson with no earned progress", () => {
    const progress = createDefaultProgress("2026-08-03T00:00:00.000Z");

    expect(calculateProgressPercent(progress)).toBe(0);
    expect(getNextRoute(progress)).toBe("lesson");
  });

  it("sanitizes unknown local-storage data", () => {
    const progress = parseProgress({
      schemaVersion: 1,
      lessonCompleted: true,
      challengePassed: "yes",
      attempts: -4,
      lastRoute: "unknown",
      evidence: ["有效证据", 123],
    });

    expect(progress.lessonCompleted).toBe(true);
    expect(progress.challengePassed).toBe(false);
    expect(progress.attempts).toBe(0);
    expect(progress.lastRoute).toBe("lesson");
    expect(progress.evidence).toEqual(["有效证据"]);
  });

  it("moves to the case only after the sensor node unlocks", () => {
    const progress = {
      ...createDefaultProgress(),
      lessonCompleted: true,
      challengePassed: true,
      feynmanMastered: true,
      sensorUnlocked: true,
    };

    expect(calculateProgressPercent(progress)).toBe(75);
    expect(getNextRoute(progress)).toBe("case");
  });
});
