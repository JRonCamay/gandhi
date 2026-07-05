# Brenda Current Tasks

Objective:
Split ChadTheGreat/ui.js into maintainable tab modules while keeping one native renderer/dispatcher in ui.js.

Status:
Completed repository patch and verification.

Files edited / created:
- ChadTheGreat/ui.js
- ChadTheGreat/uiConvo.js
- ChadTheGreat/uiTasks.js
- ChadTheGreat/uiChaties.js
- ChadTheGreat/uiRoadmap.js
- ChadTheGreat/uiPins.js
- ChadTheGreat/uiRepo.js
- ChadTheGreat/uiNotes.js
- ChadTheGreat/manifest.json

Implementation:
- ui.js now owns the single native tab list and body dispatcher.
- Convo is now a native tab in ui.js, not injected after render.
- Tab bodies were split into dedicated modules.
- manifest.json updated to v0.2.6.
- chadChat.js and uiSingleRenderer.js are no longer loaded.
- Existing unused legacy files remain in repo but are removed from active load flow.

Verification:
- Fetched manifest.json after update.
- Fetched ui.js after update.
- Fetched uiConvo.js after create.
- Fetched uiTasks.js after create.

Current stopping point:
Ready for Manuel to sync local files and for Jay to browser-test.

Questions:
None.

Timestamp:
2026-07-05 Asia/Manila
