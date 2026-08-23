# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve HAOGRE's trust signals and AdSense readiness without removing, hiding, or changing any existing post.

**Architecture:** Keep Astro content collections as the source of truth. Add localized trust-page route wrappers that follow the existing About-page rendering pattern, expose them from the shared footer, render the existing localized homepage introduction, and emit a static root-level `ads.txt` file. Existing post routes, canonical URLs, and AdSense script remain unchanged.

**Tech Stack:** Astro 6, TypeScript, Markdown content collections, Node's built-in test runner, npm scripts.

## Global Constraints

- Keep all 82 existing posts public and unchanged.
- Do not change `https://blog.haogre.com/`, existing post URLs, or the AdSense publisher ID.
- Do not add ad placements while the site is under review.
- Do not submit AdSense review until production output and the deployed pages are verified.

---

### Task 1: Add failing readiness checks

**Files:**
- Create: `scripts/adsense-readiness.test.mjs`

**Interfaces:**
- Consumes: repository files under `src/content/pages`, `src/components/Footer.astro`, `src/pages/index.astro`, and `public/ads.txt`.
- Produces: executable checks for the trust pages, footer links, homepage introduction, and ads.txt declaration.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/adsense-readiness.test.mjs`

Expected: FAIL because the new trust-page files, `public/ads.txt`, and navigation references do not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add scripts/adsense-readiness.test.mjs
git commit -m "test: define AdSense readiness checks"
```

### Task 2: Add localized trust content and ads.txt

**Files:**
- Modify: `src/content/pages/about.md`
- Modify: `src/content/pages/en/about.md`
- Create: `src/content/pages/privacy.md`
- Create: `src/content/pages/en/privacy.md`
- Create: `src/content/pages/contact.md`
- Create: `src/content/pages/en/contact.md`
- Create: `public/ads.txt`

**Interfaces:**
- Consumes: the existing `pages` content collection schema in `src/content.config.ts`.
- Produces: six localized page entries and a root-level AdSense seller declaration.

- [ ] **Step 1: Write the localized page content**

Use frontmatter with `title` and `description` on every file. The Chinese About page must describe HAOGRE and the site's technical, AI/business, systems, creative, and family/life topics. The English About page must communicate the same scope in natural English. Privacy pages must cover Analytics, AdSense cookies/personalized advertising, email handling, external links, retention, and contact for privacy questions. Contact pages must link to `mailto:haogre@gmail.com` and explicitly say that no contact form data is collected.

- [ ] **Step 2: Add the seller declaration**

Create `public/ads.txt` with exactly:

```text
google.com, pub-6427878095783791, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 3: Run the failing test again**

Run: `node --test scripts/adsense-readiness.test.mjs`

Expected: the file-existence and ads.txt assertions pass; the navigation/homepage assertion remains the only failure until Task 3.

- [ ] **Step 4: Commit the content**

```bash
git add src/content/pages public/ads.txt
git commit -m "content: add AdSense trust pages"
```

### Task 3: Expose trust pages and improve homepage identity

**Files:**
- Create: `src/components/TrustLinks.astro`
- Modify: `src/components/Footer.astro`
- Create: `src/pages/privacy.astro`
- Create: `src/pages/en/privacy.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/en/contact.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/lang/zh-cn.ts`
- Modify: `src/i18n/lang/en.ts`

**Interfaces:**
- Consumes: localized page entries from Task 2 and `getRelativeLocaleUrl`.
- Produces: `/privacy/`, `/en/privacy/`, `/contact/`, `/en/contact/`, localized footer links, and a visible homepage introduction.

- [ ] **Step 1: Implement the shared trust-link component**

`TrustLinks.astro` must render three links using `getRelativeLocaleUrl(Astro.currentLocale, ...)`: About, Privacy, and Contact. Add the two new footer translation keys to `UIStrings` and both locale dictionaries.

- [ ] **Step 2: Implement the localized content routes**

Each route must use the existing `Layout`, `Header`, `Breadcrumb`, `Main`, and `Footer` components, load its language-specific `pages` entry with `getEntry`, render `Content`, and pass the entry title/description into `Layout` for canonical and meta tags.

- [ ] **Step 3: Render the localized homepage introduction**

Render `t.home.intro` once near the top of the homepage, and update the Chinese and English strings to identify the site's subject areas rather than describing the migration template.

- [ ] **Step 4: Run the readiness test**

Run: `node --test scripts/adsense-readiness.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the site wiring**

```bash
git add src/components/TrustLinks.astro src/components/Footer.astro src/pages/privacy.astro src/pages/en/privacy.astro src/pages/contact.astro src/pages/en/contact.astro src/pages/index.astro src/i18n/types.ts src/i18n/lang/zh-cn.ts src/i18n/lang/en.ts
git commit -m "feat: add localized trust navigation"
```

### Task 4: Verify production output

**Files:**
- Verify only; do not modify existing post files.

- [ ] **Step 1: Run all repository tests**

Run: `npm test`

Expected: all tests pass, including `adsense-readiness.test.mjs`.

- [ ] **Step 2: Run formatting and lint checks**

Run: `npm run format:check && npm run lint`

Expected: both commands exit successfully.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Astro check, Astro build, and Pagefind complete successfully.

- [ ] **Step 4: Inspect generated routes and preserve post count**

Run: `test -f dist/ads.txt && test -f dist/about/index.html && test -f dist/privacy/index.html && test -f dist/contact/index.html && test -f dist/en/privacy/index.html && test -f dist/en/contact/index.html && test "$(find src/content/posts -type f -name '*.md' ! -path '*/node_modules/*' | wc -l | tr -d ' ')" = "82" && git diff --exit-code 389de3ac6 -- src/content/posts`

Expected: exit code 0.

### Task 5: Deploy, inspect, and prepare AdSense review

- [ ] **Step 1: Publish the verified site through the repository's existing deployment workflow**

Confirm the deployed domain remains `https://blog.haogre.com/`; do not change the AdSense site entry.

- [ ] **Step 2: Inspect deployed trust pages and ads.txt**

Confirm `https://blog.haogre.com/ads.txt`, `/about/`, `/privacy/`, and `/contact/` return the expected content, and repeat for `/en/` routes.

- [ ] **Step 3: Stop before external submission and request action-time confirmation**

The final browser action will check “I confirm I have fixed the issues” and click “Request review” for the existing AdSense site `haogre.com` under the signed-in account. Ask the user for confirmation immediately before those actions.
