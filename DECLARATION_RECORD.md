# Declaration Record

## Transfork Modular Spine

Name:
TRANSFORK_MODULE_BASE_260705_LD4P9Q

Type:
Constant

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransforkLoader.user.js

Purpose:
Stores the raw GitHub base path for Transfork module loading.

Status:
Active

Notes:
Loader-level declaration.

---

Name:
TRANSFORK_MODULES_260705_JK8M2C

Type:
Constant

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransforkLoader.user.js

Purpose:
Defines Transfork module load order.

Status:
Active

Notes:
Load order: namespace, vm, coords, selectionBox, snapshotDrag, main.

---

Name:
loadTransforkModule260705_PQ7X2R

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/TransforkLoader.user.js

Purpose:
Loads Transfork modules sequentially when using the script-loader version.

Status:
Retired

Notes:
Dynamic script loader was blocked during creation. Active loader now uses Tampermonkey @require lines.

---

Name:
registerModule260705_NS8Q2M

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/namespace.js

Purpose:
Registers Transfork modules into window.Transfork.modules and exposes them by module name.

Status:
Active

Notes:
Shared module registry for the Transfork modular spine.

---

Name:
vmModule260705_VM7K2D

Type:
Module object

Creator:
GPT-5.5 Thinking

Location:
Transfork/vm.js

Purpose:
Owns Scratch VM access helpers for Transfork modules.

Status:
Active

Notes:
Contains getVM, getRenderer, getTargetByDrawableID, setEditingTarget, and requestRedraw.

---

Name:
coordsModule260705_CD5M9A

Type:
Module object

Creator:
GPT-5.5 Thinking

Location:
Transfork/coords.js

Purpose:
Owns Transfork stage canvas lookup and coordinate conversions.

Status:
Active

Notes:
Contains getStageCanvas, scratchToScreen, screenDeltaToScratch, and boundsToScreenRect.

---

Name:
selectionBoxModule260705_SB3N8K

Type:
Module object

Creator:
GPT-5.5 Thinking

Location:
Transfork/selectionBox.js

Purpose:
Owns transform box lookup and direct placement helpers.

Status:
Active

Notes:
Uses existing #gandi-transform-box created by TransformBoxTool.js.

---

Name:
snapshotDragState260705_SDG9X2

Type:
Module state

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Stores the active Transfork snapshot drag session state.

Status:
Active

Notes:
Replaces the standalone snapshot patch state.

---

Name:
getModules260705_GM4P1R

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Returns the module dependencies used by snapshotDrag.

Status:
Active

Notes:
Keeps snapshotDrag dependency access local and simple.

---

Name:
createSnapshot260705_CS8A7N

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Creates the temporary DOM snapshot from the current stage canvas.

Status:
Active

Notes:
Used at drag start only.

---

Name:
setDrawableVisible260705_DV2M6F

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Hides/restores the real Scratch drawable during snapshot drag.

Status:
Active

Notes:
Uses renderer.updateDrawableVisible when available, with _visible fallback.

---

Name:
move260705_MV7C3D

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Moves the snapshot and transform box from the same mouse delta state.

Status:
Active

Notes:
Mousemove does not use getAABB as the visual source.

---

Name:
holdBox260705_HB4W8S

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Keeps the transform box locked to the snapshot while legacy animation refreshes.

Status:
Active

Notes:
Runs only during active snapshot drag.

---

Name:
pickTarget260705_PT6N1B

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Finds the sprite target under the mouse using renderer.pick.

Status:
Active

Notes:
Used when dragging directly from the stage.

---

Name:
start260705_ST2K7Q

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Starts snapshot drag, stores original state, creates the snapshot, and hides the real drawable.

Status:
Active

Notes:
Used for stage drag and transform move-handle drag.

---

Name:
finish260705_FN5B8Y

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Commits or cancels snapshot drag, restores drawable visibility, removes snapshot, and clears state.

Status:
Active

Notes:
Mouseup commits. Escape/window blur cancels.

---

Name:
bind260705_BD9V2Q

Type:
Function

Creator:
GPT-5.5 Thinking

Location:
Transfork/snapshotDrag.js

Purpose:
Binds snapshot drag mouse, keyboard, and blur listeners.

Status:
Active

Notes:
Called once by Transfork/main.js.

---

Name:
mainModule260705_MN4R8C

Type:
Module object

Creator:
GPT-5.5 Thinking

Location:
Transfork/main.js

Purpose:
Starts the modular Transfork runtime and binds snapshot drag.

Status:
Active

Notes:
Current first modular migration step.

---

## Retired Standalone Patch

Name:
transforkSnapshotDragState260705_q8n4vz

Type:
Module state

Creator:
GPT-5.5 Thinking

Location:
TransforkSpriteSnapshotDragPatch.js

Purpose:
Old standalone snapshot patch state.

Status:
Retired

Notes:
File removed after migration to Transfork/snapshotDrag.js.
