---
author: "HAOGRE"
pubDatetime: 2026-08-13T00:00:00.000Z
title: "Restraint in a Resident Desktop App: Permissions, Arbitration and the CPU Ledger"
featured: false
draft: false
lang: en
translationKey: "albumscape-04-restraint"
tags:
  - "ai"
  - "programming"
  - "business"
description: "Albumscape’s engineering challenge is not only visual: permissions must stay quiet, four players must not retire each other by mistake, and desktop animation must account for CPU."
---

A resident desktop app is easy to describe as “a window placed there with a few animations.” After it runs for a whole day, users care about a different set of questions: did it request permission at the wrong time, did a player switch scramble the wall, did it keep the fans spinning, and did it read history that it should not read?

The most valuable Albumscape fixes were often not new visual effects. They made those boundaries explicit.

![One frame from the Playback Bars status-bar pack, with white bars kept inside the compact visible region of a 192×72 source canvas](/uploads/2026/08/13/albumscape-04-restraint/playing_08.png)

<small>Development asset | One resource-driven frame from the Playback Bars pack</small>

## Four players should not become four pipelines

Albumscape has dedicated optimizations for Apple Music, Spotify, QQ Music and Netease Cloud Music. Supporting four players does not mean maintaining four separate paths from observation to rendering.

Playback input first passes through `PlaybackInputCoordinator`, which normalizes it and assigns a domain revision per `PlayerScope`. Spotify’s script path and MediaRemote fallback can return different native IDs. If the track metadata is still the same, they reuse one track session instead of creating another album, history entry, focus flip or ambient reset.

The arbitration order is fixed: Apple Music, Spotify, QQ Music, then Netease Cloud Music. `PlaybackMessageBus` recomputes from the full registry instead of interpreting a MediaRemote player switch as an explicit stop from the previous provider. A candidate retires only after that provider emits a stopped observation or its lease expires.

The principle is simple: an adapter reports what it observed, arbitration decides who is active, and the wall consumes the final result. An observation source should not also decide how the wall rearranges itself.

## Permission flow must protect idle users first

Apple Music and Spotify script access involves Automation permission. If the app requests it on launch, a user opening the app before playing music sees a system dialog before seeing any product value.

Albumscape separates TCC checks into passive and user-initiated paths. During background polling it only observes existing authorization and never starts a prompt. Once stable playback or pause is confirmed, a non-modal menu-bar entry becomes available. Only the user clicking that entry starts the system authorization flow. If access is denied, the recovery entry stays available and can open the relevant System Settings page.

The lower-level trap is the blocking behavior of `AEDeterminePermissionToAutomateTarget`. It may fail to return when the target app or tccd is unresponsive, so it cannot be put on the Swift Concurrency cooperative pool. Probing now runs on a private queue with a per-provider cache. A stable permission is not re-probed on every refresh. A timeout must not be disguised as “not authorized,” because that would silently disable a valid local script source.

These details do not appear in a product screenshot, but they decide whether a desktop tool feels quiet or interrupts every first launch.

## Artwork is not simply “any image will do”

Artwork acquisition has a deliberate order: observed artwork, provider-local cache, direct Apple Music or Spotify scripting, MusicKit, then the Apple public catalog. When QQ Music or Netease Cloud Music lacks raw artwork bytes, the resolver queries by track, artist and album, then falls back through less specific metadata and stores a stable choice in the provider partition.

The catalog’s `artworkUrl100` is upgraded to a higher-resolution variant. A low-resolution blob with the same visual fingerprint cannot replace a better asset. Persistence keeps only two lossless PNG variants, a 320 px preview and a 1024 px focus image. Background tiles read preview; focus reads focus; the in-memory cache distinguishes both variants.

The important part is identity, not request volume. Apple Music’s system artwork cache has no track identity, so a fresh timestamp is only a candidate signal. If its fingerprint already belongs to another album, the candidate must be rejected. A metadata placeholder is safer than binding the previous cover to a new album.

## The CPU ledger must use the real desktop

The target is no more than 5% CPU during stable playback. XCTest cannot prove that, and an idle process without the wall cannot stand in for it. On 2026-08-19, a release DMG ran from `/Applications` while Apple Music was playing and the wall animation was active. A five-minute sample averaged roughly 4.7% to 5.0%, meeting the mean target, but poll and flip bursts still reached roughly 13% to 18%. A steady state with headroom is not yet verified.

The most useful result was not that the average barely crossed the line. It was finding a 60fps `onChange(appearance)` loop. The now-playing poll refreshed every two seconds and published state even when the content had not changed, repeatedly dirtying the SwiftUI graph. Removing that loop returned the steady wall to the target range.

That is still not final acceptance. A resident app needs separate accounting for bursts, track changes, first-time artwork encoding, animation and occlusion. A per-cell timeline slice is still planned before the next formal `.app` sample.

## Local-first has to be observable

Albumscape stores provider history and artwork cache under Application Support and uses a process-level advisory lock so two instances cannot overwrite `library.json` with stale in-memory state. Each provider keeps up to 512 albums and 512 unique artwork assets by default. The visible wall is a recent working set, not a permanent binding for every archived album.

The app does not read private player history. Catalog queries process only the current active track. Negative caching and backoff are scoped by provider and track. Diagnostics record revision, assignment diff, stale-result drops and motion events, but do not persist or upload artwork bytes.

The value of local-first is explainability. Users can understand where a cover came from, when a fallback is used, where the cache lives and what happens on failure, instead of leaving the desktop content to an opaque background service.

## Restraint becomes the experience

When player observation, permission probing, artwork acquisition, cache writes and wall presentation have separate boundaries, the product feels less busy. The user sees a slowly changing wall while listening, keeps the wall during pause, does not see a window flash while switching apps, and does not need a fan to accelerate for a background animation.

Albumscape is still completing runtime verification for the formal `.app`, multiple displays, Spaces, the screensaver host and the CPU gate. The product entry point for this read-only, low-distraction Mac album wall is [Albumscape](https://albumscape.haogre.com/).
