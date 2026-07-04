# Brenda Current Tasks

Objective:
Put all Chad/Chaties tabs under one renderer only so tab panels display properly.

Constraints:
- Use JRonCamay/gandhi as source of truth.
- Follow PATCH_PROTOCOL_V1 v1.6.
- Do not create competing tab/body renderers.
- Preserve existing working code unless touched for this task.
- Verify by repository state after writes.

Files being investigated:
- ChadTheGreat/ui.js
- ChadTheGreat/chadChat.js
- ChadTheGreat/chadConvoLayoutFix.js
- ChadTheGreat/manifest or loader file if present

Pending subtasks:
1. Search project files for tab renderers and panel renderers.
2. Identify current owner of tab UI.
3. Patch so one main renderer owns all tab headers and bodies.
4. Remove or disable competing render paths.
5. Verify relevant files after write.

Decisions already made:
- Main renderer should own tabs and bodies.
- Helper files may provide rendering helpers but must not inject competing panels.

Current stopping point:
Investigating repository source.

Questions:
None.

Timestamp:
2026-07-04 Asia/Manila
