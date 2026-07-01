#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Usage: npm run new -- "文章标题"
 *
 * Creates a draft post at src/content/posts/YYYY/MM/DD/<title>.md with
 * pre-filled frontmatter (draft: true). Then run `npm run dev` for live preview.
 *
 * When you're ready to publish, run:
 *   npm run publish -- src/content/posts/YYYY/MM/DD/<title>.md
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");

const args = process.argv.slice(2);
const title = args.find(a => !a.startsWith("--"))?.trim();

if (!title) {
  console.error('Usage: npm run new -- "文章标题"');
  process.exit(1);
}

const now = new Date();
const y = now.getFullYear();
const mo = String(now.getMonth() + 1).padStart(2, "0");
const d = String(now.getDate()).padStart(2, "0");
const datePath = `${y}/${mo}/${d}`;
const iso = now.toISOString();

// Sanitize title for use as a filename (keep Chinese chars, remove path separators)
const slug = title.replace(/[/\\?%*:|"<>]/g, "-").trim();

const dir = join(POSTS_DIR, datePath);
const filePath = join(dir, `${slug}.md`);
const relPath = `src/content/posts/${datePath}/${slug}.md`;

if (existsSync(filePath)) {
  console.error(`Draft already exists: ${relPath}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

const frontmatter = `---
author: "HAOGRE"
pubDatetime: ${iso}
title: "${title.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
featured: false
draft: true
tags:
  - "随笔"
description: ""
translationKey: "${slug}"
---

`;

writeFileSync(filePath, frontmatter, "utf-8");

console.log(`\nDraft created: ${relPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Open the file and write your post`);
console.log(`  2. Run \`npm run dev\` to preview locally (hot reload)`);
console.log(`  3. When ready: npm run publish -- ${relPath}`);
