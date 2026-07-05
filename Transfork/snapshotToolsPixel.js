window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const state = { active: false, target: null, drawable: null, canvas: null, snapshot: null, preview: null, source: null, occluders: [], mode: "", rect: null, mx: 0, my: 0, dir: 90, scale: [100, 100], visible: true, finalScale: [100, 100], finalDirection: 90 };

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

    function sourceFrom(snapshot) {
        if (snapshot instanceof HTMLCanvasElement) return snapshot;
        return snapshot?.querySelector?.("canvas,img") || null;
    }

    function createPreview(rect) {
        const preview = document.createElement("canvas");
        Object.assign(preview.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: rect.height + "px", pointerEvents: "none", zIndex: "9998", visibility: "hidden" });
        document.body.appendChild(preview);
        return preview;
    }

    function scanAlpha(canvas, origin) {
        let data;
        try { data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data; }
        catch (_error) { return null; }
        let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
        for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
            if (data[(y * canvas.width + x) * 4 + 3] <= 5) continue;
            if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
        }
        if (maxX < minX || maxY < minY) return null;
        return { left: origin.left + minX, top: origin.top + minY, width: maxX - minX + 1, height: maxY - minY + 1 };
    }

    function place(rect) {
        const box = getBox();
        if (!box || !rect) return;
        box.style.display = "block";
        box.style.left = rect.left + "px";
        box.style.top = rect.top + "px";
        box.style.width = rect.width + "px";
        box.style.height = rect.height + "px";
        api.overlayTop?.bringBoxToTop?.();
    }

    function renderPreview(sx, sy, rotate) {
        const source = state.source, preview = state.preview, base = state.rect;
        if (!source || !preview || !base) return null;
        if (source instanceof HTMLImageElement && !source.complete) return null;
        const sw = base.width * Math.abs(sx), sh = base.height * Math.abs(sy), rad = rotate * Math.PI / 180;
        const outW = Math.max(1, Math.ceil(Math.abs(sw * Math.cos(rad)) + Math.abs(sh * Math.sin(rad))) + 4);
        const outH = Math.max(1, Math.ceil(Math.abs(sw * Math.sin(rad)) + Math.abs(sh * Math.cos(rad))) + 4);
        const cx = base.left + base.width / 2, cy = base.top + base.height / 2;
        const left = cx - outW / 2, top = cy - outH / 2;
        preview.width = outW; preview.height = outH;
        Object.assign(preview.style, { left: left + "px", top: top + "px", width: outW + "px", height: outH + "px", visibility: "visible" });
        const ctx = preview.getContext("2d");
        ctx.clearRect(0, 0, outW, outH);
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate(rad);
        ctx.scale(sx, sy);
        ctx.drawImage(source, -base.width / 2, -base.height / 2, base.width, base.height);
        return scanAlpha(preview, { left, top }) || { left, top, width: outW, height: outH };
    }

    function apply(event) {
        if (!state.active || !state.snapshot) return;
        const dx = event.clientX - state.mx, dy = event.clientY - state.my;
        let sx = 1, sy = 1, rotate = 0;
        if (state.mode === "width") { const next = signedScale(state.scale[0], dx); sx = Math.abs(next) / Math.max(0.01, Math.abs(state.scale[0])); state.finalScale = [next, state.scale[1]]; }
        else if (state.mode === "height") { const next = signedScale(state.scale[1], dy); sy = Math.abs(next) / Math.max(0.01, Math.abs(state.scale[1])); state.finalScale = [state.scale[0], next]; }
        else if (state.mode === "uniform") { const ratio = Math.max(0.01, Math.abs(state.scale[0]) + dx) / Math.max(0.01, Math.abs(state.scale[0])); sx = ratio; sy = ratio; state.finalScale = [state.scale[0] * ratio, state.scale[1] * ratio]; }
        else if (state.mode === "rotate") {
            const rect = getBox()?.getBoundingClientRect() || state.rect;
            const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
            rotate = (Math.atan2(event.clientY - cy, event.clientX - cx) - Math.atan2(state.my - cy, state.mx - cx)) * 180 / Math.PI;
            state.finalDirection = state.dir + rotate;
            state.finalScale = state.scale.slice();
        }
        const rect = renderPreview(sx, sy, rotate);
        if (rect) place(rect);
    }

    function start(event, mode) {
        const vm = getVM(), canvas = getCanvas();
        if (!vm?.runtime?.renderer || !canvas || !api.snapshotLayer) return false;
        const target = vm.editingTarget;
        if (!target || target.isStage) return false;
        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;
        const rect = api.pixelBounds?.rect?.(vm, target, drawable, canvas) || api.snapshotLayer.screenRect(drawable.getAABB(), canvas, vm);
        const snapshot = api.snapshotLayer.makeSnapshot(vm, target, drawable, canvas, rect, 9998);
        const source = sourceFrom(snapshot);
        if (!snapshot || !source) return false;
        snapshot.style.visibility = "hidden";
        const preview = createPreview(rect);
        Object.assign(state, { active: true, target, drawable, canvas, snapshot, preview, source, occluders: api.snapshotLayer.createOccluders(vm, target, canvas), mode, rect, mx: event.clientX, my: event.clientY, dir: target.direction || 90, scale: drawable.scale ? drawable.scale.slice() : [100, 100], visible: drawable._visible !== false, finalScale: drawable.scale ? drawable.scale.slice() : [100, 100], finalDirection: target.direction || 90 });
        window.__transforkTransformActive = true;
        setVisible(vm, target, false);
        renderPreview(1, 1, 0);
        requestAnimationFrame(() => requestAnimationFrame(() => api.snapshotLayer.setVisible(state.occluders, true)));
        event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
        return true;
    }

    function finish(commit) {
        if (!state.active) return;
        const vm = getVM(), target = state.target, drawable = state.drawable;
        const nodes = [state.snapshot, state.preview].concat(state.occluders || []);
        if (commit && vm && target && drawable) {
            if (state.mode === "rotate") target.setDirection(state.finalDirection);
            drawable.updateScale(state.finalScale);
            target.emitVisualChange?.(); vm.runtime.requestRedraw?.();
        }
        if (vm && target) setVisible(vm, target, state.visible);
        nodes.forEach(node => { if (node?.parentNode) node.remove(); });
        state.snapshot = null; state.preview = null; state.source = null; state.occluders = []; state.active = false;
        window.__transforkTransformActive = false;
    }

    window.addEventListener("mousedown", event => { if (event.button !== 0 || state.active) return; const box = getBox(); if (!box || !box.contains(event.target)) return; const mode = modeFrom(event.target); if (mode) start(event, mode); }, true);
    window.addEventListener("mousemove", event => { if (state.active) { apply(event); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("mouseup", event => { if (state.active) { apply(event); finish(true); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("keydown", event => { if (event.key === "Escape" && state.active) { finish(false); event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); } }, true);
    window.addEventListener("blur", () => finish(false), true);

    api.registerModule260705_NS8Q2M("snapshotToolsPixel", { state, start, finish, renderPreview });
})();
