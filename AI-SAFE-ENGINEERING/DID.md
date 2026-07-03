# Declaration Identity (DID)
Version 1.0

Guardian of Identity

# Purpose

DID gives every persistent declaration a permanent unique identity.

It prevents AI agents and engineers from accidentally creating or overwriting the same project object.

It protects identity so engineers can focus on solving the actual problem.

# Rule

Every new persistent declaration must use DID.

Format:

nameYYMMDD_random6

Examples:

overlayRegistry260702_fg2mns

rendererOwner260703_k9lm2q

selectionState260703_a8f1zc

# Applies To

Project-level functions

Global variables

Shared objects

Module state

Registries

Managers

Controllers

Runtime bridges

Long-lived listeners

Long-lived observers

Patch modules

# Does Not Apply To

Local variables

Function parameters

Loop counters

Temporary values

Short helper values inside one function

# Project Creation Rule

Whoever creates a project must create the declaration record file.

Location:

<Project Root>/DECLARATION_RECORD.md

Every project has exactly one declaration record.

# Declaration Record Purpose

The declaration record is the searchable identity catalog of the project.

Before creating a persistent declaration, search this file first.

If a suitable declaration already exists, reuse it instead of creating another one.

# Declaration Record Entry Format

Name:
overlayRegistry260702_fg2mns

Type:
Variable

Creator:
Shaggy

Location:
Transfork/overlay.js

Purpose:
Stores the active overlay registry.

Status:
Active

Notes:
Shared project registry.

# Status Values

Active

Retired

Moved

Deprecated

# Rules

Search DECLARATION_RECORD.md before creating persistent declarations.

Register every new persistent declaration.

Update the record when a declaration is moved, renamed, retired, or deleted.

Never reuse a DID.

Never regenerate a DID.

Never rename an existing DID unless the declaration is intentionally replaced.

Legacy declarations are exempt until touched for a real reason.

# Summary

Unique names.

Permanent identity.

One declaration record.

Search first.

Register immediately.

No accidental collisions.

## AI Maintenance Rule

Humans are not responsible for maintaining DECLARATION_RECORD.md.

Every AI engineer that creates, edits, moves, retires or deletes project-level declarations must update DECLARATION_RECORD.md during the same task.

The task is not complete until both the implementation and DECLARATION_RECORD.md are synchronized.
