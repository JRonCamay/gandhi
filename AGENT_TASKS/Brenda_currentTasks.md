# Brenda Current Tasks

Objective:
Implement TransforkNew UI test: pressing R shows the new UI bounding box/buttons on the selected sprite. No transform operations yet.

Status:
Completed local implementation. Ready for Jay to push/test.

Files edited / created:
- TransforkNew/Transfork_Loader.js
- TransforkNew/SYSTEM/MAR.js
- TransforkNew/SYSTEM/VM/getCanvas.js
- TransforkNew/INPUT/SHORTCUTS/registerR.js
- TransforkNew/UI/ELEMENTS/BOUNDINGBOX/draw.js
- TransforkNew/UI/ELEMENTS/BOUNDINGBOX/hide.js
- TransforkNew/UI/ELEMENTS/BOUNDINGBOX/refresh.js
- TransforkNew/UI/ELEMENTS/BUTTONS/*/draw.js
- TransforkNew/UI/ELEMENTS/BUTTONS/*/click.js
- TransforkNew/DECLARATION_RECORD.md
- TransforkNew/OMNI_GUARDIAN.md

Implementation:
- Added TransforkNewMAR and loaded it first.
- R shortcut now registers with MAR.
- Pressing R toggles the UI overlay for selected sprite.
- Refresh reads selected target, drawable AABB, renderer canvas, and converts Scratch bounds to screen rect.
- Added UI-only button look for move/rotate/scale/flip/reset/alpha/width/height.
- One-click buttons only suppress events for now; no transform operations.

Verification:
- Confirmed loader contains SYSTEM/MAR.js and cache 260707-r-ui-test.
- Confirmed status shows intended TransforkNew changes.
- Browser test still required inside Cocrea/Gandhi.

Current stopping point:
Jay should push/local test. Test: hard refresh, select sprite, press R. Box/buttons should appear; press R again hides.

Questions:
None.

Timestamp:
2026-07-07 Asia/Manila
