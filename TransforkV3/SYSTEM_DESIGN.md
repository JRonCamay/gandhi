# TransforkV3 SYSTEM_DESIGN

## Purpose

This document defines the TransforkV3-only architecture.

TransforkV3 is the clean modular transform system for Gandhi/Cocrea. It replaces older tangled transform behavior with small systems that each own one responsibility.

This file must contain only TransforkV3-related design rules. General AI, MCP, memory, fingerprinting, and cross-project workflow rules belong in `README.md`.

---

## Core Architecture

TransforkV3 uses a bootloader, a main loader, and registered systems.

```text
TF3_Boot.js
↓
TF3_Main.js
↓
SYSTEM/*/index.js
↓
window.TransforkV3.systems
```

The global root is:

```js
window.TransforkV3
```

Required root shape:

```js
window.TransforkV3 = {
    VERSION: "",
    systems: {},
    runtime: {},
    registerSystem(name, api) {}
};
```

Rules:

- Systems register through `registerSystem()`.
- Systems expose small public APIs.
- Systems do not overwrite the global root.
- Shared state belongs in `runtime`.
- Feature logic does not belong in the loader.

---

## Loader Responsibilities

### TF3_Boot.js

Owns only startup.

Responsibilities:

- Create `window.TransforkV3` if missing.
- Create `runtime` if missing.
- Load `TF3_Main.js`.
- Use cache-busting query strings.
- Avoid old TransforkNew loader paths.

Must not contain:

- Transform box behavior
- UI creation
- Shortcut logic
- Move/scale/render logic

### TF3_Main.js

Owns module loading and system start order.

Responsibilities:

- Define the online root path.
- Define `VERSION`.
- Define module list.
- Load each system script.
- Record loaded systems.
- Start registered systems.
- Expose `app.reload()`.

Must not contain feature behavior.

---

## System Folder Convention

Each system lives under:

```text
TransforkV3/SYSTEM/<SYSTEM_NAME>/index.js
```

Expected systems:

```text
SYSTEM/
├── DEBUG/
├── VM/
├── KEY/
├── MOUSE/
├── SPRITE/
├── SNAPSHOT/
├── CLEANER/
├── MATH/
├── RENDER/
├── MOVE/
├── SCALE/
├── TRANSFORM_BOX/
└── UI/
```

Every system folder must have an `index.js` entry point.

When a system grows, it may split into ordered files:

```text
00_state.js
10_registry.js
20_events.js
30_runtime.js
40_api.js
```

`index.js` remains the official entry point.

---

## Standard System Registration Pattern

```js
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};

    const api = {
        name: "SYSTEM_NAME",
        started: false,
        start: function () {
            api.started = true;
        }
    };

    if (typeof app.registerSystem === "function") {
        app.registerSystem("SYSTEM_NAME", api);
    }
})();
```

Rules:

- Every system has `name`.
- Every system has `started`.
- Every system exposes `start()`.
- `start()` must avoid duplicate listeners and duplicate DOM.
- Systems should check dependencies before calling them.

---

## System Ownership

### DEBUG

Owns diagnostics.

Responsibilities:

- debug flags
- structured logs
- error reporting
- inspection helpers

Does not own UI, input, transform behavior, or VM mutation.

---

### VM

Owns Scratch/Gandi runtime access.

Responsibilities:

- locate VM
- expose runtime references
- verify VM readiness
- provide safe access helpers

Does not own UI, rendering, shortcuts, or transform math.

---

### KEY

Owns keyboard input.

Responsibilities:

- one global `keydown` listener
- shortcut dispatch
- focus guards
- hotkey routing

Rules:

- Only KEY may install the global keyboard listener.
- KEY routes actions to system APIs.
- KEY must not directly implement large feature behavior.

Expected shortcuts:

```text
R       Toggle transform box
ALT+R   Reload TransforkV3
```

---

### MOUSE

Owns pointer and mouse dispatch.

Responsibilities:

- shared mouse state
- mousedown routing
- mousemove routing
- mouseup routing
- pointer capture coordination

Does not own move, scale, render, or UI creation.

---

### SPRITE

Owns selected sprite identity.

Responsibilities:

- selected target
- selected drawable
- selected sprite bounds cache
- sprite identity tracking

Does not draw the transform box and does not apply transforms.

---

### SNAPSHOT

Owns temporary transform session state.

Examples:

```text
start x/y
start size
start direction
start bounds
mouse origin
scale origin
```

Rules:

- Snapshot state is temporary.
- It is created at transform start.
- It is cleared at transform end.
- It should not become permanent feature state.

---

### CLEANER

Owns cleanup of Transfork-owned leftovers.

Can remove:

- old transform boxes
- stale buttons
- orphan overlays
- stale snapshots
- detached Transfork DOM

Rules:

- CLEANER must be conservative.
- It may only remove known Transfork-owned elements.
- It must not remove Cocrea/Scratch UI.

---

### MATH

Owns pure calculations.

Examples:

- screen-to-stage conversion
- stage-to-screen conversion
- bounds math
- scale ratio
- rotation angle
- pivot calculation
- snap calculation

Rules:

- MATH must not touch DOM.
- MATH must not touch VM.
- MATH must not register events.
- MATH must be deterministic.

---

### UI

Owns DOM creation and styling.

Responsibilities:

- create root UI elements
- create transform box DOM
- create handles/buttons
- create version label
- show/hide/destroy UI

Expected elements:

```text
transform box
move button
rotate button
scale handle
flip horizontal button
flip vertical button
reset button
version box
```

Expected API:

```js
createToolbox()
show()
hide()
toggle()
destroy()
```

Rules:

- UI creates DOM.
- UI does not transform sprites.
- UI does not own keyboard shortcuts.
- UI does not own calculations.

---

### TRANSFORM_BOX

Owns the transform box feature state and coordination.

Responsibilities:

- visible/hidden state
- current transform session state
- connection between UI and feature systems
- coordination between MOVE, SCALE, RENDER, and selected sprite state

Expected API:

```js
show()
hide()
toggle()
startSession()
endSession()
```

Rules:

- TRANSFORM_BOX coordinates.
- UI creates the DOM.
- RENDER updates visual placement.
- MOVE and SCALE apply behavior.

---

### RENDER

Owns visual refresh.

Responsibilities:

- refresh transform box location
- refresh handle positions
- reflect selected sprite bounds
- update UI from runtime state

Expected API:

```js
refresh()
```

Rules:

- RENDER draws.
- RENDER does not decide behavior.
- RENDER does not own movement or scaling.
- RENDER must avoid duplicate render loops.

---

### MOVE

Owns movement behavior.

Responsibilities:

- move drag start
- move drag update
- move drag end
- apply sprite position

Rules:

- MOVE uses SNAPSHOT for start state.
- MOVE uses MATH for calculations.
- MOVE asks RENDER to refresh.
- MOVE does not create UI.

---

### SCALE

Owns scaling behavior.

Responsibilities:

- scale drag start
- scale drag update
- scale drag end
- apply sprite size changes

Rules:

- SCALE uses SNAPSHOT for start state.
- SCALE uses MATH for calculations.
- SCALE asks RENDER to refresh.
- SCALE does not create UI.

---

## Ownership Boundary Rules

No duplicate ownership.

```text
KEY owns keyboard input.
MOUSE owns pointer dispatch.
UI owns DOM creation.
TRANSFORM_BOX owns feature coordination.
RENDER owns visual refresh.
MOVE owns movement.
SCALE owns scaling.
MATH owns calculations.
VM owns VM access.
SPRITE owns selected sprite identity.
SNAPSHOT owns temporary transform state.
CLEANER owns cleanup.
```

A system must not silently perform another system's job.

If a system needs another system, it calls that system's public API.

---

## Runtime State

Shared state belongs in:

```js
window.TransforkV3.runtime
```

Allowed examples:

```js
runtime.toolboxVisible
runtime.selectedTarget
runtime.selectedDrawable
runtime.activeTransform
runtime.keyListenerInstalled
runtime.loadedSystems
```

Rules:

- Runtime state must be obvious.
- Avoid duplicate state names.
- Avoid hidden cross-system state.
- Avoid storing the same DOM node in multiple systems unless necessary.

---

## Load Order

Current practical load order:

```text
KEY
UI
TRANSFORM_BOX
RENDER
MOVE
SCALE
```

Future preferred load order:

```text
DEBUG
VM
MATH
SPRITE
SNAPSHOT
CLEANER
UI
RENDER
KEY
MOUSE
TRANSFORM_BOX
MOVE
SCALE
```

Reason:

- Foundations first.
- UI and render before behavior.
- Input systems route into features.
- Feature systems execute last.

---

## One Listener Rule

Only one system may own a global listener for each input type.

```text
KEY owns keydown.
MOUSE owns pointer/mouse dispatch.
RENDER owns any animation refresh loop.
```

Duplicate listeners should be removed or routed through the owning system.

---

## Render Rule

Only one render path should update the transform box.

RENDER may be called by:

- MOVE
- SCALE
- TRANSFORM_BOX
- selected sprite changes
- show/hide events

But the actual visual update belongs to RENDER.

This prevents:

- double drawing
- stale boxes
- sprite moved but box left behind
- render loops fighting each other

---

## TransforkV3 Completion Rule

A TransforkV3 implementation task is complete only when:

1. Required files exist.
2. Required systems register successfully.
3. Required APIs are exposed.
4. Runtime behavior is tested when possible.
5. No unrelated TransforkNew/protected files were touched.
6. The implementation matches the requested scope.

Do not report TransforkV3 work complete from memory or intention.

Completion requires verified repository state or verified runtime behavior.
