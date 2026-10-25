# Project: haogre.github.io

AstroPaper 博客,部署在 GitHub Pages。push 到 master 触发 `.github/workflows/deploy.yml` 自动构建部署。

## 发布流程

写好一篇 md 后,**用脚本发布,不要手动建文件 + git push**。脚本会自动翻译、生图、写双版、commit、push。

### 前置(只需一次)

本机登录 `agy` 和 Codex CLI。翻译默认优先调用 `agy`，agy 失败时自动回退
Codex，不再使用 Anthropic/DeepSeek API key。

可选配置：`AGY_COMMAND`、`AGY_MODEL`、`AGY_TIMEOUT_MS`、`CODEX_COMMAND`、
`CODEX_MODEL`、`CODEX_TIMEOUT_MS`。

### 标准流程:stage → 预览 → go(Claude 执行发布时用这个)

用户给一篇 md 后,按这三步走,全程无需交互终端:

```bash
# 1. 暂存:翻译 + 图片本地化 + 写中英双版(draft:false),不 commit 不 push
npm run publish -- /path/to/article.md --stage

# 2. 后台起 dev server,把脚本打印的两个预览 URL 发给用户,等用户确认
npm run dev

# 3. 用户确认后发布(读 .publish-staged.json,commit + push,不再调 LLM)
npm run publish -- --go
```

用户要求改内容时:直接改 `--stage` 写出的两个 md 文件,刷新预览,确认后再 `--go`。
换文章重新 `--stage` 会覆盖暂存状态;放弃发布则删掉写出的文件和 `.publish-staged.json`。

### 其他发布方式

```bash
# 人肉在交互终端发布(--preview 需要 TTY,Claude 跑会失败,用上面的 stage/go)
npm run publish -- /path/to/article.md --preview

# 从草稿开始
npm run new -- "文章标题"          # 建 src/content/posts/YYYY/MM/DD/<标题>.md,draft:true
```

`publish.mjs` 做的事:
1. 检测中/英文
2. 调 LLM 润色 + 生成中英双版(翻译、标题、description、tags)
3. 图片本地化到 `public/uploads/YYYY/MM/DD/<slug>/`
4. 写中文版 `src/content/posts/YYYY/MM/DD/<slug>.md` + 英文版 `src/content/posts/en/YYYY/MM/DD/<enSlug>.md`,用 `translationKey` 关联
5. commit + push,GitHub Actions 构建部署

### 常用 flag

- `--stage` / `--go`:上面的标准两段式,Claude 发布用这个。
- `--preview`:交互终端里的一条龙(build + 预览 + 确认 + push),需要 TTY。
- `--draft`:只写文件,不 commit/push(翻译仍执行)。**注意**:写的是 `draft:true`,而 postFilter 在 dev 也过滤 draft,所以 dev 里看不到——预览用 `--stage`。
- `--yes`:跳过 `--preview` 的确认

### 别手动塞文件

**永远不要手动把文件复制进 `src/content/posts/` 再 git push**。手动塞文件不会触发翻译,只有中文版,且会绕过图片本地化和 frontmatter 规范。一律走 `--stage` → `--go`。

### 脚本内置校验(失败会报错退出,不会静默出错文)

- 外链图片本地化后仍有残留 → 报错并列出 URL(URL 带括号/空格时,在源文件里用 `<尖括号>` 包住再重跑)
- 英文版正文仍是中文(LLM 偷懒没翻)→ 报错
- agy 调用失败、超时或返回非法 JSON → 自动回退 Codex；两者都失败才退出
- LLM 调用失败自动重试一次(截断除外)

### 不自动执行的常见原因

- agy/Codex 未安装或未登录 → 翻译步报错退出，不会写入不完整文章
- 同篇重发改了 slug → 脚本会按 `translationKey` 清理旧文件,无需手动删
- **中文 slug 带了后缀** → 源文件名就是中文 URL slug,别起 `xxx-source.md` 之类的名

## 图片自动压缩（后续 agent 必须遵循）

- 发布仍走 `--stage` → 预览 → 用户确认 → `--go`。图片由发布脚本本地化到 `public/uploads/`，文章使用 `/uploads/...` 引用。
- `npm run dev` 和 `npm run build` 会通过 `scripts/rehype-responsive-images.mjs` 自动调用 Sharp，为本地文章图片生成 WebP 压缩版和响应式尺寸。**不需要 agent 记得额外运行压缩命令，也不要绕过这条自动处理链路。**
- 默认 WebP quality 80，生成最大宽度 480 / 768 / 1536 px 的版本，不放大小图；自动补充 `srcset`、`sizes`、宽高和异步解码，首图之外使用懒加载。Markdown 图片和 HTML `<img>` 都适用。
- 保留 `public/uploads/` 原图及原 URL；SVG 和动画保留原格式。不要为了压缩覆盖原图，也不要把文章引用手动改成生成的哈希路径。
- `public/_images/` 是自动生成、已忽略的缓存，**不要提交到 Git**；生产构建会将其复制到部署产物，GitHub Actions 会复用压缩缓存。
- 可选执行 `npm run images:optimize`，预热缓存并查看体积统计。修改编码参数时同步更新 `scripts/image-optimizer.mjs` 的 `VERSION`，避免旧缓存继续生效。
- 修改图片处理代码后运行 `npm test` 和 `npm run build`，确认文章图片及 `srcset` 指向的资源都存在。替换原图后若 dev 预览未更新，重启 dev server。
- 性能数据、缓存机制和 CDN 建议见 `docs/performance.md`。图片压缩发生在预览／构建阶段，不能把 `publish --stage` 本地化原图本身称为已经压缩。

## 文件结构

- `src/content/posts/<年>/<月>/<日>/<标题>.md`:中文文章,路径即 URL
- `src/content/posts/en/...`:英文版,镜像目录
- `src/content/pages/`:静态页(about 等)
- `public/uploads/`:文章图片
- `src/content.config.ts`:frontmatter schema(必填 pubDatetime/title/description/tags)

## 转发到 X(Twitter)

```bash
npm run x-post -- <文章md路径>
```

输出到 `~/Desktop/x-post/<slug>/`:`post.txt`(长推文纯文本,markdown 转好、脚注变参考资料)+ 文章配图。用户把 post.txt 全文粘贴进发推框、拖入最多 4 张图。需要 X Premium(25k 字长推文,纯文本)。

## 手动改文章

已发布的文章改内容后,直接改 md 文件 + commit + push 即可,无需重跑 publish。需要显示更新时间则补 `modDatetime` 字段。
