# 全站动态 OG 图设计说明

## 目标

让每篇未显式指定 `ogImage` 的文章在分享时拥有独立的 1200×630 OG 图，不再统一指向 `public/default-og.jpg`。

## 方案

- 开启现有 `features.dynamicOgImage`。
- 继续尊重文章 frontmatter 的显式 `ogImage`；当前没有文章使用该覆盖。
- 将现有 Satori 生成器作为唯一模板：米白背景、双层黑边卡片、文章标题、摘要、标签/语言提示和站点署名。
- 文章 OG 路由保持为文章 URL 下的 `/index.png`，静态构建时为每篇文章生成，页面 meta 自动引用它。
- 非文章页面继续使用 `default-og.jpg`，避免把文章模板误用于 About、搜索等页面。

## 验收

- 构建产物包含每篇文章对应的 `index.png`。
- 中文 Minecraft 文章和英文伴侣的 `<meta property="og:image">` 不再指向 `/default-og.jpg`。
- 生成图片尺寸为 1200×630，标题和站点名可读。
- `npm test`、`astro check`、`astro build` 通过；本地页面和图片路由返回 200。
