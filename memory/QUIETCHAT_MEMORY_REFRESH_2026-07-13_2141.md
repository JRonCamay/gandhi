# QuietChat Memory Checkpoint Refresh - 2026-07-13 21:41

## Confirmed Saved Earlier Today

Earlier checkpoint was saved:
- Raw recent QuietChat export: PROJECT_MEMORY_2026-07-13.md
- Compact checkpoint: QUIETCHAT_MEMORY_CHECKPOINT_2026-07-13.md
- GitHub checkpoint: JRonCamay/gandhi/memory/QUIETCHAT_MEMORY_CHECKPOINT_2026-07-13.md

## Latest Current State

QuietChat Lite current known version:
- v0.3.20
- Commit: 8b79c089dc6385b9f07683cd58355394d65ee82d
- Behavior: newest assistant reply arrival jumps to latest view and bottom-scrolls.

User confirmed:
- v0.3.19/v0.3.20 scrollbar behavior feels perfect/natural.
- Switch scrollbar design is keeper.
- Next implementation should not happen immediately, but is priority when resumed.

## Next Priority

Tiny Main Chat Footprint:
- Replace "Use quietchat_process_message for QC-..." with tiny trigger like "@mcp checkmessage".
- Let daemon/MCP resolve latest pending msgId internally.
- Replace "Replied QC-..." with a check icon "✓" or "✔".
- Goal: main ChatGPT page becomes only a wake-up wire; QuietChat is the real interface.

## Later Bugs Logged

1. Pin edit context stolen by newest assistant reply:
- When user clicked Pin and typed pin name, new assistant reply/re-render stole context.
- Simple fix: freeze msgId + side when Pin clicked; never re-read target from DOM after prompt/Enter returns.

2. Pinning reorders message to bottom:
- Pinning writes message file and changes mtime.
- Backend display order may sort by file mtime.
- Future fix: sort timeline by created_at or message_id sequence, not mtime.

## Brainstormed Architecture

### Tool / Pause / Streaming Ideas

- Tool-boundary blips:
  - tool response can include pending QuietChat message metadata.
  - assistant sees message at natural tool boundary.

- Preflight blip gate:
  - before side-effect tool executes, daemon checks for urgent blip.
  - if blip exists, tool returns early without side effects.
  - assistant handles message, then retries or changes action.

- Piggyback mode:
  - user message can ride on next tool call.
  - if it does not require stopping, assistant can send a quick reply via daemon/tool parameter while work continues.

- Pause mode:
  - if message affects task, assistant calls daemon.pauseMessage(messageToUser).
  - daemon records pauseId, current task, pending tool/action.
  - QuietChat becomes normal chat mode.
  - user replies through normal QC triggers.
  - resume command/button restores context.

- Notification/resume:
  - daemon cannot magically wake assistant outside a turn.
  - use next-tool blip if assistant active.
  - use normal QC trigger if assistant stopped.
  - store resume queue so answers are durable.

### Ephemeral HUD / Progress

User wants no main-chat progress narration because it lags the page.
Design:
- Main chat stays quiet/minimal.
- QuietChat HUD shows ephemeral status, not logged by default.
- Status can be casual/blunt "visible workshop muttering":
  - checking if this breaks
  - firing up segmentflow
  - publishing
  - tool running
  - stuck here
- Include tool badge:
  - GitHub, File, Daemon, Search, Memory, SegmentFlow
- Small emoji-sized animation:
  - typing hands, coffee steam, terminal pulse
- Progress:
  - tiny progress bar or checklist
- Hang detector:
  - last activity time
  - last tool/action
  - assistant may be stuck warning

### Daemon-Driven Adaptive Polling

Daemon should control QuietChat UI polling:
- qc.view returns uiHint:
  - pollMs
  - reason
  - latestChanged
- Fast polling while assistant running/fresh reply.
- Slow polling when idle.
- UI obeys daemon hints instead of guessing.

### Performance Mode

User installed a Chrome extension that clips DOM and reduces lag somewhat.
Brainstormed QuietChat Performance Mode:
- Hide main ChatGPT transcript container.
- Keep composer/send box.
- Keep QuietChat overlay.
- Do not delete DOM at first; use safer CSS hiding/content-visibility/contain.
- Add toggle button and easy restore.
- Main ChatGPT becomes input engine; QuietChat becomes display/control layer.

## User Current Intention

User asked to make sure memory is logged for today/yesterday/earlier.
User is brainstorming, not asking to implement immediately unless they say "go".
