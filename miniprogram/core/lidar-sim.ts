/**
 * 激光雷达避障互动模拟器：纯逻辑引擎，不包含任何渲染代码，方便单元测试。
 * 场景：俯视视角的仓库通道，机器人“小仓”从左向右行进，通道里有一个箱子，
 * 一名工作人员在通道里往返走动。开启激光雷达时机器人会在障碍物前停下；
 * 关闭后机器人失去稳定测距，会撞上障碍物。反光地面会概率性丢失回波。
 */

export interface ShelfObstacle {
  readonly kind: "shelf";
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface BoxObstacle {
  readonly kind: "box";
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface PersonObstacle {
  readonly kind: "person";
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly vx: number;
  readonly minX: number;
  readonly maxX: number;
}

export type SimObstacle = ShelfObstacle | BoxObstacle | PersonObstacle;

export interface SimConfig {
  readonly width: number;
  readonly height: number;
  readonly lidarOn: boolean;
  readonly night: boolean;
  readonly reflective: boolean;
}

export interface RayHit {
  readonly x: number;
  readonly y: number;
  readonly dist: number;
  readonly angle: number;
  readonly obstacleId: string;
}

export interface SimRobot {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly speed: number;
  readonly r: number;
  readonly stopped: boolean;
}

export interface SimState {
  readonly config: SimConfig;
  readonly robot: SimRobot;
  readonly obstacles: readonly SimObstacle[];
  readonly hits: readonly RayHit[];
  readonly collided: boolean;
  readonly collidedWith: string | null;
  readonly finished: boolean;
  readonly ticks: number;
}

const ROBOT_RADIUS = 10;
const ROBOT_SPEED = 1.4;
const RAY_COUNT = 16;
const RAY_FAN = (Math.PI / 180) * 130;
const MAX_RANGE = 240;
const STOP_DISTANCE = 46;
const GOAL_MARGIN = 28;

/** 射线与轴对齐矩形的最近交点距离（slab 法），无交点返回 null。 */
export function rayVsRect(
  ox: number, oy: number, dx: number, dy: number,
  rect: { readonly x: number; readonly y: number; readonly w: number; readonly h: number },
  maxDist: number,
): number | null {
  const invDx = dx === 0 ? Number.POSITIVE_INFINITY : 1 / dx;
  const invDy = dy === 0 ? Number.POSITIVE_INFINITY : 1 / dy;
  let tMin = (rect.x - ox) * invDx;
  let tMax = (rect.x + rect.w - ox) * invDx;
  if (tMin > tMax) [tMin, tMax] = [tMax, tMin];
  let tMinY = (rect.y - oy) * invDy;
  let tMaxY = (rect.y + rect.h - oy) * invDy;
  if (tMinY > tMaxY) [tMinY, tMaxY] = [tMaxY, tMinY];
  const tEnter = Math.max(tMin, tMinY);
  const tExit = Math.min(tMax, tMaxY);
  if (tEnter > tExit || tExit < 0) return null;
  const t = tEnter >= 0 ? tEnter : tExit;
  return t >= 0 && t <= maxDist ? t : null;
}

/** 射线与圆的最近交点距离，无交点返回 null。 */
export function rayVsCircle(
  ox: number, oy: number, dx: number, dy: number,
  cx: number, cy: number, r: number, maxDist: number,
): number | null {
  const fx = ox - cx;
  const fy = oy - cy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const t1 = (-b - root) / 2;
  const t2 = (-b + root) / 2;
  const t = t1 >= 0 ? t1 : t2;
  return t >= 0 && t <= maxDist ? t : null;
}

export function castRay(
  ox: number, oy: number, angle: number,
  obstacles: readonly SimObstacle[], maxRange: number = MAX_RANGE,
): RayHit | null {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best: RayHit | null = null;
  for (const obstacle of obstacles) {
    const dist = obstacle.kind === "person"
      ? rayVsCircle(ox, oy, dx, dy, obstacle.x, obstacle.y, obstacle.r, maxRange)
      : rayVsRect(ox, oy, dx, dy, obstacle, maxRange);
    if (dist !== null && (best === null || dist < best.dist)) {
      best = { x: ox + dx * dist, y: oy + dy * dist, dist, angle, obstacleId: obstacle.id };
    }
  }
  return best;
}

function circleTouchesObstacle(x: number, y: number, r: number, obstacle: SimObstacle): boolean {
  if (obstacle.kind === "person") {
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    return dx * dx + dy * dy <= (r + obstacle.r) * (r + obstacle.r);
  }
  const closestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.w));
  const closestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.h));
  const dx = x - closestX;
  const dy = y - closestY;
  return dx * dx + dy * dy <= r * r;
}

export function createWarehouseSim(config: SimConfig): SimState {
  const { width, height } = config;
  const laneY = Math.round(height * 0.68);
  const shelfH = Math.round(height * 0.14);
  const obstacles: SimObstacle[] = [
    { kind: "shelf", id: "shelf-top-1", x: Math.round(width * 0.08), y: shelfH, w: Math.round(width * 0.3), h: shelfH },
    { kind: "shelf", id: "shelf-top-2", x: Math.round(width * 0.55), y: shelfH, w: Math.round(width * 0.34), h: shelfH },
    { kind: "shelf", id: "shelf-bottom", x: Math.round(width * 0.3), y: height - shelfH * 2, w: Math.round(width * 0.45), h: shelfH },
    { kind: "box", id: "box-1", x: Math.round(width * 0.62), y: laneY - 12, w: 24, h: 24 },
    { kind: "person", id: "person-1", x: Math.round(width * 0.5), y: laneY - Math.round(height * 0.16), r: 8, vx: 0.8, minX: Math.round(width * 0.4), maxX: Math.round(width * 0.72) },
  ];
  return {
    config,
    robot: { x: Math.round(width * 0.08), y: laneY, angle: 0, speed: ROBOT_SPEED, r: ROBOT_RADIUS, stopped: false },
    obstacles,
    hits: [],
    collided: false,
    collidedWith: null,
    finished: false,
    ticks: 0,
  };
}

/** 反光地面的确定性丢帧模型：周期性丢失部分回波，便于测试与复现。 */
function isReflectiveDrop(ticks: number, rayIndex: number): boolean {
  return (ticks + rayIndex * 7) % 11 < 3;
}

export function stepSim(state: SimState): SimState {
  const ticks = state.ticks + 1;
  const obstacles = state.obstacles.map((obstacle): SimObstacle => {
    if (obstacle.kind !== "person") return obstacle;
    let x = obstacle.x + obstacle.vx;
    let vx = obstacle.vx;
    if (x <= obstacle.minX || x >= obstacle.maxX) {
      vx = -vx;
      x = Math.max(obstacle.minX, Math.min(x, obstacle.maxX));
    }
    return { ...obstacle, x, vx };
  });

  let hits: RayHit[] = [];
  if (state.config.lidarOn) {
    const candidates: RayHit[] = [];
    for (let i = 0; i < RAY_COUNT; i += 1) {
      const angle = state.robot.angle - RAY_FAN / 2 + (RAY_FAN * i) / (RAY_COUNT - 1);
      if (state.config.reflective && isReflectiveDrop(ticks, i)) continue;
      const hit = castRay(state.robot.x, state.robot.y, angle, obstacles);
      if (hit) candidates.push(hit);
    }
    hits = candidates;
  }

  const forwardHit = hits
    .filter((hit) => Math.abs(hit.angle - state.robot.angle) < RAY_FAN / 4)
    .reduce<RayHit | null>((nearest, hit) => (nearest === null || hit.dist < nearest.dist ? hit : nearest), null);
  const shouldStop = state.config.lidarOn && forwardHit !== null && forwardHit.dist <= STOP_DISTANCE;

  let { x } = state.robot;
  let collided = state.collided;
  let collidedWith = state.collidedWith;
  let finished = state.finished;
  if (!collided && !finished && !shouldStop) {
    x += state.robot.speed;
  }
  if (!collided) {
    const hitObstacle = obstacles.find((obstacle) => circleTouchesObstacle(x, state.robot.y, state.robot.r, obstacle));
    if (hitObstacle) {
      collided = true;
      collidedWith = hitObstacle.id;
    }
  }
  if (!collided && x >= state.config.width - GOAL_MARGIN) {
    finished = true;
  }

  return {
    ...state,
    robot: { ...state.robot, x, stopped: shouldStop && !collided && !finished },
    obstacles,
    hits,
    collided,
    collidedWith,
    finished,
    ticks,
  };
}
