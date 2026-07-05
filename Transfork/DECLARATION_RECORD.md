# Transfork Declaration Record

## Engineering Checkpoint

STOP.

Before creating a new persistent declaration:

1. Read `README.md`.
2. Read `AI-SAFE-ENGINEERING/START_HERE.md`.
3. Read `AI-SAFE-ENGINEERING/ASEP.md`.
4. Read `AI-SAFE-ENGINEERING/ASES.md`.
5. Read `AI-SAFE-ENGINEERING/DID.md`.

Search this file before creating project-level variables, functions, managers, controllers, registries, bridges, owners, or patch modules.

## Purpose

This file is Transfork's searchable identity catalog.

Use it to prevent duplicate persistent declarations.

## Entry Template

```text
Name:

Type:

Creator:

Location:

Purpose:

Status:

Notes:
```

## Current Entries

Name:
transforkModuleLoaderState260705_m8q2vz

Type:
Module state

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransformBoxTool.Loader.user.js

Purpose:
Tracks the Transfork loader base URL, load state, and active module list.

Status:
Active

Notes:
Currently loads only `TransformBoxTool.js` to preserve stable browser behavior until the monolith extraction is complete.

---

Name:
transforkInjectModule260705_p7n4kc

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransformBoxTool.Loader.user.js

Purpose:
Injects fetched Transfork source into the page as an executable script with a sourceURL.

Status:
Active

Notes:
Used by the loader entrypoint.

---

Name:
transforkLoadModule260705_h3v9pt

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransformBoxTool.Loader.user.js

Purpose:
Fetches one Transfork module from GitHub raw and injects it into the page.

Status:
Active

Notes:
Uses no-store fetch cache policy.

---

Name:
transforkRunModules260705_x2md8r

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransformBoxTool.Loader.user.js

Purpose:
Runs the Transfork loader once and prevents duplicate concurrent loads.

Status:
Active

Notes:
The active module list is intentionally conservative until the real split is finished.

## AI Maintenance Rule

Humans are not responsible for maintaining this file.

Every AI that creates, edits, moves, retires, or deletes Transfork project-level declarations must update this file during the same task.

A task is incomplete until implementation and declaration memory are synchronized.
