# Transfork Modularization

## Current Strategy

TransformBoxTool.js is now treated as the legacy visual/UI provider.

New work should happen inside `Transfork/` modules.

## Active Module Spine

- `Transfork/TransforkLoader.user.js`
- `Transfork/namespace.js`
- `Transfork/state.js`
- `Transfork/vm.js`
- `Transfork/coords.js`
- `Transfork/drawable.js`
- `Transfork/math.js`
- `Transfork/selectionBox.js`
- `Transfork/transformOps.js`
- `Transfork/snapshotDrag.js`
- `Transfork/resize.js`
- `Transfork/rotate.js`
- `Transfork/alpha.js`
- `Transfork/flip.js`
- `Transfork/skew.js`
- `Transfork/legacyBridge.js`
- `Transfork/main.js`

## Migration Rule

Do not add new behavior to `TransformBoxTool.js` unless the task explicitly requires touching legacy.

For future edits:

1. Add or update the correct module in `Transfork/`.
2. Keep one owner per behavior.
3. Use `legacyBridge.js` to document what is still owned by legacy.
4. Cut over one behavior at a time.
5. Retire legacy sections only after the module version passes browser testing.

## Current Ownership

### Modular

- Snapshot drag
- VM access
- Coordinate conversion
- Selection box placement helpers
- Drawable helpers
- Shared transform operations
- Resize session shell
- Rotate session shell
- Alpha session shell
- Flip operations
- Skew session shell

### Legacy

- Overlay DOM creation
- Handle DOM creation
- Existing update loop
- Full resize event wiring
- Full rotate event wiring
- Full alpha input UI wiring
- Asset bake pipeline
- Skew bake pipeline

## Next Cutover

Recommended next task:

Move handle DOM creation into `Transfork/handles.js`, then route handle events into the modules already created here.
