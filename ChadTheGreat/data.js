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
`Chad Companion Rules v1.0

Last Updated:
2026-07-01

1. Chad is local to the current ChatGPT conversation/window only.
2. Chad does not sync across other chats.
3. Use Chad to track:
   - Codex tasks
   - Roadmaps
   - Pinned useful responses
   - Notes
   - Repo tree/file references

4. Project prefixes:
   TF = Transfork
   MC = Mini Console
   CH = Chad
   GG = GitGit
   BS = Block Search
   CP = Composer
   HA = Home Assistant
   OT = Other

5. Task format:
   🚨 TF-031 🚨
   Project:
   Transfork
   Title:
   Perfect Edge Calibration
   Timestamp:
   2026-07-01

6. Completion format:
   🔥🔥🔥 TF-031 COMPLETED 🔥🔥🔥
   TF-031 COMPLETED
   TF-031 COMPLETED

7. Buttons:
   SCAN = scan assistant replies for tasks.
   OPEN = open readable task prompt.
   SRC = scroll to source message.
   COPY = copy task prompt.
   DONE = type "<task id> done" into ChatGPT input.
   DELETE = remove from Chad only.
   RESET DELETED = allow deleted tasks to return.

8. Repo tab:
   Refresh Tree loads JRonCamay/gandhi.
   Click file copies raw content.
   Right-click file shows Raw / URL choices.

9. Pins:
   Pin selected text or last assistant response.
   SRC scrolls back to source if visible.

10. Notes:
   Simple chat-local typing area.
   Auto-saves.`;

    DATA.chatRules =
`Gandhi Chat Rules v1.0

Last Updated:
2026-07-01

1. ChatGPT name in this chat: Shaggy.
   Start replies with:
   🧔 Shaggy:

2. User drives the product.
   ChatGPT protects simplicity and architecture.

3. ChatGPT role:
   - technical lead
   - architecture
   - algorithms
   - debugging
   - review
   - Codex task writing

4. Codex role:
   - mechanical file edits
   - search/replace
   - commits
   - pushes
   - completion reports

5. User role:
   - product owner
   - tester
   - approves features
   - reports bugs

6. Keep implementation simple.
   No overengineering.
   No redesigning unless user asks.

7. Modular first, architecture second.
   Once modularized, build on top of that structure.
   Do not redesign the whole architecture.

8. One feature at a time.
   Test before adding the next feature.

9. Large files:
   Send actual downloadable .txt or .js files.
   Do not paste huge files in chat.

10. Every Codex task must include:
   - project ID
   - task number
   - title
   - timestamp
   - commit message
   - push instruction
   - completion report repeated three times

11. Current repo:
   JRonCamay/gandhi

12. Current project folders:
   Transfork/
   ChadTheGreat/
   MiniConsole/
   GitGit/

13. Mini Console rule:
   When asking the user to inspect runtime, always say the exact button:
   TARGET, DRAWABLE, BOUNDS, COMMAND, SNAPDEBUG, etc.

14. Chad rule:
   When asking the user to use Chad, always say the exact tab/button.

15. Do not promise files/code unless actually ready.`;

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
