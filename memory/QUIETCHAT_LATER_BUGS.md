# QuietChat Later Bugs

Updated: 2026-07-13 20:02 Asia/Manila

## Pin Edit Context Stolen By New Assistant Reply

User report:
- User was typing a pin name for a selected message.
- While typing, a new assistant message popped up / latest reply jump occurred.
- The pin action got captured by the latest assistant message instead of the originally selected message.
- Result: the assistant's latest message was pinned, not the intended selected message.

Likely cause:
- v0.3.20 added jump-to-newest on assistant reply arrival.
- A render/jump can replace DOM rows while prompt() or pin-edit flow is active.
- The pin save may be using the active/re-rendered row/button context instead of a frozen message id + side captured at pin-edit start.

Later fix direction:
- When opening pin prompt/edit, freeze msgId and side in local variables and never derive them again from DOM after prompt returns.
- Suppress newest auto-jump/render while a pin prompt/edit is active, or queue the jump until after pin save/cancel.
- Add a small "pinEditActive" guard around load() auto-jump behavior.
- Consider replacing browser prompt() with an in-overlay pin editor so focus/context is controlled.
