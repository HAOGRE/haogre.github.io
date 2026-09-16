---
author: "HAOGRE"
pubDatetime: 2026-09-16T12:07:25.942Z
title: "Same HEVC Codec, Different Playback Results"
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

## The browser failed while opening the container

We built a temporary local comparison page that exposed the media element's error state. Using the downloaded files in the same browser reproduced the failure for A, while B loaded normally.

This time the error was explicit:

```text
PipelineStatus::DEMUXER_ERROR_COULD_NOT_OPEN:
FFmpegDemuxer: open context failed
```

The demuxer reads the container's tracks, timing, and sample locations before passing compressed audio and video to decoders. The error narrowed the investigation to opening and parsing the file. General HEVC support was no longer an adequate explanation for the evidence.

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

What impressed me about the AI assistant was its ability to carry out file inspection, browser checks, controlled experiments, and remuxing in one continuous investigation. I supplied the counterexample that challenged its first hypothesis, and it followed the evidence further. We ended up with a testable cause and a smaller remedy than simply trying another codec.
