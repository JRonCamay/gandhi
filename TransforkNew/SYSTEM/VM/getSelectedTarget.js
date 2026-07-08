window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.getSelectedTarget.js.getSelectedTarget", file: "TransforkNew/SYSTEM/VM/getSelectedTarget.js", functionName: "getSelectedTarget", purpose: "local process member registration for getSelectedTarget", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    function getSelectedTarget() {
        const vm = window.TransforkNew.SYSTEM.VM?.get?.() || window.TransforkNew.SYSTEM.VM?.waitForVM?.() || null;
        return vm?.editingTarget || null;
    }

    window.TransforkNew.SYSTEM.VM.getSelectedTarget = getSelectedTarget;
})();
