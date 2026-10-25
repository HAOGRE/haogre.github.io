import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import sharp from "sharp";

const VERSION = "webp-q80-480-768-1536-v1";
const pending = new Map();

/** Generate cached derivatives; original uploads and article URLs stay intact. */
export async function optimizeImage(src, publicDir) {
  if (!src.startsWith("/uploads/")) return undefined;
  const pathname = decodeURIComponent(src.split(/[?#]/)[0]);
  const source = resolve(publicDir, `.${pathname}`);
  const inside = relative(resolve(publicDir, "uploads"), source);
  if (inside.startsWith("..") || isAbsolute(inside)) return undefined;
  const info = await stat(source);
  const key = `${source}:${info.size}:${info.mtimeMs}`;
  if (!pending.has(key)) {
    const task = generate(source, publicDir);
    pending.set(key, task);
    task.catch(() => pending.delete(key));
  }
  return pending.get(key);
}

async function generate(source, publicDir) {
  const bytes = await readFile(source);
  const metadata = await sharp(bytes).metadata();
  // Preserve vectors and animations rather than rasterizing or dropping frames.
  if (
    !["png", "jpeg", "webp", "avif"].includes(metadata.format) ||
    (metadata.pages ?? 1) > 1
  )
    return undefined;

  const { width, height } = metadata.autoOrient ?? metadata;
  if (!width || !height) return undefined;
  const hash = createHash("sha256")
    .update(VERSION)
    .update(bytes)
    .digest("hex")
    .slice(0, 20);
  const outputDir = join(publicDir, "_images");
  const cachePath = join(outputDir, `${hash}.json`);
  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    await Promise.all(cached.variants.map(v => stat(join(publicDir, v.src))));
    return cached;
  } catch {
    // First build, or an incomplete cache: regenerate before publishing HTML.
  }

  await mkdir(outputDir, { recursive: true });
  const widths = [...new Set([480, 768, 1536].map(w => Math.min(w, width)))];
  const variants = [];
  for (const targetWidth of widths) {
    const name = `${hash}-${targetWidth}.webp`;
    const result = await sharp(bytes)
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    await writeFile(join(outputDir, name), result);
    variants.push({
      src: `/_images/${name}`,
      width: targetWidth,
      bytes: result.length,
    });
  }
  const result = { width, height, originalBytes: bytes.length, variants };
  await writeFile(cachePath, JSON.stringify(result));
  return result;
}
