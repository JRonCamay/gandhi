# Brenda Current Tasks

Current objective:
Fix Convo input visibility. The message box was still below the visible panel.

Status:
Implemented in repo.

Completed:
1. Added ChadTheGreat/chadConvoLayoutFix.js.
2. Loaded it after chadChat.js in manifest.json.
3. The fix uses actual Chad panel geometry.
4. It calculates body height from panel height minus header height.
5. It keeps Convo body overflow hidden.
6. It keeps the inner column at full body height.
7. It reapplies on mutation, resize, and interval.

Files edited:
- ChadTheGreat/chadConvoLayoutFix.js
- ChadTheGreat/manifest.json
- AGENT_TASKS/Brenda_currentTasks.md

Current stopping point:
Ready for Manuel/Codex sync and browser reload test.
