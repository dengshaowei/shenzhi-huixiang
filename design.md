---
version: "1.0.0"
name: 身知回响 — 阳光珊瑚学习乐园
description: 暖奶油底色、杏橙与珊瑚互动色、阳光黄点亮反馈；以轻量回弹和回响圆环表达从实践到认知再回到实践的学习闭环。
colors:
  primary: "#C2410C"
  primary-soft: "#FFEDD5"
  secondary: "#FB7185"
  secondary-soft: "#FFE4E6"
  tertiary: "#FACC15"
  tertiary-soft: "#FEF9C3"
  neutral: "#FFF7ED"
  surface: "#FFFFFF"
  surface-warm: "#FFFBF5"
  on-surface: "#3B2416"
  muted: "#7C5C4A"
  line: "#F1D6C2"
  success: "#2F7D61"
  success-soft: "#DDF5E9"
  error: "#B42318"
  error-soft: "#FEE4E2"
typography:
  display:
    fontFamily: PingFang SC
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1.18
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: PingFang SC
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: -0.01em
  headline-md:
    fontFamily: PingFang SC
    fontSize: 18px
    fontWeight: 750
    lineHeight: 1.35
    letterSpacing: 0em
  headline-sm:
    fontFamily: PingFang SC
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0em
  body-lg:
    fontFamily: PingFang SC
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0em
  body-md:
    fontFamily: PingFang SC
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: PingFang SC
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-md:
    fontFamily: PingFang SC
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0em
  caption:
    fontFamily: PingFang SC
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.08em
rounded:
  sm: 10px
  md: 14px
  lg: 18px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  gutter: 14px
  page-top: 18px
  safe-bottom: 28px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  button-primary-pressed:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 14px
  card-learning:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 18px
  option-card:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  option-card-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  chip:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 8px
  status-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 10px
  status-success-dot:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: 4px
  status-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    padding: 10px
  page-background:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  body-copy:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
  feedback-card:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  divider:
    backgroundColor: "{colors.line}"
    textColor: "{colors.on-surface}"
  mindmap-root:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 16px
  mindmap-branch:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 12px
---

# 身知回响 — 阳光珊瑚学习乐园

## Overview

“身知回响”的视觉目标是让具身智能学习像一次有反馈的实践，而不是一张冷峻的技术仪表盘。整体借鉴 MotionSites 的大标题与分镜节奏、React Bits 的 Bounce Cards/Animated List/Gradient Text 动势，以及 Uiverse 的渐变按钮、卡片和点击微反馈；所有表现转译为微信原生 WXML/WXSS，不复制其品牌资产或 React 实现。

品牌情绪是**温暖、活泼、可信、鼓励行动**。暖奶油背景像练习纸，杏橙代表行动，珊瑚粉代表反馈，阳光黄代表“点亮”，绿色只用于通过与在线。视觉隐喻是“回响”：圆环、柔光和一次性扩散动画表达认知被验证后向外传播。

## Colors

- **实践橙 `primary` (#C2410C)**：主按钮、关键数字、选择边框；每屏只突出一个首要行动。
- **杏橙浅底 `primary-soft` (#FFEDD5)**：选中卡片、步骤底色和柔和强调。
- **回响珊瑚 `secondary` (#FB7185)**：装饰光斑、次级节点和反馈强调，不承载长正文。
- **点亮黄 `tertiary` (#FACC15)**：掌握、拼图点亮和进度高光。
- **暖奶油 `neutral` (#FFF7ED)**：全局页面背景；卡片使用白色 `surface` 或暖白 `surface-warm`。
- **深咖啡 `on-surface` (#3B2416)**：标题与正文主色；暖棕灰 `muted` (#7C5C4A) 用于解释与元信息。
- **通过绿 / 错误红**：只进入状态组件，禁止作为大面积品牌背景。

主按钮用深橙配白字；浅色状态底必须配深色文字。不得在珊瑚粉或点亮黄上放白色小字。

## Typography

只使用微信系统可用的 `PingFang SC` 并回退到系统中文字体。标题以 700–800 字重形成友好而坚定的节奏；正文保持 400，避免整页粗体。首页 display 为 28px，页面标题 24px，卡片标题 16–18px，正文 14–15px，标签 11–14px。英文眉题只作短标签，使用宽字距但不超过一行。

## Layout

移动端单列为主，页面水平安全边距 14px，顶部 18px，底部叠加安全区。卡片间距 11–16px，区块间距 24px。总思维导图使用“中心主题 → 四个部分 → 九个领域”的纵向树，领域思维导图使用“领域 → 模块 → 核心知识词”的纵向树；同级领域可双列，但连接关系必须持续可见。所有固定底部按钮避开 Tab Bar 与安全区。

页面覆盖：Home 使用品牌 Hero、进度叠卡和四步节点；Knowledge Map 使用总思维导图，Domain 使用模块级小思维导图和详情卡；Learning Companion 使用上下文栏、对话气泡和来源卡；Challenge 使用任务卡；Lesson 使用章节色带与知识来源卡；Feynman/Case 使用可选择方案卡、输入区和反馈卡；Profile 使用回响进度圆环、证据列表和云端状态卡。

## Elevation & Depth

层级以白色卡片、暖色描边和单层柔和阴影表达。标准卡片阴影为 `0 10px 28px rgba(124, 70, 30, 0.10)`；悬浮主行动可加深至 `0 12px 30px rgba(194, 65, 12, 0.20)`。禁止冷蓝黑重阴影、多层霓虹和持续发光。

## Shapes

卡片统一 18–24px 圆角，按钮 18px，输入框 18px，标签与状态胶囊 9999px。进度、点亮和 Agent 状态使用圆形/圆环。允许少量卡片以 1–2deg 轻微错位形成活泼叠卡，但正文容器保持水平以保证阅读。

## Components

- **Primary Button**：深橙底、白字、18px 圆角；按下缩放到 0.97 并切深咖啡色，180ms 回弹。
- **Secondary Button**：浅杏底、深橙字，不使用冷色描边。
- **Learning Card**：白底、暖色细边和单层柔影；按内容选择橙/粉/黄顶部装饰，不用随机色。
- **Option Card**：暖白默认；选中后浅杏底、深橙边、圆形勾选；已提交时取消持续动效。
- **Input Field**：白底、暖棕边、深咖啡文字；焦点用橙色边，不靠阴影表达。
- **Chip/Status**：胶囊形。离线用阳光黄浅底，在线/通过用绿色浅底，错误用红色浅底。
- **Progress Echo**：三层同心圆，中心显示百分比；只在值变化或节点点亮时扩散一次。
- **Loading**：浅杏色块的低频呼吸；**Empty**：圆形暖色图形 + 标题 + 单一主按钮；**Error**：浅红状态卡 + 重试按钮；**Forbidden/Locked**：暖灰卡 + 锁图标 + 返回可执行路径；**Offline**：黄色浅底提示，核心学习路径继续可用。

动效时长以 180–320ms 为主。列表首次出现可按 40ms 递增；节点点亮只播放一次。系统开启减少动态效果时，取消位移、缩放和循环动画，仅保留颜色与透明度变化。

## Do's and Don'ts

- **Do** 用奶油底、暖白卡和橙/珊瑚/黄三色建立学习乐园感。
- **Do** 每次交互给出清楚的按下、选中、通过或重试反馈。
- **Do** 保持规则、来源和掌握证据高可读，动效不能遮挡事实。
- **Do** 让所有动画可被减少动态设置关闭，并保证触控区域不小于 44px。
- **Don't** 使用 WebGL、鼠标跟随、持续粒子、磁吸 hover 或依赖 React 的组件代码。
- **Don't** 回到深蓝科技大屏、霓虹描边或大面积黑底。
- **Don't** 同屏使用超过三个高饱和强调色，也不要让每张卡片随机换色。
- **Don't** 让 Agent 输出直接控制点亮；视觉庆祝只能跟随确定性掌握结果。
