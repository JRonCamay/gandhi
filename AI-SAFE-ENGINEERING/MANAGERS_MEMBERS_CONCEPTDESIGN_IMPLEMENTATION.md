# TransforkNew Factory-Line Debug Architecture

## 1. Core Concept

TransforkNew should behave like a **factory line**.

Each system has a line:

```text
MAIN LINE
KEY LINE
MOVE LINE
RENDER LINE
VM LINE
```

Each line has:

```text
Manager
↓
Station 0
↓
Station 1
↓
Station 2
↓
Station 3
```

Only the current station is allowed to run.

The manager owns:

```js
currStation
```

Example:

```js
KEY_MANAGER.currStation = 2;
```

Only station `2` can execute.

---

# 2. Purpose

This system prevents:

```text
Wrong execution order
Double rendering
Shortcut firing before setup
Move logic running before VM is ready
Unknown overlapping functions
Silent errors
Hard-to-find stopping points
```

It makes bugs easy to locate because if the line stops at station `3`, the problem is inside station `3`.

---

# 3. The Four Mandatory Rules

## Rule 1 — Manager

Every line must have one manager.

```js
const KEY_MANAGER = {
    currStation: 0,

    guard(stationId) {
        return this.currStation === stationId;
    },

    submitEndSession() {
        this.currStation++;
    },

    reset() {
        this.currStation = 0;
    }
};
```

---

## Rule 2 — Guardian at Function Start

Every process member must begin with:

```js
if (!KEY_MANAGER.guard(2)) return;
```

Example:

```js
function findShortcut(ctx) {
    if (!KEY_MANAGER.guard(2)) return;

    // station work
}
```

This blocks the function if it is not its turn.

---

## Rule 3 — Reporter at Function End

Every successful process member must end with:

```js
KEY_MANAGER.submitEndSession();
```

Example:

```js
function findShortcut(ctx) {
    if (!KEY_MANAGER.guard(2)) return;

    try {
        ctx.shortcut = findMatch(ctx.event);

        KEY_MANAGER.submitEndSession();
    } catch (err) {
        KEY_MANAGER.sleeper(err, "findShortcut");
    }
}
```

This tells the manager:

```text
This station is done.
Move to the next station.
```

---

## Rule 4 — Sleeper Error Catch

Every process member must have a catch.

```js
try {
    // work
} catch (err) {
    KEY_MANAGER.sleeper(err, {
        file: "TransforkNew/KEY/KEY.js",
        functionName: "findShortcut",
        station: 2
    });
}
```

The global debug boolean controls whether it reports:

```js
DEBUG.sleeperErrorCatch = true;
```

If true:

```text
Errors are reported.
```

If false:

```text
Errors are caught silently.
```

No error = no report.

---

# 4. Rollcall / Registry Rule

Every function must register itself.

```js
REGISTRY.register({
    id: "KEY.station02.findShortcut",
    file: "TransforkNew/KEY/KEY.js",
    functionName: "findShortcut",
    purpose: "Find matching keyboard shortcut",
    manager: "KEY",
    station: 2
});
```

Purpose:

```text
Know what functions exist.
Know what each function does.
Detect duplicate purpose.
Detect unregistered suspicious functions.
Detect overlapping renderers.
```

If a function exists but is not registered:

```text
It becomes suspicious.
```

---

# 5. Global Manager Concept

There can be many line managers, but they should be visible through one global manager hub.

```js
window.TransforkNew.MANAGERS = {
    KEY: KEY_MANAGER,
    MOVE: MOVE_MANAGER,
    MAIN: MAIN_MANAGER,
    RENDER: RENDER_MANAGER,
    VM: VM_MANAGER
};
```

Each line still owns its own `currStation`.

Example:

```js
window.TransforkNew.MANAGERS.KEY.currStation
window.TransforkNew.MANAGERS.MOVE.currStation
```

---

# 6. Standard Function Template

Every process member should look like this:

```js
function station02_findShortcut(ctx) {
    if (!KEY_MANAGER.guard(2)) return;

    try {
        ctx.shortcut = findShortcut(ctx.event);

        KEY_MANAGER.submitEndSession();

    } catch (err) {
        KEY_MANAGER.sleeper(err, {
            file: "TransforkNew/KEY/KEY.js",
            functionName: "station02_findShortcut",
            station: 2,
            purpose: "Find matching key shortcut"
        });
    }
}
```

---

# 7. Standard Manager Template

```js
const KEY_MANAGER = {
    name: "KEY",
    currStation: 0,

    guard(stationId) {
        if (this.currStation !== stationId) {
            window.TransforkNew.DEBUG?.log?.("Guardian blocked", {
                manager: this.name,
                expected: stationId,
                current: this.currStation
            });
            return false;
        }

        return true;
    },

    submitEndSession() {
        this.currStation++;
    },

    sleeper(error, entry) {
        if (!window.TransforkNew.DEBUG?.sleeperErrorCatch) return;

        console.error("[TN SLEEPER ERROR]", {
            manager: this.name,
            currentStation: this.currStation,
            ...entry,
            error
        });
    },

    reset(startStation = 0) {
        this.currStation = startStation;
    }
};
```

---

# 8. Example KEY Line

```text
KEY_MANAGER.currStation = 1

Station 1: validate enabled
↓ submitEndSession()

Station 2: find shortcut
↓ submitEndSession()

Station 3: focus guard
↓ submitEndSession()

Station 4: acquire line
↓ submitEndSession()

Station 5: run shortcut
↓ submitEndSession()

Station 6: release line
↓ submitEndSession()
```

Code pattern:

```js
function station01_validateEnabled(ctx) {
    if (!KEY_MANAGER.guard(1)) return;

    try {
        if (!KEY.enabled) return;

        KEY_MANAGER.submitEndSession();

    } catch (err) {
        KEY_MANAGER.sleeper(err, {
            file: "TransforkNew/KEY/KEY.js",
            functionName: "station01_validateEnabled",
            station: 1
        });
    }
}
```

---

# 9. Debugging Behavior

If station 1 succeeds:

```text
currStation = 2
```

If station 2 fails before reporting:

```text
currStation stays 2
```

That means:

```text
The bug is in station 2.
```

If an error is caught and sleeper is on:

```text
[TN SLEEPER ERROR]
manager: KEY
currentStation: 2
file: TransforkNew/KEY/KEY.js
functionName: station02_findShortcut
station: 2
error: TypeError...
```

---

# 10. Rollcall Output Example

```js
REGISTRY.rollcall();
```

Should show:

```text
KEY.station01.validateEnabled
KEY.station02.findShortcut
KEY.station03.focusGuard
KEY.station04.acquireLine
KEY.station05.runShortcut
KEY.station06.releaseLine
```

Suspicious:

```text
Function exists but not registered.
Function has same purpose as another function.
Two renderers update the same UI.
Two listeners handle the same shortcut.
```

---

# 11. Mandatory Development Rule

Every current and future process member must follow:

```text
Guardian first
↓
Try work
↓
Reporter at end
↓
Sleeper catch
↓
Registry entry
```

No process member should be written without this structure.

Final standard:

```js
function processMember(ctx) {
    if (!MANAGER.guard(STATION_ID)) return;

    try {
        // work

        MANAGER.submitEndSession();

    } catch (err) {
        MANAGER.sleeper(err, {
            file: FILE,
            functionName: "processMember",
            station: STATION_ID,
            purpose: PURPOSE
        });
    }
}
```

This is the official TransforkNew line-management architecture.
# 12. Hierarchical Line Architecture (Parent–Child Managers)

## Core Concept

A station is not limited to a single function.

A station can own an entire **subline**.

This allows complex operations to remain modular while preserving deterministic execution.

Example:

```text
KEY LINE

Station 1
↓

Station 2
↓
    KEY FIND SUBLINE

    Find Member 1
    ↓
    Find Member 2
    ↓
    Find Member 3
    ↓
    Report back to Station 2

↓

Station 3
```

Station 2 is not considered complete until its entire subline has completed.

---

# Parent–Child Manager Relationship

Every subline has its own manager.

Example:

```text
KEY_MANAGER

    │

    ├── FIND_MANAGER

    ├── HOTKEY_MANAGER

    ├── INPUT_MANAGER

    └── RELEASE_MANAGER
```

Each manager owns only its own line.

Example:

```js
KEY_MANAGER.currStation

FIND_MANAGER.currStation

MOVE_MANAGER.currStation

RESIZE_MANAGER.currStation
```

Managers never modify another manager's station directly.

---

# Reporting Upward

Every child manager reports back to its parent manager.

Example:

```text
KEY_MANAGER
↓

Station 2

↓

FIND_MANAGER

↓

Find Member 1
↓

Find Member 2
↓

Find Member 3

↓

submitEndSession()

↓

KEY_MANAGER.submitEndSession()
```

The parent does not advance until the child explicitly reports completion.

---

# Responsibility Chain

```text
Member
↓

Sub Manager

↓

Parent Manager

↓

Main Manager
```

Every level only reports upward.

No manager skips a level.

---

# Example

Suppose:

```text
MOVE LINE

Station 4

Preview Resize
```

Instead of one large function:

```text
Preview Resize
```

becomes

```text
Preview Resize Line

↓

Capture Bounds

↓

Compute Scale

↓

Compute Pivot

↓

Apply Preview

↓

Draw Handles

↓

Return
```

Diagram:

```text
MOVE_MANAGER

Station 4

↓

PREVIEW_MANAGER

↓

Station 1
Capture Bounds

↓

Station 2
Compute Scale

↓

Station 3
Compute Pivot

↓

Station 4
Apply Preview

↓

Station 5
Draw Handles

↓

submitEndSession()

↓

MOVE_MANAGER.submitEndSession()

↓

MOVE Station 5 begins
```

---

# Recursive Design

This architecture has no fixed depth.

A line may contain another line.

Example:

```text
MAIN

↓

MOVE

↓

PREVIEW

↓

HANDLE

↓

ICON
```

Every level has:

```
Manager

Guardian

Reporter

Sleeper Catch

Registry
```

Exactly the same architecture.

---

# Guardian Rule in Sublines

Every sub-member still begins with the guardian.

```js
function computeScale() {

    if (!PREVIEW_MANAGER.guard(2))
        return;

    try {

        ...

        PREVIEW_MANAGER.submitEndSession();

    }

    catch(err){

        PREVIEW_MANAGER.sleeper(err);

    }

}
```

Nothing changes.

Only the manager changes.

---

# Reporter Chain

Reporting always moves upward.

```text
Sub Member

↓

PREVIEW_MANAGER.submitEndSession()

↓

Preview Line Finished

↓

MOVE_MANAGER.submitEndSession()

↓

Move Line Finished

↓

MAIN_MANAGER.submitEndSession()
```

This creates a deterministic execution chain where each level confirms completion before its parent advances.

---

# Failure Propagation

If any child manager fails:

```text
HANDLE_MANAGER

Station 3

↓

Error
```

then:

```text
HANDLE_MANAGER

stops
```

Therefore:

```text
PREVIEW_MANAGER

never receives completion
```

Therefore:

```text
MOVE_MANAGER

never advances
```

Therefore:

```text
MAIN_MANAGER

waits
```

The entire pipeline naturally pauses at the exact point of failure.

---

# Benefits

This hierarchical architecture provides:

* **Unlimited nesting** — Any station can become a complete workflow without changing the overall design.
* **Deterministic execution** — Parent managers only advance after child managers explicitly report completion.
* **Consistent implementation** — The same Manager, Guardian, Reporter, Sleeper Catch, and Registry rules apply at every level.
* **Precise debugging** — The execution stops at the deepest failing station, making the failure location immediately identifiable.
* **Modularity** — Complex systems are decomposed into independent, reusable production lines while remaining synchronized through upward reporting.

## Universal Rule

Every execution unit, regardless of depth, follows the same lifecycle:

```text
Manager
    ↓
Guardian
    ↓
Work
    ↓
Reporter
    ↓
Parent Manager
```

This recursive pattern makes the architecture scalable from a simple shortcut handler to an entire rendering engine while preserving strict execution order and straightforward debugging.