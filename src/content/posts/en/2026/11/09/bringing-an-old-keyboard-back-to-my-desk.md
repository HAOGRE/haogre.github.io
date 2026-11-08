---
author: "HAOGRE"
pubDatetime: 2026-11-08T23:44:57.389Z
title: "Bringing an Old Keyboard Back to My Desk"
featured: false
draft: false
lang: en
translationKey: "买了很久的键盘，终于重新用起来了"
tags:
  - "hardware"
  - "productivity"
  - "ai"
description: "Setting up an IQUNIX EZ63 for macOS: what I borrowed from HHKB, why some Fn keys stayed unassigned, and what AI-assisted configuration still needs to prove."
---

I finally started using a keyboard I bought a long time ago again.

It is an IQUNIX EZ63: a white case, blue-gray letter keys, and an orange spacebar and arrow cluster. It still looks good on the desk. This time, plugging it back into my Mac, I wanted to set it up properly: put Control within easier reach, make Command and Option match the keycaps, and give common operations places my fingers could find.

My first instruction to the AI was simple: make it as close to an HHKB as possible.

We went through several rounds of changes because of that sentence. The configuration we ended up with felt more like my own keyboard than the one I originally described.

![The IQUNIX EZ63 back on my desk, with a white case, blue-gray letter keys, and orange spacebar and arrows](/uploads/2026/11/09/%E4%B9%B0%E4%BA%86%E5%BE%88%E4%B9%85%E7%9A%84%E9%94%AE%E7%9B%98%EF%BC%8C%E7%BB%88%E4%BA%8E%E9%87%8D%E6%96%B0%E7%94%A8%E8%B5%B7%E6%9D%A5%E4%BA%86/ez63-on-my-desk.jpg)

## Unpacking “like an HHKB”

HHKB is a useful reference. The name seems to communicate several things at once: a compact layout, a particular Control position, an Fn layer, and navigation conventions. But the EZ63 already has dedicated arrow keys and a different right-hand layout. Those requirements needed to be considered separately.

What I actually wanted was specific: Caps Lock would become Control, Fn would move to the bottom-left corner, and the bottom row would follow my Mac habits: Fn, Option, Command, Space, Command, Option. I had no particular complaint about the backslash above Enter, Backspace at the top right, or the dedicated arrows.

Yet at one point, a proposal appeared to swap Backspace and backslash. I had to ask: when had we reached that conclusion?

That was when I noticed how easily “like this classic product” can turn into a complete answer. I was borrowing a few ideas to solve particular problems. If copying the layout meant relearning positions that already worked, the cost had overtaken the benefit.

We kept only part of the HHKB approach: the Control position and the Fn navigation conventions of K/L for Home/Page Up and comma/period for End/Page Down. Since the EZ63 already has dedicated arrows, we did not reproduce HHKB's arrow cluster on the letter keys. Backspace and the backslash/pipe key stayed where they were.

This is not a guide to the best HHKB remap. HHKB supplied a reference; the shape of this keyboard and my existing habits determined the result.

## What belongs on a layer matters more than how much fits

Once the base layer was settled, the Fn layer was where the configuration could easily keep expanding.

The driver offers function keys, media controls, lighting, macros, and various gaming features. A screen full of empty positions naturally invites a thought: having bought this keyboard, shouldn't I make use of what it can do?

I did ask whether too many features were being left unused. Eventually, I realized that the missing work was organizing common operations, rather than increasing the number of occupied positions.

Take media controls. A/S/D handle volume down, volume up, and mute; F handles play/pause. Putting previous and next track on G/H makes one continuous group. Compared with placing them on Fn plus the left and right arrows, this arrangement is easier to explain and remember. To control music, my hand returns to one area.

These are the main groups we kept:

| Fn combination | Purpose |
|---|---|
| 1–0, minus, equals | F1–F12 |
| A/S/D/F/G/H | Volume down, volume up, mute, play/pause, previous track, next track |
| K/L, comma/period | Home, Page Up, End, Page Down |
| Space, W, E | Launcher, Mission Control, emoji and symbols |
| O/P, V, Q | Screenshot toolbar, area capture, paste and match style, lock screen |
| Z, X/C, T/Y, B, Enter | Lighting toggle, brightness, effect speed, color, effect mode |

Home and End here are standard keycodes. Their behavior on a Mac depends on the application; they should not be confused with moving to the beginning or end of the current line, usually done with Command plus the left or right arrow. Hardware Fn switches a keyboard layer; it is not Apple's Globe/Fn key.

There was also a small but essential question: without a dedicated backtick key, how would I type code? Fn+Esc produces a backtick; adding left Shift produces a tilde. Pipe remains left Shift plus backslash. A layout needs clear access to occasional symbols as well as frequent actions.

## Macros save finger movements but add things to remember

We recorded seven macros, placing several Mac shortcuts on the Fn layer. Fn+P sends Command+Shift+4, Fn+O sends Command+Shift+5, and Fn+V sends Command+Option+Shift+V.

Macros add no new capability to the operating system. They shorten combinations that are awkward to press, which is also a useful criterion for deciding where to use them.

Copy and ordinary paste are already easy. Adding another route just to demonstrate macros has little value. Screenshots, emoji, and paste-and-match-style involve more modifiers, so simplifying them has a clearer payoff. Paste and match style still depends on application support: the keyboard sends keystrokes, but cannot make every program interpret them identically.

Fn+Space provided another example. It was initially labeled Spotlight. Checking this Mac's settings revealed that Spotlight's default shortcut was disabled; I use Alfred. The keyboard should send Command+Space, and the label should say “Launcher.” Assuming a system default describes the current machine can turn a minor labeling error into an everyday source of confusion.

I also already had Karabiner mapping right Shift to F18, matching my SUPER keycap, along with Control+H/J/K/L navigation. Those rules live in macOS. Looking only at the keyboard driver cannot tell the whole story.

A key's final behavior may pass through three layers: keyboard firmware, system remapping, and application shortcuts. Configuration needs to account for each layer. Otherwise, moving to another computer produces the familiar puzzle: why does the same keymap behave differently?

## The unassigned R, U, I, J, and N keys

After the changes, I noticed R, U, I, J, and N still had no extra Fn assignments.

My first reaction was that this seemed wasteful. We considered them individually. R could refresh, but Command+R is already convenient. I could show information, though that is mainly a Finder convention. U could show all windows of the current application, complementing Mission Control on Fn+W. That was a reasonable candidate, but hardly essential.

We left these positions alone. More precisely, they pass through to the base layer: holding Fn and pressing them still produces the original letters. They are not disabled.

An empty position has no automatic value, but neither does a function placed there merely to fill it. Every mapping introduces another convention to remember and occupies a position that might later serve a better purpose. That cost only has a chance to pay off when the function is actually used.

I do not yet have enough time with this configuration to claim it is optimal. Leaving space until a repeated inconvenience earns a dedicated key is the more honest approach.

Finishing a setup can include deciding what to leave unconfigured. Otherwise, the settings screen always has a next item, and actual use keeps getting postponed.

## Leaving the magnetic-switch settings alone

The EZ63's performance page also allows per-key actuation adjustment. In the screenshot, every key was set to 1.50 mm and Rapid Trigger was off.

We discussed grouping the keys: a deeper spacebar to reduce accidental thumb presses; deeper Enter and deletion keys to reduce unintended submissions or deletions; shallower modifiers to make chords easier. Each suggestion sounded plausible. They were still only proposals.

I decided to leave the settings alone for now.

The reason was practical. Changing the layout and actuation depth at the same time would make problems difficult to diagnose. A typo could come from an unfamiliar layout or shallow actuation. A missed chord could come from my movement or an unsuitable new setting.

Keeping a consistent 1.50 mm provides a stable baseline. Later adjustments will have something to be compared against. Rapid Trigger remains off too; gaming can have its own configuration if I need one later.

More adjustable parameters mean more ways to correct a problem. Changing all of them before a problem appears mostly creates more variables to explain.

## Working with AI requires evidence of completion

AI helped throughout this process: clarifying requirements, operating the driver, recording macros, and making a reference chart. It could take over much of the repetitive work, but I repeatedly had to bring the discussion back to what I actually wanted.

One characteristic mistake was hearing “HHKB” and trying to reproduce all its features. Another was interpreting “make full use of the keyboard” as “fill as many positions as possible.” Both can yield a convincing-looking plan without improving daily typing.

This resembles ordinary software requirements. “Make it like this product” is often borrowed language for something the user has not fully articulated. The useful questions concern which actions are awkward, which habits need to survive, and what evidence would show that a change works.

Completion also had to go beyond a driver screen that looked correct. We read both complete keymap matrices back from the keyboard: 140 positions, including matrix positions without physical keys. The seven macros' 301 bytes matched the expected action sequences. They used standard 50 ms intervals, and each pressed modifier had a corresponding release.

These checks establish that the device's keymap and macro data match the configuration. We did not physically unplug and power-cycle it, or test every action with physical keystrokes in every application. “The data was checked” is justified; “every usage scenario was tested” is not.

Exporting exposed another boundary. The official configuration code is temporary, and the export panel has no option for macro actions. M0–M6 bindings and the contents of those macro slots should not be assumed to travel together. Alongside the official code, we saved a complete JSON backup, the macro actions, and recovery instructions.

Having a backup file is half the work. Knowing what it includes, what it leaves out, and how to restore it later is the other half.

## A map for my fingers

Finally, I remembered the familiar Vim Cheat Sheet wallpapers. Since Fn functions are hidden behind the keycaps, why not draw both layers?

We made a chart matching the EZ63's actual shape: the base layer above and Fn below, with colors grouping media, navigation, Mac tools, and lighting. Keys without extra assignments are dimmed. SUPER also carries a note about its F18 behavior on this Mac.

![An EZ63 reference chart showing base and Fn layers, with media, navigation, Mac tools, and lighting in separate colors](/uploads/2026/11/09/%E4%B9%B0%E4%BA%86%E5%BE%88%E4%B9%85%E7%9A%84%E9%94%AE%E7%9B%98%EF%BC%8C%E7%BB%88%E4%BA%8E%E9%87%8D%E6%96%B0%E7%94%A8%E8%B5%B7%E6%9D%A5%E4%BA%86/ez63-two-layer-keymap.png)

[Open the 4K image to inspect individual keys](/uploads/2026/11/09/%E4%B9%B0%E4%BA%86%E5%BE%88%E4%B9%85%E7%9A%84%E9%94%AE%E7%9B%98%EF%BC%8C%E7%BB%88%E4%BA%8E%E9%87%8D%E6%96%B0%E7%94%A8%E8%B5%B7%E6%9D%A5%E4%BA%86/ez63-two-layer-keymap.png)

*This chart records my configuration. The SUPER/F18 and launcher behavior includes settings on this Mac; it is not the EZ63 factory layout.*

We also made an AI-generated visual version. Its source image was actually 1672×941 and was later enlarged to 7680×4320. A separate version was rendered directly from a vector layout at 8K. Both files have “8K dimensions,” but their text detail comes from different sources. For everyday reference, I prefer the directly rendered text.

The chart lets me start using the keyboard and glance at a reminder occasionally, rather than memorize every mapping first. Once most functions become familiar, the wallpaper can stop being important.

By the end, the keyboard had not become an HHKB, and not every feature had been used. It kept its original arrow keys, several Fn positions remained without extra assignments, and the magnetic-switch parameters were untouched.

I could finally stop looking at boxes in the driver and start writing. The next worthwhile change should come from something that bothers me while I type.

## References

- [HHKB Professional HYBRID official manual](https://www.pfuemea.com/assets/pdfs/gpsr/hhkb/hhkb-professional-hybrid-type-s_hybrid_manual_en.pdf)
- [Apple: Mac keyboard shortcuts](https://support.apple.com/en-us/102650)
- [IQUNIX EZ60/EZ63 software guide](https://iqunix.com/blogs/news/iqunix-ez60-ez63-software-user-guide)
- [Vim Shortcut Wallpaper](https://github.com/LevelbossMike/vim_shortcut_wallpaper)
