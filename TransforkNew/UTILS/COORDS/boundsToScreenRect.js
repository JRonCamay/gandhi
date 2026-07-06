window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UTILS = window.TransforkNew.UTILS || {};
window.TransforkNew.UTILS.COORDS = window.TransforkNew.UTILS.COORDS || {};

(function () {
    "use strict";

    function boundsToScreenRect(bounds, canvas, vm) {
        if (!bounds || !canvas || !vm?.runtime?.renderer) return null;

        const native = vm.runtime.renderer.getNativeSize();
        const canvasRect = canvas.getBoundingClientRect();

        const left = canvasRect.left + ((bounds.left + native[0] / 2) / native[0]) * canvasRect.width;
        const top = canvasRect.top + ((native[1] / 2 - bounds.top) / native[1]) * canvasRect.height;
        const right = canvasRect.left + ((bounds.right + native[0] / 2) / native[0]) * canvasRect.width;
        const bottom = canvasRect.top + ((native[1] / 2 - bounds.bottom) / native[1]) * canvasRect.height;

        return {
            left,
            top,
            width: right - left,
            height: bottom - top
        };
    }

    window.TransforkNew.UTILS.COORDS.boundsToScreenRect = boundsToScreenRect;
})();
