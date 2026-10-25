# HAOGRE's blog

This repository powers [blog.haogre.com](https://blog.haogre.com/).

## Commands

```bash
npm ci
npm run import:legacy
npm run dev
npm run build
npm run preview
npm run images:optimize # Optional: warm the image cache and report byte savings
```

## Content

- Posts live in `src/content/posts/`.
- The about page lives in `src/content/pages/about.md`.
- Static assets from the old site are copied to `public/uploads/` and
  `public/images/`.
- `public/CNAME` keeps GitHub Pages bound to `blog.haogre.com`.

## Publishing

```bash
npm run publish -- /path/to/article.md --stage
```

`npm run publish` accepts either Chinese or English Markdown, creates both
language versions, and downloads article images into `public/uploads/`. The
translation step uses the locally authenticated `agy` CLI first and falls back
to the locally authenticated Codex CLI if agy fails. No API key is required.

Install and log in to both CLIs before publishing. Optional configuration:
`AGY_COMMAND`, `AGY_MODEL`, `AGY_TIMEOUT_MS`, `CODEX_COMMAND`,
`CODEX_MODEL`, and `CODEX_TIMEOUT_MS`.

Use `--yes` only when you intentionally want to skip the interactive preview
confirmation.

## Image optimization and performance

Markdown images and HTML `<img>` tags pointing to `/uploads/` are automatically
converted at build/dev time with the open-source [Sharp](https://sharp.pixelplumbing.com/)
library. No manual compression step or external image service is required.
The existing stage → preview → go publishing workflow continues to work.

- WebP quality 80, with widths up to 480 / 768 / 1536 px, without upscaling.
- Responsive `srcset` and `sizes`, dimensions to reserve layout space, asynchronous
  decoding, and lazy loading after the first image.
- Original uploads, SVGs, and animated images are preserved. Derivatives live in
  the ignored `public/_images/` directory and are copied into the deployment.
- Content hashes invalidate image URLs when pixels or encoding settings change.
  Bump `VERSION` in `scripts/image-optimizer.mjs` when changing encoding options.
  GitHub Actions caches derivatives to avoid recompressing unchanged images.
- Analytics events queue immediately; Google Analytics and AdSense scripts load
  after a three-second delay and an idle callback (at most two additional seconds).
  Very brief visits may end before the analytics queue is sent.

See [the performance audit and hosting recommendations](docs/performance.md).
