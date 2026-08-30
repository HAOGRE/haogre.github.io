import assert from "node:assert/strict";
import test from "node:test";

const { buildPublicUploadPath } = await import(
  `./publish.mjs?image-test=${Date.now()}`
);

test("public upload paths encode slug spaces for Markdown image links", () => {
  assert.equal(
    buildPublicUploadPath("2026/08/30", "article with spaces"),
    "/uploads/2026/08/30/article%20with%20spaces"
  );
});
