# Brenda Current Tasks

Objective:
Move Convo under the main ui.js renderer, add more sample messages, fix Convo scrollbar visibility, fix Convo input focus jumping to ChatGPT main input, and prepare Manuel prompt after verification.

Constraints:
- Main ui.js renderer must own Convo tab/body.
- No second renderer fighting ui.js.
- Chaties remains agents/profile only.
- Use PATCH_PROTOCOL_V1 for large existing source edits.
- Keep scope to Convo rendering and related focus/layout behavior.

Files involved:
- ChadTheGreat/ui.js
- ChadTheGreat/chadChat.js
- ChadTheGreat/manifest.json
- AGENT_TASKS/Brenda_currentTasks.md
- AGENT_DESK/BRENDA temporary patch split files

Pending subtasks:
1. Split target files before editing.
2. Save split files under AGENT_DESK/BRENDA.
3. Patch ui.js to own Convo tab and body selection.
4. Patch chadChat.js so it exports render only and does not inject/replace tabs.
5. Remove layout patch module from manifest if native render makes it unnecessary.
6. Verify and prepare Manuel prompt.

Stopping point:
Task file updated. Next is patch split/save.
