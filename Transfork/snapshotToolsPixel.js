window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const state = { active: false, target: null, drawable: null, canvas: null, snapshot: null, occluders: [], mode: "", rect: null, mx: 0, my: 0, dir: 90, scale: [100, 100], visible: true, finalScale: [100, 100], finalDirection: 90 };

    function getVM() { return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null; }
    function getCanvas() { return api.coords?.getStageCanvas?.() || document.querySelector("canvas"); }
    function getBox() { return api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box"); }

    function modeFrom(element) {
        const text = String(element?.textContent || "").trim();
        const cursor = getComputedStyle(element).cursor;
        if (text === "↻" || cursor === "grab" || cursor === "grabbing") return "rotate";
        if (text === "↔" || cursor === "ew-resize") return "width";
        if (text === "↕" || cursor === "ns-resize") return "height";
        if (text === "◲" || cursor === "nwse-resize" || cursor === "nesw-resize") return "uniform";
        return "";
    }

    function setVisible(vm, target, visible) {
        const renderer = vm.runtime.renderer;
        if (typeof renderer.updateDrawableVisible === "function") renderer.updateDrawableVisible(target.drawableID, visible);
        else if (renderer._allDrawables[target.drawableID]) renderer._allDrawables[target.drawableID]._visible = visible;
        target.emitVisualChange?.();
        vm.runtime.requestRedraw?.();
    }

    function signedScale(value, delta) {
        return Math.sign(value || 1) * Math.max(0.01, Math.abs(value) + delta);
    }

    function place(rect) {
        api.selectionBox?.place?.(rect);
        api.overlayTop?.bringBoxToTop?.();
    }

    function apply(event) {
        if (!state.active || !state.snapshot) return;

        const dx = event.clientX - state.mx;
        const dy = event.clientY - state.my;
        let sx = 1;
        let sy = 1;
        let rotate = 0;

        if (state.mode === "width") {
            const next = signedScale(state.scale[0], dx);
            sx = Math.abs(next) / Math.max(0.01, Math.abs(state.scale[0]));
            state.finalScale = [next, state.scale[1]];
        }
        else if (state.mode === "height") {
            const next = signedScale(state.scale[1], dy);
            sy = Math.abs(next) / Math.max(0.01, Math.abs(state.scale[1]));
            state.finalScale = [state.scale[0], next];
        }
        else if (state.mode === "uniform") {
            const ratio = Math.max(0.01, Math.abs(state.scale[0]) + dx) / Math.max(0.01, Math.abs(state.scale[0]));
            sx = ratio;
            sy = ratio;
            state.finalScale = [state.scale[0] * ratio, state.scale[1] * ratio];
        }
        else if (state.mode === "rotate") {
            const rect = getBox()?.getBoundingClientRect() || state.rect;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const a0 = Math.atan2(state.my - cy, state.mx - cx);
            const a1 = Math.atan2(event.clientY - cy, event.clientX - cx);
            rotate = (a1 - a0) * 180 / Math.PI;
            state.finalDirection = state.dir + rotate;
            state.finalScale = state.scale.slice();
        }

        state.snapshot.style.transform = "scale(" + sx + "," + sy + ") rotate(" + rotate + "deg)";
        place(state.snapshot.getBoundingClientRect());
    }

    function start(event, mode) {
        const vm = getVM();
        const canvas = getCanvas();
        if (!vm?.runtime?.renderer || !canvas || !api.snapshotLayer) return false;
        const target = vm.editingTarget;
        if (!target || target.isStage) return false;
        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;

        const rect = api.pixelBounds?.rect?.(vm, target, drawable, canvas) || api.snapshotLayer.screenRect(drawable.getAABB(), canvas, vm);
        const snapshot = api.snapshotLayer.makeSnapshot(vm, target, drawable, canvas, rect, 9998);
        if (!snapshot) return false;

        Object.assign(state, { active: true, target, drawable, canvas, snapshot, occluders: api.snapshotLayer.createOccluders(vm, target, canvas), mode, rect, mx: event.clientX, my: event.clientY, dir: target.direction || 90, scale: drawable.scale ? drawable.scale.slice() : [100, 100], visible: drawable._visible !== false, finalScale: drawable.scale ? drawable.scale.slice() : [100, 100], finalDirection: target.direction || 90 });
        window.__transforkTransformActive = true;
        setVisible(vm, target, false);
        requestAnimationFrame(() => requestAnimationFrame(() => api.snapshotLayer.setVisible([snapshot].concat(state.occluders), true)));
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function finish(commit) {
        if (!state.active) return;
        const vm = getVM();
        const target = state.target;
        const drawable = state.drawable;
        const nodes = [state.snapshot].concat(state.occluders || []);
        if (commit && vm && target && drawable) {
            if (state.mode === "rotate") target.setDirection(state.finalDirection);
            drawable.updateScale(state.finalScale);
            target.emitVisualChange?.();
            vm.runtime.requestRedraw?.();
        }
        if (vm && target) setVisible(vm, target, state.visible);
        nodes.forEach(node => { if (node?.parentNode) node.remove(); });
        state.snapshot = null;
        state.occluders = [];
        state.active = false;
        window.__transforkTransformActive = false;
    }

    window.addEventListener("mousedown", event => {
        if (event.button !== 0 || state.active) return;
        const box = getBox();
        if (!box || !box.contains(event.target)) return;
        const mode = modeFrom(event.target);
        if (mode) start(event, mode);
    }, true);

    window.addEventListener("mousemove", event => { if (state.active) { apply(event); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("mouseup", event => { if (state.active) { apply(event); finish(true); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("keydown", event => { if (event.key === "Escape" && state.active) { finish(false); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("blur", () => finish(false), true);

    api.registerModule260705_NS8Q2M("snapshotToolsPixel", { state, start, finish });
})();
