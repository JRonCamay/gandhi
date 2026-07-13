# QuietChat Memory Checkpoint - 2026-07-13

## Current State

We reached a good stopping point. User confirmed QuietChat Lite v0.3.19 scrollbar behavior is perfect/natural, then requested v0.3.20 so latest assistant replies jump into view. v0.3.20 was published and should be the current version.

## User Mood / Next Mode

User said: "We take a breather buddy... Im in the mood for some brainstorming."

The next interaction should be low-pressure brainstorming, not another grind unless the user asks.

## Important Product Decisions

- QuietChat Lite is now substantially better for the user than the original ChatGPT chat UI because it has:
  - compact overlay
  - pins
  - pin-first search
  - sticky search legend
  - custom switch scrollbar
  - latest reply jump-to-bottom behavior
- Native scrollbar sizing was abandoned because browser auto-sizing fights the desired UX.
- Custom fake scrollbar is the keeper:
  - long visible thumb
  - no snap-back
  - switch-style top/bottom activation
  - edge hold repeats until mouseup
  - smooth Y-axis scrolling inside current window first
  - 10-message window shifts only at true top/bottom
- Future idea captured:
  - Shift/Ctrl-hold speed boost
  - acceleration: hold longer = faster scrolling

## Published GitHub Versions

Repository: JRonCamay/gandhi

### QuietChat_lite.user.js

- v0.3.12: larger virtual thumb, sticky legend, backend search ordering support
- v0.3.13: fake scrollbar rail/thumb introduced
- v0.3.14: long thumb and edge-hold auto-repeat
- v0.3.15: switch model; dragging no longer maps directly to history
- v0.3.16: removed snap-back; thumb stays where released
- v0.3.17: fixed edge activation by checking thumb bounds against rail
- v0.3.18: smoother motion; pixel-scroll within visible pane before shifting window, fixed last-line cutoff
- v0.3.19: speed tuned to 58px every 140ms; user confirmed perfect
- v0.3.20: newest assistant reply arrival jumps to latest view

Latest known v0.3.20 commit:
- tools/QuietChat_lite.user.js
- commit: 8b79c089dc6385b9f07683cd58355394d65ee82d
- content sha: 69780c3dc88b55951c967c3212dc11e494826664

### writer_inbox_8766.py

Backend search ordering was updated:
- pin hits are collected separately and returned before ordinary hits
- ordinary user/assistant/summary matches follow pin results
- commit: 9718c410bf664c938acd6810d1a33e3130b87353
- content sha: 87f264aebe7698cf5e32fc41f915a31847aac297

Backend restart was required for search ordering, but not for later UI-only versions.

## Current Working Behavior To Preserve

- Pin edits must not force scroll jumps.
- Sending a new message still jumps to newest.
- Newly arrived assistant replies should jump to newest and bottom-scroll.
- Search results should show pins first, then normal search.
- Search legend should stay visible at top while scrolling result list.
- Fake scrollbar:
  - thumb about 95% rail height
  - no bounce-back/snap-back
  - no direct history movement while dragging middle
  - top/bottom edge while mouse-down acts as switch
  - repeat speed: 58px per 140ms
  - current pane scrolls by Y pixels before window shifts

## Brainstorming Context

User is pleased and wants to take a breather. Good topics to brainstorm:
- next QuietChat ergonomics, but lightly
- workflow around pins/search/memory
- possible "speed boost" modifier later
- possible memory/pin taxonomy
- making QuietChat feel like an operating layer over ChatGPT rather than a patch
