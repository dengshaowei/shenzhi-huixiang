# Product Requirements Document: 具身拼图 MVP

## Overview

**Product Name:** 具身拼图  
**Problem Statement:** 帮助接触过具身智能但知识零散的学习者，看清岗位能力全图、验证自己是否真正理解，并将知识迁移到真实机器人产品分析中。  
**MVP Goal:** 两天内交付一个可分享 Web Demo，让用户完整跑通“看地图 → 学一章 → 做挑战 → 费曼复述 → 获得可解释反馈 → 点亮拼图 → 应用于真实案例”的闭环。  
**Target Launch:** 2026-08-03

## Target Users

### Primary User Profile

**Who:** 有一定产品或技术基础、会使用 Python 和 AI 工具，希望转向或胜任具身智能产品工作的人。  
**Problem:** 学过零散概念，但不知道覆盖是否完整，也不能稳定地将概念用于产品判断。  
**Current Solution:** 搜索文章、看课程、询问通用大模型、凭空练习产品方案。  
**Why They'll Switch:** 具身拼图不只提供答案，而是给出岗位能力地图、真实约束、明确评分规程和可累计的掌握证据。

### User Persona: 林知远

- **Demographics:** 22—38 岁，中国大陆，产品经理、AI 从业者、开发者或跨行学习者
- **Tech Level:** 中级；能理解基本 AI 与软件概念，但机器人知识不系统
- **Goals:** 建立具身智能全局认知，能分析真实机器人产品，并逐步产出可信的产品文档
- **Frustrations:** 资料碎片化、术语多、看完容易忘、不知道自己是否真的会、缺少行业反馈

## User Journey

### The Story

林知远打开 Demo，首先看到具身智能产品经理的九块知识拼图和自己的掌握状态。他进入“感知与传感器”分支，查看详细思维导图，完成一节关于传感器选择的图文微课。系统先让他完成一个带真实约束的方案选择，再请他用简单语言解释为什么这样选。Agent 按“概念、因果、边界、误区、迁移”五个维度指出证据与缺口。他修正回答后，节点被点亮，并立即在一个真实机器人案例中使用该知识。首页显示为什么该拼图已掌握，以及下一步建议学习什么。

### Key Touchpoints

1. **Discovery:** 通过演示链接、社交内容或具身智能学习社群进入
2. **First Contact:** 直接看到完整知识拼图和“开始一次 8 分钟学习”入口
3. **Onboarding:** 选择 C 类学习深度并查看学习闭环说明；Demo 默认使用访客身份
4. **Core Loop:** 选节点 → 学习 → 挑战 → 复述 → 反馈 → 重试 → 点亮 → 案例应用
5. **Retention:** 未完成拼图、下一步推荐、学习证据和新的真实案例促使用户返回

## MVP Features

### Core Features (Must Have)

#### 1. 岗位知识拼图

- **Description:** 展示九个一级能力域、节点关系、掌握状态、完成度和推荐路径。
- **User Value:** 用户能看清具身智能产品工作的边界，并知道自己缺什么。
- **Success Criteria:**
  - 用户可以缩放、浏览和选择知识节点
  - 系统区分已掌握、学习中、待解锁和未开始状态
  - 每个状态都能查看原因或所需前置条件
- **Priority:** Critical

#### 2. 详细思维导图与图文微课

- **Description:** 每个能力节点可展开子知识点；首版完整实现“感知与传感器 → 传感器选择”分支。
- **User Value:** 用户能从全局地图下钻到一章具体内容，并用类比、示意图和案例理解。
- **Success Criteria:**
  - 首章包含学习目标、前置知识、核心概念、示意图、产品语言翻译和常见误区
  - 用户可从总图进入详细图，再进入微课
  - 其他一级分支显示结构与待解锁状态，不伪装成已完成课程
- **Priority:** Critical

#### 3. 互动挑战与费曼复述 Agent

- **Description:** 用户先完成一个约束型小游戏，再用自己的话复述；Agent 分层追问并输出可解释反馈。
- **User Value:** 防止“看懂等于学会”的错觉，定位具体理解缺口。
- **Success Criteria:**
  - 游戏题使用真实约束，不只考术语记忆
  - Agent 不在第一次错误时直接泄露完整答案
  - 反馈按概念、因果、边界、误区、迁移五维给出“证据、缺口、下一问”
  - 模型不可用时仍有可演示的规则化反馈降级路径
- **Priority:** Critical

#### 4. 掌握证据与拼图点亮

- **Description:** 将挑战和复述结果保存为证据，达到阈值后更新节点状态并推荐下一步。
- **User Value:** 用户知道拼图为什么被点亮，而不是只看到一个随意分数。
- **Success Criteria:**
  - 系统保存每个评估维度的证据和缺口
  - 只有关键错误消除且达到阈值后才能点亮节点
  - 状态更新后总图、详细图和进度摘要保持一致
- **Priority:** Critical

#### 5. 真实机器人案例应用

- **Description:** 学完后在公开资料充分的机器人案例中完成感知方案分析。
- **User Value:** 证明知识能迁移到具身智能产品工作，而不是只会背答案。
- **Success Criteria:**
  - 案例包含场景、用户目标、环境和成本/安全等约束
  - 用户先提交自己的分析，系统再反馈
  - 反馈能关联回已学知识节点和给定资料
- **Priority:** Critical

## Out of Scope (Not in MVP)

| Feature | Why Wait | Planned For |
|---------|----------|-------------|
| 九个领域的完整课程 | 两天内无法保证内容质量和来源审核 | Version 2 |
| 上传个人产品文档并生成训练路径 | 需文件解析、隐私设计和更复杂评估 | Version 2 |
| 自动生成完整 PRD/技术方案 | 容易变成 AI 代做，需先验证学习反馈 | Version 2 |
| 多智能体自治编排 | 首版单编排器足以证明价值，复杂度收益低 | Version 2 |
| 完整 RAG 与向量数据库 | 首章使用审核后的结构化资料即可 | Version 2 |
| 正式账号、支付与社交排行榜 | 与核心学习假设无关 | Version 2 |
| A/B 两类完整自适应课程 | 首版先验证 C 类闭环，架构保留扩展位 | Version 2 |

## Success Metrics

### Primary Metrics

1. **闭环完成率：** 首批 5 名目标用户中至少 4 名无需人工讲解完成整条体验
   - How to measure: 记录进入地图、完成微课、挑战、复述、点亮和案例提交事件
   - Why it matters: 证明产品不是只能由创作者演示的静态原型

2. **掌握可解释性：** 首批测试者中至少 4/5 能准确说出一个节点“为何被点亮或为何未点亮”
   - How to measure: 体验后单题访谈与页面反馈
   - Why it matters: 这是产品区别于普通进度条和聊天机器人的核心价值

### Secondary Metrics

- 端到端体验时长：8—15 分钟
- Agent 反馈有用度：测试用户平均不低于 4/5
- 关键路径错误率：0 个阻塞性错误
- 首章二次作答改善率：至少 60% 的首次未通过维度在重试后改善

## UI/UX Direction

**Design Feel:** 探索感、专业、清晰、未来感、图文并茂  
**Inspiration:** roadmap.sh 的全局路线感、Brilliant 的互动反馈，以及科学博物馆式的视觉探索；不直接复制其视觉资产。

### Key Screens

1. **知识宇宙 / 总拼图**
   - Purpose: 展示能力全图、掌握度和推荐节点
   - Key Elements: 九个能力域、连线、状态图例、进度摘要、开始学习按钮
   - User Actions: 浏览、缩放、选择节点、继续推荐路径

2. **节点详情 / 思维导图**
   - Purpose: 展示一个能力域的子知识与前置关系
   - Key Elements: 子节点、掌握证据、学习目标、来源、进入章节按钮
   - User Actions: 选择知识点、查看状态、开始微课

3. **图文微课**
   - Purpose: 用简洁解释、图示和案例建立理解
   - Key Elements: 概念卡、示意图、产品翻译、误区、随堂停顿题
   - User Actions: 翻阅、展开解释、进入挑战

4. **挑战实验室**
   - Purpose: 完成方案选择小游戏和费曼复述
   - Key Elements: 场景约束、可选方案、复述输入、Agent 对话、五维评分卡
   - User Actions: 作答、解释、接受追问、重试

5. **案例任务与点亮结果**
   - Purpose: 展示迁移任务、掌握证据和下一步
   - Key Elements: 真实机器人案例、分析表单、证据卡、点亮动画、推荐节点
   - User Actions: 提交分析、查看反馈、返回总图

### Design Principles

- **先地图后聊天:** 聊天是学习工具，不是产品首页
- **先证据后奖励:** 动画与进度只由可查看的掌握证据触发
- **复杂但不混乱:** 全图展示广度，单次任务只聚焦一个明确目标
- **真实而不代做:** 先让用户判断，再给予分层提示和参考答案

## Technical Considerations

**Platform:** Web  
**Responsive:** Yes；桌面优先完成知识图谱体验，移动端保证可走完整流程  
**Performance Goals:**

- Load time: < 3 seconds
- Smooth animations (60fps)
- Works on 3-year-old devices

**Security/Privacy:** 模型密钥仅保存在服务端；不记录用户敏感个人信息；访客进度默认存本地；所有外部案例标注来源。  
**Scalability:** Demo 目标为 5—20 名测试用户；内容、图谱和模型接口分层，后续可迁移到持久化数据库与多模型路由。

**Browser/Device Support:**

- Chrome, Safari, Firefox (latest)
- iOS 14+, Android 10+
- Tablet optimized: Yes

## Constraints & Requirements

### Budget

- Development tools: 0—50 USD/month for the demo
- Hosting/Infrastructure: 0—25 USD/month initially
- Third-party services: usage-based model API; set per-session limits
- **Total:** Flexible; begin with free hosting plus capped API use, then decide from measured cost

### Timeline

- MVP Development: 2 days
- Beta Testing: 1 day after demo
- Launch Target: 2026-08-03

### Technical Constraints

- 必须使用可替换的模型适配层，不把学习逻辑绑定到单一模型
- 模型输出必须经过结构校验；失败时提供重试与规则化降级
- 课程内容与知识图谱使用本地结构化数据，核心事实不得在运行时自由生成
- 首版只完整实现一条学习分支
- 真实案例必须使用可引用的公开资料，不使用无法验证的营销结论

## Open Questions & Assumptions

- 假设首章选择“感知与传感器 → 传感器选择”能代表跨技术与产品判断的价值；测试后可替换
- 具体机器人案例在技术设计阶段根据公开资料和演示素材确定
- 模型供应商在实现阶段通过环境变量配置，并以固定测试集比较效果
- 正式产品如何定义行业图谱审核者、更新周期和争议处理仍待探索
- 名称“具身拼图”暂作产品名，商标与域名尚未检查

## Quality Standards

**Code Quality:**

- Use TypeScript when possible — it catches errors early
- Handle errors explicitly — don't hide them
- Test the important paths before launch

**Design Quality:**

- Use consistent colors and spacing (design tokens)
- Test on mobile before desktop
- Check accessibility basics (contrast, labels)

**What This Project Will NOT Accept:**

- Placeholder content ("Lorem ipsum") at launch
- Features that half-work — complete or cut
- Skipping mobile testing
- 没有证据的“已掌握”状态
- 模型直接代替用户完成首次答案

## Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| 两天范围失控 | High | 只做一条完整分支，其他节点只展示结构与状态 |
| 模型评分漂移或幻觉 | High | 固定评分规程、结构化输出、证据句与规则门槛 |
| 知识地图造成伪完整感 | High | 展示岗位边界、来源、版本和更新时间 |
| AI 直接代做导致学习失效 | High | 先提交、分层提示、重试后才展示参考答案 |
| 模型服务不可用 | Med | 提供内置演示反馈，确保关键路径可演示 |
| 图谱在移动端难操作 | Med | 桌面优先；移动端使用分层列表/聚焦视图降级 |
| 案例资料版权或失真 | Med | 使用官方公开信息、链接与自制示意图，不复制受限素材 |

## MVP Completion Checklist

### Development Complete

- [ ] All core features working
- [ ] Basic error handling
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Launch Ready

- [ ] Analytics configured
- [ ] Basic SEO setup
- [ ] Contact/support method
- [ ] Privacy policy & terms

### Quality Checks

- [ ] Friends & family tested
- [ ] Core journey works end-to-end
- [ ] No critical bugs
- [ ] Performance acceptable

## Next Steps

1. **Immediate:** Review and approve this PRD
2. **Next:** Create Technical Design Document (Part 3)
3. **Then:** Set up development environment
4. **Build:** Implement with AI assistance
5. **Test:** Beta with 5—10 target users
6. **Launch:** Publish the demo link

---
*Created: 2026-08-01*  
*Status: Ready for Technical Design*  
*Questions? Record them in this document's Open Questions section.*

---
## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: prd
- App name: 具身拼图
- User level: C
- Target platform: web
- Budget: flexible; start with free hosting and capped usage-based model API
- Timeline: 2 days; target 2026-08-03
- Source files: research-具身拼图.md → PRD-具身拼图-MVP.md
---
