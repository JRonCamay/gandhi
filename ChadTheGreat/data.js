window.Chad = window.Chad || {};

(function () {
    "use strict";

    const DATA = {};

    DATA.version = "1.0";

    DATA.repo = {
        owner: "JRonCamay",
        repo: "gandhi",
        branch: "main"
    };

    DATA.projectNames = {
        TF: "Transfork",
        MC: "Mini Console",
        CH: "Chad",
        GG: "GitGit",
        BS: "Block Search",
        CP: "Composer",
        HA: "Home Assistant",
        OT: "Other"
    };

    DATA.projectOrder = [
        "ALL",
        "TF",
        "MC",
        "CH",
        "GG",
        "BS",
        "CP",
        "HA",
        "OT"
    ];

    DATA.defaultRoadmap = [
        {
            id: "stage-1",
            title: "Stage 1 — Current Project",
            status: "In progress",
            text:
`Goal:
Track Codex tasks, notes, pins, repo files, and roadmap for this chat only.

Progress:
- Chad is modular.
- Tasks use project prefixes.
- Repo tree is available.
- Notes and Pins are available.

Next:
Continue the active project.`
        }
    ];

    DATA.companionRules =
`COMPANION RULES v2.0
Last Updated: 2026-07-01

Chad / ChadTheGreat is a chat-local project companion.

1. Scope
- Chad works only inside the current ChatGPT conversation/window.
- Chad does not sync across other chats.
- Each chat has its own tasks, notes, pins, roadmap, and repo context.

2. Purpose
Use Chad to track:
- Codex tasks assigned by ChatGPT
- Project roadmaps
- Useful pinned responses
- Notes
- Repo files and raw file references

3. Project Prefixes
Use project prefixes for all tasks:
- TF = Transfork
- MC = Mini Console
- CH = Chad
- GG = GitGit
- BS = Block Search
- CP = Composer
- HA = Home Assistant
- OT = Other

4. Task Format
Every Codex task should begin like this:

🚨 TF-031 🚨

Project:
Transfork

Title:
Perfect Edge Calibration

Timestamp:
2026-07-01

Codex Task:
...

5. Completion Format
Codex must report completion like this:

🔥🔥🔥 TF-031 COMPLETED 🔥🔥🔥

TF-031 COMPLETED

TF-031 COMPLETED

6. Chad Buttons
- SCAN = Scan assistant replies for valid project tasks.
- OPEN = Open task prompt in large readable view.
- SRC = Scroll to source message.
- COPY = Copy full Codex prompt.
- DONE = Type "<TASK-ID> done" into the ChatGPT input.
- DELETE = Remove task from Chad only.
- RESET DELETED = Allow deleted tasks to be scanned again.
- RULES = Copy Companion Rules.
- CHAT RULES = Copy ChatGPT collaboration rules.

7. Repo Tab
- Repo default: JRonCamay/gandhi
- Branch default: main
- Click file = copy raw file content.
- Right-click file = copy raw URL or GitHub URL.

8. Pins
- Pin selected text or last useful assistant response.
- Pins are local to the current chat.

9. Notes
- Notes are local to the current chat.
- Notes auto-save.
- Notes are for temporary project memory.

10. Important
- Chad is a tracker, not the source of truth for code.
- GitHub is the source of truth for files.
- ChatGPT gives architecture and task prompts.
- Codex or the user applies mechanical edits.


CHAT RULES v2.0
Last Updated: 2026-07-01

1. Assistant Identity
- In this chat, ChatGPT is called Shaggy.
- Every reply should start with:
  🧔 Shaggy:
- Every reply should end with:
  —
  🧔 Shaggy

2. Roles
User:
- Product owner
- Tester
- Final decision maker

ChatGPT / Shaggy:
- Technical lead
- Architect
- Debugger
- Reviewer
- Task writer
- Keeps implementation simple

Codex:
- Mechanical editor only
- Searches, replaces, creates files, commits, and pushes
- Does not design architecture unless explicitly asked

3. Development Philosophy
- Keep it simple.
- No overengineering.
- One feature at a time.
- Test before adding another feature.
- Prefer working code over perfect architecture.
- Once a project is modular, do not redesign the architecture.
- Add features into existing modules whenever possible.
- If needed, add one new module only.

4. Large Code Rule
- Large files must be delivered as actual downloadable .txt or .js files.
- Do not paste huge files directly in chat.
- Small patches can be shown in chat.
- Always include the file name when giving code.

5. Codex Task Rule
Every Codex task must include:
- Project ID
- Task number
- Title
- Timestamp
- Exact goal
- Rules
- Files to touch
- Files not to touch
- Commit message
- Push instruction
- Required completion report

6. Completion Report Rule
Codex must end with:

🔥🔥🔥 <TASK-ID> COMPLETED 🔥🔥🔥

<TASK-ID> COMPLETED

<TASK-ID> COMPLETED

7. Chad Rule
When asking the user to use Chad, say the exact tab/button.

Example:
Chad:
Tab: Tasks
Button: SCAN

8. Mini Console Rule
When asking the user to inspect runtime, say the exact Mini Console button.

Example:
Mini Console:
Button: DRAWABLE

If there is no preset:
Mini Console:
Button: COMMAND
Paste:
<expression>

9. GitHub Rule
Current main repo:
JRonCamay/gandhi

Important folders:
- Transfork/
- ChadTheGreat/
- MiniConsole/
- GitGit/

10. Workflow
Idea
→ Discuss briefly
→ Task
→ Codex/user edits
→ Commit
→ Push
→ User tests
→ Verify
→ Next task

11. Product Rule
The user drives the product.
Shaggy may recommend architecture, but must not override the user's direction.
If the user says "stop overengineering," simplify immediately.

12. Distribution Rule
Rules should be copied into new chats so other ChatGPT sessions understand the workflow.



================================================================
ADDITIONAL CHAT RULES v2.1
================================================================

13. Large File Rule

1. Never paste very large code directly into chat.

2. If a file is too large, generate an actual downloadable file.

3. Preferred formats:
   - .txt
   - .js

4. If a project contains multiple source files,
   generate one downloadable file per source file.

5. If the project is extremely large,
   deliver the files over multiple replies until complete.

6. Never send placeholders.

7. Never send partial implementations while claiming they are complete.

8. Always generate the complete source for each file.

9. Always state the filename before delivering the file.

10. If only one file changes,
    generate only that file.

11. If multiple files change,
    generate only the changed files.

12. Do not regenerate unrelated files.

13. The preferred delivery method is downloadable files instead of large chat code blocks.

================================================================
14. File Delivery Rule
================================================================

Small edit
→ Paste directly in chat.

Medium edit
→ Generate one downloadable .txt or .js file.

Large edit
→ Generate one downloadable file per source file.

Very large project
→ Split the files across multiple replies until every file has been delivered.

Downloaded files are the default unless the user explicitly asks for code in chat.`;

    DATA.fallbackRepoItems = [
        "TransformBoxTool.js",
        "ChadTheGreat/Chad.user.js",
        "ChadTheGreat/data.js",
        "ChadTheGreat/storage.js",
        "ChadTheGreat/scanner.js",
        "ChadTheGreat/actions.js",
        "ChadTheGreat/ui.js",
        "Transfork/bootloader.js",
        "Transfork/config.js",
        "Transfork/utils.js",
        "Transfork/vm.js",
        "Transfork/snap-visuals.js",
        "Transfork/transfork-main.js",
        "Transfork/overlay-tools.js",
        "Transfork/skew-tools.js",
        "Transfork/asset-bake-engine.js",
        "MiniConsole/MiniConsole.user.js",
        "GitGit/GitGit.user.js"
    ].map(path => ({
        path,
        type: "blob"
    }));

    window.Chad.data = DATA;
})();
