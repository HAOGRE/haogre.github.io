#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Usage: npm run publish -- <path-to-md-file> [--draft]
 *
 * Drop any .md file here. The script will:
 *   1. Detect whether the source is Chinese or English
 *   2. Ask Claude to proofread/typeset the source language and create the other language
 *   3. Write Chinese and English posts to the Astro content tree
 *   4. Run the local production build
 *   5. Commit and push when the build passes
 *
 * Requires ANTHROPIC_API_KEY or DEEPSEEK_API_KEY to be set in your environment.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, basename, extname, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawn } from "child_process";
import { createInterface } from "readline/promises";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");
const UPLOADS_DIR = join(ROOT, "public/uploads");
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

// Tag mapping: Chinese <-> English
const TAGS = {
  随笔: "musings",
  碎片: "fragments",
  其他: "miscellaneous",
  病历: "health-notes",
};

const VALID_ZH_TAGS = Object.keys(TAGS);

// --- helpers ---------------------------------------------------------------

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

function stripTyporaToc(body) {
  return body
    .split(/\r?\n/)
    .filter(line => line.trim().toLowerCase() !== "[toc]")
    .join("\n")
    .trim();
}

function detectLanguage(text) {
  const withoutCode = text.replace(/```[\s\S]*?```/g, "");
  const cjkCount = (withoutCode.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWordCount = (withoutCode.match(/[A-Za-z][A-Za-z'-]*/g) || [])
    .length;

  return cjkCount >= Math.max(20, latinWordCount * 0.2) ? "zh-cn" : "en";
}

function getDateInfo() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { datePath: `${y}/${mo}/${d}`, iso: now.toISOString() };
}

function yamlEscape(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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

function normalizeTags(tags) {
  const normalized = Array.isArray(tags)
    ? tags.filter(tag => VALID_ZH_TAGS.includes(tag))
    : [];
  return normalized.length > 0 ? normalized.slice(0, 2) : ["随笔"];
}

function requiredText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Claude response is missing required field: ${field}`);
  }
  return value.trim();
}

function parseClaudeJson(text) {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(unfenced.slice(start, end + 1));
    }
    throw new Error("Claude did not return valid JSON.");
  }
}

function isHttpUrl(src) {
  return /^https?:\/\//i.test(src);
}

function isDataUrl(src) {
  return /^data:/i.test(src);
}

function getImageRefs(body) {
  const refs = [];
  const imagePattern = /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)([^)]*)\)/g;
  let match;

  while ((match = imagePattern.exec(body)) !== null) {
    const rawSrc = match[2].trim();
    const src = rawSrc.replace(/^<|>$/g, "");
    refs.push({
      raw: match[0],
      alt: match[1],
      src,
      rest: match[3] || "",
    });
  }

  return refs;
}

function getImageBasename(src) {
  try {
    return basename(decodeURIComponent(new URL(src).pathname));
  } catch {
    return basename(decodeURIComponent(src));
  }
}

function sanitizeFileName(name) {
  const ext = extname(name);
  const stem = basename(name, ext)
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${stem || "image"}${ext || ".png"}`;
}

function buildSourceImageMap(body) {
  const map = new Map();
  for (const ref of getImageRefs(body)) {
    map.set(ref.src, ref.src);
    map.set(getImageBasename(ref.src), ref.src);
  }
  return map;
}

function resolveImageSource(src, sourceImageMap, sourceFilePath) {
  if (isDataUrl(src) || src.startsWith("/")) return null;
  if (isHttpUrl(src)) return src;

  const mapped = sourceImageMap.get(src) || sourceImageMap.get(getImageBasename(src));
  if (mapped) return mapped;

  return resolve(dirname(sourceFilePath), src);
}

async function fetchWithTimeout(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36",
      },
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    return Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

async function materializeImage({ resolvedSrc, outputPath }) {
  if (isHttpUrl(resolvedSrc)) {
    const bytes = await fetchWithTimeout(resolvedSrc);
    writeFileSync(outputPath, bytes);
    return;
  }

  if (!existsSync(resolvedSrc)) {
    throw new Error(`Local image does not exist: ${resolvedSrc}`);
  }

  copyFileSync(resolvedSrc, outputPath);
}

async function localizeImages({ bodies, sourceBody, sourceFilePath, datePath, slug }) {
  const sourceImageMap = buildSourceImageMap(sourceBody);
  const uploadDir = join(UPLOADS_DIR, datePath, slug);
  const publicPrefix = `/uploads/${datePath}/${slug}`;
  const srcToPublicPath = new Map();
  const usedNames = new Set();

  for (const body of Object.values(bodies)) {
    for (const ref of getImageRefs(body)) {
      if (srcToPublicPath.has(ref.src)) continue;

      const resolvedSrc = resolveImageSource(ref.src, sourceImageMap, sourceFilePath);
      if (!resolvedSrc) continue;

      mkdirSync(uploadDir, { recursive: true });

      const baseName = sanitizeFileName(getImageBasename(resolvedSrc));
      let fileName = baseName;
      let index = 2;
      while (usedNames.has(fileName)) {
        const ext = extname(baseName);
        const stem = basename(baseName, ext);
        fileName = `${stem}-${index}${ext}`;
        index += 1;
      }
      usedNames.add(fileName);

      const outputPath = join(uploadDir, fileName);
      await materializeImage({ resolvedSrc, outputPath });
      srcToPublicPath.set(ref.src, `${publicPrefix}/${fileName}`);
    }
  }

  const localizedBodies = {};
  for (const [key, body] of Object.entries(bodies)) {
    localizedBodies[key] = body.replace(
      /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)([^)]*)\)/g,
      (full, alt, rawSrc, rest) => {
        const src = rawSrc.trim().replace(/^<|>$/g, "");
        const localized = srcToPublicPath.get(src);
        return localized ? `![${alt}](${localized}${rest})` : full;
      }
    );
  }

  return { bodies: localizedBodies, assets: [...srcToPublicPath.values()] };
}

function run(command, args) {
  execFileSync(command, args, { cwd: ROOT, stdio: "inherit" });
}

function git(args) {
  run("git", args);
}

function resolveProvider() {
  const requested = process.env.LLM_PROVIDER?.toLowerCase();
  if (requested === "anthropic" || requested === "deepseek") {
    return requested;
  }
  return process.env.DEEPSEEK_API_KEY ? "deepseek" : "anthropic";
}

function getModel(provider) {
  if (provider === "deepseek") {
    return process.env.DEEPSEEK_MODEL || "deepseek-chat";
  }
  return process.env.ANTHROPIC_MODEL || "claude-opus-4-7";
}

function getApiKey(provider) {
  return provider === "deepseek"
    ? process.env.DEEPSEEK_API_KEY
    : process.env.ANTHROPIC_API_KEY;
}

function buildPrompt({ title, body, sourceLang, slug }) {
  const sourceLabel = sourceLang === "zh-cn" ? "Chinese" : "English";

  return `You are the publishing editor for a bilingual personal blog at haogre.com.

Source language: ${sourceLabel}
Source title: ${title || slug}

Source markdown:
${body}

Create publication-ready Chinese and English versions.

Rules:
- Return a single JSON object only. No markdown fences, no explanation.
- Preserve Markdown structure, tables, links, images, HTML, MDX, and code fences.
- Do not translate code blocks, URLs, file names, keyboard shortcuts, API names, product names, or shell commands.
- Translate and polish only human-readable prose.
- Remove obvious Typora-only artifacts such as a standalone [TOC].
- Keep personal voice natural and restrained. Do not add facts that are not in the source.
- For Chinese, use natural Simplified Chinese and clean spacing around English terms/numbers when useful.
- For English, use natural blog English, not literal translation.
- Pick 1-2 Chinese tags only from: ${VALID_ZH_TAGS.join(", ")}.
- Descriptions must be concise search/social summaries, not copied opening paragraphs.

JSON shape:
{
  "title_zh": "Final Chinese title",
  "title_en": "Final English title",
  "description_zh": "Chinese description, <= 80 Chinese chars",
  "description_en": "English description, <= 120 chars",
  "tags_zh": ["随笔"],
  "body_zh": "Full Chinese markdown body",
  "body_en": "Full English markdown body",
  "review_notes": ["Short human-readable notes about changes or publication risks"]
}`;
}

// --- LLM calls -------------------------------------------------------------

async function callAnthropic({ prompt, model }) {
  const client = new Anthropic();
  const resp = await client.messages.create({
    model,
    max_tokens: 12000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return parseClaudeJson(resp.content[0].text);
}

async function callDeepSeek({ prompt, model }) {
  const resp = await fetch(
    `${DEEPSEEK_BASE_URL.replace(/\/+$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 12000,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned an empty response.");
  }

  return parseClaudeJson(content);
}

async function callLLM({ provider, model, title, body, sourceLang, slug }) {
  const prompt = buildPrompt({ title, body, sourceLang, slug });
  if (provider === "deepseek") return callDeepSeek({ prompt, model });
  return callAnthropic({ prompt, model });
}

function waitForExit(child) {
  return new Promise(resolve => {
    child.once("exit", () => resolve());
  });
}

async function previewBeforePublish({ datePath, slug }) {
  if (!process.stdin.isTTY) {
    throw new Error(
      "Local preview confirmation requires an interactive terminal. Re-run in your terminal, or pass --yes to skip preview."
    );
  }

  console.log("\nStarting local preview server...");
  const child = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let origin = "http://localhost:4321";

  child.stdout.on("data", chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    const match = text.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+/);
    if (match) origin = match[0].replace("127.0.0.1", "localhost");
  });
  child.stderr.on("data", chunk => process.stderr.write(chunk));

  await new Promise(resolve => setTimeout(resolve, 2500));

  const previewUrl = `${origin}/${datePath}/${slug}/`;
  console.log(`\nPreview URL: ${previewUrl}`);
  console.log("Check the local page, especially images and layout.");

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question("Publish after local preview? [y/N] ");
  rl.close();

  child.kill("SIGTERM");
  await waitForExit(child);

  if (!/^y(es)?$/i.test(answer.trim())) {
    throw new Error("Publish cancelled after local preview.");
  }
}

// --- main ------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const isDraft = args.includes("--draft");
  const skipPreview = args.includes("--yes");
  const fileArg = args.find(arg => !arg.startsWith("--"));
  const filePath = fileArg ? resolve(fileArg) : "";

  if (!filePath || !existsSync(filePath)) {
    console.error("Usage: npm run publish -- <path-to-md-file> [--draft]");
    process.exit(1);
  }

  const provider = resolveProvider();
  const model = getModel(provider);
  const apiKey = getApiKey(provider);

  const raw = readFileSync(filePath, "utf-8");
  const { fm, body } = parseFrontmatter(raw);
  const slug = basename(filePath, extname(filePath));
  const title = fm.title || extractTitle(body) || slug;
  const cleanBody = stripTyporaToc(fm.title ? body : stripTitle(body));
  const sourceLang = fm.lang || detectLanguage(`${title}\n\n${cleanBody}`);
  const { datePath, iso } = getDateInfo();

  if (!apiKey) {
    const keyName =
      provider === "deepseek" ? "DEEPSEEK_API_KEY" : "ANTHROPIC_API_KEY";
    console.error(`Error: ${keyName} is not set.`);
    console.error(
      "Set LLM_PROVIDER=deepseek to force DeepSeek, or LLM_PROVIDER=anthropic to force Anthropic."
    );
    process.exit(1);
  }

  console.log(`\nProcessing: "${title}"`);
  console.log(`Source language: ${sourceLang === "zh-cn" ? "Chinese" : "English"}`);
  console.log(`Publishing mode: ${isDraft ? "draft only" : "build, commit, push"}\n`);
  console.log(
    `Calling ${provider} (${model}) for translation, proofreading, and formatting...`
  );

  const meta = await callLLM({
    provider,
    model,
    title,
    body: cleanBody,
    sourceLang,
    slug,
  });
  const tagsZh = normalizeTags(meta.tags_zh);
  const tagsEn = tagsZh.map(tag => TAGS[tag] ?? "musings");
  const titleZh = requiredText(meta.title_zh || title, "title_zh");
  const titleEn = requiredText(meta.title_en || title, "title_en");
  const descriptionZh = requiredText(meta.description_zh, "description_zh");
  const descriptionEn = requiredText(meta.description_en, "description_en");
  const bodyZh = requiredText(meta.body_zh, "body_zh");
  const bodyEn = requiredText(meta.body_en, "body_en");
  const localized = await localizeImages({
    bodies: { zh: bodyZh, en: bodyEn },
    sourceBody: cleanBody,
    sourceFilePath: filePath,
    datePath,
    slug,
  });

  const zhDir = join(POSTS_DIR, datePath);
  const enDir = join(POSTS_DIR, "en", datePath);
  mkdirSync(zhDir, { recursive: true });
  mkdirSync(enDir, { recursive: true });

  const zhFile = join(zhDir, `${slug}.md`);
  const enFile = join(enDir, `${slug}.md`);
  const zhRel = `src/content/posts/${datePath}/${slug}.md`;
  const enRel = `src/content/posts/en/${datePath}/${slug}.md`;

  writeFileSync(
    zhFile,
    `${buildFrontmatter({
      iso,
      title: titleZh,
      draft: isDraft,
      tags: tagsZh,
      description: descriptionZh,
    })}\n\n${localized.bodies.zh}\n`
  );
  console.log(`Wrote Chinese post: ${zhRel}`);

  writeFileSync(
    enFile,
    `${buildFrontmatter({
      iso,
      title: titleEn,
      draft: isDraft,
      lang: "en",
      tags: tagsEn,
      description: descriptionEn,
    })}\n\n${localized.bodies.en}\n`
  );
  console.log(`Wrote English post: ${enRel}`);

  if (localized.assets.length > 0) {
    console.log("\nLocalized images:");
    for (const asset of localized.assets) console.log(`- ${asset}`);
  }

  if (Array.isArray(meta.review_notes) && meta.review_notes.length > 0) {
    console.log("\nEditorial notes:");
    for (const note of meta.review_notes) console.log(`- ${note}`);
  }

  console.log("\nRunning production build...");
  run("npm", ["run", "build"]);

  if (isDraft) {
    console.log("\nSaved as draft. Build passed; no commit or push was made.");
    return;
  }

  if (!skipPreview) {
    await previewBeforePublish({ datePath, slug });
  }

  console.log("\nCommitting and pushing...");
  git(["add", zhRel, enRel, `public/uploads/${datePath}/${slug}`]);
  git(["commit", "-m", `add: ${titleZh}`]);
  git(["push"]);

  console.log(`\nPublished: https://blog.haogre.com/${datePath}/${slug}/`);
}

main().catch(err => {
  console.error("\nError:", err.message);
  process.exit(1);
});
