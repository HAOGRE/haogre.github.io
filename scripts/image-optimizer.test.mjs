import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { optimizeImage } from "./image-optimizer.mjs";
import responsiveImages from "./rehype-responsive-images.mjs";

async function fixture(t, width = 1600, height = 900) {
  const root = await mkdtemp(join(tmpdir(), "blog-images-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "uploads"));
  const file = join(root, "uploads", "中文 image.png");
  await sharp({
    create: { width, height, channels: 4, background: "#2699bb80" },
  })
    .png()
    .toFile(file);
  return { root, src: "/uploads/%E4%B8%AD%E6%96%87%20image.png" };
}

test("encoded upload URLs produce valid WebP sizes, aspect ratios and transparency", async t => {
  const { root, src } = await fixture(t);
  const result = await optimizeImage(src, root);
  assert.equal(result.width, 1600);
  for (const variant of result.variants) {
    const metadata = await sharp(
      await readFile(join(root, variant.src))
    ).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, variant.width);
    assert.equal(metadata.height, (variant.width * 900) / 1600);
    assert.equal(metadata.hasAlpha, true);
  }
  assert.deepEqual(
    result.variants.map(v => v.width),
    [480, 768, 1536]
  );
});

test("small uploads are not enlarged; unrelated URLs and vectors are preserved", async t => {
  const { root, src } = await fixture(t, 120, 80);
  assert.deepEqual(
    (await optimizeImage(src, root)).variants.map(v => v.width),
    [120]
  );
  for (const url of [
    "https://example.com/a.png",
    "/uploads/../favicon.ico",
    "/favicon.ico",
  ]) {
    assert.equal(await optimizeImage(url, root), undefined);
  }
  await writeFile(
    join(root, "uploads", "vector.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>'
  );
  assert.equal(await optimizeImage("/uploads/vector.svg", root), undefined);
});

test("EXIF orientation is applied before calculating dimensions", async t => {
  const { root } = await fixture(t);
  await sharp({
    create: { width: 120, height: 80, channels: 3, background: "red" },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toFile(join(root, "uploads", "rotated.jpg"));
  const result = await optimizeImage("/uploads/rotated.jpg", root);
  assert.equal(result.width, 80);
  assert.equal(result.height, 120);
  const metadata = await sharp(join(root, result.variants[0].src)).metadata();
  assert.equal(metadata.width, 80);
  assert.equal(metadata.height, 120);
});

test("article images reserve space, defer later images and respect explicit display widths", async t => {
  const { root, src } = await fixture(t);
  const first = { type: "element", tagName: "img", properties: { src } };
  const second = {
    type: "element",
    tagName: "img",
    properties: { src, width: 300 },
  };
  await responsiveImages({ publicDir: root })({
    type: "root",
    children: [first, second],
  });
  assert.equal(first.properties.loading, "eager");
  assert.equal(second.properties.loading, "lazy");
  assert.equal(first.properties.decoding, "async");
  assert.equal(first.properties.width, 1600);
  assert.equal(first.properties.height, 900);
  assert.match(first.properties.srcSet, /1536w/);
  assert.equal(second.properties.width, 300);
  assert.equal(second.properties.height, 169);
  assert.equal(
    second.properties.sizes,
    "(max-width: 332px) calc(100vw - 2rem), 300px"
  );
});
