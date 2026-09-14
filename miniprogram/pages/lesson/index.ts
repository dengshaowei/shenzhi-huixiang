import { SENSOR_LESSON } from "../../core/content";
import { learningAgent, type LessonKnowledgePoint } from "../../core/learning-agent";
import { createWarehouseSim, stepSim, type SimConfig, type SimState } from "../../core/lidar-sim";
import { ensureKnowledgeReady, knowledgeModeLabel } from "../../services/knowledge-service";
import { progressRepository } from "../../services/progress-repository";
import { setStudyContext } from "../../services/study-context";
import { drawSim, type SimCtx } from "./sim-renderer";

interface LessonData {
  lesson: readonly LessonKnowledgePoint[];
  alreadyCompleted: boolean;
  knowledgeLabel: string;
  simLidarOn: boolean;
  simNight: boolean;
  simReflective: boolean;
  simStatus: string;
  simEnded: boolean;
  saveError: string;
}

interface SimCanvasNode {
  width: number;
  height: number;
  getContext(type: "2d"): unknown;
  requestAnimationFrame(callback: () => void): number;
  cancelAnimationFrame(id: number): void;
}

const SIM_DEFAULT_STATUS = "红线是小仓的激光雷达扫描线，碰到障碍就点亮红点。试着关掉开关，看看会发生什么。";

Page<LessonData, WechatMiniprogram.Page.CustomOption>({
  simState: null as SimState | null,
  simCtx: null as SimCtx | null,
  simCanvas: null as SimCanvasNode | null,
  simFrame: 0,
  simLogicalWidth: 0,
  simLogicalHeight: 0,

  data: {
    lesson: [],
    alreadyCompleted: false,
    knowledgeLabel: "",
    simLidarOn: true,
    simNight: false,
    simReflective: false,
    simStatus: SIM_DEFAULT_STATUS,
    simEnded: false,
    saveError: "",
  },

  onShow(): void {
    void this.refreshLesson();
  },

  onReady(): void {
    this.initSimulator();
  },

  onHide(): void {
    this.stopSimulator();
  },

  onUnload(): void {
    this.stopSimulator();
  },

  async refreshLesson(): Promise<void> {
    try {
      await ensureKnowledgeReady();
      const progress = progressRepository.load();
      this.setData({
        lesson: learningAgent.getLessonKnowledge(SENSOR_LESSON).points,
        alreadyCompleted: progress.lessonCompleted,
        knowledgeLabel: knowledgeModeLabel(),
        saveError: "",
      });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "微课进度读取失败" });
    }
  },

  initSimulator(): void {
    wx.createSelectorQuery()
      .in(this)
      .select("#lidarSim")
      .fields({ node: true, size: true })
      .exec((result) => {
        const entry = result[0] as { node?: SimCanvasNode; width?: number; height?: number } | undefined;
        if (!entry?.node || !entry.width || !entry.height) return;
        const dpr = wx.getWindowInfo().pixelRatio || 2;
        entry.node.width = entry.width * dpr;
        entry.node.height = entry.height * dpr;
        const ctx = entry.node.getContext("2d") as SimCtx;
        ctx.scale(dpr, dpr);
        this.simCanvas = entry.node;
        this.simCtx = ctx;
        this.simLogicalWidth = entry.width;
        this.simLogicalHeight = entry.height;
        this.simState = createWarehouseSim(this.currentSimConfig());
        this.runSimFrame();
      });
  },

  currentSimConfig(): SimConfig {
    return {
      width: this.simLogicalWidth || 345,
      height: this.simLogicalHeight || 190,
      lidarOn: this.data.simLidarOn,
      night: this.data.simNight,
      reflective: this.data.simReflective,
    };
  },

  runSimFrame(): void {
    if (!this.simCanvas || !this.simCtx || !this.simState) return;
    this.simState = stepSim(this.simState);
    drawSim(this.simCtx, this.simState, this.simLogicalWidth, this.simLogicalHeight);
    if (this.simState.collided && !this.data.simEnded) {
      this.setData({
        simEnded: true,
        simStatus: "💥 撞上了！这就是为什么安全场景不能只靠一个传感器——每一层能力都需要另一层来兜底。",
      });
    } else if (this.simState.finished && !this.data.simEnded) {
      this.setData({
        simEnded: true,
        simStatus: "✅ 安全抵达！激光雷达的稳定测距 + 对失效边界的预判，让小仓完成了任务。",
      });
    }
    this.simFrame = this.simCanvas.requestAnimationFrame(() => this.runSimFrame());
  },

  stopSimulator(): void {
    if (this.simCanvas && this.simFrame) {
      this.simCanvas.cancelAnimationFrame(this.simFrame);
      this.simFrame = 0;
    }
  },

  applySimFlags(flags: Partial<Pick<LessonData, "simLidarOn" | "simNight" | "simReflective">>, status: string): void {
    this.setData({ ...flags, simStatus: status });
    if (this.simState) {
      this.simState = { ...this.simState, config: this.currentSimConfig() };
    }
  },

  toggleLidar(event: WechatMiniprogram.SwitchChange): void {
    const on = Boolean(event.detail.value);
    this.applySimFlags(
      { simLidarOn: on },
      on ? "激光雷达重新上线，小仓又能稳定测距了。" : "激光雷达已关闭——小仓现在是在『盲开』，盯住它会发生什么。",
    );
  },

  toggleNight(event: WechatMiniprogram.SwitchChange): void {
    const on = Boolean(event.detail.value);
    this.applySimFlags(
      { simNight: on },
      on ? "天黑了：绿色相机视野失效，但激光雷达照常工作——这就是能力互补。" : "天亮了，相机视野恢复。",
    );
  },

  toggleReflective(event: WechatMiniprogram.SwitchChange): void {
    const on = Boolean(event.detail.value);
    this.applySimFlags(
      { simReflective: on },
      on ? "地面反光：部分回波会丢失，小仓可能『看漏』障碍——单一方案的边界就在这里。" : "地面恢复正常。",
    );
  },

  restartSim(): void {
    this.simState = createWarehouseSim(this.currentSimConfig());
    this.setData({ simEnded: false, simStatus: SIM_DEFAULT_STATUS });
  },

  finishLesson(): void {
    try {
      const current = progressRepository.load();
      progressRepository.save({
        ...current,
        lessonCompleted: true,
        lastRoute: "feynman",
        updatedAt: new Date().toISOString(),
      });
      wx.navigateTo({ url: "/pages/feynman/index" });
    } catch (error: unknown) {
      this.setData({ saveError: error instanceof Error ? error.message : "微课进度保存失败" });
    }
  },

  askAgent(event: WechatMiniprogram.TouchEvent): void {
    const id = String(event.currentTarget.dataset.id ?? "");
    const point = SENSOR_LESSON.find((item) => item.id === id);
    if (!point) return;
    setStudyContext({
      kind: "curriculum",
      domainId: "sensors",
      domainTitle: "感知与传感器",
      moduleId: point.id,
      moduleTitle: point.title,
      knowledgeTerms: point.knowledgeTerms,
      project: null,
    });
    wx.switchTab({ url: "/pages/agent/index" });
  },
});
