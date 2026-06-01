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
DEEPSEEK_API_KEY=... npm run publish -- /path/to/article.md
```

`npm run publish` accepts either Chinese or English Markdown, creates both
language versions, downloads article images into `public/uploads/`, runs the
production build, starts `npm run dev` for local preview, then commits and
pushes only after you confirm the preview. Set `LLM_PROVIDER=anthropic` with
`ANTHROPIC_API_KEY` to use Anthropic instead, or set `DEEPSEEK_MODEL` /
`ANTHROPIC_MODEL` to override the default model.

Use `--yes` only when you intentionally want to skip the interactive preview
confirmation.
