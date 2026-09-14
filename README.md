# 身知回响｜可复现源码

“身知回响”是一款面向具身智能产品与技术学习者的 AI 教育 Demo。它通过能力地图、图文微课、挑战、费曼复述、确定性掌握判定和案例迁移，验证学习者是否真正形成了产品判断能力。

本公开包已经脱敏：

- 微信 AppID 使用游客模式；
- CloudBase 环境 ID 使用占位符；
- 不包含 API Key、个人路径、用户文件或运行日志；
- 原私人知识库已替换为两条公开示例知识；
- Web 核心路径不需要模型 Key。

## 1. 最快复现：Web Demo

### 环境

- Node.js 20 或更高版本
- npm

### 安装与启动

```bash
git clone https://github.com/dengshaowei/shenzhi-huixiang.git
cd shenzhi-huixiang
npm install
npm run dev
```

打开：

- 首页：<http://localhost:3000>
- 完整 Agent Demo：<http://localhost:3000/agent>

固定体验路径：

1. 向“小响”提问传感器选择问题；
2. 查看回答导图和实际命中的课程依据；
3. 完成仓储 AMR 方案挑战；
4. 用自己的话进行费曼解释；
5. 根据五维证据反馈补充答案；
6. 达标后点亮拼图。

Web Demo 在浏览器本地运行，不上传对话、不调用在线模型，并使用 `localStorage` 保存进度。

## 2. 运行质量检查

```bash
npm test
npm run lint
npm run typecheck
npm run typecheck:mini
npm run build
```

全部通过即表示 Web 代码、小程序 TypeScript 和核心规则能够正常复现。

## 3. 微信小程序复现

1. 安装微信开发者工具。
2. 选择“导入项目”，目录选择仓库根目录。
3. `project.config.json` 默认使用 `touristappid`，可直接本地编译。
4. 如需真机、上传或云能力，把游客 AppID 替换成自己的小程序 AppID。
5. 如需云函数，把 `miniprogram/config/cloud.ts` 中的 `your-cloudbase-env-id` 替换成自己的环境 ID。
6. 没有云环境时，学习主流程仍可使用本地课程、示例知识和确定性规则。

详细说明见 [小程序 README](./miniprogram/README.md)。

## 4. 可选云端能力

云端能力包括：

- `healthCheck`：连接检查；
- `knowledgePack`：示例知识库分页；
- `studyChat`：基于知识检索的模型回答；
- `analyzeProject`：临时项目文档分析。

准备：

```bash
export CLOUDBASE_ENV_ID='你的环境ID'
export DEEPSEEK_API_KEY='你的模型密钥'
```

不要把真实密钥写进仓库。部署前阅读 [CloudBase 部署说明](./docs/CloudBase-部署说明.md)。

## 5. 替换成自己的知识库

公开包仅附带两条示例知识。若要构建自己的 DOCX 知识库：

1. 创建 `knowledge-source/`；
2. 放入按 `001 标题.docx` 格式命名的文档；
3. 安装 Python 3 和 `python-docx`；
4. 运行：

```bash
python3 scripts/build-robot-knowledge-base.py --source knowledge-source
```

生成内容只应包含你有权使用和分发的资料。

## 6. 项目结构

```text
src/                 Web Demo
miniprogram/         微信原生小程序
cloudfunctions/      可选 CloudBase 云函数
docs/                PRD、技术设计和部署说明
scripts/             知识库构建脚本
```

## 7. 隐私与安全

- 不要提交 `.env`、`.env.local`、AppSecret 或 API Key。
- 不要把个人文件、聊天记录、用户导入文档或私人知识库上传到公开仓库。
- 模型回答不能直接点亮节点；掌握状态由可测试的确定性规则决定。
- 项目导入文件应使用临时存储，并在分析完成或失败后清理。

## 8. 常见问题

见 [FAQ](./FAQ.md)。

## 9. 当前复现边界

- Web Agent Demo：可完全离线复现。
- 小程序本地主流程：可使用游客 AppID编译和体验。
- 真机、体验版与正式发布：需要复现者自己的微信小程序账号。
- 在线模型与项目文件分析：需要复现者自己的CloudBase环境和模型密钥。
