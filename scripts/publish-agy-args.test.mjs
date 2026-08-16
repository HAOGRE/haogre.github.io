import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import test from "node:test";

test("callAgy does not pass unsupported timeout flags to agy", async () => {
  const dir = mkdtempSync(join(tmpdir(), "publish-agy-"));
  const argsFile = join(dir, "args.txt");
  const fakeAgy = join(dir, "agy");
  writeFileSync(
    fakeAgy,
    [
      "#!/bin/sh",
      `printf '%s\\n' \"$@\" > \"${argsFile}\"`,
      "printf '%s\\n' '{\"ok\":true}'",
    ].join("\n")
  );
  chmodSync(fakeAgy, 0o755);

  process.env.AGY_COMMAND = fakeAgy;
  process.env.AGY_TIMEOUT_MS = "1000";

  const { callAgy } = await import(`./publish.mjs?agy-test=${Date.now()}`);
  const prompt = "Return exactly this JSON: {\"ok\":true}";
  await callAgy({ prompt });

  const args = readFileSync(argsFile, "utf8").trim().split("\n");
  assert.deepEqual(args, ["--print", prompt]);
});
