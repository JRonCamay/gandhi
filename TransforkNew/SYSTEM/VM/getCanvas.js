window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.getCanvas.js.getCanvas", file: "TransforkNew/SYSTEM/VM/getCanvas.js", functionName: "getCanvas", purpose: "local process member registration for getCanvas", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    function getCanvas() {
        const vm = window.TransforkNew.SYSTEM.VM?.get?.() || window.TransforkNew.SYSTEM.VM?.waitForVM?.() || null;
        return vm?.runtime?.renderer?.canvas || document.querySelector("canvas") || null;
    }

    window.TransforkNew.SYSTEM.VM.getCanvas = getCanvas;
})();
