# Tech Stack & Tools

- **Frontend:** WeChat native mini-program WXML/WXSS with strict TypeScript
- **Backend:** Tencent CloudBase event functions; local behavior remains the required fallback
- **Database:** Local `wx.getStorageSync` / `wx.setStorageSync` remains active; CloudBase persistence is the next milestone
- **Knowledge Base:** Generated TypeScript index from the local “机器人产品内参” DOCX directory
- **Agent:** Local `LearningAgent` orchestrating retrieval, rule evaluation and follow-up questions
- **Styling:** Native WXSS with the warm “阳光珊瑚学习乐园” tokens in `app.wxss`; `../../design.md` is the visual source of truth
- **Authentication:** Visitor mode only; no WeChat profile data is collected
- **Testing:** Root Vitest configuration for pure business modules
- **Development:** WeChat DevTools importing the repository root

## Error Handling Pattern

```ts
try {
  progressRepository.save(nextProgress);
  this.setData({ saveError: "" });
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "进度保存失败，请重试";
  this.setData({ saveError: message });
}
```

## Styling & Component Example

```xml
<view class="card">
  <text class="eyebrow">当前任务</text>
  <text class="title">传感器选择</text>
  <button class="primary-button" bindtap="continueLearning">继续学习</button>
</view>
```
