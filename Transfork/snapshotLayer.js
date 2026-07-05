window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function getCostume260705_LY7D2Q(target) {
        return target?.sprite?.costumes?.[target.currentCostume] || null;
    }

    function getSource260705_LY8M4W(costume) {
        if (!costume?.asset) return "";
        if (typeof costume.asset.encodeDataURI === "function") return costume.asset.encodeDataURI();
        if (typeof costume.asset.decodeText === "function") return "data:image/svg+xml;base64," + btoa(costume.asset.decodeText());
        return "";
    }

    function screenRect260705_LY4C8N(bounds, canvas, vm) {
        if (api.coords?.boundsToScreenRect) return api.coords.boundsToScreenRect(bounds, canvas, vm);

        const native = vm.runtime.renderer.getNativeSize();
        const rect = canvas.getBoundingClientRect();
        const left = rect.left + ((bounds.left + native[0] / 2) / native[0]) * rect.width;
        const top = rect.top + ((native[1] / 2 - bounds.top) / native[1]) * rect.height;
        const right = rect.left + ((bounds.right + native[0] / 2) / native[0]) * rect.width;
        const bottom = rect.top + ((native[1] / 2 - bounds.bottom) / native[1]) * rect.height;
        return { left, top, width: right - left, height: bottom - top };
    }

    function stageScale260705_LY5S1X(canvas, vm) {
        const rect = canvas.getBoundingClientRect();
        const native = vm.runtime.renderer.getNativeSize();
        return native?.[0] ? rect.width / native[0] : 1;
    }

    function makeSnapshot260705_LY9P3K(vm, target, drawable, canvas, rect, zIndex) {
        const costume = getCostume260705_LY7D2Q(target);
        const src = getSource260705_LY8M4W(costume);
        if (!src) return null;

        const scale = drawable?.scale || [target.size || 100, target.size || 100];
        const size = costume.size || [1, 1];
        const toScreen = stageScale260705_LY5S1X(canvas, vm);
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
            zIndex: String(zIndex || 9998),
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

    function getDrawList260705_LY6V2B(renderer) {
        if (Array.isArray(renderer._drawList)) return renderer._drawList;
        if (Array.isArray(renderer._allDrawables)) {
            return renderer._allDrawables.map((drawable, id) => drawable ? id : null).filter(id => id !== null);
        }
        return [];
    }

    function targetByDrawable260705_LY2T9H(vm, drawableID) {
        return vm.runtime.targets.find(target => target && !target.isStage && target.drawableID === drawableID) || null;
    }

    function createOccluders260705_LY3K7R(vm, target, canvas) {
        const renderer = vm.runtime.renderer;
        const drawList = getDrawList260705_LY6V2B(renderer);
        const targetIndex = drawList.indexOf(target.drawableID);
        if (targetIndex < 0) return [];

        const occluders = [];
        drawList.slice(targetIndex + 1).forEach((drawableID, index) => {
            const other = targetByDrawable260705_LY2T9H(vm, drawableID);
            if (!other || other === target) return;

            const drawable = renderer._allDrawables[drawableID];
            if (!drawable || drawable._visible === false || typeof drawable.getAABB !== "function") return;

            const rect = screenRect260705_LY4C8N(drawable.getAABB(), canvas, vm);
            const snap = makeSnapshot260705_LY9P3K(vm, other, drawable, canvas, rect, 9999 + index);
            if (snap) occluders.push(snap);
        });

        return occluders;
    }

    function setVisible260705_LY8Q1D(nodes, value) {
        nodes.forEach(node => {
            if (node) node.style.visibility = value ? "visible" : "hidden";
        });
    }

    function remove260705_LY4R5C(nodes) {
        nodes.forEach(node => {
            if (node?.parentNode) node.remove();
        });
    }

    api.registerModule260705_NS8Q2M("snapshotLayer", {
        screenRect: screenRect260705_LY4C8N,
        makeSnapshot: makeSnapshot260705_LY9P3K,
        createOccluders: createOccluders260705_LY3K7R,
        setVisible: setVisible260705_LY8Q1D,
        remove: remove260705_LY4R5C
    });
})();
