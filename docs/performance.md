# 图片与访问性能优化（2026-10-25）

## 已完成

使用开源 Sharp 在构建时自动生成 WebP，无需给每张图片手工压缩，也不依赖
在线压缩网站。原始上传文件和原有 URL 保留，新旧文章都通过同一套规则处理。
手动压缩、比较画质可使用开源 [Squoosh](https://squoosh.app/)
（[源码](https://github.com/GoogleChromeLabs/squoosh)）。

| 全部可压缩图片（223 张） |  合计体积 | 相对原图减少 |
| ------------------------ | --------: | -----------: |
| 原始 PNG / JPEG / WebP   | 156.86 MB |            — |
| 最大 1536 px WebP        |  26.93 MB |        82.8% |
| 最大 480 px WebP         |   4.48 MB |        97.1% |

这些是文件体积统计，不是某个页面的下载量。浏览器会根据视口和像素密度从
480 / 768 / 1536 px 中选择版本，高分屏手机可能选择较大的版本。
SVG 和动画保留原格式，避免丢失矢量细节或动画帧。

文章图片还增加了宽高、`srcset`、`sizes`、异步解码；首图正常加载，其余图片
懒加载。中英文共用相同图片衍生文件。HTML 表格中的 `<img width="300">`
也保留显示宽度，并按对应尺寸选图。图片哈希缓存由 Actions 复用。

Google Analytics / AdSense 原来在 head 里立刻发起请求，现在延后 3 秒并等待
浏览器空闲（额外最多等 2 秒），减少首屏资源竞争。统计事件先进入队列；
过早离开的访问可能来不及上报。广告延后加载，统计和广告功能仍保留。

## 访问链路仍需核实

本机一次线上首页请求返回 HTTP 200，首字节约 5.87 秒，30 秒超时前只收到
19,137 字节；另一次 HEAD 请求 20 秒连接超时。首页没有文章配图，所以
不能把首页慢全部归因于图片。以上只代表当前机器和网络，不能作为全站或
所有地区的性能结论，也不能据此宣称已改善线上 LCP。

本机 DNS 查询 `blog.haogre.com` 返回 `172.67.143.102` 和 `104.21.39.52`，
属于 Cloudflare 地址。另一次 GET 的响应头确认 `Server: cloudflare`、
`CF-Cache-Status: DYNAMIC`、`Cache-Control: max-age=600`、`Content-Encoding: gzip`。
说明已有 Cloudflare 代理和 gzip，但该次 HTML 没有命中 Cloudflare 边缘缓存。
上游 GitHub Pages 的 `x-cache: HIT` 不能等同于 Cloudflare 命中。
本次未修改 DNS、Cloudflare 设置或 GitHub Pages 托管。

后续建议按顺序执行：

1. 在国内和海外各选一个实际网络测 HTML、CSS、图片的 TTFB、下载时间和
   LCP，同时查看 `CF-Cache-Status`、`Age`、`Cache-Control`。
   检查 Pages 回源是否稳定，并比较缓存 HIT 与 MISS 的耗时。
2. 在现有 CDN 给 `/_images/*` 和 `/_astro/*` 设置长期缓存，例如浏览器
   一年、边缘一个月。这些资源名带内容哈希，可以安全使用 `immutable`。
   GitHub Pages 自身不能通过仓库内 `_headers` 文件配置响应头，需要在 CDN 配置。
3. HTML 使用短缓存（例如边缘 5 分钟），部署后清理页面缓存。不要对
   非哈希的 `/uploads/*` 原图强行设置一年不可变缓存，以免同名替换后不更新。
4. 如果主要读者所在网络访问当前 CDN 仍不稳定，先比较其他静态托管或 CDN
   的实测表现，再迁移。大陆访问速度要求较高时，可评估备案后的国内托管和 CDN。

可在 Cloudflare 的 Cache Rules 中先添加以下静态资源规则，并检查命中效果：

```text
(http.host eq "blog.haogre.com" and
 (starts_with(http.request.uri.path, "/_images/") or
  starts_with(http.request.uri.path, "/_astro/")))
```

设置为 Eligible for cache，Edge TTL 30 天，Browser TTL 1 年。HTML 的短缓存
应另设规则，并配套部署后清缓存，避免文章更新延迟。HTML 规则尚未实施时，
先单独优化带哈希的静态资源即可。

## 复核

```bash
npm run images:optimize  # 生成／复用缓存，输出全部图片体积统计
npm test
npm run build           # Astro 检查、生产构建、Pagefind 中英文索引
npm run preview
```

发布仍沿用原来的脚本流程。代码变更推送后，由 GitHub Actions 重新构建上线；
本地生成的 `public/_images/` 不应提交到 Git。
