# Product Requirements

## Product Summary

- **Product:** 身知回响微信小程序
- **One-liner:** A five-tab mini program that makes the embodied-intelligence knowledge structure visible and connects every knowledge point to a grounded learning companion and explainable mastery evidence.
- **Brand Meaning:** 让具身智能学习从实践开始，从实践中获得认知，让认知经过表达、验证与迁移产生回响。
- **Target users:** Intermediate product/technical learners entering embodied-intelligence product work.

## User Stories

- As a learner, I want a nine-domain puzzle so that I know what to learn.
- As a beginner, I want to inspect every domain's objectives and modules even before lessons open so that I can understand the whole path.
- As a learner, I want to ask a context-aware companion about any module so that I can resolve confusion without leaving the learning path.
- As a learner, I want a short visual lesson and challenge so that I can use fragmented time effectively.
- As a learner, I want evidence-based feedback so that I know whether I truly understand.
- As a product learner, I want a robot case so that I can transfer concepts into decisions.

## Feature List (MoSCoW)

### Must Have

- [x] Home, Knowledge Map, Learning Companion, Challenge and Profile tabs
- [x] Nine-domain inspectable map and domain detail pages
- [x] Context-aware local companion with visible knowledge sources
- [ ] Sensor-selection lesson
- [ ] Constraint challenge and Feynman explanation
- [ ] Transparent fallback evaluation and deterministic unlock
- [ ] Evidence history, local persistence and robot case
- [ ] Local “机器人产品内参” retrieval with visible source attribution
- [ ] Personal learning center with continue-learning, recent-learning and favorites
- [ ] Project learning workspace that accepts one PDF, DOCX, Markdown or TXT file and returns a structured learning plan plus grounded questions
- [ ] CloudBase Agent adapter that uses DeepSeek when configured and falls back honestly when the key or provider is unavailable

### Should Have

- [ ] Clear offline, error and locked states
- [ ] Content and rule version display

### Could Have

- [ ] Optional cloud-model semantic evaluation

### Won't Have (this version)

- Auth, cross-device sync, permanent storage of imported source files, online vector RAG, payments, social features, full nine-domain curriculum, voice input.

## Success Metrics

- At least 4 of 5 target testers complete the loop without instruction.
- At least 4 of 5 can explain why the node did or did not unlock.
- The loop takes 8—15 minutes and has no blocking errors.

## Out of Scope

- Do not add cloud dependencies to make the local MVP work.
- Do not collect WeChat identity or personal information.
- Imported files are temporary: validate type/size, exclude secrets by user warning, send extracted text to DeepSeek only after confirmation, delete the CloudBase temporary object after analysis, and keep only the generated learning plan on the current device.

## P0/P1 Expansion — 2026-08-04

### Goal

Make “我的” a usable learning workspace and turn the named Learning Companion into an observable Agent loop: choose context, retrieve grounded knowledge, plan an output, call tools when needed, return structured learning artifacts, and preserve deterministic evaluation boundaries.

### P0 Personal Learning Center

- Continue learning shows the latest module and a direct action.
- Recent learning keeps at most 12 local entries, newest first, and de-duplicates by target.
- Favorites support knowledge modules and keep at most 50 local entries.
- Empty states explain what to do next instead of showing technical version data as the primary content.
- Cloud and version diagnostics move into a secondary “数据与服务” section.

### P1 Project Learning Agent

- Accepted files: `.pdf`, `.docx`, `.md`, `.txt`; maximum 10 MB; one file per analysis.
- Before upload, the user sees that content will be temporarily uploaded to Tencent Cloud and, when a DeepSeek key is configured, sent to DeepSeek for analysis.
- Success output: project title, summary, 3–6 learning goals, a root-and-branch mind map, and 3–8 grounded questions with reference points.
- DeepSeek output uses JSON mode and is validated before rendering.
- If no key, provider failure or invalid model output occurs, the backend returns a clearly labeled deterministic fallback plan from extracted headings and keywords.
- If no project exists, the workspace routes the learner to the general knowledge map and Learning Companion.
- The original file is deleted from temporary CloudBase storage after analysis; only the generated plan is stored locally.

### Acceptance

- Given no learning history, when the learner opens “我的”, then clear empty states and next actions are visible.
- Given a module is favorited or opened, when the learner returns to “我的”, then it appears in favorites or recent learning and can be reopened.
- Given a supported file under 10 MB and upload confirmation, when analysis succeeds, then the project page renders a plan, mind map and questions.
- Given an unsupported/oversized file, when import starts, then analysis does not run and the learner sees a specific validation message.
- Given DeepSeek is not configured or fails, when a supported file is parsed, then a fallback plan is returned and explicitly labeled without exposing internal errors or secrets.
