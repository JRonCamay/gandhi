# QuietChat Later Bugs

Updated: 2026-07-13 20:05 Asia/Manila

## Pin Edit Context Stolen By New Assistant Reply

User report:
- User clicked Pin on a selected message and was typing the pin name.
- User pressed Enter around the same moment a new assistant message popped up.
- The latest-reply jump/render happened at the same time.
- The pin was applied to the latest assistant message instead of the originally selected message.

Simplest fix direction:
- When the user clicks Pin, immediately store/freeze the exact target in memory:
  - msgId
  - side ("user" or "assistant")
  - maybe current pin text
- After prompt/Enter returns, save using that frozen target only.
- Do not re-read msgId/side from the DOM after the prompt returns.
- This avoids the pin being stolen if a new assistant reply arrives and re-renders the UI at the same time.

Optional extra guard:
- A small pinEditActive flag can pause newest-reply auto-jump until save/cancel finishes, but the frozen target is the main simple fix.
