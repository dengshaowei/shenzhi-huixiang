# 小程序从开发到上架 · 全流程手册

> 以「身知回响」（具身智能学习小程序）的真实实践整理，2026-08。
> 技术栈：微信小程序原生（TypeScript）+ 腾讯云开发 CloudBase 云函数 + DeepSeek 大模型 + 本地单元测试（Vitest）。
> 适用读者：想独立开发并上架一个"AI + 知识库"类小程序的个人开发者。

---

## 〇、全流程总览

```
① 账号资质      ② 项目初始化     ③ 知识库工程化    ④ 云函数开发部署
小程序注册/备案   原生TS项目结构    文档→索引脚本     tcb CLI 部署/验证
云开发环境(付费)  五Tab页面骨架    JSON塞进云函数     环境变量管理
DeepSeek API key                           客户端不存原文
        ↓               ↓                ↓                ↓
⑤ 客户端开发  →  ⑥ 测试门禁  →  ⑦ 上传提审  →  ⑧ 发布与运营
云端优先+离线降级   单测/lint/类型   cli upload      体验版真人测试
确定性掌握判定     模拟器自动化     mp后台提交审核    盯成本与日志
```

整个项目从第一天写代码到发布上线，实际耗时约 7 天（含等备案、等审核）。

---

## 一、前期准备：账号与资质（最耗时，最先做）

| 事项 | 在哪办 | 说明 |
| --- | --- | --- |
| 注册小程序 | mp.weixin.qq.com | 拿到自己的 AppID |
| 小程序备案 | mp 后台 → 设置 | **必须**，周期数天，尽早提交 |
| 选定服务类目 | mp 后台 | 教育/工具类，提审时要一致 |
| 开通云开发 | 腾讯云 CloudBase 控制台 | 创建并记录自己的环境 ID |
| 大模型 API key | DeepSeek 开放平台 | 只放云函数环境变量，**绝不进客户端** |
| 微信开发者工具 | 官网下载 | 稳定版即可 |

⚠️ **账号主体坑**：我们踩过最绕的坑——小程序注册在 A 微信号下，付费云环境买在 B 微信号下，导致小程序端调云函数一直无权限。解法：CloudBase 控制台给环境开**「环境共享」**，授权给小程序所属账号。两个账号的登录态在微信开发者工具里很容易混，扫码登录时务必确认显示的是哪个账号。

---

## 二、项目初始化

```bash
# 项目同时包含 Next.js Web 版和原生小程序版，小程序在 miniprogram/
npm install
```

目录结构（feature-based）：

```
miniprogram/           # 小程序端
  app.ts / app.json    # 入口：wx.cloud.init + 知识库后台预热
  config/cloud.ts      # 云环境 ID、函数名常量
  core/                # 纯逻辑：内容、进度、掌握判定、云返回解析（全部可单测）
  services/            # 云调用封装、进度存储、知识库三级就绪
  knowledge/           # 知识库仓储 + 8 条自写离线摘要（兜底）
  pages/               # 5 个 Tab：首页/拼图/学习伙伴/挑战/我的
cloudfunctions/        # 云函数：healthCheck / knowledgePack / studyChat / analyzeProject
scripts/               # 知识库索引构建脚本（Python）
cloudbaserc.json       # tcb CLI 的函数配置（运行时、超时、环境变量占位）
```

关键设计决策（后来证明都对）：

1. **掌握判定由本地确定性规则完成**，大模型只负责讲解——模型输出永远不能点亮拼图、不能解锁关卡。
2. **客户端不存知识库原文**（700KB 内参 → 包体超限且泄露内容），只留 8 条团队自写离线摘要兜底。
3. **一切外部返回都用解析函数校验**（`parseStudyChatReply` 等），非法字段直接丢弃。

---

## 三、知识库工程化（私有内容 → 服务端私有 API）

125 篇《机器人产品内参》DOCX → 结构化索引：

```bash
# 确定性索引脚本：DOCX → 485 个知识片段（chunk）→ knowledge.json
python3 scripts/build-robot-knowledge-base.py
# 产物同时拷给 knowledgePack 和 studyChat 两个云函数包内
```

云函数 `knowledgePack` 提供分页私有接口（每页 160 条，共 4 页），客户端三级就绪：

```
内存已有 → 本地缓存（storage）→ 云端分页拉取 → 都失败则用 8 条离线摘要
```

好处：原文只在服务端，客户端包体从 ~1.1MB 降到 200KB 以内，断网也能学。

---

## 四、云函数开发与部署

### 4.1 函数清单

| 函数 | 作用 | 超时 | 环境变量 |
| --- | --- | --- | --- |
| `healthCheck` | 健康检查 | 10s | 无 |
| `knowledgePack` | 知识库分页接口 | 10s | 无 |
| `studyChat` | 学习伙伴 Agent（检索 + DeepSeek 工具循环） | 60s | `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL` |
| `analyzeProject` | 项目文档解析 Agent | 60s | 同上 |

### 4.2 部署工具：tcb CLI（不要用开发者工具的云面板）

开发者工具的云开发面板对跨账号共享环境各种不可用，最终全部走腾讯云 `tcb` CLI：

```bash
# 安装后建议直接用绝对路径调用，绕开 npx 的交互确认卡顿
TCB=$(npm root -g)/@cloudbase/cli/bin/tcb   # 或 npx 缓存路径

$TCB login            # 浏览器授权登录，凭据会过期，过期后重新跑一遍即可

# 部署（注意：密钥必须内联传，见下面的坑）
DEEPSEEK_API_KEY=sk-你的key $TCB fn deploy studyChat -e 你的环境ID --force

# 远程验证（tcb fn log 已废弃，用 invoke 实测）
$TCB fn invoke studyChat -e 你的环境ID \
  --params '{"question":"激光雷达是什么","level":"rookie"}'
```

⚠️ **密钥覆盖坑**：`--force` 部署会用 `cloudbaserc.json` 的 `envVariables` **整体覆盖**云端环境变量。文件里写的是 `{{env.DEEPSEEK_API_KEY}}` 占位符，如果部署时 shell 里没传这个变量，云端密钥就被抹掉了。所以部署命令必须内联真实密钥。

### 4.3 学习伙伴 Agent 的演进

- v1：单轮"检索 + 回答"，用户说像直接查知识库。
- v2（现版）：真 Agent 工具循环——模型每步自己决定输出 `{"action":"tool","tool":"search_knowledge"|"get_curriculum_outline"}` 或 `{"action":"answer",...}`，最多 3 轮 / 2 次工具；客户端提问时上传学习者进度（微课/挑战/拼图/案例状态），回答页显示 ⚡行动标签（"查看了课程地图"）让 Agent 的工作可见。
- 模型调用失败自动重试一次（间隔 1.2s），仍失败返回 `mode:"fallback"`，客户端诚实降级为本地回答并标注。

---

## 五、客户端开发要点

1. **云端优先 + 三级降级**：问学习伙伴 → 云函数（DeepSeek）→ 失败自动切本地检索回答，界面标注来源（"云端回复"/"离线模式"）。
2. **进度全本地**（storage 仓储），无账号体系；学习背景三档（小白/产品/技术）每次提问实时读取，切换立即生效。
3. **新手引导**：首启三屏（事故钩子 → 玩法 → 选背景），引导期 `wx.hideTabBar()` 强制走完。
4. **趣味性**：激光雷达互动模拟器（Canvas 演示雷达/黑夜/反光失效边界）、首次点亮/迁移的撒花庆祝层（纯 WXSS）。
5. **注意 Canvas 的 dpr 缩放**，否则画面缩在左上角。

---

## 六、测试与质量门禁（每次上传前必跑）

```bash
npm test                 # Vitest，42 个用例（纯逻辑全部可测）
npm run lint             # ESLint 零警告
npm run typecheck        # Web 端严格类型
npm run typecheck:mini   # 小程序端严格类型
# WXSS 用开发者工具自带的 wcsc 校验：
/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec/wcsc -cpp <file.wxss>
```

模拟器自动化回归（不依赖肉眼）：

```bash
# miniprogram-automator 装在项目外（/tmp/auto-test），别装进项目依赖
/Applications/wechatwebdevtools.app/Contents/MacOS/cli auto --project <项目路径> --auto-port 9421
# 然后脚本 connect：reLaunch 各页面、收集 console 错误、callMethod 模拟提问/提交、截图
```

---

## 七、上传与提审

```bash
# 1. 上传开发版本（完全命令行，不用开 IDE）
/Applications/wechatwebdevtools.app/Contents/MacOS/cli upload \
  --project <项目路径> -v 1.2.3 -d "本次改动说明"
```

2. mp.weixin.qq.com → 管理 → 版本管理 → 开发版本 → **提交审核**：
   - 类目与备案一致；功能页面填首页 `pages/home/index`；
   - 审核备注模板（AI 类小程序建议写清楚）：

     > 本小程序为具身智能产品学习工具。学习伙伴回答由服务端调用已完成备案的 DeepSeek 模型生成，内容基于服务端私有知识库，仅用于学习辅导；用户内容不对外展示。掌握判定由本地规则完成，非模型生成。测试路径：学习伙伴 Tab → 输入"激光雷达怎样帮助机器人避障？"。

3. 隐私协议：mp 后台 → 设置 → 服务内容声明 → 用户隐私保护指引，按实际勾选（项目导入功能会上传文件到云存储，需如实声明）。
4. 审核通过 → 点「发布」。

---

## 八、发布之后

- 体验版二维码先给 2-3 个目标用户完整走一遍学习闭环再正式发布。
- 盯 DeepSeek 调用量与费用；云函数日志用 `tcb fn invoke` 实测 + 控制台监控。
- 已知待办：分享卡片（`onShareAppMessage`/`onShareTimeline`）未配置，用户无法转发。

---

## 九、踩坑清单（每条都是真金白银）

1. **跨账号环境共享**：小程序账号 ≠ 云环境账号时，必须开 CloudBase「环境共享」，否则客户端调用永远失败；开发者工具扫码登录时注意确认登录的是哪个微信号。
2. **`cloudfunctionRoot` 数组坑**：在 IDE 的 GUI 里绑定云环境，会把 `project.private.config.json` 的 `cloudfunctionRoot` 写成对象数组，导致**模拟器所有页面编译 500 白屏**（CLI 上传不受影响）。修复：手动改回字符串 `"cloudfunctions/"`，并且**别再在 GUI 里绑环境**。
3. **`tcb fn deploy --force` 覆盖云端环境变量**：部署必须内联密钥（见 4.2）。
4. **npx 卡交互确认**：CI/脚本里调用 tcb 用绝对路径，别走 npx。
5. **`tcb fn log` 已废弃**：远程验证用 `tcb fn invoke --params '...'`。
6. **代理残留**：Clash 等代理（如 127.0.0.1:7893）会让 `cli upload` 报 ECONNRESET，重启开发者工具主进程即可（它会缓存启动时的代理）。
7. **微信缓存**：开发者工具里"不清缓存编译"可能拿到旧的登录态/页面，排查问题时先清缓存。
8. **大模型偶发抖动**：单次要约 5-7 秒，偶发 5xx；云函数内加一次重试 + 客户端必须有不依赖模型的降级路径，体验才不会崩。
9. **WXML 不支持 `{'\n'}` 插值**，会原样显示；不常见 emoji 在部分机型显示异常，用常见的。
10. **fixed 遮罩层被压**：全局样式里 `.page-shell > view { position:relative; z-index:1 }` 这类规则会压掉页面内一切 fixed 弹层，弹层要移出该容器。

---

## 十、日常迭代 SOP（一页纸速查）

```bash
# 1. 改代码（客户端 / 云函数）
# 2. 质量门禁
npm test && npm run lint && npm run typecheck && npm run typecheck:mini
# 3. 云函数有改动：部署 + 远程实测
DEEPSEEK_API_KEY=sk-你的key $TCB fn deploy <函数名> -e <环境ID> --force
$TCB fn invoke <函数名> -e <环境ID> --params '{"question":"测试问题","level":"rookie"}'
# 4. 模拟器自动化回归（可选但推荐）
/Applications/wechatwebdevtools.app/Contents/MacOS/cli auto --project <项目路径> --auto-port 9421
# 5. 上传 + 提审
/Applications/wechatwebdevtools.app/Contents/MacOS/cli upload --project <项目路径> -v X.Y.Z -d "改动说明"
# → mp 后台提交审核 → 通过 → 发布
# 6. 更新 MEMORY.md 记录里程碑
```
