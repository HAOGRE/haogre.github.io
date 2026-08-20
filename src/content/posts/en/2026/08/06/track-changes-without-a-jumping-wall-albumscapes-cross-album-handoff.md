---
author: "HAOGRE"
pubDatetime: 2026-08-06T00:00:00.000Z
title: "Track Changes Without a Jumping Wall: Albumscape’s Cross-Album Handoff"
featured: false
draft: false
lang: en
translationKey: "albumscape-03-handoff"
tags:
  - "ai"
  - "programming"
  - "business"
description: "The hard part of an album wall is not drawing cards. It is keeping the new focus, old artwork, target slot and late artwork completion coherent during a cross-album change."
---

The first version of an album wall is easy to imagine: when the track changes, replace the center image and fill the old position with another cover. Rapid track changes expose the real problems. The old focus disappears, the target flashes a new cover and returns to empty, a row shifts because a conditional view changed its width, and late artwork restarts an animation that already finished.

Albumscape treats this as a spatial handoff rather than an image replacement.

![Albumscape screensaver thumbnail showing a central focus and surrounding album cards, useful for seeing the relationship between focus and background slots](/uploads/2026/08/06/albumscape-03-handoff/thumbnail-2x.png)

<small>Development asset | The album-wall thumbnail separates the meaning of focus from the meaning of a background slot</small>

## Why focus lives outside the logical wall

The first instinct is to put the current album directly into the center slot. That makes focus and background share one assignment lifetime. As soon as an album becomes focus, its home slot is released; when it comes back, the system has to guess where it used to be.

The current model treats focus as a playback-feedback layer outside the wall. Once an album receives a home slot during the working set lifetime, it keeps that binding even while it is focused. When A changes to B and then back to A, A keeps its home and B returns from focus to its own position. If B already has a slot, the assignment diff can be zero, but the presentation still receives an explicit existing-binding transaction.

This gives the two concepts different jobs. The working set answers “where does each album belong?” Focus answers “how should the current playback be seen?”

## Four phases in a cross-album handoff

A cross-album handoff is not one `withAnimation` around a state assignment. It is a cancellable transaction with four observable phases:

1. `readiness`: wait for incoming artwork, up to 1.2 seconds by default. Start the handoff once the artwork is ready; on timeout, use the current metadata placeholder.
2. `traveling`: the new focus starts at its final size and opacity. The old focus cover shrinks and travels toward the target background slot.
3. `arrivalCoverHold`: around 75% to 90% of the travel, the old cover sinks smoothly below the focus layer. It remains a front-side cover for 0.4 seconds after arrival, so it cannot immediately turn into an information face.
4. `settled`: the target slot takes over atomically and emits one settled feedback. During travel, the target keeps its previous content or stays empty; it does not reveal the post-assignment moving cover early.

The sequence preserves the visible cause and effect. The old cover really moves from focus to the target, the new cover really belongs to the current track, and the same image is not drawn twice as target content and as a moving layer.

## A fixed cell footprint matters more than a conditional view

If an empty slot is removed from an `HStack`, SwiftUI recalculates the row width. When the slot becomes a real cover during a handoff, the neighboring content can shift immediately. The user sees an entire row jump instead of a wall.

Albumscape keeps a `tileSize × tileSize` layout footprint for every logical cell. Empty state, focus placeholder and real artwork change only the drawing inside that footprint. During a handoff, the target keeps its before-content until the moving layer is ready to take over.

It looks like a layout detail, but it is the foundation of animation correctness. No easing curve can hide an outer layout that changes its width halfway through the motion.

## Latest-wins does not mean “skip everything”

When tracks change quickly, Albumscape does not insist on finishing A to B and B to C if C is already the latest state. Focus and background handoffs use latest-wins, so an older transaction can be replaced before it settles.

There is one condition: the newest track must receive a final settled feedback. Otherwise the renderer can remain in `traveling` while the Store believes the handoff is complete, and the next change starts from a stale intermediate state.

Late artwork follows the same rule. An image arriving after the 1.2-second readiness window does not restart a handoff. It fades into the current content only if the track session and generation still match. A mismatched provider or session is recorded as `artwork-drop-stale` rather than weakening the gate to make the wall look fuller.

![One frame from the Vinyl Player dynamic status-bar pack, with the white record and tonearm kept inside a compact safe area](/uploads/2026/08/06/albumscape-03-handoff/playing_08.png)

<small>Development asset | One runner frame with the same preference for explicit state boundaries</small>

## Same-album and cross-album changes need different paths

For a same-album track change, the important change is information. The focus flips around the Y axis to the track and artist, then returns along the original path to the cover.

For a cross-album change, the important change is spatial. The new album establishes the focus quickly and the previous cover completes its trip to a background slot. It does not pass through the track-information face. Reusing the same “flip to metadata, then replace the cover” path would create an intermediate picture that does not match the playback fact during rapid changes.

Playback direction is also maintained separately in a short local `PlayerScope` navigation trace. Natural next-track movement is `forward`, a hit on the previous trace item is `backward`, same-album changes are `none`, and unknown direction defaults to `forward`. Direction only affects visual policy; it never adds playback control.

## Multiple displays must not draw separate decisions

Each drawable display projects only its visible slots, but all displays share one logical `WallWorkingSet`, immutable snapshot, generation and scheduler. The same logical slot therefore shows the same album on every display instead of making independent random choices.

Topology changes also do not mean a full rearrangement. Resolution, scaling, rotation and display insertion are debounced through the system notification. Existing assignments are kept, and artwork is hydrated in the background only when the hydration ring grows.

## The value is not extra spectacle

The goal is simple: when a track changes, the new album really arrives at the center, the old album really returns to its place, and an empty slot or late network response does not requeue the whole wall.

In the latest real Apple Music desktop verification, the handoff logs consistently followed `readiness → traveling → arrivalCoverHold → settled`. Each change modified one assignment and did not enter an information-face phase. The fixed cell footprint also removed the row shift that appeared when an empty slot accepted a moving cover.

The product context for this work is [Albumscape](https://albumscape.haogre.com/), a Mac album wall designed to follow playback without taking control of it.
