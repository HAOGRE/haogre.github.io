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
