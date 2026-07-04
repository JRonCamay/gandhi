# Brenda Current Tasks

Current objective:
Fix the Convo area using Jay's layout system.

Required layout:
Parent Column layout
> Fixed sized Column layout
> fixed row layout
> message area
> scrollbar
> row layout
> input field
> send

Constraints:
- Convo owns messages, input, send.
- Chaties owns agents/profile features only.
- Message area must scroll by itself.
- Input row must stay visible.
- No viewport-height magic that pushes input out.
- Keep fix scoped to Convo layout.

Files being edited:
- AGENT_TASKS/Brenda_currentTasks.md
- ChadTheGreat/chadChat.js

Pending subtasks:
1. Read current chadChat.js relevant layout.
2. Replace Convo body layout with nested parent column / fixed message column / input row.
3. Verify textarea and SEND remain visible.
4. Update task file.

Stopping point:
Task ledger updated before layout fix.
