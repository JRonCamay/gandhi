# Sequenced Transform Factory Line

Status: Active architecture direction
Project: Transfork

## Purpose

Transfork transform tools must not behave like independent event bodies. Preview, Scratch renderer updates, measurement, compensation, and cleanup must run through one controlled sequence.

The goal is to prevent:

- Overlapping handlers
- Stale renderer measurements
- Sprite jumps after commit
- Preview stutter from heavy mousemove work
- Confusing ownership between resize, rotate, drag, and future transform tools

## Core Rule

One sequencer owns time.
Workers own behavior.

A worker function does not decide when the system is ready. It only runs when the active sequence ID matches its stage.

Example:

```js
function measureFinalCenter() {
    if (!sequence.is(MAIN.MEASURE_FINAL_CENTER)) return;
    // measure only at the correct stage
}
```

## Two Lanes

The transform system uses two sequence lanes.

### Main Sequence

The main sequence controls lifecycle stages that span time and async operations.

Stages:

```text
0  IDLE
1  WAIT_START_STABLE
2  CAPTURE_SNAPSHOT
3  HIDE_REAL_SPRITE
4  ENTER_PREVIEW
5  PAUSE_FOR_FRAME_LOOP
6  STOP_FRAME_LOOP
7  APPLY_FINAL_TRANSFORM
8  WAIT_COMMIT_STABLE
9  MEASURE_FINAL_CENTER
10 COMPENSATE_FINAL_CENTER
11 WAIT_COMPENSATE_STABLE
12 RESTORE_REAL_SPRITE
13 REMOVE_SNAPSHOT
```

### Frame Sequence

The frame sequence controls one preview frame. Mousemove stores only the latest input. requestAnimationFrame owns preview rendering.

Stages:

```text
100 IDLE
101 READ_INPUT
102 COMPUTE_PREVIEW
103 DRAW_SNAPSHOT
104 DRAW_BOX
```

## Start Pipeline

```text
mousedown
-> WAIT_START_STABLE
-> CAPTURE_SNAPSHOT
-> HIDE_REAL_SPRITE
-> ENTER_PREVIEW
-> PAUSE_FOR_FRAME_LOOP
```

At this point, the main sequence pauses and the frame sequence owns preview updates.

## Preview Pipeline

```text
mousemove
-> store latest input only

requestAnimationFrame
-> READ_INPUT
-> COMPUTE_PREVIEW
-> DRAW_SNAPSHOT
-> DRAW_BOX
```

Preview does not mutate the real Scratch sprite. It only updates the snapshot and transform box.

## Commit Pipeline

```text
mouseup
-> STOP_FRAME_LOOP
-> APPLY_FINAL_TRANSFORM
-> WAIT_COMMIT_STABLE
-> MEASURE_FINAL_CENTER
-> COMPENSATE_FINAL_CENTER
-> WAIT_COMPENSATE_STABLE
-> RESTORE_REAL_SPRITE
-> REMOVE_SNAPSHOT
-> IDLE
```

## Scratch Stable Rule

Never measure or swap back to the real sprite until Scratch has finished updating the drawable.

The stable wait currently uses a double requestAnimationFrame:

```js
function waitForScratchStable() {
    const vm = getVM();
    vm?.runtime?.requestRedraw?.();
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}
```

## Why This Architecture Exists

Scratch renderer updates are not perfectly synchronous with tool code. A call like setDirection() can update the target immediately, while the visual drawable and extracted pixel bounds may become reliable only after the renderer frame completes.

Therefore, final compensation must happen after Scratch has produced stable drawable bounds.

## Reusable Pattern

This pattern applies to other projects that have:

- Preview state separate from real state
- Mousemove stutter
- Async DOM/canvas/renderer updates
- Multiple handlers fighting over one output
- Final commit jumps

Use a main lifecycle sequence plus a frame sequence instead of letting handlers independently mutate state.

## Current Implementation Owner

Current file:

```text
Transfork/snapshotToolsPixel.js
```

Current loader:

```text
Transfork/TransforkLoader.user.js
```

`resize.js` and `rotate.js` are disabled in the loader so `snapshotToolsPixel.js` can act as the single resize/rotate owner during testing.

## Logging Rule

Do not copy this into SUCCESS_LOGS until the implementation is confirmed successful by testing. After confirmation, create a success log that references this architecture document.
