---
author: "HAOGRE"
pubDatetime: 2026-10-27T14:36:15.565Z
title: "淘了个二手 TS3 Plus，升完固件总算舒坦了"
featured: false
draft: false
translationKey: "二手TS3Plus升完固件总算舒坦了"
tags:
  - "故障排查"
  - "硬件"
  - "AI"
description: "二手 CalDigit TS3 Plus 接 4K 显示器时好时坏，在 M3 Pro Mac 上将固件从 35.1 升到 44.1 的排查记录。"
---

最近在二手平台淘了一台 CalDigit TS3 Plus。一根雷电线连 MacBook Pro（M3 Pro），扩展坞的下游雷电口再用 USB-C 转 DP 线接一台 BenQ 4K 显示器，桌面上终于只剩一根线。

用了几天，显示器开始时好时坏。有时插上就亮，有时黑着屏提示检测不到信号，拔插几次又好了。

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/01-flicker-dock.webp" alt="小黑抓着扩展坞和显示器之间的线像跳绳一样甩，显示器一半有画面一半空白" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>图 01｜二手扩展坞，显示器时好时坏。</figcaption>
</figure>

## 先看固件版本

「系统信息 → 雷雳/USB4」里能看到扩展坞的固件：

```text
Device Name:       TS3 Plus
Firmware Version:  35.1
Link Controller Firmware Version: 0.36.0
```

CalDigit 官网上 TS3 Plus 的最新固件是 44.1。更新说明里有两条：

- 支持给笔记本最高 87W 充电；
- 改善下游雷电 3 口接部分 USB-C 显示器时的兼容性。

第二条正好对上我的症状。官网还写着「2020 年 11 月之后购买的不需要更新」，二手机器显然是更早的批次，出厂固件一直没人动过。

## 官方说 macOS 版只支持 Intel

下载页上，macOS 固件更新程序后面跟着一句：This updater only works in Intel-Based Macs。

我把安装包拆开看了一下：

```bash
pkgutil --expand-full CalDigit_TS3_Plus_Firmware_Updater_101.pkg out
```

里面没有任何刷写程序，只有两个文件：固件 `CalDigit_TS3_Plus_44.01.bin`，以及一个写着设备型号和固件版本的 `CalDigit.plist`。安装位置是：

```text
/Library/ThunderboltAccessoryFirmwareUpdates/CalDigit/
```

也就是说，这个包只负责把固件放到指定目录，真正写入的是 macOS 自己。

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/02-only-a-letter.webp" alt="小黑钻进几乎空着的纸箱，只掏出一张印着芯片的薄纸，旁边是一个邮筒" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>图 02｜安装包里没有刷写工具，只有一份固件。</figcaption>
</figure>

这条路在 Apple Silicon 上也走得通。CalDigit 有一篇针对 macOS 11.2 及以上的说明，提供了一个合集版的 Thunderbolt Firmware Updater，Intel 和 Apple Silicon 都支持。系统里负责这件事的服务叫 `accessoryupdaterd`。

## 日志说更新卡在等待

两个包都装过、也重启过，扩展坞还是 35.1。于是去翻系统日志。

这里有个小坑：在 zsh 里直接敲 `log` 会报 `too many arguments`，因为 zsh 自带一个同名的内建命令。要写全路径：

```bash
/usr/bin/log show --last 2h --style compact \
  --predicate 'process == "accessoryupdaterd"' | grep -i TS3
```

日志里能看到这几行：

```text
Step completed step:Find device ... successful:YES next-step:Prepare
HandleUpdateRequest: accessory=CalDigit, Inc. TS3 Plus
Adding pending update: accessory=CalDigit, Inc. TS3 Plus
```

系统已经认出了设备，也准备好了固件，只是一直停在「待更新」。按官方流程，这一步要用户在通知里手动确认，我之前大概是没注意，把那条通知错过了。

## 实际有效的步骤

1. 扩展坞上只留电源线和连 Mac 的雷电线，显示器、U 盘、网线都先拔掉；
2. 拔掉扩展坞电源，等 10 秒再插回去；
3. 右上角弹出「配件有可用更新」，点「选项 → 更新」；
4. 日志出现 `step:Prepare ... successful:YES next-step:Apply`，这时再给扩展坞断电 10 秒、插回；
5. 等几分钟，不要拔线，也别合上屏幕。

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/03-replug-to-apply.webp" alt="小黑使劲拔下电源插头，挂在钩子上等待的固件包裹开始滑向扩展坞" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>图 03｜更新准备好了，还要再插拔一次才会写入。</figcaption>
</figure>

我写了个循环，每 15 秒查一次固件版本：

```text
22:30:16 35.1
22:30:32 absent
22:30:47 absent
22:31:02 44.1
```

扩展坞消失了半分钟左右，再出现时已经是 44.1，链路控制器固件也从 0.36.0 跟着升到了 0.40.0。

顺带一提，「系统信息」不会自动刷新。拔掉扩展坞以后，窗口里还会一直显示它，需要按 ⌘R 才会更新。

## 显示器亮了

固件升好后，把 USB-C 转 DP 线插回扩展坞的下游雷电口，显示器直接亮了。系统识别出 BenQ EW3270U，4K 60Hz。

前面排查时还见过一种情况：显示器黑屏的同时，TS3 Plus 整个从雷电设备列表里消失，扩展坞上的 USB 声卡和读卡器却还在。所以如果以后又黑屏，我会先看扩展坞本身还在不在雷电列表里。不在，就先换 Mac 到扩展坞的那根雷电线。

到现在用了一段时间，没再出过问题。二手扩展坞买回来，第一件事应该是看一眼固件版本。

## 关于和 AI 一起排查

这次全程是和 AI 一起查的。它前两个判断都错了：一开始说 Apple Silicon 刷不了这个固件，又说 44.1 只是提高了充电功率，建议我不必折腾。

转折来自我贴过去的更新说明，里面那句「改善 USB-C 显示器兼容性」，加上日志里出现的 `accessoryupdaterd`。拿到这两条证据以后，它很快定位到「待更新」状态，接下来的步骤和计时也都由它来盯。

和上次排查视频问题一样，最有用的还是原始材料：官网说明、安装包内容、系统日志。听起来合理的结论，最好先拿这些对一遍。
