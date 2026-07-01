---
author: "HAOGRE"
pubDatetime: 2026-07-01T11:40:17.472Z
title: "My Claude Plugin Arsenal: 5 Open-Source Skills That Turn AI from \"Works\" to \"Works Great\""
featured: false
draft: false
lang: en
translationKey: "Claude-Skill-推荐文档"
tags:
  - "AI"
  - "indie-hacker"
  - "miscellaneous"
description: "A combo that's like hiring a lazy-but-stylish senior dev, a memory bank that never forgets, and a rigorous researcher."
---

> A combo that's like hiring a lazy-but-stylish senior dev, a memory bank that never forgets, and a rigorous researcher.

---

## Why Native Claude Isn't Enough

After using Claude Code for a while, you'll likely hit three pain points:

**1. UI has that "AI plastic" feel.** Ask Claude to build a login page, and you'll probably get garish purple gradients with stiff hover effects. The code works, but nobody wants to use it.

**2. It loves reinventing the wheel.** Ask it to parse a date, and it might pull in `moment.js` or even wrap a `DateParser` class. What could be done in three lines with the standard library becomes a whole file.

**3. Next session, it remembers nothing.** Project architecture decisions, pitfalls you've encountered, where you left off — all gone.

These aren't bugs in Claude itself; they're the nature of language models gravitating toward the mean without constraints. Skills inject behavioral rules at the system level, transforming Claude from "works" to "works great." **They're not prompts — they're permanent personality implants.**

---

## Five Selected Skills Deep Dive

### 2.1 `ui-ux-pro-max` — An Aesthetic Injection for AI

📦 **[github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**

**What it solves:** AI-generated interfaces are structurally correct but visually poor. The root cause is that the model isn't constrained by "what good UI looks like" — it just generates what's average in training data, and the average isn't pretty.

**Core mechanism:**

| Dimension | Count | Content |
|-----------|-------|---------|
| UI Styles | 67 | Glassmorphism, Bento Grid, Brutalism, AI-Native UI… |
| Color Schemes | 161 | Categorized by industry (Fintech, Healthcare, E-commerce…) |
| Font Pairings | 57 | Each matched to specific use cases |
| Industry UI Rules | 161 | Mapped to design specs for specific product categories |
| UX Principles | 99 | Accessibility, interaction feedback, visual hierarchy… |

Once activated, the Skill automatically outputs a Design System spec: patterns, styles, colors, fonts, anti-pattern list, and delivery checklist. Generated code follows these standards directly — not "here's some code, now go fix the styles."

**Trigger words:** 设计 / 做页面 / 做组件 / UI / 截图 / 前端 / build page / create component

---

### 2.2 `ponytail` — Hire an Extremely Lazy Senior Engineer

📦 **[github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)**

**What it solves:** AI's default behavior is to "write more code." Over-engineering, unnecessary dependencies, premature interfaces — these habits drive up maintenance costs and token consumption.

**Core mechanism:** A 7-level decision ladder, going top-down and stopping at the first level that solves the problem:

```
1. Does this requirement exist? (YAGNI check)
2. Is it already in the codebase?
3. Can the standard library handle it?
4. Does the platform natively cover it? (<input type="date"> instead of a date picker library)
5. Can an already-installed dependency solve it?
6. Can it be written in one line?
7. If all else fails: minimal viable implementation.
```

Paired with the `ponytail:` comment mechanism: every time you consciously simplify, leave a one-line comment explaining the ceiling and upgrade path. For example, `# ponytail: global lock, per-account locks if throughput matters` — making technical debt visible and traceable.

**Quantified benefits** (source: [ponytail README](https://github.com/DietrichGebert/ponytail), median benchmarks):
- **~54% fewer lines of code**
- **~20% cost reduction**
- **~27% faster execution**

**Safety boundaries (things it won't be lazy about):** Input validation, error handling, data security, accessibility.

**Intensity levels:** `lite` / `full` (default) / `ultra`

**Trigger words:** ponytail / be lazy / yagni / simplest / `/ponytail`

---

### 2.3 `claude-mem` — A Persistent Hard Drive for AI

📦 **[github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)**

**What it solves:** Every new session, Claude starts fresh. Project context, architecture decisions, last week's pitfalls — all need to be re-explained.

**Core mechanism:** Under the hood, it uses **SQLite + Chroma vector database** for memory storage, with a three-tier progressive retrieval strategy:

```
Index layer (very fast, only titles/tags)
  ↓ if not found
Timeline layer (recent entries by time)
  ↓ if still needed
Full-text layer (complete content, higher token cost)
```

This three-tier approach saves roughly **10x tokens** compared to dumping all history.

**Five lifecycle hooks:**

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Each startup | Auto-inject relevant context |
| `PostToolUse` | After each tool call | Record actions and results |
| `Stop` | Session end | Compress and archive memory |
| `PreToolUse` | Before tool call | Inject relevant history |
| `Notification` | On notification | Record important events |

**Privacy control:** Content wrapped in `<private>` tags won't be stored.

**Web viewer:** `localhost:37777` — browse all memory entries in your browser.

---

### 2.4 `superpowers` — Set Rules for AI

📦 **[github.com/obra/superpowers](https://github.com/obra/superpowers)**

**What it solves:** AI's instinct is to "start coding immediately." It skips requirements clarification, design, testing, and then says "I'm done" — without verifying anything.

**Core workflow:**

```
Brainstorm → Spec → Plan → TDD (RED→GREEN→REFACTOR) → Verify
```

**Key sub-skills:**

| Sub-skill | Purpose |
|-----------|---------|
| `brainstorming` | Force Socratic questioning before new features; no skipping allowed |
| `systematic-debugging` | 4-stage Root Cause process; no guessing answers |
| `verification-before-completion` | Must have runnable verification evidence before claiming "done" |
| `writing-plans` | Force a plan before multi-step tasks |

**Git Worktree integration:** Each feature is developed in its own worktree, isolated from others.

**Effect:** Eliminates outputs like "the code doesn't run but AI says it's done."

---

### 2.5 `deep-research` — Upgrade AI to a Researcher

📦 **[github.com/amanattar/deep-research](https://github.com/amanattar/deep-research)**

**What it solves:** By default, Claude's "research" means searching two pages and stitching together shallow content. No cross-validation, no clear sources, no handling of controversies.

**Core mechanism:** Forces a structured investigation process:

1. **Multi-round information gathering** — follow up on sub-questions, not just one search pass
2. **Cross-validation** — only include a claim if it appears in multiple independent sources
3. **Structured output** — executive summary + key findings + sub-topic analysis (with numbered citations)
4. **Consensus vs. controversy** — clearly label what's industry consensus vs. disputed
5. **Knowledge gap annotation** — note which questions current sources can't answer

**Use cases:** Technology selection research, competitive analysis, entering a new domain.

---

## How They Work Together

**A typical full-stack feature development pipeline:**

```
Requirement comes in
  ↓
superpowers:brainstorming  → probe user intent, output Spec
  ↓
deep-research (optional)   → research technical options, give evidence-based recommendations
  ↓
superpowers:writing-plans  → break down implementation plan
  ↓
ponytail (always active)   → write minimal viable implementation, ask "do we really need this?" at every step
  ↓
ui-ux-pro-max (frontend)   → UI generated per Design System standards
  ↓
superpowers:verification   → run verification, must have evidence before saying "done"
  ↓
claude-mem (background)    → remember decisions and pitfalls, auto-inject next session
```

**Mental model:**

```
┌─────────────────────────────────────┐
│  Input layer   deep-research        │  Know what to do, with evidence
├─────────────────────────────────────┤
│  Discipline layer superpowers+ponytail│  How to do it, how much to do
├─────────────────────────────────────┤
│  Output layer  ui-ux-pro-max        │  Make the output look good
├─────────────────────────────────────┤
│  Memory layer  claude-mem           │  Remember what was done
└─────────────────────────────────────┘
```

**Tension between two skills: ponytail vs superpowers**

ponytail says "don't write if you don't have to," superpowers says "write tests first." They don't conflict — superpowers governs process discipline, ponytail governs implementation complexity. You can write complete tests with minimal code, then pass them with minimal code.

---

## Installation & Usage

### Installation Methods

**Plugins (ponytail, superpowers, claude-mem) via Claude Code plugin marketplace:**
```bash
/install ponytail
/install superpowers
/install claude-mem
```

**Skills (ui-ux-pro-max, deep-research) via GitHub manual install:**
```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill \
  ~/.claude/skills/ui-ux-pro-max

git clone https://github.com/amanattar/deep-research \
  ~/.claude/skills/deep-research
```

### Trigger Word Quick Reference

| Skill | URL | Trigger Words |
|-------|-----|---------------|
| `ui-ux-pro-max` | [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | design / build page / UI / screenshot |
| `ponytail` | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | ponytail / yagni / be lazy |
| `superpowers` | [github.com/obra/superpowers](https://github.com/obra/superpowers) | Auto-triggered before new features/debugging |
| `claude-mem` | [github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Runs in background, no manual trigger needed |
| `deep-research` | [github.com/amanattar/deep-research](https://github.com/amanattar/deep-research) | research / study / deep analysis |

### Practical Tips

1. **Keep ponytail on by default.** It has safety boundaries and won't cut validation logic or error handling.
2. **claude-mem needs one-time initialization.** Run `claude-mem init` after installation to set up the local database; after that, it runs fully automatically.
3. **deep-research is best used "before starting a new task."** Run it during technology selection; the citation report can be pasted directly into design docs.
4. **superpowers' `verification-before-completion` is the most valuable sub-skill.** If you only want to "prevent AI from lying," install just this one.

---

## Complete Skill List (Quick Reference)

> As of July 2026, there are 14 Skills + 5 Plugins.

### Research & Writing

| Name | Source | Purpose | Trigger Words |
|------|--------|---------|---------------|
| `learn` | [claudekit](https://github.com/claudekit) | Multi-source research → structured output | learn / deep study / `/learn` |
| `read` | [claudekit](https://github.com/claudekit) | Read URLs and PDFs, supports paywalls | read this / check this link |
| `write` | [claudekit](https://github.com/claudekit) | Remove AI tone, polish Chinese/English | polish / proofread / remove AI tone |
| `deep-research` | [amanattar/deep-research](https://github.com/amanattar/deep-research) | Multi-round investigation + cross-validation + numbered citations | research / deep analysis |

### Design & UI

| Name | Source | Purpose | Trigger Words |
|------|--------|---------|---------------|
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 161 palettes + 67 styles + 57 fonts | design / build page / UI |
| `design` | [claudekit](https://github.com/claudekit) | Product-level UI development, screenshot-driven refinement | build page / screenshot / frontend |
| `ui-styling` | [claudekit](https://github.com/claudekit) | shadcn/ui + Tailwind component development | component / dark mode / responsive |
| `design-system` | [claudekit](https://github.com/claudekit) | Three-tier token architecture, component specs | design tokens / design system |
| `banner-design` | [claudekit](https://github.com/claudekit) | Social media/ad banner design | poster / banner |
| `brand` | [claudekit](https://github.com/claudekit) | Brand voice, visual identity, content consistency | brand / branding |
| `slides` | [claudekit](https://github.com/claudekit) | HTML presentations + Chart.js | slides / presentation |

### Engineering Discipline

| Name | Source | Purpose | Trigger Words |
|------|--------|---------|---------------|
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | TDD + verification + systematic debugging | Auto-triggered |
| `think` | [claudekit](https://github.com/claudekit) | Propose a plan before acting | propose plan / how to design |
| `check` | [claudekit](https://github.com/claudekit) | PR/code/release pre-review | before merge / review |
| `hunt` | [claudekit](https://github.com/claudekit) | Root cause localization | debug / troubleshoot / error |
| `health` | [claudekit](https://github.com/claudekit) | Agent configuration health audit | check claude / config check |

### Plugins

| Name | Source | Version | Purpose |
|------|--------|---------|---------|
| `ponytail` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 4.8.4 | YAGNI lazy discipline |
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | 6.1.0 | Engineering methodology framework |
| `claude-mem` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 13.9.2 | Cross-session persistent memory |
| `swift-lsp` | claude-plugins-official | 1.0.0 | Swift language server |
| `clangd-lsp` | claude-plugins-official | 1.0.0 | C/C++ language server |

> **Note:** `learn`, `read`, `write`, `design`, `think`, `check`, `hunt`, `health`, `slides`, `banner-design`, `brand`, `design-system`, `ui-styling` are from the [claudekit](https://github.com/claudekit) commercial suite and have no independent public repositories.

---

## Further Reading

1. **[ponytail README](https://github.com/DietrichGebert/ponytail)** — Benchmark methodology and `ponytail:` comment system design. Most worth reading in depth.
2. **[superpowers full Skill directory](https://github.com/obra/superpowers)** — Trigger conditions for a dozen sub-skills; install only the core ones.
3. **[claude-mem architecture docs](https://github.com/thedotmack/claude-mem)** — Implementation details of the three-tier retrieval strategy and how to adjust memory compression granularity.
4. **[ui-ux-pro-max design rule library](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — Complete list of 161 industry rules; understand what dimensions it uses to constrain AI design decisions.

Start with **ponytail** — immediate results. Then **claude-mem** for the greatest long-term benefit.

---

*This article is based on actual installation status as of July 2026. Version numbers refer to the latest releases on each GitHub repository.*
