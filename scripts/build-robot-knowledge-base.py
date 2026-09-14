#!/usr/bin/env python3
"""Build a deterministic, read-only JSON index from the local robot DOCX library."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

from docx import Document


DEFAULT_SOURCE = Path("knowledge-source")
DEFAULT_OUTPUT = Path("cloudfunctions/knowledgePack/knowledge.json")
DEFAULT_CHAT_OUTPUT = Path("cloudfunctions/studyChat/knowledge.json")
MAX_CHUNK_CHARS = 560
MIN_CHUNK_CHARS = 80


TAG_RULES: dict[str, tuple[str, ...]] = {
    "perception": ("感知", "传感器", "相机", "雷达", "视觉", "识别", "测距"),
    "sensor-selection": ("深度相机", "激光雷达", "相机", "传感器", "感知系统"),
    "warehouse": ("仓储", "物流", "AMR", "货架", "搬运"),
    "scenario": ("场景", "工业", "农业", "清洁", "特种", "加工", "工厂"),
    "hardware": ("硬件", "机械臂", "执行器", "关节", "电机", "减速器", "控制器", "芯片", "CPU", "显卡"),
    "data": ("数据", "采集", "数据集", "遥控", "仿真", "训练"),
    "algorithm": ("算法", "SLAM", "slam", "强化学习", "模仿学习", "VLA", "大模型"),
    "product": ("产品", "需求", "报价", "成本", "商业", "交付", "项目经理"),
    "industry": ("产业链", "行业", "厂家", "标准", "白皮书", "研究报告"),
    "robot-form": ("人形", "四足", "轮式", "履带", "机器人产品形态", "机械臂"),
}


@dataclass(frozen=True)
class KnowledgeChunk:
    id: str
    documentId: str
    title: str
    sourceFile: str
    sourceType: str
    order: int
    tags: list[str]
    text: str


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def document_title(path: Path) -> str:
    return re.sub(r"^\d{3}\s*", "", path.stem).strip()


def document_id(path: Path) -> str:
    match = re.match(r"^(\d{3})", path.stem)
    return f"robot-internal-{match.group(1) if match else path.stem}"


def iter_document_units(path: Path) -> Iterable[str]:
    document = Document(path)
    for paragraph in document.paragraphs:
        text = normalize_text(paragraph.text)
        if text:
            yield text
    for table_index, table in enumerate(document.tables, start=1):
        for row_index, row in enumerate(table.rows, start=1):
            cells = [normalize_text(cell.text) for cell in row.cells]
            cells = [cell for cell in cells if cell]
            if cells:
                yield f"表格{table_index}-行{row_index}：" + " | ".join(cells)


def group_units(units: Iterable[str]) -> list[str]:
    chunks: list[str] = []
    buffer: list[str] = []
    current_length = 0

    for unit in units:
        projected = current_length + len(unit) + (1 if buffer else 0)
        if buffer and projected > MAX_CHUNK_CHARS:
            chunks.append("\n".join(buffer))
            buffer = []
            current_length = 0
        buffer.append(unit)
        current_length += len(unit) + (1 if current_length else 0)

    if buffer:
        chunks.append("\n".join(buffer))

    if len(chunks) > 1 and len(chunks[-1]) < MIN_CHUNK_CHARS:
        chunks[-2] = f"{chunks[-2]}\n{chunks[-1]}"
        chunks.pop()
    return chunks


def infer_tags(title: str, text: str) -> list[str]:
    searchable = f"{title}\n{text}"
    return sorted(
        tag
        for tag, terms in TAG_RULES.items()
        if any(term in searchable for term in terms)
    )


def build_index(source_dir: Path) -> dict[str, object]:
    chunks: list[KnowledgeChunk] = []
    files = sorted(source_dir.glob("[0-9][0-9][0-9] *.docx"))

    for path in files:
        doc_id = document_id(path)
        title = document_title(path)
        for order, text in enumerate(group_units(iter_document_units(path)), start=1):
            chunks.append(
                KnowledgeChunk(
                    id=f"{doc_id}-chunk-{order:03d}",
                    documentId=doc_id,
                    title=title,
                    sourceFile=path.name,
                    sourceType="local-docx",
                    order=order,
                    tags=infer_tags(title, text),
                    text=text,
                )
            )

    return {
        "manifest": {
            "name": "自定义机器人知识库",
            "version": f"robot-internal-{date.today().isoformat()}",
            "sourceType": "local-docx-directory",
            "documentCount": len(files),
            "chunkCount": len(chunks),
            "generatedOn": date.today().isoformat(),
            "notice": "从本地 DOCX 只读抽取；知识库仅通过云端私有接口下发，不随小程序包分发。",
        },
        "chunks": [asdict(chunk) for chunk in chunks],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--chat-output", type=Path, default=DEFAULT_CHAT_OUTPUT)
    args = parser.parse_args()

    source_dir = args.source_dir.expanduser().resolve()
    output = args.output.expanduser()
    chat_output = args.chat_output.expanduser()
    if not source_dir.is_dir():
        raise SystemExit(f"Knowledge source directory not found: {source_dir}")

    payload = build_index(source_dir)
    serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    for target in (output, chat_output):
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(serialized, encoding="utf-8")
    manifest = payload["manifest"]
    print(
        f"Built {manifest['name']}: {manifest['documentCount']} documents, "
        f"{manifest['chunkCount']} chunks -> {output} and {chat_output}"
    )


if __name__ == "__main__":
    main()
