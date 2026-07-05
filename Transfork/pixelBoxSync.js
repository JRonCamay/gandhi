window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    let busy = false;

    function activeVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function stageCanvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function transformBox() {
        return api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
    }

    function trim(full, bounds) {
        const pad = 1;
        const minX = Math.max(0, bounds.minX - pad);
        const minY = Math.max(0, bounds.minY - pad);
        const maxX = Math.min(bounds.width - 1, bounds.maxX + pad);
        const maxY = Math.min(bounds.height - 1, bounds.maxY + pad);
        return {
            left: full.left + (minX / bounds.width) * full.width,
            top: full.top + (minY / bounds.height) * full.height,
            width: ((maxX - minX + 1) / bounds.width) * full.width,
            height: ((maxY - minY + 1) / bounds.height) * full.height
        };
    }

    function screenRect(vm, target, drawable, canvas) {
        if (!api.pixelBounds?.scan || !api.pixelBounds?.extractScreen || !api.pixelBounds?.fullRect) return null;
        const full = api.pixelBounds.fullRect(vm, target, drawable, canvas);
        if (!full) return null;
        const bounds = api.pixelBounds.scan(api.pixelBounds.extractScreen(vm, target));
        return bounds ? trim(full, bounds) : null;
    }

    function installPixelBoundsOverride() {
        if (!api.pixelBounds || api.pixelBounds.__screenFirstOverride) return;
        if (typeof api.pixelBounds.rect !== "function") return;

        const oldRect = api.pixelBounds.rect;
        api.pixelBounds.rect = function (vm, target, drawable, canvas) {
            return screenRect(vm, target, drawable, canvas) || oldRect.call(this, vm, target, drawable, canvas);
        };
        api.pixelBounds.__screenFirstOverride = true;
    }

    function currentRect() {
        const vm = activeVM();
        const target = vm?.editingTarget;
        const canvas = stageCanvas();
        if (!vm || !target || target.isStage || !canvas) return null;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable || drawable._visible === false || typeof drawable.getAABB !== "function") return null;

        return api.pixelBounds?.rect?.(vm, target, drawable, canvas) || null;
    }

    function closeEnough(a, b) {
        if (!a || !b) return false;
        return Math.abs(a.left - b.left) < 3 &&
            Math.abs(a.top - b.top) < 3 &&
            Math.abs(a.width - b.width) < 3 &&
            Math.abs(a.height - b.height) < 3;
    }

    function installPlaceOverride() {
        if (!api.selectionBox || api.selectionBox.__pixelPlaceOverride) return;
        if (typeof api.selectionBox.place !== "function") return;

        const originalPlace = api.selectionBox.place;

        api.selectionBox.place = function (rect) {
            let next = rect;

            if (!busy && !window.__transforkTransformActive) {
                const pixel = currentRect();
                if (pixel && !closeEnough(pixel, rect)) next = pixel;
            }

            busy = true;
            try {
                return originalPlace.call(this, next);
            }
            finally {
                busy = false;
                api.overlayTop?.bringBoxToTop?.();
            }
        };

        api.selectionBox.__pixelPlaceOverride = true;
    }

    function installSnapshotLayerPatch() {
        if (!api.snapshotLayer || api.snapshotLayer.__pixelOccluderPatch) return;
        if (typeof api.snapshotLayer.createOccluders !== "function") return;

        const oldCreate = api.snapshotLayer.createOccluders;

        api.snapshotLayer.pixelRect = function (vm, target, drawable, canvas) {
            if (target && drawable && canvas && api.pixelBounds?.rect) {
                return api.pixelBounds.rect(vm, target, drawable, canvas);
            }
            if (drawable?.getAABB && api.snapshotLayer.screenRect) {
                return api.snapshotLayer.screenRect(drawable.getAABB(), canvas, vm);
            }
            return null;
        };

        api.snapshotLayer.createOccluders = function (vm, target, canvas) {
            const renderer = vm?.runtime?.renderer;
            if (!renderer || !target || !canvas || typeof api.snapshotLayer.makeSnapshot !== "function") {
                return oldCreate.call(this, vm, target, canvas);
            }

            const drawList = Array.isArray(renderer._drawList) ? renderer._drawList : [];
            const index = drawList.indexOf(target.drawableID);
            if (index < 0) return oldCreate.call(this, vm, target, canvas);

            const occluders = [];
            drawList.slice(index + 1).forEach((drawableID, layerIndex) => {
                const other = vm.runtime.targets.find(item => item && !item.isStage && item.drawableID === drawableID);
                const drawable = renderer._allDrawables[drawableID];
                if (!other || !drawable || drawable._visible === false || typeof drawable.getAABB !== "function") return;

                const rect = api.snapshotLayer.pixelRect(vm, other, drawable, canvas);
                const snap = rect && api.snapshotLayer.makeSnapshot(vm, other, drawable, canvas, rect, 9999 + layerIndex);
                if (snap) occluders.push(snap);
            });

            return occluders;
        };

        api.snapshotLayer.__pixelOccluderPatch = true;
    }

    function sync() {
        requestAnimationFrame(sync);
        installPixelBoundsOverride();
        installPlaceOverride();
        installSnapshotLayerPatch();
        if (busy || window.__transforkTransformActive) return;

        const box = transformBox();
        if (!box || box.style.display === "none") return;

        const rect = currentRect();
        if (!rect) return;

        busy = true;
        try {
            api.selectionBox?.place?.(rect);
            api.overlayTop?.bringBoxToTop?.();
        }
        finally {
            busy = false;
        }
    }

    installPixelBoundsOverride();
    installPlaceOverride();
    installSnapshotLayerPatch();
    sync();

    api.registerModule260705_NS8Q2M("pixelBoxSync", {
        currentRect,
        sync,
        installPixelBoundsOverride,
        installPlaceOverride,
        installSnapshotLayerPatch
    });
})();
