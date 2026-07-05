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

    function screenPoint(x, y, stageCanvas, activeVM) {
        const native = activeVM.runtime.renderer.getNativeSize();
        const rect = stageCanvas.getBoundingClientRect();
        return {
            x: rect.left + ((x + native[0] / 2) / native[0]) * rect.width,
            y: rect.top + ((native[1] / 2 - y) / native[1]) * rect.height
        };
    }

    function screenRect(bounds, stageCanvas, activeVM) {
        if (api.coords?.boundsToScreenRect) return api.coords.boundsToScreenRect(bounds, stageCanvas, activeVM);
        const tl = screenPoint(bounds.left, bounds.top, stageCanvas, activeVM);
        const br = screenPoint(bounds.right, bounds.bottom, stageCanvas, activeVM);
        return { left: tl.x, top: tl.y, width: br.x - tl.x, height: br.y - tl.y };
    }

    function costume(target) {
        return target?.sprite?.costumes?.[target.currentCostume] || null;
    }

    function source(costumeData) {
        if (!costumeData?.asset) return "";
        if (typeof costumeData.asset.encodeDataURI === "function") return costumeData.asset.encodeDataURI();
        if (typeof costumeData.asset.decodeText === "function") return "data:image/svg+xml;base64," + btoa(costumeData.asset.decodeText());
        return "";
    }

    function stageScale(stageCanvas, activeVM) {
        const rect = stageCanvas.getBoundingClientRect();
        const native = activeVM.runtime.renderer.getNativeSize();
        return native?.[0] ? rect.width / native[0] : 1;
    }

    function makeSnapshot(activeVM, target, drawable, stageCanvas, rect) {
        const costumeData = costume(target);
        const src = source(costumeData);
        if (!src) return null;
        const scale = drawable.scale || [target.size || 100, target.size || 100];
        const size = costumeData.size || [1, 1];
        const toScreen = stageScale(stageCanvas, activeVM);
        const imgW = Math.max(1, size[0] * Math.abs(scale[0]) / 100 * toScreen);
        const imgH = Math.max(1, size[1] * Math.abs(scale[1]) / 100 * toScreen);
        const direction = typeof target.direction === "number" ? target.direction : 90;
        const rotate = direction - 90;
        const flipX = scale[0] < 0 ? -1 : 1;
        const flipY = scale[1] < 0 ? -1 : 1;
        const ghost = typeof target.effects?.ghost === "number" ? target.effects.ghost : 0;
        const wrap = document.createElement("div");
        const img = document.createElement("img");

        Object.assign(wrap.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            pointerEvents: "none",
            zIndex: "9998",
            boxSizing: "border-box",
            userSelect: "none",
            overflow: "visible",
            background: "transparent",
            opacity: String(Math.max(0, Math.min(1, 1 - ghost / 100))),
            visibility: "hidden",
            transformOrigin: "50% 50%"
        });

        Object.assign(img.style, {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: imgW + "px",
            height: imgH + "px",
            maxWidth: "none",
            maxHeight: "none",
            objectFit: "fill",
            pointerEvents: "none",
            userSelect: "none",
            transformOrigin: "50% 50%",
            transform: "translate(-50%, -50%) rotate(" + rotate + "deg) scale(" + flipX + ", " + flipY + ")"
        });

        img.draggable = false;
        img.src = src;
        wrap.appendChild(img);
        document.body.appendChild(wrap);
        return wrap;
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
        if (api.selectionBox?.place) api.selectionBox.place(rect);
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
            const next = Math.max(0.01, Math.abs(state.startScale[0]) + dx);
            sx = next / Math.max(0.01, Math.abs(state.startScale[0]));
            state.finalScale = [Math.sign(state.startScale[0] || 1) * next, state.startScale[1]];
            box = centered(state.startRect, state.startRect.width * sx, state.startRect.height);
        }
        else if (state.mode === "height") {
            const next = Math.max(0.01, Math.abs(state.startScale[1]) + dy);
            sy = next / Math.max(0.01, Math.abs(state.startScale[1]));
            state.finalScale = [state.startScale[0], Math.sign(state.startScale[1] || 1) * next];
            box = centered(state.startRect, state.startRect.width, state.startRect.height * sy);
        }
        else if (state.mode === "uniform") {
            const base = Math.max(0.01, Math.abs(state.startScale[0]));
            const next = Math.max(0.01, base + dx);
            const ratio = next / base;
            sx = ratio;
            sy = ratio;
            state.finalScale = [state.startScale[0] * ratio, state.startScale[1] * ratio];
            box = centered(state.startRect, state.startRect.width * ratio, state.startRect.height * ratio);
        }
        else if (state.mode === "rotate") {
            const angle = Math.atan2(clientY - state.centerY, clientX - state.centerX);
            rot = (angle - state.startAngle) * 180 / Math.PI;
            state.finalDirection = state.startDirection + rot;
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

    function removeAfterRedraw(snapshot) {
        if (!snapshot) return;
        requestAnimationFrame(() => requestAnimationFrame(() => snapshot.parentNode && snapshot.remove()));
    }

    function clear() {
        state.active = false;
        state.ready = false;
        state.mode = "";
        state.target = null;
        state.drawable = null;
        state.canvas = null;
        state.snapshot = null;
        state.lastBox = null;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.frame = 0;
    }

    function finish(commit) {
        if (!state.active) return;
        const activeVM = vm();
        const target = state.target;
        const drawable = state.drawable;
        const snapshot = state.snapshot;
        const mode = state.mode;
        const startVisible = state.startVisible;
        if (state.frame) cancelAnimationFrame(state.frame);

        try {
            if (commit && activeVM && target && drawable) {
                if ((mode === "width" || mode === "height") && state.finalScale) {
                    drawable.updateScale(state.finalScale);
                    target.emitVisualChange?.();
                    activeVM.runtime.requestRedraw?.();
                }
                else if (mode === "uniform" && state.finalScale) {
                    const ratio = Math.abs(state.finalScale[0]) / Math.max(0.01, Math.abs(state.startScale[0]));
                    target.setSize(state.startSize * ratio);
                    target.emitVisualChange?.();
                    activeVM.runtime.requestRedraw?.();
                }
                else if (mode === "rotate") {
                    target.setDirection(state.finalDirection);
                    target.emitVisualChange?.();
                    activeVM.runtime.requestRedraw?.();
                }
                else if (mode === "skew" && window.AssetBakeEngine) {
                    const sx = state.finalShearX;
                    const sy = state.finalShearY;
                    window.AssetBakeEngine.bakeCurrentCostume((bakeCanvas, _ctx, _image, costumeData) => {
                        bakeSkew(bakeCanvas, costumeData, -sx, -sy);
                        return () => {
                            visible(activeVM, target, startVisible);
                            removeAfterRedraw(snapshot);
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
            removeAfterRedraw(snapshot);
        }
    }

    function start(event, mode) {
        const activeVM = vm();
        if (!activeVM?.runtime?.renderer) return false;
        const target = activeVM.editingTarget;
        if (!target || target.isStage) return false;
        const stageCanvas = canvas();
        if (!stageCanvas) return false;
        const drawable = activeVM.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;
        const rect = screenRect(drawable.getAABB(), stageCanvas, activeVM);
        const snap = makeSnapshot(activeVM, target, drawable, stageCanvas, rect);
        if (!snap) return false;
        const boxRect = overlay()?.getBoundingClientRect() || rect;

        Object.assign(state, {
            active: true,
            ready: false,
            mode,
            target,
            drawable,
            canvas: stageCanvas,
            snapshot: snap,
            frame: 0,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY,
            startDirection: target.direction || 90,
            startSize: target.size || 100,
            startScale: drawable.scale ? drawable.scale.slice() : [100, 100],
            startVisible: drawable._visible !== false,
            startRect: rect,
            finalScale: drawable.scale ? drawable.scale.slice() : [100, 100],
            finalDirection: target.direction || 90,
            finalShearX: 0,
            finalShearY: 0,
            centerX: boxRect.left + boxRect.width / 2,
            centerY: boxRect.top + boxRect.height / 2,
            startAngle: Math.atan2(event.clientY - (boxRect.top + boxRect.height / 2), event.clientX - (boxRect.left + boxRect.width / 2)),
            lastBox: rect
        });

        visible(activeVM, target, false);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (!state.active) return;
            state.ready = true;
            snap.style.visibility = "visible";
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

    api.registerModule260705_NS8Q2M("snapshotTools3", { state, bind, start, finish });
    bind();
})();
