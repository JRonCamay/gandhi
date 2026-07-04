=========================================
AI-SAFE ENGINEERING
PATCH PROTOCOL (APP)
Version: 1.0
=========================================

*Strictly must be followed

Purpose

Prevent accidental code regeneration.

Prevent context drift.

Preserve untouched code exactly as it exists.

Reduce hallucinated edits on large source files.

This protocol is mandatory whenever modifying an existing source file.

=========================================
PHASE 1 — PREPARATION
=========================================
* Abort if connections to online repository has an issue or problem. Report to Jay.
1.
Read the target file completely.

2.
Locate the exact insertion point,
replacement region,
or function to modify.

Never begin editing before identifying
the exact boundaries.

=========================================
PHASE 2 — SPLIT
=========================================

Split the file into logical parts.

Typical layout:

Scenario 1:
before
target
after

Example

ui.js

├── before
├── target
└── after

or

before.js
target.js
after.js

Scenario 2:

ui.js

├── part1
├── replace
└── part2
├── replace
└── part3

or

part1
replace
part2
replace
part3


The target should contain ONLY the code
that actually needs modification.

Everything else remains untouched.

=========================================
PHASE 3 — SAVE
=========================================

Save all split parts into GitHub
before editing under [repo]/AGENT_DESK/[name]/

Example

AGENT_DESK/

SHAGGY/

ui.js/

before.js

target.js

after.js

notes.md

These become the working files.

They are the source of truth during editing.

=========================================
PHASE 4 — EDIT
=========================================

Only modify:

target.js

Never regenerate

before.js

Never regenerate

after.js

Those files remain immutable.

If more surrounding context is needed,
read the split files.

Do NOT recreate them from memory.

=========================================
PHASE 5 — CONTEXT MANAGEMENT
=========================================

While editing:

Focus ONLY on

target.js

Ignore unrelated code.

If additional context becomes necessary

Read

before.js

or

after.js

Never regenerate missing context.

Always reload it from GitHub.

=========================================
PHASE 6 — ASSEMBLY
=========================================

Rebuild the final file.

Result

before

+

modified target

+

after

Nothing else changes.

=========================================
PHASE 7 — VERIFICATION
=========================================

Verify:

✓ No unintended modifications

✓ Only requested code changed

✓ Original formatting preserved

✓ No duplicated code

✓ No missing code

✓ No reordered code

✓ New code inserted only at intended location

=========================================
PHASE 8 — COMMIT
=========================================

Commit only after verification succeeds.

=========================================
PHASE 9 — CLEANUP
=========================================

Remove all files under AGENT_DESK/[name]/

*This makes sure no old codes will mix with the next tasks.

=========================================
PATCH RULES
=========================================

NEVER regenerate an entire file
for a localized edit.

NEVER rewrite unrelated functions.

NEVER optimize unrelated code.

NEVER refactor unless explicitly requested.

NEVER modify surrounding logic
outside the target section.

Always preserve untouched code verbatim.

=========================================
LARGE FILE RULE
=========================================

If the file exceeds approximately
300–500 lines,

the Patch Protocol becomes mandatory.

=========================================
RECOVERY RULE
=========================================

If editing becomes confusing:

STOP.

Discard current reconstruction.

Reload

before

target

after

Continue from the saved split files.

Never continue from memory.

=========================================
GOAL
=========================================

Minimize cognitive load.

Preserve original code.

Reduce hallucinated edits.

Prevent context drift.

Produce deterministic, reviewable patches.

=========================================
PATCH SOURCE ACQUISITION
=========================================


If the target file cannot be read in one request:

DO NOT abort.

DO NOT switch to default behavior.

Continue reading sequential sections until the complete file has been reconstructed.

Only then:

Split

Save split files

Patch

Reassemble

Verify

Commit

Large File Acquisition Rule:

The inability to read the entire file in one operation
is NOT a valid reason to stop.

Acquire the remaining sections.

Repeat until complete.
=========================================
END OF PATCH PROTOCOL
=========================================