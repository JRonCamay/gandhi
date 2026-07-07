window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function getCanvas() {
        const vm = window.TransforkNew.SYSTEM.VM?.get?.() || window.TransforkNew.SYSTEM.VM?.waitForVM?.() || null;
        return vm?.runtime?.renderer?.canvas || document.querySelector("canvas") || null;
    }

    window.TransforkNew.SYSTEM.VM.getCanvas = getCanvas;
})();
