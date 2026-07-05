window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const coordsModule260705_CD5M9A = {
        getStageCanvas() {
            const canvases = document.querySelectorAll("canvas");
            return canvases[0] || null;
        },

        scratchToScreen(x, y, canvas, vm) {
            const nativeSize = vm.runtime.renderer.getNativeSize();
            const rect = canvas.getBoundingClientRect();

            return {
                x: rect.left + ((x + nativeSize[0] / 2) / nativeSize[0]) * rect.width,
                y: rect.top + ((nativeSize[1] / 2 - y) / nativeSize[1]) * rect.height
            };
        },

        screenDeltaToScratch(dx, dy, canvas, vm) {
            const rect = canvas.getBoundingClientRect();
            const nativeSize = vm.runtime.renderer.getNativeSize();

            return {
                x: dx / rect.width * nativeSize[0],
                y: -dy / rect.height * nativeSize[1]
            };
        },

        boundsToScreenRect(bounds, canvas, vm) {
            const topLeft = this.scratchToScreen(bounds.left, bounds.top, canvas, vm);
            const bottomRight = this.scratchToScreen(bounds.right, bounds.bottom, canvas, vm);

            return {
                left: topLeft.x,
                top: topLeft.y,
                width: bottomRight.x - topLeft.x,
                height: bottomRight.y - topLeft.y
            };
        }
    };

    api.registerModule260705_NS8Q2M("coords", coordsModule260705_CD5M9A);
})();
