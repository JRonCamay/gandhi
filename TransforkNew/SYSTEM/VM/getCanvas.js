window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function getCanvas() {
        const vm = window.TransforkNew.SYSTEM.vm?.get?.();
        const rendererCanvas = vm?.runtime?.renderer?.canvas;
        if (rendererCanvas) return rendererCanvas;

        const canvases = Array.from(document.querySelectorAll("canvas"));
        return canvases.find(canvas => {
            const rect = canvas.getBoundingClientRect();
            return rect.width > 100 && rect.height > 100;
        }) || canvases[0] || null;
    }

    window.TransforkNew.SYSTEM.VM.getCanvas = getCanvas;
})();
