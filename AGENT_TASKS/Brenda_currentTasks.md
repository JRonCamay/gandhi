# Brenda Current Tasks

Current objective:
Create a dedicated Convo tab beside Chaties. Put all conversation UI there. Restore agent profile UI to Chaties. Add input, send, and save Jay messages.

Constraints:
- Chaties = agents and profile features only.
- Convo = messages, input, send only.
- Do not redesign unrelated systems.
- Use existing runtime switchboard style.

Files being edited:
- AGENT_TASKS/Brenda_currentTasks.md
- ChadTheGreat/manifest.json
- ChadTheGreat/chadChat.js or safer new Convo module
- Remove previous wrong Chaties convo loader if needed.

Pending subtasks:
1. Inspect current files.
2. Remove wrong Chaties convo display.
3. Add Convo tab label.
4. Add input and send under Convo.
5. Save Jay messages.
6. Verify.

Decisions:
Previous Chaties convo injection was wrong. Convo tab owns conversation features.

Stopping point:
Task ledger updated before code work.
