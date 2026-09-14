# 身知回响项目复现 FAQ

## 没有模型 Key 能运行吗？

可以。优先运行 `/agent` Web Demo，它完全使用本地内容与规则。小程序核心学习路径也有本地降级；在线问答和项目文件分析才需要模型密钥。

## 为什么微信开发者工具提示 AppID 不可用？

公开包默认使用 `touristappid`。游客模式只适合本地体验。真机、上传和发布需要替换为你自己的小程序 AppID。

## CloudBase 环境在哪里配置？

将 `miniprogram/config/cloud.ts` 中的 `your-cloudbase-env-id` 替换为自己的环境 ID，并在部署时设置 `CLOUDBASE_ENV_ID`。

## 模型密钥放在哪里？

只放在 `studyChat` 和 `analyzeProject` 云函数的环境变量中。不要写入小程序、提交到Git，也不要发送到客户端。

## 为什么云函数调用失败？

依次检查：小程序与云环境权限、环境ID、函数是否部署、函数环境变量、网络、超时和返回结构。即使云端失败，本地学习路径也不应中断。

## 为什么模拟器全部白屏或出现500？

检查 `project.private.config.json` 中的 `cloudfunctionRoot`。部分开发者工具版本会将它写成数组；改回字符串 `"cloudfunctions/"` 后重启开发者工具。

## 如何使用自己的知识库？

把有权使用的DOCX放进 `knowledge-source/`，文件名使用 `001 标题.docx` 格式，然后运行：

```bash
python3 scripts/build-robot-knowledge-base.py --source knowledge-source
```

不要公开无授权资料。

## 如何确认Web Demo复现成功？

`npm install`、`npm test`、`npm run lint`、`npm run typecheck` 和 `npm run build`均通过；随后打开 `/agent`，完成提问、挑战、费曼解释和节点点亮。

## 哪些内容已经从公开包删除或替换？

真实AppID、CloudBase环境ID、API Key、个人电脑路径、运行日志、用户文件和原私人知识库。云函数仅保留两条公开示例知识。

## Demo现场网络失败怎么办？

直接使用Web本地Demo，或播放录屏。演示时优先走固定输入，避免依赖临时网络和第三方模型状态。

