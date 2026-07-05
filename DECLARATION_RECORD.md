# Declaration Record

## Transfork Sprite Snapshot Drag Patch

Name:
transforkSnapshotDragState260705_q8n4vz

Type:
Module state

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Stores the active Transfork sprite snapshot drag session, including original sprite state, snapshot DOM element, target, drawable, bounds, mouse start, and final position.

Status:
Active

Notes:
Created for snapshot-based sprite dragging so the visible sprite does not chase the transform box during drag.

---

Name:
transforkGetVM260705_k4vpmn

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Returns the active Scratch VM reference used by the Transfork snapshot drag patch.

Status:
Active

Notes:
Local helper for the snapshot drag patch.

---

Name:
transforkGetStageCanvas260705_m2gh7x

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Returns the active stage canvas used for snapshot capture and coordinate conversion.

Status:
Active

Notes:
Local helper for the snapshot drag patch.

---

Name:
transforkScratchToScreen260705_t7wj2c

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Converts Scratch stage coordinates to browser screen coordinates.

Status:
Active

Notes:
Matches the existing TransformBoxTool.js coordinate conversion behavior.

---

Name:
transforkScreenDeltaToScratch260705_b6r9sd

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Converts browser drag delta to Scratch stage delta.

Status:
Active

Notes:
Used to commit the final snapshot drag position to the real sprite.

---

Name:
transforkIsTransformBoxVisible260705_p8lm2q

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Checks whether the Transfork transform box is currently visible before intercepting sprite drag.

Status:
Active

Notes:
Prevents the patch from affecting normal Scratch dragging when Transfork is inactive.

---

Name:
transforkGetBoundsScreenRect260705_z5mdxa

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Converts drawable AABB bounds into a browser screen rectangle for snapshot placement.

Status:
Active

Notes:
Used only at drag start; mousemove does not use getAABB as a visual source.

---

Name:
transforkCreateSnapshot260705_h9c4nr

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Creates the temporary DOM snapshot overlay from the current stage canvas.

Status:
Active

Notes:
The snapshot is removed on release or cancel.

---

Name:
transforkSetDrawableVisible260705_vx3pqa

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Hides or restores the real Scratch drawable while snapshot drag is active.

Status:
Active

Notes:
Uses renderer.updateDrawableVisible when available, with _visible fallback.

---

Name:
transforkMoveSnapshotDrag260705_r4k9bx

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Moves the snapshot DOM element and transform box from the same mouse delta state.

Status:
Active

Notes:
Keeps snapshot and transform box visually locked together.

---

Name:
transforkHoldBoxWithSnapshot260705_w3np7c

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Keeps the transform box aligned to the snapshot while the original Transfork animation loop is active.

Status:
Active

Notes:
Runs only during active snapshot drag.

---

Name:
transforkStartSnapshotDrag260705_f2ks8m

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Starts a snapshot drag session, captures original sprite state, creates the snapshot, and hides the real drawable.

Status:
Active

Notes:
Intercepts stage sprite drag and transform-box move-handle drag.

---

Name:
transforkFinishSnapshotDrag260705_n1db7s

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Commits or cancels the snapshot drag, restores drawable visibility, removes the snapshot, and clears state.

Status:
Active

Notes:
Commit happens on mouseup. Cancel happens on Escape or window blur.
