window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const offscreen = document.createElement("canvas");
    const offctx = offscreen.getContext("2d");
    const cache = new Map();

    const MAIN = {
        IDLE: 0,
        WAIT_START_STABLE: 1,
        CAPTURE_UNTRIMMED_SNAPSHOT: 2,
        MEASURE_UNTRIMMED_PIVOT: 3,
        TRIM_ALPHA_PIXELS: 4,
        MEASURE_TRIMMED_PIVOT: 5,
        STORE_PIVOT_OFFSET: 6,
        HIDE_REAL_SPRITE: 7,
        ENTER_PREVIEW: 8,
        PAUSE_FOR_FRAME_LOOP: 9,
        STOP_FRAME_LOOP: 10,
        APPLY_FINAL_TRANSFORM: 11,
        WAIT_COMMIT_STABLE: 12,
        MEASURE_FINAL_CENTER: 13,
        COMPENSATE_FINAL_CENTER: 14,
        WAIT_COMPENSATE_STABLE: 15,
        RESTORE_REAL_SPRITE: 16,
        REMOVE_SNAPSHOT: 17
    };

    const FRAME = {
        IDLE: 100,
        READ_INPUT: 101,
        COMPUTE_PREVIEW: 102,
        DRAW_SNAPSHOT: 103,
        DRAW_BOX: 104
    };

    const sequence = {
        seq: MAIN.IDLE,
        frameSeq: FRAME.IDLE,
        frameRAF: 0,
        latestInput: null,
        currentPreview: null,
        starting: false,
        committing: false,
        pendingFinish: false,
        pendingCommit: true,
        run(id) {
            this.seq = id;
            window.__transforkTransformSeq = id;
        },
        frame(id) {
            this.frameSeq = id;
            window.__transforkTransformFrameSeq = id;
        },
        is(id) {
            return this.seq === id;
        },
        reset() {
            if (this.frameRAF) cancelAnimationFrame(this.frameRAF);
            this.seq = MAIN.IDLE;
            this.frameSeq = FRAME.IDLE;
            this.frameRAF = 0;
            this.latestInput = null;
            this.currentPreview = null;
            this.starting = false;
            this.committing = false;
            this.pendingFinish = false;
            this.pendingCommit = true;
            window.__transforkTransformSeq = this.seq;
            window.__transforkTransformFrameSeq = this.frameSeq;
        }
    };

    const state = {
        active: false,
        target: null,
        drawable: null,
        canvas: null,
        snapshot: null,
        source: null,
        occluders: [],
        mode: "",
        fullRect: null,
        rect: null,
        previewRect: null,
        desiredFinalCenter: null,
        measuredCenter: null,
        untrimmedPivot: null,
        trimmedPivot: null,
        pivotOffset: { x: 0, y: 0 },
        alphaBounds: null,
        mx: 0,
        my: 0,
        dir: 90,
        scale: [100, 100],
        visible: true,
        finalScale: [100, 100],
        finalDirection: 90
    };

    function getVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function getCanvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function getBox() {
        return api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
    }

    function readPointer(event) {
        return { clientX: event.clientX, clientY: event.clientY, target: event.target };
    }

    function modeFrom(element) {
        const text = String(element?.textContent || "").trim();
        if (element?.closest?.("#transform-alpha-container")) return "";
        if (text === "↻") return "rotate";
        if (text === "↔") return "width";
        if (text === "↕") return "height";
        if (text === "◲") return "uniform";
        return "";
    }

    function signedScale(value, delta) {
        return Math.sign(value || 1) * Math.max(0.01, Math.abs(value) + delta);
    }

    function center(rect) {
        return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    }

    function alphaValue(target) {
        const ghost = typeof target?.effects?.ghost === "number" ? target.effects.ghost : 0;
        return String(Math.max(0, Math.min(1, 1 - ghost / 100)));
    }

    function setVisible(vm, target, visible) {
        const renderer = vm.runtime.renderer;
        const drawable = renderer._allDrawables[target.drawableID];
        if (typeof renderer.updateDrawableVisible === "function") {
            renderer.updateDrawableVisible(target.drawableID, visible);
        }
        else if (drawable) {
            drawable._visible = visible;
        }
        target.emitVisualChange?.();
        vm.runtime.requestRedraw?.();
    }

    function waitForScratchStable() {
        const vm = getVM();
        vm?.runtime?.requestRedraw?.();
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    function normalizeExtracted(extracted) {
        if (!extracted) return null;
        if (extracted instanceof HTMLCanvasElement) return extracted.width && extracted.height ? extracted : null;
        if (typeof ImageBitmap !== "undefined" && extracted instanceof ImageBitmap) {
            const canvas = document.createElement("canvas");
            canvas.width = extracted.width;
            canvas.height = extracted.height;
            canvas.getContext("2d").drawImage(extracted, 0, 0);
            return canvas;
        }
        if (typeof ImageData !== "undefined" && extracted instanceof ImageData) {
            const canvas = document.createElement("canvas");
            canvas.width = extracted.width;
            canvas.height = extracted.height;
            canvas.getContext("2d").putImageData(extracted, 0, 0);
            return canvas;
        }
        if (extracted.imageData) return normalizeExtracted(extracted.imageData);
        if (extracted.data && extracted.width && extracted.height) {
            return normalizeExtracted(new ImageData(new Uint8ClampedArray(extracted.data), extracted.width, extracted.height));
        }
        return null;
    }

    function extractDrawableCanvas(vm, target) {
        const renderer = vm?.runtime?.renderer;
        if (!renderer || !target) return null;
        try {
            if (typeof renderer.extractDrawableScreenSpace === "function") {
                const canvas = normalizeExtracted(renderer.extractDrawableScreenSpace(target.drawableID));
                if (canvas) return canvas;
            }
        }
        catch (_error) {}
        try {
            if (typeof renderer.extractDrawable === "function") {
                return normalizeExtracted(renderer.extractDrawable(target.drawableID));
            }
        }
        catch (_error) {}
        return null;
    }

    function scanAlpha(canvas, origin) {
        if (!canvas?.width || !canvas?.height) return null;
        let data;
        try {
            data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        }
        catch (_error) {
            return null;
        }

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                if (data[(y * canvas.width + x) * 4 + 3] <= 5) continue;
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX < minX || maxY < minY) return null;
        return {
            left: origin.left + minX,
            top: origin.top + minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            raw: { minX, minY, maxX, maxY, width: canvas.width, height: canvas.height }
        };
    }

    function trimRectFromAlpha(fullRect, alpha) {
        if (!fullRect || !alpha?.raw) return fullRect;
        const raw = alpha.raw;
        return {
            left: fullRect.left + (raw.minX / raw.width) * fullRect.width,
            top: fullRect.top + (raw.minY / raw.height) * fullRect.height,
            width: ((raw.maxX - raw.minX + 1) / raw.width) * fullRect.width,
            height: ((raw.maxY - raw.minY + 1) / raw.height) * fullRect.height
        };
    }

    function boundsToScreen(bounds, canvas, vm) {
        const native = vm.runtime.renderer.getNativeSize();
        const rect = canvas.getBoundingClientRect();
        const left = rect.left + ((bounds.left + native[0] / 2) / native[0]) * rect.width;
        const top = rect.top + ((native[1] / 2 - bounds.top) / native[1]) * rect.height;
        const right = rect.left + ((bounds.right + native[0] / 2) / native[0]) * rect.width;
        const bottom = rect.top + ((native[1] / 2 - bounds.bottom) / native[1]) * rect.height;
        return { left, top, width: right - left, height: bottom - top };
    }

    function cacheKey(target, drawable, canvas) {
        const rect = canvas.getBoundingClientRect();
        const scale = drawable?.scale || [];
        return [target.id, target.drawableID, target.x, target.y, target.direction, target.currentCostume, scale[0], scale[1], rect.left, rect.top, rect.width, rect.height].join("|");
    }

    function idlePixelRect(vm, target, drawable, canvas) {
        const key = cacheKey(target, drawable, canvas);
        const cached = cache.get(key);
        if (cached) return cached;

        let source = null;
        try {
            if (typeof vm.runtime.renderer.extractDrawableScreenSpace === "function") {
                source = normalizeExtracted(vm.runtime.renderer.extractDrawableScreenSpace(target.drawableID));
            }
        }
        catch (_error) {}

        if (!source) return null;
        const alpha = scanAlpha(source, { left: 0, top: 0 });
        if (!alpha) return null;

        const full = boundsToScreen(drawable.getAABB(), canvas, vm);
        const rect = trimRectFromAlpha(full, alpha);
        cache.set(key, rect);
        if (cache.size > 80) cache.clear();
        return rect;
    }

    function makeCanvasSnapshot(source, rect, target, zIndex) {
        if (!source || !rect) return null;
        const cssWidth = Math.max(1, rect.width);
        const cssHeight = Math.max(1, rect.height);
        const ratio = Math.max(1, window.devicePixelRatio || 1);
        const snap = document.createElement("canvas");
        snap.width = Math.max(1, Math.round(cssWidth * ratio));
        snap.height = Math.max(1, Math.round(cssHeight * ratio));
        const ctx = snap.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.drawImage(source, 0, 0, cssWidth, cssHeight);
        Object.assign(snap.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: cssWidth + "px",
            height: cssHeight + "px",
            pointerEvents: "none",
            zIndex: String(zIndex || 9998),
            boxSizing: "border-box",
            userSelect: "none",
            background: "transparent",
            opacity: alphaValue(target),
            visibility: "hidden",
            transformOrigin: "50% 50%"
        });
        document.body.appendChild(snap);
        return snap;
    }

    function placeBox(rect) {
        const box = getBox();
        if (!box || !rect || box.style.display === "none") return;
        box.style.left = rect.left + "px";
        box.style.top = rect.top + "px";
        box.style.width = rect.width + "px";
        box.style.height = rect.height + "px";
        api.overlayTop?.bringBoxToTop?.();
    }

    function applyVisibleTransform(sx, sy, rotation) {
        if (!state.snapshot || !state.fullRect) return;
        state.snapshot.style.visibility = "visible";
        state.snapshot.style.transformOrigin = "50% 50%";
        state.snapshot.style.transform = "rotate(" + rotation + "deg) scale(" + sx + "," + sy + ")";
    }

    function scanTransform(sx, sy, rotation) {
        const source = state.source;
        const base = state.fullRect || state.rect;
        if (!source || !base) return null;
        if (Math.abs(sx - 1) < 0.0001 && Math.abs(sy - 1) < 0.0001 && Math.abs(rotation) < 0.0001) return state.rect || base;

        const radians = rotation * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const baseW = Math.max(1, base.width);
        const baseH = Math.max(1, base.height);
        const scaledW = baseW * Math.abs(sx);
        const scaledH = baseH * Math.abs(sy);
        const width = Math.max(1, Math.ceil(Math.abs(scaledW * cos) + Math.abs(scaledH * sin)));
        const height = Math.max(1, Math.ceil(Math.abs(scaledW * sin) + Math.abs(scaledH * cos)));
        const left = base.left + base.width / 2 - width / 2;
        const top = base.top + base.height / 2 - height / 2;

        offscreen.width = width;
        offscreen.height = height;
        offctx.setTransform(1, 0, 0, 1, 0, 0);
        offctx.clearRect(0, 0, width, height);
        offctx.translate(width / 2, height / 2);
        offctx.rotate(radians);
        offctx.scale(sx, sy);
        offctx.drawImage(source, -baseW / 2, -baseH / 2, baseW, baseH);

        return scanAlpha(offscreen, { left, top }) || { left, top, width, height };
    }

    function compute(input) {
        const dx = input.clientX - state.mx;
        const dy = input.clientY - state.my;
        let sx = 1;
        let sy = 1;
        let rotation = 0;

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
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            rotation = (Math.atan2(input.clientY - centerY, input.clientX - centerX) - Math.atan2(state.my - centerY, state.mx - centerX)) * 180 / Math.PI;
            state.finalDirection = state.dir + rotation;
            state.finalScale = state.scale.slice();
        }

        return { sx, sy, rotation };
    }

    function runFrameSequence() {
        sequence.frameRAF = 0;
        if (!state.active || !sequence.is(MAIN.PAUSE_FOR_FRAME_LOOP) || sequence.committing) return;

        sequence.frame(FRAME.READ_INPUT);
        const input = sequence.latestInput;
        if (!input) {
            sequence.frame(FRAME.IDLE);
            return;
        }

        sequence.frame(FRAME.COMPUTE_PREVIEW);
        const preview = compute(input);
        sequence.currentPreview = preview;

        sequence.frame(FRAME.DRAW_SNAPSHOT);
        const rect = scanTransform(preview.sx, preview.sy, preview.rotation);
        state.previewRect = rect;
        applyVisibleTransform(preview.sx, preview.sy, preview.rotation);

        sequence.frame(FRAME.DRAW_BOX);
        placeBox(rect);
        sequence.frame(FRAME.IDLE);
    }

    function queueFrame(input) {
        if (!state.active || !sequence.is(MAIN.PAUSE_FOR_FRAME_LOOP)) return;
        sequence.latestInput = input;
        if (!sequence.frameRAF) sequence.frameRAF = requestAnimationFrame(runFrameSequence);
    }

    function captureUntrimmedSnapshot(input, mode) {
        if (!sequence.is(MAIN.CAPTURE_UNTRIMMED_SNAPSHOT)) return false;

        const vm = getVM();
        const canvas = getCanvas();
        if (!vm?.runtime?.renderer || !canvas || !api.snapshotLayer) return false;

        const target = vm.editingTarget;
        if (!target || target.isStage) return false;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable?.getAABB) return false;

        const fullRect = api.snapshotLayer.screenRect(drawable.getAABB(), canvas, vm);
        const source = extractDrawableCanvas(vm, target);
        const alpha = scanAlpha(source, { left: 0, top: 0 });
        const visibleRect = alpha ? trimRectFromAlpha(fullRect, alpha) : (api.pixelBounds?.rect?.(vm, target, drawable, canvas) || fullRect);
        const snapshot = makeCanvasSnapshot(source, fullRect, target, 9998) || api.snapshotLayer.makeSnapshot(vm, target, drawable, canvas, visibleRect, 9998);
        if (!snapshot || !source) return false;

        Object.assign(state, {
            active: true,
            target,
            drawable,
            canvas,
            snapshot,
            source,
            occluders: api.snapshotLayer.createOccluders(vm, target, canvas),
            mode,
            fullRect,
            rect: visibleRect,
            previewRect: visibleRect,
            desiredFinalCenter: center(visibleRect),
            measuredCenter: null,
            untrimmedPivot: null,
            trimmedPivot: null,
            pivotOffset: { x: 0, y: 0 },
            alphaBounds: alpha,
            mx: input.clientX,
            my: input.clientY,
            dir: target.direction || 90,
            scale: drawable.scale ? drawable.scale.slice() : [100, 100],
            visible: drawable._visible !== false,
            finalScale: drawable.scale ? drawable.scale.slice() : [100, 100],
            finalDirection: target.direction || 90
        });

        sequence.latestInput = input;
        window.__transforkTransformActive = true;
        return true;
    }

    function measureUntrimmedPivot() {
        if (!sequence.is(MAIN.MEASURE_UNTRIMMED_PIVOT)) return;
        state.untrimmedPivot = center(state.fullRect);
    }

    function trimAlphaPixels() {
        if (!sequence.is(MAIN.TRIM_ALPHA_PIXELS)) return;
        if (state.alphaBounds && state.fullRect) state.rect = trimRectFromAlpha(state.fullRect, state.alphaBounds);
    }

    function measureTrimmedPivot() {
        if (!sequence.is(MAIN.MEASURE_TRIMMED_PIVOT)) return;
        state.trimmedPivot = center(state.rect);
    }

    function storePivotOffset() {
        if (!sequence.is(MAIN.STORE_PIVOT_OFFSET)) return;
        if (!state.untrimmedPivot || !state.trimmedPivot) return;
        state.pivotOffset = {
            x: state.trimmedPivot.x - state.untrimmedPivot.x,
            y: state.trimmedPivot.y - state.untrimmedPivot.y
        };
        window.__transforkPivotOffset = state.pivotOffset;
    }

    async function start(input, mode) {
        if (state.active || sequence.seq !== MAIN.IDLE || sequence.starting || sequence.committing) return false;

        sequence.starting = true;
        sequence.run(MAIN.WAIT_START_STABLE);
        await waitForScratchStable();

        sequence.run(MAIN.CAPTURE_UNTRIMMED_SNAPSHOT);
        if (!captureUntrimmedSnapshot(input, mode)) {
            cleanupState();
            sequence.reset();
            return false;
        }

        sequence.run(MAIN.MEASURE_UNTRIMMED_PIVOT);
        measureUntrimmedPivot();

        sequence.run(MAIN.TRIM_ALPHA_PIXELS);
        trimAlphaPixels();

        sequence.run(MAIN.MEASURE_TRIMMED_PIVOT);
        measureTrimmedPivot();

        sequence.run(MAIN.STORE_PIVOT_OFFSET);
        storePivotOffset();

        sequence.run(MAIN.HIDE_REAL_SPRITE);
        setVisible(getVM(), state.target, false);

        sequence.run(MAIN.ENTER_PREVIEW);
        applyVisibleTransform(1, 1, 0);
        placeBox(state.rect);
        api.snapshotLayer.setVisible([state.snapshot].concat(state.occluders), true);

        sequence.run(MAIN.PAUSE_FOR_FRAME_LOOP);
        sequence.starting = false;
        queueFrame(input);

        if (sequence.pendingFinish) finish(sequence.pendingCommit);
        return true;
    }

    function measureFinalCenter() {
        if (!sequence.is(MAIN.MEASURE_FINAL_CENTER)) return null;
        if (!api.pixelBounds?.rect) return null;
        const rect = api.pixelBounds.rect(getVM(), state.target, state.drawable, state.canvas);
        state.measuredCenter = center(rect);
        return state.measuredCenter;
    }

    function compensateFinalCenter() {
        if (!sequence.is(MAIN.COMPENSATE_FINAL_CENTER)) return;
        const desired = state.desiredFinalCenter || center(state.rect);
        if (!desired || !state.measuredCenter || !api.coords?.screenDeltaToScratch) return;

        const vm = getVM();
        const delta = api.coords.screenDeltaToScratch(desired.x - state.measuredCenter.x, desired.y - state.measuredCenter.y, state.canvas, vm);
        if (!delta) return;

        state.target.setXY(state.target.x + delta.x, state.target.y + delta.y);
        state.target.emitVisualChange?.();
        vm?.runtime?.requestRedraw?.();
    }

    function applyFinalTransform() {
        if (!sequence.is(MAIN.APPLY_FINAL_TRANSFORM)) return;
        const input = sequence.latestInput || { clientX: state.mx, clientY: state.my };
        const preview = compute(input);
        const rect = scanTransform(preview.sx, preview.sy, preview.rotation);
        state.previewRect = rect;

        if (state.mode === "rotate") state.target.setDirection(state.finalDirection);
        if (state.drawable?.updateScale) state.drawable.updateScale(state.finalScale);
        else api.drawable?.setScale?.(state.target, state.finalScale);

        state.target.emitVisualChange?.();
        getVM()?.runtime?.requestRedraw?.();
    }

    async function finish(commit) {
        if (!state.active && sequence.starting) {
            sequence.pendingFinish = true;
            sequence.pendingCommit = commit;
            return;
        }
        if (!state.active || sequence.committing) return;

        sequence.committing = true;
        const vm = getVM();
        const target = state.target;
        const nodes = [state.snapshot].concat(state.occluders || []);

        sequence.run(MAIN.STOP_FRAME_LOOP);
        if (sequence.frameRAF) cancelAnimationFrame(sequence.frameRAF);
        sequence.frameRAF = 0;
        sequence.frame(FRAME.IDLE);

        if (commit && vm && target && state.drawable) {
            sequence.run(MAIN.APPLY_FINAL_TRANSFORM);
            applyFinalTransform();

            sequence.run(MAIN.WAIT_COMMIT_STABLE);
            await waitForScratchStable();

            sequence.run(MAIN.MEASURE_FINAL_CENTER);
            measureFinalCenter();

            sequence.run(MAIN.COMPENSATE_FINAL_CENTER);
            compensateFinalCenter();

            sequence.run(MAIN.WAIT_COMPENSATE_STABLE);
            await waitForScratchStable();
        }

        if (vm && target) {
            sequence.run(MAIN.RESTORE_REAL_SPRITE);
            setVisible(vm, target, state.visible);
        }

        sequence.run(MAIN.REMOVE_SNAPSHOT);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            nodes.forEach(node => {
                if (node?.parentNode) node.remove();
            });
        }));

        cleanupState();
        sequence.reset();
    }

    function cleanupState() {
        Object.assign(state, {
            active: false,
            target: null,
            drawable: null,
            canvas: null,
            snapshot: null,
            source: null,
            occluders: [],
            mode: "",
            fullRect: null,
            rect: null,
            previewRect: null,
            desiredFinalCenter: null,
            measuredCenter: null,
            untrimmedPivot: null,
            trimmedPivot: null,
            pivotOffset: { x: 0, y: 0 },
            alphaBounds: null
        });
        window.__transforkTransformActive = false;
    }

    function idleLoop() {
        requestAnimationFrame(idleLoop);
        if (state.active || sequence.seq !== MAIN.IDLE) return;

        const vm = getVM();
        const canvas = getCanvas();
        const target = vm?.editingTarget;
        if (!vm || !canvas || !target || target.isStage) return;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable || drawable._visible === false || typeof drawable.getAABB !== "function") return;

        const rect = api.pixelBounds?.rect?.(vm, target, drawable, canvas) || idlePixelRect(vm, target, drawable, canvas);
        if (rect) placeBox(rect);
    }

    function ownsInput() {
        return state.active || sequence.seq !== MAIN.IDLE || sequence.starting || sequence.committing;
    }

    window.addEventListener("mousedown", event => {
        if (event.button !== 0 || ownsInput()) return;
        const box = getBox();
        if (!box || !box.contains(event.target)) return;
        const mode = modeFrom(event.target);
        if (!mode) return;
        start(readPointer(event), mode);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    window.addEventListener("mousemove", event => {
        if (!ownsInput()) return;
        if (state.active) queueFrame(readPointer(event));
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    window.addEventListener("mouseup", event => {
        if (!ownsInput()) return;
        if (state.active) queueFrame(readPointer(event));
        finish(true);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    window.addEventListener("keydown", event => {
        if (event.key !== "Escape" || !ownsInput()) return;
        finish(false);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    window.addEventListener("blur", () => finish(false), true);

    idleLoop();

    api.registerModule260705_NS8Q2M("snapshotToolsPixel", {
        state,
        sequence,
        start,
        finish,
        queueFrame,
        idlePixelRect,
        waitForScratchStable
    });
})();