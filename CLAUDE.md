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

- `--preview`:**推荐预览方式**。push 前跑 `npm run build` + 起本地预览,交互确认后再推。中英双版都生成(`draft:false`),dev 里都能看到。
- `--draft`:只写文件,不 commit/push(翻译仍执行)。**注意**:写的是 `draft:true`,而 postFilter 在 dev 也过滤 draft,所以 `--draft` 写的文件 dev 看不到——预览用 `--preview`,不是 `--draft`。
- `--yes`:跳过预览确认

### 正确的预览流程(别手动塞文件)

写完一篇 md 想先看再发,**直接跑 `publish --preview`,不要手动把文件复制进 `src/content/posts/`**。手动塞文件不会触发翻译,只有中文版,且会绕过图片本地化和 frontmatter 规范。`--preview` 是脚本内置的"翻译→写双版→构建→本地预览→确认才推"一条龙。

### 不自动执行的常见原因

- API key 没配 → 脚本在翻译步报 `ANTHROPIC_API_KEY is not set` 退出(DeepSeek key 同理)
- 翻译返回非法 JSON → 检查模型/网络,或换 provider 重试
- 同篇重发改了 slug → 脚本会按 `translationKey` 清理旧文件,无需手动删
- **中文 slug 带了后缀** → 源文件名就是中文 URL slug,别起 `xxx-source.md` 之类的名

## 文件结构

- `src/content/posts/<年>/<月>/<日>/<标题>.md`:中文文章,路径即 URL
- `src/content/posts/en/...`:英文版,镜像目录
- `src/content/pages/`:静态页(about 等)
- `public/uploads/`:文章图片
- `src/content.config.ts`:frontmatter schema(必填 pubDatetime/title/description/tags)

## 手动改文章

已发布的文章改内容后,直接改 md 文件 + commit + push 即可,无需重跑 publish。需要显示更新时间则补 `modDatetime` 字段。
