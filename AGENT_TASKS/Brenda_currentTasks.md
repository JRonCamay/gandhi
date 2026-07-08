Objective:
Implement revised Move Button drag controls box inside TransforkNew only.

Constraints:
- Work only under TransforkNew/.
- Mirror loader only to userscripts/TransforkNew_Loader.js because it is the TransforkNew userscript entry.
- MOVE button is draggable.
- Bounding box follows MOVE button delta.
- Sprite must not move.
- No target.setXY().
- No snapshot, resize, rotate, sprite commit, or direct mousemove DOM update.
- Keep modular folder-per-function structure.

Files:
- TransforkNew/...
- userscripts/TransforkNew_Loader.js mirror only.

Pending subtasks:
1. Add state/draw/preview/drag modules for bounding box and move button.
2. Update loader order.
3. Verify no setXY was introduced.
4. Commit and push.

Engineering decisions:
- Keep existing TransforkNew architecture.
- Add new requested subfolders without modifying old Transfork/.
- Mouse events owned by MOVEBUTTON/DRAG.
- Box preview owned by BOUNDINGBOX/PREVIEW.

Stopping point:
Implementation in progress.

Questions:
None.

Timestamp:
2026-07-08 Asia/Manila