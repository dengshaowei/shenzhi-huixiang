"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import {
  competencyEdges,
  competencyNodes,
  DEFAULT_SELECTED_NODE_ID,
  STATUS_LABELS,
} from "@/content/competency-map";
import { summarizeProgress } from "@/lib/mastery/progress";
import { CompetencyNodeCard } from "./competency-node";

const nodeTypes: NodeTypes = { competency: CompetencyNodeCard };

export function CompetencyMap() {
  const [selectedId, setSelectedId] = useState(DEFAULT_SELECTED_NODE_ID);
  const selectedNode = competencyNodes.find((node) => node.id === selectedId) ?? competencyNodes[0];
  const summary = useMemo(() => summarizeProgress(competencyNodes), []);

  const handleNodeClick = useCallback<NodeMouseHandler>((_event, node) => {
    setSelectedId(node.id);
  }, []);

  return (
    <section className="map-section" aria-labelledby="map-title">
      <div className="map-section-head">
        <div>
          <p className="section-kicker">YOUR COMPETENCY UNIVERSE</p>
          <h2 id="map-title">你的具身智能知识拼图</h2>
          <p>从左向右是产品能力的主链路。选择任意拼图，查看它为什么重要。</p>
        </div>
        <div className="legend" aria-label="拼图状态图例">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <span key={status}><i className={`legend-${status}`} />{label}</span>
          ))}
        </div>
      </div>

      <div className="map-stage">
        <div className="map-canvas" aria-label="具身智能产品经理能力地图">
          <ReactFlow
            nodes={competencyNodes}
            edges={competencyEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.11 }}
            minZoom={0.2}
            maxZoom={1.35}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.1} color="rgba(148,163,184,.16)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="node-detail" aria-live="polite">
          <div className="detail-number">{selectedNode.data.order}</div>
          <span className={`detail-status status-${selectedNode.data.status}`}>
            {STATUS_LABELS[selectedNode.data.status]}
          </span>
          <div className={`detail-glyph accent-${selectedNode.data.accent}`} aria-hidden="true">
            {selectedNode.data.icon}
          </div>
          <p className="detail-overline">COMPETENCY DOMAIN</p>
          <h3>{selectedNode.data.title}</h3>
          <p className="detail-description">{selectedNode.data.description}</p>

          <div className="outcome-card">
            <span>学会后，你能够</span>
            <p>{selectedNode.data.outcome}</p>
          </div>

          {selectedNode.data.prerequisite ? (
            <p className="prerequisite"><span>前置拼图</span>{selectedNode.data.prerequisite}</p>
          ) : (
            <p className="prerequisite"><span>前置拼图</span>无 · 起始节点</p>
          )}

          <button
            className={`detail-cta ${selectedNode.data.status === "locked" ? "is-locked" : ""}`}
            type="button"
            disabled={selectedNode.data.status === "locked"}
          >
            {selectedNode.data.status === "learning" ? "继续学习这一块" : selectedNode.data.status === "locked" ? "完成前置拼图后解锁" : "查看详细思维导图"}
            <b>{selectedNode.data.status === "locked" ? "⌁" : "→"}</b>
          </button>
          <p className="detail-footnote">首版完整学习路径：感知系统 → 传感器选择</p>
        </aside>
      </div>

      <footer className="map-progress-summary">
        <div className="progress-ring" style={{ "--progress": `${summary.percentage * 3.6}deg` } as React.CSSProperties}>
          <span>{summary.percentage}%</span>
        </div>
        <div>
          <p>岗位能力覆盖</p>
          <strong>{summary.mastered} 块已掌握 · {summary.learning} 块学习中</strong>
        </div>
        <p className="coverage-note">“完整”不是全部看过，而是每个岗位核心节点都有可回溯的掌握证据。</p>
      </footer>
    </section>
  );
}
