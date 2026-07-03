# ChadTheGreat Omni Guardian

## Engineering Checkpoint

STOP.

Before creating or modifying project-level functions, variables, managers, controllers, engines, listeners, bridges, owners, or patch modules:

1. Read `README.md`.
2. Read `AI-SAFE-ENGINEERING/START_HERE.md`.
3. Read `AI-SAFE-ENGINEERING/ASEP.md`.
4. Read `AI-SAFE-ENGINEERING/ASES.md`.
5. Read the Guardian document related to the task.

Search this file before opening massive source files or inventing new reusable systems.

## Purpose

This file is ChadTheGreat's project knowledge map.

Use it to find existing reusable systems before creating new ones.

## Entry Template

```text
Name:

Type:

Visibility:

Creator:

Location:

Purpose:

Parameters:

Returns:

Used By:

Status:

Notes:
```

## Current Entries

Name:
runtimeSwitchboard260703_mr4k9q

Type:
Runtime bridge

Visibility:
Project

Creator:
Manuel

Location:
ChadTheGreat/runtimeSwitchboard.js

Purpose:
Provides ChadTheGreat's Master Authority Registry for enabling and disabling runtime modules.

Parameters:
register(entry), isOn(key), set(key, value), enable(key), disable(key), get(key), list()

Returns:
Runtime switchboard API.

Used By:
4

Status:
Active

Notes:
Loaded before runtime modules in `manifest.json`. Current registered keys include `agentFixes`, `uiChaties`, `legacyFolderToggle`, and `renderDebug`.

## AI Maintenance Rule

Humans are not responsible for maintaining this file.

Every AI that creates, edits, moves, retires, or deletes reusable ChadTheGreat systems must update this file during the same task.

A task is incomplete until implementation and project memory are synchronized.

