---
author: "HAOGRE"
pubDatetime: 2026-06-11T12:40:05.467Z
title: "One Sentence That Made My App's Design Soar"
featured: false
draft: false
lang: en
translationKey: "Fable一句话让设计原地起飞"
tags:
  - "musings"
description: "I told AI 'Make the design 100x better' and it rebuilt the entire design system—aurora gradients, glassmorphism, custom components—transforming the app completely."
---

> **"Make the design level of this app 100 times better than it is now."**
>
> That single sentence turned my app into something else entirely.

---

## What Happened That Afternoon

I was building an iOS focus lock screen tool—ZenLock. Features were complete, logic was sound, StoreKit was integrated, Live Activity was running. The only problem: **it looked too ordinary.**

White background, gray cards, dual-wheel scroll pickers—functional but soulless. Like a product wearing a hospital gown.

Then I typed just one sentence into Claude Code:

> **Make the design level of this app 100 times better than it is now.**

Notice: I gave it no specific design direction—no colors, no components, no animations. I just gave it a **target altitude** and let it figure out how to get there.

What happened next left me stunned.

---

## What It Did

It didn't just tweak a few colors. It rebuilt the entire design system from scratch:

**Starting with `ZenTheme.swift`**, it added an aurora palette (Indigo / Violet / Blue / Teal—four adaptive hues), glassmorphism tokens (`zenGlassFill` / `zenGlassStroke`), spacing and corner radius enums, and two animation constants (`zenBreath` 4-second breathing cycle, `zenSoft` spring animation).

Then it created five brand-new components, placed in `Shared/Components/`:

| Component | Purpose |
|-----------|---------|
| `AuroraBackground` | Multi-colored light spots drifting slowly across the screen, with calm/deep moods; falls back to static gradient when `reduceMotion` is enabled |
| `GlassCard` | Unified frosted glass background modifier with stroke and shadow |
| `BreathingRing` | Gradient progress ring around the timer with breathing glow |
| `RadialDurationDial` | Draggable circular duration picker replacing dual wheels, with tick marks and haptic feedback |
| `PrimaryButton` | Unified gradient primary action button with press-scale and haptics |

Then it restyled every screen—idle page, focus active, confirmation sheet, paywall, Live Activity—**without touching a single line of logic code. It was a pure visual reskin.**

The whole process took me one cup of coffee.

---

## Before & After

Below are screenshots: left is "before," right is "after."

### Idle Page / Duration Selection

**Before:** White background + dual-wheel picker + plain gradient button. Functional.  
**After:** Aurora background slowly pulsating, brand text fading in, circular dial draggable, quick presets (15m / 25m / 45m / 1h) one-tap away, primary button with shadow and glow.

<table><tr>
<td align="center"><b>Before</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/Image_20260611201031_6_43.png" width="300"/></td>
<td align="center"><b>After</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/01_idle.png" width="300"/></td>
</tr></table>

---

### Confirmation Sheet

**Before:** Feature icons all system blue, list items unstyled, button blending into background.  
**After:** Aurora-family feature icons, glassmorphism list rows, brand gradient confirm button, pulsing leaf animation as accent.

<table><tr>
<td align="center"><b>Before</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/Image_20260611201035_7_43.png" width="300"/></td>
<td align="center"><b>After</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/02_confirm.png" width="300"/></td>
</tr></table>

---

### Focus Active / Paywall

**Before:** White background timer + plain text + tiled cards.  
**After:** Breathing glow around the countdown, frosted glass distraction counter floating above; paywall also upgraded with aurora background + glowing product rows + glass statistics panel.

<table><tr>
<td align="center"><b>Before</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/Image_20260611201039_8_43.png" width="300"/></td>
<td align="center"><b>After</b><br><img src="/uploads/2026/06/11/Fable一句话让设计原地起飞/03_active.png" width="300"/></td>
</tr></table>

---

## Why This Is Worth Recording

Not because the design became beautiful—though it certainly did.

But because this reveals a **new development rhythm**:

In the past, a UI upgrade meant:  
→ Designer creates mockups → Review → Export assets → Developer implements → Back-and-forth alignment

Now it means:  
→ You describe a direction → Fable delivers a complete design system implementation → You review and tweak

**What's astonishing about Fable's comprehension isn't just that it "can write code"—it's that it can translate a vague goal like "100x better" into a concrete set of design decisions.**

It didn't ask me "What does 100x mean?" Instead, it reasoned: aurora gradient background means multi-layered blurred light spots drifting; glassmorphism means `.ultraThinMaterial` + gradient stroke highlights; breathing feel means a 4-second looping animation that matches the user's relaxed state; and `reduceMotion` accessibility fallback—it thought of all these details, while I only said "100x."

That's the point: **You give a direction; it completes the entire path.**

This isn't "AI-assisted development." This is **AI and developer jointly executing a true product upgrade.**

---

## A Personal Reflection

I've been an indie developer for years, and I know well that "one person can handle features, but design is often the weak link." It's not about lacking taste—it's about the high implementation cost, especially for animation systems, design tokens, and component encapsulation—the engineering work with a steep learning curve.

Today's experience reminded me why I fell in love with building products in the first place: **You have a vision in your head, and it helps you turn that vision into reality.**

One sentence, one cup of coffee, and the app became something else entirely.

That's the feeling Fable gave me today.

---

*ZenLock 1.1.0 is complete and coming soon.*  
*App Store: [ZenLock](https://apps.apple.com/cn/app/%E7%A6%85%E5%AE%9A%E6%97%B6%E5%88%BB/id6765883799)*

---

**June 11, 2026, written on a MacBook**
