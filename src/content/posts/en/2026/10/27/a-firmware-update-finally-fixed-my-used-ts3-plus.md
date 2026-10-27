---
author: "HAOGRE"
pubDatetime: 2026-10-27T14:36:15.565Z
title: "A Firmware Update Finally Fixed My Used TS3 Plus"
featured: false
draft: false
lang: en
translationKey: "二手TS3Plus升完固件总算舒坦了"
tags:
  - "troubleshooting"
  - "hardware"
  - "ai"
description: "Fixing a flaky 4K display on a used CalDigit TS3 Plus by updating its firmware from 35.1 to 44.1 on Apple Silicon."
---

I recently picked up a used CalDigit TS3 Plus on a secondhand marketplace. One Thunderbolt cable goes to my MacBook Pro (M3 Pro), and a USB-C to DP cable runs from the dock's downstream Thunderbolt port to a BenQ 4K monitor—finally leaving just a single cable on my desk.

After a few days, the monitor started acting up. Sometimes it lit right up when plugged in; other times it stayed black with a "No Signal" message, only to work again after unplugging and replugging a few times.

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/01-flicker-dock.webp" alt="Xiaohei swinging the cable between the dock and the monitor like a jump rope, while the screen is half lit and half blank" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Fig. 01 | Used dock, on-and-off monitor.</figcaption>
</figure>

## Checking the Firmware Version First

You can check the dock's firmware under "System Information → Thunderbolt/USB4":

```text
Device Name:       TS3 Plus
Firmware Version:  35.1
Link Controller Firmware Version: 0.36.0
```

On CalDigit's website, the latest firmware for the TS3 Plus is 44.1. The release notes list two changes:

- Up to 87W charging for laptops;
- Improved compatibility with certain USB-C monitors connected to the downstream Thunderbolt 3 port.

The second item matched my symptoms. The page also notes that units purchased after November 2020 don't need the update—mine, bought secondhand, was clearly from an earlier batch and still running untouched factory firmware.

## CalDigit Says the macOS Updater Is Intel-Only

On the download page, right next to the macOS firmware updater, there is a note: "This updater only works in Intel-Based Macs."

I unpacked the installer to take a look inside:

```bash
pkgutil --expand-full CalDigit_TS3_Plus_Firmware_Updater_101.pkg out
```

There is no flashing utility in there at all—just two files: the firmware image `CalDigit_TS3_Plus_44.01.bin`, and a `CalDigit.plist` specifying the device model and firmware version. They install to:

```text
/Library/ThunderboltAccessoryFirmwareUpdates/CalDigit/
```

In other words, all the package does is drop the firmware into that directory; macOS itself handles the actual flashing.

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/02-only-a-letter.webp" alt="Xiaohei climbing into a nearly empty cardboard box and pulling out only a thin sheet printed with a chip icon next to a mailbox" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Fig. 02 | No flashing tool inside the installer—just a firmware file.</figcaption>
</figure>

That mechanism works on Apple Silicon too. CalDigit has a separate support article for macOS 11.2 and later that provides a bundled Thunderbolt Firmware Updater supporting both Intel and Apple Silicon. The system daemon responsible for applying these updates is `accessoryupdaterd`.

## System Logs Showed the Update Stuck Pending

Even after installing both packages and rebooting, the dock was still on 35.1. So I went digging through the system logs.

One small gotcha here: running `log` directly in zsh throws `too many arguments` because zsh has a built-in command of the same name. You need the full path:

```bash
/usr/bin/log show --last 2h --style compact \
  --predicate 'process == "accessoryupdaterd"' | grep -i TS3
```

The logs showed these lines:

```text
Step completed step:Find device ... successful:YES next-step:Prepare
HandleUpdateRequest: accessory=CalDigit, Inc. TS3 Plus
Adding pending update: accessory=CalDigit, Inc. TS3 Plus
```

macOS had already recognized the dock and staged the firmware, but it was sitting in a pending state. According to CalDigit's instructions, this step waits for the user to confirm a notification prompt—which I had probably missed earlier without noticing.

## What Actually Worked

1. Leave only the power cord and the Thunderbolt cable to the Mac plugged into the dock—unplug the monitor, USB drives, Ethernet cable, and everything else;
2. Unplug the dock's power cord, wait 10 seconds, and plug it back in;
3. When the "Accessory Update Available" notification pops up in the top-right corner, click "Options → Update";
4. Once the log shows `step:Prepare ... successful:YES next-step:Apply`, unplug the dock's power again for 10 seconds and plug it back in;
5. Wait a few minutes without unplugging any cables or closing the MacBook lid.

<figure>
  <img src="/uploads/2026/10/27/%E4%BA%8C%E6%89%8BTS3Plus%E5%8D%87%E5%AE%8C%E5%9B%BA%E4%BB%B6%E6%80%BB%E7%AE%97%E8%88%92%E5%9D%A6%E4%BA%86/03-replug-to-apply.webp" alt="Xiaohei yanking out the power plug while a waiting firmware package on a hook begins sliding toward the dock" width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Fig. 03 | Even once the update is staged, it takes another power cycle to write it.</figcaption>
</figure>

I ran a small loop checking the firmware version every 15 seconds:

```text
22:30:16 35.1
22:30:32 absent
22:30:47 absent
22:31:02 44.1
```

The dock disappeared for about half a minute. When it reappeared, it was on 44.1, and the Link Controller Firmware had moved from 0.36.0 to 0.40.0 along with it.

One side note: System Information doesn't refresh automatically. Even after you unplug the dock, it stays listed in the window until you press ⌘R.

## The Monitor Lit Right Up

Once the firmware update finished, I plugged the USB-C to DP cable back into the dock's downstream Thunderbolt port, and the monitor lit right up. macOS detected the BenQ EW3270U at 4K 60Hz.

Earlier while troubleshooting, I had also seen another symptom: sometimes when the screen went black, the TS3 Plus disappeared completely from the Thunderbolt device list, even though the dock's USB audio interface and card reader stayed connected. So if the screen ever goes black again, the first thing I'll check is whether the dock itself still shows up under Thunderbolt. If not, I'll swap out the Thunderbolt cable between the Mac and the dock first.

It has been solid ever since. When buying a secondhand dock, checking the firmware version really ought to be step one.

## On Troubleshooting with AI

I worked through this whole debugging session with AI, and its first two calls were flat wrong: first it claimed Apple Silicon couldn't flash this firmware at all, and then it said 44.1 only raised the charging wattage and told me not to bother.

The turning point came when I pasted in the release notes—specifically the line about improving USB-C monitor compatibility—along with the `accessoryupdaterd` entries from the system log. Once it had those two pieces of evidence, it quickly zeroed in on the pending-update state and handled the step-by-step sequence and timing from there.

Just like the video issue I debugged last time, what helped most was still primary evidence: official documentation, the unpacked installer, and system logs. Plausible-sounding conclusions are always worth checking against those first.
