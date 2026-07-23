import assert from "node:assert/strict";
import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const binDir = await mkdtemp(join(tmpdir(), "haogre-publish-cli-"));
const agyPath = join(binDir, "agy");
const codexPath = join(binDir, "codex");
const response = JSON.stringify({ body_en: "English", body_zh: "中文" });

await writeFile(agyPath, `#!/bin/sh
if [ "$MOCK_AGY_FAIL" = "1" ]; then
  echo "agy unavailable" >&2
  exit 1
fi
printf '%s' '${response}'
`);
await writeFile(codexPath, `#!/bin/sh
cat >/dev/null
printf '%s' '${response}'
`);
await chmod(agyPath, 0o755);
await chmod(codexPath, 0o755);

process.env.AGY_COMMAND = agyPath;
process.env.CODEX_COMMAND = codexPath;
process.env.AGY_TIMEOUT_MS = "2000";
process.env.CODEX_TIMEOUT_MS = "2000";

const { callAgy, callCodex } = await import("./publish.mjs");

test("agy returns parsed translation JSON", async () => {
  delete process.env.MOCK_AGY_FAIL;
  const result = await callAgy({ prompt: "translate this" });
  assert.equal(result.body_en, "English");
});

test("Codex CLI can be used after agy failure", async () => {
  process.env.MOCK_AGY_FAIL = "1";
  await assert.rejects(() => callAgy({ prompt: "translate this" }));
  const result = await callCodex({ prompt: "translate this" });
  assert.equal(result.body_zh, "中文");
});
