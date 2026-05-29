# HAOGRE's blog

This repository powers [blog.haogre.com](https://blog.haogre.com/).

The site has been migrated from a generated Hexo/NexT static export to
[AstroPaper](https://github.com/satnaing/astro-paper). Legacy article URLs are
kept, so old links such as `/2021/03/14/def/SLA/` still resolve directly.

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
