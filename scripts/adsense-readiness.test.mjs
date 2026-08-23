import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = path => readFileSync(resolve(root, path), "utf8");

test("localized trust pages and ads.txt exist", () => {
  for (const path of [
    "src/content/pages/about.md",
    "src/content/pages/en/about.md",
    "src/content/pages/privacy.md",
    "src/content/pages/en/privacy.md",
    "src/content/pages/contact.md",
    "src/content/pages/en/contact.md",
    "public/ads.txt",
  ]) {
    assert.equal(existsSync(resolve(root, path)), true, `${path} is missing`);
  }

  assert.equal(
    read("public/ads.txt").trim(),
    "google.com, pub-6427878095783791, DIRECT, f08c47fec0942fa0"
  );
});

test("shared navigation exposes trust pages and the home page renders its introduction", () => {
  assert.match(read("src/components/Footer.astro"), /TrustLinks/);
  assert.match(read("src/pages/index.astro"), /t\.home\.intro/);
});
