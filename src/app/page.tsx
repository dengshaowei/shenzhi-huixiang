import { CompetencyMap } from "@/components/graph/competency-map";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="具身拼图首页">
          <span className="brand-mark" aria-hidden="true">具</span>
          <span>具身拼图</span>
        </a>
        <div className="topbar-actions">
          <span className="version-chip">知识地图 v0.1</span>
          <Link className="agent-demo-link" href="/agent">体验 Web Agent <span>→</span></Link>
          <button className="avatar" type="button" aria-label="访客学习档案">C</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> 具身智能产品经理 · 成长路线</p>
          <h1>别再收藏知识。<br /><strong>把能力一块块拼出来。</strong></h1>
          <p className="hero-description">
            这不是课程目录，而是一张会回应你的岗位能力地图。每个亮起的节点，
            都必须由解释、判断与真实案例共同证明。
          </p>
          <div className="hero-metrics" aria-label="学习地图摘要">
            <div><b>9</b><span>能力领域</span></div>
            <i />
            <div><b>36</b><span>核心拼图</span></div>
            <i />
            <div><b>1</b><span>学习中</span></div>
          </div>
        </div>

        <aside className="today-card">
          <div className="today-card-head">
            <span className="pulse-dot" />
            <span>今日学习任务</span>
            <small>8 MIN</small>
          </div>
          <div className="today-icon" aria-hidden="true">◉</div>
          <div>
            <p>感知与传感器 · 01</p>
            <h2>机器人如何“看见”世界？</h2>
            <span>从产品约束出发，选择正确的感知组合</span>
          </div>
          <Link className="today-card-link" href="/agent">
            进入无 Key 演示 <b>→</b>
          </Link>
        </aside>
      </section>

      <CompetencyMap />
    </main>
  );
}
