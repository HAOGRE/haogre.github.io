---
author: "HAOGRE"
pubDatetime: 2026-07-30T00:00:00.000Z
title: "The MVP Was Not Nine Players: First Turn One Track into a Stable Wall"
featured: false
draft: false
lang: en
translationKey: "albumscape-02-mvp"
tags:
  - "ai"
  - "programming"
  - "business"
description: "Albumscape’s smallest useful version had one reliable loop: read playback, acquire artwork, calculate a square layout, and render focus plus history on the Mac desktop."
---

An album-wall project can become too broad on its first day: Apple Music, Spotify, QQ Music, Netease Cloud Music, menu-bar icons, screensavers, multiple displays and dozens of effects. Albumscape’s MVP started with a narrower loop: a player has one active track, the desktop can display it reliably, and the next track does not scramble the whole wall.

![Albumscape macOS application icon with a central record surrounded by nine square color blocks](/uploads/2026/07/30/albumscape-02-mvp/A-film-vinyl.png)

<small>Development asset | The Albumscape macOS icon starts with a record and a square-grid language</small>

## Five actions are enough for the first loop

The first useful slice has five actions: observe playback, normalize it into domain input, acquire the current album artwork, calculate the wall geometry, and publish the result to the desktop view.

The first step is not reading a private object from one player. It produces an observation with provider, track, artist, album, playback state and a stable track session. Native IDs can differ between direct and fallback sources, so a fallback-to-canonical upgrade must not look like a new song.

The second step submits the observation through one `PlaybackUpdateFacade`. Apple Music and Spotify scripting adapters, QQ Music and Netease Cloud Music MediaRemote observations cannot each own a separate “refresh the wall” path. One submission order keeps the Store, navigation, presentation coordination and render invalidation from racing each other.

The third step acquires artwork. The MVP first guarantees that the current album has trustworthy visual content, rather than promising that every source is perfect immediately. Observed artwork comes first, then the local provider cache, then controlled player or catalog fallbacks. If no reliable image exists, the wall shows a metadata placeholder instead of reusing the previous song’s cover.

The fourth step is geometry. Every wall tile keeps a fixed square footprint. Rows, columns and spacing come from the real screen size. The focus is a 3×3 module, but it does not draw the center album nine times. Its four corners line up with the centers of the surrounding corner cards, while the center slot is not duplicated.

The fifth step is SwiftUI and AppKit presentation. The wall uses the full `NSScreen.frame`, sits at the desktop level, ignores mouse events and does not interfere with ordinary application activation. A surface that can stay quietly in the right place is closer to the product than a pretty screenshot in the wrong window layer.

## Why Apple Music came first

Apple Music was the first concrete observation path because it made the product boundary explicit. Albumscape reads playback state and metadata through a read-only script path. It does not send play, pause or track-navigation commands. Script access only becomes relevant during stable playback or pause and after the authorization policy allows it.

That choice also exposed a macOS risk that is easy to miss. `AEDeterminePermissionToAutomateTarget` is a synchronous blocking call. If the target application or tccd does not respond, it can take a long time to return. It must not run on the Swift Concurrency cooperative pool, and wrapping it in `Task.detached` does not make the blocking call safe. A stuck permission probe can occupy the available workers while playback observation freezes and the wall animation continues.

Automation probing therefore runs on a private queue with a per-provider cache. Idle launch does not trigger a system authorization prompt. When stable playback is detected, the user gets an explicit menu-bar entry to start the permission flow.

## How the first wall should change

The MVP visual feedback is also reduced to a few verifiable states.

When playback starts, the wall fades in and the current album enters the central focus. When the next track belongs to the same album, the focus flips around the Y axis to the information face and returns along the same path. When the album changes, the new focus appears at its final size and opacity while the old focus cover travels into a background slot.

Pause does not close the wall. The focus contracts to 1×1, the background remains visible, and playback-related motion freezes. Only quitting the app fades out the whole surface.

![One white cassette frame from the Cassette status-bar pack, with safe margins inside a 192×72 source canvas](/uploads/2026/07/30/albumscape-02-mvp/playing_00.png)

<small>Development asset | One frame from a dynamic status-bar pack; final content is shown at 56×21 pt</small>

## From “it displays” to “it can run for months”

Displaying one cover is not enough for an MVP. The useful minimum is that repeated observations do not rearrange the wall, a late artwork completion for the same track does not restart an animation, pause and resume do not resurrect the previous track, and a screen-geometry change does not randomly replace existing albums.

That is why the project introduced a provider library and a short playback history early. The library is a long-term archive, not a permanent binding between every saved cover and every visible slot. The visible wall is a recent working set calculated from the current display topology. Cold start and expansion use a fixed ring order; only a real cross-album change on a full wall may replace one older candidate.

The MVP lesson is that “minimum” is not simply a small feature count. It is a state path narrow enough to verify completely. The project later grew to four players, nine status-bar packs, 18 Living Album variants and a native screensaver, but the inner loop is still these five actions.

## Leave the right seams for later

If playback, artwork, geometry and views are mixed together, adding a second provider will disturb the wall. Albumscape later separated Domain, Application, Infrastructure, Presentation and the executable so that “observe one track and show one wall” remains a stable core.

As of 2026-08-20, the clean `swift test` baseline is 587 tests, zero failures and two environment-related skips. That number was not the MVP goal, but it shows that the original narrow loop became a set of boundaries that can keep growing.

If you want a Mac tool that reads Apple Music or another player without taking over playback, the current product entry point is [Albumscape](https://albumscape.haogre.com/).
