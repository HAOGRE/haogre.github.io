---
author: "HAOGRE"
pubDatetime: 2026-08-13T00:00:00.000Z
title: "桌面常驻软件的克制：权限、播放器仲裁与 CPU 的真实账本"
featured: false
draft: false
translationKey: "albumscape-04-restraint"
tags:
  - "AI"
  - "编程"
  - "商业"
description: "Albumscape 的工程难点不只在视觉效果，还在于权限不能打扰用户、四个播放器不能互相误杀，以及桌面动画必须对 CPU 负责。"
---

桌面常驻软件最容易被误解成“把窗口放在那里，再加一点动画”。真正运行一整天之后，用户在意的通常是另一组问题：它有没有偷偷请求权限，会不会因为播放器切换把墙面弄乱，会不会让风扇一直转，会不会在后台读取不该读取的历史数据。

Albumscape 的实现过程里，最有价值的几次修复都不是视觉上的新效果，而是把这些边界变得更明确。

![Playback Bars 状态栏动态 pack 的一帧，白色柱形在 192×72 源画布中保持紧凑的可见区域](/uploads/2026/08/13/albumscape-04-restraint/playing_08.png)

<small>开发素材｜Playback Bars 资源驱动动态 pack 的单帧</small>

## 四个播放器不是四条独立流水线

Albumscape 对 Apple Music、Spotify、QQ 音乐和网易云音乐提供专用优化，但“支持四个播放器”不等于维护四套从观察到绘制的流程。

播放输入先经过 `PlaybackInputCoordinator` 归一化，按 `PlayerScope` 分配领域 revision。Spotify 的本机脚本和 MediaRemote fallback 可能返回不同 native ID，只要歌曲元数据仍然一致，就复用同一个 track session，不重复创建专辑、历史记录、焦点翻转和环境动画。

活动播放器的优先级固定为 Apple Music、Spotify、QQ 音乐、网易云音乐。`PlaybackMessageBus` 每次基于 Registry 全量重算，而不是把 MediaRemote 的“播放器变了”误读成前一个 provider 已经停止。只有该 provider 的显式 stopped observation 或 lease 过期，才会退休候选。

这个设计背后的观点很简单：播放器适配器负责“我观察到什么”，仲裁器负责“现在谁有资格成为活动源”，墙面只消费最终结果。观察源不应该顺手决定墙面如何重排。

## 权限流程首先要保护空闲用户

Apple Music 和 Spotify 的本机脚本读取涉及 Automation 权限。权限流程如果设计成启动即请求，用户第一次打开一个还没播放音乐的应用，就会先看到系统弹窗，而不是看到产品价值。

Albumscape 把 TCC 检查分成 passive 和 user-initiated 两种。后台稳定播放时只探测已有授权，不主动弹窗；系统确认有稳定的播放或暂停曲目后，菜单栏提供一次非模态入口，只有用户点击它才触发系统授权。拒绝后保留恢复入口，并可打开对应的系统设置页。

更底层的坑是 `AEDeterminePermissionToAutomateTarget` 的阻塞行为。它可能在目标应用或 tccd 不回应时永不返回，不能丢进 Swift Concurrency 协作池。探测现在放在私有队列，结果按 provider 缓存；稳定权限不在每次刷新时重探。超时也不能被伪装成“未授权”，否则会把本机脚本读取源静默关闭。

这类工程细节不会出现在产品截图里，但它决定了桌面工具是安静的，还是每次开机都让用户处理权限。

## Artwork 不是“有图就行”

封面获取也有一条明确顺序：观察到的封面，provider 本地缓存，Apple Music 或 Spotify 本机脚本直读，MusicKit，最后才是 Apple 公共目录。QQ 音乐和网易云音乐在原始 artwork 字节缺失时，按歌曲、歌手、专辑的逐级查询顺序补图，并把稳定选择结果写入各自 provider 分区。

公共目录返回的 `artworkUrl100` 会升级到更高分辨率变体。同一视觉 fingerprint 的低分辨率 blob 不能覆盖高质量版本。持久化只保留 320 px preview 和 1024 px focus 两个 PNG 变体，不保存 master；背景读取 preview，焦点读取 focus，内存缓存也区分两种数据。

这里的关键不是“网络请求越多越好”，而是每个来源都要有身份边界。Apple Music 的系统 artwork cache 没有 track identity，fresh 时间戳只能作为候选。如果一个候选 fingerprint 已经属于另一张专辑，必须拒绝，宁可显示当前元数据占位，也不能把上一首封面绑定给新专辑。

## CPU 账本必须看真实桌面

项目目标是稳定播放时 CPU 不超过 5%。这个数字不能从 XCTest 推导，也不能用没有墙面动画的空闲进程代替。2026-08-19 的正式 DMG 在 `/Applications` 中运行，Apple Music 播放、墙面动画开启，5 分钟采样平均约 4.7% 到 5.0%，均值达标；但 poll 和翻转瞬时峰值仍然约 13% 到 18%，带余量的稳态目标还没有通过。

这次采样最重要的结果不是“平均数刚好过线”，而是找到了一个 60fps `onChange(appearance)` 循环。系统 now-playing 观察每两秒刷新一次，即使内容没变也更新 `@Published` 状态，SwiftUI 图就会被反复标脏。修掉这条循环后，墙面稳定区间回到目标附近。

但这还不等于最终验收完成。常驻应用的性能要对峰值、切歌、首次封面编码、动画和遮挡状态分别记账。后续仍需要 per-cell timeline slice 优化，再重新做正式 `.app` 采样。

## 本地优先不是一句宣传语

Albumscape 的 provider history 和 artwork cache 写入 Application Support，并使用进程级 advisory lock，避免多个实例用旧内存快照覆盖 `library.json`。每个 provider 默认最多保留 512 张专辑和 512 个唯一 artwork asset，墙面只取最近播放工作集，不把档案库中的每张专辑永久绑定到屏幕。

应用不读取播放器私有历史。目录查询只处理当前活动曲目，负缓存和退避也按 provider 和 track 管理。诊断日志记录 revision、assignment diff、stale 丢弃和动效事件，不持久化，也不上传 artwork 二进制。

本地优先的价值是可解释：用户知道封面从哪里来，什么时候会补图，缓存在哪里，失败时会显示什么，而不是让一条不透明的后台服务替他决定桌面内容。

## 克制最后会变成产品体验

当播放器观察、权限探测、Artwork 获取、缓存写入和墙面呈现各自有边界时，产品反而会显得没有那么“忙”。用户听歌时看到一面缓慢变化的墙，暂停时墙还在，切换应用时没有窗口闪烁，风扇也不需要为了一个背景动画一直加速。

Albumscape 目前仍在继续做真实 `.app`、多显示器、Spaces、屏保宿主和性能门禁的运行态复验。想了解这套只读、低打扰、面向 Mac 桌面的专辑封面墙，可以访问 [Albumscape 官网](https://albumscape.haogre.com/)。
