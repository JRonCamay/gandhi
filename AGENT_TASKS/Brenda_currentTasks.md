# Brenda Current Tasks

Objective:
Move Convo under the main ui.js renderer, add more sample messages, fix Convo scrollbar visibility, fix Convo input focus jumping to ChatGPT main input, and prepare Manuel prompt after verification.

Status:
Blocked before source edit.

Reason:
PATCH_PROTOCOL_V1 requires safe split, exact target replacement, reassembly, and verification for large files. ui.js is a large source file and the connector can read slices, but I cannot safely reassemble and replace the whole file without risking unrelated changes.

Decision:
Do not patch ui.js blindly. The best safe route is to hand Manuel/Codex an exact surgical patch prompt for local file editing, then verify after sync.

Required implementation:
1. ui.js owns Convo tab inside renderHeader tabs array.
2. ui.js owns Convo body selection inside render().
3. chadChat.js only exports render/add/send helpers and must not inject tabs or replace body.
4. chadConvoLayoutFix.js should be removed from manifest after native render owns layout.
5. Convo layout must keep input row visible and message area scrollable.
6. Convo input focus must not jump to ChatGPT main input except when SEND is clicked.

Current stopping point:
Prepare Manuel prompt instead of unsafe connector edit.
