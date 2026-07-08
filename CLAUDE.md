# Project: haogre.github.io

AstroPaper 博客,部署在 GitHub Pages。push 到 master 触发 `.github/workflows/deploy.yml` 自动构建部署。

## 发布流程

写好一篇 md 后,**用脚本发布,不要手动建文件 + git push**。脚本会自动翻译、生图、写双版、commit、push。

### 前置(只需一次)

`.env.local`(已 gitignore)里配好 LLM key,二选一:

```
ANTHROPIC_API_KEY=...
# 或
DEEPSEEK_API_KEY=...
```

默认优先 DeepSeek。强制某家:`LLM_PROVIDER=anthropic` 或 `deepseek`。
模型:`ANTHROPIC_MODEL`(默认 claude-opus-4-7)/ `DEEPSEEK_MODEL`(默认 deepseek-chat)。

### 发布命令

```bash
# 方式 A:从草稿开始(推荐,先预览再发)
npm run new -- "文章标题"          # 建 src/content/posts/YYYY/MM/DD/<标题>.md,draft:true
# 编辑文件,写正文
npm run dev                       # 本地预览
npm run publish -- src/content/posts/YYYY/MM/DD/<标题>.md

# 方式 B:直接发一个写好的 md(任意路径)
npm run publish -- /path/to/article.md
```

`publish.mjs` 做的事:
1. 检测中/英文
2. 调 LLM 润色 + 生成中英双版(翻译、标题、description、tags)
3. 图片本地化到 `public/uploads/YYYY/MM/DD/<slug>/`
4. 写中文版 `src/content/posts/YYYY/MM/DD/<slug>.md` + 英文版 `src/content/posts/en/YYYY/MM/DD/<enSlug>.md`,用 `translationKey` 关联
5. commit + push,GitHub Actions 构建部署

### 常用 flag

- `--draft`:只写文件,不 commit/push(翻译仍执行)
- `--preview`:push 前跑 `npm run build` + 起本地预览,交互确认后再推
- `--yes`:跳过预览确认

### 不自动执行的常见原因

- API key 没配 → 脚本在翻译步报 `ANTHROPIC_API_KEY is not set` 退出
- 翻译返回非法 JSON → 检查模型/网络,或换 provider 重试
- 同篇重发改了 slug → 脚本会按 `translationKey` 清理旧文件,无需手动删

## 文件结构

- `src/content/posts/<年>/<月>/<日>/<标题>.md`:中文文章,路径即 URL
- `src/content/posts/en/...`:英文版,镜像目录
- `src/content/pages/`:静态页(about 等)
- `public/uploads/`:文章图片
- `src/content.config.ts`:frontmatter schema(必填 pubDatetime/title/description/tags)

## 手动改文章

已发布的文章改内容后,直接改 md 文件 + commit + push 即可,无需重跑 publish。需要显示更新时间则补 `modDatetime` 字段。
