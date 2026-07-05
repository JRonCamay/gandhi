// ==UserScript==
// @name         Gandhi Transfork Sprite Snapshot Drag Patch
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Snapshot-based Transfork sprite dragging to prevent visible chase lag
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const transforkSnapshotDragState260705_q8n4vz = {
        active: false,
        target: null,
        drawable: null,
        snapshot: null,
        box: null,
        canvas: null,
        canvasRect: null,
        startMouseX: 0,
        startMouseY: 0,
        startX: 0,
        startY: 0,
        startDirection: 90,
        startSize: 100,
        startScale: null,
        startVisible: true,
        startBounds: null,
        startScreenLeft: 0,
        startScreenTop: 0,
        startScreenWidth: 0,
        startScreenHeight: 0,
        finalX: 0,
        finalY: 0,
        frame: 0
    };

    function transforkGetVM260705_k4vpmn() {
        return window.vm || window.Scratch?.vm || null;
    }

    function transforkGetStageCanvas260705_m2gh7x() {
        const canvases = document.querySelectorAll("canvas");
        return canvases[0] || null;
    }

    function transforkScratchToScreen260705_t7wj2c(x, y, canvas, vm) {
        const size = vm.runtime.renderer.getNativeSize();
        const rect = canvas.getBoundingClientRect();

        return {
            x: rect.left + ((x + size[0] / 2) / size[0]) * rect.width,
            y: rect.top + ((size[1] / 2 - y) / size[1]) * rect.height
        };
    }

    function transforkScreenDeltaToScratch260705_b6r9sd(dx, dy, canvas, vm) {
        const rect = canvas.getBoundingClientRect();
        const size = vm.runtime.renderer.getNativeSize();

        return {
            x: dx / rect.width * size[0],
            y: -dy / rect.height * size[1]
        };
    }

    function transforkIsTransformBoxVisible260705_p8lm2q() {
        const box = document.querySelector("#gandi-transform-box");
        if (!box) return false;

        const style = getComputedStyle(box);
        return style.display !== "none" && style.visibility !== "hidden";
    }

    function transforkGetBoundsScreenRect260705_z5mdxa(bounds, canvas, vm) {
        const tl = transforkScratchToScreen260705_t7wj2c(
            bounds.left,
            bounds.top,
            canvas,
            vm
        );
        const br = transforkScratchToScreen260705_t7wj2c(
            bounds.right,
            bounds.bottom,
            canvas,
            vm
        );

        return {
            left: tl.x,
            top: tl.y,
            width: br.x - tl.x,
            height: br.y - tl.y
        };
    }

    function transforkCreateSnapshot260705_h9c4nr(canvas, screenRect) {
        const canvasRect = canvas.getBoundingClientRect();
        const snapshot = document.createElement("div");

        Object.assign(snapshot.style, {
            position: "fixed",
            left: screenRect.left + "px",
            top: screenRect.top + "px",
            width: screenRect.width + "px",
            height: screenRect.height + "px",
            backgroundImage: "url(" + canvas.toDataURL("image/png") + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: canvasRect.width + "px " + canvasRect.height + "px",
            backgroundPosition:
                "-" + (screenRect.left - canvasRect.left) + "px " +
                "-" + (screenRect.top - canvasRect.top) + "px",
            pointerEvents: "none",
            zIndex: "9998",
            boxSizing: "border-box",
            userSelect: "none"
        });

        document.body.appendChild(snapshot);
        return snapshot;
    }

    function transforkSetDrawableVisible260705_vx3pqa(vm, target, visible) {
        if (!target) return;

        const renderer = vm.runtime.renderer;

        if (typeof renderer.updateDrawableVisible === "function") {
            renderer.updateDrawableVisible(target.drawableID, visible);
        }
        else {
            const drawable = renderer._allDrawables[target.drawableID];
            if (drawable) drawable._visible = visible;
        }

        target.emitVisualChange();
        vm.runtime.requestRedraw();
    }

    function transforkMoveSnapshotDrag260705_r4k9bx(clientX, clientY) {
        const state = transforkSnapshotDragState260705_q8n4vz;
        if (!state.active) return;

        const dx = clientX - state.startMouseX;
        const dy = clientY - state.startMouseY;
        const scratchDelta = transforkScreenDeltaToScratch260705_b6r9sd(
            dx,
            dy,
            state.canvas,
            transforkGetVM260705_k4vpmn()
        );

        state.finalX = state.startX + scratchDelta.x;
        state.finalY = state.startY + scratchDelta.y;

        const left = state.startScreenLeft + dx;
        const top = state.startScreenTop + dy;

        if (state.snapshot) {
            state.snapshot.style.left = left + "px";
            state.snapshot.style.top = top + "px";
        }

        if (state.box) {
            state.box.style.display = "block";
            state.box.style.left = left + "px";
            state.box.style.top = top + "px";
            state.box.style.width = state.startScreenWidth + "px";
            state.box.style.height = state.startScreenHeight + "px";
        }
    }

    function transforkHoldBoxWithSnapshot260705_w3np7c() {
        const state = transforkSnapshotDragState260705_q8n4vz;
        if (!state.active) return;

        transforkMoveSnapshotDrag260705_r4k9bx(
            state.lastMouseX || state.startMouseX,
            state.lastMouseY || state.startMouseY
        );

        state.frame = requestAnimationFrame(
            transforkHoldBoxWithSnapshot260705_w3np7c
        );
    }

    function transforkStartSnapshotDrag260705_f2ks8m(event, targetOverride) {
        const vm = transforkGetVM260705_k4vpmn();
        if (!vm || !vm.runtime || !vm.runtime.renderer) return false;
        if (!transforkIsTransformBoxVisible260705_p8lm2q()) return false;

        const canvas = transforkGetStageCanvas260705_m2gh7x();
        if (!canvas) return false;

        const rect = canvas.getBoundingClientRect();
        const renderer = vm.runtime.renderer;
        const target = targetOverride || (() => {
            const drawableID = renderer.pick(
                event.clientX - rect.left,
                event.clientY - rect.top
            );

            if (drawableID < 0) return null;

            return vm.runtime.targets.find(
                item => item && item.drawableID === drawableID && !item.isStage
            );
        })();

        if (!target || target.isStage) return false;

        const drawable = renderer._allDrawables[target.drawableID];
        if (!drawable || typeof drawable.getAABB !== "function") return false;

        const bounds = drawable.getAABB();
        const screenRect = transforkGetBoundsScreenRect260705_z5mdxa(
            bounds,
            canvas,
            vm
        );

        const snapshot = transforkCreateSnapshot260705_h9c4nr(
            canvas,
            screenRect
        );

        const state = transforkSnapshotDragState260705_q8n4vz;
        state.active = true;
        state.target = target;
        state.drawable = drawable;
        state.snapshot = snapshot;
        state.box = document.querySelector("#gandi-transform-box");
        state.canvas = canvas;
        state.canvasRect = rect;
        state.startMouseX = event.clientX;
        state.startMouseY = event.clientY;
        state.lastMouseX = event.clientX;
        state.lastMouseY = event.clientY;
        state.startX = target.x;
        state.startY = target.y;
        state.finalX = target.x;
        state.finalY = target.y;
        state.startDirection = target.direction;
        state.startSize = target.size;
        state.startScale = drawable.scale ? drawable.scale.slice() : null;
        state.startVisible = drawable._visible !== false;
        state.startBounds = bounds;
        state.startScreenLeft = screenRect.left;
        state.startScreenTop = screenRect.top;
        state.startScreenWidth = screenRect.width;
        state.startScreenHeight = screenRect.height;

        if (typeof vm.setEditingTarget === "function") {
            vm.setEditingTarget(target.id);
        }

        transforkSetDrawableVisible260705_vx3pqa(vm, target, false);
        transforkMoveSnapshotDrag260705_r4k9bx(event.clientX, event.clientY);
        transforkHoldBoxWithSnapshot260705_w3np7c();

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function transforkFinishSnapshotDrag260705_n1db7s(commit) {
        const state = transforkSnapshotDragState260705_q8n4vz;
        if (!state.active) return;

        const vm = transforkGetVM260705_k4vpmn();
        const target = state.target;

        cancelAnimationFrame(state.frame);

        try {
            if (vm && target) {
                if (commit) {
                    target.setXY(state.finalX, state.finalY);
                }
                else {
                    target.setXY(state.startX, state.startY);
                    target.setDirection(state.startDirection);
                    target.setSize(state.startSize);

                    if (state.startScale && state.drawable) {
                        state.drawable.updateScale(state.startScale);
                    }
                }

                transforkSetDrawableVisible260705_vx3pqa(
                    vm,
                    target,
                    state.startVisible
                );

                target.emitVisualChange();
                vm.runtime.requestRedraw();
            }
        }
        finally {
            if (state.snapshot) state.snapshot.remove();

            state.active = false;
            state.target = null;
            state.drawable = null;
            state.snapshot = null;
            state.box = null;
            state.canvas = null;
            state.canvasRect = null;
            state.startScale = null;
            state.startBounds = null;
            state.frame = 0;
        }
    }

    window.addEventListener(
        "mousedown",
        event => {
            if (event.button !== 0) return;

            const box = document.querySelector("#gandi-transform-box");
            const insideBox = box && box.contains(event.target);

            if (insideBox) {
                const cursor = getComputedStyle(event.target).cursor;
                const isMoveHandle =
                    cursor === "move" ||
                    event.target.textContent === "✥";

                if (!isMoveHandle) return;

                transforkStartSnapshotDrag260705_f2ks8m(
                    event,
                    transforkGetVM260705_k4vpmn()?.editingTarget
                );
                return;
            }

            transforkStartSnapshotDrag260705_f2ks8m(event, null);
        },
        true
    );

    window.addEventListener(
        "mousemove",
        event => {
            const state = transforkSnapshotDragState260705_q8n4vz;
            if (!state.active) return;

            state.lastMouseX = event.clientX;
            state.lastMouseY = event.clientY;
            transforkMoveSnapshotDrag260705_r4k9bx(
                event.clientX,
                event.clientY
            );

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        true
    );

    window.addEventListener(
        "mouseup",
        event => {
            if (!transforkSnapshotDragState260705_q8n4vz.active) return;

            transforkMoveSnapshotDrag260705_r4k9bx(
                event.clientX,
                event.clientY
            );
            transforkFinishSnapshotDrag260705_n1db7s(true);

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        true
    );

    window.addEventListener(
        "keydown",
        event => {
            if (
                event.key !== "Escape" ||
                !transforkSnapshotDragState260705_q8n4vz.active
            ) {
                return;
            }

            transforkFinishSnapshotDrag260705_n1db7s(false);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        true
    );

    window.addEventListener(
        "blur",
        () => transforkFinishSnapshotDrag260705_n1db7s(false),
        true
    );
})();
