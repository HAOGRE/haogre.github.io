---
author: "HAOGRE"
pubDatetime: 2026-09-16T12:07:25.942Z
title: "Same HEVC Codec, Different Playback Results"
modDatetime: 2026-09-16T12:38:14.912978+00:00
featured: false
draft: false
lang: en
translationKey: "同样是H265为什么一个视频能播另一个不能"
tags:
  - "video"
  - "debugging"
  - "ai"
description: "A browser playback investigation that traced an MP4 parsing failure to a timed metadata track through controlled tests."
---

A video on a webpage would not play. The player offered little more than “Unable to play media.”

I asked an AI assistant to inspect the file. ffprobe identified H.265 / HEVC, and the assistant suggested a familiar explanation: HEVC support might be the problem, so converting to H.264 could help.

That sounded plausible until I supplied a second video that played successfully. It used HEVC too.

“If they use the same codec, why does only one play?” That question moved the investigation from a plausible explanation to an experiment.

<figure>
  <img src="/uploads/2026/09/16/%E5%90%8C%E6%A0%B7%E6%98%AFH265%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%80%E4%B8%AA%E8%A7%86%E9%A2%91%E8%83%BD%E6%92%AD%E5%8F%A6%E4%B8%80%E4%B8%AA%E4%B8%8D%E8%83%BD/01-same-label-different-inside.webp" alt="Xiaohei opens two HEVC canisters and finds an extra tab inside one of them" width="1664" height="936" loading="lazy" decoding="async" />
  <figcaption>Figure 1. Identical HEVC labels can hide different container structures.</figcaption>
</figure>

## A matching codec is only the starting point

Call the failing file A and the working file B. The original URLs, filenames, business details, and video frames are omitted here.

| Property              | Video A                        | Video B             |
| --------------------- | ------------------------------ | ------------------- |
| Container             | MP4                            | MP4                 |
| Video codec           | HEVC Main, `hvc1`              | HEVC Main, `hvc1`   |
| Audio codec           | AAC-LC                         | AAC-LC              |
| Additional data track | `mebx`, named `timed_metadata` | None                |
| Index location        | End of file                    | Near the beginning  |
| Original page         | Unable to play                 | Loaded successfully |

Resolution, bitrate, and file size also differed. A difference is a candidate for investigation, not proof of a cause.

The assistant then decoded both complete files with FFmpeg. Neither produced decoding errors. That established that this FFmpeg build could handle them; it did not establish that a browser with a different parser, decoder, and configuration could do the same.

## Separate downloading, demuxing, and decoding

A working webpage does not guarantee access to its separate video resource. One detail in this investigation was that a HEAD request returned 403 while a ranged GET returned 206 successfully. Some resource signatures are bound to the request method, so a failed HEAD alone does not establish an invalid playback URL.

Successful downloading and command-line decoding do not guarantee browser playback either. Downloading establishes access to the file; demuxing extracts its compressed audio and video samples; decoding reconstructs pictures and sound. The browser's own error message helps narrow the failing stage.

## The browser failed while opening the container

We built a temporary local comparison page that exposed the media element's error state. Using the downloaded files in the same browser reproduced the failure for A, while B loaded normally.

This time the error was explicit:

```text
PipelineStatus::DEMUXER_ERROR_COULD_NOT_OPEN:
FFmpegDemuxer: open context failed
```

The demuxer reads the container's tracks, timing, and sample locations before passing compressed audio and video to decoders. The error narrowed the investigation to opening and parsing the file. General HEVC support was no longer an adequate explanation for the evidence.

<figure>
  <img src="/uploads/2026/09/16/%E5%90%8C%E6%A0%B7%E6%98%AFH265%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%80%E4%B8%AA%E8%A7%86%E9%A2%91%E8%83%BD%E6%92%AD%E5%8F%A6%E4%B8%80%E4%B8%AA%E4%B8%8D%E8%83%BD/02-container-opening-blocked.webp" alt="Xiaohei tries to open a media case whose lid is caught by a mebx clip" width="1664" height="936" loading="lazy" decoding="async" />
  <figcaption>Figure 2. The failure occurs while opening the container, before normal playback begins.</figcaption>
</figure>

## A successful remux needed a narrower test

The assistant first remuxed A with `-c copy`, keeping its video and audio tracks and moving the index to the beginning. The browser could then read its dimensions and duration and reported a playable state.

That was useful, but it changed several variables: the additional track disappeared, container information was rewritten, and the index moved. It showed that remuxing helped without identifying which change mattered.

We ran two more comparisons:

| Experiment                              | Change                                               | Result                                 |
| --------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| Remux with the index still at the end   | Keep audio and video; rewrite the container          | Loaded successfully                    |
| Ignore only the original metadata track | Preserve media data, file length, and index location | Playback advanced beyond seven seconds |

The second test was decisive. In a test copy, the metadata track's outer `trak` marker was changed to a skippable `free` box. No media was re-encoded or moved.

This isolated the failure to the interaction between that particular `mebx` track and the browser's parser. We did not trace the exact offending field through parser source code, so the result does not mean that every file containing `mebx` is incompatible.

<figure>
  <img src="/uploads/2026/09/16/%E5%90%8C%E6%A0%B7%E6%98%AFH265%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%80%E4%B8%AA%E8%A7%86%E9%A2%91%E8%83%BD%E6%92%AD%E5%8F%A6%E4%B8%80%E4%B8%AA%E4%B8%8D%E8%83%BD/03-one-variable-only.webp" alt="Xiaohei removes only a mebx clip while leaving the two media coils untouched" width="1664" height="936" loading="lazy" decoding="async" />
  <figcaption>Figure 3. Skip only the extra track and preserve the original media data to test one variable.</figcaption>
</figure>

## Where mebx comes from

MP4 can hold tracks beyond pictures and sound. `mebx` is used for boxed metadata samples and can carry additional information that changes over time. Recording or export software may include such a track.

A contained a recording-software marker and a track named `timed_metadata`. Those observations support the inference that the track was added during recording or export. We did not decode its payload and cannot identify a particular sensor or image-processing data format inside it.

For this playback test, ignoring the extra track allowed the existing picture and sound to be read.

## A practical playback copy

For a playback copy that needs one primary video track and one primary audio track, this command remuxes the file:

```bash
ffmpeg -n -i input.mp4 \
  -map 0:v:0 -map '0:a:0?' \
  -c copy -movflags +faststart output.mp4
```

The `-map` options select the first video track and an optional first audio track. `-c copy` copies compressed media without recompressing the picture or sound. `+faststart` moves the index to the beginning for progressive web loading; index placement was not the confirmed cause here.

Keep the original. This command omits unselected tracks, so files requiring alternate audio, subtitles, or specialized metadata need a different mapping. Check playback, seeking, and synchronization in the target browser before using the output.

## Ask AI to test its explanation

The most useful challenge was a second video that played despite using the same codec. That counterexample turned general HEVC compatibility into a hypothesis requiring further investigation, which led to track comparisons and a controlled test.

I want the assistant to distinguish observed facts from hypotheses and identify the next change that would test its explanation. A successful remux establishes that a combination of changes helped; successful playback after skipping one track narrows the cause further. The exact failing field inside that track remains unconfirmed.

Public reporting needs the same boundaries. Original resource URLs, business identifiers, location information, video files, and page screenshots are omitted from this article. A repaired copy is not automatically sanitized: remuxing may preserve some file metadata.

<figure>
  <img src="/uploads/2026/09/16/%E5%90%8C%E6%A0%B7%E6%98%AFH265%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%80%E4%B8%AA%E8%A7%86%E9%A2%91%E8%83%BD%E6%92%AD%E5%8F%A6%E4%B8%80%E4%B8%AA%E4%B8%8D%E8%83%BD/04-human-clue-ai-experiment.webp" alt="A person offers a counterexample while Xiaohei operates an experiment crank to verify the result" width="1664" height="936" loading="lazy" decoding="async" />
  <figcaption>Figure 4. A person supplies the counterexample, AI runs the experiment, and the result tests the explanation.</figcaption>
</figure>

The AI assistant's practical ability deserves credit. It connected file inspection, browser checks, controlled experiments, and remuxing without re-encoding, and revised its initial assessment when a counterexample appeared. A person supplies a crucial clue, the AI follows the evidence through the tools, and the result is a reproducible explanation and a smaller remedy than simply trying another codec.
