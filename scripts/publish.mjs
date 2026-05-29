#!/usr/bin/env node
/**
 * Usage: npm run publish -- <path-to-md-file> [--draft]
 *
 * Drop any .md file here. The script will:
 *   1. Extract title from the first # heading (or use filename)
 *   2. Call Claude to generate description, pick tags, translate to English
 *   3. Write the Chinese post to src/content/posts/YYYY/MM/DD/
 *   4. Write the English post to src/content/posts/en/YYYY/MM/DD/
 *   5. git commit + push
 *
 * Requires ANTHROPIC_API_KEY to be set in your environment.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename, extname, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");

// Tag mapping: Chinese ↔ English
const TAGS = {
  随笔: "musings",
  碎片: "fragments",
  其他: "miscellaneous",
  病历: "health-notes",
};

// ─── helpers ───────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw.trim() };

  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    fm[key] = val;
  }
  return { fm, body: m[2].trim() };
}

function extractTitle(body) {
  const m = body.match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function stripTitle(body) {
  return body.replace(/^#{1,3}\s+.+\n?/, "").trim();
}

function getDateInfo() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { datePath: `${y}/${mo}/${d}`, iso: now.toISOString() };
}

// Escape quotes for use inside a YAML double-quoted string
function yamlEscape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildFrontmatter(fields) {
  const lines = ["---"];
  lines.push(`author: "HAOGRE"`);
  lines.push(`pubDatetime: ${fields.iso}`);
  lines.push(`title: "${yamlEscape(fields.title)}"`);
  lines.push(`featured: false`);
  lines.push(`draft: ${fields.draft}`);
  if (fields.lang) lines.push(`lang: ${fields.lang}`);
  lines.push(`tags:`);
  for (const t of fields.tags) lines.push(`  - "${t}"`);
  lines.push(`description: "${yamlEscape(fields.description)}"`);
  lines.push(`---`);
  return lines.join("\n");
}

// ─── Claude call ───────────────────────────────────────────────────────────

async function callClaude(titleZh, bodyZh) {
  const client = new Anthropic();

  const resp = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are helping process a Chinese blog post for a bilingual personal blog (haogre.com).

Chinese title: ${titleZh || "(derive from body)"}

Chinese body:
${bodyZh}

Return a single JSON object with these exact keys:
- "title_zh": Final Chinese title (use given title or extract from body)
- "title_en": Natural English translation of the title
- "description_zh": 1–2 sentence Chinese description, max 80 chars
- "description_en": 1–2 sentence English description, max 80 chars
- "tags_zh": Array of 1–2 tags chosen ONLY from: ${Object.keys(TAGS).join(", ")}
- "body_en": Full English translation of the body. Preserve all markdown formatting, HTML tags, links, and code blocks exactly. Translate only the human-readable text.

Return ONLY the JSON object, no code fences, no explanation.`,
      },
    ],
  });

  return JSON.parse(resp.content[0].text);
}

// ─── git helpers ───────────────────────────────────────────────────────────

function git(cmd) {
  execSync(`git -C "${ROOT}" ${cmd}`, { stdio: "inherit" });
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDraft = args.includes("--draft");
  const filePath = resolve(args.find((a) => !a.startsWith("--")) ?? "");

  if (!filePath || !existsSync(filePath)) {
    console.error("Usage: npm run publish -- <path-to-md-file> [--draft]");
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }

  const raw = readFileSync(filePath, "utf-8");
  const { fm, body } = parseFrontmatter(raw);
  const slug = basename(filePath, extname(filePath));
  const { datePath, iso } = getDateInfo();

  // Title: frontmatter > # heading > filename
  let titleZh = fm.title || extractTitle(body) || slug;
  const cleanBody = fm.title ? body : stripTitle(body);

  console.log(`\n📖 Processing: "${titleZh}"\n`);
  console.log("🤖 Translating with Claude...");

  const meta = await callClaude(titleZh, cleanBody);

  titleZh = meta.title_zh || titleZh;
  const titleEn = meta.title_en;
  const tagsZh = meta.tags_zh ?? ["随笔"];
  const tagsEn = tagsZh.map((t) => TAGS[t] ?? "musings");

  // ── write Chinese post ──────────────────────────────────────────────────
  const zhDir = join(POSTS_DIR, datePath);
  mkdirSync(zhDir, { recursive: true });
  const zhFile = join(zhDir, `${slug}.md`);

  writeFileSync(
    zhFile,
    buildFrontmatter({
      iso,
      title: titleZh,
      draft: isDraft,
      tags: tagsZh,
      description: meta.description_zh,
    }) +
      "\n\n" +
      cleanBody
  );
  console.log(`✅ 中文: src/content/posts/${datePath}/${slug}.md`);

  // ── write English post ──────────────────────────────────────────────────
  const enDir = join(POSTS_DIR, "en", datePath);
  mkdirSync(enDir, { recursive: true });
  const enFile = join(enDir, `${slug}.md`);

  writeFileSync(
    enFile,
    buildFrontmatter({
      iso,
      title: titleEn,
      draft: isDraft,
      lang: "en",
      tags: tagsEn,
      description: meta.description_en,
    }) +
      "\n\n" +
      meta.body_en
  );
  console.log(`✅ English: src/content/posts/en/${datePath}/${slug}.md`);

  // ── git commit + push ────────────────────────────────────────────────────
  if (!isDraft) {
    console.log("\n📦 Committing and pushing...");
    git(`add "src/content/posts/${datePath}/${slug}.md" "src/content/posts/en/${datePath}/${slug}.md"`);
    git(`commit -m "add: ${titleZh}"`);
    git("push");
    console.log(`\n🚀 Published! https://blog.haogre.com/${datePath}/${slug}/`);
  } else {
    console.log(
      `\n📝 Saved as draft. Run without --draft when ready to publish.`
    );
  }
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
