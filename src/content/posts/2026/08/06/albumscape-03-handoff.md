---
author: "HAOGRE"
pubDatetime: 2026-08-06T00:00:00.000Z
title: "切歌不跳墙：Albumscape 跨专辑空间交接的实现"
featured: false
draft: false
translationKey: "albumscape-03-handoff"
tags:
  - "AI"
  - "编程"
  - "商业"
description: "专辑墙最难的不是画出卡片，而是让跨专辑切歌像空间里的交接：新焦点、旧封面、目标 slot 和迟到 artwork 必须同时稳定。"
---

专辑封面墙的第一版通常很容易：当前歌曲变了，中心图片换掉，背景随机补一张。但当用户连续切歌时，问题马上出现。旧焦点突然消失，目标位置先闪出新封面又退回空槽，整行因为少了一个条件视图向左挪半格，迟到的 artwork 又把已经完成的动画重启一遍。

Albumscape 把这件事当成一个空间交接问题，而不是一个图片替换问题。

![Albumscape 屏保预览缩略图中的中心焦点和周围专辑卡片，适合观察焦点与背景之间的空间关系](/uploads/2026/08/06/albumscape-03-handoff/thumbnail-2x.png)

<small>开发素材｜专辑墙缩略图，中心焦点和背景 slot 是两套不同的语义</small>

## 焦点为什么要离开逻辑墙

最初直觉是把当前专辑直接放进中心 slot。这样做的问题是，焦点会和背景共享同一个 assignment 生命周期：一旦专辑成为焦点，背景 slot 被释放；切回上一张专辑时，系统又要猜它原来在哪里。

现在的模型把焦点视为墙外的播放反馈层。专辑在当前工作集生命周期内拿到 home slot 后，即使暂时成为焦点，也保留自己的绑定和背景内容。A 切到 B，再切回 A 时，A 保持原 home，B 从焦点回到它自己的位置；如果 B 已经有 slot，assignment diff 甚至可以是 0，但仍然会产生一次明确的 existing-binding transaction。

这个决定让逻辑工作集和视觉焦点各自承担单一职责：工作集回答“每张专辑的稳定位置是什么”，焦点回答“当前播放应该在屏幕上怎样被看见”。

## 一次跨专辑切换的四个阶段

跨专辑交接不是一个 `withAnimation` 包裹的状态赋值，而是一条可以观察和取消的事务：

1. `readiness`：等待 incoming artwork，默认最多 1.2 秒。封面 ready 后再启动交接，超时则使用当前元数据占位。
2. `traveling`：新焦点从开始就以最终大小和透明度固定显示；旧焦点封面沿既定路径缩小并移动到目标背景 slot。
3. `arrivalCoverHold`：移动进度大约在 75% 到 90% 之间，旧焦点由焦点上层平滑沉到焦点下层。到达后保持正面封面 0.4 秒，避免刚落地就出现信息面。
4. `settled`：目标 slot 原子接管，只产生一次 settled 反馈。目标在移动期间继续显示被替换内容或保持为空，不提前显示 post-assignment 的移动封面。

这条顺序解决的是用户肉眼能看到的因果关系：旧封面确实从焦点移动到目标位置，新封面确实是当前播放，不会出现同一张封面同时作为目标内容和移动层重复绘制。

## 固定 cell footprint 比条件视图更重要

如果一个 slot 没有 artwork，就把视图从 `HStack` 里移除，SwiftUI 会重新计算这一行的宽度。焦点开始移动时，某个空槽变成真实封面，左右内容可能瞬间偏移，用户看到的就不是一张墙，而是一整行在跳。

Albumscape 对每一个逻辑 cell 始终保留 `tileSize × tileSize` 的布局占位。空槽、焦点占位和真实封面只在占位内部切换绘制，不改变行宽。目标 slot 在交接过程中仍然保留自己的 before content，直到移动层完成接管。

这个约束看起来像布局细节，实际是动画正确性的基础。只要 footprint 不稳定，再精确的运动曲线也会被外层布局的瞬移抵消。

## latest-wins 不是“什么都跳过”

连续快速切歌时，Albumscape 不会强行播放 A 到 B、B 到 C 的每个中间动画。跨专辑焦点和背景槽位使用 latest-wins，旧事务在没有机会 settled 时可以被新事务替代。

但 latest-wins 有一个不能省略的条件：最新歌曲必须得到一次最终 settled 反馈。否则渲染层可能停在 traveling，Store 认为已经完成，下一次切歌又从一份过期的中间状态开始。

迟到 artwork 也遵循同一原则。超过 1.2 秒的封面不会重新启动已经开始的交接；它只在 track session 和 generation 仍然匹配时淡入当前内容。provider 或 track session 不匹配的结果直接记录 `artwork-drop-stale`，不能为了“让画面看起来有图”放宽门禁。

![Vinyl Player 动态状态栏 pack 的一帧，白色唱片和唱臂在安全区域内保持紧凑比例](/uploads/2026/08/06/albumscape-03-handoff/playing_08.png)

<small>开发素材｜状态栏 runner 的单帧，和墙面交接一样使用清楚的状态边界</small>

## 同专辑和跨专辑必须是两条路径

同专辑换歌的视觉重点是信息变化。焦点沿 Y 轴翻到歌曲名和歌手名，再沿原路径翻回封面，不需要把封面搬到背景。

跨专辑换歌的重点是空间关系。它不再翻到歌曲信息面，而是让当前专辑快速建立焦点，让上一张封面完成从焦点到背景 slot 的交接。两条路径如果共用一套“先翻信息面再换图”的动画，快速切歌时会产生和播放事实不一致的中间画面。

播放方向也被单独维护在 `PlayerScope` 的短期本地导航轨迹里：自然进入下一首是 `forward`，命中轨迹前一项是 `backward`，同专辑换歌是 `none`，未知方向默认 `forward`。方向只服务视觉策略，不改变播放控制边界。

## 多显示器不能各自再算一遍

多显示器时，每个 drawable display 只投影自己可见的 slot，但它们共享一份逻辑 `WallWorkingSet`、immutable snapshot、generation 和 scheduler。这样同一个逻辑 slot 在不同屏幕上不会因为各自随机抽签而显示不同专辑。

拓扑变化也不等于整面墙重排。分辨率、缩放、旋转和显示器插拔统一经过通知去抖后重算几何；已有 assignment 保留，只有 hydration ring 增长时才后台补充 artwork。

## 交接的价值不在“更炫”

这套实现最终想保持的是一种朴素的感觉：切歌时，当前专辑真的来到中心，上一张专辑真的回到它在墙上的位置，墙面不会因为一个空槽或一个迟到的网络响应重新排队。

截至当前的真实 Apple Music 桌面验证，连续切换的日志顺序已经稳定为 `readiness → traveling → arrivalCoverHold → settled`，每次切换只修改一个 assignment，没有出现信息面阶段。更早的 fixed cell footprint 修复也消除了空槽向左右目标 slot 接管时的整行偏移。

如果你想看这类切歌交接最终服务的产品场景，可以在 [Albumscape 官网](https://albumscape.haogre.com/) 查看当前的 Mac 专辑墙方向。
