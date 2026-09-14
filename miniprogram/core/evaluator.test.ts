import { describe, expect, it } from "vitest";
import { evaluateFeynmanAnswer } from "./evaluator";
import { decideSensorMastery } from "./mastery";

describe("evaluateFeynmanAnswer", () => {
  it("extracts enough evidence from a complete sensor trade-off explanation", () => {
    const answer =
      "仓库通道窄、货架遮挡且光照会变化，因为激光雷达能提供稳定测距，而相机更适合识别工作人员，所以两者互补，并保留近距防撞作为安全冗余。这样会增加成本和算力，但能降低人员混行时的避障风险。";

    const evaluation = evaluateFeynmanAnswer(answer);
    const decision = decideSensorMastery(true, evaluation);

    expect(evaluation.passedDimensionCount).toBe(5);
    expect(evaluation.criticalMisconceptions).toEqual([]);
    expect(decision.unlocked).toBe(true);
  });

  it("blocks a fluent answer containing a critical misconception", () => {
    const answer =
      "仓库有光照和遮挡，因为相机成本低，所以一个相机可以覆盖所有场景，也可以负责工作人员识别和机器人避障，参数越高越好，不需要考虑其他冗余。";

    const evaluation = evaluateFeynmanAnswer(answer);
    const decision = decideSensorMastery(true, evaluation);

    expect(evaluation.criticalMisconceptions.length).toBeGreaterThan(0);
    expect(decision.unlocked).toBe(false);
  });

  it("keeps the node locked when the fixed-choice challenge is wrong", () => {
    const answer =
      "仓库光照和货架遮挡会影响视觉，因为激光雷达与相机能力互补，所以机器人避障需要考虑安全冗余，同时接受一定成本和算力增加。";
    const evaluation = evaluateFeynmanAnswer(answer);

    expect(decideSensorMastery(false, evaluation).unlocked).toBe(false);
  });
});
