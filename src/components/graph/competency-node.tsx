"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { STATUS_LABELS, type CompetencyNodeData } from "@/content/competency-map";

type CompetencyNode = Node<CompetencyNodeData, "competency">;

export function CompetencyNodeCard({ data, selected }: NodeProps<CompetencyNode>) {
  return (
    <article className={`map-node status-${data.status} ${selected ? "is-selected" : ""}`}>
      <Handle type="target" position={Position.Left} className="map-handle" />
      <div className="map-node-topline">
        <span className="map-node-order">{data.order}</span>
        <span className={`map-status status-${data.status}`}>{STATUS_LABELS[data.status]}</span>
      </div>
      <div className={`map-node-icon accent-${data.accent}`} aria-hidden="true">{data.icon}</div>
      <div className="map-node-copy">
        <h3>{data.shortTitle}</h3>
        <p>{data.description}</p>
      </div>
      <div className="map-node-footer">
        <span>{data.pieces} 块知识拼图</span>
        {data.status === "learning" ? <b>{data.progress}%</b> : <b aria-hidden="true">→</b>}
      </div>
      {data.status === "learning" ? (
        <div className="node-progress" aria-label={`学习进度 ${data.progress}%`}>
          <span style={{ width: `${data.progress}%` }} />
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="map-handle" />
    </article>
  );
}

