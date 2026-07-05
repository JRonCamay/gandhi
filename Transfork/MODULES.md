# Transfork Modules

## Install entrypoint

Use:

```text
Transfork/TransformBoxTool.Loader.user.js
```

The loader installs one Tampermonkey userscript and loads Transfork files in this order:

1. `TransformBoxTool.js`
2. `TransforkSpriteSnapshotDragPatch.js`

## Why this structure exists

`TransformBoxTool.js` is the existing working Transfork monolith. It is intentionally left unchanged so the accepted behavior is preserved.

New behavior should be added as separate modules and listed in the loader instead of expanding the monolith.

## Current modules

### TransformBoxTool.js

Core transform box behavior.

### TransforkSpriteSnapshotDragPatch.js

Snapshot-based sprite drag patch. During sprite drag, this module creates a temporary DOM snapshot, hides the real Scratch drawable, moves the snapshot and transform box together, then commits the final position on mouse release.

## Rule

Install either the old individual userscripts or the modular loader, not both.

Installing both can duplicate event listeners.
