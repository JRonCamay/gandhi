# Brenda Current Tasks

Objective:
Put all Chad tabs under one function only. Convo must be defined inside the same renderer/tab function as the other tabs, not injected after render.

Constraints:
- Do not add another render patch layer.
- Use JRonCamay/gandhi as source of truth.
- Follow PATCH_PROTOCOL_V1, ARTP, and CSP.
- Preserve existing working behavior unless directly required.
- Verify repository state after writes.

Files involved:
- ChadTheGreat/ui.js
- ChadTheGreat/chadChat.js
- ChadTheGreat/manifest.json
- ChadTheGreat/uiSingleRenderer.js

Pending subtasks:
1. Move Convo tab into ui.js renderHeader tabs array.
2. Move Convo body selection into ui.js render function.
3. Keep chadChat.js as helper renderer only.
4. Stop loading uiSingleRenderer.js.
5. Verify by fetching modified files.

Decision:
The previous uiSingleRenderer wrapper is not acceptable because Convo still disappears after native ui.render rebuilds the tab row. The correct fix is native ownership inside ui.js.

Current stopping point:
Fetching source and preparing native ui.js patch.

Questions:
None.

Timestamp:
2026-07-04 Asia/Manila
