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
        frame: 0
    };

    function getModules260705_GM4P1R() {
        return {
            vm: api.vm,
            coords: api.coords,
            selectionBox: api.selectionBox
        };
    }

    function createSnapshot260705_CS8A7N(canvas, screenRect) {
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
        const snapshot = createSnapshot260705_CS8A7N(canvas, screenRect);
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

        modules.vm.setEditingTarget(target);
        setDrawableVisible260705_DV2M6F(vm, target, false);
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
                    const cursor = getComputedStyle(event.target).cursor;
                    const isMoveHandle =
                    cursor === "move" ||
                    event.target.textContent === "✥";

                    if (!isMoveHandle) return;

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
