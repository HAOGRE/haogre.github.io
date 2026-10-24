---
author: "HAOGRE"
pubDatetime: 2026-10-24T02:54:43.762Z
title: "I Brought My BenQ EW3270U Home and Wrote It a Menu Bar Remote"
featured: false
draft: false
lang: en
translationKey: "显示器搬回家后，我给它写了个菜单栏遥控器"
tags:
  - "programming"
  - "ai"
  - "open-source"
description: "After moving my BenQ EW3270U from the office to home, I kept reaching behind it to dim it at night or change the volume. So I built MonitorLight, an open-source macOS menu bar app made for this display. The DMG is free to download."
---

I recently moved the **BenQ EW3270U** (31.5″ 4K) from my office desk to my desk at home.

At the office I set the brightness once and forgot about it. Home is different. In the evening I often have just one small lamp on, and a 4K panel at full brightness is harsh, so it needs dimming. The built-in speakers honestly sound pretty bad, but when I don't feel like wearing headphones they're fine for background sound, so the volume needs adjusting too.

Every one of those changes meant reaching behind the display and feeling my way through menus with the little joystick button. The brightness keys on a Mac keyboard only control the built-in screen, not an external display. Doing that once is fine; doing it every day gets old.

So I built a small tool: **MonitorLight**, a macOS menu bar app made for the EW3270U. Click the sun in the menu bar and brightness, volume and picture mode are all right there.

![MonitorLight panel in light and dark mode](/uploads/2026/10/24/显示器搬回家后，我给它写了个菜单栏遥控器/panel-en.png)

## Download and source

- **Download:** [MonitorLight.dmg](https://github.com/HAOGRE/MonitorLight/releases/latest/download/MonitorLight.dmg) (Apple Silicon, macOS 14 or later)
- **Source:** [github.com/HAOGRE/MonitorLight](https://github.com/HAOGRE/MonitorLight), MIT licensed

Open the DMG and drag MonitorLight to Applications. The app isn't notarized by Apple, so macOS blocks the first launch; go to **System Settings › Privacy & Security** and click **Open Anyway**. To use the keyboard's brightness keys, allow Accessibility access when it asks.

**Which display:** the whole tool was built against the BenQ EW3270U (model ID BNQ7950), and every picture setting was verified on that display. Other DDC/CI displays usually get brightness and volume, but picture settings are only enabled for the EW3270U.

## What it does

- **Brightness and volume:** Control Center–style sliders you can drag, click or scroll. Presets for Soft (35%), Normal (60%) and Bright (85%) make dimming for the evening a single click. Mute remembers the previous volume.
- **Keyboard:** the Mac's brightness keys control the display directly, and global shortcuts cover the rest: ⌃⌥↑↓ for brightness, ⌃⌥←→ for volume.
- **Picture settings:** picture mode, low blue light scenes (Multimedia, Web Surfing, Office, Reading), sharpness, AMA and scaling, without opening the display's menu.
- **Menu bar icon:** the ring of dots around the sun is a brightness gauge; a full ring means 100%. You can switch it to show the number instead, and scrolling over the icon adjusts brightness.
- **English and Chinese,** following the system language.

![Picture and Settings pages](/uploads/2026/10/24/显示器搬回家后，我给它写了个菜单栏遥控器/pages-en.png)

## Things I ran into

I built this together with Claude Code. The features themselves are simple; almost every problem came from talking to the display.

### How a Mac controls a display

Settings like brightness and volume can be read and written over a channel called **DDC/CI**, which lets the Mac send commands to the display. Apple Silicon has no public API for it, so MonitorLight uses the private IOAVService interface, based on the open-source [m1ddc](https://github.com/waydabber/m1ddc).

To keep the menu bar responsive, all communication runs in a separate helper process, one request at a time, with timeouts. Dragging a slider merges requests instead of queueing hundreds of commands.

### The display lies

This was the biggest surprise. When the EW3270U gets a query it doesn't support, or can't answer right now, it sometimes returns **the previous query's result** instead, with a valid checksum. Reading a number doesn't mean you read the setting you asked for.

It fooled us once. One register returned different values for sRGB and Rec.709, which looked like a way to tell the two modes apart at last. Then we changed nothing but the order of the reads, without writing anything, and the value simply followed whatever had been read just before. It was echoing, so that conclusion had to go.

The rule we settled on: **a write only counts when an independent read returns the same value**, and every read is checked against a known sentinel value first to catch these echoes.

### Look at the real menu before designing the UI

At first I laid out the four low blue light scenes as ordinary picture modes, and later mistook them for a submenu. Only after photographing the display's own menu did it become clear that Picture Mode and Low Blue Light are two separate menus side by side. A parameter table gives you numbers; the product structure comes from the real menu.

### When brightness is locked

With B.I.+ (BenQ's automatic brightness), HDR or certain picture modes turned on, the EW3270U refuses brightness changes entirely. MonitorLight then dims the picture with a translucent overlay and says so in the panel. Once you turn those features off on the display, it switches back to hardware dimming on its own, without a manual re-detect.

### Then the polish

Once everything worked reliably, a lot of time went into details: a Liquid Glass panel, made narrower; sliders that track your finger instead of jumping, with a light trackpad tick at each preset; and full keyboard control inside the panel.

The menu bar icon went through several rounds. The first version showed the number and the gauge at the same time, which led to a rule: **never show the same information twice**. By default a ring of dots shows the level, with unlit dots dimmed the way empty signal bars are on an iPhone; turning on the percentage shows only the number. When I couldn't decide, I drew the options side by side at real size and picked from the sheet (its labels are in Chinese):

![Comparison sheet of menu bar icon options](/uploads/2026/10/24/显示器搬回家后，我给它写了个菜单栏遥控器/icon-options.png)

The final icons: the brightness gauge on the left and the percentage on the right, on light and dark menu bars.

![Final menu bar icons](/uploads/2026/10/24/显示器搬回家后，我给它写了个菜单栏遥控器/menu-bar-icons.png)

## What it can't do yet

- **Contrast:** writes couldn't be verified by reading them back, so it isn't offered.
- **HDR, Cinema HDR and B.I.+:** no reliable way to control them yet; use the display's menu.
- **sRGB vs Rec.709:** the display reports the same mode for both, so they can't be selected separately.
- **Other displays:** only the EW3270U has been fully verified.
- **Not notarized:** you need to allow it manually on first launch.

If you also own an EW3270U, or you're tired of reaching behind your display, give it a try. Issues and suggestions are welcome on [GitHub](https://github.com/HAOGRE/MonitorLight/issues).
