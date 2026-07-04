# Brenda Current Tasks

Objective:
Put all Chad/Chaties tabs under one renderer only so tab panels display properly.

Status:
Completed repository patch and verification.

Files edited:
- ChadTheGreat/uiSingleRenderer.js
- ChadTheGreat/manifest.json

Implementation:
- Added uiSingleRenderer.js as the single active coordinator for extra tab integration.
- uiSingleRenderer injects/owns the Convo tab integration through one patched ui.render coordinator.
- uiSingleRenderer disables competing chadChat and chadConvoLayoutFix panel render activity through runtimeSwitchboard.
- chadChat remains loaded only as a render/helper provider for Convo body.
- Removed chadConvoLayoutFix.js from manifest load list.
- Added additional Convo sample messages for scrollbar testing.
- Added panel focus guard to prevent panel inputs from bubbling into ChatGPT main input behavior.

Verification:
- Fetched uiSingleRenderer.js after create.
- Fetched manifest.json after update.
- manifest version is now 0.2.5.
- manifest loads uiSingleRenderer.js and no longer loads chadConvoLayoutFix.js.

Current stopping point:
Ready for Jay to sync/reload extension and browser-test.

Questions:
None.

Timestamp:
2026-07-04 Asia/Manila
