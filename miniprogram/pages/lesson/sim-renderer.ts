import type { SimState } from "../../core/lidar-sim";

/** 只声明渲染用到的最小 Canvas 接口，避免依赖具体运行时类型。 */
export interface SimCtx {
  canvas: { width: number; height: number };
  fillStyle: string | unknown;
  strokeStyle: string | unknown;
  lineWidth: number;
  globalAlpha: number;
  font: string;
  textAlign: string;
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  fill(): void;
  stroke(): void;
  fillText(text: string, x: number, y: number): void;
  scale(x: number, y: number): void;
  save(): void;
  restore(): void;
}

const COLORS = {
  floor: "#fdf1e3",
  grid: "#f3ddc8",
  shelf: "#c98a5e",
  shelfEdge: "#8f5c33",
  box: "#d97706",
  boxEdge: "#92400e",
  person: "#2563eb",
  robot: "#c2410c",
  robotCore: "#ffffff",
  ray: "rgba(251, 146, 60, 0.55)",
  hit: "#dc2626",
  camera: "rgba(34, 197, 94, 0.16)",
  cameraNight: "rgba(120, 113, 108, 0.10)",
  night: "rgba(30, 27, 75, 0.45)",
  label: "#7c5c4a",
};

function drawLabel(ctx: SimCtx, text: string, x: number, y: number): void {
  ctx.fillStyle = COLORS.label;
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

export function drawSim(ctx: SimCtx, state: SimState, logicalWidth: number, logicalHeight: number): void {
  ctx.save();
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // 地面与网格
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= logicalWidth; gx += 28) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, logicalHeight);
    ctx.stroke();
  }
  for (let gy = 0; gy <= logicalHeight; gy += 28) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(logicalWidth, gy);
    ctx.stroke();
  }

  // 相机视野锥（夜间失效）
  const camLen = 96;
  const camFan = Math.PI / 5;
  ctx.beginPath();
  ctx.moveTo(state.robot.x, state.robot.y);
  ctx.arc(state.robot.x, state.robot.y, camLen, state.robot.angle - camFan / 2, state.robot.angle + camFan / 2);
  ctx.fillStyle = state.config.night ? COLORS.cameraNight : COLORS.camera;
  ctx.fill();

  // 货架与箱子
  for (const obstacle of state.obstacles) {
    if (obstacle.kind === "person") continue;
    ctx.fillStyle = obstacle.kind === "shelf" ? COLORS.shelf : COLORS.box;
    ctx.strokeStyle = obstacle.kind === "shelf" ? COLORS.shelfEdge : COLORS.boxEdge;
    ctx.lineWidth = 2;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
  }
  drawLabel(ctx, "货架", logicalWidth * 0.23, state.obstacles[0] ? state.obstacles[0].y + 24 : 40);
  const box = state.obstacles.find((obstacle) => obstacle.kind === "box");
  if (box && box.kind === "box") drawLabel(ctx, "箱子", box.x + box.w / 2, box.y - 6);

  // 激光雷达射线与命中点
  for (const hit of state.hits) {
    ctx.beginPath();
    ctx.moveTo(state.robot.x, state.robot.y);
    ctx.lineTo(hit.x, hit.y);
    ctx.strokeStyle = COLORS.ray;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.hit;
    ctx.fill();
  }

  // 工作人员
  for (const obstacle of state.obstacles) {
    if (obstacle.kind !== "person") continue;
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.person;
    ctx.fill();
    drawLabel(ctx, "工作人员", obstacle.x, obstacle.y - obstacle.r - 6);
  }

  // 机器人“小仓”
  const { robot } = state;
  ctx.beginPath();
  ctx.arc(robot.x, robot.y, robot.r, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.robot;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(robot.x, robot.y, robot.r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.robotCore;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(robot.x, robot.y);
  ctx.lineTo(robot.x + Math.cos(robot.angle) * robot.r, robot.y + Math.sin(robot.angle) * robot.r);
  ctx.strokeStyle = COLORS.robotCore;
  ctx.lineWidth = 2;
  ctx.stroke();
  drawLabel(ctx, "小仓", robot.x, robot.y + robot.r + 14);

  // 夜间遮罩
  if (state.config.night) {
    ctx.fillStyle = COLORS.night;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    drawLabel(ctx, "夜间：相机视野失效，激光雷达不受影响", logicalWidth / 2, 18);
  }

  // 状态水印
  ctx.textAlign = "center";
  ctx.font = "bold 13px sans-serif";
  if (!state.config.lidarOn) {
    ctx.fillStyle = "rgba(180, 35, 24, 0.75)";
    ctx.fillText("激光雷达已关闭 · 盲开中", logicalWidth / 2, logicalHeight / 2 - 8);
  }
  if (robot.stopped && !state.collided && !state.finished) {
    ctx.fillStyle = "#2f7d61";
    ctx.fillText("已在障碍前刹车", robot.x, robot.y - robot.r - 10);
  }
  if (state.collided) {
    const pulse = 16 + (state.ticks % 20);
    ctx.globalAlpha = Math.max(0.2, 1 - (state.ticks % 20) / 20);
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.hit;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.hit;
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("💥 碰撞！", robot.x, robot.y - robot.r - 12);
  }
  if (state.finished) {
    ctx.fillStyle = "#2f7d61";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("✅ 安全抵达终点", logicalWidth / 2, logicalHeight / 2 - 8);
  }
  ctx.restore();
}
