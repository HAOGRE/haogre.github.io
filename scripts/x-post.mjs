#!/usr/bin/env node
// 把一篇文章 md 转成 X 长推文纯文本(Premium 25k 字)+ 收集文章配图。
// 用法: npm run x-post -- <文章md路径>
// 输出: ~/Desktop/x-post/<slug>/post.txt + 图片(最多带 4 张进推文)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const SITE = "https://blog.haogre.com";
const file = process.argv[2];
if (!file) {
  console.error("用法: npm run x-post -- <文章md路径>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
const [, fm = "", body = raw] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || [];
const title = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";

// 文章 URL:src/content/posts/(en/)?YYYY/MM/DD/slug.md → 站点路径
const rel = path.resolve(file).split("/content/posts/")[1].replace(/\.md$/, "");
const url = `${SITE}/${rel.split("/").map(encodeURIComponent).join("/")}/`;

let text = body;
const images = [];
const footnotes = []; // [name, def]

// 脚注定义先摘走
text = text.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (_, name, def) => {
  footnotes.push([name, def.trim()]);
  return "";
});
// 图片:摘走路径,正文不留痕
text = text.replace(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)\n?/g, (_, src) => {
  images.push(src);
  return "";
});
// 脚注引用 → 〔n〕(按定义顺序编号)
const fnIndex = new Map(footnotes.map(([name], i) => [name, i + 1]));
text = text.replace(/\[\^([^\]]+)\]/g, (_, name) =>
  fnIndex.has(name) ? `〔${fnIndex.get(name)}〕` : ""
);
// 链接 → 文字 (url);裸链接保留
text = text.replace(/\[([^\]]+)\]\((\S+?)\)/g, "$1 ($2)");
// 标题 → ▍小节
text = text.replace(/^#{1,4}\s+(.+)$/gm, "▍$1");
// 引用块
text = text.replace(/^>\s?(.*)$/gm, "❝ $1");
// 无序列表
text = text.replace(/^(\s*)[-*]\s+/gm, "$1• ");
// 粗体/斜体/行内代码标记去掉
text = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
text = text.replace(/`([^`]+)`/g, "$1");
// 分隔线
text = text.replace(/^---+$/gm, "─────");
// 压缩 3+ 连续空行
text = text.replace(/\n{3,}/g, "\n\n").trim();
// 正文开头如果就是文章标题(原 H1),去掉,别和第一行重复
if (text.startsWith(`▍${title}`)) text = text.slice(title.length + 1).trim();

let out = `${title}\n\n${text}\n\n─────\n原文(排版更好): ${url}`;
if (footnotes.length) {
  out += `\n\n参考资料:\n${footnotes
    .map(([, def], i) => `〔${i + 1}〕 ${def.replace(/\[([^\]]+)\]\((\S+?)\)/g, "$1 $2")}`)
    .join("\n")}`;
}

const slug = path.basename(file, ".md").slice(0, 60);
const outDir = path.join(homedir(), "Desktop", "x-post", slug);
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "post.txt"), out + "\n");

// 图片:/uploads/... → public/uploads/...,拷到输出目录
const repo = path.resolve(file).split("/src/content/")[0];
images.forEach((src, i) => {
  const abs = src.startsWith("/")
    ? path.join(repo, "public", decodeURIComponent(src))
    : path.resolve(path.dirname(file), src);
  try {
    copyFileSync(abs, path.join(outDir, `img-${i + 1}${path.extname(abs)}`));
  } catch {
    console.warn(`⚠ 图片拷贝失败: ${src}`);
  }
});

console.log(`✔ post.txt(约 ${out.length} 字)+ ${images.length} 张图 → ${outDir}`);
if (images.length > 4) console.log(`⚠ X 单条推文最多 4 张图,从 ${images.length} 张里挑 4 张`);
console.log("发法: post.txt 全文粘贴进发推框,再把图片拖进去。");
