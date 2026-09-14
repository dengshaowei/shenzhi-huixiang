import { describe, expect, it } from "vitest";
import { castRay, createWarehouseSim, rayVsCircle, rayVsRect, stepSim } from "./lidar-sim";

const config = { width: 690, height: 380, lidarOn: true, night: false, reflective: false };

describe("ray intersection math", () => {
  it("hits a rect straight ahead and reports distance", () => {
    expect(rayVsRect(0, 5, 1, 0, { x: 10, y: 0, w: 5, h: 10 }, 100)).toBe(10);
  });

  it("misses a rect that is above the ray", () => {
    expect(rayVsRect(0, 50, 1, 0, { x: 10, y: 0, w: 5, h: 10 }, 100)).toBeNull();
  });

  it("hits a circle and respects max range", () => {
    expect(rayVsCircle(0, 0, 1, 0, 20, 0, 5, 100)).toBe(15);
    expect(rayVsCircle(0, 0, 1, 0, 20, 0, 5, 10)).toBeNull();
  });

  it("castRay returns the nearest obstacle", () => {
    const sim = createWarehouseSim(config);
    const hit = castRay(0, sim.robot.y, 0, sim.obstacles, 1000);
    expect(hit).not.toBeNull();
    expect(hit?.obstacleId).toBe("box-1");
  });
});

describe("warehouse simulation", () => {
  it("stops before the box when lidar is on", () => {
    let state = createWarehouseSim(config);
    for (let i = 0; i < 400 && !state.finished; i += 1) state = stepSim(state);
    expect(state.collided).toBe(false);
    const sawStop = state.robot.stopped || state.finished || state.hits.length > 0;
    expect(sawStop).toBe(true);
  });

  it("collides when lidar is off", () => {
    let state = createWarehouseSim({ ...config, lidarOn: false });
    for (let i = 0; i < 600 && !state.collided; i += 1) state = stepSim(state);
    expect(state.collided).toBe(true);
    expect(state.collidedWith).not.toBeNull();
    expect(state.hits).toHaveLength(0);
  });

  it("keeps the walking person inside their patrol range", () => {
    let state = createWarehouseSim(config);
    for (let i = 0; i < 500; i += 1) state = stepSim(state);
    const person = state.obstacles.find((obstacle) => obstacle.kind === "person");
    expect(person?.kind).toBe("person");
    if (person?.kind === "person") {
      expect(person.x).toBeGreaterThanOrEqual(person.minX);
      expect(person.x).toBeLessThanOrEqual(person.maxX);
    }
  });

  it("loses some echoes on reflective floors", () => {
    const normal = createWarehouseSim(config);
    const reflective = createWarehouseSim({ ...config, reflective: true });
    const normalHits = stepSim(normal).hits.length;
    const reflectiveHits = stepSim(reflective).hits.length;
    expect(reflectiveHits).toBeLessThan(normalHits);
  });
});
