Current objective:
Fix Chad UI so all panel tabs render through one renderer and Convo/message input focus no longer jumps to ChatGPT prompt.

Status:
Completed.

Files edited:
- ChadTheGreat/uiChaties.js

Changes completed:
1. Removed uiChaties from replacing the panel body directly.
2. Routed uiChaties refresh calls back through window.Chad.ui.render(), keeping the main UI renderer as the single renderer for tab bodies.
3. Added Chad panel focus guard for input, textarea, select, contenteditable, role=textbox and ProseMirror fields.
4. Verified updated uiChaties.js from repository after write.

Recent engineering decisions:
- Do not patch ui.render from uiChaties anymore.
- Preserve uiChaties public API for compatibility.
- Focus guard is local to #gandhi-chad-panel.

Current stopping point:
Ready for browser test.

Questions:
None.

Timestamp:
2026-07-05