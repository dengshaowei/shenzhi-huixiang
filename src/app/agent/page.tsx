import type { Metadata } from "next";
import { WebAgentDemo } from "@/components/agent/web-agent-demo";

export const metadata: Metadata = {
  title: "小响 Web Demo｜具身拼图",
  description: "无需 API Key、可离线运行的具身智能学习 Agent Web Demo。",
};

export default function AgentDemoPage() {
  return <WebAgentDemo />;
}

