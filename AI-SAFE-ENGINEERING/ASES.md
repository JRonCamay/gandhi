AI-Safe Engineering Standards (ASES)

Version 1.0

Originally conceived by

Jay Ronald Camay Philippines

Technical refinement and formalization developed collaboratively with
OpenAI ChatGPT during the design and development of the Transfork
project.

------------------------------------------------------------------------

Purpose

Engineering Standards define the mandatory rules that govern this
repository.

Unlike ASEP, every standard in this document is normative.

------------------------------------------------------------------------

ASES-000 — Legacy Migration Standard (LMS)

Existing working code is valid.

Do not rewrite stable code simply because newer standards exist.

New code follows the latest standards immediately.

Legacy code is upgraded only when it is legitimately touched for bug
fixes, features, modularization or maintenance.

Engineering standards guide the future.

They do not rewrite the past.

------------------------------------------------------------------------

ASES-001 — Declaration Identity (DID)

Guardian of Identity.

Every persistent declaration must have a unique permanent identity.

Format:

nameYYMMDD_random

Example:

overlayRegistry260702_fg2mns

The DID never changes once assigned.

------------------------------------------------------------------------

ASES-002 — Ownership Rule (OR)

Guardian of Authority.

Before creating any runtime owner, assume one already exists.

Every owner must register:

-   Area
-   Owner
-   Purpose
-   Version
-   Timestamp
-   Priority

Only one active owner may control a runtime responsibility.

Older owners retire gracefully.

------------------------------------------------------------------------

ASES-003 — 500-Line Rule (500R)

Prefer focused modules.

When practical, keep implementation files near or below 500 lines.

Do not split files only to satisfy the rule.

Responsibility is more important than line count.

------------------------------------------------------------------------

ASES-004 — Implementation Communication Standard (ICS)

Implementation Mode

Find.

Fix.

Verify.

Next.

Ship.

Don’t Narrate.

Reserve discussion for architecture, significant trade-offs, or when
explicitly requested.

------------------------------------------------------------------------

ASES-005 — AI Engineering Log & Identity Standard (AELIS)

Every significant source file should include:

-   Created By
-   Creator Persona
-   Last Modified By
-   Modifier Persona
-   Current State
-   Summary
-   Technical Notes
-   Baton Message

Persona is selected once when an AI first joins the project.

Role is selected once per project.

Current State changes every interaction.

Baton Message changes every engineering log.

Only the Creator and Last Modifier appear in source files.

------------------------------------------------------------------------

ASES-006 — AI Conversation Log Standard (ACLS)

Maintain lightweight engineering conversation logs.

Use daily logs.

Summarize older logs.

Delete expired daily logs after summarization.

Avoid unbounded growth.

------------------------------------------------------------------------

Closing

These standards exist to protect the runtime, preserve engineering
quality, and allow engineers to focus on solving real problems.

The Guardian Standards protect the runtime.

Your mind should be free to protect the architecture.
