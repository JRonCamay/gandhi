window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.get.js.get", file: "TransforkNew/SYSTEM/VM/get.js", functionName: "get", purpose: "local process member registration for get", manager: "VM", station: 0 },
            { id: "VM.local.TransforkNew.SYSTEM.VM.get.js.isReady", file: "TransforkNew/SYSTEM/VM/get.js", functionName: "isReady", purpose: "local process member registration for isReady", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    function get() {
        const state = window.TransforkNew.SYSTEM.VM.state;
        return state?.vm || null;
    }

    function isReady() {
        const state = window.TransforkNew.SYSTEM.VM.state;
        return !!(state?.ready && state.vm);
    }

    window.TransforkNew.SYSTEM.VM.get = get;
    window.TransforkNew.SYSTEM.VM.isReady = isReady;
})();
