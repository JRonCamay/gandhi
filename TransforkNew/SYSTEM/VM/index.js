window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.index.js.module", file: "TransforkNew/SYSTEM/VM/index.js", functionName: "module", purpose: "local process member registration for module", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    window.TransforkNew.SYSTEM.VM.waitForVM?.();
})();
