# Transfork Module Load Order

Use this order while the loader is being stabilized:

1. `namespace.js`
2. `state.js`
3. `vm.js`
4. `coords.js`
5. `drawable.js`
6. `math.js`
7. `selectionBox.js`
8. `transformOps.js`
9. `snapshotDrag.js`
10. `resize.js`
11. `rotate.js`
12. `alpha.js`
13. `flip.js`
14. `skew.js`
15. `legacyBridge.js`
16. `main.js`

Current browser-safe cutover:

- Keep `TransformBoxTool.js` installed.
- Install/load the Transfork modules after it.
- Snapshot drag is the active migrated behavior.
- Other modules are prepared owners for the next cutover step.
