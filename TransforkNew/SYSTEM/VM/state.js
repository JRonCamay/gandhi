window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.state.js.module", file: "TransforkNew/SYSTEM/VM/state.js", functionName: "module", purpose: "local process member registration for module", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    const state = window.TransforkNew.SYSTEM.VM.state || {
        vm: null,
        ready: false,
        waiting: false,
        timer: null,
        callbacks: []
    };

    window.TransforkNew.SYSTEM.VM.state = state;
})();
