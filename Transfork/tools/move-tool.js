/*
Transfork/tools/move-tool.js
Move interaction module for Transfork.

Scope:
- Owns move-drag calculations only.
- No DOM creation.
- No direct overlay rendering.
- Preserves legacy target.setXY move behavior.
*/

(function () {
    "use strict";

    window.Transfork = window.Transfork || {};
    window.Transfork.tools = window.Transfork.tools || {};

    function makeState() {
        return {
            active: false,
            source: "",
            target: null,
            canvas: null,
            dragging: false,
            potentialStageDrag: false,
            stageDraggingSprite: false,
            stageSpriteDrag: false,
            dragStartX: 0,
            dragStartY: 0,
            spriteStartX: 0,
            spriteStartY: 0,
            stageDragStartX: 0,
            stageDragStartY: 0,
            overlayDragDX: 0,
            overlayDragDY: 0,
            overlayStartLeft: 0,
            overlayStartTop: 0,
            lastX: null,
            lastY: null
        };
    }

    let state = makeState();

    function getOverlay() {
        return document.getElementById("gandi-transform-box");
    }

    function getStageSize() {
        return window.vm.runtime.renderer.getNativeSize();
    }

    function begin(event, options) {
        const target = options && options.target;
        const canvas = options && options.canvas;
        const source = options && options.source;

        if (!target || !canvas) return false;

        const overlay = getOverlay();

        state.active = true;
        state.source = source || "";
        state.target = target;
        state.canvas = canvas;
        state.dragStartX = event.clientX;
        state.dragStartY = event.clientY;
        state.stageDragStartX = event.clientX;
        state.stageDragStartY = event.clientY;
        state.spriteStartX = target.x;
        state.spriteStartY = target.y;
        state.overlayStartLeft = overlay ? parseFloat(overlay.style.left) || 0 : 0;
        state.overlayStartTop = overlay ? parseFloat(overlay.style.top) || 0 : 0;
        state.overlayDragDX = 0;
        state.overlayDragDY = 0;
        state.lastX = target.x;
        state.lastY = target.y;

        state.dragging = source === "move-handle";
        state.potentialStageDrag = source === "stage-drag";
        state.stageDraggingSprite = false;
        state.stageSpriteDrag = false;

        return true;
    }

    function update(event, options) {
        const findSnapPosition =
            options &&
            options.findSnapPosition;

        if (
            !state.active ||
            typeof findSnapPosition !== "function" ||
            !state.target ||
            !state.canvas
        ) {
            return false;
        }

        if (
            state.potentialStageDrag &&
            !state.stageDraggingSprite
        ) {
            const thresholdX =
                Math.abs(
                    event.clientX -
                    state.stageDragStartX
                );

            const thresholdY =
                Math.abs(
                    event.clientY -
                    state.stageDragStartY
                );

            if (
                thresholdX > 5 ||
                thresholdY > 5
            ) {
                state.stageDraggingSprite = true;
                state.stageSpriteDrag = true;
                state.spriteStartX = state.target.x;
                state.spriteStartY = state.target.y;
                state.dragStartX = state.stageDragStartX;
                state.dragStartY = state.stageDragStartY;
            }
        }

        if (
            state.stageSpriteDrag &&
            state.target
        ) {
            updateTargetPosition(
                event,
                state.target,
                "GANDHI DIRECT DRAG SNAP PATH",
                findSnapPosition
            );
            return true;
        }

        if (state.dragging) {
            updateTargetPosition(
                event,
                state.target,
                "GANDHI MOVE HANDLE SNAP PATH",
                findSnapPosition
            );
            return true;
        }

        return state.potentialStageDrag;
    }

    function updateTargetPosition(
        event,
        target,
        logLabel,
        findSnapPosition
    ) {
        const rect =
            state.canvas.getBoundingClientRect();

        const [stageWidth, stageHeight] =
            getStageSize();

        const dx =
            (
                event.clientX -
                state.dragStartX
            ) /
            rect.width *
            stageWidth;

        const dy =
            (
                event.clientY -
                state.dragStartY
            ) /
            rect.height *
            stageHeight;

        console.log(
            logLabel,
            {
                target: target && target.sprite && target.sprite.name,
                x: state.spriteStartX + dx,
                y: state.spriteStartY - dy
            }
        );

        const snapPosition =
            findSnapPosition(
                target,
                state.spriteStartX + dx,
                state.spriteStartY - dy
            );

        target.setXY(
            snapPosition.x,
            snapPosition.y
        );

        state.lastX = snapPosition.x;
        state.lastY = snapPosition.y;
    }

    function commit() {
        const result =
            state.active && state.target
                ? {
                    target: state.target,
                    x: state.lastX,
                    y: state.lastY
                }
                : null;

        reset();
        return result;
    }

    function cancel() {
        if (!state.active || !state.target) return false;

        state.target.setXY(
            state.spriteStartX,
            state.spriteStartY
        );

        reset();
        return true;
    }

    function reset() {
        state = makeState();
    }

    function isActive(target) {
        if (!state.active) return false;
        if (!target) {
            return (
                state.dragging ||
                state.potentialStageDrag ||
                state.stageSpriteDrag
            );
        }

        return state.target === target || state.target?.id === target.id;
    }

    function getSnapshot() {
        return {
            active: state.active,
            target: state.target,
            source: state.source,
            startMouseX: state.dragStartX,
            startMouseY: state.dragStartY,
            startX: state.spriteStartX,
            startY: state.spriteStartY,
            lastX: state.lastX,
            lastY: state.lastY
        };
    }

    function dispose() {
        cancel();
        reset();
    }

    window.Transfork.tools.moveTool = {
        begin,
        update,
        commit,
        cancel,
        reset,
        isActive,
        getSnapshot,
        dispose
    };
})();
