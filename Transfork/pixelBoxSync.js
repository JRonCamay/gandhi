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

    function sync() {
        requestAnimationFrame(sync);
        installPlaceOverride();
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

    installPlaceOverride();
    sync();

    api.registerModule260705_NS8Q2M("pixelBoxSync", {
        currentRect,
        sync,
        installPlaceOverride
    });
})();
