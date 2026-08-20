# Sky Adventure Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a polished Chinese story blog based on `mc-story-3.md`, with matching illustrations and a generated English companion.

**Architecture:** Keep the existing Astro content model and publishing conventions. Create one date-scoped Chinese Markdown post, seven project-local raster illustrations under `public/uploads`, and one translated English post sharing the same `translationKey` and image set.

**Tech Stack:** Astro 6, Markdown content collections, Node publish script, built-in image generation, npm test/lint/format/build.

## Global Constraints

- Preserve existing untracked files in `/Users/haogre/github/haogre.github.io`.
- Use the established post frontmatter and `/uploads/...` image URL convention.
- Do not overwrite existing assets; use the new 2026-08-20 path.
- Verify all claims with fresh command output before publishing.

### Task 1: Create and review the long-form Chinese story

**Files:**
- Create: `src/content/posts/2026/08/20/我的世界100天天空冒险.md`
- Reference: `/Users/haogre/Desktop/mc-story-3.md`

- [ ] Extract the six narrative phases from the outline and write continuous prose with short paragraphs, dialogue, transitions, and a clear emotional ending.
- [ ] Keep all named characters and the outline's main set pieces, while removing repetitive day-by-day filler.
- [ ] Add image placeholders using the final `/uploads/2026/08/20/我的世界100天天空冒险/NN-name.png` paths and captions.
- [ ] Run `sed -n '1,80p'` and `rg -n '^## |^!\['` to review structure and image placement.

### Task 2: Generate and save the seven illustrations

**Files:**
- Create: `public/uploads/2026/08/20/我的世界100天天空冒险/*.png`

- [ ] Generate each scene independently using the existing white-background Minecraft story illustration language, with no title text or watermark.
- [ ] Inspect each final bitmap and copy it into the date-scoped upload directory.
- [ ] Verify seven files exist and have non-zero dimensions with `file`.

### Task 3: Create the English companion and metadata

**Files:**
- Create: `src/content/posts/en/2026/08/20/100-days-of-sky-adventure.md`

- [ ] Run the repository publishing workflow in stage mode against the Chinese post, supplying the local images.
- [ ] Confirm the English post has the same image count, `translationKey`, and `draft: false`.
- [ ] If the translation CLI is unavailable, create the English companion manually without changing the Chinese story.

### Task 4: Verify the site

**Files:**
- Verify only; no unrelated edits.

- [ ] Run `npm test`.
- [ ] Run `npm run lint` and `npm run format:check`.
- [ ] Run `npm run build` and inspect the generated route/search output.
- [ ] Start a local preview if needed and verify the post route renders with images.

### Task 5: Publish

- [ ] Review `git diff --stat` and `git status --short` to ensure only intended new files are staged.
- [ ] Commit the article, illustrations, plan/spec, and generated companion with a focused message.
- [ ] Push the current branch to origin.
- [ ] Check remote status and GitHub Pages/Actions state; report the public URL.
