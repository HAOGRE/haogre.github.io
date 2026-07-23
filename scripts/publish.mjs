#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Usage: npm run publish -- <path-to-md-file> [--draft] [--preview]
 *
 * Drop any .md file here. The script will:
 *   1. Detect whether the source is Chinese or English
 *   2. Ask agy, with Codex CLI as a fallback, to proofread and create the bilingual version
 *   3. Localize images to public/uploads/
 *   4. Write Chinese and English posts to the Astro content tree
 *   5. Commit and push (GitHub Actions handles the build + deploy)
 *
 * Flags:
 *   --stage    Translate + localize + write files (draft:false), no commit/push.
 *              Preview with `npm run dev`, then publish with `--go`.
 *   --manual-en <file>  Use a human-written English companion instead of an LLM.
 *   --go       Commit + push the previously --staged post. No LLM call.
 *   --draft    Write files only (draft:true); no commit or push.
 *   --preview  Run local build + preview server before pushing (needs a TTY).
 *   --yes      Skip the interactive confirmation inside --preview mode.
 *
 * Translation is handled by the locally authenticated agy CLI, with Codex CLI
 * as an automatic fallback. No API key is required.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join, basename, extname, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawn } from "child_process";
import { createInterface } from "readline/promises";
import slugify from "slugify";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");
const UPLOADS_DIR = join(ROOT, "public/uploads");

// Auto-load .env.local (gitignored) for optional local CLI configuration.
try {
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const eqIdx = line.indexOf("=");
    if (eqIdx < 1 || line.trim().startsWith("#")) continue;
    const k = line.slice(0, eqIdx).trim();
    const v = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch { /* .env.local is optional */ }

function readTimeout(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const AGY_COMMAND = process.env.AGY_COMMAND || "agy";
const CODEX_COMMAND = process.env.CODEX_COMMAND || "codex";
const AGY_TIMEOUT_MS = readTimeout("AGY_TIMEOUT_MS", 5 * 60 * 1000);
const CODEX_TIMEOUT_MS = readTimeout("CODEX_TIMEOUT_MS", 5 * 60 * 1000);

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
  if (fields.translationKey) {
    lines.push(`translationKey: "${yamlEscape(fields.translationKey)}"`);
  }
  lines.push(`tags:`);
  for (const t of fields.tags) lines.push(`  - "${t}"`);
  lines.push(`description: "${yamlEscape(fields.description)}"`);
  lines.push(`---`);
  return lines.join("\n");
}

function normalizeTags(tagsZh) {
  // Accept any tags the LLM returns (open vocabulary), min 3, max 5
  if (Array.isArray(tagsZh) && tagsZh.length >= 3) return tagsZh.slice(0, 5);
  // Pad with fallback tags if LLM returned fewer than 3
  const base = Array.isArray(tagsZh) ? tagsZh : [];
  const fallbacks = ["随笔", "碎片", "其他"].filter(t => !base.includes(t));
  return [...base, ...fallbacks].slice(0, 3);
}

/**
 * Delete any .md files in `dir` whose frontmatter translationKey matches,
 * except the file we're about to write (skipPath). Handles slug changes
 * across re-runs without requiring manual cleanup.
 */
function removeStalePost(dir, translationKey, skipPath) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    const fullPath = join(dir, name);
    if (fullPath === skipPath) continue;
    try {
      const content = readFileSync(fullPath, "utf-8");
      if (content.includes(`translationKey: "${translationKey}"`)) {
        unlinkSync(fullPath);
        console.log(`Removed stale post: ${fullPath.replace(ROOT + "/", "")}`);
      }
    } catch { /* skip */ }
  }
}

/** Extract tags list from a post's raw markdown (handles YAML list syntax). */
function extractTagsFromContent(content) {
  const m = content.match(/^tags:\s*\n((?:[ \t]+-[ \t]+"[^"]+"\n?)+)/m);
  if (!m) return [];
  return [...m[1].matchAll(/[ \t]+-[ \t]+"([^"]+)"/g)].map(x => x[1]);
}

/**
 * Collect all Chinese tags currently used across posts (excl. en/ subtree).
 * Seeds with the hardcoded TAGS so the LLM always sees the canonical set.
 */
function collectExistingTags() {
  const tagSet = new Set(Object.keys(TAGS));

  function scan(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name !== "en") scan(join(dir, entry.name));
      } else if (entry.name.endsWith(".md")) {
        try {
          const tags = extractTagsFromContent(
            readFileSync(join(dir, entry.name), "utf-8")
          );
          tags.forEach(t => tagSet.add(t));
        } catch { /* skip unreadable files */ }
      }
    }
  }

  scan(POSTS_DIR);
  return [...tagSet];
}

function requiredText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Translation response is missing required field: ${field}`);
  }
  return value.trim();
}

function parseTranslationJson(text) {
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
    throw new Error("Translation CLI did not return valid JSON.");
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
  const htmlImagePattern =
    /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;
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

  while ((match = htmlImagePattern.exec(body)) !== null) {
    refs.push({
      raw: match[0],
      alt: "",
      src: match[2].trim(),
      rest: "",
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

function slugifyRouteSegment(value, fallback) {
  const slug = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
  return slug || fallback;
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
  if (mapped) return isHttpUrl(mapped) ? mapped : resolve(dirname(sourceFilePath), mapped);

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
    localizedBodies[key] = body
      .replace(
        /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)([^)]*)\)/g,
        (full, alt, rawSrc, rest) => {
          const src = rawSrc.trim().replace(/^<|>$/g, "");
          const localized = srcToPublicPath.get(src);
          return localized ? `![${alt}](${localized}${rest})` : full;
        }
      )
      .replace(
        /(<img\b[^>]*\bsrc\s*=\s*)(["'])(.*?)\2/gi,
        (full, prefix, quote, rawSrc) => {
          const src = rawSrc.trim();
          const localized = srcToPublicPath.get(src);
          return localized ? `${prefix}${quote}${localized}${quote}` : full;
        }
      );
  }

  return { bodies: localizedBodies, assets: [...srcToPublicPath.values()] };
}

/**
 * Hard-fail if any external image survived localization, or if the English
 * body came back untranslated. Silent leftovers were the #1 recurring bug.
 */
function assertPublishable(bodies) {
  const leftovers = [];
  for (const [lang, body] of Object.entries(bodies)) {
    for (const m of body.matchAll(/!\[[^\]]*\]\(\s*<?(https?:\/\/[^)\s>]+)/g)) {
      leftovers.push(`${lang}: ${m[1]}`);
    }
    for (const m of body.matchAll(/<img\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)/gi)) {
      leftovers.push(`${lang}: ${m[1]}`);
    }
  }
  if (leftovers.length > 0) {
    throw new Error(
      `External images were not localized:\n  ${leftovers.join("\n  ")}\n` +
        "If a URL contains parentheses or spaces, wrap it in <angle brackets> in the source and re-run."
    );
  }
  if (detectLanguage(bodies.en) === "zh-cn") {
    throw new Error(
      "English body still looks Chinese — the translation CLI skipped the translation. Re-run after checking the source and CLI configuration."
    );
  }
}

const STATE_FILE_NAME = ".publish-staged.json";

function publishStaged() {
  const stateFile = join(ROOT, STATE_FILE_NAME);
  if (!existsSync(stateFile)) {
    console.error("No staged post found. Run: npm run publish -- <file> --stage");
    process.exit(1);
  }
  const s = JSON.parse(readFileSync(stateFile, "utf-8"));
  for (const rel of [s.zhRel, s.enRel]) {
    if (!existsSync(join(ROOT, rel))) {
      console.error(`Staged file missing: ${rel}. Re-run --stage.`);
      process.exit(1);
    }
  }

  console.log("Committing and pushing staged post...");
  const addPaths = [s.zhRel, s.enRel];
  if (s.assetsDir) addPaths.push(s.assetsDir);
  git(["add", ...addPaths]);
  git(["commit", "-m", `add: ${s.titleZh}`]);
  git(["push"]);
  unlinkSync(stateFile);

  console.log(`\nPushed! GitHub Actions is building the site (~2 min).`);
  console.log(`Chinese: https://blog.haogre.com/${s.datePath}/${s.slug}/`);
  console.log(`English: https://blog.haogre.com/en/${s.datePath}/${s.enSlug}/`);
}

function run(command, args) {
  execFileSync(command, args, { cwd: ROOT, stdio: "inherit" });
}

function git(args) {
  run("git", args);
}

function buildPrompt({ title, body, sourceLang, slug, existingTags }) {
  const sourceLabel = sourceLang === "zh-cn" ? "Chinese" : "English";

  return [
    "You are the publishing editor for a bilingual personal blog at haogre.com.",
    "",
    "Source language: " + sourceLabel,
    "Source title: " + (title || slug),
    "",
    "Source markdown:",
    body,
    "",
    "Create publication-ready Chinese and English versions.",
    "",
    "Rules:",
    "- Return a single JSON object only. No markdown fences, no explanation.",
    "- Preserve Markdown structure, tables, links, images, HTML, MDX, and code fences.",
    "- Do not translate code blocks, URLs, file names, keyboard shortcuts, API names, product names, or shell commands.",
    "- Translate and polish only human-readable prose.",
    "- Remove obvious Typora-only artifacts such as a standalone [TOC].",
    "- Keep personal voice natural and restrained. Do not add facts that are not in the source.",
    "- For Chinese, use natural Simplified Chinese and clean spacing around English terms/numbers when useful.",
    "- For English, use natural blog English, not literal translation.",
    "- Descriptions must be concise search/social summaries, not copied opening paragraphs.",
    "",
    "Tag rules:",
    "- Existing tags used in this blog (prefer reusing these): " + existingTags.join(", "),
    "- Choose at least 3 Chinese tags (3-5 total). Prefer existing tags; introduce new ones only when existing tags don't fit.",
    "- You may introduce up to 2 new Chinese tags if the existing list doesn't cover the content well.",
    "- tags_en must be a parallel array with the same length as tags_zh.",
    "- For existing tags, use their established English forms: 随笔→musings, 碎片→fragments, 其他→miscellaneous, 病历→health-notes.",
    "- For any new tag, provide a clean lowercase English slug (e.g., \"indie-hacker\", \"productivity\").",
    "",
    "JSON shape:",
    "{",
    "  \"title_zh\": \"Final Chinese title\",",
    "  \"title_en\": \"Final English title\",",
    "  \"description_zh\": \"Chinese description, <= 80 Chinese chars\",",
    "  \"description_en\": \"English description, <= 120 chars\",",
    "  \"tags_zh\": [\"随笔\", \"其他\", \"tag3\"],",
    "  \"tags_en\": [\"musings\", \"miscellaneous\", \"tag3-en\"],",
    "  \"body_zh\": \"Full Chinese markdown body\",",
    "  \"body_en\": \"Full English markdown body\",",
    "  \"review_notes\": [\"Short human-readable notes about changes or publication risks\"]",
    "}",
  ].join("\n");
}

// --- Translation CLI calls -------------------------------------------------

function runTranslationCli({ command, args, prompt, timeoutMs, stdin = false }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    let timer;

    const finish = (error, output) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(output);
    };

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("error", error => finish(error));
    child.on("close", code => {
      if (timedOut) {
        finish(new Error(command + " timed out after " + timeoutMs + "ms"));
        return;
      }
      if (code !== 0) {
        const detail = stderr.trim() ? ": " + stderr.trim().slice(-1000) : "";
        finish(new Error(command + " exited with code " + code + detail));
        return;
      }
      if (!stdout.trim()) finish(new Error(command + " returned empty output"));
      else finish(null, stdout);
    });

    timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1000).unref();
    }, timeoutMs);

    if (stdin) child.stdin.end(prompt);
    else child.stdin.end();
  });
}

async function callAgy({ prompt }) {
  const args = ["--print", "--print-timeout", Math.ceil(AGY_TIMEOUT_MS / 1000) + "s"];
  if (process.env.AGY_MODEL) args.push("--model", process.env.AGY_MODEL);
  args.push(prompt);
  const output = await runTranslationCli({
    command: AGY_COMMAND,
    args,
    prompt,
    timeoutMs: AGY_TIMEOUT_MS,
  });
  return parseTranslationJson(output);
}

async function callCodex({ prompt }) {
  const args = ["exec", "--ephemeral", "--skip-git-repo-check", "-s", "read-only"];
  if (process.env.CODEX_MODEL) args.push("--model", process.env.CODEX_MODEL);
  args.push("-");
  const output = await runTranslationCli({
    command: CODEX_COMMAND,
    args,
    prompt,
    timeoutMs: CODEX_TIMEOUT_MS,
    stdin: true,
  });
  return parseTranslationJson(output);
}

async function callLLM({ title, body, sourceLang, slug, existingTags }) {
  const prompt = buildPrompt({ title, body, sourceLang, slug, existingTags });
  try {
    console.log("Calling agy (" + AGY_COMMAND + ") for translation, proofreading, and formatting...");
    return await callAgy({ prompt });
  } catch (err) {
    console.warn("agy failed (" + err.message + "); falling back to Codex...");
    try {
      console.log("Calling Codex (" + CODEX_COMMAND + ") for translation, proofreading, and formatting...");
      return await callCodex({ prompt });
    } catch (fallbackErr) {
      throw new Error("agy and Codex translation failed. agy: " + err.message + "; Codex: " + fallbackErr.message);
    }
  }
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
  const isStage = args.includes("--stage");
  const withPreview = args.includes("--preview");
  const skipPreview = args.includes("--yes"); // kept for back-compat; rarely needed now
  const manualEnIdx = args.indexOf("--manual-en");
  const manualEnArg = manualEnIdx >= 0 ? args[manualEnIdx + 1] : null;
  const isManualBilingual = Boolean(manualEnArg);
  const manualEnValueIndex = manualEnIdx >= 0 ? manualEnIdx + 1 : -1;
  const fileArg = args.find((arg, index) => !arg.startsWith("--") && index !== manualEnValueIndex);
  const filePath = fileArg ? resolve(fileArg) : "";

  if (args.includes("--go")) {
    publishStaged();
    return;
  }

  if (!filePath || !existsSync(filePath) || (isManualBilingual && !existsSync(resolve(manualEnArg)))) {
    console.error("Usage: npm run publish -- <path-to-md-file> [--manual-en <english-md>] [--stage|--draft] | --go");
    process.exit(1);
  }

  const raw = readFileSync(filePath, "utf-8");
  const { fm, body } = parseFrontmatter(raw);
  const slug = basename(filePath, extname(filePath));
  const title = fm.title || extractTitle(body) || slug;
  const cleanBody = stripTyporaToc(fm.title ? body : stripTitle(body));
  const sourceLang = fm.lang || detectLanguage(`${title}\n\n${cleanBody}`);
  const { datePath, iso } = getDateInfo();

  console.log(`\nProcessing: "${title}"`);
  console.log(`Source language: ${sourceLang === "zh-cn" ? "Chinese" : "English"}`);
  console.log(`Publishing mode: ${isDraft ? "draft only (no commit)" : isStage ? "stage for preview (no commit until --go)" : withPreview ? "build + preview + push" : "translate → push (CI builds)"}\n`);
  const existingTags = collectExistingTags();
  let meta;
  let englishSourcePath = null;
  if (isManualBilingual) {
    englishSourcePath = resolve(manualEnArg);
    const englishRaw = readFileSync(englishSourcePath, "utf-8");
    const { fm: enFm, body: enBody } = parseFrontmatter(englishRaw);
    const englishTitle = enFm.title || extractTitle(enBody) || basename(englishSourcePath, extname(englishSourcePath));
    const cleanEnglishBody = stripTyporaToc(enFm.title ? enBody : stripTitle(enBody));
    const firstParagraph = value => value.replace(/^>.*$/gm, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\n\s*\n/).map(x => x.replace(/[#*_`]/g, "").trim()).find(Boolean) || value.slice(0, 120);
    meta = {
      title_zh: title,
      title_en: englishTitle,
      description_zh: fm.description || fm.subtitle || firstParagraph(cleanBody).slice(0, 80),
      description_en: enFm.description || enFm.subtitle || firstParagraph(cleanEnglishBody).slice(0, 120),
      tags_zh: ["AI", "编程", "商业"],
      tags_en: ["ai", "programming", "business"],
      body_zh: cleanBody,
      body_en: cleanEnglishBody,
      review_notes: ["Used human-written Chinese and English sources; skipped LLM translation."],
    };
    console.log("Using human-written English companion; skipping LLM translation.");
  } else {
    console.log(`Existing tags: ${existingTags.join(", ")}`);
    meta = await callLLM({ title, body: cleanBody, sourceLang, slug, existingTags });
  }
  const tagsZh = normalizeTags(meta.tags_zh);
  // Use LLM-provided English tags when available; fall back to known mappings
  const tagsEn = Array.isArray(meta.tags_en) && meta.tags_en.length === tagsZh.length
    ? meta.tags_en.slice(0, 3)
    : tagsZh.map(t => TAGS[t] ?? slugifyRouteSegment(t, "misc"));
  const titleZh = requiredText(meta.title_zh || title, "title_zh");
  const titleEn = requiredText(meta.title_en || title, "title_en");
  const translationKey = slug;
  const enSlug = slugifyRouteSegment(titleEn, slug);
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
  assertPublishable(localized.bodies);

  const zhDir = join(POSTS_DIR, datePath);
  const enDir = join(POSTS_DIR, "en", datePath);
  mkdirSync(zhDir, { recursive: true });
  mkdirSync(enDir, { recursive: true });

  const zhFile = join(zhDir, `${slug}.md`);
  const enFile = join(enDir, `${enSlug}.md`);
  const zhRel = `src/content/posts/${datePath}/${slug}.md`;
  const enRel = `src/content/posts/en/${datePath}/${enSlug}.md`;

  // Remove any stale posts from a previous run that share the same translationKey
  // but may have a different slug (e.g., LLM produced a different English title).
  removeStalePost(zhDir, translationKey, zhFile);
  removeStalePost(enDir, translationKey, enFile);

  writeFileSync(
    zhFile,
    `${buildFrontmatter({
      iso,
      title: titleZh,
      draft: isDraft,
      translationKey,
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
      translationKey,
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

  if (isDraft) {
    console.log("\nSaved as draft. No commit or push was made.");
    console.log(`Files written to:\n  ${zhRel}\n  ${enRel}`);
    return;
  }

  if (isStage) {
    writeFileSync(
      join(ROOT, STATE_FILE_NAME),
      JSON.stringify(
        {
          zhRel,
          enRel,
          assetsDir:
            localized.assets.length > 0
              ? `public/uploads/${datePath}/${slug}`
              : null,
          titleZh,
          datePath,
          slug,
          enSlug,
        },
        null,
        2
      ) + "\n"
    );
    console.log("\nStaged for preview (nothing committed). Preview with `npm run dev`:");
    console.log(`  Chinese: http://localhost:4321/${datePath}/${slug}/`);
    console.log(`  English: http://localhost:4321/en/${datePath}/${enSlug}/`);
    console.log("Publish with: npm run publish -- --go");
    return;
  }

  if (withPreview) {
    // Opt-in: local build + manual confirmation before push.
    // Useful when you want to visually verify layout or translation before going live.
    console.log("\nRunning production build for local preview...");
    run("npm", ["run", "build"]);
    if (!skipPreview) {
      await previewBeforePublish({ datePath, slug });
    }
  }

  console.log("\nCommitting and pushing...");
  const addPaths = [zhRel, enRel];
  if (localized.assets.length > 0) addPaths.push(`public/uploads/${datePath}/${slug}`);
  git(["add", ...addPaths]);
  git(["commit", "-m", `add: ${titleZh}`]);
  git(["push"]);

  console.log(`\nPushed! GitHub Actions is building the site (~2 min).`);
  console.log(`Chinese: https://blog.haogre.com/${datePath}/${slug}/`);
  console.log(`English: https://blog.haogre.com/en/${datePath}/${enSlug}/`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error("\nError:", err.message);
    process.exit(1);
  });
}

export { callAgy, callCodex, runTranslationCli };
