window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const state = {
        active: false,
        ready: false,
        target: null,
        drawable: null,
        snapshot: null,
        occluders: [],
        canvas: null,
        frame: 0,
        startMouseX: 0,
        startMouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        lastShiftKey: false,
        startX: 0,
        startY: 0,
        finalX: 0,
        finalY: 0,
        startVisible: true,
        startRect: null,
        startDirection: 90,
        startSize: 100,
        startScale: null,
        snapBoxes: []
    };

    function vm() { return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null; }
    function stageCanvas() { return api.coords?.getStageCanvas?.() || document.querySelector("canvas"); }

    function screenDeltaToScratch(dx, dy, canvas, activeVM) {
        if (api.coords?.screenDeltaToScratch) return api.coords.screenDeltaToScratch(dx, dy, canvas, activeVM);
        const rect = canvas.getBoundingClientRect();
        const native = activeVM.runtime.renderer.getNativeSize();
        return { x: dx / rect.width * native[0], y: -dy / rect.height * native[1] };
    }

    function scratchDeltaToScreen(dx, dy, canvas, activeVM) {
        const rect = canvas.getBoundingClientRect();
        const native = activeVM.runtime.renderer.getNativeSize();
        return { x: dx / native[0] * rect.width, y: -dy / native[1] * rect.height };
    }

    function setVisible(activeVM, target, value) {
        const renderer = activeVM.runtime.renderer;
        if (typeof renderer.updateDrawableVisible === "function") renderer.updateDrawableVisible(target.drawableID, value);
        else {
            const drawable = renderer._allDrawables[target.drawableID];
            if (drawable) drawable._visible = value;
        }
        target.emitVisualChange?.();
        activeVM.runtime.requestRedraw?.();
    }

    function setEditingTarget(activeVM, target) {
        if (!target) return;
        if (api.vm?.setEditingTarget) api.vm.setEditingTarget(target);
        else if (typeof activeVM.setEditingTarget === "function") activeVM.setEditingTarget(target.id);
    }

    function pick(event, activeVM, canvas) {
        const rect = canvas.getBoundingClientRect();
        const id = activeVM.runtime.renderer.pick(event.clientX - rect.left, event.clientY - rect.top);
        if (id < 0) return null;
        return activeVM.runtime.targets.find(target => target && !target.isStage && target.drawableID === id) || null;
    }

    function offsetBounds(bounds, dx, dy) {
        return { left: bounds.left + dx, right: bounds.right + dx, top: bounds.top + dy, bottom: bounds.bottom + dy };
    }

    function snapDistance(activeVM, canvas) {
        const rect = canvas.getBoundingClientRect();
        const native = activeVM.runtime.renderer.getNativeSize();
        return rect.width ? 12 * (native[0] / rect.width) : 12;
    }

    function clearSnapBoxes() {
        state.snapBoxes.forEach(box => box.remove());
        state.snapBoxes = [];
    }

    function addSnapBox(bounds, activeVM, canvas) {
        const rect = api.snapshotLayer.screenRect(bounds, canvas, activeVM);
        const box = document.createElement("div");
        Object.assign(box.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            border: "2px dashed #f59e0b",
            background: "rgba(245,158,11,.08)",
            boxSizing: "border-box",
            pointerEvents: "none",
            zIndex: "9997",
            userSelect: "none"
        });
        document.body.appendChild(box);
        state.snapBoxes.push(box);
    }

    function showSnapBoxes(targets, activeVM, canvas) {
        clearSnapBoxes();
        const seen = new Set();
        targets.forEach(bounds => {
            if (!bounds) return;
            const key = [bounds.left, bounds.right, bounds.top, bounds.bottom].join(":");
            if (seen.has(key)) return;
            seen.add(key);
            addSnapBox(bounds, activeVM, canvas);
        });
    }

    function findSnap(activeVM, desiredX, desiredY) {
        const renderer = activeVM.runtime.renderer;
        const currentBounds = state.drawable.getAABB();
        const bounds = offsetBounds(currentBounds, desiredX - state.target.x, desiredY - state.target.y);
        const dist = snapDistance(activeVM, state.canvas);
        let snapX = null;
        let snapY = null;
        let snapXTarget = null;
        let snapYTarget = null;

        activeVM.runtime.targets.forEach(other => {
            if (!other || other === state.target || other.isStage) return;
            const otherDrawable = renderer._allDrawables[other.drawableID];
            if (!otherDrawable || otherDrawable._visible === false) return;
            const ob = otherDrawable.getAABB();

            [ob.left - bounds.left, ob.right - bounds.left, ob.left - bounds.right, ob.right - bounds.right].forEach(delta => {
                if (Math.abs(delta) <= dist && (snapX === null || Math.abs(delta) < Math.abs(snapX))) {
                    snapX = delta;
                    snapXTarget = ob;
                }
            });

            [ob.top - bounds.top, ob.bottom - bounds.top, ob.top - bounds.bottom, ob.bottom - bounds.bottom].forEach(delta => {
                if (Math.abs(delta) <= dist && (snapY === null || Math.abs(delta) < Math.abs(snapY))) {
                    snapY = delta;
                    snapYTarget = ob;
                }
            });
        });

        if (snapX !== null && snapY === null && snapXTarget) {
            const topDelta = snapXTarget.top - bounds.top;
            const bottomDelta = snapXTarget.bottom - bounds.bottom;
            if (Math.abs(topDelta) <= dist) snapY = topDelta;
            else if (Math.abs(bottomDelta) <= dist) snapY = bottomDelta;
        }

        if (snapY !== null && snapX === null && snapYTarget) {
            const leftDelta = snapYTarget.left - bounds.left;
            const rightDelta = snapYTarget.right - bounds.right;
            if (Math.abs(leftDelta) <= dist) snapX = leftDelta;
            else if (Math.abs(rightDelta) <= dist) snapX = rightDelta;
        }

        return { x: desiredX + (snapX || 0), y: desiredY + (snapY || 0), targets: [snapXTarget, snapYTarget].filter(Boolean) };
    }

    function placeSelection(rect, dx, dy) {
        if (api.selectionBox?.moveFromStart) api.selectionBox.moveFromStart(rect, dx, dy);
        else if (api.selectionBox?.place) api.selectionBox.place({ left: rect.left + dx, top: rect.top + dy, width: rect.width, height: rect.height });
    }

    function move(clientX, clientY, shiftKey) {
        if (!state.active) return;
        const activeVM = vm();
        if (!activeVM) return;
        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
        state.lastShiftKey = !!shiftKey;
        if (!state.ready) return;

        const rawDX = clientX - state.startMouseX;
        const rawDY = clientY - state.startMouseY;
        const d = screenDeltaToScratch(rawDX, rawDY, state.canvas, activeVM);
        let x = state.startX + d.x;
        let y = state.startY + d.y;

        if (shiftKey) {
            const snapped = findSnap(activeVM, x, y);
            x = snapped.x;
            y = snapped.y;
            showSnapBoxes(snapped.targets, activeVM, state.canvas);
        }
        else clearSnapBoxes();

        state.finalX = x;
        state.finalY = y;
        const sd = scratchDeltaToScreen(x - state.startX, y - state.startY, state.canvas, activeVM);
        if (state.snapshot) {
            state.snapshot.style.left = state.startRect.left + sd.x + "px";
            state.snapshot.style.top = state.startRect.top + sd.y + "px";
        }
        placeSelection(state.startRect, sd.x, sd.y);
    }

    function loop() {
        if (!state.active) return;
        move(state.lastMouseX, state.lastMouseY, state.lastShiftKey);
        state.frame = requestAnimationFrame(loop);
    }

    function readyAfterHide() {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (!state.active) return;
            state.ready = true;
            api.snapshotLayer.setVisible([state.snapshot].concat(state.occluders), true);
            move(state.lastMouseX, state.lastMouseY, state.lastShiftKey);
            loop();
        }));
    }

    function start(event, overrideTarget) {
        const activeVM = vm();
        if (!activeVM?.runtime?.renderer || !api.snapshotLayer) return false;
        const canvas = stageCanvas();
        if (!canvas) return false;
        const target = overrideTarget || pick(event, activeVM, canvas);
        if (!target || target.isStage) return false;
        const drawable = activeVM.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;
        const rect = api.snapshotLayer.screenRect(drawable.getAABB(), canvas, activeVM);
        const snapshot = api.snapshotLayer.makeSnapshot(activeVM, target, drawable, canvas, rect, 9998);
        if (!snapshot) return false;
        const occluders = api.snapshotLayer.createOccluders(activeVM, target, canvas);

        Object.assign(state, {
            active: true,
            ready: false,
            target,
            drawable,
            snapshot,
            occluders,
            canvas,
            frame: 0,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY,
            lastShiftKey: !!event.shiftKey,
            startX: target.x,
            startY: target.y,
            finalX: target.x,
            finalY: target.y,
            startVisible: drawable._visible !== false,
            startRect: rect,
            startDirection: target.direction,
            startSize: target.size,
            startScale: drawable.scale ? drawable.scale.slice() : null,
            snapBoxes: []
        });

        setEditingTarget(activeVM, target);
        setVisible(activeVM, target, false);
        readyAfterHide();

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function removeAfterRedraw(nodes) {
        requestAnimationFrame(() => requestAnimationFrame(() => api.snapshotLayer?.remove(nodes || [])));
    }

    function clear() {
        clearSnapBoxes();
        state.active = false;
        state.ready = false;
        state.target = null;
        state.drawable = null;
        state.snapshot = null;
        state.occluders = [];
        state.canvas = null;
        state.startScale = null;
        state.startRect = null;
        state.lastShiftKey = false;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.frame = 0;
    }

    function finish(commit) {
        if (!state.active) return;
        const activeVM = vm();
        const target = state.target;
        const nodes = [state.snapshot].concat(state.occluders || []);
        if (state.frame) cancelAnimationFrame(state.frame);

        try {
            if (activeVM && target) {
                if (commit) target.setXY(state.finalX, state.finalY);
                else {
                    target.setXY(state.startX, state.startY);
                    target.setDirection(state.startDirection);
                    target.setSize(state.startSize);
                    if (state.startScale && state.drawable) state.drawable.updateScale(state.startScale);
                }
                setVisible(activeVM, target, state.startVisible);
            }
        }
        finally {
            clear();
            removeAfterRedraw(nodes);
        }
    }

    function blocked(target) { return !!target?.closest?.("button,input,textarea,select,a,[contenteditable='true']"); }

    function canStartFromBox(target) {
        if (!target || blocked(target)) return false;
        const text = String(target.textContent || "").trim();
        const cursor = getComputedStyle(target).cursor;
        if (text === "✥" || cursor === "move") return true;
        if (cursor && cursor.includes("resize")) return false;
        if (cursor === "grab" || cursor === "grabbing" || cursor === "crosshair") return false;
        return cursor === "auto" || cursor === "default" || cursor === "pointer";
    }

    function bind() {
        window.addEventListener("mousedown", event => {
            if (event.button !== 0 || state.active) return;
            const box = api.selectionBox?.getBox?.();
            const insideBox = box && box.contains(event.target);
            if (insideBox) {
                if (!canStartFromBox(event.target)) return;
                start(event, vm()?.editingTarget);
                return;
            }
            start(event, null);
        }, true);

        window.addEventListener("mousemove", event => {
            if (!state.active) return;
            move(event.clientX, event.clientY, event.shiftKey);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("mouseup", event => {
            if (!state.active) return;
            move(event.clientX, event.clientY, event.shiftKey);
            finish(true);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("keydown", event => {
            if (event.key !== "Escape" || !state.active) return;
            finish(false);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("blur", () => finish(false), true);
    }

    api.registerModule260705_NS8Q2M("snapshotDrag", { state, bind, start, finish });
})();
