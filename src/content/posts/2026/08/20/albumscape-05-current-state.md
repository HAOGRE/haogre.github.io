---
author: "HAOGRE"
pubDatetime: 2026-08-20T00:00:00.000Z
title: "Albumscape 现在能做什么：从四播放器专辑墙到屏幕保护"
featured: false
draft: false
translationKey: "albumscape-05-current-state"
tags:
  - "AI"
  - "编程"
  - "商业"
description: "截至 2026 年 8 月，Albumscape 已完成四播放器只读观察、动态专辑墙、Artwork 缓存、状态栏 icon 和屏保主干，部分发行与审核门禁仍在进行中。"
---

Albumscape 已经不是一个只有中心封面的原型，但它也还没有把所有“计划中的能力”都写成已经交付。当前最准确的介绍方式，是把已经有代码和证据的能力，与仍然需要正式运行态验证的部分分开。

![Albumscape 屏保预览缩略图，展示中心焦点、周围专辑封面以及完整的正方形墙面比例](/uploads/2026/08/20/albumscape-05-current-state/thumbnail-2x.png)

<small>当前产物素材｜Albumscape 屏保预览用墙面缩略图</small>

## 现在的基础体验

Albumscape 是一款本地优先的 macOS 桌面艺术应用，品类描述是 **A Living Album Wall for Mac**。它读取 Apple Music、Spotify、QQ 音乐和网易云音乐的播放状态与元数据，不控制播放器。

播放时，当前专辑进入屏幕几何中心的 3×3 焦点模块；暂停时焦点收缩成中心 1×1，墙面保留在桌面上。普通卡片以低频错峰的 3D Y 轴翻转显示歌曲名和歌手名，局部区域偶尔呼吸。切歌时，跨专辑走焦点到背景 slot 的空间交接，同专辑换歌走信息面翻转。

墙面窗口使用完整 `NSScreen.frame`，覆盖菜单栏和 Dock 的画布，但位于 Finder 图标和普通应用窗口之下，鼠标事件穿透，也不主动因为前台应用、最小化或 Show Desktop 去 hide/show。

## 四个播放器如何共存

Apple Music 和 Spotify 通过受控的本机脚本读取，QQ 音乐和网易云音乐使用 MediaRemote 元数据观察。播放输入统一经过 `PlaybackInputCoordinator`，由 `PlaybackMessageBus` 按 Apple Music、Spotify、QQ 音乐、网易云音乐的固定优先级仲裁唯一活动源。

Artwork 获取有统一的 `ArtworkAcquisitionFacade`：观察到的封面优先，接着读 provider 本地缓存，再按播放器、MusicKit 和 Apple 公共目录做受控回退。Artwork 通过视觉 fingerprint 去重，只保存 320 px preview 和 1024 px focus 两个 PNG 变体。没有可靠封面时，当前曲目显示元数据占位，不绑定上一首封面。

## 状态栏 icon 已经从一个变成九个

菜单栏 icon 目前有九个免费内置动态 pack：Cassette、Playback Bars、Vinyl Player、Pulse Rings、Metronome、Note Pulse、Equalizer Dots、Orbit 和 Heartbeat。

它们不是运行时画出来的静态符号，而是资源目录中的有序 PNG 多帧模板。Cassette 有 24 帧，其余 pack 为 12 或 16 帧；源图是 192×72 px，内容显示尺寸保持 56×21 pt，状态栏 item 使用原生 28 pt 占位。播放时循环，暂停冻结当前帧，idle 回到第一帧。

![Playback Bars 状态栏 pack 的一帧，白色柱形在源画布中留出安全边距](/uploads/2026/08/20/albumscape-05-current-state/playing_08.png)

<small>当前资源素材｜Playback Bars 动态模板帧</small>

自定义 Icon Studio 可以免费打开，但导入 PNG、删除资源和 template/original color 管理属于统一 Pro 权益。自定义资源复制到 Application Support，不修改签名 App Bundle，也不进入播放器、Artwork、逻辑墙或投影正确性路径。

## Living Album 和多屏分层

墙面目前有 6 个 Living Album 家族、18 个变种：classicFlip、edgeLift、tileWave、shutterStrip、diagonalFold 和 depthLayered。免费版开放 4 个精选 classicFlip 变种，Pro 开放全部 18 个；基础翻转、区域呼吸、中心焦点和跨专辑交接不进入付费墙。

免费版只在系统主显示器展示，Pro 才扩展到所有非镜像 drawable displays。多屏不是每块屏幕各自生成一面墙，而是共享同一份逻辑工作集、generation 和动效调度，再逐屏投影可见 slot。

自定义 slot 大小属于 Pro 高级视觉控制，自动 slot 大小、播放器兼容性、Artwork、历史容量、隐私、稳定性、性能和无障碍仍然是免费基础体验。

## 原生屏幕保护走另一条进程边界

官网 Developer ID 版 Pro 独享原生 macOS `.saver`。主应用把不可变的屏保快照发布到用户级 Application Support，屏保宿主只读快照、校验路径、后台加载 artwork，再交给自己的 presentation runtime。它不观察播放器，不写 provider library，不请求媒体权限。

屏保主干已经包括 Snapshot、原子 manifest、跨进程确定性 timeline、zero-size frame 处理、重复 `startAnimation → stopAnimation → startAnimation` 生命周期和 Universal bundle 结构验证。direct 构建要求真实 Developer ID Application CMS 签名，不能用 ad-hoc 签名冒充可安装产物。

但这里仍有重要的未完成项：正式公证、生产 Pro entitlement verifier、System Settings 重新安装后的真实预览、真实 ScreenSaverEngine 闲置启动和屏保 CPU 采样，不能只根据离线 bundle probe 宣布通过。

## 当前审核与商业化状态

当前商业模式是免费基础版加 Pro 永久买断。App Store 侧的 `Albumscape Pro` 非消耗型商品已经配置，项目状态文档记录的 Build 是 `0.0.16 (17)`，价格基准为 US$29.99。2026-08-17 的发布审计记录显示，macOS 版本和 Pro 商品一并进入 `Waiting for Review`。

这句话的含义是“已提交审核流程”，不是“已经通过审核”。官网 Developer ID 发行还需要正式许可证服务、公证和屏保运行态证据。App Store 版不包含 `.saver`、安装入口或官网授权逻辑。

## 目前最诚实的数字

截至 2026-08-20，当前 clean `swift test` 是 587 项、0 失败、2 项环境相关跳过。SwiftPM 构建和 Xcode build system 构建均有通过记录，Universal 屏保 bundle 的离线结构校验也已通过。

运行态证据要单独看：Apple Music 的焦点、暂停、空间交接和部分播放器切换已经真实复验；九个 icon 中前三个有 Computer Use 选择验收，后六个新 pack 目前有自动化覆盖但真实 GUI 视觉仍待复验；稳定 CPU 的 5 分钟采样均值接近或达到 5%，瞬时峰值仍约 13% 到 18%；Spaces、原生全屏、正式屏保宿主和公证仍是独立门禁。

## 为什么现在适合公开介绍

一个项目不需要等所有绿色勾都出现，才值得展示；但公开介绍必须说明哪些是产品能力，哪些是发布前门禁。Albumscape 现在已经足够说明它的核心方向：四播放器只读观察，一面会跟着播放变化但不打扰工作的专辑墙，本地 Artwork 档案，菜单栏动态反馈，以及一条面向 Pro 的屏幕保护延伸路径。

如果你想在 Mac 上把正在播放的音乐变成桌面视觉，可以从 [Albumscape 官网](https://albumscape.haogre.com/) 了解当前审核中的版本和后续更新。
