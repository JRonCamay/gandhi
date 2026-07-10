# TransforkV3 Engineering Manifesto

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