window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const snapshotDragState260705_SDG9X2 = {
        active: false,
        target: null,
        drawable: null,
        snapshot: null,
        canvas: null,
        startMouseX: 0,
        startMouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        startX: 0,
        startY: 0,
        finalX: 0,
        finalY: 0,
        startDirection: 90,
        startSize: 100,
        startScale: null,
        startVisible: true,
        startScreenRect: null,
        frame: 0,
        useRealSprite: false
    };

    function getModules260705_GM4P1R() {
        return {
            vm: api.vm,
            coords: api.coords,
            selectionBox: api.selectionBox
        };
    }

    function imageDataLooksUsable260705_IU6Q4P(imageData) {
        if (!imageData || !imageData.data || !imageData.data.length) return false;

        const data = imageData.data;
        let visible = 0;
        let nonBlack = 0;

        for (let i = 0; i < data.length; i += 16) {
            const alpha = data[i + 3];
            if (!alpha) continue;

            visible++;
            if (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8) {
                nonBlack++;
            }
        }

        return visible > 0 && nonBlack > 0;
    }

    function canvasFromImageData260705_CI5W8N(imageData) {
        if (!imageDataLooksUsable260705_IU6Q4P(imageData)) return null;

        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext("2d");
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    function normalizeExtractedDrawable260705_ND8Q7B(extracted) {
        if (!extracted) return null;

        if (typeof ImageData !== "undefined" && extracted instanceof ImageData) {
            return canvasFromImageData260705_CI5W8N(extracted);
        }

        if (extracted instanceof HTMLCanvasElement) {
            return extracted.width && extracted.height ? extracted : null;
        }

        if (typeof ImageBitmap !== "undefined" && extracted instanceof ImageBitmap) {
            const canvas = document.createElement("canvas");
            canvas.width = extracted.width;
            canvas.height = extracted.height;
            canvas.getContext("2d").drawImage(extracted, 0, 0);
            return canvas;
        }

        if (extracted.imageData) {
            return normalizeExtractedDrawable260705_ND8Q7B(extracted.imageData);
        }

        if (extracted.data && extracted.width && extracted.height) {
            return canvasFromImageData260705_CI5W8N(
                new ImageData(
                    new Uint8ClampedArray(extracted.data),
                    extracted.width,
                    extracted.height
                )
            );
        }

        return null;
    }

    function extractDrawableCanvas260705_ED9M2R(renderer, drawableID) {
        if (!renderer) return null;

        try {
            if (typeof renderer.extractDrawableScreenSpace === "function") {
                const canvas = normalizeExtractedDrawable260705_ND8Q7B(
                    renderer.extractDrawableScreenSpace(drawableID)
                );
                if (canvas) return canvas;
            }
        }
        catch (error) {
            console.warn("Transfork drawable screen snapshot failed", error);
        }

        try {
            if (typeof renderer.extractDrawable === "function") {
                const canvas = normalizeExtractedDrawable260705_ND8Q7B(
                    renderer.extractDrawable(drawableID)
                );
                if (canvas) return canvas;
            }
        }
        catch (error) {
            console.warn("Transfork drawable snapshot failed", error);
        }

        return null;
    }

    function createSnapshot260705_CS8A7N(renderer, target, screenRect) {
        if (!target) return null;

        const source = extractDrawableCanvas260705_ED9M2R(
            renderer,
            target.drawableID
        );

        if (!source) return null;

        const snapshot = document.createElement("canvas");
        snapshot.width = source.width;
        snapshot.height = source.height;
        const ctx = snapshot.getContext("2d");
        ctx.drawImage(source, 0, 0);

        Object.assign(snapshot.style, {
            position: "fixed",
            left: screenRect.left + "px",
            top: screenRect.top + "px",
            width: screenRect.width + "px",
            height: screenRect.height + "px",
            pointerEvents: "none",
            zIndex: "9998",
            boxSizing: "border-box",
            userSelect: "none"
        });

        document.body.appendChild(snapshot);
        return snapshot;
    }

    function setDrawableVisible260705_DV2M6F(vm, target, visible) {
        if (!target) return;

        const renderer = vm.runtime.renderer;

        if (typeof renderer.updateDrawableVisible === "function") {
            renderer.updateDrawableVisible(target.drawableID, visible);
        }
        else {
            const drawable = renderer._allDrawables[target.drawableID];
            if (drawable) drawable._visible = visible;
        }

        if (typeof target.emitVisualChange === "function") {
            target.emitVisualChange();
        }

        if (typeof vm.runtime.requestRedraw === "function") {
            vm.runtime.requestRedraw();
        }
    }

    function move260705_MV7C3D(clientX, clientY) {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        const modules = getModules260705_GM4P1R();
        const vm = modules.vm.getVM();
        if (!vm) return;

        const dx = clientX - state.startMouseX;
        const dy = clientY - state.startMouseY;
        const scratchDelta = modules.coords.screenDeltaToScratch(
            dx,
            dy,
            state.canvas,
            vm
        );

        state.finalX = state.startX + scratchDelta.x;
        state.finalY = state.startY + scratchDelta.y;

        if (state.useRealSprite && state.target) {
            state.target.setXY(state.finalX, state.finalY);
            modules.vm.requestRedraw(state.target);
        }

        if (state.snapshot) {
            state.snapshot.style.left = state.startScreenRect.left + dx + "px";
            state.snapshot.style.top = state.startScreenRect.top + dy + "px";
        }

        modules.selectionBox.moveFromStart(state.startScreenRect, dx, dy);
    }

    function holdBox260705_HB4W8S() {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        move260705_MV7C3D(state.lastMouseX, state.lastMouseY);
        state.frame = requestAnimationFrame(holdBox260705_HB4W8S);
    }

    function pickTarget260705_PT6N1B(event, vm, canvas) {
        const rect = canvas.getBoundingClientRect();
        const drawableID = vm.runtime.renderer.pick(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        if (drawableID < 0) return null;

        return api.vm.getTargetByDrawableID(drawableID);
    }

    function isBlockedBoxTarget260705_BT7N4C(target) {
        if (!target || !target.closest) return false;

        return !!target.closest(
            "button,input,textarea,select,a,[contenteditable='true']"
        );
    }

    function isBoxMoveStart260705_BM5K9R(target) {
        if (!target) return false;
        if (isBlockedBoxTarget260705_BT7N4C(target)) return false;

        const cursor = getComputedStyle(target).cursor;
        if (cursor === "move") return true;
        if (String(target.textContent || "").trim() === "✥") return true;
        if (cursor && cursor.includes("resize")) return false;
        if (cursor === "grab" || cursor === "grabbing") return false;
        if (cursor === "crosshair") return false;

        return cursor === "auto" || cursor === "default" || cursor === "pointer";
    }

    function start260705_ST2K7Q(event, targetOverride) {
        const modules = getModules260705_GM4P1R();
        if (!modules.vm || !modules.coords || !modules.selectionBox) return false;
        if (!modules.selectionBox.isVisible()) return false;

        const vm = modules.vm.getVM();
        if (!vm || !vm.runtime || !vm.runtime.renderer) return false;

        const canvas = modules.coords.getStageCanvas();
        if (!canvas) return false;

        const target = targetOverride || pickTarget260705_PT6N1B(event, vm, canvas);
        if (!target || target.isStage) return false;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable || typeof drawable.getAABB !== "function") return false;

        const bounds = drawable.getAABB();
        const screenRect = modules.coords.boundsToScreenRect(bounds, canvas, vm);
        const snapshot = createSnapshot260705_CS8A7N(vm.runtime.renderer, target, screenRect);
        const state = snapshotDragState260705_SDG9X2;

        state.active = true;
        state.target = target;
        state.drawable = drawable;
        state.snapshot = snapshot;
        state.canvas = canvas;
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
        state.startScreenRect = screenRect;
        state.useRealSprite = !snapshot;

        modules.vm.setEditingTarget(target);

        if (snapshot) {
            setDrawableVisible260705_DV2M6F(vm, target, false);
        }
        else {
            setDrawableVisible260705_DV2M6F(vm, target, state.startVisible);
            console.warn("Transfork snapshot unavailable; using real sprite drag fallback.");
        }

        move260705_MV7C3D(event.clientX, event.clientY);
        holdBox260705_HB4W8S();

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function finish260705_FN5B8Y(commit) {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        const modules = getModules260705_GM4P1R();
        const vm = modules.vm.getVM();
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

                setDrawableVisible260705_DV2M6F(vm, target, state.startVisible);
                modules.vm.requestRedraw(target);
            }
        }
        finally {
            if (state.snapshot) state.snapshot.remove();

            state.active = false;
            state.target = null;
            state.drawable = null;
            state.snapshot = null;
            state.canvas = null;
            state.startScale = null;
            state.startScreenRect = null;
            state.frame = 0;
            state.useRealSprite = false;
        }
    }

    function bind260705_BD9V2Q() {
        window.addEventListener(
            "mousedown",
            event => {
                if (event.button !== 0) return;

                const box = api.selectionBox.getBox();
                const insideBox = box && box.contains(event.target);

                if (insideBox) {
                    if (!isBoxMoveStart260705_BM5K9R(event.target)) return;

                    start260705_ST2K7Q(event, api.vm.getVM()?.editingTarget);
                    return;
                }

                start260705_ST2K7Q(event, null);
            },
            true
        );

        window.addEventListener(
            "mousemove",
            event => {
                const state = snapshotDragState260705_SDG9X2;
                if (!state.active) return;

                state.lastMouseX = event.clientX;
                state.lastMouseY = event.clientY;
                move260705_MV7C3D(event.clientX, event.clientY);

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            true
        );

        window.addEventListener(
            "mouseup",
            event => {
                if (!snapshotDragState260705_SDG9X2.active) return;

                move260705_MV7C3D(event.clientX, event.clientY);
                finish260705_FN5B8Y(true);

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
                    !snapshotDragState260705_SDG9X2.active
                ) {
                    return;
                }

                finish260705_FN5B8Y(false);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            true
        );

        window.addEventListener(
            "blur",
            () => finish260705_FN5B8Y(false),
            true
        );
    }

    api.registerModule260705_NS8Q2M("snapshotDrag", {
        state: snapshotDragState260705_SDG9X2,
        bind: bind260705_BD9V2Q,
        start: start260705_ST2K7Q,
        finish: finish260705_FN5B8Y
    });
})();
