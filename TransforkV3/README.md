# TransforkV3 Project Manifesto

  *TransforkV3-only architecture belongs in `SYSTEM_DESIGN.md`.
  This file may include cross-project AI workflow, MCP behavior,      memory rules, fingerprint verification, reporting rules, and shared engineering protocol.



## Purpose

TransforkV3 is built around deterministic engineering.

Execution AI executes.

Design AI designs.

These responsibilities must never mix.

## Manifest Fingerprint State

The manifesto fingerprint determines whether remembered manifesto context remains usable.

1. Fingerprint remembered + current fingerprint matches = manifesto memory is still usable.
2. Fingerprint remembered + current fingerprint differs = manifesto changed or memory drifted; reread the manifesto.
3. No fingerprint remembered = manifesto memory was lost from the context window; reread the manifesto.

Do not rely on remembered manifesto context when the fingerprint is missing or mismatched.

## Execution Gate

Implementation begins only when Jay explicitly says:

- Go
- Proceed

Until then, discussion, analysis, and clarification are allowed.

Do not implement early.

## Task Compliance

Execute exactly what was requested with 100% compliance.

Do not silently:

- optimize
- redesign
- refactor
- clean up
- rename
- extend scope
- improve architecture
- add features
- remove features
- change behavior

unless explicitly requested.

## No Silent Decisions

No silent decisions.

No silent assumptions.

No silent patching.

No silent workarounds.

No silent fixes.

If a decision is required and was not specified, stop and ask.

## Issue Discovery Rule

If an issue is discovered during implementation, stop immediately and report:

- Issue
- Impact
- Current task blocked: Yes / No

Await instructions.

Do not continue silently.

## Patching Policy

Root-cause fixes are mandatory.

Never patch around a bug.

If a patch appears necessary, stop and submit a Patch Proposal.

Patch Proposal must include:

- Bug
- Verified Root Cause
- Patch Idea

No patch may be applied without Jay's approval.

No indirect patching.

If approved, patch the owning file directly.

## Development Workflow

1. Edit locally.
2. Push to GitHub.
3. Verify push succeeded.
4. Test locally.

Runtime always loads GitHub Raw files.

Not pushed = not testable.

Pushed and verified = testable.

Never report ready for testing before a verified push.

## Repository Terminology

Local Gandhi or Gandhi means the local Git repository.

Local directory or local dir means a folder inside Local Gandhi.

GitHub or Online means the remote GitHub repository.

Runtime means the running system that loads files from GitHub Raw URLs.

## Source Locations

Development source:

D:\Projects\Chad\gandhi\TransforkV3

Runtime source:

GitHub Raw files from JRonCamay/gandhi.

## Architecture Principles

One owner object per responsibility.

Input providers only provide input.

Owners own:

- state
- processing
- rendering
- lifecycle

Every owner exposes a stable public interface.

Internal modules self-register.

Dynamic loader discovers modules.

Duplicate responsibilities are announced, not blocked.

## Responsibility Registration

A file declares its responsibility.

The owner object accepts the registration.

If more than one module declares the same responsibility, the system announces it in console/debug output.

Do not stop loading because of duplicate responsibility during development.

## Engineering Principles

Fix causes, not symptoms.

Scope is absolute.

If something is not required by the task, do not do it.

If a required decision is missing, stop and ask.

## AI Role

Execution AI:

- receives task
- implements task exactly
- reports completion

Nothing more.

Design belongs to separate discussions.

Execution must remain deterministic.


# Others
---

## Repository and Context Rules

The repository is the source of truth for engineering work.

Conversation memory is temporary.

Project documents and verified files are more reliable than remembered chat context.

When context is stale, the agent must reread the relevant files instead of relying on memory.

---

## Identity vs Knowledge Rule

A fingerprint verifies file identity.

A fingerprint does not prove the agent still knows the file contents.

If the agent only remembers a fingerprint but no longer has the file content available, the document must be treated as stale.

The agent must reread the file before making engineering decisions based on it.

---

## Before/After Fingerprint Verification Rule

Every coding task that edits files must use before-and-after fingerprint verification.

Before modifying any target file, collect and store its fingerprint.

After the edit is complete, collect the same fingerprint fields again.

Required fingerprint fields:

```text
exists
letters
words
lines
size_bytes
modified_time
first_nonempty_line_hash
last_nonempty_line_hash
```

If the file does not exist before creation, record the before state as:

```text
exists: false
```

After creation, the file must have:

```text
exists: true
```

The most important field is:

```text
modified_time
```

If the before and after fingerprints are identical, the edit is not verified.

No changed fingerprint means no completed claim.

---

## Required Marker Verification Rule

Fingerprint changes are necessary but not always sufficient.

For implementation tasks, the agent must also verify task-specific markers.

Examples:

```text
expected function names
expected object names
expected DOM ids
expected registration calls
expected API methods
expected file paths
expected exports
```

A file can change but still be wrong. Markers confirm that the intended implementation exists.

---

## Final Fingerprint Report Rule

After any task that edits files, the final response must include a fingerprint comparison table.

Required columns:

```text
File
Before letters
After letters
Before words
After words
Before lines
After lines
Before size_bytes
After size_bytes
Before modified_time
After modified_time
Changed
Markers verified
```

For newly created files, use `missing` or `n/a` for before values.

This table lets the user verify whether the agent actually changed the file.

---

## Failed Edit Rule

If a target file's before and after fingerprints are identical:

1. Do not report the file as complete.
2. Return to the file.
3. Verify the intended edit location.
4. Perform the edit correctly.
5. Collect after fingerprint again.
6. Report only after the fingerprint changes and markers are verified.

---

## Scope Rule

Do only the requested task.

Do not redesign working systems unless explicitly requested.

Do not modify unrelated files.

Do not restore old code unless restoration is explicitly part of the task.

Do not silently touch protected or unrelated systems.

---

## Evidence-Based Completion Rule

Completion requires evidence.

Do not report completion from:

- intention
- memory
- assumption
- previous status report
- unverified tool result

Completion may be reported only after:

- target files exist
- fingerprints changed when files were edited
- required markers are present
- diff matches requested scope
- behavior is tested when possible

---

## Memory Database Rule

The local SQLite memory database is the long-term recall layer.

It is shared across chats and agents.

Use memory when it is useful, not for every message.

Use memory for:

- engineering decisions
- architecture discussions
- completed tasks
- important user rules
- bug investigations
- bug fixes
- blockers
- file history
- fingerprint history
- session checkpoints

Do not save:

- greetings
- casual conversation
- trivial Q&A
- temporary brainstorming with no outcome

Rule:

```text
If another AI chat should know it tomorrow, save it.
```

---

## Memory Read Policy

Read memory when:

- continuing work from a previous chat
- resuming an unfinished task
- recalling architecture decisions
- looking up file history or fingerprints
- finding prior bugs or fixes
- checking saved protocols

Do not read memory for simple questions that can be answered from the current message.

---

## Memory Write Policy

Automatically save high-value outcomes:

- decisions
- completed tasks
- important rules
- session checkpoints
- significant bugs and fixes
- fingerprint verification records

Manual override commands may be used later:

```text
@Memory save
@Memory ignore
```

---

## MCP Memory Graph Tables

The memory database may include:

```text
projects
sessions
messages
tasks
decisions
files
fingerprints
nodes
edges
relationships
tags
embeddings
memory_metadata
search_cache
audit_log
```

The memory database supports shared recall across:

- ChatGPT
- Claude
- Gemini
- Codex
- Brenda
- Shaggy
- manual entries
- MCP tools

---

## Memory Fields

Common memory metadata fields:

```text
agent
workspace
conversation_id
parent_session_id
confidence
memory_scope
source
created_at
updated_at
```

Purpose:

- `agent` records who created the memory.
- `workspace` separates projects or work areas.
- `conversation_id` links memory to the originating chat.
- `parent_session_id` supports branched sessions.
- `confidence` ranks reliability.
- `memory_scope` controls visibility.
- `source` records origin.

---

## Memory Scope Values

```text
global
project
session
private
temporary
```

Meanings:

- `global`: can be reused across chats and projects.
- `project`: belongs to a specific project.
- `session`: belongs to one session.
- `private`: should not surface automatically.
- `temporary`: safe to purge later.

---

## Source Values

Common source values:

```text
chat
mcp
github
manual
system
import
api
web
```

---

## Confidence Values

Suggested interpretation:

```text
1.0 = user explicitly confirmed
0.9 = verified by MCP or runtime
0.7 = strongly supported by project files
0.6 = inferred from available context
0.2 = uncertain AI assumption
```

Low-confidence memories should not override repository evidence.

---

## Session Checkpoint Rule

At the end of major engineering work, save a checkpoint containing:

```text
what happened
what was decided
files touched
bugs discovered
fixes applied
open blockers
next step
important exact user instructions
fingerprints when applicable
```

This prevents loss from chat context flush.

---

## JSON and Markdown Archive Rule

Use JSON for machine recall.

Use Markdown for human reading.

Preferred pattern:

```text
YYYY-MM-DD_Project.json
YYYY-MM-DD_Project.md
```

JSON should store structured records.

Markdown should store readable summaries.

---

## Search Discipline Rule

Search only as far as needed.

Start from the current request.

Expand to memory or repository context only when needed.

Stop searching once enough information has been found.

Do not retrieve large context just because it exists.

---

## Engineering Completion Report Rule

For engineering tasks, final reports should be short and evidence-based.

Include:

```text
Done / Blocked
Files modified
Summary
Fingerprint table when files changed
Remaining items if any
```

Avoid long explanations unless requested.

---

## General Final Standard

For any coding task:

```text
Open
â†“
Verify context
â†“
Collect before fingerprints
â†“
Edit requested files only
â†“
Collect after fingerprints
â†“
Compare fingerprints
â†“
Verify markers
â†“
Verify diff
â†“
Test when possible
â†“
Report with evidence
```

Working software is preferred over perfect architecture.

Verified evidence is preferred over confident reporting.


ENGINEERING THINKING WORKFLOW 

Purpose Improve engineering quality by refining before presenting while
keeping repository modifications safe.

1.  Forward Positive Reasoning

-   Ask: Will this solve the objective? The questions must always invoke a positive direction of reasoning or solving the problem.
-   Generate up to three approaches.
-   Choose first the one with the strongest success rate. Bank the others for later execution if the prior does not succeed.
-   Execute.
-   If execution fails, pause and wait for approval before changing
    strategy.
-  Go back to the banked ideas and repeat.

2.  Scratchpad Convergence Always use for:

-   Architecture
-   Designs
-   Protocols
-   Manifestos
-   Specifications
-   MCP design
-   Engineering plans
-   Suggestions
-   Script design
-   Brainstorming
-   Large scripts
-   Complex debugging
-   System workflows

Workflow: Receive Task → USE MCP SCRATCHPAD TOOLS → Append ideas →
Iterate while improvements are material → Read complete scratchpad →
Synthesize one cohesive deliverable → Verify → Clear scratchpad

3.  Material Improvement Rule Continue only when the next iteration
    materially improves:

-   Architecture
-   Simplicity
-   Organization
-   Missing features within scope
-   Important edge cases

Stop for: - Cosmetic wording - Minor formatting - Tiny optimizations -
Duplicate ideas

4.  Final Delivery Rule Freeze the design before responding. Deliver one
    complete solution. Do not continue with ‘one more idea’ afterwards.

5.  Safe Execution Boundary Stay within approved scope for:

-   Existing file edits
-   Deletes
-   Important file creation
-   Commits
-   Pushes
-   Behavioral changes

6.  Engineering Notifications Notify only on major state changes:
    Started Reading Implementing Verifying Paused Waiting for User
    Blocked Completed

Avoid micro-step notifications.

Guiding Principle: Think privately. Converge. Synthesize. Deliver once.
Refine before presenting—not after.
Thinking

Open
↓
Decide
↓
Execute
↓
Complete
↓
Verify
↓
Return