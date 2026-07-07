# TransforkNew Execution Rules

Mandatory rules for TransforkNew modules.

## Manager first

Every execution line must have a manager object. Numbered files or station names are not enough.

The manager owns the active station:

```js
manager.currStation = 2;
```

Every managed function must begin with its guardian check before doing any work:

```js
function update() {
    if (manager.currStation !== MY_STATION_ID) return;

    // function logic starts here
}
```

Nothing is allowed before the guardian: no VM read, DOM update, render, calculation, event work, logging, or side effect.

## Debug error catch

After the guardian, executable logic should use a debug-controlled catch.
Errors should print only when debug is enabled.

The error output must identify the file, function, purpose, and station.

## One registry handler only

TransforkNew has one registry handler:

```js
window.TransforkNew.REGISTRY
```

Every programmer adding a function must register its function id, file path, function name, purpose, manager, and station.

This lets the programmer check whether a same-purpose function already exists before adding another one.

## Rollcall is debug-only

Rollcall is not a render loop. It does not run every frame and does not run every second.

Rollcall runs only when requested manually or when this debug toggle is on:

```js
window.TransforkNew.DEBUG.rollcallEnabled = true;
```

Manual call:

```js
window.TransforkNew.REGISTRY.rollcall(true);
```

## Suspicious files

A loaded file that has no registry entry is suspicious.
A duplicated purpose is suspicious.
A same-purpose renderer, listener, shortcut, or tool function is suspicious.

Registry and rollcall are debugging tools only. They help programmers identify ownership and duplication without adding per-frame runtime cost.
