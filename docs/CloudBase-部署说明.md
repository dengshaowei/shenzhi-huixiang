# 身知回响 CloudBase 部署说明

## 当前环境

- 环境 ID：使用复现者自己创建的 CloudBase 环境 ID
- 地域：上海 `ap-shanghai`
- 套餐：个人版
- 配置文件：仓库根目录 `cloudbaserc.json`

环境 ID 不是密钥，可以进入版本管理。AppSecret、API Key、SecretId 和 SecretKey 不得写入项目。

## 已部署资源

### `healthCheck` 云函数

- Runtime：Node.js 20.19
- 内存：256 MB
- 超时：10 秒
- 作用：验证小程序与 CloudBase 后台是否连通

部署和验证：

```bash
npx --yes --package @cloudbase/cli tcb login
npx --yes --package @cloudbase/cli tcb fn deploy healthCheck
npx --yes --package @cloudbase/cli tcb fn invoke healthCheck --json
```

### `analyzeProject` 云函数

- Runtime：Node.js 20.19
- 内存：512 MB
- 超时：60 秒
- 已部署：2026-08-04
- DeepSeek 状态：已配置并完成远程项目分析验证（2026-08-04）
- 作用：解析 PDF、DOCX、Markdown、TXT，调用 DeepSeek 生成项目学习计划；未配置 Key 或模型失败时返回规则降级计划
- 隐私：小程序取得腾讯云临时下载地址供云函数读取，函数返回或失败后由小程序立即删除临时对象

部署：

```bash
npx --yes --package @cloudbase/cli tcb fn deploy analyzeProject --force
```

在腾讯云控制台进入 `analyzeProject → 函数配置 → 环境变量`，添加：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
```

不要把真实 Key 写入 `cloudbaserc.json`、`.env.example`、小程序代码或聊天记录。修改环境变量后重新部署或发布函数版本，再用一个不含敏感信息的示例文件测试。

## 小程序接入

`miniprogram/app.ts` 使用固定环境 ID 初始化 `wx.cloud`。`miniprogram/services/cloud-service.ts` 是页面访问云函数的唯一入口，外部返回值必须经过运行时校验。

本地规则 Agent 和本地进度仍然保留。云端不可用时，学习主流程不得被阻断。

上传体验版前必须：

1. 本地体验可使用根目录 `project.config.json` 中的 `touristappid`；真机和上传时替换为自己的 AppID。
2. 在微信开发者工具中确认该 AppID 可以访问上述 CloudBase 环境。
3. 打开“我的”，确认“CloudBase 后台”显示“已连接”。

## 后续资源顺序

1. 为 `analyzeProject` 增加按微信用户和时间窗口的调用限频。
2. 建立学习记录集合与最小权限规则，实现可选跨设备同步。
3. 将私有知识索引迁移到云端知识库或受保护的云存储。
4. 增加 DeepSeek 调用费用监控和每日预算告警。
