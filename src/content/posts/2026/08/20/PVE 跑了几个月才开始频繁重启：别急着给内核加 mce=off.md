---
author: "HAOGRE"
pubDatetime: 2026-08-20T14:04:48.961Z
title: "PVE 跑了几个月才开始频繁重启：别急着给内核加 mce=off"
featured: false
draft: false
translationKey: "PVE 跑了几个月才开始频繁重启：别急着给内核加 mce=off"
tags:
  - "编程"
  - "网络"
  - "其他"
description: "一台稳定运行数月的 Proxmox 主机突然频繁重启，如何用日志、内存 SPD、网卡 watchdog 和固件信息排查，而不是先用 mce=off 把报警关掉。"
---

一台 PVE 主机稳定运行了几个月，最近却开始频繁重启。重启没有留下完整的关机流程，虚拟机跟着一起掉线，过一会儿又自动回来。

这种场景很容易把人带到一个看似直接的答案：给 GRUB 加上 `mce=off`，让内核不要再响应 Machine Check Exception。它确实是 Linux 内核支持的参数，但把它当成“防重启开关”，风险很大。

这次排查的结论是：`mce=off` 没有命中现场证据，不能作为修复方案。更值得关注的是一组组合信号：主机使用了不完全匹配的内存条，固件版本很旧，两个板载 Broadcom 网卡都出现过 `NETDEV WATCHDOG` 发送队列超时。关闭网卡 offload 可以作为短期缓解，内存替换、固件更新和压力测试才是后续的修复路径。

![一台曾经安静运行的服务器旁，日历上的稳定脚印突然被几处红色断点打断，柯基叼来一张写着 reboot 的线索纸，父亲用放大镜查看断点](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/01-reboot-evidence.png)

<small>图 01｜先收集重启证据，再决定要不要改内核参数</small>

## 先确认“重启”到底是哪一种

“机器重启了”至少可能对应四种情况：操作系统主动 reboot，内核 panic 后自动重启，硬件看门狗复位，或者电源、主板、内存控制器直接让机器掉电。它们在日志里的痕迹完全不同。

我先保留了上一次启动的内核日志和启动记录：

```sh
last -x | head -30
journalctl --list-boots
journalctl -b -1 -k --no-pager
journalctl -b -1 -p warning..alert --no-pager
```

现场更像是异常复位，而不是一次正常的 `shutdown`。上一轮日志里没有完整的关机链，也没有看到明确的 `kernel panic`、`MCE` 或 `EDAC` 报错。能看到的是 HEST 表溢出一类的 ACPI 固件提示，以及更具体的网卡发送队列超时。

这里有一个容易被忽略的边界：**“没有 MCE 日志”不能证明内存没有问题，但它足以说明 `mce=off` 没有直接证据支持。** 如果故障发生在系统来得及写日志之前，日志当然可能是空的；但这时更应该保留诊断能力，而不是先把相关通道关闭。

## 为什么“以前稳定”不能洗掉硬件嫌疑

这台机器是 HPE ProLiant MicroServer Gen10，运行 Proxmox VE 9.0.3，内核为 `6.14.8-2-pve`。主板 BIOS 版本为 `5.12`，日期是 2018 年。它过去能连续运行几个月，这个事实很重要，但它表达的是“这套组合曾经在某个温度、负载和老化状态下工作”，并不等于“这套组合符合长期稳定运行的硬件配置”。

检查 DMI 内存信息时，两个 8 GB 模块的特征并不一致：

| 模块     | Total Width | Data Width | 现场含义            |
| -------- | ----------: | ---------: | ------------------- |
| Kingston |     64 bits |    64 bits | 没有 ECC 额外校验位 |
| Micron   |     72 bits |    64 bits | 带有 ECC 校验位     |

HPE 的 [MicroServer Gen10 用户指南](https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005614en_us) 和 [产品信息](https://support.hpe.com/hpesc/public/docDisplay?docId=a00028524en_us&docLocale=en_US) 都把这台机器的内存描述为 ECC、DDR4、Unbuffered DIMM。两根内存都能被 BIOS 识别，不代表它们构成了厂商支持的组合；系统能启动，也不代表内存控制器在所有时序、温度和 DMA 压力下都能保持一致行为。

这能解释“为什么不是装机当天就坏”：边缘配置经常不是二进制开关。它可能在轻负载下工作很久，等到内存老化、接触电阻变化、环境温度上升，或者某种 I/O 负载把内存和 DMA 一起推到边界，才开始暴露问题。

![父亲把两根外观相似但宽度不同的内存条放到一只狭窄的托盘里，母亲在旁边把 64 和 72 两个手写数字分开，红色小箭头指向没有对齐的校验位](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/02-mixed-memory.png)

<small>图 02｜能被识别的两根内存，不一定是被平台支持的组合</small>

这还不能直接推出“混合内存就是根因”。要把嫌疑变成结论，至少还需要换成成套 ECC UDIMM，逐条、逐槽跑完整的 MemTest86 或同等测试，并观察长时间运行后的错误计数。当前更准确的说法是：**内存配置是高优先级风险项，值得先恢复到平台支持的状态。**

## 更接近故障时间的线索：tg3 发送队列卡住

内核日志里反复出现了下面一组信息，两个板载接口都发生过：

```text
NETDEV WATCHDOG: enp3s0f0 (tg3): transmit queue 0 timed out
tg3: enp3s0f0: transmit timed out, resetting
```

`NETDEV WATCHDOG` 的意思不是“网线断了”。它表示网卡发送队列里已经有待发送的数据，但驱动在规定时间内没有完成发送，内核因此触发恢复动作。Red Hat 对这个告警的解释见 [NETDEV WATCHDOG transmit queue timed out](https://access.redhat.com/solutions/43168)。原因可能落在驱动、网卡固件、PCIe、DMA、主板电气状态或负载组合上。

这条线索本身也不能证明网卡导致了整机重启。更稳妥的判断是：它至少说明主机的 I/O 子系统出现过真实异常，且异常发生在重启前后相近的时间窗口。对于一台 BIOS 仍停留在 2018 年、内存又存在 ECC 差异的机器，两个端口同时出现 `tg3` 队列卡死，不能只当成普通网络抖动。

为了排除“其实是集群或虚拟机 watchdog 主动重置节点”的可能性，我还确认了这台主机没有 Corosync 集群配置，虚拟机 watchdog 并不是本次证据链的起点。PVE 自己的 `watchdog-mux` 服务仍在运行，它应该保留，除非后续证据明确证明看门狗配置本身有问题。

## `mce=off` 为什么不适合当修复

Linux 内核文档对 `mce` 参数的描述很直接，`mce=off` 会关闭 Machine Check 支持。它改变的是内核如何处理机器检查异常，不会修复内存条的校验位差异、PCIe 总线、网卡固件、主板供电或电源保护电路。

如果真正的问题是可纠正的机器检查事件，关闭处理可能让系统少打印一些信息，甚至暂时绕过某些内核动作；如果问题来自 `tg3` 发送队列，它没有理由让队列重新工作；如果是 BMC、主板或电源直接复位，操作系统也没有机会执行这个参数对应的逻辑。

因此，`mce=off` 最坏的地方不是“没效果”，而是让后续排查少一条证据。内核参数 [文档中的 `mce`](https://docs.kernel.org/admin-guide/kernel-parameters.html#mce) 可以作为实验性诊断选项理解，不能当作生产环境的硬件修复按钮。尤其不要因为“机器现在几十分钟就重启，反正已经很糟”就把错误报告全部关掉，硬件故障最需要的是更多可观测性。

## 先做不重启的缓解

在没有更换硬件前，我先针对 `tg3` 的发送路径做了一个可回滚的缓解：关闭两个接口的 TSO、GSO 和 GRO。

```sh
ethtool -K enp3s0f0 tso off gso off gro off
ethtool -K enp3s0f1 tso off gso off gro off
```

这些 offload 会把一部分分段、合并工作交给网卡或驱动。它们通常能提高吞吐，但当问题集中在驱动、DMA 或网卡固件的边界行为时，关闭后可以减少一次硬件发送路径上的复杂度。代价是 CPU 负担可能增加，吞吐也可能下降，所以它是定位和止血手段，不是永久修复。

PVE 的网络配置通常由 Linux 网络栈和 bridge 组成，可以参考 [Proxmox 网络配置文档](https://pve.proxmox.com/wiki/Network_Configuration)。为了让设置在接口重新拉起后仍然存在，可以在对应物理接口的 `iface` 段加入：

```text
post-up /sbin/ethtool -K enp3s0f0 tso off gso off gro off || true
```

另一个接口同样处理。修改前应先备份 `/etc/network/interfaces`，并确认当前 SSH 连接不依赖即将重启的网络配置。这个动作没有重启主机，只是让接口重新应用 offload 状态。

验证不能只看“现在没重启”。我同时检查了网关连通性、接口计数器、PVE 存储和虚拟机状态，并从修改后的时间点开始观察内核日志：

```sh
ip -s link show enp3s0f0
ip -s link show enp3s0f1
ethtool -k enp3s0f0
journalctl -k --since "2026-08-20 21:50:00" | grep -Ei 'tg3|watchdog|mce|edac|panic'
ping -c 20 <网关地址>
```

短时间观察到网关无丢包、虚拟机和存储保持在线，且没有新的 `tg3`、MCE、EDAC 或 panic 记录，只能说明缓解措施暂时没有制造新问题。它还不能证明机器已经稳定，至少要跨过原来故障的时间周期，最好再经过几天的实际负载。

![柯基用力拉住一条卡在旧网卡里的蓝色数据包，儿子把一块写着 offload 的小板移到旁边，红色的 watchdog 小钟暂时停止响动，画面留出大片白色空白](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/03-tg3-watchdog.png)

<small>图 03｜关闭 offload 是让发送路径变简单，不是把故障从系统里抹掉</small>

## 真正的修复顺序

我会按下面的顺序处理，而不是先把 `mce=off` 写进 GRUB：

1. **恢复内存兼容性。** 移除非 ECC 模块，换成同规格、同批次或经过验证的 ECC UDIMM；再逐条、逐槽跑完整内存测试。不要因为测试一轮没有报错，就把混合配置装回去。
2. **更新 BIOS 和相关固件。** 这台机器的 BIOS 年代较早，应按 HPE 的 [固件升级说明](https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005613en_us&docLocale=en_US) 操作，使用 UPS 或稳定电源，安排维护窗口，升级过程中不要断电。固件升级不是“看到旧就刷”，要核对机型、版本和回滚条件。
3. **继续观察 tg3。** 如果更换内存和升级固件后仍出现发送队列超时，再考虑更新 PVE 内核、核对网卡固件，换用一张稳定的 Intel 网卡做对照，或者暂时停用有问题的端口。每次只改一项，保留时间线。
4. **检查电源、温度和 BMC 事件。** 如果日志仍然在系统写盘前消失，检查电源适配器、主板电容、风扇、温度和硬件事件日志。软件层的参数无法屏蔽掉主板保护电路触发的断电。
5. **保留 watchdog，除非有证据证明它在误杀。** 看门狗的存在是为了在系统真正失去响应时把节点拉回来。直接禁用它可能把“自动重启”变成“永久卡死”，还会让虚拟机和管理面一起失去恢复能力。

![母亲把一根成套的 ECC 内存条放进托盘，父亲在旁边更新一个旧固件齿轮，两个乌龟背着观察记录缓慢前进，右侧留出一块空白写着“长时间验证”](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/04-fix-order.png)

<small>图 04｜短期缓解、硬件修复和长时间验证要分开记录</small>

## 一份可复用的排障清单

遇到“以前稳定、最近频繁重启”的 PVE 主机，我会先记录下面这些信息：

```sh
# 重启类型和上一次启动的日志
last -x
journalctl --list-boots
journalctl -b -1 -k --no-pager

# 平台、内核和固件
pveversion -v
uname -a
dmidecode -t system -t baseboard -t bios -t memory

# 内存错误与硬件事件
dmesg -T | grep -Ei 'mce|edac|hardware error|ras|ecc'
ras-mc-ctl --error-count 2>/dev/null || true

# 网卡驱动和链路状态
ethtool -i enp3s0f0
ethtool enp3s0f0
ip -s link show enp3s0f0

# 存储和管理服务
smartctl -a /dev/sdX
systemctl status watchdog-mux --no-pager
```

然后把每次改动、重启时间、日志里的第一条异常和恢复方式记在同一条时间线上。不要只记录“改了参数后暂时没重启”，还要记录观察了多久、经过了什么负载、是否跨过原来的故障间隔。

这次现场最重要的判断不是“找到了一个可以屏蔽报警的参数”，而是把线索按可信度分层：没有直接 MCE 证据，`mce=off` 就没有适用性；内存 ECC 差异是高优先级硬件风险；`tg3` watchdog 是与故障时间接近的 I/O 异常；关闭 offload 只是一个可回滚的观察手段。机器曾经稳定运行几个月，说明问题可能是近期的老化、环境或负载变化触发了边缘配置，不能拿这段稳定期替当前的硬件证据开脱。

如果必须在“马上改一个参数”和“先保留诊断能力”之间选，我会选择后者。让机器继续运行的目标很重要，但持续运行在未经纠正的内存或总线错误上，可能比一次明确的重启更难收场。
