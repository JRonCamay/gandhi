window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const snapshotDragState260705_SDG9X2 = {
        active: false,
        ready: false,
        target: null,
        drawable: null,
        snapshot: null,
        canvas: null,
        startMouseX: 0,
        startMouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        lastShiftKey: false,
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
        useRealSprite: false,
        snapBoxes: []
    };

    function getModules260705_GM4P1R() {
        return {
            vm: api.vm,
            coords: api.coords,
            selectionBox: api.selectionBox
        };
    }

    function getCurrentCostume260705_CC8N2J(target) {
        if (!target || !target.sprite || !target.sprite.costumes) return null;
        return target.sprite.costumes[target.currentCostume] || null;
    }

    function getCostumeSource260705_CS4Q7P(costume) {
        if (!costume || !costume.asset) return "";

        if (typeof costume.asset.encodeDataURI === "function") {
            return costume.asset.encodeDataURI();
        }

        if (typeof costume.asset.decodeText === "function") {
            return "data:image/svg+xml;base64," + btoa(costume.asset.decodeText());
        }

        return "";
    }

    function imageDataLooksUsable260705_IU6Q4P(imageData) {
        if (!imageData || !imageData.data || !imageData.data.length) return false;

        const data = imageData.data;
        let visible = 0;
        let different = 0;
        let firstR = null;
        let firstG = null;
        let firstB = null;

        for (let i = 0; i < data.length; i += 16) {
            const alpha = data[i + 3];
            if (!alpha) continue;

            visible++;

            if (firstR === null) {
                firstR = data[i];
                firstG = data[i + 1];
                firstB = data[i + 2];
            }
            else if (
                Math.abs(data[i] - firstR) > 4 ||
                Math.abs(data[i + 1] - firstG) > 4 ||
                Math.abs(data[i + 2] - firstB) > 4
            ) {
                different++;
            }
        }

        return visible > 4 && (different > 0 || visible < data.length / 32);
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
            if (!extracted.width || !extracted.height) return null;

            try {
                const ctx = extracted.getContext("2d");
                const data = ctx.getImageData(0, 0, extracted.width, extracted.height);
                return imageDataLooksUsable260705_IU6Q4P(data) ? extracted : null;
            }
            catch (_error) {
                return extracted;
            }
        }

        if (typeof ImageBitmap !== "undefined" && extracted instanceof ImageBitmap) {
            const canvas = document.createElement("canvas");
            canvas.width = extracted.width;
            canvas.height = extracted.height;
            canvas.getContext("2d").drawImage(extracted, 0, 0);
            return normalizeExtractedDrawable260705_ND8Q7B(canvas);
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

    function getNativeToScreenScale260705_NS6M8C(canvas, vm) {
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();
        if (!nativeSize || !nativeSize[0]) return 1;
        return rect.width / nativeSize[0];
    }

    function getCostumeSize260705_CZ7D4H(costume, sourceFallback) {
        const size = costume && costume.size;
        if (size && size[0] && size[1]) {
            return {
                width: size[0],
                height: size[1]
            };
        }

        if (sourceFallback && sourceFallback.width && sourceFallback.height) {
            return {
                width: sourceFallback.width,
                height: sourceFallback.height
            };
        }

        return {
            width: 1,
            height: 1
        };
    }

    function createRendererSnapshot260705_RS3K8M(renderer, target, screenRect) {
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
            userSelect: "none",
            background: "transparent"
        });

        document.body.appendChild(snapshot);
        return snapshot;
    }

    function createCostumeSnapshot260705_CS9Q2L(vm, target, drawable, canvas, screenRect) {
        const costume = getCurrentCostume260705_CC8N2J(target);
        const source = getCostumeSource260705_CS4Q7P(costume);
        if (!source) return null;

        const wrapper = document.createElement("div");
        const image = document.createElement("img");
        const stageScale = getNativeToScreenScale260705_NS6M8C(canvas, vm);
        const costumeSize = getCostumeSize260705_CZ7D4H(costume, null);
        const scale = drawable && drawable.scale ? drawable.scale : [target.size || 100, target.size || 100];
        const width = Math.max(1, costumeSize.width * Math.abs(scale[0]) / 100 * stageScale);
        const height = Math.max(1, costumeSize.height * Math.abs(scale[1]) / 100 * stageScale);
        const direction = typeof target.direction === "number" ? target.direction : 90;
        const rotate = direction - 90;
        const flipX = scale[0] < 0 ? -1 : 1;
        const flipY = scale[1] < 0 ? -1 : 1;
        const ghost = target.effects && typeof target.effects.ghost === "number" ? target.effects.ghost : 0;

        Object.assign(wrapper.style, {
            position: "fixed",
            left: screenRect.left + "px",
            top: screenRect.top + "px",
            width: screenRect.width + "px",
            height: screenRect.height + "px",
            pointerEvents: "none",
            zIndex: "9998",
            boxSizing: "border-box",
            userSelect: "none",
            overflow: "visible",
            background: "transparent",
            opacity: String(Math.max(0, Math.min(1, 1 - ghost / 100)))
        });

        Object.assign(image.style, {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: width + "px",
            height: height + "px",
            maxWidth: "none",
            maxHeight: "none",
            objectFit: "fill",
            pointerEvents: "none",
            userSelect: "none",
            transformOrigin: "50% 50%",
            transform:
                "translate(-50%, -50%) " +
                "rotate(" + rotate + "deg) " +
                "scale(" + flipX + ", " + flipY + ")"
        });

        image.draggable = false;
        image.src = source;
        wrapper.appendChild(image);
        document.body.appendChild(wrapper);
        return wrapper;
    }

    function createSnapshot260705_CS8A7N(vm, target, drawable, canvas, screenRect) {
        const rendererSnapshot = createRendererSnapshot260705_RS3K8M(
            vm.runtime.renderer,
            target,
            screenRect
        );

        if (rendererSnapshot) return rendererSnapshot;

        return createCostumeSnapshot260705_CS9Q2L(
            vm,
            target,
            drawable,
            canvas,
            screenRect
        );
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

    function offsetBounds260705_OB8M2N(bounds, dx, dy) {
        return {
            left: bounds.left + dx,
            right: bounds.right + dx,
            top: bounds.top + dy,
            bottom: bounds.bottom + dy
        };
    }

    function getSnapDistance260705_SD3H9K(vm, canvas) {
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();
        if (!rect.width) return 12;
        return 12 * (nativeSize[0] / rect.width);
    }

    function clearSnapBoxes260705_CB9Q3H() {
        const state = snapshotDragState260705_SDG9X2;
        state.snapBoxes.forEach(box => box.remove());
        state.snapBoxes = [];
    }

    function addSnapBox260705_AB4N7C(bounds, canvas, vm) {
        const modules = getModules260705_GM4P1R();
        const rect = modules.coords.boundsToScreenRect(bounds, canvas, vm);
        const box = document.createElement("div");

        Object.assign(box.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            border: "2px dashed #f59e0b",
            background: "rgba(245, 158, 11, 0.08)",
            boxSizing: "border-box",
            pointerEvents: "none",
            zIndex: "9997",
            userSelect: "none"
        });

        document.body.appendChild(box);
        snapshotDragState260705_SDG9X2.snapBoxes.push(box);
    }

    function showSnapBoxes260705_SB5F2M(boundsList, canvas, vm) {
        clearSnapBoxes260705_CB9Q3H();

        const seen = new Set();
        boundsList.forEach(bounds => {
            if (!bounds) return;
            const key = [bounds.left, bounds.right, bounds.top, bounds.bottom].join(":");
            if (seen.has(key)) return;
            seen.add(key);
            addSnapBox260705_AB4N7C(bounds, canvas, vm);
        });
    }

    function findEdgeSnapPosition260705_ES7Q2V(vm, state, desiredX, desiredY) {
        if (!state.target || !state.drawable) {
            return { x: desiredX, y: desiredY, targets: [] };
        }

        const renderer = vm.runtime.renderer;
        const currentBounds = state.drawable.getAABB();
        const bounds = offsetBounds260705_OB8M2N(
            currentBounds,
            desiredX - state.target.x,
            desiredY - state.target.y
        );
        const snapDistance = getSnapDistance260705_SD3H9K(vm, state.canvas);
        let snapX = null;
        let snapY = null;
        let snapXTarget = null;
        let snapYTarget = null;

        vm.runtime.targets.forEach(otherTarget => {
            if (
                !otherTarget ||
                otherTarget === state.target ||
                otherTarget.isStage
            ) {
                return;
            }

            const otherDrawable = renderer._allDrawables[otherTarget.drawableID];
            if (!otherDrawable || otherDrawable._visible === false) return;

            const otherBounds = otherDrawable.getAABB();

            [
                otherBounds.left - bounds.left,
                otherBounds.right - bounds.left,
                otherBounds.left - bounds.right,
                otherBounds.right - bounds.right
            ].forEach(delta => {
                if (
                    Math.abs(delta) <= snapDistance &&
                    (snapX === null || Math.abs(delta) < Math.abs(snapX))
                ) {
                    snapX = delta;
                    snapXTarget = otherBounds;
                }
            });

            [
                otherBounds.top - bounds.top,
                otherBounds.bottom - bounds.top,
                otherBounds.top - bounds.bottom,
                otherBounds.bottom - bounds.bottom
            ].forEach(delta => {
                if (
                    Math.abs(delta) <= snapDistance &&
                    (snapY === null || Math.abs(delta) < Math.abs(snapY))
                ) {
                    snapY = delta;
                    snapYTarget = otherBounds;
                }
            });
        });

        if (snapX !== null && snapY === null && snapXTarget) {
            const topDelta = snapXTarget.top - bounds.top;
            const bottomDelta = snapXTarget.bottom - bounds.bottom;

            if (Math.abs(topDelta) <= snapDistance) snapY = topDelta;
            else if (Math.abs(bottomDelta) <= snapDistance) snapY = bottomDelta;
        }

        if (snapY !== null && snapX === null && snapYTarget) {
            const leftDelta = snapYTarget.left - bounds.left;
            const rightDelta = snapYTarget.right - bounds.right;

            if (Math.abs(leftDelta) <= snapDistance) snapX = leftDelta;
            else if (Math.abs(rightDelta) <= snapDistance) snapX = rightDelta;
        }

        return {
            x: desiredX + (snapX === null ? 0 : snapX),
            y: desiredY + (snapY === null ? 0 : snapY),
            targets: [snapXTarget, snapYTarget].filter(Boolean)
        };
    }

    function scratchDeltaToScreen260705_DS7K5N(dx, dy, canvas, vm) {
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();

        return {
            x: dx / nativeSize[0] * rect.width,
            y: -dy / nativeSize[1] * rect.height
        };
    }

    function move260705_MV7C3D(clientX, clientY, shiftKey) {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        const modules = getModules260705_GM4P1R();
        const vm = modules.vm.getVM();
        if (!vm) return;

        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
        state.lastShiftKey = !!shiftKey;

        if (!state.ready) return;

        const rawDX = clientX - state.startMouseX;
        const rawDY = clientY - state.startMouseY;
        const scratchDelta = modules.coords.screenDeltaToScratch(
            rawDX,
            rawDY,
            state.canvas,
            vm
        );

        let desiredX = state.startX + scratchDelta.x;
        let desiredY = state.startY + scratchDelta.y;

        if (shiftKey) {
            const snapped = findEdgeSnapPosition260705_ES7Q2V(
                vm,
                state,
                desiredX,
                desiredY
            );

            desiredX = snapped.x;
            desiredY = snapped.y;
            showSnapBoxes260705_SB5F2M(snapped.targets, state.canvas, vm);
        }
        else {
            clearSnapBoxes260705_CB9Q3H();
        }

        state.finalX = desiredX;
        state.finalY = desiredY;

        const screenDelta = scratchDeltaToScreen260705_DS7K5N(
            state.finalX - state.startX,
            state.finalY - state.startY,
            state.canvas,
            vm
        );

        if (state.useRealSprite && state.target) {
            state.target.setXY(state.finalX, state.finalY);
            modules.vm.requestRedraw(state.target);
        }

        if (state.snapshot) {
            state.snapshot.style.left = state.startScreenRect.left + screenDelta.x + "px";
            state.snapshot.style.top = state.startScreenRect.top + screenDelta.y + "px";
        }

        modules.selectionBox.moveFromStart(
            state.startScreenRect,
            screenDelta.x,
            screenDelta.y
        );
    }

    function holdBox260705_HB4W8S() {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        move260705_MV7C3D(
            state.lastMouseX,
            state.lastMouseY,
            state.lastShiftKey
        );
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

    function activateDragAfterOriginalHidden260705_AH6N3K() {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        requestAnimationFrame(() => {
            if (!state.active) return;

            state.ready = true;
            move260705_MV7C3D(
                state.lastMouseX,
                state.lastMouseY,
                state.lastShiftKey
            );
            holdBox260705_HB4W8S();
        });
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
        const snapshot = createSnapshot260705_CS8A7N(vm, target, drawable, canvas, screenRect);
        const state = snapshotDragState260705_SDG9X2;

        state.active = true;
        state.ready = false;
        state.target = target;
        state.drawable = drawable;
        state.snapshot = snapshot;
        state.canvas = canvas;
        state.startMouseX = event.clientX;
        state.startMouseY = event.clientY;
        state.lastMouseX = event.clientX;
        state.lastMouseY = event.clientY;
        state.lastShiftKey = !!event.shiftKey;
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
            activateDragAfterOriginalHidden260705_AH6N3K();
        }
        else {
            state.ready = true;
            setDrawableVisible260705_DV2M6F(vm, target, state.startVisible);
            console.warn("Transfork snapshot unavailable; using real sprite drag fallback.");
            move260705_MV7C3D(event.clientX, event.clientY, event.shiftKey);
            holdBox260705_HB4W8S();
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function removeSnapshotAfterRedraw260705_RR9D4X(snapshot) {
        if (!snapshot) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (snapshot && snapshot.parentNode) {
                    snapshot.remove();
                }
            });
        });
    }

    function clearState260705_CL5N8M() {
        const state = snapshotDragState260705_SDG9X2;

        clearSnapBoxes260705_CB9Q3H();
        state.active = false;
        state.ready = false;
        state.target = null;
        state.drawable = null;
        state.snapshot = null;
        state.canvas = null;
        state.startScale = null;
        state.startScreenRect = null;
        state.frame = 0;
        state.useRealSprite = false;
        state.lastShiftKey = false;
    }

    function finish260705_FN5B8Y(commit) {
        const state = snapshotDragState260705_SDG9X2;
        if (!state.active) return;

        const modules = getModules260705_GM4P1R();
        const vm = modules.vm.getVM();
        const target = state.target;
        const snapshot = state.snapshot;

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
            clearState260705_CL5N8M();
            removeSnapshotAfterRedraw260705_RR9D4X(snapshot);
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

                move260705_MV7C3D(event.clientX, event.clientY, event.shiftKey);

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

                move260705_MV7C3D(event.clientX, event.clientY, event.shiftKey);
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
