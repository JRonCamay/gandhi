window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const state = {
        active: false,
        ready: false,
        mode: "",
        target: null,
        drawable: null,
        canvas: null,
        snapshot: null,
        occluders: [],
        frame: 0,
        startMouseX: 0,
        startMouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        startDirection: 90,
        startSize: 100,
        startScale: [100, 100],
        startVisible: true,
        startRect: null,
        finalScale: null,
        finalDirection: 90,
        finalShearX: 0,
        finalShearY: 0,
        centerX: 0,
        centerY: 0,
        startAngle: 0,
        lastBox: null
    };

    function vm() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function canvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function overlay() {
        return api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
    }

    function visible(activeVM, target, value) {
        const renderer = activeVM.runtime.renderer;
        if (typeof renderer.updateDrawableVisible === "function") renderer.updateDrawableVisible(target.drawableID, value);
        else {
            const drawable = renderer._allDrawables[target.drawableID];
            if (drawable) drawable._visible = value;
        }
        target.emitVisualChange?.();
        activeVM.runtime.requestRedraw?.();
    }

    function placeBox(rect) {
        state.lastBox = rect;
        api.overlayTop?.bringBoxToTop?.();
        if (api.selectionBox?.place) api.selectionBox.place(rect);
        api.overlayTop?.bringBoxToTop?.();
    }

    function centered(rect, width, height) {
        return { left: rect.left + rect.width / 2 - width / 2, top: rect.top + rect.height / 2 - height / 2, width, height };
    }

    function rotated(rect, deg) {
        const rad = deg * Math.PI / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        return centered(rect, rect.width * cos + rect.height * sin, rect.width * sin + rect.height * cos);
    }

    function skewed(rect, sx, sy) {
        return centered(rect, rect.width + Math.abs(sx) * rect.height, rect.height + Math.abs(sy) * rect.width);
    }

    function classify(target) {
        if (!target) return "";
        const text = String(target.textContent || "").trim();
        const cursor = getComputedStyle(target).cursor;
        if (text === "✥") return "";
        if (text === "↻" || cursor === "grab" || cursor === "grabbing") return "rotate";
        if (text === "↔" || cursor === "ew-resize") return "width";
        if (text === "↕" || cursor === "ns-resize") return "height";
        if (text === "◲" || cursor === "nwse-resize" || cursor === "nesw-resize") return "uniform";
        if (text.includes("Skew")) return "skew";
        return "";
    }

    function signedScaleNext(startValue, delta) {
        const sign = Math.sign(startValue || 1);
        return sign * Math.max(0.01, Math.abs(startValue) + delta);
    }

    function apply(clientX, clientY) {
        if (!state.active) return;
        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
        if (!state.ready || !state.snapshot) return;

        const dx = clientX - state.startMouseX;
        const dy = clientY - state.startMouseY;
        let sx = 1;
        let sy = 1;
        let rot = 0;
        let skewXDeg = 0;
        let skewYDeg = 0;
        let box = state.startRect;

        if (state.mode === "width") {
            const nextX = signedScaleNext(state.startScale[0], dx);
            sx = Math.abs(nextX) / Math.max(0.01, Math.abs(state.startScale[0]));
            state.finalScale = [nextX, state.startScale[1]];
            box = centered(state.startRect, state.startRect.width * sx, state.startRect.height);
        }
        else if (state.mode === "height") {
            const nextY = signedScaleNext(state.startScale[1], dy);
            sy = Math.abs(nextY) / Math.max(0.01, Math.abs(state.startScale[1]));
            state.finalScale = [state.startScale[0], nextY];
            box = centered(state.startRect, state.startRect.width, state.startRect.height * sy);
        }
        else if (state.mode === "uniform") {
            const base = Math.max(0.01, Math.abs(state.startScale[0]));
            const ratio = Math.max(0.01, base + dx) / base;
            sx = ratio;
            sy = ratio;
            state.finalScale = [state.startScale[0] * ratio, state.startScale[1] * ratio];
            box = centered(state.startRect, state.startRect.width * ratio, state.startRect.height * ratio);
        }
        else if (state.mode === "rotate") {
            const angle = Math.atan2(clientY - state.centerY, clientX - state.centerX);
            rot = (angle - state.startAngle) * 180 / Math.PI;
            state.finalDirection = state.startDirection + rot;
            state.finalScale = state.startScale.slice();
            box = rotated(state.startRect, rot);
        }
        else if (state.mode === "skew") {
            state.finalShearX = dx / 200;
            state.finalShearY = dy / 200;
            skewXDeg = Math.atan(state.finalShearX) * 180 / Math.PI;
            skewYDeg = Math.atan(state.finalShearY) * 180 / Math.PI;
            box = skewed(state.startRect, state.finalShearX, state.finalShearY);
        }

        state.snapshot.style.transform = "scale(" + sx + ", " + sy + ") rotate(" + rot + "deg) skew(" + skewXDeg + "deg, " + skewYDeg + "deg)";
        placeBox(box);
    }

    function loop() {
        if (!state.active) return;
        apply(state.lastMouseX, state.lastMouseY);
        if (state.lastBox) placeBox(state.lastBox);
        state.frame = requestAnimationFrame(loop);
    }

    function bakeSkew(canvas, costumeData, shearX, shearY) {
        if (!canvas || (!shearX && !shearY)) return;
        const width = canvas.width;
        const height = canvas.height;
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        sourceCanvas.getContext("2d").drawImage(canvas, 0, 0);
        const cx = width / 2;
        const cy = height / 2;
        const points = [[0, 0], [width, 0], [width, height], [0, height]].map(point => ({ x: point[0] + (point[1] - cy) * shearX, y: point[1] + (point[0] - cx) * shearY }));
        const minX = Math.floor(Math.min(...points.map(point => point.x)));
        const minY = Math.floor(Math.min(...points.map(point => point.y)));
        const maxX = Math.ceil(Math.max(...points.map(point => point.x)));
        const maxY = Math.ceil(Math.max(...points.map(point => point.y)));
        canvas.width = Math.max(1, maxX - minX);
        canvas.height = Math.max(1, maxY - minY);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, shearY, shearX, 1, -shearX * cy - minX, -shearY * cx - minY);
        ctx.drawImage(sourceCanvas, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const rcx = typeof costumeData.rotationCenterX === "number" ? costumeData.rotationCenterX : cx;
        const rcy = typeof costumeData.rotationCenterY === "number" ? costumeData.rotationCenterY : cy;
        canvas.__gandhiBakeRotationCenterX = rcx - minX;
        canvas.__gandhiBakeRotationCenterY = rcy - minY;
    }

    function removeAfterRedraw(nodes) {
        requestAnimationFrame(() => requestAnimationFrame(() => api.snapshotLayer?.remove(nodes || [])));
    }

    function clear() {
        state.active = false;
        state.ready = false;
        state.mode = "";
        state.target = null;
        state.drawable = null;
        state.canvas = null;
        state.snapshot = null;
        state.occluders = [];
        state.lastBox = null;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.frame = 0;
    }

    function commitScale(drawable, scale) {
        if (!drawable || !scale) return;
        drawable.updateScale(scale.slice());
    }

    function finish(commit) {
        if (!state.active) return;
        const activeVM = vm();
        const target = state.target;
        const drawable = state.drawable;
        const nodes = [state.snapshot].concat(state.occluders || []);
        const mode = state.mode;
        const startVisible = state.startVisible;
        const finalScale = state.finalScale ? state.finalScale.slice() : state.startScale.slice();
        if (state.frame) cancelAnimationFrame(state.frame);

        try {
            if (commit && activeVM && target && drawable) {
                if (mode === "width" || mode === "height" || mode === "uniform") {
                    commitScale(drawable, finalScale);
                    target.emitVisualChange?.();
                    activeVM.runtime.requestRedraw?.();
                }
                else if (mode === "rotate") {
                    target.setDirection(state.finalDirection);
                    commitScale(drawable, finalScale);
                    target.emitVisualChange?.();
                    activeVM.runtime.requestRedraw?.();
                }
                else if (mode === "skew" && window.AssetBakeEngine) {
                    const sx = state.finalShearX;
                    const sy = state.finalShearY;
                    window.AssetBakeEngine.bakeCurrentCostume((bakeCanvas, _ctx, _image, costumeData) => {
                        bakeSkew(bakeCanvas, costumeData, -sx, -sy);
                        return () => {
                            commitScale(drawable, finalScale);
                            visible(activeVM, target, startVisible);
                            removeAfterRedraw(nodes);
                        };
                    }, target);
                    clear();
                    return;
                }
            }

            if (activeVM && target) visible(activeVM, target, startVisible);
        }
        finally {
            clear();
            removeAfterRedraw(nodes);
        }
    }

    function start(event, mode) {
        const activeVM = vm();
        if (!activeVM?.runtime?.renderer || !api.snapshotLayer) return false;
        const target = activeVM.editingTarget;
        if (!target || target.isStage) return false;
        const stageCanvas = canvas();
        if (!stageCanvas) return false;
        const drawable = activeVM.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;
        const rect = api.snapshotLayer.screenRect(drawable.getAABB(), stageCanvas, activeVM);
        const snap = api.snapshotLayer.makeSnapshot(activeVM, target, drawable, stageCanvas, rect, 9998);
        if (!snap) return false;
        const occluders = api.snapshotLayer.createOccluders(activeVM, target, stageCanvas);
        const boxRect = overlay()?.getBoundingClientRect() || rect;
        const currentScale = drawable.scale ? drawable.scale.slice() : [100, 100];

        Object.assign(state, {
            active: true,
            ready: false,
            mode,
            target,
            drawable,
            canvas: stageCanvas,
            snapshot: snap,
            occluders,
            frame: 0,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY,
            startDirection: target.direction || 90,
            startSize: target.size || 100,
            startScale: currentScale,
            startVisible: drawable._visible !== false,
            startRect: rect,
            finalScale: currentScale.slice(),
            finalDirection: target.direction || 90,
            finalShearX: 0,
            finalShearY: 0,
            centerX: boxRect.left + boxRect.width / 2,
            centerY: boxRect.top + boxRect.height / 2,
            startAngle: Math.atan2(event.clientY - (boxRect.top + boxRect.height / 2), event.clientX - (boxRect.left + boxRect.width / 2)),
            lastBox: rect
        });

        window.__transforkTransformActive = true;
        visible(activeVM, target, false);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (!state.active) return;
            state.ready = true;
            api.snapshotLayer.setVisible([snap].concat(occluders), true);
            apply(event.clientX, event.clientY);
            loop();
        }));

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function bind() {
        window.addEventListener("mousedown", event => {
            if (event.button !== 0 || state.active) return;
            const root = overlay();
            if (!root || !root.contains(event.target)) return;
            const mode = classify(event.target);
            if (!mode) return;
            start(event, mode);
        }, true);

        window.addEventListener("mousemove", event => {
            if (!state.active) return;
            apply(event.clientX, event.clientY);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("mouseup", event => {
            if (!state.active) return;
            apply(event.clientX, event.clientY);
            finish(true);
            window.__transforkTransformActive = false;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("keydown", event => {
            if (event.key !== "Escape" || !state.active) return;
            finish(false);
            window.__transforkTransformActive = false;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener("blur", () => {
            finish(false);
            window.__transforkTransformActive = false;
        }, true);
    }

    api.registerModule260705_NS8Q2M("snapshotTools5", { state, bind, start, finish });
    bind();
})();
