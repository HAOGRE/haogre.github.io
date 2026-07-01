---
author: "HAOGRE"
pubDatetime: 2026-07-01T11:40:17.472Z
title: "我的 Claude 插件军火库：5 个开源 Skill 让 AI 从“能用”变“好用”"
featured: false
draft: false
translationKey: "Claude-Skill-推荐文档"
tags:
  - "AI"
  - "indie-hacker"
  - "其他"
description: "一套组合拳，等于雇了一个有审美的懒惰大佬 + 永不失忆的跟班 + 严谨的研究员"
---

> 一套组合拳，等于雇了一个有审美的懒惰大佬 + 永不失忆的跟班 + 严谨的研究员

---

## 一、为什么原生 Claude 还不够用

用了一段时间 Claude Code 之后，你大概会发现三个让人头疼的问题：

**1. UI 有“AI 塑料感”。** 让 Claude 写个登录页，大概率得到刺眼的亮紫渐变 + 生硬的 hover 动效。代码能跑，但没人想用。

**2. 它爱造轮子。** 让它解析个日期，它可能拉一个 `moment.js`，甚至给你包一个 `DateParser` 类。标准库里三行能搞定的事，写成了一个文件。

**3. 下次开 Session 它什么都不记得了。** 项目架构决策、踩过的坑、上次聊到哪 —— 全清零。

这三个问题不是 Claude 本身的 Bug，是“语言模型不带约束就会往均值走”的天性。Skill 的作用就是在系统底层注入行为规则，把 Claude 从“能用”改造成“好用”。**不是提示词，是永久的人格植入。**

---

## 二、五个精选 Skill 深度解析

### 2.1 `ui-ux-pro-max` — 给 AI 打一针审美补丁

📦 **[github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**

**解决什么问题：** AI 生成的界面虽然结构正确，但视觉质感极差。根本原因是模型没有被约束“什么是好的 UI”，只会生成“大多数训练数据里长这样”的结果 —— 而训练数据的均值本来就不好看。

**核心机制：**

| 维度 | 数量 | 内容 |
|------|------|------|
| UI 风格 | 67 种 | Glassmorphism、Bento Grid、Brutalism、AI-Native UI… |
| 色彩方案 | 161 个 | 按行业分类（Fintech、Healthcare、E-commerce…） |
| 字体搭配 | 57 套 | 每套对应具体使用场景 |
| 行业 UI 规则 | 161 条 | 映射到具体产品品类的设计规范 |
| UX 准则 | 99 条 | 可访问性、交互反馈、视觉层级… |

激活后，Skill 会自动输出一套 Design System 规格：模式、风格、色彩、字体、反模式清单、交付 Checklist。生成的代码直接按这个标准走，不是“给你一份代码再让你对着改样式”。

**触发词：** 设计 / 做页面 / 做组件 / UI / 截图 / 前端 / build page / create component

---

### 2.2 `ponytail` — 请一个极度懒惰的资深工程师

📦 **[github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)**

**解决什么问题：** AI 的默认行为是“写更多代码”。过度封装、引入不必要的依赖、为“以后可能用到”提前设计接口 —— 这些习惯直接推高了维护成本和 token 消耗。

**核心机制：** 一个 7 级决策梯子，从上往下，停在第一个能解决问题的梯级：

```
1. 这个需求存在吗？（YAGNI 检查）
2. 代码库里已经有了吗？
3. 标准库能搞定吗？
4. 平台原生功能覆盖吗？（<input type="date"> 而不是日期选择器库）
5. 已安装的依赖能解决吗？
6. 能写成一行吗？
7. 实在不行：最小可用实现。
```

配合 `ponytail:` 注释机制：每次有意识做了简化，留一行注释说明上限和升级路径。比如 `# ponytail: global lock, per-account locks if throughput matters`，让技术债变得可见可追踪。

**量化收益**（来源：[ponytail README](https://github.com/DietrichGebert/ponytail)，benchmark 中位数）：
- **代码行数减少约 54%**
- **成本降低约 20%**
- **执行速度提升约 27%**

**安全边界（不懒化的部分）：** 输入验证、错误处理、数据安全、无障碍访问。

**强度档位：** `lite` / `full`（默认）/ `ultra`

**触发词：** ponytail / be lazy / yagni / simplest / `/ponytail`

---

### 2.3 `claude-mem` — 给 AI 装一块持久化硬盘

📦 **[github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)**

**解决什么问题：** 每次开 Session，Claude 都是全新的。项目上下文、架构决策、上周踩的坑 —— 全部需要重新描述。

**核心机制：** 底层用 **SQLite + Chroma 向量数据库** 存储记忆，检索时走三层渐进策略：

```
索引层（极快，只看标题/标签）
  ↓ 没找到
时间线层（按时间查近期相关条目）
  ↓ 还需要
全文层（完整内容，token 成本较高）
```

三层策略比直接塞全部历史记录节省约 **10x token**。

**五个生命周期钩子：**

| 钩子 | 触发时机 | 作用 |
|------|----------|------|
| `SessionStart` | 每次启动 | 自动注入相关上下文 |
| `PostToolUse` | 每次工具调用后 | 记录操作和结果 |
| `Stop` | Session 结束 | 压缩并归档本次记忆 |
| `PreToolUse` | 工具调用前 | 注入相关历史 |
| `Notification` | 收到通知时 | 记录重要事件 |

**隐私控制：** `<private>` 标签包裹的内容不会被存储。

**Web 查看器：** `localhost:37777`，浏览器可查所有记忆条目。

---

### 2.4 `superpowers` — 给 AI 立规矩

📦 **[github.com/obra/superpowers](https://github.com/obra/superpowers)**

**解决什么问题：** AI 的天性是“立刻开始写代码”。跳过需求澄清，跳过设计，跳过测试，最后说“我已经完成了” —— 但其实什么都没验证。

**核心流程：**

```
Brainstorm → Spec → Plan → TDD（RED→GREEN→REFACTOR）→ Verify
```

**关键子 Skill：**

| 子 Skill | 作用 |
|----------|------|
| `brainstorming` | 新功能前强制 Socratic 追问，不允许跳过 |
| `systematic-debugging` | 4 阶段 Root Cause 流程，禁止直接猜答案 |
| `verification-before-completion` | 声称“完成”前必须有可运行的验证证据 |
| `writing-plans` | 多步任务前强制出计划 |

**Git Worktree 集成：** 每个功能在独立 worktree 里开发，互不干扰。

**效果：** 消灭“代码跑不起来但 AI 说完成了”这类输出。

---

### 2.5 `deep-research` — 把 AI 升级成研究员

📦 **[github.com/amanattar/deep-research](https://github.com/amanattar/deep-research)**

**解决什么问题：** 默认情况下，Claude 的“研究”等于搜索两页然后拼凑水文。没有交叉验证，没有明确来源，没有对争议点的处理。

**核心机制：** 强制走结构化调查流程：

1. **多轮信息收集** —— 追踪子问题继续深挖，不止搜一遍
2. **交叉验证** —— 同一观点至少出现在多个独立来源才写进报告
3. **结构化输出** —— 执行摘要 + 关键发现 + 子话题分析（带编号引用）
4. **共识 vs 争议区分** —— 明确标注哪些是行业共识，哪些还有争议
5. **知识缺口标注** —— 说明哪些问题当前来源无法回答

**适用场景：** 技术选型调研、竞品分析、新领域入门。

---

## 三、组合拳：它们如何协同

**一次典型的功能开发全链路：**

```
需求进来
  ↓
superpowers:brainstorming  → 追问用户意图，输出 Spec
  ↓
deep-research（可选）      → 调研技术方案，给出有依据的选型建议
  ↓
superpowers:writing-plans  → 拆解实现计划
  ↓
ponytail（全程激活）       → 写最小可用实现，每一步先问“真的需要吗”
  ↓
ui-ux-pro-max（前端部分）  → UI 按 Design System 标准生成
  ↓
superpowers:verification   → 跑验证，说“完成”之前必须有证据
  ↓
claude-mem（后台运行）     → 记住这次的决策和坑，下次启动自动注入
```

**心智模型：**

```
┌─────────────────────────────────────┐
│  输入层   deep-research             │  知道该做什么，有依据
├─────────────────────────────────────┤
│  纪律层   superpowers + ponytail    │  怎么做，做多少
├─────────────────────────────────────┤
│  输出层   ui-ux-pro-max             │  做出来的东西好看
├─────────────────────────────────────┤
│  记忆层   claude-mem                │  记住做过什么
└─────────────────────────────────────┘
```

**两个 Skill 之间的张力：ponytail vs superpowers**

ponytail 说“能不写就不写”，superpowers 说“先写测试”。两者不冲突 —— superpowers 管流程纪律，ponytail 管实现复杂度。可以用最少的代码写完整的测试，再用最少的代码通过它。

---

## 四、安装与使用

### 安装方式

**插件（ponytail、superpowers、claude-mem）通过 Claude Code 插件市场安装：**
```bash
/install ponytail
/install superpowers
/install claude-mem
```

**Skill（ui-ux-pro-max、deep-research）通过 GitHub 手动安装：**
```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill \
  ~/.claude/skills/ui-ux-pro-max

git clone https://github.com/amanattar/deep-research \
  ~/.claude/skills/deep-research
```

### 触发词速查

| Skill | 地址 | 触发词 |
|-------|------|--------|
| `ui-ux-pro-max` | [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 设计 / 做页面 / UI / 截图 |
| `ponytail` | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | ponytail / yagni / be lazy |
| `superpowers` | [github.com/obra/superpowers](https://github.com/obra/superpowers) | 自动在新功能/调试前触发 |
| `claude-mem` | [github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 后台自动运行，无需手动触发 |
| `deep-research` | [github.com/amanattar/deep-research](https://github.com/amanattar/deep-research) | research / 研究 / 深入分析 |

### 几个实用建议

1. **ponytail 默认开着就好。** 它有安全边界，不会削减验证逻辑或错误处理。
2. **claude-mem 需要初始化一次。** 安装后运行 `claude-mem init` 建立本地数据库，之后完全自动运行。
3. **deep-research 适合用在“启动新任务前”。** 技术选型阶段跑一次，输出的引用报告可以直接粘进设计文档。
4. **superpowers 的 `verification-before-completion` 最值得单独关注。** 如果只想要“防止 AI 说谎”，装这一个就够了。

---

## 五、完整 Skill 清单（速查表）

> 截至 2026 年 7 月，共 14 个 Skills + 5 个 Plugins。

### 研究与写作类

| 名称 | 来源 | 作用 | 触发词 |
|------|------|------|--------|
| `learn` | [claudekit](https://github.com/claudekit) | 多源调研 → 结构化输出 | 学习 / 深入研究 / `/learn` |
| `read` | [claudekit](https://github.com/claudekit) | 读 URL 和 PDF，支持付费墙 | 看这个链接 / read this |
| `write` | [claudekit](https://github.com/claudekit) | 去 AI 腔，润色中英文 | 润色 / 去AI味 / proofread |
| `deep-research` | [amanattar/deep-research](https://github.com/amanattar/deep-research) | 多轮调查 + 交叉验证 + 编号引用 | research / 深入分析 |

### 设计与 UI 类

| 名称 | 来源 | 作用 | 触发词 |
|------|------|------|--------|
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 161调色板+67风格+57字体 | 设计 / 做页面 / UI |
| `design` | [claudekit](https://github.com/claudekit) | 产品级 UI 开发，截图驱动精修 | 做页面 / 截图 / 前端 |
| `ui-styling` | [claudekit](https://github.com/claudekit) | shadcn/ui + Tailwind 组件开发 | 组件 / dark mode / 响应式 |
| `design-system` | [claudekit](https://github.com/claudekit) | 三层 Token 架构，组件 Spec | design tokens / 设计系统 |
| `banner-design` | [claudekit](https://github.com/claudekit) | 社交媒体/广告 Banner 设计 | 海报 / banner |
| `brand` | [claudekit](https://github.com/claudekit) | 品牌声音、视觉识别、内容一致性 | 品牌 / brand |
| `slides` | [claudekit](https://github.com/claudekit) | HTML 演示文稿 + Chart.js | 幻灯片 / 演讲稿 |

### 工程纪律类

| 名称 | 来源 | 作用 | 触发词 |
|------|------|------|--------|
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | TDD + 验证 + 系统调试 | 自动触发 |
| `think` | [claudekit](https://github.com/claudekit) | 先出方案再动手 | 出方案 / 怎么设计 |
| `check` | [claudekit](https://github.com/claudekit) | PR/代码/发布前审查 | 合并前 / review |
| `hunt` | [claudekit](https://github.com/claudekit) | Root Cause 定位 | 排查 / debug / 报错 |
| `health` | [claudekit](https://github.com/claudekit) | Agent 配置健康度审计 | 检查claude / 配置检查 |

### 插件类（Plugins）

| 名称 | 来源 | 版本 | 作用 |
|------|------|------|------|
| `ponytail` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 4.8.4 | YAGNI 懒人纪律 |
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | 6.1.0 | 工程方法论框架 |
| `claude-mem` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 13.9.2 | 跨 Session 持久化记忆 |
| `swift-lsp` | claude-plugins-official | 1.0.0 | Swift 语言服务器 |
| `clangd-lsp` | claude-plugins-official | 1.0.0 | C/C++ 语言服务器 |

> **注：** `learn`、`read`、`write`、`design`、`think`、`check`、`hunt`、`health`、`slides`、`banner-design`、`brand`、`design-system`、`ui-styling` 均来自 [claudekit](https://github.com/claudekit) 商业套件，无独立公开仓库。

---

## 延伸阅读

1. **[ponytail README](https://github.com/DietrichGebert/ponytail)** — benchmark 方法论和 `ponytail:` 注释系统设计思路。最值得精读。
2. **[superpowers 完整 Skill 目录](https://github.com/obra/superpowers)** — 十几个子 Skill 的触发条件说明，挑核心的装即可。
3. **[claude-mem 架构文档](https://github.com/thedotmack/claude-mem)** — 三层检索策略的实现细节，以及如何调整记忆压缩粒度。
4. **[ui-ux-pro-max 设计规则库](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — 161 条行业规则完整列表，理解它在用什么维度约束 AI 的设计决策。

最值得从 **ponytail** 开始，装完立刻见效。其次是 **claude-mem**，长期收益最大。

---

*本文基于 2026 年 7 月实际安装状态整理，版本号以各 GitHub 仓库最新发布为准。*
