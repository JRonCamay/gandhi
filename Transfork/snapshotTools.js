window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const toolState260705_ST9Q6L = {
        active: false,
        ready: false,
        mode: "",
        target: null,
        drawable: null,
        canvas: null,
        snapshot: null,
        startMouseX: 0,
        startMouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        startDirection: 90,
        startSize: 100,
        startScale: [100, 100],
        startVisible: true,
        startScreenRect: null,
        finalScale: null,
        finalDirection: 90,
        finalShearX: 0,
        finalShearY: 0,
        rotateCenterX: 0,
        rotateCenterY: 0,
        startAngle: 0
    };

    function getVM260705_VM8T2C() {
        return api.vm && api.vm.getVM ? api.vm.getVM() : window.vm || null;
    }

    function getCanvas260705_CN6M7H() {
        return api.coords && api.coords.getStageCanvas ? api.coords.getStageCanvas() : document.querySelector("canvas");
    }

    function getScreenRect260705_SR7C3P(bounds, canvas, vm) {
        if (api.coords && api.coords.boundsToScreenRect) {
            return api.coords.boundsToScreenRect(bounds, canvas, vm);
        }

        const nativeSize = vm.runtime.renderer.getNativeSize();
        const rect = canvas.getBoundingClientRect();
        const left = rect.left + ((bounds.left + nativeSize[0] / 2) / nativeSize[0]) * rect.width;
        const top = rect.top + ((nativeSize[1] / 2 - bounds.top) / nativeSize[1]) * rect.height;
        const right = rect.left + ((bounds.right + nativeSize[0] / 2) / nativeSize[0]) * rect.width;
        const bottom = rect.top + ((nativeSize[1] / 2 - bounds.bottom) / nativeSize[1]) * rect.height;

        return {
            left,
            top,
            width: right - left,
            height: bottom - top
        };
    }

    function getCurrentCostume260705_CC5H8R(target) {
        if (!target || !target.sprite || !target.sprite.costumes) return null;
        return target.sprite.costumes[target.currentCostume] || null;
    }

    function getCostumeSource260705_CS9W4D(costume) {
        if (!costume || !costume.asset) return "";

        if (typeof costume.asset.encodeDataURI === "function") {
            return costume.asset.encodeDataURI();
        }

        if (typeof costume.asset.decodeText === "function") {
            return "data:image/svg+xml;base64," + btoa(costume.asset.decodeText());
        }

        return "";
    }

    function getNativeToScreenScale260705_NS5C7Q(canvas, vm) {
        const rect = canvas.getBoundingClientRect();
        const nativeSize = vm.runtime.renderer.getNativeSize();
        if (!nativeSize || !nativeSize[0]) return 1;
        return rect.width / nativeSize[0];
    }

    function createSnapshot260705_CP8M4J(vm, target, drawable, canvas, screenRect) {
        const costume = getCurrentCostume260705_CC5H8R(target);
        const source = getCostumeSource260705_CS9W4D(costume);
        if (!source) return null;

        const wrapper = document.createElement("div");
        const image = document.createElement("img");
        const stageScale = getNativeToScreenScale260705_NS5C7Q(canvas, vm);
        const costumeSize = costume && costume.size ? costume.size : [1, 1];
        const scale = drawable && drawable.scale ? drawable.scale : [target.size || 100, target.size || 100];
        const width = Math.max(1, costumeSize[0] * Math.abs(scale[0]) / 100 * stageScale);
        const height = Math.max(1, costumeSize[1] * Math.abs(scale[1]) / 100 * stageScale);
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
            opacity: String(Math.max(0, Math.min(1, 1 - ghost / 100))),
            visibility: "hidden",
            transformOrigin: "50% 50%"
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

    function setDrawableVisible260705_DV3P6B(vm, target, visible) {
        if (!vm || !target) return;

        const renderer = vm.runtime.renderer;
        if (typeof renderer.updateDrawableVisible === "function") {
            renderer.updateDrawableVisible(target.drawableID, visible);
        }
        else {
            const drawable = renderer._allDrawables[target.drawableID];
            if (drawable) drawable._visible = visible;
        }

        if (typeof target.emitVisualChange === "function") target.emitVisualChange();
        if (typeof vm.runtime.requestRedraw === "function") vm.runtime.requestRedraw();
    }

    function updateBox260705_UB7K6N(rect) {
        if (!api.selectionBox || !api.selectionBox.place) return;
        api.selectionBox.place(rect);
    }

    function centeredRect260705_CR8D5Y(rect, width, height) {
        return {
            left: rect.left + rect.width / 2 - width / 2,
            top: rect.top + rect.height / 2 - height / 2,
            width,
            height
        };
    }

    function rotatedRect260705_RR4H9Q(rect, deg) {
        const rad = deg * Math.PI / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        return centeredRect260705_CR8D5Y(
            rect,
            rect.width * cos + rect.height * sin,
            rect.width * sin + rect.height * cos
        );
    }

    function classifyHandle260705_CH3N8T(target) {
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

    function getOverlay260705_GO5C2B() {
        return api.selectionBox && api.selectionBox.getBox ? api.selectionBox.getBox() : document.querySelector("#gandi-transform-box");
    }

    function applyPreview260705_AP2W8V(clientX, clientY) {
        const state = toolState260705_ST9Q6L;
        if (!state.active) return;

        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
        if (!state.ready || !state.snapshot) return;

        const dx = clientX - state.startMouseX;
        const dy = clientY - state.startMouseY;
        let scaleX = 1;
        let scaleY = 1;
        let rotate = 0;
        let skewX = 0;
        let skewY = 0;
        let boxRect = state.startScreenRect;

        if (state.mode === "width") {
            const next = Math.max(0.01, Math.abs(state.startScale[0]) + dx);
            scaleX = next / Math.max(0.01, Math.abs(state.startScale[0]));
            state.finalScale = [Math.sign(state.startScale[0] || 1) * next, state.startScale[1]];
            boxRect = centeredRect260705_CR8D5Y(
                state.startScreenRect,
                state.startScreenRect.width * scaleX,
                state.startScreenRect.height
            );
        }
        else if (state.mode === "height") {
            const next = Math.max(0.01, Math.abs(state.startScale[1]) + dy);
            scaleY = next / Math.max(0.01, Math.abs(state.startScale[1]));
            state.finalScale = [state.startScale[0], Math.sign(state.startScale[1] || 1) * next];
            boxRect = centeredRect260705_CR8D5Y(
                state.startScreenRect,
                state.startScreenRect.width,
                state.startScreenRect.height * scaleY
            );
        }
        else if (state.mode === "uniform") {
            const base = Math.max(0.01, Math.abs(state.startScale[0]));
            const next = Math.max(0.01, base + dx);
            const ratio = next / base;
            scaleX = ratio;
            scaleY = ratio;
            state.finalScale = [state.startScale[0] * ratio, state.startScale[1] * ratio];
            boxRect = centeredRect260705_CR8D5Y(
                state.startScreenRect,
                state.startScreenRect.width * ratio,
                state.startScreenRect.height * ratio
            );
        }
        else if (state.mode === "rotate") {
            const angle = Math.atan2(
                clientY - state.rotateCenterY,
                clientX - state.rotateCenterX
            );
            rotate = (angle - state.startAngle) * 180 / Math.PI;
            state.finalDirection = state.startDirection + rotate;
            boxRect = rotatedRect260705_RR4H9Q(state.startScreenRect, rotate);
        }
        else if (state.mode === "skew") {
            state.finalShearX = dx / 200;
            state.finalShearY = dy / 200;
            skewX = Math.atan(state.finalShearX) * 180 / Math.PI;
            skewY = Math.atan(state.finalShearY) * 180 / Math.PI;
        }

        state.snapshot.style.transform =
            "scale(" + scaleX + ", " + scaleY + ") " +
            "rotate(" + rotate + "deg) " +
            "skew(" + skewX + "deg, " + skewY + "deg)";

        updateBox260705_UB7K6N(boxRect);
    }

    function bakeSkewToCanvas260705_BS6P4M(canvas, costume, shearX, shearY) {
        if (!canvas || (!shearX && !shearY)) return;

        const width = canvas.width;
        const height = canvas.height;
        const source = document.createElement("canvas");
        source.width = width;
        source.height = height;
        source.getContext("2d").drawImage(canvas, 0, 0);

        const cx = width / 2;
        const cy = height / 2;
        const points = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height]
        ].map(point => ({
            x: point[0] + (point[1] - cy) * shearX,
            y: point[1] + (point[0] - cx) * shearY
        }));

        const minX = Math.floor(Math.min(...points.map(point => point.x)));
        const minY = Math.floor(Math.min(...points.map(point => point.y)));
        const maxX = Math.ceil(Math.max(...points.map(point => point.x)));
        const maxY = Math.ceil(Math.max(...points.map(point => point.y)));

        canvas.width = Math.max(1, maxX - minX);
        canvas.height = Math.max(1, maxY - minY);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, shearY, shearX, 1, -shearX * cy - minX, -shearY * cx - minY);
        ctx.drawImage(source, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const rotationCenterX = typeof costume.rotationCenterX === "number" ? costume.rotationCenterX : cx;
        const rotationCenterY = typeof costume.rotationCenterY === "number" ? costume.rotationCenterY : cy;
        canvas.__gandhiBakeRotationCenterX = rotationCenterX - minX;
        canvas.__gandhiBakeRotationCenterY = rotationCenterY - minY;
    }

    function removeSnapshotAfterRedraw260705_RS9J2H(snapshot) {
        if (!snapshot) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (snapshot.parentNode) snapshot.remove();
            });
        });
    }

    function clear260705_CL4R9S() {
        const state = toolState260705_ST9Q6L;
        state.active = false;
        state.ready = false;
        state.mode = "";
        state.target = null;
        state.drawable = null;
        state.canvas = null;
        state.snapshot = null;
        state.finalScale = null;
    }

    function finish260705_FN7G2Q(commit) {
        const state = toolState260705_ST9Q6L;
        if (!state.active) return;

        const vm = getVM260705_VM8T2C();
        const target = state.target;
        const drawable = state.drawable;
        const snapshot = state.snapshot;
        const mode = state.mode;
        const finalScale = state.finalScale;
        const finalDirection = state.finalDirection;
        const finalShearX = state.finalShearX;
        const finalShearY = state.finalShearY;
        const startVisible = state.startVisible;

        try {
            if (commit && vm && target && drawable) {
                if ((mode === "width" || mode === "height") && finalScale) {
                    drawable.updateScale(finalScale);
                    if (typeof target.emitVisualChange === "function") target.emitVisualChange();
                    vm.runtime.requestRedraw();
                }
                else if (mode === "uniform" && finalScale) {
                    const ratio = Math.abs(finalScale[0]) / Math.max(0.01, Math.abs(state.startScale[0]));
                    target.setSize(state.startSize * ratio);
                    if (typeof target.emitVisualChange === "function") target.emitVisualChange();
                    vm.runtime.requestRedraw();
                }
                else if (mode === "rotate") {
                    target.setDirection(finalDirection);
                    if (typeof target.emitVisualChange === "function") target.emitVisualChange();
                    vm.runtime.requestRedraw();
                }
                else if (mode === "skew" && window.AssetBakeEngine) {
                    window.AssetBakeEngine.bakeCurrentCostume(
                        (canvas, _ctx, _image, costume) => {
                            bakeSkewToCanvas260705_BS6P4M(
                                canvas,
                                costume,
                                -finalShearX,
                                -finalShearY
                            );

                            return () => {
                                setDrawableVisible260705_DV3P6B(vm, target, startVisible);
                                removeSnapshotAfterRedraw260705_RS9J2H(snapshot);
                            };
                        },
                        target
                    );
                    clear260705_CL4R9S();
                    return;
                }
            }

            if (vm && target) {
                setDrawableVisible260705_DV3P6B(vm, target, startVisible);
            }
        }
        finally {
            clear260705_CL4R9S();
            removeSnapshotAfterRedraw260705_RS9J2H(snapshot);
        }
    }

    function start260705_ST8F3M(event, mode) {
        const vm = getVM260705_VM8T2C();
        if (!vm || !vm.runtime || !vm.runtime.renderer) return false;

        const target = vm.editingTarget;
        if (!target || target.isStage) return false;

        const canvas = getCanvas260705_CN6M7H();
        if (!canvas) return false;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable || typeof drawable.getAABB !== "function") return false;

        const bounds = drawable.getAABB();
        const screenRect = getScreenRect260705_SR7C3P(bounds, canvas, vm);
        const snapshot = createSnapshot260705_CP8M4J(vm, target, drawable, canvas, screenRect);
        if (!snapshot) return false;

        const overlayRect = getOverlay260705_GO5C2B()?.getBoundingClientRect() || {
            left: screenRect.left,
            top: screenRect.top,
            width: screenRect.width,
            height: screenRect.height
        };

        Object.assign(toolState260705_ST9Q6L, {
            active: true,
            ready: false,
            mode,
            target,
            drawable,
            canvas,
            snapshot,
            startMouseX: event.clientX,
            startMouseY: event.clientY,
            lastMouseX: event.clientX,
            lastMouseY: event.clientY,
            startDirection: target.direction || 90,
            startSize: target.size || 100,
            startScale: drawable.scale ? drawable.scale.slice() : [100, 100],
            startVisible: drawable._visible !== false,
            startScreenRect: screenRect,
            finalScale: drawable.scale ? drawable.scale.slice() : [100, 100],
            finalDirection: target.direction || 90,
            finalShearX: 0,
            finalShearY: 0,
            rotateCenterX: overlayRect.left + overlayRect.width / 2,
            rotateCenterY: overlayRect.top + overlayRect.height / 2,
            startAngle: Math.atan2(
                event.clientY - (overlayRect.top + overlayRect.height / 2),
                event.clientX - (overlayRect.left + overlayRect.width / 2)
            )
        });

        setDrawableVisible260705_DV3P6B(vm, target, false);
        requestAnimationFrame(() => {
            if (!toolState260705_ST9Q6L.active) return;
            toolState260705_ST9Q6L.ready = true;
            snapshot.style.visibility = "visible";
            applyPreview260705_AP2W8V(event.clientX, event.clientY);
        });

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function bind260705_BD6Q9N() {
        window.addEventListener(
            "mousedown",
            event => {
                if (event.button !== 0) return;
                if (toolState260705_ST9Q6L.active) return;

                const overlay = getOverlay260705_GO5C2B();
                if (!overlay || !overlay.contains(event.target)) return;

                const mode = classifyHandle260705_CH3N8T(event.target);
                if (!mode) return;

                start260705_ST8F3M(event, mode);
            },
            true
        );

        window.addEventListener(
            "mousemove",
            event => {
                if (!toolState260705_ST9Q6L.active) return;
                applyPreview260705_AP2W8V(event.clientX, event.clientY);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            true
        );

        window.addEventListener(
            "mouseup",
            event => {
                if (!toolState260705_ST9Q6L.active) return;
                applyPreview260705_AP2W8V(event.clientX, event.clientY);
                finish260705_FN7G2Q(true);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            true
        );

        window.addEventListener(
            "keydown",
            event => {
                if (event.key !== "Escape" || !toolState260705_ST9Q6L.active) return;
                finish260705_FN7G2Q(false);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            },
            true
        );

        window.addEventListener(
            "blur",
            () => finish260705_FN7G2Q(false),
            true
        );
    }

    api.registerModule260705_NS8Q2M("snapshotTools", {
        state: toolState260705_ST9Q6L,
        bind: bind260705_BD6Q9N,
        start: start260705_ST8F3M,
        finish: finish260705_FN7G2Q
    });

    bind260705_BD6Q9N();
})();
