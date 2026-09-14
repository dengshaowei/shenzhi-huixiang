# Product Requirements Document: 身知回响微信小程序 MVP

## Overview

**Product Name:** 身知回响微信小程序  
**Problem Statement:** 帮助已有一定产品或技术基础、但具身智能知识零散的学习者，在微信内用 8—15 分钟完成一次“学习—作答—解释—反馈—点亮—迁移”闭环，并看见可信的岗位能力证据。  
**MVP Goal:** 交付一个可导入微信开发者工具、无需模型 Key 也能跑通完整路径的原生小程序；首版完整实现“感知与传感器 → 传感器选择”，并调用用户本地“机器人产品内参”知识库。  
**Target Launch:** 2026-08-03 本地可用版；体验版发布时间取决于项目方 AppID。

## Target Users

### Primary User Profile

**Who:** 会使用常见 AI 工具、有产品或技术基础，希望转向或胜任具身智能产品工作的人。  
**Problem:** 看过文章、课程和机器人案例，但不知道知识边界，也不能稳定解释传感器选择的因果、边界和产品取舍。  
**Current Solution:** 收藏文章、观看课程、记笔记、用通用大模型问答或凭课程完成率判断掌握。  
**Why They'll Switch:** 身知回响从真实实践问题出发，把岗位能力地图、短微课、先作答后反馈、确定性掌握门槛和真实案例迁移放进一个可重复的微信学习闭环，让实践产生认知，让认知形成回响。

### User Persona: 林知远

- **Demographics:** 22—38 岁，中国大陆，产品经理、开发者、AI 从业者或跨行学习者
- **Tech Level:** 中级
- **Goals:** 建立具身智能产品岗位的全局认知，并能在机器人方案中说明技术取舍
- **Frustrations:** 内容碎片化、术语多、看完容易忘、通用模型容易代答、缺少可信掌握证据

## User Journey

### The Story

林知远在通勤时打开小程序，从“首页”继续上次学习。他进入“拼图”，看到九个岗位能力域和自己的状态；选择“感知与传感器”后完成传感器选择微课与约束挑战，再用自己的话解释选择依据。系统先用透明的规则版评估器检查关键概念、因果关系和误区，满足固定门槛后点亮节点并保存证据。随后他在“挑战”中完成一个仓储移动机器人案例，把刚学到的知识用于产品判断；“我的”页面保留掌握记录、内容版本和重置入口。

### Key Touchpoints

1. **Discovery:** 体验二维码、具身智能社群或演示分享
2. **First Contact:** 首页直接展示完成度、继续学习和四步闭环
3. **Onboarding:** 无需登录，默认访客模式；说明本地保存和合成案例
4. **Core Loop:** 知识地图 → 领域目录 → 微课/Agent 对话 → 选择挑战 → 费曼复述 → 反馈/重试 → 点亮 → 案例迁移
5. **Retention:** 首页继续学习、待重试任务、掌握证据和下一步推荐

## MVP Features

### Core Features (Must Have)

#### 1. 五 Tab 原生导航

- **Description:** 首页、知识地图、学习伙伴、挑战、我的五个稳定入口。
- **User Value:** 用户随时知道当前在哪、下一步做什么，并能从学习回到证据。
- **Success Criteria:**
  - 五个 Tab 可正常切换且状态一致
  - 微课、作答、反馈和案例使用二级页面，不拆散任务
  - 当前进度在切换 Tab 和重启后保留
- **Priority:** Critical

#### 2. 九域岗位知识地图

- **Description:** 总思维导图按“中心主题 → 四个部分 → 九个领域”展示能力全貌；每个领域详情继续按“领域 → 模块 → 核心知识词”展示小思维导图，并提供目标、结果、前置建议、预计时间和知识库依据。
- **User Value:** 初学者不仅知道岗位知识边界，还能在开始前看清具体要学什么。
- **Success Criteria:**
  - 九个一级能力域完整展示
  - 九个领域均可进入详情并查看目录
  - “感知与传感器”可进入完整课程，其余领域明确标记为目录预览
  - 已掌握、学习中、可开始和待开放状态可区分
- **Priority:** Critical

#### 3. 上下文学习伙伴

- **Description:** 用户可以从知识地图或微课携带当前知识点进入连续文字对话；本地 Agent 检索“机器人产品内参”，返回解释、追问和来源。
- **User Value:** 用户可以在困惑发生的位置立即追问，不需要重新描述学习上下文。
- **Success Criteria:**
  - 对话明确展示当前领域和知识点
  - 支持连续多轮文字输入和快捷问题
  - 有知识依据时展示命中标题、摘录和源文件
  - 无命中时明确停止扩展，不编造答案
  - 对话不能直接改变掌握状态
- **Priority:** Critical

#### 4. 传感器选择图文微课

- **Description:** 用学习目标、类比、概念卡、决策步骤、误区和来源说明传感器选择。
- **User Value:** 用户能把传感器参数翻译为场景和产品约束。
- **Success Criteria:**
  - 内容无需联网即可阅读
  - 课程页面调用“机器人产品内参”索引，展示命中的知识片段与源文件
  - 用户可标记完成并进入挑战
  - 首次提交前不显示参考答案
- **Priority:** Critical

#### 5. 互动挑战、费曼复述与规则反馈

- **Description:** 用户先完成约束式方案选择，再提交不少于最小长度的费曼复述；系统按固定规则返回证据、缺口和关键误区。
- **User Value:** 用户验证自己能否解释“为什么”，而非只认出术语。
- **Success Criteria:**
  - 选择题与复述均有输入校验和明确错误提示
  - 规则版评估明确标注，不伪装为完整语义模型
  - 本地学习 Agent 会检索“机器人产品内参”，把知识依据和针对性追问返回给用户
  - 关键误区或挑战失败时不可点亮
  - 用户可根据反馈重试
- **Priority:** Critical

#### 6. 掌握证据、点亮与案例迁移

- **Description:** 达到固定门槛后点亮节点、保存证据，并解锁仓储移动机器人案例。
- **User Value:** 用户能解释自己为何被判定掌握，并把知识迁移到真实工作语境。
- **Success Criteria:**
  - 点亮结果可追溯到挑战、复述证据和规则版本
  - 进度保存在本地并在重启后恢复
  - 案例要求用户先选择方案并说明理由，再显示反馈
- **Priority:** Critical

## Out of Scope (Not in MVP)

| Feature | Why Wait | Planned For |
|---|---|---|
| 微信授权登录和跨设备同步 | 首版不需要个人信息或数据库 | 验证跨设备需求后 |
| 全九域课程 | 首版先证明一条完整闭环 | 内容审核能力建立后 |
| 开放式联网 RAG、用户上传文档 | 本地内参已经以只读索引接入；开放上传仍存在授权和隐私风险 | 单独立项 |
| 模型直接决定点亮 | 不稳定且不可解释 | 永不采用 |
| 支付、排行榜、社交 | 与核心学习假设无关 | 产品验证后 |

## Success Metrics

### Primary Metrics

1. **闭环完成率：** 5 位目标测试者中至少 4 位无需讲解完成“微课 → 挑战 → 复述 → 点亮 → 案例”
   - How to measure: 现场观察和本地完成状态
   - Why it matters: 证明小程序流程可独立使用
2. **判定可解释率：** 5 位测试者中至少 4 位能说出节点为何点亮或未点亮
   - How to measure: 测试后口头复述
   - Why it matters: 区别于黑箱式 AI 打分

### Secondary Metrics

- 完整闭环耗时：8—15 分钟
- 首次失败维度二次作答改善率：至少 60%
- 阻塞性错误：0

## UI/UX Direction

**Design Feel:** 奶油暖底、珊瑚橙主操作、清晰、活泼、可解释、带轻量回响反馈  
**Inspiration:** 岗位技能树、任务清单和学习进度卡，但避免复杂游戏化。

### Key Screens

1. **首页**
   - Purpose: 汇总进度并让用户一键继续
   - Key Elements: 欢迎区、完成度、继续学习、四步闭环、下一步推荐
   - User Actions: 继续微课、查看知识地图、询问学习伙伴、进入挑战
2. **知识地图与领域详情**
   - Purpose: 展示九域能力全图和每个领域的具体学习目录
   - Key Elements: 总思维导图、领域小思维导图、领域目标、学习结果、模块目录、内参依据
   - User Actions: 查看任意领域、选择知识点、询问 Agent、进入已开放课程
3. **学习伙伴**
   - Purpose: 围绕当前知识点进行连续、可追溯的学习对话
   - Key Elements: 上下文栏、消息流、快捷问题、知识库来源、输入框
   - User Actions: 提问、追问、切换知识点、进入微课或挑战
4. **微课与挑战**
   - Purpose: 完成学习和掌握评估
   - Key Elements: 内容卡、约束卡、选择项、文本输入、证据反馈
   - User Actions: 阅读、选择、复述、提交、重试
5. **挑战**
   - Purpose: 汇总待完成挑战和案例迁移
   - Key Elements: 当前挑战、案例卡、解锁状态
   - User Actions: 继续挑战、进入案例
6. **我的**
   - Purpose: 查看累计证据和本地数据说明
   - Key Elements: 掌握记录、内容版本、隐私说明、重置进度
   - User Actions: 查看证据、重置 Demo

### Design Principles

- **移动优先：** 单列内容、足够触控面积、底部主操作
- **先做后看：** 首次提交前不出现答案或完整反馈
- **证据优先：** 状态旁始终能找到判定依据
- **离线可用：** 核心内容和规则不依赖网络

## Technical Considerations

**Platform:** 微信原生小程序  
**Responsive:** Mobile-first  
**Performance Goals:** 首屏本地内容快速显示；交互无明显卡顿；兼容常见近三年手机。  
**Security/Privacy:** 访客模式，不读取微信个人资料；回答和进度默认仅存本地；无客户端密钥。  
**Scalability:** MVP 只验证单用户本地闭环；跨设备和服务端数据后置。  
**Device Support:** 微信开发者工具稳定基础库及常见 iOS/Android 微信客户端；平板不是首版优化重点。

## Constraints & Requirements

### Budget

- Development tools: 使用现有 Codex 和微信开发者工具
- Hosting/Infrastructure: 本地版为 0；体验版可从腾讯云免费/试用额度开始
- Third-party services: 首版无强依赖
- **Total:** 无模型离线版可保持 0 增量服务成本

### Timeline

- MVP Development: 当前迭代完成可导入版
- Beta Testing: 1—2 天，5 位目标用户
- Launch Target: 获得 AppID 后上传体验版

### Technical Constraints

- TypeScript 严格模式；禁止 `any`
- 版本化课程内容与“机器人产品内参”只读索引；模型不得生成或修改课程事实
- 确定性掌握门槛；模型不得直接点亮
- 不使用数据库、登录、向量数据库、开放上传、支付或多 Agent
- 必须在无模型 Key 时完整可用

## Open Questions & Assumptions

- 假设首版继续面向中级学习者，已由产品负责人确认。
- 正式体验版 AppID、主体和发布审核由项目方提供；不阻塞本地可用版。
- 真实模型和 CloudBase 接入是后续增强，不纳入本次“可使用”验收。

## Quality Standards

**Code Quality:** 严格 TypeScript；业务规则与页面分离；核心规则有单元测试；错误明确呈现。  
**Design Quality:** 统一设计令牌；触控区域清晰；文字对比度充足；无占位文案。  
**What This Project Will NOT Accept:** 半成品入口、伪造真实用户数据、无依据的课程事实、模型失败后默认通过、把密钥放在客户端。

## Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| 没有 AppID 无法真机发布 | Medium | 使用 `touristappid` 完成本地导入；README 说明替换步骤 |
| 模型或网络不可用 | High | 内置透明的规则版评估器和本地课程 |
| 小屏知识地图拥挤 | Medium | 使用双列领域卡和独立详情页，不照搬 Web 画布 |
| 规则误判自由表达 | Medium | 显示命中证据，允许重试；后续用受限模型增强，不改变门槛 |
| 本地数据被清理 | Low | 明确提示本地保存；跨设备同步后置 |

## MVP Completion Checklist

### Development Complete

- [x] 五 Tab 可切换
- [x] 九域知识地图与领域详情可浏览
- [x] 学习伙伴可携带知识点上下文连续对话
- [ ] 传感器微课可完成
- [ ] 挑战、复述、反馈和重试可用
- [ ] 点亮、证据、案例和本地保存可用

### Launch Ready

- [ ] 微信开发者工具可导入和编译
- [ ] 无 Key 完整闭环通过
- [ ] README、隐私说明和示例数据齐全
- [ ] 获得 AppID 后完成体验版真机测试

### Quality Checks

- [ ] 核心规则测试通过
- [ ] TypeScript 类型检查通过
- [ ] 无硬编码密钥或个人信息
- [ ] 正常、错误、重试和重置路径通过

## Next Steps

1. 生成小程序技术设计和开发说明
2. 初始化原生小程序结构
3. 先完成五 Tab、知识地图、学习伙伴和本地进度
4. 再完成微课、挑战、点亮和案例
5. 在微信开发者工具中导入并真机预览

---
*Created: 2026-08-03*  
*Status: Approved for implementation*  
*Owner: 身知回响项目*

---
## Handoff Context
<!-- Machine-readable summary for the next workflow step. Do not delete; the next prompt in the workflow reads this block. -->
- Stage: prd
- App name: 身知回响微信小程序
- User level: C
- Target platform: WeChat native mini program
- Budget: offline MVP has no incremental service cost; optional cloud/model usage later
- Timeline: immediately deliver an importable local MVP; trial release after AppID is available
- Source files: research-具身拼图.md → PRD-具身拼图-MVP.md → specs/wechat-mini-program-decisions.md → PRD-具身拼图微信小程序-MVP.md
---
