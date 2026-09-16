---
author: "HAOGRE"
pubDatetime: 2026-09-16T12:07:26.206Z
title: "Ask AI to Debug Beyond a Plausible Answer"
featured: false
draft: false
lang: en
translationKey: "让AI排查问题别停在听起来合理的答案"
tags:
  - "ai"
  - "programming"
  - "debugging"
description: "How a counterexample, controlled experiments, and explicit evidence limits improved an AI-assisted video playback investigation."
---

The AI assistant's first explanation sounded convincing.

An MP4 would not play, and inspection showed H.265 video. The assistant noted that browser HEVC support varies and suggested considering H.264. It would have been easy to convert the file and label the incident a format compatibility issue.

But I had another video that played. The assistant inspected it too: H.265 again.

I asked why one worked and the other did not. What followed was more useful than the initial answer.

## A counterexample turned a guess into a test

“HEVC might be incompatible” was a candidate explanation. A working HEVC file did not prove support for every HEVC variant, but it did show that a codec name alone could not explain the difference.

The assistant compared tracks, bitstream parameters, and container structure, then decoded both files completely with FFmpeg. It also built a local comparison page that exposed the browser's detailed media error.

The failing sample could not be opened by the MP4 demuxer. Further experiments isolated an additional `mebx` metadata track: skipping only that track, while preserving the original media data and index placement, allowed actual playback.

That evidence supported a more specific conclusion and made conversion to H.264 unnecessary as the first remedy.

## Ask what the next experiment would establish

Asking “Are you sure?” may only produce a more elaborate version of the same explanation.

A more useful prompt is:

> Which facts are confirmed, and which are still hypotheses? If your hypothesis is correct, which single change should produce a different result?

This directs the conversation toward an executable experiment. If remuxing removes a track, moves the index, and rewrites timing, a successful result establishes that the combination helped. It does not identify which change mattered.

The decisive test here ignored only the original metadata track. Keeping the other conditions intact made the changed outcome much stronger evidence.

## Preserve what remains unknown

Identifying a problematic track does not reveal the meaning of every field inside it.

A software marker can suggest a recording or export origin, and `timed_metadata` identifies a timed metadata track. We did not decode its payload or follow the browser parser's source code to the exact failing condition.

The public explanation therefore needs a clear boundary: this sample's metadata track caused a parsing compatibility problem in the tested browser. The experiment does not establish that all videos from a device family fail, or that every metadata track can safely be discarded.

An AI assistant can produce a complete-sounding explanation. Its user still needs to distinguish completeness supported by evidence from completeness supplied by fluent wording.

## Raw debugging material is not a public article

The underlying material can be more sensitive than the conclusion. Resource URLs may contain temporary signatures, pages may include business identifiers, and video metadata may contain location information.

For these posts, I retained only the technical details needed to explain the result. Samples became A and B, and commands use `input.mp4`, `output.mp4`, and a documentation domain. Original media, page screenshots, full metadata dumps, and signed links are not included.

A repaired playback copy is not automatically sanitized either. Remuxing can preserve some file metadata; public distribution requires separate inspection of the file and its visible content. Fixing playback and removing sensitive information are separate tasks.

## Strong execution needs a testable direction

I supplied the problem and the counterexample. The assistant connected file inspection, browser checks, and controlled experiments. Its first assessment was incomplete, but it continued toward a more precise explanation when new evidence appeared.

I want a repair and a record that someone else can examine: what changed, what happened, and what is still unconfirmed. Those details let a conclusion move from a conversation into a useful incident report.

The assistant's practical ability deserves credit. It moved from inspecting files to building experiments, challenging its first hypothesis, and producing a remuxed copy without re-encoding. It completed a chain of tasks that normally spans several tools. A person supplies a crucial counterexample, the AI follows the evidence, and together they can get much further into a real problem.
