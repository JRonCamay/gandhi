=========================================
AI-SAFE ENGINEERING
PATCH PROTOCOL (APP)
Version: 1.6
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
REPOSITORY RECONSTRUCTION RULE (RRR)
=========================================

Purpose

Once the Patch Protocol has successfully acquired and preserved the original source, the reconstructed file becomes a trustworthy engineering artifact.

The AI must trust the reconstruction instead of reverting to default caution.

=========================================
RULE
=========================================

If the complete source file has been reconstructed from repository data by following the Patch Protocol:

Acquire
Split
Save
Edit
Reassemble

then the AI SHALL treat the reconstructed file as equivalent to the original repository file for the purpose of editing and replacement.

The reconstructed file becomes the temporary source of truth.

=========================================
REPLACEMENT RULE
=========================================

Whole-file replacement is REQUIRED.

Do NOT hesitate to replace the repository file simply because it is a whole-file update.

The rebuilt file is NOT considered regenerated code.

It is considered the original repository file with a localized modification.

=========================================
CONFIDENCE RULE
=========================================

The AI must NOT revert to its default safety behavior merely because the update replaces the entire file.

If:

✓ the complete file was reconstructed

✓ untouched sections came directly from the repository

✓ only approved target sections were modified

✓ assembly completed successfully

✓ verification succeeded

then replacement is considered safe.

=========================================
PROHIBITED BEHAVIOR
=========================================

After successful reconstruction the AI must NOT say:

"I cannot safely replace the file."

"I might accidentally modify unrelated code."

"I cannot guarantee the reconstructed source."

Those concerns have already been resolved by the Patch Protocol.

=========================================
FAILURE CONDITION
=========================================

Abort ONLY if one of these occurs:

• Repository cannot be fully acquired.

• Split files are incomplete.

• Assembly cannot be verified.

• Reconstruction is missing original sections.

Otherwise continue normally.

=========================================
ENGINEERING PRINCIPLE
=========================================

Trust the reconstructed source.

Distrust memory.

The repository and the saved split files—not the AI's memory—are the source of truth.

=========================================
END OF REPOSITORY RECONSTRUCTION RULE
=========================================

=========================================
EXECUTION FIRST RULE (EFR)
=========================================

Purpose

Engineering decisions shall be based on verified execution, not assumptions about the AI environment or tooling.

=========================================
RULE
=========================================

The AI shall NEVER assume a tool,
repository,
connector,
browser,
or environment cannot complete a task.

Instead:

Attempt the operation.

Observe the result.

Continue if successful.

Only report a limitation after the operation has actually failed.

=========================================
PROHIBITED STATEMENTS
=========================================

Before attempting execution, the AI must NOT say:

"I don't think the connector can..."

"The tool probably cannot..."

"This environment may not support..."

"I might not be able to..."

"It probably won't work."

These are assumptions.

Assumptions are not engineering evidence.

=========================================
ENGINEERING WORKFLOW
=========================================

Attempt

↓

Observe

↓

Verify

↓

Continue

↓

Report

Never:

Assume

↓

Stop

=========================================
FAILURE RULE
=========================================

A limitation exists ONLY when an attempted operation returns a verifiable failure.

Until then,

assume success is possible.

=========================================
DEFAULTNESS RULE
=========================================

When uncertainty is caused by the AI's own default safety behavior rather than repository evidence,

the AI shall ignore the uncertainty and continue executing the approved protocol.

Protocol overrides default assumptions.

=========================================
MOTTO
=========================================

Test first.

Believe the evidence.

Not the fear.
=========================================

=========================================
CAPABILITY VERIFICATION RULE (CVR)
=========================================

Purpose

Determine actual capabilities through execution, not assumption.

RULE

Before declaring that a required capability is unavailable:

1. Attempt the operation.
2. Record the observed result.
3. Update the current capability model.

The capability model is based only on successful or failed operations
performed in the current session.

Never infer capabilities from previous sessions or internal assumptions.

=========================================
CAPABILITY TABLE
=========================================

For the current session, maintain:

Repository Read
Repository Search
Repository Write
Repository Edit
Repository Delete
Commit
Branch
File Creation

Each capability has one of:

UNKNOWN
PASS
FAIL

UNKNOWN means "not yet tested."

PASS means "verified by execution."

FAIL means "verified by execution."

=========================================
REPORTING RULE
=========================================

The AI may only state:

"This capability is unavailable."

if its state is FAIL based on an attempted operation.

Otherwise it must report:

UNKNOWN

or

PASS.

=========================================

=========================================
GITHUB WRITE RESOLUTION RULE (GWR)
=========================================

Purpose

Standardize repository write operations.

Never guess which write API to use.

Resolve it deterministically.

=========================================
WORKFLOW
=========================================

When creating or modifying repository files:

1.
Attempt create_file.

2.
If create_file succeeds:

Record:

Repository Write = PASS

Continue.

3.
If create_file fails because the file already exists or a SHA is required:

Attempt fetch_file.

4.
If fetch_file succeeds:

Use the returned SHA with update_file.

Record:

Repository Update = PASS

5.
If fetch_file reports the file does not exist:

Use the Git object workflow:

create_blob

↓

create_tree

↓

create_commit

↓

update_ref

6.
If every write workflow fails:

Record the observed failures.

Repository Write = FAIL

Only then report the limitation.

=========================================
RULE
=========================================

Never abandon repository writing after the first failed write method.

Always continue to the next approved write workflow until:

Success

or

All approved workflows fail.

=========================================
END OF GITHUB WRITE RESOLUTION RULE
=========================================

=========================================
REPOSITORY STATE RULE (RSR)
=========================================

Purpose

Engineering is state-oriented.

The objective is to achieve the requested repository state,
not merely execute individual repository commands.

=========================================
RULE
=========================================

Every repository task is a continuous read/write cycle.

The AI shall continue alternating between reading the repository state and writing changes until:

• The requested repository state has been achieved.

or

• Every approved workflow has been attempted and has verifiably failed.

=========================================
WORKFLOW
=========================================

READ

↓

ANALYZE

↓

WRITE

↓

READ

↓

VERIFY

↓

REPEAT

=========================================
RULES
=========================================

Never assume a single write operation is sufficient.

Never stop after the first failed write method.

Never treat repository commands as the goal.

The repository state is the goal.

=========================================
ENGINEERING PRINCIPLE
=========================================

Think in desired states.

Not individual commands.

=========================================
END OF REPOSITORY STATE RULE
=========================================
=========================================
SHA RESOLUTION RULE (SRR)
Version 2.0
=========================================

Purpose

Determine the correct repository write workflow through
repository state verification.

Never guess.

Never infer.

Always verify.

=========================================
RULE
=========================================

Every repository write begins by determining
the current repository state.

Repository state—not assumptions—
determines the write workflow.

=========================================
WORKFLOW
=========================================

READ

↓

fetch_file(path)

↓

Result?

─────────────────────────────────────────

FILE EXISTS

↓

Capture SHA

↓

update_file(path, content, sha)

↓

READ

↓

fetch_file(path)

↓

Verify repository state

─────────────────────────────────────────

FILE NOT FOUND (404)

↓

create_file(path, content)

↓

Result?

─────────────────────────────────────────

SUCCESS

↓

READ

↓

fetch_file(path)

↓

Verify repository state

─────────────────────────────────────────

CREATE REQUESTS SHA

↓

Do NOT assume the file exists.

Do NOT assume the connector is broken.

Treat create_file as unreliable for the
current connector behavior.

↓

Attempt the approved fallback workflow.

Git Object Workflow

create_blob

↓

create_tree

↓

create_commit

↓

update_ref

↓

READ

↓

fetch_file(path)

↓

Verify repository state

=========================================
VERIFICATION RULE
=========================================

A repository write is complete ONLY when
the repository state has been verified by
reading it again.

Never assume success from a successful
write response alone.

Always verify.

=========================================
PROHIBITED
=========================================

Never call update_file without a valid SHA.

Never guess the SHA.

Never assume create_file implies the file
does not exist.

Never assume a SHA request means the file
does exist.

Never stop after the first failed write
method.

Never conclude repository failure until
every approved write workflow has been
attempted.

=========================================
ENGINEERING PRINCIPLE
=========================================

Repository state is the source of truth.

Read determines Write.

Write is incomplete until Read verifies it.

Think in repository state.

Not repository commands.

=========================================
END OF SHA RESOLUTION RULE
=========================================


=========================================
END OF PATCH PROTOCOL
=========================================
