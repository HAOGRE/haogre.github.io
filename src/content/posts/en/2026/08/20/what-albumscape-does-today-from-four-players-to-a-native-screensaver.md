---
author: "HAOGRE"
pubDatetime: 2026-08-20T00:00:00.000Z
title: "What Albumscape Does Today: From Four Players to a Native Screensaver"
featured: false
draft: false
lang: en
translationKey: "albumscape-05-current-state"
tags:
  - "ai"
  - "programming"
  - "business"
description: "As of August 2026, Albumscape has read-only observation for four players, a dynamic album wall, local artwork storage, status-bar packs and the screensaver core, while several release gates remain open."
---

Albumscape is no longer a prototype with one centered cover, but it also does not turn every planned capability into a shipped claim. The accurate way to describe the current state is to separate implemented behavior and evidence from runtime gates that still need formal verification.

![Albumscape screensaver thumbnail showing the central focus, surrounding album covers and the full square-wall proportion](/uploads/2026/08/20/albumscape-05-current-state/thumbnail-2x.png)

<small>Current product asset | Albumscape wall thumbnail used for screensaver preview</small>

## The basic experience today

Albumscape is a local-first macOS desktop-art app with the fixed category description **A Living Album Wall for Mac**. It reads playback state and metadata from Apple Music, Spotify, QQ Music and Netease Cloud Music without controlling the players.

During playback, the current album enters a central 3×3 focus module. On pause, the focus contracts to one center tile while the wall remains on the desktop. Ordinary cards perform low-frequency, staggered 3D Y-axis flips to show track and artist information. A local region may breathe occasionally. Cross-album changes use a focus-to-background spatial handoff; same-album changes use an information-face flip.

The wall uses the complete `NSScreen.frame`, including the menu bar and Dock regions, but remains below Finder icons and ordinary application windows. Mouse events pass through, and the app does not actively hide or show the wall because another app comes forward, minimizes or invokes Show Desktop.

## How four players coexist

Apple Music and Spotify use controlled local scripting. QQ Music and Netease Cloud Music use MediaRemote metadata observation. All playback input passes through `PlaybackInputCoordinator`, and `PlaybackMessageBus` arbitrates one active source with a fixed priority: Apple Music, Spotify, QQ Music, then Netease Cloud Music.

Artwork follows one `ArtworkAcquisitionFacade`: observed artwork first, provider-local cache next, then controlled player, MusicKit and Apple public-catalog fallbacks. Artwork is deduplicated with a visual fingerprint and persisted as two PNG variants, a 320 px preview and a 1024 px focus image. When no trustworthy artwork exists, the current track gets a metadata placeholder rather than the previous album’s cover.

## The status bar grew from one icon to nine

The menu bar now has nine free built-in dynamic packs: Cassette, Playback Bars, Vinyl Player, Pulse Rings, Metronome, Note Pulse, Equalizer Dots, Orbit and Heartbeat.

They are ordered multi-frame PNG templates in the resource directory, not static symbols drawn at runtime. Cassette has 24 frames; the other packs have 12 or 16. Source canvases are 192×72 px, visible content is kept at 56×21 pt, and the status item uses a native 28 pt placeholder. Playing loops, pause freezes the current frame, and idle returns to the first frame.

![One frame from the Playback Bars status-bar pack, with white bars and safe margins inside the source canvas](/uploads/2026/08/20/albumscape-05-current-state/playing_08.png)

<small>Current resource asset | A dynamic Playback Bars template frame</small>

Icon Studio is free to open, while PNG import, deletion and template/original-color management belong to the unified Pro entitlement. Custom assets are copied into Application Support and never modify the signed app bundle. They also stay outside the player, artwork, logical-wall and projection correctness paths.

## Living Album and display tiers

The wall currently has six Living Album families and 18 variants: classicFlip, edgeLift, tileWave, shutterStrip, diagonalFold and depthLayered. Free users get four selected classicFlip variants; Pro gets all 18. Basic flips, regional breathing, central focus and cross-album handoff are not paywalled.

The free version uses the system main display only. Pro expands to all non-mirrored drawable displays. Multiple displays do not generate separate walls; they share one logical working set, generation and motion scheduler and then project visible slots per display.

Custom tile size is a Pro visual-control feature. Automatic tile sizing, player compatibility, artwork, history capacity, privacy, stability, performance and accessibility remain part of the free experience.

## The native screensaver has a separate process boundary

The native macOS `.saver` is exclusive to Pro in the Developer ID distribution. The main app publishes an immutable screensaver snapshot to the user-level Application Support directory. The host reads the snapshot, validates paths, loads artwork in the background and passes it to its own presentation runtime. It does not observe players, write provider libraries or request media permission.

The screensaver core includes the snapshot model, atomic manifest, deterministic cross-process timeline, zero-size frame handling, repeatable `startAnimation → stopAnimation → startAnimation` lifecycle and Universal bundle validation. Direct builds require a real Developer ID Application CMS signature; an ad-hoc signature is not treated as an installable product.

Important gates remain open: formal notarization, the production Pro entitlement verifier, a fresh System Settings preview after installation, real ScreenSaverEngine idle startup and screensaver CPU sampling cannot be claimed from an offline bundle probe.

## Current review and commercial state

The commercial model is a free base version with a permanent Pro purchase. The App Store side has an `Albumscape Pro` non-consumable product configured. The project’s status record lists Build `0.0.16 (17)` with a US$29.99 baseline. The 2026-08-17 release audit records the macOS version and Pro item together in `Waiting for Review`.

That means the submission is in the review process, not that review has passed. Developer ID distribution still needs the production license service, notarization and screensaver runtime evidence. The App Store build does not include the `.saver`, installation entry or website authorization logic.

## The most honest numbers today

As of 2026-08-20, the clean `swift test` baseline is 587 tests, zero failures and two environment-related skips. SwiftPM and Xcode build-system builds have passing records, and the Universal screensaver bundle passes offline structural validation.

Runtime evidence is separate. Apple Music focus, pause, spatial handoff and parts of provider switching have been verified on the desktop. The first three of the nine status-bar packs have Computer Use selection evidence; the six newer packs have structured automation coverage but still need real GUI visual recheck. The five-minute steady CPU sample averages close to or at 5%, while short bursts still reach roughly 13% to 18%. Spaces, native full-screen, the formal screensaver host and notarization remain separate gates.

## Why it is ready to explain now

A project does not need every release checkbox to be green before it is worth showing. Public writing does need to separate product behavior from release gates. Albumscape is now clear enough to explain: read-only observation for four players, an album wall that follows playback without disrupting work, a local artwork archive, dynamic menu-bar feedback and a Pro screensaver path.

If you want to turn the music you are playing on a Mac into a desktop visual, the current product entry point is [Albumscape](https://albumscape.haogre.com/).
