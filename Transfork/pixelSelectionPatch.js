window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function getVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function getCanvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function getPixelRect() {
        const vm = getVM();
        const target = vm?.editingTarget;
        const canvas = getCanvas();
        if (!vm || !target || target.isStage || !canvas) return null;

        const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
        if (!drawable || typeof drawable.getAABB !== "function") return null;

        return api.pixelBounds?.rect?.(vm, target, drawable, canvas) || null;
    }

    function sameish(a, b) {
        if (!a || !b) return false;
        return Math.abs(a.left - b.left) < 3 &&
            Math.abs(a.top - b.top) < 3 &&
            Math.abs(a.width - b.width) < 3 &&
            Math.abs(a.height - b.height) < 3;
    }

    function patch() {
        if (!api.selectionBox || api.selectionBox.__pixelPatched) return;
        if (typeof api.selectionBox.place !== "function") return;

        const originalPlace = api.selectionBox.place;

        api.selectionBox.place = function (rect) {
            const pixel = getPixelRect();
            const next = pixel && !sameish(pixel, rect) ? pixel : rect;
            const result = originalPlace.call(this, next);
            api.overlayTop?.bringBoxToTop?.();
            return result;
        };

        api.selectionBox.__pixelPatched = true;
    }

    patch();

    api.registerModule260705_NS8Q2M("pixelSelectionPatch", {
        patch,
        getPixelRect
    });
})();
