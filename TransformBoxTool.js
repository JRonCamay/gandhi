// ==UserScript==
// @name         Gandhi Transform Box
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Transform box with sprite snapshot dragging and transform tools
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const GANDHI_TRANSFORM_BOX_VERSION = "1.2.1-dev";
    window.GANDHI_TRANSFORM_BOX_VERSION = GANDHI_TRANSFORM_BOX_VERSION;

    let vm = null;
    let transformMode = false;
    let overlay = null;
    let tooltip = null;
    let selectedTarget = null;
    let activeInteraction = null;
    let activeShearBridge = null;

    const originalSpriteDraggableMap = new Map();
    const spriteGhostMap = new Map();
    const spriteAlphaMap = new Map();

    function getStageCanvas() {
        const canvases = document.querySelectorAll("canvas");
        return canvases[0] || null;
    }

    function waitForVM() {
        const interval = setInterval(() => {
            const sprite = document.querySelector('[class*="sprite-selector"]');
            if (!sprite) return;

            const fiberKey = Object.keys(sprite).find(key => key.startsWith("__reactFiber$"));
            if (!fiberKey) return;

            let node = sprite[fiberKey];
            while (node) {
                const props = node.memoizedProps;
                if (props && props.vm) {
                    vm = props.vm;
                    window.vm = props.vm;
                    clearInterval(interval);
                    init();
                    return;
                }
                node = node.return;
            }
        }, 1000);
    }

    function setNativeSpriteDraggingEnabled(enabled) {
        if (!vm || !vm.runtime || !vm.runtime.targets) return;

        for (const target of vm.runtime.targets) {
            if (!target || target.isStage) continue;

            if (!originalSpriteDraggableMap.has(target.id)) {
                originalSpriteDraggableMap.set(target.id, target.draggable);
            }

            target.draggable = enabled
                ? originalSpriteDraggableMap.get(target.id)
                : false;
        }
    }

    function toggleTransformMode() {
        transformMode = !transformMode;
        setNativeSpriteDraggingEnabled(!transformMode);
        if (!transformMode) {
            endSnapshotInteraction(false);
            hideOverlay();
        }
    }

    window.addEventListener("keydown", event => {
        const active = document.activeElement;
        const tag = active?.tagName;
        const editable = tag === "INPUT" || tag === "TEXTAREA" || active?.isContentEditable;

        if (!editable && event.key && event.key.toLowerCase() === "r") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            toggleTransformMode();
        }
    }, true);
    function getDrawable(target) {
        if (!target || !vm || !vm.runtime || !vm.runtime.renderer) return null;
        return vm.runtime.renderer._allDrawables[target.drawableID] || null;
    }

    function normalizeDirection(deg) {
        while (deg > 180) deg -= 360;
        while (deg <= -180) deg += 360;
        return deg;
    }

    function scratchToScreen(x, y, canvas) {
        const nativeSize = vm.runtime.renderer.getNativeSize();
        const rect = canvas.getBoundingClientRect();

        return {
            x: rect.left + ((x + nativeSize[0] / 2) / nativeSize[0]) * rect.width,
            y: rect.top + ((nativeSize[1] / 2 - y) / nativeSize[1]) * rect.height
        };
    }

    function screenDeltaToScratch(dx, dy) {
        const canvas = getStageCanvas();
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();

        return {
            x: dx / rect.width * nativeSize[0],
            y: -dy / rect.height * nativeSize[1]
        };
    }

    function stageDeltaToScreen(dx, dy) {
        const canvas = getStageCanvas();
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();

        return {
            x: dx / nativeSize[0] * rect.width,
            y: -dy / nativeSize[1] * rect.height
        };
    }

    function offsetBounds(bounds, dx, dy) {
        return {
            left: bounds.left + dx,
            right: bounds.right + dx,
            top: bounds.top + dy,
            bottom: bounds.bottom + dy
        };
    }

    function getShearAdjustedBounds(bounds, drawable) {
        let shearX = 0;
        let shearY = 0;

        if (activeShearBridge && activeShearBridge.drawable === drawable) {
            shearX = activeShearBridge.shearX || 0;
            shearY = activeShearBridge.shearY || 0;
        }

        if (!shearX && !shearY) return bounds;

        const cx = (bounds.left + bounds.right) / 2;
        const cy = (bounds.top + bounds.bottom) / 2;
        const points = [
            [bounds.left, bounds.top],
            [bounds.right, bounds.top],
            [bounds.right, bounds.bottom],
            [bounds.left, bounds.bottom]
        ].map(point => {
            const x = point[0] - cx;
            const y = point[1] - cy;
            return {
                x: cx + x + y * shearX,
                y: cy + y + x * shearY
            };
        });

        return {
            left: Math.min(...points.map(point => point.x)),
            right: Math.max(...points.map(point => point.x)),
            top: Math.max(...points.map(point => point.y)),
            bottom: Math.min(...points.map(point => point.y))
        };
    }

    function getTargetScreenRect(target) {
        const canvas = getStageCanvas();
        const drawable = getDrawable(target);
        if (!canvas || !drawable) return null;

        installShearHook(drawable, target);
        const bounds = getShearAdjustedBounds(drawable.getAABB(), drawable);
        const tl = scratchToScreen(bounds.left, bounds.top, canvas);
        const br = scratchToScreen(bounds.right, bounds.bottom, canvas);

        return {
            left: tl.x,
            top: tl.y,
            width: br.x - tl.x,
            height: br.y - tl.y,
            centerX: tl.x + (br.x - tl.x) / 2,
            centerY: tl.y + (br.y - tl.y) / 2,
            bounds
        };
    }

    function findSnapPosition(target, desiredX, desiredY) {
        const renderer = vm.runtime.renderer;
        const drawable = getDrawable(target);
        if (!drawable) return { x: desiredX, y: desiredY };

        const currentBounds = drawable.getAABB();
        const bounds = offsetBounds(currentBounds, desiredX - target.x, desiredY - target.y);
        const canvas = getStageCanvas();
        const canvasRect = canvas.getBoundingClientRect();
        const nativeSize = renderer.getNativeSize();
        const snapDistance = 12 * (nativeSize[0] / canvasRect.width);

        let snapX = null;
        let snapY = null;
        let snapXTarget = null;
        let snapYTarget = null;

        vm.runtime.targets.forEach(otherTarget => {
            if (!otherTarget || otherTarget === target || otherTarget.isStage) return;
            const otherDrawable = getDrawable(otherTarget);
            if (!otherDrawable || otherDrawable._visible === false) return;

            const otherBounds = otherDrawable.getAABB();

            [
                otherBounds.left - bounds.left,
                otherBounds.right - bounds.left,
                otherBounds.left - bounds.right,
                otherBounds.right - bounds.right
            ].forEach(delta => {
                if (Math.abs(delta) <= snapDistance && (snapX === null || Math.abs(delta) < Math.abs(snapX))) {
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
                if (Math.abs(delta) <= snapDistance && (snapY === null || Math.abs(delta) < Math.abs(snapY))) {
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
            y: desiredY + (snapY === null ? 0 : snapY)
        };
    }

    function installShearHook(drawable, target) {
        if (!drawable || drawable.__gandhiShearInstalled) return;

        drawable.__gandhiShearInstalled = true;
        if (target) drawable.__gandhiTargetId = target.id;

        const oldGetUniforms = drawable.getUniforms.bind(drawable);
        drawable.getUniforms = function () {
            const uniforms = oldGetUniforms();
            const original = uniforms.u_modelMatrix;
            const m = new Float32Array(original);

            let shearX = 0;
            let shearY = 0;

            if (activeShearBridge && activeShearBridge.drawable === this) {
                shearX = activeShearBridge.shearX || 0;
                shearY = activeShearBridge.shearY || 0;
            }

            const a = m[0];
            const b = m[1];
            const c = m[4];
            const d = m[5];

            m[0] = a + c * shearY;
            m[1] = b + d * shearY;
            m[4] = c + a * shearX;
            m[5] = d + b * shearX;
            uniforms.u_modelMatrix = m;
            return uniforms;
        };
    }

    function applySpriteAlpha(value) {
        const target = vm && vm.editingTarget;
        if (!target) return;
        target.setEffect("ghost", 100 - value);
    }

    function getSpriteAlpha() {
        const target = vm && vm.editingTarget;
        if (!target) return 100;
        return 100 - (target.effects.ghost || 0);
    }

    function hideRealTarget(target) {
        if (!target) return;
        if (!spriteGhostMap.has(target.id)) {
            spriteGhostMap.set(target.id, target.effects.ghost || 0);
        }
        target.setEffect("ghost", 100);
        target.emitVisualChange();
        vm.runtime.requestRedraw();
    }

    function restoreRealTarget(target) {
        if (!target) return;
        const ghost = spriteGhostMap.has(target.id) ? spriteGhostMap.get(target.id) : 0;
        target.setEffect("ghost", ghost);
        spriteGhostMap.delete(target.id);
        target.emitVisualChange();
        vm.runtime.requestRedraw();
    }

    function createSnapshotCanvas(rect) {
        const stageCanvas = getStageCanvas();
        const stageRect = stageCanvas.getBoundingClientRect();
        const snapshot = document.createElement("canvas");
        const ratioX = stageCanvas.width / stageRect.width;
        const ratioY = stageCanvas.height / stageRect.height;

        snapshot.width = Math.max(1, Math.round(rect.width * ratioX));
        snapshot.height = Math.max(1, Math.round(rect.height * ratioY));
        snapshot.style.width = rect.width + "px";
        snapshot.style.height = rect.height + "px";

        const sx = Math.round((rect.left - stageRect.left) * ratioX);
        const sy = Math.round((rect.top - stageRect.top) * ratioY);
        const sw = Math.max(1, Math.round(rect.width * ratioX));
        const sh = Math.max(1, Math.round(rect.height * ratioY));

        try {
            snapshot.getContext("2d").drawImage(stageCanvas, sx, sy, sw, sh, 0, 0, snapshot.width, snapshot.height);
        }
        catch {
            snapshot.getContext("2d").fillStyle = "rgba(0,162,255,.18)";
            snapshot.getContext("2d").fillRect(0, 0, snapshot.width, snapshot.height);
        }

        return snapshot;
    }

    function createSnapshotOverlay(target, rect) {
        const node = document.createElement("div");
        node.id = "gandhi-transfork-snapshot";
        Object.assign(node.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            zIndex: "9998",
            pointerEvents: "none",
            transformOrigin: "50% 50%",
            willChange: "transform,left,top,width,height"
        });
        node.appendChild(createSnapshotCanvas(rect));
        document.body.appendChild(node);
        return node;
    }

    function setOverlayRect(rect) {
        overlay.style.left = rect.left + "px";
        overlay.style.top = rect.top + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.display = "block";
    }

    function transformForInteraction(state) {
        const rotate = state.previewRotation || 0;
        const skewX = state.previewSkewX || 0;
        const skewY = state.previewSkewY || 0;
        const scaleX = state.previewScaleX || 1;
        const scaleY = state.previewScaleY || 1;
        return `rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`;
    }

    function updateSnapshotAndBox(state) {
        state.snapshot.style.left = state.previewRect.left + "px";
        state.snapshot.style.top = state.previewRect.top + "px";
        state.snapshot.style.width = state.previewRect.width + "px";
        state.snapshot.style.height = state.previewRect.height + "px";
        state.snapshot.style.transform = transformForInteraction(state);
        setOverlayRect(state.previewRect);
        overlay.style.transform = transformForInteraction(state);
    }

    function beginSnapshotInteraction(event, mode, target) {
        if (!target || activeInteraction) return;
        const drawable = getDrawable(target);
        const rect = getTargetScreenRect(target);
        if (!drawable || !rect) return;

        installShearHook(drawable, target);

        const startScaleX = drawable.scale[0];
        const startScaleY = drawable.scale[1];
        const state = {
            mode,
            target,
            drawable,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startTargetX: target.x,
            startTargetY: target.y,
            startDirection: target.direction,
            startSize: target.size,
            startScaleX,
            startScaleY,
            startRect: rect,
            previewRect: { ...rect },
            previewRotation: 0,
            previewSkewX: 0,
            previewSkewY: 0,
            previewScaleX: 1,
            previewScaleY: 1,
            finalX: target.x,
            finalY: target.y,
            finalScaleX: startScaleX,
            finalScaleY: startScaleY,
            finalDirection: target.direction,
            finalShearX: activeShearBridge && activeShearBridge.drawable === drawable ? activeShearBridge.shearX || 0 : 0,
            finalShearY: activeShearBridge && activeShearBridge.drawable === drawable ? activeShearBridge.shearY || 0 : 0,
            snapshot: createSnapshotOverlay(target, rect)
        };

        activeInteraction = state;
        selectedTarget = target;
        hideRealTarget(target);
        setOverlayRect(rect);
        updateSnapshotAndBox(state);
        hideTooltip();
    }

    function updateMoveInteraction(state, event) {
        const scratchDelta = screenDeltaToScratch(event.clientX - state.startMouseX, event.clientY - state.startMouseY);
        const desiredX = state.startTargetX + scratchDelta.x;
        const desiredY = state.startTargetY + scratchDelta.y;
        const snap = findSnapPosition(state.target, desiredX, desiredY);
        const screenDelta = stageDeltaToScreen(snap.x - state.startTargetX, snap.y - state.startTargetY);

        state.finalX = snap.x;
        state.finalY = snap.y;
        state.previewRect = {
            ...state.startRect,
            left: state.startRect.left + screenDelta.x,
            top: state.startRect.top + screenDelta.y
        };
    }

    function updateScaleInteraction(state, event) {
        const dx = event.clientX - state.startMouseX;
        const dy = event.clientY - state.startMouseY;
        const baseX = Math.max(1, Math.abs(state.startScaleX));
        const baseY = Math.max(1, Math.abs(state.startScaleY));
        let nextScaleX = state.startScaleX;
        let nextScaleY = state.startScaleY;

        if (state.mode === "width") {
            const sign = Math.sign(state.startScaleX) || 1;
            nextScaleX = sign * Math.max(1, baseX + dx);
        }
        else if (state.mode === "height") {
            const sign = Math.sign(state.startScaleY) || 1;
            nextScaleY = sign * Math.max(1, baseY + dy);
        }
        else {
            const delta = Math.max(dx, dy);
            const ratio = Math.max(0.02, (Math.max(baseX, baseY) + delta) / Math.max(baseX, baseY));
            nextScaleX = state.startScaleX * ratio;
            nextScaleY = state.startScaleY * ratio;
        }

        state.finalScaleX = nextScaleX;
        state.finalScaleY = nextScaleY;
        state.previewScaleX = nextScaleX / state.startScaleX;
        state.previewScaleY = nextScaleY / state.startScaleY;
    }

    function updateRotateInteraction(state, event) {
        const startAngle = Math.atan2(state.startMouseY - state.startRect.centerY, state.startMouseX - state.startRect.centerX);
        const angle = Math.atan2(event.clientY - state.startRect.centerY, event.clientX - state.startRect.centerX);
        const delta = (angle - startAngle) * 180 / Math.PI;
        state.previewRotation = delta;
        state.finalDirection = normalizeDirection(state.startDirection + delta);
    }

    function updateSkewInteraction(state, event) {
        const dx = event.clientX - state.startMouseX;
        const dy = event.clientY - state.startMouseY;
        state.finalShearX = dx / 200;
        state.finalShearY = dy / 200;
        state.previewSkewX = state.finalShearX * 45;
        state.previewSkewY = state.finalShearY * 45;
    }

    function updateSnapshotInteraction(event) {
        const state = activeInteraction;
        if (!state) return;

        if (state.mode === "move") updateMoveInteraction(state, event);
        else if (state.mode === "width" || state.mode === "height" || state.mode === "uniform") updateScaleInteraction(state, event);
        else if (state.mode === "rotate") updateRotateInteraction(state, event);
        else if (state.mode === "skew") updateSkewInteraction(state, event);

        updateSnapshotAndBox(state);
    }

    function commitSnapshotInteraction(state) {
        if (!state || !state.target) return;
        const target = state.target;
        const drawable = getDrawable(target);

        if (state.mode === "move") {
            target.setXY(state.finalX, state.finalY);
        }
        else if (state.mode === "width" || state.mode === "height" || state.mode === "uniform") {
            if (drawable) {
                installShearHook(drawable, target);
                drawable.updateScale([state.finalScaleX, state.finalScaleY]);
            }
            if (state.mode === "uniform") {
                const ratio = Math.abs(state.finalScaleX / state.startScaleX) || 1;
                target.setSize(state.startSize * ratio);
            }
        }
        else if (state.mode === "rotate") {
            target.setDirection(state.finalDirection);
        }
        else if (state.mode === "skew") {
            if (drawable) {
                installShearHook(drawable, target);
                activeShearBridge = {
                    drawable,
                    shearX: state.finalShearX,
                    shearY: state.finalShearY
                };
                drawable.setTransformDirty();
            }
        }

        restoreRealTarget(target);
        target.emitVisualChange();
        vm.runtime.requestRedraw();
        updateSelectionBox();
    }

    function endSnapshotInteraction(commit) {
        const state = activeInteraction;
        if (!state) return;

        activeInteraction = null;
        overlay.style.transform = "";

        if (commit) commitSnapshotInteraction(state);
        else restoreRealTarget(state.target);

        if (state.snapshot) state.snapshot.remove();
        updateSelectionBox();
    }

    function makeButton(text, title, style, onDown, onClick) {
        const node = document.createElement("div");
        node.innerHTML = text;
        node.title = title;
        Object.assign(node.style, {
            position: "absolute",
            width: "20px",
            height: "20px",
            background: "#00A2FF",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            border: "1px solid white",
            pointerEvents: "auto",
            fontSize: "13px",
            fontWeight: "bold",
            userSelect: "none",
            ...style
        });

        if (onDown) {
            node.addEventListener("mousedown", event => {
                event.preventDefault();
                event.stopPropagation();
                onDown(event);
            }, true);
        }

        if (onClick) {
            node.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                onClick(event);
            }, true);
        }

        node.addEventListener("mouseenter", event => showTooltip(title, event));
        node.addEventListener("mousemove", moveTooltip);
        node.addEventListener("mouseleave", hideTooltip);
        node.addEventListener("mousedown", hideTooltip);
        return node;
    }

    function createOverlay() {
        overlay = document.createElement("div");
        overlay.id = "gandi-transform-box";
        Object.assign(overlay.style, {
            position: "fixed",
            border: "2px solid #00A2FF",
            pointerEvents: "none",
            zIndex: "9999",
            boxSizing: "border-box",
            display: "none",
            userSelect: "none",
            transformOrigin: "50% 50%"
        });

        const moveHandle = makeButton("âœ¥", "Move", {
            left: "50%",
            top: "-23px",
            marginLeft: "-12px",
            background: "#e53935",
            cursor: "move"
        }, event => beginSnapshotInteraction(event, "move", vm.editingTarget));

        const rotateHandle = makeButton("â†»", "Rotate", {
            left: "50%",
            top: "6px",
            marginLeft: "-12px",
            borderRadius: "50%",
            background: "#ff9800",
            cursor: "grab"
        }, event => beginSnapshotInteraction(event, "rotate", vm.editingTarget));

        const widthHandle = makeButton("â†”", "Width Scale", {
            right: "-27px",
            bottom: "42px",
            cursor: "ew-resize"
        }, event => beginSnapshotInteraction(event, "width", vm.editingTarget));

        const heightHandle = makeButton("â†•", "Height Scale", {
            right: "-27px",
            bottom: "18px",
            cursor: "ns-resize"
        }, event => beginSnapshotInteraction(event, "height", vm.editingTarget));

        const uniformHandle = makeButton("â—²", "Resize", {
            right: "-27px",
            bottom: "-6px",
            cursor: "nwse-resize"
        }, event => beginSnapshotInteraction(event, "uniform", vm.editingTarget));

        const resizeHandle = makeButton("", "Resize", {
            right: "-6px",
            bottom: "-6px",
            width: "12px",
            height: "12px",
            borderRadius: "0",
            cursor: "nwse-resize"
        }, event => beginSnapshotInteraction(event, "uniform", vm.editingTarget));

        const skewHandle = makeButton("ðŸ› ", "Skew", {
            right: "-27px",
            bottom: "66px",
            cursor: "crosshair"
        }, event => beginSnapshotInteraction(event, "skew", vm.editingTarget));

        const flipHandle = makeButton("â‡‹", "Flip Horizontal", {
            left: "-26px",
            top: "0px",
            background: "#8e44ad",
            cursor: "pointer"
        }, null, () => flipHorizontal(vm.editingTarget));

        const flipVerticalHandle = makeButton("â‡…", "Flip Vertical", {
            left: "-26px",
            top: "24px",
            background: "#16a085",
            cursor: "pointer"
        }, null, () => flipVertical(vm.editingTarget));

        const resetHandle = makeButton("âŸ²", "Reset", {
            left: "-26px",
            top: "48px",
            background: "#c0392b",
            cursor: "pointer"
        }, null, () => resetTarget(vm.editingTarget));

        const alphaContainer = document.createElement("div");
        Object.assign(alphaContainer.style, {
            position: "absolute",
            left: "50%",
            top: "-72px",
            width: "42px",
            marginLeft: "-22px",
            background: "#34495e",
            border: "1px solid #5d7a94",
            borderRadius: "4px",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto"
        });

        const alphaInput = document.createElement("input");
        alphaInput.type = "text";
        alphaInput.value = "100";
        Object.assign(alphaInput.style, {
            background: "transparent",
            color: "white",
            border: "none",
            width: "30px",
            textAlign: "center",
            fontSize: "10px",
            fontWeight: "bold",
            outline: "none"
        });
        alphaContainer.appendChild(alphaInput);
        overlay.__alphaInput = alphaInput;

        alphaInput.addEventListener("mousedown", event => event.stopPropagation(), true);
        alphaInput.addEventListener("change", () => {
            let value = parseInt(alphaInput.value, 10);
            if (Number.isNaN(value)) value = 100;
            value = Math.max(0, Math.min(100, value));
            alphaInput.value = String(value);
            applySpriteAlpha(value);
            if (vm.editingTarget) spriteAlphaMap.set(vm.editingTarget.id, value);
        });

        const nameContainer = document.createElement("div");
        Object.assign(nameContainer.style, {
            position: "absolute",
            left: "-1px",
            top: "100%",
            transform: "translateY(6px)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            pointerEvents: "auto"
        });

        const nameInput = document.createElement("input");
        Object.assign(nameInput.style, {
            minWidth: "60px",
            maxWidth: "250px",
            background: "#34495e",
            color: "white",
            border: "1px solid #5d7a94",
            borderRadius: "4px",
            fontSize: "10px",
            padding: "2px 6px",
            outline: "none"
        });
        overlay.__nameInput = nameInput;
        nameInput.addEventListener("mousedown", event => event.stopPropagation(), true);
        nameInput.addEventListener("keydown", event => {
            if (event.key !== "Enter") return;
            const target = vm.editingTarget;
            const value = nameInput.value.trim();
            if (target && value) vm.renameSprite(target.id, value);
            nameInput.blur();
        });
        nameContainer.appendChild(nameInput);

        const versionLabel = document.createElement("div");
        versionLabel.textContent = "TF " + GANDHI_TRANSFORM_BOX_VERSION;
        Object.assign(versionLabel.style, {
            position: "absolute",
            left: "0px",
            top: "-28px",
            background: "rgba(0, 162, 255, 0.95)",
            color: "white",
            border: "1px solid white",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: "bold",
            lineHeight: "12px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: "10000",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
        });

        overlay.appendChild(versionLabel);
        overlay.appendChild(moveHandle);
        overlay.appendChild(rotateHandle);
        overlay.appendChild(widthHandle);
        overlay.appendChild(heightHandle);
        overlay.appendChild(uniformHandle);
        overlay.appendChild(resizeHandle);
        overlay.appendChild(skewHandle);
        overlay.appendChild(flipHandle);
        overlay.appendChild(flipVerticalHandle);
        overlay.appendChild(resetHandle);
        overlay.appendChild(alphaContainer);
        overlay.appendChild(nameContainer);
        document.body.appendChild(overlay);
    }

    function createTooltip() {
        tooltip = document.createElement("div");
        Object.assign(tooltip.style, {
            position: "fixed",
            background: "rgba(20,20,20,.92)",
            color: "white",
            fontWeight: "500",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "10px",
            pointerEvents: "none",
            zIndex: "10001",
            display: "none",
            whiteSpace: "nowrap"
        });
        document.body.appendChild(tooltip);
    }

    function showTooltip(text, event) {
        if (!tooltip || activeInteraction) return;
        tooltip.textContent = text;
        tooltip.style.display = "block";
        moveTooltip(event);
    }

    function hideTooltip() {
        if (tooltip) tooltip.style.display = "none";
    }

    function moveTooltip(event) {
        if (!tooltip || tooltip.style.display === "none") return;
        const offset = 8;
        tooltip.style.left = event.clientX + offset + "px";
        tooltip.style.top = event.clientY + offset + "px";
    }

    function flipHorizontal(target) {
        if (!target) return;
        const drawable = getDrawable(target);
        if (!drawable) return;
        drawable.updateScale([-drawable.scale[0], drawable.scale[1]]);
        target.setDirection(normalizeDirection(180 - target.direction));
        target.emitVisualChange();
        vm.runtime.requestRedraw();
        updateSelectionBox();
    }

    function flipVertical(target) {
        if (!target) return;
        const drawable = getDrawable(target);
        if (!drawable) return;
        drawable.updateScale([drawable.scale[0], -drawable.scale[1]]);
        target.setDirection(normalizeDirection(-target.direction));
        target.emitVisualChange();
        vm.runtime.requestRedraw();
        updateSelectionBox();
    }

    function resetTarget(target) {
        if (!target) return;
        const drawable = getDrawable(target);
        if (drawable) {
            drawable.updateScale([100, 100]);
            if (activeShearBridge && activeShearBridge.drawable === drawable) activeShearBridge = null;
        }
        target.setDirection(90);
        target.setSize(100);
        applySpriteAlpha(100);
        target.emitVisualChange();
        vm.runtime.requestRedraw();
        updateSelectionBox();
    }

    function hideOverlay() {
        if (!overlay) return;
        overlay.style.display = "none";
    }

    function updateSelectionBox() {
        if (!transformMode || activeInteraction || !overlay) return;
        const target = vm.editingTarget;
        if (!target || target.isStage) {
            hideOverlay();
            return;
        }

        selectedTarget = target;
        const rect = getTargetScreenRect(target);
        if (!rect || rect.width <= 1 || rect.height <= 1) {
            hideOverlay();
            return;
        }

        overlay.style.transform = "";
        setOverlayRect(rect);

        if (overlay.__alphaInput && document.activeElement !== overlay.__alphaInput) {
            const alpha = getSpriteAlpha();
            overlay.__alphaInput.value = String(alpha);
        }

        if (overlay.__nameInput && document.activeElement !== overlay.__nameInput) {
            overlay.__nameInput.value = target.sprite && target.sprite.name ? target.sprite.name : "Sprite";
            overlay.__nameInput.style.width = Math.max(8, overlay.__nameInput.value.length) * 7 + "px";
        }
    }

    function getTargetFromPoint(event) {
        const canvas = getStageCanvas();
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const drawableID = vm.runtime.renderer.pick(event.clientX - rect.left, event.clientY - rect.top);
        if (drawableID < 0) return null;
        return vm.runtime.targets.find(target => target.drawableID === drawableID) || null;
    }

    function handleStageMouseDown(event) {
        if (!transformMode || activeInteraction) return;
        const target = getTargetFromPoint(event);
        if (!target || target.isStage) return;

        event.preventDefault();
        event.stopPropagation();
        selectedTarget = target;
        vm.setEditingTarget(target.id);

        const startX = event.clientX;
        const startY = event.clientY;
        let started = false;

        function onMove(moveEvent) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (!started && Math.hypot(dx, dy) > 5) {
                started = true;
                beginSnapshotInteraction(event, "move", target);
            }
            if (started) updateSnapshotInteraction(moveEvent);
        }

        function onUp(upEvent) {
            window.removeEventListener("mousemove", onMove, true);
            window.removeEventListener("mouseup", onUp, true);
            if (started) {
                updateSnapshotInteraction(upEvent);
                endSnapshotInteraction(true);
            }
            else {
                updateSelectionBox();
            }
        }

        window.addEventListener("mousemove", onMove, true);
        window.addEventListener("mouseup", onUp, true);
    }

    function isStageVisible() {
        const canvas = getStageCanvas();
        if (!canvas) return false;
        const rect = canvas.getBoundingClientRect();
        return rect.width > 50 && rect.height > 50 && rect.top < window.innerHeight && rect.left < window.innerWidth;
    }

    function isCodeTabOpen() {
        const selectedTab = document.querySelector('[class*="selected"]');
        if (!selectedTab) return true;
        return selectedTab.textContent.trim().includes("Code");
    }

    function animate() {
        if (transformMode && isStageVisible() && isCodeTabOpen()) {
            updateSelectionBox();
        }
        else if (!activeInteraction) {
            hideOverlay();
        }
        requestAnimationFrame(animate);
    }

    function init() {
        const canvas = getStageCanvas();
        if (!canvas) return;

        createTooltip();
        createOverlay();

        canvas.addEventListener("mousedown", handleStageMouseDown, true);

        window.addEventListener("mousemove", event => {
            if (activeInteraction) {
                event.preventDefault();
                event.stopPropagation();
                updateSnapshotInteraction(event);
            }
        }, true);

        window.addEventListener("mouseup", event => {
            if (activeInteraction) {
                event.preventDefault();
                event.stopPropagation();
                updateSnapshotInteraction(event);
                endSnapshotInteraction(true);
            }
        }, true);

        animate();
    }

    waitForVM();
})();

