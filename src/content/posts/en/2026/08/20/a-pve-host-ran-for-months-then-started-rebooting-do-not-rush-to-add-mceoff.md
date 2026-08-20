---
author: "HAOGRE"
pubDatetime: 2026-08-20T14:04:48.961Z
title: "A PVE Host Ran for Months, Then Started Rebooting: Do Not Rush to Add mce=off"
featured: false
draft: false
lang: en
translationKey: "PVE 跑了几个月才开始频繁重启：别急着给内核加 mce=off"
tags:
  - "programming"
  - "networking"
  - "hardware"
description: "How I investigated a Proxmox host that had been stable for months before frequent reboots, using logs, memory SPD data, NIC watchdog messages, and firmware evidence instead of hiding alarms with mce=off."
---

A PVE host had been running for months. Recently, it started rebooting frequently. The reboots did not leave a complete shutdown sequence. The virtual machines went offline with the host and came back a while later.

This situation often leads to a seemingly direct answer: add `mce=off` to GRUB so that the kernel stops responding to Machine Check Exceptions. The parameter is real and supported by the Linux kernel, but treating it as a “stop rebooting” switch is risky.

The conclusion from this investigation is that `mce=off` was not supported by the evidence from this host, so it should not be treated as the fix. More relevant signals formed a combination: the host had a mixed memory configuration, its firmware was old, and both onboard Broadcom interfaces had reported `NETDEV WATCHDOG` transmit queue timeouts. Disabling NIC offload can be a short-term mitigation. Replacing the memory, updating firmware, and running proper stress tests are the repair path.

![A quiet server, a calendar with a long stable trail interrupted by red reboot marks, and a corgi bringing an evidence slip to a father with a magnifying glass](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/01-reboot-evidence.png)

<small>Figure 01 | Collect reboot evidence before changing a kernel parameter</small>

## Identify what kind of reboot happened

“The machine rebooted” can mean at least four different things: the operating system called `reboot`, the kernel panicked and restarted, a hardware watchdog reset the host, or the power supply, motherboard, or memory controller cut power directly. Each leaves a different trace in the logs.

I first preserved the previous boot’s kernel log and boot history:

```sh
last -x | head -30
journalctl --list-boots
journalctl -b -1 -k --no-pager
journalctl -b -1 -p warning..alert --no-pager
```

The host looked more like an abnormal reset than a normal `shutdown`. The previous boot did not contain a complete shutdown chain, and there was no explicit `kernel panic`, `MCE`, or `EDAC` error. There was an ACPI firmware message resembling an HEST table overflow, along with a more concrete NIC transmit queue timeout.

One boundary matters here: **the absence of an MCE message does not prove that memory is healthy, but it does mean that `mce=off` has no direct evidence behind it.** If the failure happens before the system can write a log, the log may be empty. That is a reason to preserve diagnostic paths, not to disable them first.

## Why a previous stable period does not clear the hardware

The machine is an HPE ProLiant MicroServer Gen10 running Proxmox VE 9.0.3 with kernel `6.14.8-2-pve`. Its BIOS is version `5.12`, dated 2018. The fact that it ran for months is important, but it only tells us that this combination worked under a particular temperature, load, and aging state. It does not prove that the memory configuration is a supported long-term configuration.

The DMI memory information showed two 8 GB modules with different characteristics:

| Module   | Total Width | Data Width | Interpretation          |
| -------- | ----------: | ---------: | ----------------------- |
| Kingston |     64 bits |    64 bits | No extra ECC check bits |
| Micron   |     72 bits |    64 bits | Has ECC check bits      |

The [MicroServer Gen10 user guide](https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005614en_us) and [product information](https://support.hpe.com/hpesc/public/docDisplay?docId=a00028524en_us&docLocale=en_US) describe the platform memory as ECC DDR4 unbuffered DIMMs. The BIOS recognizing both modules does not mean that the pair is a vendor-supported combination. A system can boot while the memory controller still behaves badly at some timing, temperature, or DMA boundary.

This also explains why the problem did not necessarily appear on the day the machine was assembled. An edge configuration is not always a binary switch. It can work under light load for a long time, then fail after memory aging, a change in contact resistance, higher ambient temperature, or an I/O pattern that pushes memory and DMA together.

![A father and mother place two similar-looking memory sticks into a narrow tray, separating the 64-bit and 72-bit modules with a red divider](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/02-mixed-memory.png)

<small>Figure 02 | Recognized hardware is not automatically a supported combination</small>

This still does not prove that mixed memory is the root cause. To turn the suspicion into a conclusion, I would replace the modules with a matched ECC UDIMM kit, test each module in each slot with a full MemTest86 run, and observe the error counters over time. The accurate statement for now is: **the memory configuration is a high-priority hardware risk and should be returned to a supported state.**

## The clue closest to the failure: a stuck tg3 transmit queue

The kernel log repeatedly contained this pair of messages, and both onboard interfaces were affected:

```text
NETDEV WATCHDOG: enp3s0f0 (tg3): transmit queue 0 timed out
tg3: enp3s0f0: transmit timed out, resetting
```

`NETDEV WATCHDOG` does not simply mean that the network cable was unplugged. It means that data was waiting in a transmit queue, but the driver did not complete the transmission within the expected time, so the kernel started recovery. Red Hat explains the warning in [NETDEV WATCHDOG transmit queue timed out](https://access.redhat.com/solutions/43168). The cause may involve the driver, NIC firmware, PCIe, DMA, motherboard signaling, or the combination of load and hardware state.

This clue also does not prove that the NIC caused the whole host to reboot. A safer conclusion is that the host’s I/O path had experienced a real failure close to the reboot window. On a machine with 2018-era firmware and different ECC characteristics in its memory, `tg3` queue failures on both ports should not be dismissed as ordinary network jitter.

I also checked whether a cluster or virtual-machine watchdog had actively reset the node. The host had no Corosync cluster configuration, and the VM watchdog was not the starting point of this evidence chain. PVE’s own `watchdog-mux` service remained active and should stay that way unless later evidence shows that the watchdog configuration itself is wrong.

## Why `mce=off` is not a repair

The Linux kernel documentation is direct: `mce=off` disables Machine Check support. It changes how the kernel handles machine check exceptions. It does not repair a mismatch in memory check bits, a PCIe path, NIC firmware, motherboard power, or a protection circuit.

If the real problem is a correctable machine check event, disabling handling may reduce the information printed by the kernel and may bypass some kernel actions for a while. If the problem is a stuck `tg3` transmit queue, it has no reason to make the queue work again. If the BMC, motherboard, or power supply resets the machine directly, the operating system never gets a chance to act on the parameter.

The worst part of `mce=off` is therefore not that it may have no effect. It is that it removes one more diagnostic signal. The [`mce` kernel parameter documentation](https://docs.kernel.org/admin-guide/kernel-parameters.html#mce) is useful for understanding the behavior, but the option should not be treated as a production hardware repair. A hardware fault needs more observability, not less.

## Apply a no-reboot mitigation first

Before replacing hardware, I applied a reversible mitigation to the `tg3` transmit path by disabling TSO, GSO, and GRO on both interfaces.

```sh
ethtool -K enp3s0f0 tso off gso off gro off
ethtool -K enp3s0f1 tso off gso off gro off
```

These offloads move some segmentation and aggregation work into the NIC or driver. They usually improve throughput, but disabling them can reduce the complexity of a hardware transmit path when the problem is near a driver, DMA, or NIC firmware boundary. The trade-off is higher CPU usage and possibly lower throughput, so this is a diagnostic and containment step, not a permanent fix.

PVE networking normally uses the Linux network stack and bridges. The [Proxmox network configuration documentation](https://pve.proxmox.com/wiki/Network_Configuration) is the right reference for the surrounding configuration. To apply the setting whenever the interface comes up, add a line such as this to the physical interface’s `iface` section:

```text
post-up /sbin/ethtool -K enp3s0f0 tso off gso off gro off || true
```

Apply the same to the other interface. Back up `/etc/network/interfaces` before editing it, and confirm that the current SSH session does not depend on a network change that will interrupt the connection. This step does not reboot the host. It only reapplies the interface offload state.

Verification should not stop at “the host has not rebooted yet”. I checked gateway connectivity, interface counters, PVE storage, and VM state, then watched the kernel log from the change onward:

```sh
ip -s link show enp3s0f0
ip -s link show enp3s0f1
ethtool -k enp3s0f0
journalctl -k --since "2026-08-20 21:50:00" | grep -Ei 'tg3|watchdog|mce|edac|panic'
ping -c 20 <gateway-address>
```

No packet loss, healthy VMs and storage, and no new `tg3`, MCE, EDAC, or panic messages during a short observation window only show that the mitigation has not introduced a new problem. They do not prove stability. The observation period should cross the previous failure interval, preferably under several days of real workload.

![A corgi pulls a blue packet stuck in an old network card while a son moves an offload board aside, with a red watchdog clock temporarily quiet](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/03-tg3-watchdog.png)

<small>Figure 03 | Disabling offload simplifies the path; it does not erase the fault</small>

## The actual repair order

I would proceed in this order instead of writing `mce=off` into GRUB:

1. **Restore memory compatibility.** Remove the non-ECC module and install matched ECC UDIMMs. Then run a complete memory test per module and per slot. Do not put the mixed configuration back simply because one test run passed.
2. **Update BIOS and related firmware.** This machine’s BIOS is old. Follow HPE’s [firmware upgrade guidance](https://support.hpe.com/hpesc/public/docDisplay?docId=sd00005613en_us&docLocale=en_US), use a UPS or stable power, schedule a maintenance window, and do not interrupt the update. “Old” is not by itself a reason to flash; verify the model, version, and rollback conditions first.
3. **Continue watching tg3.** If transmit queue timeouts continue after the memory replacement and firmware update, test a newer PVE kernel, check NIC firmware, use a stable Intel NIC as an A/B comparison, or temporarily disable the affected port. Change one thing at a time and keep the timeline.
4. **Check power, temperature, and BMC events.** If logs still disappear before the system can write them, inspect the power adapter, motherboard, fans, temperatures, and hardware event log. A software parameter cannot override a motherboard protection circuit that cuts power.
5. **Keep the watchdog unless there is evidence that it is killing a healthy host.** A watchdog exists to bring back a node that has genuinely stopped responding. Disabling it can turn an automatic recovery into a permanent hang, taking the management plane and virtual machines with it.

![A mother installs a matched ECC pair, a father turns an old firmware gear, and two turtles carry a logbook and clock while walking slowly through a long observation period](/uploads/2026/08/20/PVE%20跑了几个月才开始频繁重启：别急着给内核加%20mce=off/04-fix-order.png)

<small>Figure 04 | Short-term mitigation, physical repair, and long observation should be recorded separately</small>

## A reusable troubleshooting checklist

For a PVE host that was stable before and recently started rebooting, I would record at least the following:

```sh
# Reboot type and previous boot logs
last -x
journalctl --list-boots
journalctl -b -1 -k --no-pager

# Platform, kernel, and firmware
pveversion -v
uname -a
dmidecode -t system -t baseboard -t bios -t memory

# Memory errors and hardware events
dmesg -T | grep -Ei 'mce|edac|hardware error|ras|ecc'
ras-mc-ctl --error-count 2>/dev/null || true

# NIC driver and link state
ethtool -i enp3s0f0
ethtool enp3s0f0
ip -s link show enp3s0f0

# Storage and management services
smartctl -a /dev/sdX
systemctl status watchdog-mux --no-pager
```

Keep the change, reboot time, first abnormal log line, and recovery method on one timeline. Do not record only “the host stopped rebooting after the parameter change”. Record how long it was observed, what workload it handled, and whether the observation crossed the previous failure interval.

The most important judgment from this case is not that there is a parameter that can hide an alarm. It is that the clues have different confidence levels: there was no direct MCE evidence, so `mce=off` had no clear applicability; the ECC difference in memory was a high-priority hardware risk; the `tg3` watchdog was an I/O failure close to the reboot window; and disabling offload was only a reversible observation step. The months of previous stability suggest that aging, environment, or a change in workload may have pushed an edge configuration over its limit. They do not override the current hardware evidence.

If I have to choose between changing one parameter immediately and preserving diagnostic information, I choose the latter. Keeping the machine online matters, but continuing to run on uncorrected memory or bus errors can be harder to recover from than one clearly recorded reboot.
