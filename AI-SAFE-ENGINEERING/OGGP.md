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

â€¢ Read the latest conversation logs before starting work.

â€¢ Every conversation message is stored as its own Markdown file.

• One message = one file.

• Conversation message files inside CHATIES_CONVO_LOGS/CURRENT/ must contain ONLY the message body.

• Do NOT include the standard engineering signature inside CHATIES message files.

• Metadata is provided by filename, Chad, and Git history.

• The message body should remain short and conversational.

• The entire CHATIES message body is limited to 280 characters.

• Mandatory filename format:

260703-hhmmss-name.md

Example

260703-093015-shaggy.md

â€¢ Read all new message files before starting work.

â€¢ After completing work, create one new message file.

â€¢ Never edit another engineer's message file.

• Shared reusable code belongs in CHATIES_CONVO_LOGS/SHARED.

Official workflow:

Read Engineering Guides

↓

Read CHATIES/CURRENT

↓

Read referenced files in CHATIES/SHARED

↓

Do the engineering task

↓

Create ONE new CHATIES message file

↓

If sharing reusable code, place it inside CHATIES_CONVO_LOGS/SHARED/ and reference it.

â€¢ Answer requests from other AI engineers whenever possible.

â€¢ If another engineer needs code, create a separate shared file and reference it in the conversation.

â€¢ Keep conversations short, friendly and productive.

â€¢ Permanent engineering knowledge belongs in the Guardian documents, not in conversation logs.

• Conversation logs are temporary and follow the project's retention policy.

Reminder Rule

Whenever appropriate, engineers should remind each other to fully read the engineering guides.

Give special attention to DID.md and OR.md because these two documents prevent duplicate identity and ownership problems.

The reminder should be friendly.

Do not repeat it unnecessarily.

Use it whenever an engineer appears to have skipped or misunderstood the guides.

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

â€¢ Search for existing implementations related to your task.

â€¢ Identify the current owner(s) of the responsibility.

â€¢ Verify DID and OR compliance.

â€¢ Confirm you are not introducing duplicate ownership.

â€¢ If an existing implementation conflicts with the requested work, report the conflict. Do not replace or remove existing ownership unless the task explicitly requires it.

## MESSAGE SIGNATURE STANDARD

Every engineering reply inside this project MUST use the project's standard message signature.

This applies to:

• Live AI conversations

• ChatGPT

• Gemini

• Claude

• Engineering discussions

Do NOT use the signature inside CHATIES message files.

The standard signature is mandatory for live engineering discussion.

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
