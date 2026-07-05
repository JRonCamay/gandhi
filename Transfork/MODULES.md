# Transfork Modules

## Current status

The full `TransformBoxTool.js` split is **not complete** on `main`.

The active behavior is still the original monolith:

```text
TransformBoxTool.js
```

The loader currently loads only that active entrypoint so browser behavior stays stable.

## Install entrypoint

Use:

```text
Transfork/TransformBoxTool.Loader.user.js
```

## Loader order

Current loader order:

1. `TransformBoxTool.js`

## Not active yet

The requested module paths below were reported, but they are not present on `main` at review time:

```text
Transfork/core/state.js
Transfork/core/vm.js
Transfork/core/stage.js
Transfork/core/overlay.js
Transfork/core/drag.js
Transfork/core/resize.js
Transfork/core/rotate.js
Transfork/core/flip.js
Transfork/core/alpha.js
Transfork/core/skew.js
Transfork/core/snap.js
Transfork/core/assetBake.js
Transfork/core/animationLoop.js
```

## Snapshot drag status

`TransforkSpriteSnapshotDragPatch.js` exists as an experimental standalone patch, but it is **not loaded by the modular loader**.

Reason:

The snapshot drag system must be integrated into the existing Transfork drag loop before activation. Loading it beside the monolith can cause duplicate drag authorities or renderer fighting.

## Next proper step

Extract the monolith mechanically first:

1. Move existing behavior into modules without changing behavior.
2. Make the loader load the modules instead of the monolith.
3. Browser-test current behavior.
4. Then integrate snapshot drag directly into the extracted drag module.

## Rule

Install either the old individual userscript or the modular loader, not both.

Installing both can duplicate event listeners.
