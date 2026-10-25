import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { optimizeImage } from "./image-optimizer.mjs";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const entries = await readdir(new URL("../public/uploads/", import.meta.url), {
  recursive: true,
});
let original = 0;
let desktop = 0;
let mobile = 0;
let count = 0;
for (const entry of entries) {
  if (!/\.(png|jpe?g|webp|avif)$/i.test(entry)) continue;
  const image = await optimizeImage(`/uploads/${entry}`, publicDir);
  if (!image) continue;
  original += image.originalBytes;
  desktop += image.variants.at(-1).bytes;
  mobile += image.variants[0].bytes;
  count++;
}
const mb = bytes => `${(bytes / 1e6).toFixed(2)} MB`;
process.stdout.write(
  `${count} images: originals ${mb(original)}, desktop ${mb(desktop)}, mobile ${mb(mobile)}\n`
);
