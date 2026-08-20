# Dynamic OG Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable and verify per-article dynamic Open Graph images across the blog.

**Architecture:** Reuse the existing static Satori route at `src/pages/[...slug]/index.png.ts`; enable it in `astro-paper.config.ts`, and make its card content include enough article context to distinguish posts. Keep explicit frontmatter images and non-post defaults unchanged.

**Tech Stack:** Astro 6, Satori, Sharp, Astro content collections, static GitHub Pages deployment.

## Global Constraints

- Preserve unrelated untracked files in the repository.
- Use the existing 1200×630 static OG route; do not add runtime image hosting.
- Do not overwrite explicit article `ogImage` values if they are added later.

### Task 1: Enable and refine dynamic OG generation

**Files:**
- Modify: `astro-paper.config.ts`
- Modify: `src/pages/[...slug]/index.png.ts`

- [ ] Set `features.dynamicOgImage` to `true`.
- [ ] Keep `getStaticPaths()` limited to non-draft posts without explicit `ogImage`.
- [ ] Render title, description, tags/language, and site identity in a stable 1200×630 Satori layout with controlled text lengths.
- [ ] Preserve the existing font loading and Sharp PNG conversion.

### Task 2: Verify generated assets and metadata

**Files:**
- Verify: `dist/**/index.png`, generated HTML, and local preview response.

- [ ] Run `npm test` and `npx astro check`.
- [ ] Run `npx astro build` and confirm representative Chinese and English OG PNG files exist.
- [ ] Inspect PNG dimensions with `file` and confirm HTML `og:image` points to the per-post route.
- [ ] Use a local dev server and curl the article page plus `/index.png`, expecting HTTP 200.

### Task 3: Publish

- [ ] Stage only the OG config, generator, design/plan docs, and any focused tests.
- [ ] Commit with a focused message and push `master`.
- [ ] Confirm GitHub Actions success and re-fetch one Chinese and one English online page to verify non-default `og:image` URLs.
