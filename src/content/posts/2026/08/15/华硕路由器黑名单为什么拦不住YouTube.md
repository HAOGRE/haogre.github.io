---
author: "HAOGRE"
pubDatetime: 2026-08-14T18:10:06.076Z
title: "华硕路由器黑名单为什么拦不住 YouTube"
featured: false
draft: false
translationKey: "华硕路由器黑名单为什么拦不住YouTube"
tags:
  - "编程"
  - "其他"
  - "网络"
description: "Xray 与 FakeDNS 如何绕过华硕黑名单，以及如何用 Netfilter 规则补上缺口。"
---

家里的华硕路由器运行着 Xray 和 FakeDNS。某天，我把卧室的 Apple TV 加入黑名单，结果却很反常：国内网站和视频都打不开，YouTube 却照常播放。

没装代理时，华硕黑名单可以完整切断设备的互联网访问。装上代理后，它却只拦住了一半。这不是 YouTube 有什么特殊能力，而是同一台设备的两类流量走了两条不同的内核路径。

![黑名单拦住国内流量，YouTube 却从侧边管道溜走](/uploads/2026/08/15/华硕路由器黑名单为什么拦不住YouTube/01-blacklist-paradox.png)

<small>图 01｜黑名单生效了，但只守住了其中一扇门</small>

这篇文章记录完整的排查和修复过程。环境是一台运行 ASUSWRT-koolcenter-mod 的华硕路由器，局域网为 `192.168.100.0/24`。Xray 使用 FakeDNS，将需要代理的域名映射到 `198.18.0.0/16`，再把 TCP 流量重定向到本机的 `12345` 端口。

## 现象并不矛盾：流量走了两条路

华硕的黑名单由 `PControls` 链执行。设备访问普通网站时，数据包从 LAN 进入路由器，经过 `filter/FORWARD`，命中设备 MAC 对应的规则后被丢弃。

```text
LAN 设备
  → filter/FORWARD
  → PControls
  → DROP
```

FakeDNS 流量不同。Xray 为 YouTube 等域名返回 `198.18.0.0/16` 内的假 IP，路由器上的 NAT 规则再把发往这段地址的 TCP 流量重定向到本机 `12345`：

```sh
iptables -t nat -A PREROUTING \
  -p tcp -d 198.18.0.0/16 \
  -j REDIRECT --to-ports 12345
```

经过 `REDIRECT` 后，数据包的目的地变成路由器本机。它不再经过 `FORWARD`，而是进入 `INPUT`，随后交给监听 `12345` 的 Xray。

![修复前的网络拓扑](/uploads/2026/08/15/华硕路由器黑名单为什么拦不住YouTube/02-broken-topology.png)

<small>图 02｜普通流量经过 FORWARD，FakeDNS 流量从 INPUT 进入 Xray</small>

完整路径可以写成：

```text
普通国内流量
ATV → br0 → FORWARD → PControls → DROP

FakeDNS 代理流量
ATV → br0 → nat/PREROUTING → REDIRECT :12345
    → INPUT → Xray → 代理节点 → YouTube
```

黑名单本身没有失效。它仍在 `FORWARD` 上正常工作，只是没有机会看到进入 `INPUT` 的代理流量。

## 用运行状态确认根因

先查看华硕生成的过滤规则：

```sh
iptables-save -t filter | grep -E 'FORWARD|PControls'
```

拉黑测试手机后，可以看到类似规则：

```text
-A FORWARD -i br0 -m mac --mac-source XX:XX:XX:XX:XX:XX -j PControls
-A PControls -i br0 -m mac --mac-source XX:XX:XX:XX:XX:XX -j DROP
```

计数器显示，手机访问普通地址时有 80 个数据包命中 `PControls` 并被丢弃。国内访问失败与这条证据吻合。

再查看 NAT 和监听端口：

```sh
iptables-save -t nat | grep -E '198\.18\.0\.0/16|12345'
netstat -lntp | grep ':12345'
```

路由器上同时存在两项关键状态：

```text
-A PREROUTING -d 198.18.0.0/16 -p tcp -j REDIRECT --to-ports 12345
tcp  0  0  :::12345  :::*  LISTEN  xray
```

最后查看连接跟踪：

```sh
conntrack -L | grep 'src=192.168.100.243' | grep 'dst=198.18.'
```

测试手机已经被华硕拉黑，但仍有多条到 `198.18.x.x:443` 的连接。反向元组显示，这些连接实际由 `192.168.100.1:12345` 接管，其中一条已经传输了接近 1 MB。YouTube 能播放并非缓存或错觉，流量确实进入了 Xray。

![PControls 守着 FORWARD，代理流量却从 INPUT 进入](/uploads/2026/08/15/华硕路由器黑名单为什么拦不住YouTube/03-two-doors.png)

<small>图 03｜黑名单守在 FORWARD，Xray 的入口却在 INPUT</small>

一句话概括根因：**华硕黑名单只挂在 `FORWARD`，而 FakeDNS 的透明代理把海外流量重定向到了本机 `INPUT:12345`。**

## 为什么不直接跳转到 PControls

最直观的修法是在 `INPUT` 顶部加入一条规则：

```sh
iptables -I INPUT 1 -i br0 -p tcp --dport 12345 -j PControls
```

这条命令在这台路由器上被内核拒绝，返回 `iptables: Invalid argument`。原因是华硕的 `PControls` 不只有 MAC 丢弃规则，里面还有一个为转发流量准备的 `TCPMSS` 目标：

```text
-A PControls -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --clamp-mss-to-pmtu
```

`TCPMSS` 可以出现在当前的转发路径中，却不能通过 `INPUT` 钩子直接调用整条链。因此，照搬 `PControls` 这条路走不通。

另一种做法是为 Apple TV 或手机写死 MAC：

```sh
iptables -I INPUT 1 -i br0 -p tcp --dport 12345 \
  -m mac --mac-source XX:XX:XX:XX:XX:XX -j DROP
```

它能工作，但会造出第二份黑名单。以后从华硕界面解除设备时，旧规则仍然存在；iPhone 的私有 Wi-Fi 地址发生变化后，规则也会失去对应关系。这个方案的维护成本太高。

## 最终方案：复制 MAC 丢弃项，不复制整条链

最终做法是在内存中创建一条 `XRAY_PCONTROLS` 链。每次华硕重建防火墙时，从 `PControls` 提取当前有效的 MAC `DROP` 项，再让 `INPUT:12345` 跳转到这条干净的链。

把下面这段放入 `/jffs/scripts/firewall-start`，并置于现有 Xray NAT 规则之前：

```sh
#!/bin/sh

# Make Xray FakeDNS traffic obey the Asus parental-control blacklist.
# PControls also contains TCPMSS, which cannot be called from INPUT, so copy
# only its MAC DROP entries into a runtime-only chain.
if iptables -nL PControls >/dev/null 2>&1; then
    iptables -N XRAY_PCONTROLS 2>/dev/null || true
    iptables -F XRAY_PCONTROLS

    for blocked_mac in $(
        iptables-save -t filter |
        sed -n 's/^-A PControls .*--mac-source \([^ ]*\) -j DROP$/\1/p'
    ); do
        iptables -A XRAY_PCONTROLS \
          -i br0 -m mac --mac-source "$blocked_mac" -j DROP
    done

    iptables -C INPUT -i br0 -p tcp --dport 12345 \
      -j XRAY_PCONTROLS 2>/dev/null ||
    iptables -I INPUT 1 -i br0 -p tcp --dport 12345 \
      -j XRAY_PCONTROLS
else
    # Fail open: do not keep stale MAC entries.
    iptables -F XRAY_PCONTROLS 2>/dev/null || true
    logger -t firewall-start \
      "PControls chain unavailable; Xray blacklist guard left empty"
fi
```

这段脚本刻意保留了几个边界。

`XRAY_PCONTROLS` 只存在于运行内存中，不持久保存 MAC。华硕黑名单仍是唯一数据源。在界面中增加或移除设备后，防火墙重建时会重新复制当前规则。

脚本只检查 Xray 的 TCP `12345` 入口。DNS、DHCP、路由器管理页以及同网段设备之间的通信不会被整体切断。Apple TV 被拉黑后仍能访问 NAS 等局域网设备，但无法借助 Xray 访问互联网。

如果启动时 `PControls` 尚未创建，脚本会清空旧的运行时链并放行，而不是保留陈旧的 MAC。突然断电不会产生一份无法从华硕界面解除的永久黑名单。

规则使用 `-C` 检查后再插入。即使重复执行 `firewall-start`，也不会不断叠加相同的 `INPUT` 跳转。

![修复后的网络拓扑](/uploads/2026/08/15/华硕路由器黑名单为什么拦不住YouTube/04-fixed-topology.png)

<small>图 04｜两条互联网路径共用华硕黑名单，LAN 通道保持开放</small>

修复后的路径变成：

```text
普通互联网流量
LAN → FORWARD → PControls → DROP

FakeDNS 代理流量
LAN → PREROUTING → INPUT:12345 → XRAY_PCONTROLS → DROP

局域网流量
ATV → br0 → NAS
```

## 安全部署

`firewall-start` 位于 JFFS，直接覆盖时如果突然断电，确实可能留下半个文件。部署时，我先保留原脚本：

```sh
cp -p /jffs/scripts/firewall-start \
  /jffs/scripts/firewall-start.pre-xray-pcontrols
```

新脚本先写入同目录的临时文件，执行 `sh -n`，设置权限并 `sync`，最后用 `mv` 原子替换。替换后再次校验语法，再手动执行一次以加载规则。

```sh
sh -n /jffs/scripts/.firewall-start.new
chmod 755 /jffs/scripts/.firewall-start.new
sync
mv /jffs/scripts/.firewall-start.new /jffs/scripts/firewall-start
sync
sh -n /jffs/scripts/firewall-start
/jffs/scripts/firewall-start
```

这套流程保护的是启动脚本本身。设备是否在黑名单中，仍由华硕 NVRAM 和 `PControls` 管理。

## 验证过程

验证时，我没有只看 YouTube 能否打开，而是同时检查了被拉黑设备、未拉黑设备、局域网和重载行为。

### 1. 守卫规则只出现一次

连续执行两次 `firewall-start`，再进行计数：

```sh
iptables-save -t filter |
  grep -c -- '-A INPUT .*--dport 12345 -j XRAY_PCONTROLS'
```

结果为 `1`。脚本是幂等的。

### 2. 黑名单设备命中代理丢弃规则

拉黑测试手机后刷新 YouTube，`INPUT` 和 `XRAY_PCONTROLS` 的计数器开始增加：

```sh
iptables -t filter -nvL INPUT --line-numbers |
  grep XRAY_PCONTROLS

iptables -t filter -nvL XRAY_PCONTROLS --line-numbers
```

手机对应的 MAC `DROP` 项增加了一个数据包，代理的已建立连接数降为 `0`：

```sh
conntrack -L |
  grep 'src=192.168.100.243 .*dst=198.18.' |
  grep -c ESTABLISHED
```

### 3. 未拉黑设备的代理不受影响

同一时刻，其他设备仍有 74 条到 `198.18.0.0/16` 的已建立连接，Xray 进程和 `12345` 监听端口也都正常。新规则只丢弃黑名单 MAC，不改变 Xray 的分流、节点、DNS 或加密路径。

### 4. 解除黑名单后自动恢复

从华硕界面移除测试手机后，`PControls` 和 `XRAY_PCONTROLS` 都从 4 个 MAC 条目回到 3 个。手机重新出现到 `198.18.x.x` 的已建立连接，不需要重启 Xray，也不需要手动删除防火墙规则。

### 5. 局域网继续可用

黑名单设备访问同网段 NAS 的路径不会进入 `INPUT:12345`。这次修复没有添加针对整个 `br0` 或整个 `INPUT` 的丢弃规则，因此局域网通信得以保留，而互联网的直连和代理入口会同时被封住。

![用丢包计数和连接状态验证修复](/uploads/2026/08/15/华硕路由器黑名单为什么拦不住YouTube/05-runtime-verification.png)

<small>图 05｜黑名单流量开始计入 DROP，其他设备的 Xray 连接保持正常</small>

## 这条修复适用到哪里

当前环境使用 IPv4 FakeDNS 和 NAT `REDIRECT`，因此守住 `INPUT` 的 TCP `12345` 就能覆盖实际的绕行路径。如果以后改用 TPROXY、TUN、IPv6 或额外的透明代理端口，就需要重新检查 `mangle`、`ip rule`、`ip6tables` 和监听端口，不能机械照抄这一条规则。

排查这类问题时，可以先问一个简单的问题：被访问控制拦截的流量和漏过去的流量，最后经过的是不是同一个 Netfilter 钩子？只要代理把流量从转发路径改送到路由器本机，单守 `FORWARD` 就不够。
