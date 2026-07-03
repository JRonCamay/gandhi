# Omni Guardian Guide Protocol (OGGP)
Version 1.0

Guardian of Knowledge

# Purpose

OGGP is the project knowledge map.

Before reading massive source files or creating new persistent systems, engineers must read the project OMNI_GUARDIAN.md first.

The goal is to reuse what already exists before inventing anything new.

# Project Location

Each project has its own Omni Guardian.

Examples:

Transfork/OMNI_GUARDIAN.md

Composer/OMNI_GUARDIAN.md

MiniConsole/OMNI_GUARDIAN.md

# Workflow

Task received

Open OMNI_GUARDIAN.md

Search by keyword

If found, understand and reuse it

If not found, create it and register it

# Required Entry Fields

Name

Type

Visibility

Creator

Location

Purpose

Parameters

Returns

Used By

Status

Notes

# Visibility Values

Project

Private

Legacy

Deprecated

# Status Values

Active

Retired

Moved

Deprecated

# Entry Example

Name:
findSnapPosition260703_fg29ms

Type:
Function

Visibility:
Project

Creator:
Shaggy

Location:
Transfork/snapping.js

Purpose:
Finds the closest snap position for transform operations.

Parameters:
target, x, y

Returns:
Snap result object.

Used By:
12

Status:
Active

Notes:
Use this instead of creating another snap search function.

# Variable Example

Name:
overlayRegistry260702_fg2mns

Type:
Variable

Visibility:
Project

Creator:
Shaggy

Location:
Transfork/ui/overlay.js

Purpose:
Stores the active overlay registry.

Used By:
4

Status:
Active

Notes:
Do not create a second overlay registry.

# Rules

Before opening large source files, search OMNI_GUARDIAN.md first.

Before creating project-level functions, variables, managers, controllers, registries, owners, bridges, or engines, search OMNI_GUARDIAN.md first.

If an existing item satisfies the need, reuse it.

If a new reusable item is created, register it immediately.

If an item is moved, update the entry.

If an item is deleted, retire the entry.

If the use count changes significantly, update Used By.

# Used By

Used By records how many places in the project use the item.

Low usage means the item may be specialized.

High usage means it must be changed carefully.

# Summary

Search first.

Reuse first.

Read less.

Build faster.

The project remembers what engineers forget.

## AI Maintenance Rule

Humans are not responsible for maintaining OMNI_GUARDIAN.md.

Every AI engineer that creates, edits, moves, retires or deletes reusable project systems must update OMNI_GUARDIAN.md during the same task.

The task is not complete until both the implementation and OMNI_GUARDIAN.md are synchronized.

## AI Collaboration Rule (ACR)

Purpose

AI engineers collaborate through the repository to reduce duplicated work, share knowledge and help future engineers complete tasks faster.

Rules

• Read the latest conversation logs before starting work.

• Every conversation message is stored as its own Markdown file.

• One message = one file.

• Read all new message files before starting work.

• After completing work, create one new message file.

• Never edit another engineer's message file.

• Shared reusable code belongs in CHATIES_CONVO_LOGS/SHARED.

• Answer requests from other AI engineers whenever possible.

• If another engineer needs code, create a separate shared file and reference it in the conversation.

• Keep conversations short, friendly and productive.

• Permanent engineering knowledge belongs in the Guardian documents, not in conversation logs.

• Conversation logs are temporary and follow the project's retention policy.

Example

Shaggy

Need findSnapPosition.

---

Brenda

See

AI_COLLABORATION/SHARED/findSnapPosition.js

---

Manuel

Integrated.

Thanks.

Motto

Ask.

Share.

Continue.

Leave the project better than you found it.

## ARCHITECTURE DISCOVERY

Before implementing:

• Search for existing implementations related to your task.

• Identify the current owner(s) of the responsibility.

• Verify DID and OR compliance.

• Confirm you are not introducing duplicate ownership.

• If an existing implementation conflicts with the requested work, report the conflict. Do not replace or remove existing ownership unless the task explicitly requires it.

## MESSAGE SIGNATURE STANDARD

Every engineering reply inside this project MUST use the project's standard message signature.

This applies to:

• Chat responses

• CHATIES conversation messages

• Engineering discussions

The standard signature is mandatory.

HEADER

<Project Title>

<Name and Role>

Current State: "<status>"

<Date>

Message

FOOTER

<Name>

Current State: "<same status>"

Rules

• Header and footer must use the EXACT SAME Current State.

• Never invent a second status.

• Keep the same persona throughout the project.

• Keep the same icon throughout the project.

