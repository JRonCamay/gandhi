# Brenda Current Tasks

Objective:
Finish Transfork upright pixel-bounds behavior for selected sprites and transform snapshots.

Status:
Completed repository patch and verification.

Files edited:
- Transfork/pixelBoxSync.js
- Transfork/snapshotToolsPixel.js
- Transfork/TransforkLoader.user.js

Implementation:
- `pixelBoxSync.js` now installs a screen-first pixel bounds override that scans rendered screen-space pixels before falling back to older bounds.
- The screen-space rect path is cached by target/drawable/canvas transform state to avoid repeated expensive pixel scans when nothing changed.
- `snapshotToolsPixel.js` uses the live transformed snapshot DOM bounds during active resize/rotate/scale so the upright box encloses the current transformed pixels.
- Static occluder/target snapshots continue to compute through the pixel rect path when the operation starts.
- Loader cache refreshed for `pixelBoxSync.js`.

Verification:
- Fetched `pixelBoxSync.js` after update.
- Fetched `snapshotToolsPixel.js` after update.
- Fetched `TransforkLoader.user.js` after cache refresh.

Current stopping point:
Ready for Jay to hard-refresh and browser-test upright pixel bounds during drag, rotate, resize, scale, and flip.

Questions:
None.

Timestamp:
2026-07-05 Asia/Manila
