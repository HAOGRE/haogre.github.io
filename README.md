# HAOGRE's blog

This repository powers [blog.haogre.com](https://blog.haogre.com/).

## Commands

```bash
npm ci
npm run import:legacy
npm run dev
npm run build
npm run preview
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
