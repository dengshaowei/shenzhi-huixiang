"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  MASTERY_CHALLENGE,
  QUICK_PROMPTS,
  SENSOR_MODULES,
  WEB_AGENT_CONTENT_VERSION,
  WEB_AGENT_MODE,
} from "@/features/web-agent/content";
import { answerLocally, evaluateMastery, explanationSchema, questionSchema } from "@/features/web-agent/local-agent";
import type { AgentMessage, AgentReply, MasteryResult } from "@/features/web-agent/types";
import styles from "./web-agent-demo.module.css";

const STORAGE_KEY = "jushen-web-agent-progress-v1";
const STORAGE_EVENT = "jushen-web-agent-progress";

function subscribeToMastery(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getMasterySnapshot(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "mastered";
}

function getServerMasterySnapshot(): boolean {
  return false;
}

const WELCOME_REPLY: AgentReply = {
  answer: "嗨，我是小响。现在我们一起看“感知与传感器 → 激光雷达与测距”。你可以问我方案怎么选、什么时候会失效，也可以直接让我考考你。",
  followUp: "想先听一个初学者解释，还是从仓储机器人场景开始？",
  grounded: true,
  sources: [],
  branches: [],
  suggestions: ["为什么仓库机器人不能只用相机？", "激光雷达和深度相机怎么选？", "考考我吧"],
};

const INITIAL_MESSAGES: readonly AgentMessage[] = [
  { id: "welcome", role: "agent", text: WELCOME_REPLY.answer, reply: WELCOME_REPLY },
];

function MessageCard({ message, onSuggestion }: { readonly message: AgentMessage; readonly onSuggestion: (question: string) => void }) {
  const reply = message.reply;
  return (
    <article className={`${styles.messageRow} ${styles[message.role]}`}>
      <span className={styles.messageAvatar} aria-hidden="true">{message.role === "agent" ? "响" : "我"}</span>
      <div className={styles.messageBubble}>
        <span className={styles.messageRole}>{message.role === "agent" ? "小响" : "我的问题"}</span>
        <p className={styles.messageText}>{message.text}</p>

        {reply && reply.branches.length > 0 ? (
          <div className={styles.mindMap} aria-label="回答知识导图">
            <div className={styles.mapRoot}>
              <span>知识中心</span>
              <strong>激光雷达与测距</strong>
              <small>从能力走向产品判断</small>
            </div>
            <div className={styles.mapBranches}>
              {reply.branches.map((branch) => (
                <div className={styles.mapBranch} key={branch.id}>
                  <strong>{branch.title}</strong>
                  <ul>{branch.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {reply?.followUp ? (
          <div className={styles.followUp}>
            <span>继续想一想</span>
            <p>{reply.followUp}</p>
          </div>
        ) : null}

        {reply && reply.suggestions.length > 0 ? (
          <div className={styles.suggestions}>
            {reply.suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => onSuggestion(suggestion)}>{suggestion}</button>
            ))}
          </div>
        ) : null}

        {reply && reply.sources.length > 0 ? (
          <div className={styles.messageMeta}>
            <span>✓ 已核对 {reply.sources.length} 条课程依据</span>
            <span>本地回复</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function MasteryPanel({ onPassed }: { readonly onPassed: () => void }) {
  const [selected, setSelected] = useState("");
  const [explanation, setExplanation] = useState("");
  const [result, setResult] = useState<MasteryResult | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setError("请先选择一套方案");
      return;
    }
    const parsed = explanationSchema.safeParse(explanation);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "请补充解释");
      return;
    }
    const nextResult = evaluateMastery(selected, parsed.data);
    setResult(nextResult);
    setError("");
    if (nextResult.unlocked) onPassed();
  }

  return (
    <div className={styles.masteryPanel}>
      <div className={styles.masteryIntro}>
        <span className={styles.eyebrow}>DETERMINISTIC MASTERY</span>
        <h2>不是聊得像懂了，<br />而是留下掌握证据。</h2>
        <p>{MASTERY_CHALLENGE.scenario}</p>
      </div>
      <form className={styles.challengeForm} onSubmit={submit}>
        <fieldset>
          <legend>{MASTERY_CHALLENGE.prompt}</legend>
          {MASTERY_CHALLENGE.options.map((option, index) => (
            <label className={`${styles.optionCard} ${selected === option.id ? styles.selectedOption : ""}`} key={option.id}>
              <input type="radio" name="sensor-plan" value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{option.title}</strong><small>{option.detail}</small></div>
            </label>
          ))}
        </fieldset>
        <label className={styles.explanationField}>
          <span>用自己的话解释选择依据</span>
          <textarea
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            maxLength={600}
            placeholder="至少说明：一个场景约束、两种传感器的能力差异，以及一个取舍或失效边界…"
          />
          <small>{explanation.length}/600</small>
        </label>
        {error ? <p className={styles.formError} role="alert">{error}</p> : null}
        <button className={styles.primaryButton} type="submit">提交掌握证据 <span>→</span></button>
      </form>

      {result ? (
        <section className={`${styles.resultCard} ${result.unlocked ? styles.passed : styles.retry}`} aria-live="polite">
          <div>
            <span>{result.unlocked ? "拼图已点亮" : "还差一点"}</span>
            <strong>{result.passedCount}/5 证据维度</strong>
          </div>
          <div className={styles.evidenceGrid}>
            {result.dimensions.map((dimension) => (
              <div key={dimension.id}>
                <span>{dimension.passed ? "✓" : "·"}</span>
                <p><strong>{dimension.label}</strong><small>{dimension.evidence}</small></p>
              </div>
            ))}
          </div>
          <p>{result.reasons.join(" · ")}</p>
        </section>
      ) : null}
    </div>
  );
}

export function WebAgentDemo() {
  const [view, setView] = useState<"chat" | "mastery">("chat");
  const [messages, setMessages] = useState<readonly AgentMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [inputError, setInputError] = useState("");
  const mastered = useSyncExternalStore(subscribeToMastery, getMasterySnapshot, getServerMasterySnapshot);
  const sequence = useRef(0);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  function markMastered() {
    window.localStorage.setItem(STORAGE_KEY, "mastered");
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  function ask(rawQuestion: string) {
    if (sending) return;
    const parsed = questionSchema.safeParse(rawQuestion);
    if (!parsed.success) {
      setInputError(parsed.error.issues[0]?.message ?? "请输入一个具体问题");
      return;
    }
    sequence.current += 1;
    const question = parsed.data;
    const userMessage: AgentMessage = { id: `user-${sequence.current}`, role: "user", text: question };
    const history = messages.filter((message) => message.role === "user").map((message) => message.text);
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setInputError("");
    setSending(true);

    window.setTimeout(() => {
      sequence.current += 1;
      const reply = answerLocally(question, history);
      setMessages((current) => [...current, { id: `agent-${sequence.current}`, role: "agent", text: reply.answer, reply }]);
      setSending(false);
      if (question.includes("考考我")) setView("mastery");
    }, 420);
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft);
  }

  const latestSources = [...messages].reverse().find((message) => message.reply?.sources.length)?.reply?.sources ?? [];

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/" aria-label="返回具身拼图首页"><span>具</span><strong>具身拼图</strong></Link>
        <nav aria-label="Demo 导航">
          <button type="button" className={view === "chat" ? styles.activeNav : ""} onClick={() => setView("chat")}><span>◎</span>学习伙伴</button>
          <button type="button" className={view === "mastery" ? styles.activeNav : ""} onClick={() => setView("mastery")}><span>◇</span>掌握检测</button>
          <Link href="/"><span>⌘</span>能力地图</Link>
        </nav>
        <section className={styles.pathCard}>
          <div><span>当前路径</span><small>{mastered ? "已掌握" : "进行中"}</small></div>
          <strong>感知与传感器</strong>
          <p>机器人如何“看见”世界？</p>
          <div className={styles.pathProgress}><span style={{ width: mastered ? "100%" : "46%" }} /></div>
          <small>{mastered ? "5 / 5 已完成" : "2 / 5 已完成"}</small>
        </section>
        <div className={styles.offlineNote}><span>●</span><div><strong>完全本地运行</strong><small>无请求 · 无 API Key · 无数据上传</small></div></div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.contextBar}>
          <div><span>当前学习上下文</span><strong>感知与传感器 <i>→</i> 激光雷达与测距</strong></div>
          <div className={styles.headerActions}>
            <span className={styles.modePill}><i /> 本地知识 Agent</span>
            <button type="button" onClick={() => setView(view === "chat" ? "mastery" : "chat")}>{view === "chat" ? "去检测掌握" : "返回对话"} →</button>
          </div>
        </header>

        {view === "chat" ? (
          <div className={styles.chatLayout}>
            <section className={styles.chatPanel} aria-label="小响学习对话">
              <div className={styles.messageList}>
                {messages.map((message) => <MessageCard message={message} key={message.id} onSuggestion={ask} />)}
                {sending ? (
                  <div className={`${styles.messageRow} ${styles.agent}`} aria-live="polite">
                    <span className={styles.messageAvatar}>响</span>
                    <div className={`${styles.messageBubble} ${styles.thinking}`}><span /><span /><span /><small>正在检索本地课程内容…</small></div>
                  </div>
                ) : null}
                <div ref={messageEndRef} />
              </div>
              <div className={styles.composer}>
                <div className={styles.quickPrompts}>
                  {QUICK_PROMPTS.map((prompt) => <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}
                </div>
                <form onSubmit={submitQuestion}>
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={260} placeholder="问一个具体问题，例如：为什么仓库机器人不能只用相机？" aria-label="向小响提问" />
                  <button type="submit" disabled={sending} aria-label="发送问题">↑</button>
                </form>
                <div className={styles.composerMeta}><span>{inputError || WEB_AGENT_MODE}</span><small>{draft.length}/260</small></div>
              </div>
            </section>

            <aside className={styles.evidencePanel}>
              <span className={styles.eyebrow}>LEARNING CONTEXT</span>
              <h2>这一轮，小响在看什么</h2>
              <div className={styles.moduleList}>
                {SENSOR_MODULES.map((module, index) => (
                  <div className={module.id === "lidar" ? styles.currentModule : ""} key={module.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span><p><strong>{module.title}</strong><small>{module.summary}</small></p>
                  </div>
                ))}
              </div>
              <section className={styles.sourceCard}>
                <div><span>本轮依据</span><small>{latestSources.length || "—"}</small></div>
                {latestSources.length > 0 ? latestSources.map((source) => <p key={source.id}><strong>{source.title}</strong><span>{source.summary}</span></p>) : <p><span>提问后，这里会显示回答实际命中的课程依据。</span></p>}
              </section>
              <p className={styles.version}>内容版本 {WEB_AGENT_CONTENT_VERSION}</p>
            </aside>
          </div>
        ) : <MasteryPanel onPassed={markMastered} />}
      </section>
    </main>
  );
}
