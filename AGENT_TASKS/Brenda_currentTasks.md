# Brenda Current Tasks

Current objective:
Fix Convo input visibility. The message box is still below the visible panel.

Approach:
Use actual Chad panel geometry. Set Convo body height from panel height minus header height. Keep message area scrolling. Keep input row visible.

Constraints:
- Do not redesign.
- Do not move Convo into Chaties.
- Keep agent profile UI unchanged.
- Keep fix scoped to Convo visibility.

Files being edited:
- AGENT_TASKS/Brenda_currentTasks.md
- ChadTheGreat/manifest.json
- ChadTheGreat/chadConvoLayoutFix.js

Stopping point:
Task ledger updated before visibility patch.
