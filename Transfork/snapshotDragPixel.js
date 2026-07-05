window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const state = {
        bound: false,
        active: false,
        target: null,
        drawable: null,
        canvas: null,
        snapshot: null,
        occluders: [],
        rect: null,
        screenDelta: { x: 0, y: 0 },
        startMouseX: 0,
        startMouseY: 0,
        startX: 0,
        startY: 0,
        finalX: 0,
        finalY: 0,
        visible: true
    };

    function getVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function getCanvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function getDrawable(vm, target) {
        return vm?.runtime?.renderer?._allDrawables?.[target?.drawableID] || null;
    }

    function pickTarget(event, vm, canvas) {
        const bounds = canvas.getBoundingClientRect();
        const drawableID = vm.runtime.renderer.pick(event.clientX - bounds.left, event.clientY - bounds.top);
        return vm.runtime.targets.find(target => target && !target.isStage && target.drawableID === drawableID) || null;
    }

    function screenDeltaToScratch(dx, dy, canvas, vm) {
        if (api.coords?.screenDeltaToScratch) {
            return api.coords.screenDeltaToScratch(dx, dy, canvas, vm);
        }

        const bounds = canvas.getBoundingClientRect();
        const native = vm.runtime.renderer.getNativeSize();
        return {
            x: dx / bounds.width * native[0],
            y: -dy / bounds.height * native[1]
        };
    }

    function scratchDeltaToScreen(dx, dy, canvas, vm) {
        const bounds = canvas.getBoundingClientRect();
        const native = vm.runtime.renderer.getNativeSize();
        return {
            x: dx / native[0] * bounds.width,
            y: -dy / native[1] * bounds.height
        };
    }

    function setVisible(vm, target, visible) {
        const renderer = vm.runtime.renderer;
        const drawable = getDrawable(vm, target);
        if (typeof renderer.updateDrawableVisible === "function") {
            renderer.updateDrawableVisible(target.drawableID, visible);
        }
        else if (drawable) {
            drawable._visible = visible;
        }
        target.emitVisualChange?.();
        vm.runtime.requestRedraw?.();
    }

    function pixelRect(vm, target, drawable, canvas) {
        return api.pixelBounds?.rect?.(vm, target, drawable, canvas) ||
            api.snapshotLayer.screenRect(drawable.getAABB(), canvas, vm);
    }

    function placeBox(screenDelta) {
        if (api.selectionBox?.moveFromStart) {
            api.selectionBox.moveFromStart(state.rect, screenDelta.x, screenDelta.y);
        }
        else {
            api.selectionBox?.place?.({
                left: state.rect.left + screenDelta.x,
                top: state.rect.top + screenDelta.y,
                width: state.rect.width,
                height: state.rect.height
            });
        }
        api.overlayTop?.bringBoxToTop?.();
    }

    function syncBox() {
        if (!state.active || !state.rect) return;
        placeBox(state.screenDelta || { x: 0, y: 0 });
    }

    function activeLoop() {
        requestAnimationFrame(activeLoop);
        setTimeout(syncBox, 0);
    }

    function move(event) {
        if (!state.active) return;

        const vm = getVM();
        if (!vm) return;

        const rawX = event.clientX - state.startMouseX;
        const rawY = event.clientY - state.startMouseY;
        const scratch = screenDeltaToScratch(rawX, rawY, state.canvas, vm);
        const screen = scratchDeltaToScreen(scratch.x, scratch.y, state.canvas, vm);

        state.finalX = state.startX + scratch.x;
        state.finalY = state.startY + scratch.y;
        state.screenDelta = screen;

        if (state.snapshot) {
            state.snapshot.style.left = state.rect.left + screen.x + "px";
            state.snapshot.style.top = state.rect.top + screen.y + "px";
        }

        placeBox(screen);
    }

    function start(event, chosenTarget) {
        const vm = getVM();
        const canvas = getCanvas();
        if (!vm?.runtime?.renderer || !canvas || !api.snapshotLayer) return false;

        const target = chosenTarget || pickTarget(event, vm, canvas);
        if (!target || target.isStage) return false;

        const drawable = getDrawable(vm, target);
        if (!drawable?.getAABB) return false;

        const rect = pixelRect(vm, target, drawable, canvas);
        const snapshot = api.snapshotLayer.makeSnapshot(vm, target, drawable, canvas, rect, 9998);
        if (!snapshot) return false;

        Object.assign(state, {
            active: true,
            target,
            drawable,
            canvas,
            snapshot,
            occluders: api.snapshotLayer.createOccluders(vm, target, canvas),
            rect,
            screenDelta: { x: 0, y: 0 },
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            startX: target.x,
            startY: target.y,
            finalX: target.x,
            finalY: target.y,
            visible: drawable._visible !== false
        });

        if (api.vm?.setEditingTarget) api.vm.setEditingTarget(target);
        setVisible(vm, target, false);
        placeBox(state.screenDelta);

        requestAnimationFrame(() => requestAnimationFrame(() => {
            api.snapshotLayer.setVisible([snapshot].concat(state.occluders), true);
        }));

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function finish(commit) {
        if (!state.active) return;

        const vm = getVM();
        const target = state.target;
        const nodes = [state.snapshot].concat(state.occluders || []);

        if (vm && target) {
            target.setXY(commit ? state.finalX : state.startX, commit ? state.finalY : state.startY);
            setVisible(vm, target, state.visible);
        }

        nodes.forEach(node => {
            if (node?.parentNode) node.remove();
        });

        state.active = false;
        state.snapshot = null;
        state.occluders = [];
        state.screenDelta = { x: 0, y: 0 };
    }

    function isMoveHandle(element) {
        const text = String(element?.textContent || "").trim();
        const cursor = getComputedStyle(element).cursor;
        return text === "✥" || cursor === "move";
    }

    function onMouseDown(event) {
        if (event.button !== 0 || state.active) return;

        const box = api.selectionBox?.getBox?.();
        if (box && box.contains(event.target)) {
            if (!isMoveHandle(event.target)) return;
            start(event, getVM()?.editingTarget);
            return;
        }

        start(event, null);
    }

    function bind() {
        if (state.bound) return;
        state.bound = true;

        activeLoop();

        window.addEventListener("mousedown", onMouseDown, true);
        window.addEventListener("mousemove", event => {
            if (!state.active) return;
            move(event);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);
        window.addEventListener("mouseup", event => {
            if (!state.active) return;
            move(event);
            finish(true);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);
        window.addEventListener("keydown", event => {
            if (event.key === "Escape" && state.active) finish(false);
        }, true);
        window.addEventListener("blur", () => finish(false), true);
    }

    api.registerModule260705_NS8Q2M("snapshotDrag", {
        state,
        bind,
        start,
        finish
    });
})();
