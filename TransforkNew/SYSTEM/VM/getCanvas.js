window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function getCanvas() {
        const list = document.querySelectorAll("canvas");
        return list[0] || null;
    }

    window.TransforkNew.SYSTEM.VM.getCanvas = getCanvas;
})();
